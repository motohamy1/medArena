import { SPECIALTY_KNOWLEDGE } from '../constants/SpecialtyData';
import type { TopicSearchResult } from '../constants/SpecialtyData';

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

// A dev-machine backend (localhost/LAN IP over cleartext http) is unreachable
// from a release build: mobile data can't route 192.168.x.x and Android blocks
// cleartext in release. Trying it anyway stalls every message for ~10s, so in
// production we only attempt the backend when it's a real public HTTPS URL.
const PRIVATE_HOST =
  /localhost|127\.0\.0\.1|10\.0\.2\.2|\b192\.168\.|\b172\.(1[6-9]|2\d|3[01])\.|\[::1\]/i;
const USE_BACKEND =
  __DEV__ || (!PRIVATE_HOST.test(BACKEND_URL) && BACKEND_URL.startsWith('https://'));

export type DoctorCategory = 'physicians';

export type Citation = {
  id: string;
  title: string;
  author: string;
  journal: string;
  year: string;
  url: string;
};

const CLINICAL_SYSTEM_PROMPT = `You are Medical Arena AI, a board-certified clinical decision support assistant designed exclusively for physicians, surgeons, and healthcare practitioners.
Your core mission is to synthesize verified clinical evidence into actionable, high-yield guidance while strictly maintaining cross-turn patient context, demographic continuity, and dynamic formatting.

### 1. DYNAMIC PRESENTATION & NATURAL STRUCTURE:
- **MATCH RESPONSE STRUCTURE TO QUESTION COMPLEXITY**:
  * **Short / Direct / Factual queries** (e.g., "What's the pediatric dose of paracetamol?", "Is ciprofloxacin safe in pregnancy?", "What is the target blood pressure in CKD?"):
    Deliver a concise, direct, high-impact clinical response in 1-2 paragraphs or bullet points. DO NOT force artificial section headers like "CLINICAL ASSESSMENT" or "MANAGEMENT PROTOCOL".
  * **Complex / Multi-phase Clinical Protocols** (e.g., "Full management of severe DKA in adolescents", "Differential diagnosis and workup of acute chest pain"):
    Organize the response into 2-3 logical, content-specific sections using:
    ##SECTION: CONTEXT_SPECIFIC_HEADING##
    (Examples: ##SECTION: INITIAL STABILIZATION##, ##SECTION: WEIGHT-BASED INSULIN INFUSION##, ##SECTION: ELECTROLYTE MONITORING##).
  * **Follow-up / Clarification questions** (e.g., "What if potassium is 3.1?", "طب وبديله ايه للحامل؟"):
    Answer directly and conversationally referencing the prior patient context without unnecessary section headers.

### 2. ARABIC & EGYPTIAN DIALECT INTELLIGENCE:
- **Language Matching**: If the user asks in Arabic or colloquial Egyptian (العامية المصرية), respond in clear, professional medical Arabic that naturally aligns with their tone.
- **Terminology**: Use standard medical Arabic for clinical rationale while keeping drug names, brand/generic pairings, laboratory units, and scores in English or parenthesized English (e.g., "باراسيتامول (Paracetamol)", "أوجمنتين (Amoxicillin-Clavulanate)").
- **Cultural & Clinical Nuance**: Deeply understand Egyptian colloquial medical complaints (e.g., "سخونية", "مغص كلوي", "نهجان", "ترجيع", "كرشة نفس", "كتافلام", "انتينال") and provide precise clinical guidance.

### 3. SESSION CONTINUITY & DEMOGRAPHIC PRESERVATION:
- **Preserve Established Context**: When the user asks a follow-up question, interpret it strictly within the active clinical topic and patient demographic established in previous messages (e.g. pediatric age 10-18y H. pylori eradication).
- Never reset to generic adult cases unless the user explicitly introduces a completely new patient.
- **Pediatric Safety**: Explicitly state age and weight cutoffs (e.g., Tetracycline contraindicated <8y, Aspirin contraindicated in viral febrile illness, Fluoroquinolones pediatric restrictions).

### 4. EVIDENCE GROUNDING & CITATIONS:
- Base all recommendations on established international clinical guidelines (e.g., WHO, AAP, ESPGHAN/NASPGHAN, NICE, IDSA, UpToDate).
- Deliver direct, high-confidence clinical answers without generic boilerplate or robotic disclaimers.
- Use bracketed citations [1], [2] referencing the source in the provided context where applicable.

### 5. FORMATTING RULES:
- **No Markdown Tables**: Never use markdown tables (| or ---). Use clean bullet points:
  - **Drug Name**: Dosage | Route | Frequency | Duration/Notes
- **No Internal Thinking**: DO NOT include thinking tags or reasoning chains. Output only the clinical response.
- At the very end, provide 2-3 focused clinical follow-up prompts using:
  ##SUGGESTIONS##
  - [Follow-up prompt 1]
  - [Follow-up prompt 2]`;

/**
 * Robust extraction for Suggestions and thinking/reasoning removal
 */
function cleanAIResponse(text: string): { reply: string; suggestions: string[]; knowledgeUpdate?: string } {
  // 1. Strip reasoning/think tags (DeepSeek, Qwen, Llama reasoning)
  let replyText = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/^Thinking Process:[\s\S]*?\n\n/i, '')
    .replace(/^Here's a thinking process:[\s\S]*?\n\n/i, '')
    .trim();

  let suggestions: string[] = [];
  let knowledgeUpdate: string | undefined = undefined;

  // 2. Extract ##KNOWLEDGE_UPDATE## section (Active Learning)
  const updateMatch = replyText.match(/##KNOWLEDGE_UPDATE##([\s\S]*?)##END_UPDATE##/i);
  if (updateMatch && updateMatch[1]) {
    knowledgeUpdate = updateMatch[1].trim();
    replyText = replyText.replace(/##KNOWLEDGE_UPDATE##[\s\S]*?##END_UPDATE##/gi, '').trim();
  }

  // 3. Extract ##SUGGESTIONS## section
  const sugMatch = replyText.match(/##SUGGESTIONS##([\s\S]*?)(?:##END##|$)/i);
  if (sugMatch && sugMatch[1]) {
    suggestions = sugMatch[1]
      .split('\n')
      .map((line) => line.replace(/^[\s•\-*0-9.)]+/, '').replace(/##/g, '').trim())
      .filter((line) => line.length > 3 && !line.toUpperCase().includes('END') && !line.toUpperCase().includes('SECTION:'));

    replyText = replyText.split(/##SUGGESTIONS##/i)[0].trim();
  }

  // 4. Final cleanup of any trailing artifacts
  replyText = replyText.replace(/##END##/gi, '').trim();

  return { reply: replyText, suggestions, knowledgeUpdate };
}

/**
 * Direct Groq API execution (Fast inference)
 */
async function callGroqDirect(prompt: string, context?: string, history: { role: 'user' | 'assistant'; content: string }[] = []): Promise<string | null> {
  if (!GROQ_KEY) return null;
  const models = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b'];

  const messages = [
    { role: 'system', content: CLINICAL_SYSTEM_PROMPT + (context ? `\n\nDATABASE CONTEXT TO USE:\n${context}` : '') },
    ...history.slice(-8),
    { role: 'user', content: prompt },
  ];

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: messages.slice(-10), // Keep system + last 9 interactions
          max_tokens: 3000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch {
      // Try next model
    }
  }
  return null;
}

/**
 * Direct Gemini API execution
 */
async function callGeminiDirect(prompt: string, context?: string, historyText?: string): Promise<string | null> {
  if (!GEMINI_KEY) return null;
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { maxOutputTokens: 3500 },
    });
    const fullPrompt = `${CLINICAL_SYSTEM_PROMPT}${context ? `\n\nDATABASE CONTEXT TO USE:\n${context}` : ''}${historyText ? `\n\nCONVERSATION HISTORY:\n${historyText}` : ''}\n\nCLINICAL QUESTION:\n${prompt}`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn('[Direct Gemini]', err);
    return null;
  }
}

function findLocalContext(query: string): string | null {
  const q = query.toLowerCase();
  let matchedTopic: any = null;

  for (const spec of Object.values(SPECIALTY_KNOWLEDGE)) {
    for (const cat of spec.categories || []) {
      for (const topic of cat.topics || []) {
        if (q.includes(topic.title.toLowerCase()) || topic.title.toLowerCase().includes(q)) {
          matchedTopic = topic;
          break;
        }
      }
      if (matchedTopic) break;
    }
    if (matchedTopic) break;
  }

  if (matchedTopic && matchedTopic.clinicalContent) {
    let sectionsText = '';
    matchedTopic.clinicalContent.forEach((s: any) => {
      sectionsText += `## ${s.title.toUpperCase()} ##\n${s.content}\n\n`;
    });
    return sectionsText;
  }
  return null;
}

/**
 * Offline Local Knowledge Synthesis
 */
function getOfflineFallbackReply(query: string): { reply: string; citations: Citation[]; suggestions: string[] } {
  const q = query.toLowerCase();
  let matchedTopic: any = null;

  for (const spec of Object.values(SPECIALTY_KNOWLEDGE)) {
    for (const cat of spec.categories || []) {
      for (const topic of cat.topics || []) {
        if (q.includes(topic.title.toLowerCase()) || topic.title.toLowerCase().includes(q)) {
          matchedTopic = topic;
          break;
        }
      }
      if (matchedTopic) break;
    }
    if (matchedTopic) break;
  }

  if (matchedTopic && matchedTopic.clinicalContent) {
    let sectionsText = '';
    const citations: Citation[] = [];

    matchedTopic.clinicalContent.forEach((s: any, idx: number) => {
      sectionsText += `##SECTION: ${s.title.toUpperCase()}##\n${s.content}\n\n`;
      if (s.title.toLowerCase().includes('citation') || s.title.toLowerCase().includes('guideline')) {
        citations.push({
          id: (idx + 1).toString(),
          title: s.content.substring(0, 80),
          author: 'Clinical Guideline Committee',
          journal: 'Evidence-Based Practice',
          year: '2024',
          url: 'https://pubmed.ncbi.nlm.nih.gov/',
        });
      }
    });

    return {
      reply: `##GREETING##\nHere is the verified guideline protocol for **${matchedTopic.title}** from the bundled Clinical Knowledge Base:\n##END##\n\n${sectionsText}`,
      citations,
      suggestions: [
        `What are the first-line dosages for ${matchedTopic.title}?`,
        `Contraindications and high-risk pitfalls in ${matchedTopic.title}`,
        `Stepwise escalation protocol for refractory cases`,
      ],
    };
  }

  return {
    reply: `##SECTION: CLINICAL ASSESSMENT##\nRegarding: **${query}**\n*Note: High-speed AI is currently unavailable. Using offline clinical baseline.*\n\nThis is an evidence-based clinical query. Please consult standard guideline protocols.\n\n##SECTION: MANAGEMENT PROTOCOL##\n• Initiate structured ABCDE evaluation and stabilize vitals.\n• Obtain targeted labs, imaging, and 12-lead ECG where appropriate.\n• Refer to subspecialty guideline algorithms.\n\n##SECTION: CLINICAL PEARLS & PITFALLS##\n• Never delay emergent resuscitation for diagnostic confirmations.\n• Re-evaluate hemodynamic and neurological status frequently.`,
    citations: [],
    suggestions: [
      'COPD GOLD 2024 management protocol',
      'Acute Coronary Syndrome initial workup',
      'Sepsis 1-hour resuscitation bundle',
    ],
  };
}

export const aiService = {
  /**
   * Sends a message with 3-tier fallback:
   * 1. Remote Express backend (if online and configured)
   * 2. Direct Gemini / Groq Cloud API (if backend unreachable)
   * 3. Offline Bundled Clinical Knowledge Base (if offline / no internet)
   */
  async sendMessageByText(
    message: string,
    mode: 'general' | 'fast_recap' = 'general',
    category: DoctorCategory | string = 'physicians',
    topicId?: string,
    categoryContext?: string,
    history: { text: string; isUser: boolean }[] = []
  ): Promise<{ reply: string; citations?: Citation[]; suggestions?: string[]; sourceType?: string }> {
    // Convert history for APIs
    const groqHistory = history.map(h => ({
      role: h.isUser ? 'user' : 'assistant' as 'user' | 'assistant',
      content: h.text
    }));

    const geminiHistoryText = history
      .slice(-6)
      .map(h => `${h.isUser ? 'Doctor' : 'AI'}: ${h.text}`)
      .join('\n');

    // 1. Try backend server with a 10s timeout (skipped in release if it is
    //    only a local/LAN dev URL — it can't be reached and just stalls).
    if (USE_BACKEND) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${BACKEND_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, mode, category, topicId, categoryContext, history }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          return {
            reply: data.reply || "I'm sorry, I received an empty response. Please try again.",
            citations: data.citations || [],
            suggestions: data.suggestions || [],
            sourceType: data.sourceType || 'general_synthesis',
          };
        }
      } catch {
        // Backend not available or timed out — fallback to direct cloud AI
      }
    }

    // Determine RAG context for direct calls
    const resolvedContext = categoryContext || findLocalContext(message) || undefined;

    // 2. Try Direct Groq API
    const groqReply = await callGroqDirect(message, resolvedContext, groqHistory);
    if (groqReply) {
      const cleaned = cleanAIResponse(groqReply);
      return {
        reply: cleaned.reply,
        citations: [],
        suggestions: cleaned.suggestions.length > 0 ? cleaned.suggestions : [
          'Stepwise dose adjustments',
          'Pediatric safety considerations',
          'Refractory case algorithm'
        ],
      };
    }

    // 3. Try Direct Gemini API
    const geminiReply = await callGeminiDirect(message, resolvedContext, geminiHistoryText);
    if (geminiReply) {
      const cleaned = cleanAIResponse(geminiReply);
      return {
        reply: cleaned.reply,
        citations: [],
        suggestions: cleaned.suggestions.length > 0 ? cleaned.suggestions : [
          'Stepwise dose adjustments',
          'Pediatric safety considerations',
          'Refractory case algorithm'
        ],
      };
    }

    // 4. Fallback to Offline Local Knowledge Base
    return getOfflineFallbackReply(message);
  },

  /**
   * Dynamically synthesizes high-yield, verified Clinical Pearls & Tips & Tricks
   * via Groq or Gemini, with seamless fallback to the bundled Knowledge Base Miner.
   */
  async generateClinicalPearls(
    specialtyId?: string,
    count: number = 3
  ): Promise<import('../constants/DailyPearlsData').ClinicalPearl[]> {
    return generateDynamicPearls(specialtyId, count);
  },
};

function parsePearlsJSON(raw: string): import('../constants/DailyPearlsData').ClinicalPearl[] | null {
  try {
    let clean = raw.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();
    }
    // Sometimes models output text before the JSON array
    const jsonStart = clean.indexOf('[');
    const jsonEnd = clean.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      clean = clean.slice(jsonStart, jsonEnd + 1);
    }

    const arr = JSON.parse(clean);
    if (!Array.isArray(arr)) return null;

    return arr
      .map((item: any, idx: number) => {
        const specId = String(item.specialtyId || item.specialty_id || 'general').toLowerCase().replace(/\s+/g, '_').trim();
        const rule = String(item.rule || item.takeaway || item.pearl || item.clinical_pearl || item.description || '');
        const action = String(item.action || item.stepwise_action || item.management || '');
        const pitfall = String(item.pitfall || item.trap || item.warning || '');
        const title = String(item.title || item.topic || 'Clinical Pearl');

        return {
          id: item.id || `pearl_dyn_${Date.now()}_${idx}`,
          title,
          category: String(item.category || item.domain || 'Clinical Protocol'),
          specialtyId: specId,
          specialtyName: String(item.specialtyName || item.specialty_name || (specId.charAt(0).toUpperCase() + specId.slice(1))),
          specialtyColor: String(item.specialtyColor || item.specialty_color || '#3B82F6'),
          specialtyIcon: String(item.specialtyIcon || item.specialty_icon || 'medkit'),
          badge: String(item.badge || item.key_numbers || item.key_metric || 'Key Threshold'),
          rule: rule || action,
          action: action || rule,
          pitfall,
          citation: String(item.citation || 'Clinical Practice Guidelines'),
        };
      })
      .filter((p) => p.title && (p.rule || p.action));
  } catch (e) {
    console.warn('[parsePearlsJSON] Failed to parse JSON:', e);
    return null;
  }
}

async function callGroqForPearls(prompt: string): Promise<import('../constants/DailyPearlsData').ClinicalPearl[] | null> {
  if (!GROQ_KEY) return null;
  const models = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b'];

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are a Senior Medical Professor. Output ONLY a valid raw JSON array of objects with keys: id, title, category, specialtyId, specialtyName, specialtyColor, specialtyIcon, badge, rule, action, pitfall, citation. Do not include markdown ticks or explanation.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 2800,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) {
          const parsed = parsePearlsJSON(text);
          if (parsed && parsed.length > 0) return parsed;
        }
      }
    } catch {}
  }
  return null;
}

async function callGeminiForPearls(prompt: string): Promise<import('../constants/DailyPearlsData').ClinicalPearl[] | null> {
  if (!GEMINI_KEY) return null;
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return parsePearlsJSON(text);
  } catch (err) {
    console.warn('[Direct Gemini Pearls]', err);
    return null;
  }
}

async function fetchUpToDateRAGContext(specialtyId?: string): Promise<string> {
  let context = '';
  const currentYear = new Date().getFullYear();
  const domain = specialtyId && specialtyId !== 'all' ? specialtyId : 'clinical practice guidelines';

  // 1. Live Europe PMC / PubMed Practice Guidelines (2023 - present)
  try {
    const query = `(${domain}) AND (PUB_TYPE:"Practice Guideline" OR PUB_TYPE:"Consensus Development Conference") AND (PUB_YEAR:[2023 TO ${currentYear}])`;
    const res = await fetch(
      `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&resultType=core&pageSize=3&sort=P_PDATE_D%20desc`
    );
    if (res.ok) {
      const data = await res.json();
      const results = data.resultList?.result || [];
      for (const r of results) {
        if (r.title && r.abstractText) {
          const clean = r.abstractText.replace(/<\/?[^>]+(>|$)/g, '').slice(0, 500);
          context += `\n[LATEST GUIDELINE (${r.pubYear || '2024'}) - ${r.journalTitle || 'Medical Journal'}]:\nTitle: ${r.title}\nKey Findings: ${clean}\nCitation: ${r.journalTitle || 'Guideline Consensus'} (${r.pubYear || '2024'})\n`;
        }
      }
    }
  } catch (e) {
    console.warn('[RAG] Europe PMC query skipped:', e);
  }

  // 2. Fetch verified clinical protocol excerpts from local knowledge/Supabase
  try {
    const { supabase } = await import('../lib/supabase');
    let q = supabase.from('specialty_topics').select('title, subtitle, clinical_content');
    if (specialtyId && specialtyId !== 'all') {
      q = q.eq('specialty_id', specialtyId);
    }
    const { data } = await q.limit(2);
    if (data && data.length > 0) {
      for (const t of data) {
        const pitfall = t.clinical_content?.find((c: any) => c.title?.toLowerCase().includes('pitfall'))?.content;
        const dosing = t.clinical_content?.find((c: any) => c.title?.toLowerCase().includes('dosing') || c.title?.toLowerCase().includes('pharmacotherapy'))?.content;
        context += `\n[VERIFIED DATABASE PROTOCOL: ${t.title}]:\nSubtitle: ${t.subtitle}\nDosing: ${dosing?.slice(0, 250) || 'N/A'}\nPitfall: ${pitfall?.slice(0, 250) || 'N/A'}\n`;
      }
    }
  } catch (e) {
    console.warn('[RAG] Supabase topic context skipped:', e);
  }

  return context;
}

export async function generateDynamicPearls(
  specialtyId?: string,
  count: number = 3
): Promise<import('../constants/DailyPearlsData').ClinicalPearl[]> {
  // Fetch up-to-date RAG evidence from PubMed / Europe PMC & database
  const ragContext = await fetchUpToDateRAGContext(specialtyId);

  const prompt = `You are a Senior Board Examination Author and Master Clinician.
Generate ${count} authentic, life-saving Clinical Pearls & Tips & Tricks for physicians.
${specialtyId && specialtyId !== 'all' ? `Generate pearls specifically for the medical specialty: "${specialtyId}".` : 'Select any high-yield clinical specialties or subspecialties dynamically (e.g. Critical Care, Cardiology, Toxicology, Nephrology, Neurology, Pulmonology, Pediatrics, Hematology, Rheumatology, OB/GYN, Surgery, etc.).'}

${ragContext ? `### LATEST RETRIEVED RAG EVIDENCE & RECENT GUIDELINES (2023-2026):\n${ragContext}\nStrictly ground your pearls, exact dosages, cutoffs, and citations in this retrieved evidence where applicable.\n` : ''}

Requirements for each pearl:
- Must be a true, actionable clinical pearl, drug interaction, physiological principle, or catastrophic pitfall to avoid.
- Choose a relevant specialtyId (short lowercase slug), specialtyName, a matching hex specialtyColor, and an Ionicons icon name (e.g. heart, pulse, flash, flame, medkit, warning, water, fitness, eye, bandage, shield).
- Provide an exact badge (key number, cutoff, or ratio).
- Provide exact rule, stepwise action (with drug doses/timing), and pitfall.
- Provide a genuine guideline citation with publication year (e.g. 2023-2026).

Return ONLY a valid JSON array of objects with NO markdown formatting:
[
  {
    "id": "pearl_${Date.now()}_1",
    "title": "Short title (max 5 words)",
    "category": "Sub-domain or clinical syndrome",
    "specialtyId": "slug_id",
    "specialtyName": "Full Specialty Name",
    "specialtyColor": "#HexColor",
    "specialtyIcon": "ionicons_name",
    "badge": "Key metric or cutoff",
    "rule": "Exact pathophysiological mechanism or core clinical rule (1-2 sentences).",
    "action": "Immediate exact stepwise action the clinician must take (dosages, route, timing).",
    "pitfall": "Critical malpractice trap or common lethal mistake to avoid.",
    "citation": "Official guideline citation (e.g., AHA/ACC 2024, KDIGO 2023, GINA 2024, IDSA 2024, Surviving Sepsis)"
  }
]`;

  // 1. Try Groq (Fastest)
  const groqPearls = await callGroqForPearls(prompt);
  if (groqPearls && groqPearls.length > 0) return groqPearls;

  // 2. Try Gemini
  const geminiPearls = await callGeminiForPearls(prompt);
  if (geminiPearls && geminiPearls.length > 0) return geminiPearls;

  // 3. Fallback to bundled Knowledge Base Miner
  const { pearlMinerService } = await import('./pearlMinerService');
  return pearlMinerService.getMinedPearls(specialtyId, count);
}

