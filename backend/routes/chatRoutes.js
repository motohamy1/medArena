const express = require('express');
const router = express.Router();

const { getSpecialtyScope, getTopicAiScope } = require('../services/supabaseService');
const { callAI, extractEnglishKeywords, analyzeIntent } = require('../services/aiService');
const { fetchMedicalKnowledge, fetchClinicalLiterature } = require('../services/medicalSearchService');
const { searchCustomKnowledge } = require('../services/knowledgeService');
const { logKnowledgeUpdateFromChat, logKnowledgeGap } = require('../services/knowledgeUpdateService');

router.post('/', async (req, res) => {
    const { message, mode = 'general', category = 'physicians', topicId, categoryContext, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    // FAST-PATH INTENT CLASSIFICATION: Use AI to detect if it's just small talk (only if no conversation history)
    const isFirstTurn = !Array.isArray(history) || history.length === 0;
    if (isFirstTurn) {
        const intent = await analyzeIntent(message);
        
        if (intent === 'CONVERSATIONAL') {
            console.log(`[Chat] Intercepted conversational intent: "${message}"`);
            const conversationalPrompt = `You are the Med Arena Clinical Consultant, a professional medical AI assistant for physicians and medical students.
The user just said: "${message}".
Reply warmly, professionally, and concisely in 1-2 short sentences.
Also suggest 3 high-yield clinical sample questions they might explore next.

Format:
##GREETING##
Hello Doctor! How can I assist you with clinical guidelines, treatment protocols, or diagnostic workups today?
##END##

##SUGGESTIONS##
• Pediatric H. pylori ESPGHAN/NASPGHAN protocol
• Acute Coronary Syndrome initial workup
• Sepsis 1-hour resuscitation bundle
##END##`;
            
            try {
                const rawReply = await callAI(conversationalPrompt);
                let replyText = rawReply;
                let suggestions = [];
                const sugMatch = rawReply.match(/##SUGGESTIONS##([\s\S]*?)(?:##END##|$)/i);
                if (sugMatch && sugMatch[1]) {
                    suggestions = sugMatch[1]
                        .split('\n')
                        .map(line => line.replace(/^[\s•\-*0-9.)]+/, '').replace(/##/g, '').trim())
                        .filter(line => line.length > 4 && !line.toUpperCase().includes('END'));
                    replyText = rawReply.replace(/##SUGGESTIONS##[\s\S]*?(?:##END##|$)/gi, '').trim();
                }

                return res.json({ 
                    reply: replyText.includes('##GREETING##') ? replyText : `##GREETING##\n${replyText}\n##END##`, 
                    citations: [],
                    suggestions: suggestions.length > 0 ? suggestions : [
                        "Pediatric H. pylori ESPGHAN/NASPGHAN protocol",
                        "Acute Coronary Syndrome initial workup",
                        "Sepsis 1-hour resuscitation bundle"
                    ]
                });
            } catch (err) {
                console.error('[Chat Intent]', err);
            }
        }
    }

    try {
        // Extract context-aware medical search keywords from user query + recent history
        let searchKeywords = await extractEnglishKeywords(message, history);
        console.log(`[Literature Search] Extracted keywords: "${searchKeywords}" from message: "${message}"`);

        // Parallelize knowledge base retrieval with a 2.5s maximum timeout
        const withTimeout = (promise, ms = 2500, fallback = null) =>
            Promise.race([promise, new Promise(resolve => setTimeout(() => resolve(fallback), ms))]);

        const [rawKnowledgeRes, literatureRefsRes, customDocsRes] = await Promise.allSettled([
            withTimeout(fetchMedicalKnowledge(searchKeywords || message), 2500, ''),
            withTimeout(fetchClinicalLiterature(searchKeywords || message, category), 2500, []),
            withTimeout(searchCustomKnowledge(searchKeywords || message), 2500, [])
        ]);

        const rawKnowledge = (rawKnowledgeRes.status === 'fulfilled' && rawKnowledgeRes.value) ? rawKnowledgeRes.value : '';
        const literatureRefs = (literatureRefsRes.status === 'fulfilled' && Array.isArray(literatureRefsRes.value)) ? literatureRefsRes.value : [];
        const customKnowledgeDocs = (customDocsRes.status === 'fulfilled' && Array.isArray(customDocsRes.value)) ? customDocsRes.value : [];

        // Spec V2.1 §V2.1.2: never convert a source failure into silent
        // evidence absence — surface it at least in logs.
        [rawKnowledgeRes, literatureRefsRes, customDocsRes].forEach((settled, i) => {
            if (settled.status === 'rejected') console.warn(`[Chat] source ${i} failed:`, settled.reason && settled.reason.message);
        });
        
        let citations = [];
        let literatureContext = '';
        let customContext = '';
        let refIndex = 1;
        
        // 1. Authoritative Guidelines & Textbooks from Ingested Database
        if (customKnowledgeDocs.length > 0) {
            customContext += `\n### 📚 VERIFIED MEDICAL GUIDELINES & CLINICAL TEXTBOOKS (DATABASE):\n`;
            customKnowledgeDocs.forEach((doc) => {
                const currentRefId = refIndex++;
                const societyTag = doc.guideline_society ? ` [${doc.guideline_society}]` : '';
                const yearTag = doc.publication_year ? ` (${doc.publication_year})` : '';
                
                citations.push({
                    id: currentRefId.toString(),
                    title: `${doc.title}${societyTag}`,
                    author: doc.guideline_society || 'Clinical Practice Guidelines',
                    journal: doc.version_tag || 'Authoritative Clinical Consensus',
                    year: doc.publication_year ? doc.publication_year.toString() : '2024',
                    url: doc.source_url || (doc.pmid ? `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(doc.pmid)}` : 'https://goldcopd.org')
                });

                customContext += `--- GUIDELINE REFERENCE [${currentRefId}] ("${doc.title}"${societyTag}${yearTag}) ---\n`;
                if (doc.pmid) customContext += `PMID/DOI: ${doc.pmid}\n`;
                if (doc.source_url) customContext += `Official Portal: ${doc.source_url}\n`;
                customContext += `Clinical Excerpt:\n${doc.content}\n`;
                customContext += `---------------------------------------------------------\n\n`;
            });
        }

        // 2. Peer-Reviewed Medical Literature from Europe PMC
        if (literatureRefs.length > 0) {
            literatureContext += `\n### 🔬 PEER-REVIEWED MEDICAL LITERATURE (EUROPE PMC):\n`;
            literatureRefs.forEach((ref) => {
                const currentRefId = refIndex++;
                citations.push({
                    id: currentRefId.toString(),
                    title: ref.title,
                    author: ref.author,
                    journal: ref.journal,
                    year: ref.year,
                    url: ref.url
                });
                literatureContext += `--- LITERATURE REFERENCE [${currentRefId}] (${ref.type || 'Study'}) ---\n`;
                literatureContext += `Title: ${ref.title}\n`;
                literatureContext += `Journal: ${ref.journal} (${ref.year})\n`;
                literatureContext += `Abstract: ${ref.abstract ? ref.abstract.substring(0, 1000) : ''}...\n`;
                literatureContext += `---------------------------------------------------------\n\n`;
            });
        }

        // Combine all knowledge sources
        const medicalKnowledgeContext = (rawKnowledge || literatureContext || customContext)
            ? `\n### SPECIALIZED CLINICAL KNOWLEDGE BASE (EVIDENCE-BASED GROUNDING):\n` +
            `The following are verified excerpts retrieved directly from curated international guidelines, textbooks, and peer-reviewed literature:\n\n` +
            customContext + rawKnowledge + `\n\n` + literatureContext
            : '';

        // DYNAMIC PERSONA RESOLUTION
        let personaInstruction = '';
        const specialtyScope = await getSpecialtyScope(category); 
        
        if (specialtyScope) {
            personaInstruction = `You are Med Arena AI Clinical Consultant. ${specialtyScope}`;
        } else {
            personaInstruction = `You are Med Arena AI Clinical Consultant, a Senior Physician & Medical/Surgical Specialist. Focus on human medicine, internal medicine, surgery, pediatrics, cardiology, neurology, gastroenterology, gynecology, pathophysiology, differential diagnosis, laboratory/imaging workup, and evidence-based clinical management guidelines.`;
        }
        
        // Fetch topic-specific strict scope from Supabase topics table
        if (topicId && topicId !== 'general') {
            const topicScope = await getTopicAiScope(topicId);
            if (topicScope) {
                personaInstruction += `\nSPECIFIC TOPIC CONTEXT: ${topicScope}`;
            }
        } else if (categoryContext) {
            personaInstruction += `\nSPECIFIC CONTEXT: You are advising within ${categoryContext}.`;
        }

        // Determine grounding source indicator
        let sourceType = 'general_synthesis';
        if (customKnowledgeDocs.length > 0) {
            sourceType = 'pgvector_rag';
        } else if (literatureRefs.length > 0) {
            sourceType = 'europe_pmc';
        }

        let systemPrompt = `
${personaInstruction}

YOUR MISSION: Deliver authoritative, peer-level clinical guidance that directly addresses the clinician's or patient's exact question, maintaining clinical pharmacovigilance, demographic continuity, and dynamic formatting.

KNOWLEDGE BASE & GUIDELINES:
${medicalKnowledgeContext || 'NO VERIFIED SOURCES RETRIEVED. Evidence retrieval returned no usable sources for this query. You MUST state clearly that you could not retrieve verified evidence for this specific question and recommend consulting current official guidelines directly. Do NOT assert specific clinical facts (doses, thresholds, first-line drugs) from memory as if verified, and do NOT cite any sources.'}

### 1. DYNAMIC PRESENTATION & SECTION HEADERS:
- **MATCH RESPONSE STRUCTURE TO QUESTION COMPLEXITY**:
  * **Short / Direct / Factual queries** (e.g., "What's the pediatric dose of paracetamol?", "Is ciprofloxacin safe in pregnancy?", "What is the target blood pressure in CKD?"):
    Deliver a concise, direct, high-impact clinical response in 1-2 paragraphs or bullet points. DO NOT use artificial section headers like "CLINICAL ASSESSMENT" or "MANAGEMENT PROTOCOL".
  * **Complex / Multi-phase Clinical Workflows** (e.g., "Full management of severe DKA in adolescents", "Differential diagnosis and workup of acute chest pain"):
    Organize the response into 2-3 logical, content-specific sections using:
    ##SECTION: CONTEXT_SPECIFIC_HEADING##
    (Examples: ##SECTION: INITIAL STABILIZATION##, ##SECTION: WEIGHT-BASED INSULIN INFUSION##, ##SECTION: ELECTROLYTE MONITORING##).
  * **Follow-up / Clarification questions** (e.g., "What if potassium is 3.1?", "طب وبديله ايه للحامل؟"):
    Answer directly and conversationally referencing the prior patient context. Use NO section headers unless a full new protocol is requested.

### 2. ARABIC & EGYPTIAN DIALECT INTELLIGENCE:
- **Language Matching**: If the user asks in Arabic or colloquial Egyptian (العامية المصرية), respond in clear, professional medical Arabic that naturally aligns with their tone.
- **Terminology**: Use standard medical Arabic for explanations while writing drug names, brand/generic pairings, laboratory units, and scores in English or parenthesized English (e.g., "باراسيتامول (Paracetamol)", "أوجمنتين (Amoxicillin-Clavulanate)").
- **Cultural & Clinical Context**: Understand Egyptian clinical terms (e.g., "سخونية", "مغص كلوي", "نهجان", "ترجيع", "كرشة نفس") and guide with empathy and precision.

### 3. SESSION CONTINUITY & DEMOGRAPHIC CONSTRAINTS:
- **Preserve Context**: When the user asks a follow-up, interpret it strictly within the active clinical topic and patient demographic (e.g. pediatric age 2y, pregnant female, chronic kidney disease stage 4). Never reset to generic adult cases unless instructed.
- **Pediatric Safety**: Explicitly state age and weight cutoffs (e.g., Tetracycline contraindicated <8y, Aspirin contraindicated in viral febrile illness, Fluoroquinolones pediatric restrictions).

### 4. EVIDENCE GROUNDING & CITATIONS:
- Base all recommendations on verified clinical consensus.
- When knowledge is retrieved above, cite inline as [1], [2] matching the provided references.
- Never invent phantom studies or fake guidelines.

### 5. FORMATTING RULES:
- **No Markdown Tables**: Never use markdown tables (| or ---). Use structured bullet lists:
  - **Drug Name**: Dose (mg/kg) | Route | Frequency | Duration & Red Flags
- At the very end, provide 2-3 focused clinical follow-up prompts using:
  ##SUGGESTIONS##
  - [Follow-up prompt 1]
  - [Follow-up prompt 2]
`;

        const rawReply = await callAI(systemPrompt, message, history);

        let normalized = rawReply;
        
        // 1. EXTRACT KNOWLEDGE UPDATE (ACTIVE LEARNING)
        const updateMatch = normalized.match(/##KNOWLEDGE_UPDATE##([\s\S]*?)##END_UPDATE##/i);
        if (updateMatch && updateMatch[1]) {
            const updateBody = updateMatch[1].trim();
            const lines = updateBody.split('\n');
            const topicLine = lines.find(l => l.toLowerCase().includes('[topic name]')) || 'Unknown Topic';
            const refLine = lines.find(l => l.toLowerCase().includes('[reference]')) || 'No Ref';

            // Log it for review (Asynchronous)
            logKnowledgeUpdateFromChat(
                topicLine.split(':')[1]?.trim() || (searchKeywords || 'Generic'),
                updateBody,
                refLine.split(':')[1]?.trim() || 'PMC Search',
                message
            );

            // Strip from user-facing reply
            normalized = normalized.replace(/##KNOWLEDGE_UPDATE##[\s\S]*?##END_UPDATE##/gi, '').trim();
        }

        // 2. DETECT KNOWLEDGE GAP (If custom knowledge database was empty for this query)
        if (customKnowledgeDocs.length === 0) {
            logKnowledgeGap(searchKeywords || message, category);
        }

        // Only convert explicit markdown headings (###) to ##HEADING## if model used them
        normalized = normalized.replace(/^(?:###)\s*([^#\n]+?)\s*#*$/gm, (match, headingText) => {
            return `##${headingText.trim().toUpperCase()}##`;
        });

        // Extract ##SUGGESTIONS## section
        let suggestions = [];
        const suggestionsMatch = normalized.match(/##SUGGESTIONS##([\s\S]*?)(?:##END##|$)/i);
        if (suggestionsMatch && suggestionsMatch[1]) {
            const rawSuggestionsText = suggestionsMatch[1].trim();
            suggestions = rawSuggestionsText
                .split('\n')
                .map(line => line.replace(/^[\s•\-*0-9.)]+/, '').replace(/##/g, '').trim())
                .filter(line => line.length > 5 && !line.toUpperCase().includes('END') && !line.startsWith('##'));
            
            // Remove the suggestions block from normalized text
            normalized = normalized.replace(/##SUGGESTIONS##[\s\S]*?(?:##END##|$)/gi, '');
        }

        normalized = normalized.replace(/##END##/gi, '');

        let reply = normalized.trim();
        // If explicit ##SECTION## tags were generated by the model, structure them properly
        if (normalized.includes('##')) {
            const sections = normalized.split(/##(.*?)##/);
            let finalReply = '';
            for (let i = 1; i < sections.length; i += 2) {
                const h = sections[i].trim().toUpperCase();
                const content = sections[i + 1] || '';
                if (h && h !== 'END' && h !== 'SUGGESTIONS') {
                    finalReply += `##${h}##\n${content.trim()}\n##END##\n\n`;
                }
            }
            if (finalReply.trim().length > 0) {
                // Check if there was prefix text before the first section
                const prefix = sections[0]?.trim();
                reply = prefix ? `${prefix}\n\n${finalReply.trim()}` : finalReply.trim();
            }
        }

        console.log(`[AI Response Category: ${category}] Source: ${sourceType} | Citations: ${citations.length} | Suggestions: ${suggestions.length} | Start: "${reply.substring(0, 50).replace(/\n/g, ' ')}..."`);

        res.json({ reply, citations, suggestions, sourceType });
    } catch (err) {
        console.error('[/api/chat]', err.message);
        res.status(500).json({
            error: 'Failed to process clinical inquiry',
            details: err.message
        });
    }
});

module.exports = router;
