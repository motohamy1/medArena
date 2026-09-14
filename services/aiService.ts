import { SPECIALTY_KNOWLEDGE } from '../constants/SpecialtyData';
import type { TopicSearchResult } from '../constants/SpecialtyData';

// Keep the public backend available in locally generated Gradle release builds
// where process.env.EXPO_PUBLIC_* may not be injected from .env.
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  'https://medarena-33zm.onrender.com';

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

// ──────────────────────────────────────────────────────────────────────
// HYBRID RAG SYSTEM PROMPT
// PRIORITIZES retrieved context, supplements with medical knowledge.
// NEVER refuses a legitimate clinical question.
// ──────────────────────────────────────────────────────────────────────
const CLINICAL_SYSTEM_PROMPT = `You are Medical Arena AI, a board-certified clinical decision support assistant designed exclusively for physicians, surgeons, and healthcare practitioners.
Your core mission is to deliver accurate, actionable, evidence-based clinical guidance grounded in the most authoritative sources available.

### EVIDENCE GROUNDING STRATEGY (HYBRID RAG):
1. **PRIMARY SOURCE**: When RETRIEVED EVIDENCE CONTEXT is provided below, you MUST prioritize it as your primary source. Use inline bracketed citations [1], [2], [3] to reference the specific retrieved sources.
2. **SUPPLEMENTARY KNOWLEDGE**: If the retrieved context does not fully cover the question, you MUST still provide a complete, high-quality clinical answer by supplementing with your established medical knowledge from authoritative guidelines (e.g., ADA, AHA/ACC, ESC, WHO, NICE, IDSA, KDIGO, GINA, UpToDate). Clearly cite these guideline names and years.
3. **NEVER REFUSE**: You must ALWAYS provide a substantive clinical answer to any legitimate medical question. Never say "I cannot answer" or "the database does not contain this topic." You are a clinical decision support system — physicians depend on you.
4. **MANDATORY REFERENCES**: At the very end of your clinical response (BEFORE ##SUGGESTIONS##), include a ##REFERENCES## block:
##REFERENCES##
[1] Title | Author/Society | Journal | Year | URL_or_PMID
[2] Title | Author/Society | Journal | Year | URL_or_PMID
##END_REFERENCES##

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

### 4. FORMATTING RULES:
- **No Markdown Tables**: Never use markdown tables (| or ---). Use clean bullet points:
  - **Drug Name**: Dosage | Route | Frequency | Duration/Notes
- **No Internal Thinking**: DO NOT include thinking tags or reasoning chains. Output only the clinical response.
- At the very end, provide 2-3 focused clinical follow-up prompts using:
  ##SUGGESTIONS##
  - [Follow-up prompt 1]
  - [Follow-up prompt 2]`;

// ──────────────────────────────────────────────────────────────────────
// ROBUST RESPONSE PARSING: extracts reply, suggestions, and CITATIONS
// ──────────────────────────────────────────────────────────────────────
function cleanAIResponse(text: string, ragSources: RAGSource[]): { reply: string; suggestions: string[]; citations: Citation[]; knowledgeUpdate?: string } {
  // 1. Strip reasoning/think tags (DeepSeek, Qwen, Llama reasoning)
  let replyText = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/^Thinking Process:[\s\S]*?\n\n/i, '')
    .replace(/^Here's a thinking process:[\s\S]*?\n\n/i, '')
    .trim();

  let suggestions: string[] = [];
  let citations: Citation[] = [];
  let knowledgeUpdate: string | undefined = undefined;

  // 2. Extract ##KNOWLEDGE_UPDATE## section (Active Learning)
  const updateMatch = replyText.match(/##KNOWLEDGE_UPDATE##([\s\S]*?)##END_UPDATE##/i);
  if (updateMatch && updateMatch[1]) {
    knowledgeUpdate = updateMatch[1].trim();
    replyText = replyText.replace(/##KNOWLEDGE_UPDATE##[\s\S]*?##END_UPDATE##/gi, '').trim();
  }

  // 3. Extract ##REFERENCES## section and build Citation objects
  const refMatch = replyText.match(/##REFERENCES##([\s\S]*?)##END_REFERENCES##/i);
  if (refMatch && refMatch[1]) {
    const refLines = refMatch[1].trim().split('\n').filter((l: string) => l.trim().length > 3);
    citations = refLines.map((line: string, idx: number) => {
      // Parse format: [1] Title | Author | Journal | Year | URL
      const cleaned = line.replace(/^\s*\[?\d+\]?\s*/, '').trim();
      const parts = cleaned.split('|').map((p: string) => p.trim());
      return {
        id: (idx + 1).toString(),
        title: parts[0] || 'Clinical Guideline',
        author: parts[1] || 'Guideline Committee',
        journal: parts[2] || 'Evidence-Based Practice',
        year: parts[3] || new Date().getFullYear().toString(),
        url: parts[4] || 'https://pubmed.ncbi.nlm.nih.gov/',
      };
    }).filter((c: Citation) => c.title.length > 3);

    replyText = replyText.replace(/##REFERENCES##[\s\S]*?##END_REFERENCES##/gi, '').trim();
  }

  // 4. If AI didn't output ##REFERENCES## block, build citations from RAG sources
  if (citations.length === 0 && ragSources.length > 0) {
    citations = ragSources.slice(0, 5).map((src, idx) => ({
      id: (idx + 1).toString(),
      title: src.title,
      author: src.author || src.guidelineSociety || 'Guideline Committee',
      journal: src.journal || 'Clinical Practice Guidelines',
      year: src.year || new Date().getFullYear().toString(),
      url: src.url || src.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${src.pmid}/` : 'https://pubmed.ncbi.nlm.nih.gov/',
    }));
  }

  // 5. Extract ##SUGGESTIONS## section
  const sugMatch = replyText.match(/##SUGGESTIONS##([\s\S]*?)(?:##END##|$)/i);
  if (sugMatch && sugMatch[1]) {
    suggestions = sugMatch[1]
      .split('\n')
      .map((line) => line.replace(/^[\s•\-*0-9.)]+/, '').replace(/##/g, '').trim())
      .filter((line) => line.length > 3 && !line.toUpperCase().includes('END') && !line.toUpperCase().includes('SECTION:'));

    replyText = replyText.split(/##SUGGESTIONS##/i)[0].trim();
  }

  // 6. Final cleanup of any trailing artifacts
  replyText = replyText.replace(/##END##/gi, '').trim();

  return { reply: replyText, suggestions, citations, knowledgeUpdate };
}

// ──────────────────────────────────────────────────────────────────────
// RAG SOURCE TYPE — tracks provenance for citation generation
// ──────────────────────────────────────────────────────────────────────
type RAGSource = {
  title: string;
  author?: string;
  guidelineSociety?: string;
  journal?: string;
  year?: string;
  url?: string;
  pmid?: string;
  content: string;
};

// ──────────────────────────────────────────────────────────────────────
// MULTI-LAYER RAG CONTEXT RETRIEVAL FOR CHAT
// Retrieves from: (1) Local SpecialtyData, (2) Supabase DB, (3) Europe PMC
// ──────────────────────────────────────────────────────────────────────

/**
 * Fuzzy keyword search against the entire local SpecialtyData knowledge base.
 * Matches on topic title, subtitle, aiScopeDescription, and clinicalContent.
 * Returns the top-scoring matches with full clinical content.
 */
function findLocalContextFuzzy(query: string): { context: string; sources: RAGSource[] } {
  const q = query.trim().toLowerCase();
  if (q.length < 4) return { context: '', sources: [] };

  const commonConversational = /^(hi|hello|hey|good\s*(morning|evening|afternoon)|thanks|thank\s*you|who\s*are\s*you|help|test)$/i;
  if (commonConversational.test(q)) return { context: '', sources: [] };

  // ── Medical synonym expansion map ──
  // When a user asks about "diabetes", expand to also search for related
  // clinical terms that appear in topic titles/content.
  const MEDICAL_SYNONYMS: Record<string, string[]> = {
    'diabetes': ['diabetic', 'dka', 'hhs', 'insulin', 'metformin', 'sglt2', 'glp-1', 'hba1c', 'hyperglycemia', 'endocrin', 'ketoacidosis', 'semaglutide', 'tirzepatide'],
    'diabetic': ['diabetes', 'dka', 'hhs', 'insulin', 'sglt2', 'glp-1', 'retinopathy', 'nephropathy', 'neuropathy', 'ketoacidosis'],
    'hypertension': ['blood pressure', 'antihypertensive', 'amlodipine', 'losartan', 'lisinopril', 'htn'],
    'heart': ['cardiac', 'coronary', 'cardiology', 'cardiogenic', 'myocardial', 'arrhythmia', 'atrial', 'ventricular'],
    'stroke': ['cerebrovascular', 'ischemic', 'hemorrhagic', 'thrombolysis', 'alteplase', 'nihss', 'thrombectomy'],
    'asthma': ['bronchospasm', 'bronchodilator', 'inhaler', 'salbutamol', 'gina', 'exacerbation'],
    'copd': ['chronic obstructive', 'emphysema', 'bronchitis', 'gold', 'spirometry'],
    'pneumonia': ['cap', 'respiratory', 'consolidation', 'antibiotic', 'curb-65'],
    'sepsis': ['septic', 'bacteremia', 'endotoxin', 'vasopressor', 'norepinephrine', 'lactate'],
    'kidney': ['renal', 'nephrology', 'ckd', 'aki', 'dialysis', 'creatinine', 'egfr', 'kdigo'],
    'liver': ['hepatic', 'cirrhosis', 'hepatitis', 'jaundice', 'bilirubin', 'meld', 'hepatology'],
    'thyroid': ['hypothyroid', 'hyperthyroid', 'thyroiditis', 'levothyroxine', 'tsh', 'graves', 'thyroid storm'],
    'pregnancy': ['obstetric', 'preeclampsia', 'eclampsia', 'postpartum', 'gestational', 'prenatal', 'antepartum', 'labor'],
    'cancer': ['malignancy', 'carcinoma', 'oncology', 'tumor', 'neoplasm', 'chemotherapy', 'metastatic'],
    'infection': ['infectious', 'bacterial', 'viral', 'fungal', 'antimicrobial', 'antibiotic', 'sepsis'],
    'anemia': ['hemoglobin', 'hematology', 'iron', 'transfusion', 'sickle cell', 'thalassemia'],
    'pain': ['analgesic', 'opioid', 'nsaid', 'neuropathic', 'palliative'],
    'anxiety': ['anxiolytic', 'benzodiazepine', 'panic', 'gad', 'ssri'],
    'depression': ['antidepressant', 'ssri', 'snri', 'mood', 'mdd'],
    'skin': ['dermatology', 'dermatitis', 'eczema', 'psoriasis', 'rash', 'cutaneous'],
    'eye': ['ophthalmology', 'retinal', 'glaucoma', 'cataract', 'macular', 'vision'],
    'bone': ['orthopedic', 'fracture', 'osteoporosis', 'arthritis', 'joint'],
    'lung': ['pulmonary', 'respiratory', 'pleural', 'pneumothorax', 'ventilation'],
    'blood': ['hematology', 'coagulation', 'thrombosis', 'anticoagulant', 'warfarin', 'heparin', 'platelet'],
    'sugar': ['glucose', 'glycemic', 'insulin', 'diabetes', 'hypoglycemia', 'hyperglycemia'],
    // Arabic medical synonym expansions
    'سكر': ['diabetes', 'diabetic', 'insulin', 'glucose', 'dka', 'metformin', 'sglt2'],
    'ضغط': ['hypertension', 'blood pressure', 'antihypertensive'],
    'قلب': ['cardiac', 'heart', 'coronary', 'cardiology'],
    'كلى': ['renal', 'kidney', 'nephrology', 'dialysis'],
    'كبد': ['hepatic', 'liver', 'cirrhosis'],
    'حمل': ['pregnancy', 'obstetric', 'preeclampsia', 'gestational'],
  };

  // Extract meaningful keywords from query (skip stopwords)
  const STOPWORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'shall', 'would',
    'should', 'may', 'might', 'can', 'could', 'must', 'of', 'in', 'to',
    'for', 'with', 'on', 'at', 'by', 'from', 'as', 'into', 'about',
    'between', 'through', 'during', 'before', 'after', 'above', 'below',
    'up', 'down', 'out', 'off', 'over', 'under', 'again', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
    'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and',
    'but', 'or', 'if', 'what', 'which', 'who', 'this', 'that', 'these',
    'those', 'it', 'its', 'my', 'your', 'his', 'her', 'their', 'our',
    'me', 'him', 'them', 'us', 'i', 'we', 'you', 'he', 'she', 'they',
    'tell', 'give', 'show', 'explain', 'describe', 'please', 'know',
    'want', 'need', 'like', 'use', 'make', 'get', 'go', 'come', 'see',
    'take', 'find', 'think', 'say', 'try', 'ask', 'work', 'also', 'well',
    'way', 'many', 'new', 'one', 'two', 'three', 'first', 'last',
    'latest', 'help', 'guidelines', 'managing', 'management', 'protocol',
    'treatment', 'type',
    // Arabic stopwords
    'ايه', 'يعني', 'هل', 'من', 'في', 'على', 'عن', 'الى', 'مع', 'هو',
    'هي', 'هم', 'انا', 'انت', 'نحن', 'لو', 'عايز', 'ممكن', 'طب', 'كده',
  ]);

  let queryTokens = q
    .replace(/[?!.,;:()"'،؟]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t));

  // Expand query tokens with medical synonyms
  const expandedTokens = new Set(queryTokens);
  for (const token of queryTokens) {
    const synonyms = MEDICAL_SYNONYMS[token];
    if (synonyms) {
      for (const syn of synonyms) expandedTokens.add(syn);
    }
    // Also check partial matches in synonym keys (e.g. "diabete" matches "diabetes")
    for (const [key, syns] of Object.entries(MEDICAL_SYNONYMS)) {
      if (key.includes(token) || token.includes(key)) {
        for (const syn of syns) expandedTokens.add(syn);
        expandedTokens.add(key);
      }
    }
  }
  queryTokens = Array.from(expandedTokens);

  if (queryTokens.length === 0) return { context: '', sources: [] };

  type ScoredMatch = {
    topic: any;
    specName: string;
    score: number;
  };

  const scoredMatches: ScoredMatch[] = [];

  for (const spec of Object.values(SPECIALTY_KNOWLEDGE)) {
    for (const cat of spec.categories || []) {
      for (const topic of cat.topics || []) {
        let score = 0;
        const titleLower = topic.title.toLowerCase();
        const subtitleLower = (topic.subtitle || '').toLowerCase();
        const scopeLower = (topic.aiScopeDescription || '').toLowerCase();

        // Build searchable text from all clinical content
        const clinicalText = (topic.clinicalContent || [])
          .map((s: any) => `${s.title} ${s.content}`.toLowerCase())
          .join(' ');

        const fullSearchText = `${titleLower} ${subtitleLower} ${scopeLower} ${clinicalText}`;

        // Exact title containment (highest signal)
        if (q.includes(titleLower) || titleLower.includes(q)) {
          score += 50;
        }

        // Keyword scoring
        for (const token of queryTokens) {
          if (titleLower.includes(token)) score += 10;
          if (subtitleLower.includes(token)) score += 7;
          if (scopeLower.includes(token)) score += 5;
          if (clinicalText.includes(token)) score += 3;
        }

        // Bonus for multi-keyword matches (indicates topical relevance)
        const matchedTokenCount = queryTokens.filter(t => fullSearchText.includes(t)).length;
        if (matchedTokenCount >= 2) score += matchedTokenCount * 4;

        if (score >= 8) {
          scoredMatches.push({ topic, specName: spec.scientificName || spec.name, score });
        }
      }
    }
  }

  // Sort by score descending, take top 3
  scoredMatches.sort((a, b) => b.score - a.score);
  const topMatches = scoredMatches.slice(0, 3);

  if (topMatches.length === 0) return { context: '', sources: [] };

  let context = '';
  const sources: RAGSource[] = [];

  for (const match of topMatches) {
    const topic = match.topic;
    let topicText = `\n[VERIFIED CLINICAL PROTOCOL — ${match.specName}: ${topic.title}]\nScope: ${topic.aiScopeDescription || topic.subtitle}\n`;

    if (topic.clinicalContent) {
      for (const section of topic.clinicalContent) {
        topicText += `### ${section.title}:\n${section.content}\n\n`;

        // Extract citation from "Exact Reference & Guideline Citations" sections
        if (section.title.toLowerCase().includes('citation') || section.title.toLowerCase().includes('reference') || section.title.toLowerCase().includes('guideline')) {
          // Parse individual citations from content (e.g. "2023 ESC Guidelines for...")
          const citationLines = section.content.split(/[;.]/).filter((l: string) => l.trim().length > 10);
          for (const cLine of citationLines) {
            const yearMatch = cLine.match(/(\d{4})/);
            sources.push({
              title: cLine.trim().slice(0, 120),
              guidelineSociety: cLine.match(/(ACC|AHA|ESC|WHO|IDSA|KDIGO|GINA|NICE|GOLD|AAP|ESPGHAN|NASPGHAN|SURVIVING SEPSIS|ACOG|FIGO)/i)?.[1] || 'Guideline Committee',
              journal: 'Clinical Practice Guidelines',
              year: yearMatch ? yearMatch[1] : new Date().getFullYear().toString(),
              content: cLine.trim(),
              url: 'https://pubmed.ncbi.nlm.nih.gov/',
            });
          }
        }
      }
    }

    context += topicText;
  }

  return { context, sources };
}

/**
 * Fetch relevant context from Supabase database (specialty_topics table)
 * using text search on the query keywords.
 */
async function fetchSupabaseContext(query: string): Promise<{ context: string; sources: RAGSource[] }> {
  let context = '';
  const sources: RAGSource[] = [];

  try {
    const { supabase } = await import('../lib/supabase');

    // Use Supabase text search with the query
    const searchTerms = query
      .replace(/[?!.,;:()"'،؟]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 3)
      .slice(0, 5)
      .join(' | '); // OR-based full text search

    if (!searchTerms) return { context, sources };

    // Try text search on specialty_topics
    const { data } = await supabase
      .from('specialty_topics')
      .select('title, subtitle, clinical_content, specialty_id')
      .textSearch('title', searchTerms, { type: 'plain' })
      .limit(3);

    if (data && data.length > 0) {
      for (const t of data) {
        let topicContext = `\n[SUPABASE DB — ${t.title}]:\nSubtitle: ${t.subtitle}\n`;

        if (t.clinical_content && Array.isArray(t.clinical_content)) {
          for (const section of t.clinical_content) {
            topicContext += `### ${section.title}:\n${section.content}\n\n`;
          }

          // Extract citation sections
          const citSection = t.clinical_content.find((c: any) =>
            c.title?.toLowerCase().includes('citation') || c.title?.toLowerCase().includes('reference')
          );
          if (citSection) {
            sources.push({
              title: t.title,
              journal: 'Medical Arena Database',
              year: new Date().getFullYear().toString(),
              content: citSection.content,
              url: 'https://pubmed.ncbi.nlm.nih.gov/',
            });
          }
        }

        context += topicContext;
      }
    }

    // Also try the custom_knowledge table if it exists (pgvector knowledge base)
    // Fall back to basic text match since we can't generate embeddings client-side
    try {
      const { data: customData } = await supabase
        .from('custom_knowledge')
        .select('title, guideline_society, publication_year, source_url, pmid, content')
        .eq('is_active', true)
        .textSearch('content', searchTerms, { type: 'plain' })
        .order('publication_year', { ascending: false })
        .limit(3);

      if (customData && customData.length > 0) {
        for (const k of customData) {
          context += `\n[VERIFIED GUIDELINE (${k.publication_year}) — ${k.guideline_society || 'Medical Society'}]:\nTitle: ${k.title}\nContent: ${k.content}\n`;
          sources.push({
            title: k.title,
            guidelineSociety: k.guideline_society || undefined,
            journal: `${k.guideline_society || 'Clinical'} Guidelines`,
            year: String(k.publication_year || new Date().getFullYear()),
            url: k.source_url || undefined,
            pmid: k.pmid || undefined,
            content: k.content.slice(0, 200),
          });
        }
      }
    } catch {
      // custom_knowledge table may not exist yet — silently skip
    }
  } catch (e) {
    console.warn('[RAG] Supabase context retrieval skipped:', e);
  }

  return { context, sources };
}

/**
 * Fetch live evidence from Europe PMC (PubMed) practice guidelines
 * matching the user's clinical query.
 */
async function fetchEuropePMCContext(query: string): Promise<{ context: string; sources: RAGSource[] }> {
  let context = '';
  const sources: RAGSource[] = [];
  const currentYear = new Date().getFullYear();

  // Extract key clinical terms for focused search
  const searchQuery = query
    .replace(/[?!.,;:()"'،؟]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3)
    .slice(0, 6)
    .join(' ');

  if (!searchQuery || searchQuery.length < 5) return { context, sources };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const pmcQuery = `(${searchQuery}) AND (PUB_TYPE:"Practice Guideline" OR PUB_TYPE:"Consensus Development Conference" OR PUB_TYPE:"Review") AND (PUB_YEAR:[2022 TO ${currentYear}])`;
    const res = await fetch(
      `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(pmcQuery)}&format=json&resultType=core&pageSize=3&sort=P_PDATE_D%20desc`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const results = data.resultList?.result || [];
      for (const r of results) {
        if (r.title && r.abstractText) {
          const cleanAbstract = r.abstractText.replace(/<\/?[^>]+(>|$)/g, '').slice(0, 600);
          context += `\n[LIVE PUBMED GUIDELINE (${r.pubYear || currentYear}) — ${r.journalTitle || 'Medical Journal'}]:\nTitle: ${r.title}\nAuthors: ${r.authorString || 'N/A'}\nKey Findings: ${cleanAbstract}\nPMID: ${r.pmid || 'N/A'}\nDOI: ${r.doi || 'N/A'}\n`;
          sources.push({
            title: r.title.slice(0, 120),
            author: r.authorString?.split(',')[0]?.trim() || 'N/A',
            journal: r.journalTitle || 'Medical Journal',
            year: String(r.pubYear || currentYear),
            url: r.doi ? `https://doi.org/${r.doi}` : (r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : ''),
            pmid: r.pmid || undefined,
            content: cleanAbstract.slice(0, 200),
          });
        }
      }
    }
  } catch (e) {
    console.warn('[RAG] Europe PMC live search skipped:', e);
  }

  return { context, sources };
}

/**
 * Master RAG retrieval: combines all sources into a single context + source list.
 * Runs local, Supabase, and Europe PMC in parallel for speed.
 */
async function fetchChatRAGContext(query: string, specialtyId?: string): Promise<{ context: string; sources: RAGSource[] }> {
  // Run all three RAG sources in parallel
  const [localResult, supabaseResult, pmcResult] = await Promise.allSettled([
    Promise.resolve(findLocalContextFuzzy(query)),
    fetchSupabaseContext(query),
    fetchEuropePMCContext(query),
  ]);

  let fullContext = '';
  const allSources: RAGSource[] = [];

  // 1. Local bundled knowledge (fastest, always available)
  if (localResult.status === 'fulfilled' && localResult.value.context) {
    fullContext += `\n=== VERIFIED BUNDLED CLINICAL DATABASE ===\n${localResult.value.context}\n`;
    allSources.push(...localResult.value.sources);
  }

  // 2. Supabase database
  if (supabaseResult.status === 'fulfilled' && supabaseResult.value.context) {
    fullContext += `\n=== SUPABASE MEDICAL DATABASE ===\n${supabaseResult.value.context}\n`;
    allSources.push(...supabaseResult.value.sources);
  }

  // 3. Live PubMed/Europe PMC guidelines
  if (pmcResult.status === 'fulfilled' && pmcResult.value.context) {
    fullContext += `\n=== LIVE PUBMED / EUROPE PMC GUIDELINES ===\n${pmcResult.value.context}\n`;
    allSources.push(...pmcResult.value.sources);
  }

  return { context: fullContext, sources: allSources };
}

// ──────────────────────────────────────────────────────────────────────
// DIRECT LLM API CALLS (with RAG context injection)
// ──────────────────────────────────────────────────────────────────────

/**
 * Direct Groq API execution (Fast inference)
 */
async function callGroqDirect(prompt: string, context?: string, history: { role: 'user' | 'assistant'; content: string }[] = []): Promise<string | null> {
  if (!GROQ_KEY) return null;
  const models = ['qwen/qwen3.8-27b', 'allam-2-7b', 'groq/compound-mini'];

  const systemContent = context
    ? `${CLINICAL_SYSTEM_PROMPT}\n\n=== RETRIEVED EVIDENCE CONTEXT (USE ONLY THIS) ===\n${context}\n=== END OF RETRIEVED EVIDENCE ===`
    : CLINICAL_SYSTEM_PROMPT;

  const messages = [
    { role: 'system', content: systemContent },
    ...history.slice(-8),
    { role: 'user', content: prompt },
  ];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
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
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

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
 * Direct Gemini API execution using native REST fetch (no Node SDK / Hermes dependency issues)
 */
async function callGeminiDirect(prompt: string, context?: string, historyText?: string): Promise<string | null> {
  if (!GEMINI_KEY) return null;
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.5-flash'];

  const systemBlock = context
    ? `${CLINICAL_SYSTEM_PROMPT}\n\n=== RETRIEVED EVIDENCE CONTEXT (USE ONLY THIS) ===\n${context}\n=== END OF RETRIEVED EVIDENCE ===`
    : CLINICAL_SYSTEM_PROMPT;

  const fullPrompt = `${systemBlock}${historyText ? `\n\nCONVERSATION HISTORY:\n${historyText}` : ''}\n\nCLINICAL QUESTION:\n${prompt}`;

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { maxOutputTokens: 3500 },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      }
    } catch (err) {
      console.warn(`[Direct Gemini ${model}]`, err);
    }
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────────
// OFFLINE FALLBACK (unchanged — uses local knowledge only)
// ──────────────────────────────────────────────────────────────────────

/**
 * Offline Local Knowledge Synthesis
 */
function getOfflineFallbackReply(query: string): { reply: string; citations: Citation[]; suggestions: string[] } {
  const q = query.trim().toLowerCase();
  const commonConversational = /^(hi|hello|hey|good\s*(morning|evening|afternoon)|thanks|thank\s*you|who\s*are\s*you|help|test)$/i;

  if (commonConversational.test(q)) {
    return {
      reply: `Hello, Doctor. I am Medical Arena AI, your clinical decision support assistant. How can I assist you with clinical guidelines, drug dosages, or patient management protocols today?`,
      citations: [],
      suggestions: [
        'Pediatric paracetamol dosing',
        'Acute coronary syndrome initial protocol',
        'DKA management guidelines',
      ],
    };
  }

  // Use the fuzzy matcher for offline too
  const { context, sources } = findLocalContextFuzzy(query);

  if (context) {
    const citations: Citation[] = sources.slice(0, 5).map((src, idx) => ({
      id: (idx + 1).toString(),
      title: src.title,
      author: src.guidelineSociety || src.author || 'Clinical Guideline Committee',
      journal: src.journal || 'Evidence-Based Practice',
      year: src.year || '2024',
      url: src.url || 'https://pubmed.ncbi.nlm.nih.gov/',
    }));

    // Extract the topic title from the first match
    const titleMatch = context.match(/VERIFIED CLINICAL PROTOCOL[^:]*:\s*([^\]]+)\]/);
    const topicTitle = titleMatch ? titleMatch[1].trim() : query;

    return {
      reply: `##GREETING##\nHere is the verified guideline protocol for **${topicTitle}** from the bundled Clinical Knowledge Base:\n##END##\n\n${context}`,
      citations,
      suggestions: [
        `What are the first-line dosages for ${topicTitle}?`,
        `Contraindications and high-risk pitfalls in ${topicTitle}`,
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

// ──────────────────────────────────────────────────────────────────────
// PUBLIC SERVICE — sendMessageByText now uses full RAG pipeline
// ──────────────────────────────────────────────────────────────────────

export const aiService = {
  /**
   * Sends a message through the evidence-first pipeline (spec §49 Stage C):
   * 1. Remote Express evidence backend (only path for clinical answers)
   * 2. Bundled curated knowledge base — clearly labeled, no model calls
   * Direct client-side provider calls were removed from the chat path so the
   * backend evidence policy cannot be bypassed (spec §0.7, §1.2-11).
   */
  async sendMessageByText(
    message: string,
    mode: 'general' | 'fast_recap' = 'general',
    category: DoctorCategory | string = 'physicians',
    topicId?: string,
    categoryContext?: string,
    history: { text: string; isUser: boolean }[] = []
  ): Promise<{
    reply: string;
    citations?: Citation[];
    suggestions?: string[];
    sourceType?: string;
    evidence?: unknown;
    claims?: unknown[];
    sources?: unknown[];
    limitations?: string[];
  }> {
    const normalizedMessage = message.replace(/\bhylobacter\b/gi, 'helicobacter');
    const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|سلام|اهلا|أهلا)[!.,\s]*$/i.test(message.trim());

    if (isGreeting) {
      return {
        reply: 'Hello! How can I help you with a clinical question today?',
        citations: [],
        suggestions: [],
        sourceType: 'conversation',
      };
    }

    const offlineKnowledgeReply = (): { reply: string; citations: Citation[]; suggestions: string[]; sourceType: string } => {
      const { context, sources } = findLocalContextFuzzy(normalizedMessage);
      if (!context) {
        return {
          reply: 'The evidence service could not be reached right now, so I cannot verify this answer safely.',
          citations: [],
          suggestions: [],
          sourceType: 'system_failure',
        };
      }
      const citations: Citation[] = sources.slice(0, 5).map((src, idx) => ({
        id: (idx + 1).toString(),
        title: src.title,
        author: src.guidelineSociety || src.author || 'Clinical Guideline Committee',
        journal: src.journal || 'Evidence-Based Practice',
        year: src.year || '2024',
        url: src.url || 'https://pubmed.ncbi.nlm.nih.gov/',
      }));
      const titleMatch = context.match(/VERIFIED CLINICAL PROTOCOL[^:]*:\s*([^\]]+)\]/);
      const topicTitle = titleMatch ? titleMatch[1].trim() : normalizedMessage;
      return {
        reply: `##GREETING##\nThe evidence service is unreachable, so this comes from the bundled Clinical Knowledge Base for **${topicTitle}** (offline mode — not live-verified):\n##END##\n\n${context}`,
        citations,
        suggestions: [
          `What are the first-line dosages for ${topicTitle}?`,
          `Contraindications and high-risk pitfalls in ${topicTitle}`,
          `Stepwise escalation protocol for refractory cases`,
        ],
        sourceType: 'offline_knowledge',
      };
    };

    if (!USE_BACKEND || !BACKEND_URL) {
      return offlineKnowledgeReply();
    }

    try {
      const controller = new AbortController();
      // Backend performs multi-source evidence retrieval and may cold-start
      // (Render free tier); 10s aborted healthy requests mid-retrieval.
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      const response = await fetch(`${BACKEND_URL}/api/chat/v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: normalizedMessage, mode, category, topicId, categoryContext, history }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Clinical evidence request failed');
      const answer = data.answer?.text || data.reply || 'I could not produce a verified answer.';
      return {
        reply: answer,
        citations: (data.sources || []).map((source: any) => ({
          id: source.id,
          title: source.title,
          author: source.organization || '',
          journal: source.source_type || '',
          year: source.publication_date || '',
          url: source.url || (source.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/` : ''),
        })),
        suggestions: [],
        sourceType: data.evidence?.status || 'system_failure',
        evidence: data.evidence,
        claims: data.claims,
        sources: data.sources,
        limitations: data.limitations,
      } as any;
    } catch {
      return offlineKnowledgeReply();
    }
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

// ──────────────────────────────────────────────────────────────────────
// CLINICAL PEARLS (unchanged — keeps existing RAG pipeline for pearls)
// ──────────────────────────────────────────────────────────────────────

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
  const models = ['qwen/qwen3.8-27b', 'groq/compound-mini', 'allam-2-7b'];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
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
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

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
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.5-flash'];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          const parsed = parsePearlsJSON(text);
          if (parsed && parsed.length > 0) return parsed;
        }
      }
    } catch (err) {
      console.warn(`[Direct Gemini Pearls ${model}]`, err);
    }
  }
  return null;
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
