const EGYPTIAN_TERMS = Object.freeze({
    'سخونية': { term: 'fever', type: 'symptom' },
    'ترجيع': { term: 'vomiting', type: 'symptom' },
    'نهجان': { term: 'dyspnea', type: 'symptom' },
    'كرشة نفس': { term: 'dyspnea', type: 'symptom' },
    'كتافلام': { term: 'diclofenac', type: 'drug' },
    'فولتارين': { term: 'diclofenac', type: 'drug' },
    'اوجمنتين': { term: 'amoxicillin clavulanate', type: 'drug' },
    'أوجمنتين': { term: 'amoxicillin clavulanate', type: 'drug' },
    'انتينال': { term: 'nifuroxazide', type: 'drug' },
    'سكر': { term: 'diabetes', type: 'condition' },
    'ضغط': { term: 'hypertension', type: 'condition' },
    'قرحة': { term: 'peptic ulcer', type: 'condition' },
    'كلى': { term: 'kidney renal', type: 'condition' },
    'كبد': { term: 'liver hepatic', type: 'condition' },
    'حمل': { term: 'pregnancy', type: 'population' },
});

const ENGLISH_SYNONYMS = Object.freeze({
    fever: 'fever', vomiting: 'vomiting', dyspnea: 'dyspnea', diabetes: 'diabetes',
    diabetic: 'diabetes', hypertension: 'hypertension', htn: 'hypertension',
    ulcer: 'peptic ulcer', pregnancy: 'pregnancy', pregnant: 'pregnancy',
    kidney: 'renal', renal: 'renal', liver: 'hepatic', hepatic: 'hepatic',
    dose: 'dose', dosage: 'dose', contraindication: 'contraindication',
    contraindications: 'contraindication', guideline: 'guideline', guidelines: 'guideline',
    latest: 'latest', current: 'current', recent: 'recent', updated: 'updated',
    research: 'research', study: 'research', trial: 'research',
});

const STOPWORDS = new Set('a an and are as at be been but by can could do does for from has have how i if in is it may me more my of on or please should tell that the their them there this to was we what when where which who why will with you explain describe discuss'.split(' '));

// Rare/long clinical terms (condition names, drugs) discriminate best across
// sources; used to build focused fallback query variants.
function rankSearchTerms(terms) {
    return [...(terms || [])].sort((a, b) => b.length - a.length);
}

function detectLanguage(text) {
    return /[\u0600-\u06ff]/.test(text) ? 'ar-EG' : 'en';
}

function normalizeText(text) {
    return String(text || '').toLowerCase().replace(/[؟?!.,;:()[\]{}"'،]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractNumber(text, patterns) {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return Number(match[1]);
    }
    return null;
}

function classifyIntent(text, normalizedTerms, history) {
    const lower = text.toLowerCase();
    if (/\b(latest|current|newest|updated|recent|what changed|today)\b|احدث|أحدث|حالي|جديد/.test(lower)) return 'latest_evidence';
    if (/\b(research|study|studies|trial|literature|evidence)\b|بحث|دراسات/.test(lower)) return 'research_question';
    if (/\b(dose|dosage|mg\/kg|how much)\b|جرعة/.test(lower)) return 'drug_question';
    if (/\b(diagnos|workup|differential|test)\w*\b|تشخيص|فحوص/.test(lower)) return 'diagnosis_question';
    if (/\b(guideline|first[- ]line|recommended|management|treatment)\w*\b|إرشادات|علاج|بروتوكول/.test(lower)) return 'guideline_question';
    if (history.length > 0 && (/^(طب|طيب|and|what about|how about|بديله|وبديله|وهو|then)\b/i.test(text.trim()) || text.trim().length < 35)) return 'follow_up';
    return normalizedTerms.length > 4 ? 'complex_case' : 'clinical_management';
}

function interpretClinicalQuery(message, history = []) {
    const text = String(message || '').trim();
    if (!text) throw Object.assign(new Error('Clinical question is empty'), { code: 'QUERY_PARSE_ERROR' });
    const normalized = normalizeText(text);
    const tokens = normalized.split(' ').filter((token) => token.length > 2 && !STOPWORDS.has(token) && !/^\d+$/.test(token));
    const terms = [];
    const entities = [];
    for (const [alias, mapping] of Object.entries(EGYPTIAN_TERMS)) {
        if (normalized.includes(alias)) {
            terms.push(mapping.term);
            entities.push({ name: mapping.term, type: mapping.type, matched: alias });
        }
    }
    for (const token of tokens) {
        const term = ENGLISH_SYNONYMS[token] || token;
        if (!terms.includes(term)) terms.push(term);
    }
    const age = extractNumber(normalized, [/(?:age|aged|year|years|سن)\s*(\d{1,3})/, /(\d{1,3})\s*(?:year|years|سنة)/]);
    const weight = extractNumber(normalized, [/(?:weight|wt|وزن)\s*(\d{1,3}(?:\.\d+)?)\s*(?:kg|كيلو)?/, /(\d{1,3}(?:\.\d+)?)\s*kg/]);
    const intent = classifyIntent(text, terms, history);
    const temporalRequest = /latest|current|newest|updated|recent|today|حالي|أحدث|جديد/i.test(text) ? 'current' : 'current';
    return {
        language: detectLanguage(text),
        intent,
        task: intent === 'drug_question' ? 'dose_or_safety' : intent,
        condition: entities.find((entity) => entity.type === 'condition')?.name || null,
        population: { age, weight, sex: null, pregnancy: terms.includes('pregnancy') ? true : null },
        medications: entities.filter((entity) => entity.type === 'drug').map((entity) => entity.name),
        symptoms: entities.filter((entity) => entity.type === 'symptom').map((entity) => entity.name),
        labs: [],
        clinical_state: [],
        follow_up: intent === 'follow_up',
        temporal_request: temporalRequest,
        search_terms: terms,
        entities,
        normalized_query: terms.join(' '),
    };
}

module.exports = { EGYPTIAN_TERMS, interpretClinicalQuery, normalizeText, detectLanguage, rankSearchTerms };
