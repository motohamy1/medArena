import { SPECIALTY_KNOWLEDGE } from '../constants/SpecialtyData';
import type { TopicSearchResult } from '../constants/SpecialtyData';

// Keep the public backend available in locally generated Gradle release builds
// where process.env.EXPO_PUBLIC_* may not be injected from .env.
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  'https://medarena-33zm.onrender.com';

// Spec V2.1 §V2.1.6 / §49 Stage D: provider keys stay backend-only. The
// client never calls Gemini/Groq (or any model provider) directly.

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
            // No fabricated URL here (spec §0.5): citation lines without a
            // real link are dropped when building user-facing citations.
            sources.push({
              title: cLine.trim().slice(0, 120),
              guidelineSociety: cLine.match(/(ACC|AHA|ESC|WHO|IDSA|KDIGO|GINA|NICE|GOLD|AAP|ESPGHAN|NASPGHAN|SURVIVING SEPSIS|ACOG|FIGO)/i)?.[1] || 'Guideline Committee',
              journal: 'Clinical Practice Guidelines',
              year: yearMatch ? yearMatch[1] : new Date().getFullYear().toString(),
              content: cLine.trim(),
              url: '',
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
              url: '',
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
// DIRECT LLM API CALLS — REMOVED (spec V2.1 §V2.1.6 / §49 Stage D):
// the mobile app must not bypass the backend evidence engine by calling
// model providers directly. Clinical answers come only from the backend.
// ──────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────
// OFFLINE FALLBACK (uses bundled local knowledge only — no model calls)
// ──────────────────────────────────────────────────────────────────────

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
      // Spec §0.5 (no fake citations): only surface bundled sources that have
      // a real URL/PMID; never synthesize placeholder links or defaults.
      const citations: Citation[] = sources
        .filter((src) => Boolean(src.url || src.pmid))
        .slice(0, 5)
        .map((src, idx) => ({
          id: (idx + 1).toString(),
          title: src.title,
          author: src.guidelineSociety || src.author || 'Med Arena Bundled Knowledge Base',
          journal: src.journal || 'Med Arena Bundled Knowledge Base',
          year: src.year || '',
          url: src.url || (src.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${src.pmid}/` : ''),
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
// CLINICAL PEARLS — bundled miner only (spec V2.1 §V2.1.6): pearls were the
// last client path that called model providers directly. All generation now
// stays backend-side; the client mines its curated bundled knowledge base.
// ──────────────────────────────────────────────────────────────────────

export async function generateDynamicPearls(
  specialtyId?: string,
  count: number = 3
): Promise<import('../constants/DailyPearlsData').ClinicalPearl[]> {
  // Bundled miner only: pearls are derived from the curated local knowledge
  // base without any client-side model calls (spec V2.1 §V2.1.6).
  const { pearlMinerService } = await import('./pearlMinerService');
  return pearlMinerService.getMinedPearls(specialtyId, count);
}
