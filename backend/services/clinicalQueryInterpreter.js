// Canonical Clinical Query interpreter (spec V3 §5–§10).
//
// Rebuild of the keyword matcher into a structured clinical interpreter:
//  - canonical clinical query object with patient/measurements/negations
//  - Arabic (incl. Egyptian) + English + mixed-language entity resolution
//  - fuzzy/typo-tolerant drug & condition matching ("dthiazide" -> thiazide)
//  - abbreviation resolution with explicit ambiguity (CCP is NOT silently CCB)
//  - explicit negation ("not emergency", "مفيش CKD", "مش حامل")
//  - BP / age / weight / height / sex parsing, decade -> age range
//  - FIXED temporal bug (V2 always set 'current'): temporal_request is only
//    'current' when the user explicitly asks for fresh evidence.
//
// Backward compatibility: exports interpretClinicalQuery / normalizeText /
// detectLanguage / rankSearchTerms / EGYPTIAN_TERMS, and the returned object
// keeps every field the retrieval planner and route previously consumed
// (intent, condition, population, medications, symptoms, search_terms,
// normalized_query, temporal_request, follow_up, entities).

const { extractSessionClinicalState } = require('./sessionClinicalState');

// ─────────────────────────────────────────────────────────────────────────────
// Lexicon: surface form -> canonical concept. Compact, curated; fuzzy matching
// handles typos against these keys rather than open-vocabulary guessing.
// ─────────────────────────────────────────────────────────────────────────────

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
    'كلى': { term: 'renal', type: 'condition' },
    'كبد': { term: 'hepatic', type: 'condition' },
    'مرارة': { term: 'gallbladder biliary', type: 'anatomy' },
    'صفرا': { term: 'jaundice', type: 'symptom' },
    'صفراء': { term: 'jaundice', type: 'symptom' },
    'حمل': { term: 'pregnancy', type: 'population' },
    'علاج': { term: 'treatment', type: 'intent' },
    'جرعة': { term: 'dose', type: 'intent' },
});

// Multi-word / phrase-level canonical concepts matched on the normalized text
// before tokenization (token-level matching would split them).
const PHRASE_CONCEPTS = Object.freeze([
    { pattern: /\bacute cholangitis\b|cholangitis|تليف مراري/, concept: 'acute cholangitis', type: 'condition' },
    { pattern: /\bcholecystitis\b|التهاب المرارة|التهاب في جدار المرارة/, concept: 'cholecystitis', type: 'condition' },
    { pattern: /\bpeptic ulcer\b|\bgi ulcer\b|قرحة المعدة|قرحة الاثني عشر/, concept: 'peptic ulcer', type: 'condition' },
    { pattern: /\bhypertensive emergency\b|أزمة ضغطية|طفح ضغطي/, concept: 'hypertensive emergency', type: 'condition' },
    { pattern: /\bhelicobacter pylori\b|\bh pylori\b|جرثومة المعدة/, concept: 'helicobacter pylori', type: 'condition' },
]);

// token -> canonical (English surface forms + common abbreviations)
const ENGLISH_LEXICON = Object.freeze({
    // conditions
    hypertension: { term: 'hypertension', type: 'condition' }, htn: { term: 'hypertension', type: 'condition' },
    diabetes: { term: 'diabetes', type: 'condition' }, diabetic: { term: 'diabetes', type: 'condition' },
    dm: { term: 'diabetes', type: 'condition' }, t2dm: { term: 'diabetes', type: 'condition' },
    obesity: { term: 'obesity', type: 'condition' }, obese: { term: 'obesity', type: 'condition' },
    jaundice: { term: 'jaundice', type: 'symptom' },
    cholangitis: { term: 'acute cholangitis', type: 'condition' },
    cholecystitis: { term: 'cholecystitis', type: 'condition' },
    ulcer: { term: 'peptic ulcer', type: 'condition' },
    ckd: { term: 'chronic kidney disease', type: 'condition' },
    // drug classes
    thiazide: { term: 'thiazide', type: 'drug_class' }, thiazides: { term: 'thiazide', type: 'drug_class' },
    ccb: { term: 'calcium channel blocker', type: 'drug_class' }, ccbs: { term: 'calcium channel blocker', type: 'drug_class' },
    ace: { term: 'ace inhibitor', type: 'drug_class' },
    arb: { term: 'arb', type: 'drug_class' }, arbs: { term: 'arb', type: 'drug_class' },
    diuretic: { term: 'diuretic', type: 'drug_class' }, diuretics: { term: 'diuretic', type: 'drug_class' },
    'beta-blocker': { term: 'beta blocker', type: 'drug_class' }, bb: { term: 'beta blocker', type: 'drug_class' },
    statin: { term: 'statin', type: 'drug_class' }, statins: { term: 'statin', type: 'drug_class' },
    // drugs
    amlodipine: { term: 'amlodipine', type: 'drug' }, lisinopril: { term: 'lisinopril', type: 'drug' },
    losartan: { term: 'losartan', type: 'drug' }, metformin: { term: 'metformin', type: 'drug' },
    diclofenac: { term: 'diclofenac', type: 'drug' }, paracetamol: { term: 'paracetamol', type: 'drug' },
    ciprofloxacin: { term: 'ciprofloxacin', type: 'drug' }, insulin: { term: 'insulin', type: 'drug' },
    doxycycline: { term: 'doxycycline', type: 'drug' }, amoxicillin: { term: 'amoxicillin', type: 'drug' },
    // symptoms
    fever: { term: 'fever', type: 'symptom' }, vomiting: { term: 'vomiting', type: 'symptom' },
    dyspnea: { term: 'dyspnea', type: 'symptom' }, headache: { term: 'headache', type: 'symptom' },
    // labs
    hb: { term: 'hemoglobin', type: 'lab' }, hemoglobin: { term: 'hemoglobin', type: 'lab' },
    creatinine: { term: 'creatinine', type: 'lab' }, hba1c: { term: 'hba1c', type: 'lab' },
});

// Abbreviation candidates used ONLY for ambiguity reporting. "CCP" is not in
// the lexicon; it resolves against this set and stays ambiguous unless the
// edit distance to a single candidate is decisive AND context supports it.
const ABBREVIATIONS = Object.freeze({
    ccb: { term: 'calcium channel blocker', type: 'drug_class' },
    ccp: { term: null, type: 'ambiguous_abbreviation' }, // cyclic citrullinated peptide / could be CCB typo
    arB: { term: 'arb', type: 'drug_class' },
    chb: { term: 'chronic hepatitis b', type: 'condition' },
    gerd: { term: 'gastroesophageal reflux', type: 'condition' },
    cap: { term: 'community acquired pneumonia', type: 'condition' },
    uti: { term: 'urinary tract infection', type: 'condition' },
    dka: { term: 'diabetic ketoacidosis', type: 'condition' },
    aki: { term: 'acute kidney injury', type: 'condition' },
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

const STOPWORDS = new Set('a an and are as at be been but by can could do does for from has have how i if in is it may me more my of on or please should tell that the their them there this to was we what when where which who why will with you explain describe discuss very'.split(' '));

const ARABIC_NEGATIONS = ['مفيش', 'مش', 'من غير', 'بدون', 'غير', 'لا يوجد', 'ليس'];
const ENGLISH_NEGATIONS = ['no', 'not', 'without', 'denies', 'negative for'];
const NEGATION_CONTINUE = new Set(['or', 'nor', 'and', 'ولا', 'أو', 'او']);

const TEMPORAL_CURRENT = /\b(latest|current|newest|updated|recent|now|today|up to date|guideline update|latest recommendations)\b|أحدث|حالي|جديد|محدث|الآن/i;

const ARABIC_NUMBER_WORDS = Object.freeze({
    'عشرين': 20, 'ثلاثين': 30, 'أربعين': 40, 'خمسين': 50, 'ستين': 60, 'سبعين': 70, 'ثمانين': 80, 'تسعين': 90,
});

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function normalizeText(text) {
    return String(text || '').toLowerCase().replace(/[؟?!.,;:()[\]{}"'،ـ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function detectLanguage(text) {
    const hasArabic = /[\u0600-\u06ff]/.test(text);
    const hasLatin = /[a-z]/i.test(text);
    if (hasArabic && hasLatin) return { primary: 'ar-EG', secondary: 'en', mixed: true };
    if (hasArabic) return { primary: 'ar-EG', secondary: null, mixed: false };
    return { primary: 'en', secondary: null, mixed: false };
}

function rankSearchTerms(terms) {
    return [...(terms || [])].sort((a, b) => b.length - a.length);
}

function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length || !b.length) return Math.max(a.length, b.length);
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i += 1) {
        const curr = [i];
        for (let j = 1; j <= b.length; j += 1) {
            curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
        prev = curr;
    }
    return prev[b.length];
}

// Typo tolerance: short tokens must match exactly (fuzzy on <=4 chars causes
// false positives like "cap"->"ccp"); longer tokens allow bounded edit distance.
function fuzzyLexiconMatch(token) {
    if (ENGLISH_LEXICON[token]) return { ...ENGLISH_LEXICON[token], confidence: 0.98 };
    if (token.length < 5) return null;
    const maxDistance = token.length >= 9 ? 2 : 1;
    let best = null;
    let bestDistance = Infinity;
    for (const key of Object.keys(ENGLISH_LEXICON)) {
        if (Math.abs(key.length - token.length) > maxDistance) continue;
        const distance = levenshtein(token, key);
        if (distance < bestDistance && distance <= maxDistance) {
            bestDistance = distance;
            best = key;
            if (distance === 0) break;
        }
    }
    if (best) return { ...ENGLISH_LEXICON[best], confidence: bestDistance === 1 ? 0.9 : 0.8, matched_from: token };
    return null;
}

function resolveAbbreviation(token) {
    const lower = token.toLowerCase();
    const entry = ABBREVIATIONS[lower];
    if (!entry) return null;
    if (entry.term) return { term: entry.term, type: entry.type, confidence: 0.95 };
    // Ambiguous abbreviation: report candidates by edit distance to known keys.
    const candidates = Object.keys(ABBREVIATIONS)
        .filter((key) => key !== lower && levenshtein(lower, key) <= 1)
        .map((key) => ({ canonical: ABBREVIATIONS[key].term, key, distance: levenshtein(lower, key) }))
        .sort((a, b) => a.distance - b.distance);
    return { term: null, type: 'ambiguous_abbreviation', confidence: 0.4, candidates };
}

// ─────────────────────────────────────────────────────────────────────────────
// Negation (spec §8): a negation word flips concepts found within a small
// forward window; "or"/"ولا" continues the negation scope.
// ─────────────────────────────────────────────────────────────────────────────

function buildNegationMask(normalized) {
    const tokens = normalized.split(' ');
    const mask = new Array(tokens.length).fill(false);
    const allNegations = [...ARABIC_NEGATIONS, ...ENGLISH_NEGATIONS];
    for (let i = 0; i < tokens.length; i += 1) {
        if (!allNegations.includes(tokens[i])) continue;
        let scope = 0;
        for (let j = i + 1; j < Math.min(tokens.length, i + 5); j += 1) {
            const token = tokens[j];
            if (allNegations.includes(token)) continue;
            if (NEGATION_CONTINUE.has(token)) { scope += 1; continue; }
            if (scope >= 3) break; // window: up to 3 content tokens stay negated
            mask[j] = true;
            scope += 1;
        }
    }
    return { tokens, mask };
}

// ─────────────────────────────────────────────────────────────────────────────
// Measurements & demographics (spec §9–§10)
// ─────────────────────────────────────────────────────────────────────────────

function extractBloodPressure(text) {
    const patterns = [
        /(\d{2,3})\s*(?:\/|x|over|على|مقابل)\s*(\d{2,3})/,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const systolic = Number(match[1]);
            const diastolic = Number(match[2]);
            // Plausibility gate: never invent units/numbers from noise.
            if (systolic >= 60 && systolic <= 250 && diastolic >= 30 && diastolic <= 150 && systolic > diastolic) {
                return { systolic, diastolic, unit: 'mmHg' };
            }
        }
    }
    return null;
}

function extractAge(text) {
    // "in her 50s" / "in his 60s"
    const decadeS = text.match(/\b(?:in\s+)?(?:her|his|their)\s+(\d)0s\b/);
    if (decadeS) return { range: [Number(decadeS[1]) * 10, Number(decadeS[1]) * 10 + 9], value: null };
    // "50th decade"
    const decade = text.match(/\b(\d)(?:0)?th\s+decade\b/);
    if (decade) return { range: [Number(decade[1]) * 10, Number(decade[1]) * 10 + 9], value: null };
    // "فوق الخمسين" / "اكبر من الخمسين" -> open lower bound
    for (const [word, value] of Object.entries(ARABIC_NUMBER_WORDS)) {
        if (new RegExp(`(?:فوق|اكبر من|أكبر من)\\s*(?:ال)?${word}`).test(text)) {
            return { range: [value, null], value: null };
        }
    }
    // explicit numeric age
    const explicit = text.match(/(?:age|aged|year|years|سن|سنة)\s*(\d{1,3})\b/) || text.match(/\b(\d{1,3})\s*(?:year|years|سنة|سن)\b/);
    if (explicit) {
        const value = Number(explicit[1]);
        if (value >= 0 && value <= 120) return { range: null, value };
    }
    // Arabic decade word alone ("مريضة فوق الـ50" handled above; "خمسين سنة")
    for (const [word, value] of Object.entries(ARABIC_NUMBER_WORDS)) {
        if (new RegExp(`${word}\\s*(?:سنة|سن)`).test(text)) return { range: [value, value + 9], value: null };
    }
    return { range: null, value: null };
}

function extractWeightKg(text) {
    const match = text.match(/(?:weight|wt|وزن)\s*(?:ها|ه)?\s*(\d{1,3}(?:\.\d+)?)\s*(?:kg|كيلو)?/) || text.match(/(\d{1,3}(?:\.\d+)?)\s*(?:kg|kilo|كيلو)/);
    if (match) {
        const value = Number(match[1]);
        if (value >= 2 && value <= 400) return value;
    }
    return null;
}

function extractHeightCm(text) {
    const cmMatch = text.match(/(\d{3})\s*cm/);
    if (cmMatch) return Number(cmMatch[1]);
    const mMatch = text.match(/(\d(?:\.\d{1,2}))\s*m\b/);
    if (mMatch) return Number(mMatch[1]) * 100;
    return null;
}

function extractLabValues(text) {
    const labs = [];
    const pattern = /\b(hb|hemoglobin|hba1c|creatinine)\s*(?:=|is|:)?\s*(\d{1,3}(?:\.\d+)?)/gi;
    let match;
    while ((match = pattern.exec(text)) !== null) {
        const canonical = ENGLISH_LEXICON[match[1].toLowerCase()]?.term || match[1].toLowerCase();
        labs.push({ name: canonical, value: Number(match[2]), unit: null });
    }
    return labs;
}

function extractPatientAttributes(normalized, mask, terms) {
    const { tokens } = mask;
    const isNegated = (index) => (index >= 0 ? mask[index] : false);
    const findTokenIndex = (regex) => tokens.findIndex((token) => regex.test(token));

    const female = /\b(female|woman|lady|she|her)\b|مريضة|انثى|أنثى|سيدت/.test(normalized);
    const male = /\b(male|man|he|his)\b|مريض(?!ة)/.test(normalized);
    const sex = female && !male ? 'female' : male && !female ? 'male' : female && male ? null : null;

    // obesity: stated directly or via weight wording
    const obesityMention = /\bobes|\bobesity\b|سمنة|وزن.{0,10}(زيادة|زايد|كثير)|وزنها.{0,10}زيادة/.test(normalized);
    const obesityNegated = isNegated(findTokenIndex(/وزن/)) && obesityMention;

    const pregnancyIndex = findTokenIndex(/(pregnant|pregnancy|حامل|الحمل)/);
    const pregnancy = pregnancyIndex === -1 ? null : isNegated(pregnancyIndex) ? false : true;

    const renalMention = /\b(ckd|renal|kidney)\b|كلى|كلوي/.test(normalized);
    const renalIndex = findTokenIndex(/(ckd|renal|kidney|كلوي|كلى)/);
    const renal_status = renalMention ? (isNegated(renalIndex) ? 'absent' : 'present') : 'unknown';

    const hepaticMention = /\b(cirrhosis|hepatic|liver)\b|كبد|كبدي/.test(normalized);
    const hepaticIndex = findTokenIndex(/(cirrhosis|hepatic|liver|كبد|كبدي)/);
    const hepatic_status = hepaticMention ? (isNegated(hepaticIndex) ? 'absent' : 'present') : 'unknown';

    const sedentary = /\b(sedentary|low activity|inactive)\b|حرك.{0,8}(قليل|قليلة)|خمول/.test(normalized);

    return { sex, obesity: obesityMention && !obesityNegated ? true : obesityMention && obesityNegated ? false : null, pregnancy, renal_status, hepatic_status, sedentary };
}

// ─────────────────────────────────────────────────────────────────────────────
// Intent & complexity (spec §12/§52)
// ─────────────────────────────────────────────────────────────────────────────

function detectComparison(normalized) {
    const pattern = /\b(vs|versus|better than|or)\b.{0,40}\b(which|better|prefer)\b|احسن\s+ولا|أفضل\s+ولا|ولا\s+\w+\s+احسن|افضل\s+ولا|أحسن\s+ولا/;
    if (!pattern.test(normalized)) return null;
    // capture the two compared drug classes/drugs if present
    const classes = [];
    for (const concept of ['calcium channel blocker', 'thiazide', 'arb', 'ace inhibitor', 'beta blocker', 'diuretic']) {
        const short = concept.split(' ')[0];
        if (new RegExp(`\\b${short}`).test(normalized)) classes.push(concept);
    }
    return { type: 'treatment_comparison', entities: classes.slice(0, 2) };
}

function classifyIntent(text, normalizedTerms, history) {
    const lower = text.toLowerCase();
    const isFollowUpShape = history.length > 0 && (/^(طب|طيب|and|what about|how about|بديله|وبديله|وهو|then|وهل|وهل)\b/i.test(text.trim()) || text.trim().length < 35);
    if (isFollowUpShape) return 'follow_up';
    if (/\b(latest|current|newest|updated|recent|what changed|today)\b|احدث|أحدث|حالي|جديد/.test(lower)) return 'latest_evidence';
    if (/\b(research|study|studies|trial|literature|evidence)\b|بحث|دراسات/.test(lower)) return 'research_question';
    if (/\b(dose|dosage|mg\/kg|how much)\b|جرعة/.test(lower)) return 'drug_question';
    if (/\b(diagnos|workup|differential|test)\w*\b|تشخيص|فحوص/.test(lower)) return 'diagnosis_question';
    if (/\b(guideline|first[- ]line|recommended|management|treatment|best treatment)\w*\b|إرشادات|علاج|بروتوكول|افضل علاج|أفضل علاج/.test(lower)) return 'guideline_question';
    return normalizedTerms.length > 4 ? 'complex_case' : 'clinical_management';
}

function classifyComplexity({ entityCount, comparison, hasModifiers, isDosing, ambiguities, subQuestionCount }) {
    if (ambiguities.length > 0 && ambiguities.some((a) => !a.resolved)) return 'NORMAL'; // clarification keeps it cheap
    if (subQuestionCount >= 3 || (entityCount >= 5 && comparison)) return 'DEEP';
    if (comparison || isDosing || hasModifiers || entityCount >= 3) return 'NORMAL';
    return 'SIMPLE';
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────────────────────────

function interpretClinicalQuery(message, history = []) {
    const text = String(message || '').trim();
    if (!text) throw Object.assign(new Error('Clinical question is empty'), { code: 'QUERY_PARSE_ERROR' });

    const normalized = normalizeText(text);
    const language = detectLanguage(text);
    const mask = buildNegationMask(normalized);

    // 1. Phrase-level concepts (multi-word conditions)
    const entities = [];
    const conditions = [];
    for (const phrase of PHRASE_CONCEPTS) {
        if (phrase.pattern.test(normalized)) {
            entities.push({ name: phrase.concept, type: phrase.type, matched: phrase.pattern.source.slice(0, 30), confidence: 0.95 });
            if (phrase.type === 'condition') conditions.push({ concept: phrase.concept, confidence: 0.95 });
        }
    }

    // 2. Arabic/Egyptian surface forms (substring match on normalized text)
    const terms = [];
    const pushTerm = (term) => { if (!terms.includes(term)) terms.push(term); };
    for (const [alias, mapping] of Object.entries(EGYPTIAN_TERMS)) {
        if (normalized.includes(alias)) {
            if (mapping.type !== 'intent') { pushTerm(mapping.term); }
            else pushTerm(mapping.term);
            entities.push({ name: mapping.term, type: mapping.type, matched: alias, confidence: 0.9 });
        }
    }

    // 3. Token-level resolution: lexicon exact -> fuzzy -> abbreviations
    const ambiguities = [];
    const drugClasses = [];
    const medications = [];
    const symptoms = [];
    const tokens = mask.tokens.filter((token) => token.length > 1 && !/^\d+$/.test(token) && !STOPWORDS.has(token));
    for (const token of tokens) {
        let resolved = fuzzyLexiconMatch(token);
        if (!resolved) resolved = resolveAbbreviation(token);
        if (!resolved) continue;
        if (resolved.type === 'ambiguous_abbreviation') {
            ambiguities.push({
                token,
                resolved: false,
                candidates: resolved.candidates || [],
                clarification_hint: resolved.candidates?.length ? `Did you mean ${resolved.candidates[0].canonical}?` : null,
            });
            continue;
        }
        pushTerm(resolved.term);
        entities.push({ name: resolved.term, type: resolved.type, matched: token, confidence: resolved.confidence });
        if (resolved.type === 'condition') conditions.push({ concept: resolved.term, confidence: resolved.confidence });
        else if (resolved.type === 'drug') medications.push(resolved.term);
        else if (resolved.type === 'drug_class') drugClasses.push(resolved.term);
        else if (resolved.type === 'symptom') symptoms.push(resolved.term);
    }

    // 4. Patient context: this turn + inherited session state from history.
    // Inheritance is not limited to short follow-up turns: a comparison or any
    // later turn in the same clinical conversation (spec §8/§11) inherits the
    // established patient unless it explicitly restates or negates an attribute.
    const sessionState = extractSessionClinicalState(history, message);
    const attrs = extractPatientAttributes(normalized, mask, terms);
    const age = extractAge(normalized);
    const bp = extractBloodPressure(normalized) || (sessionState.active ? sessionState.blood_pressure : null);
    const labs = extractLabValues(normalized);
    const weightKg = extractWeightKg(normalized) ?? sessionState.weight ?? null;
    const heightCm = extractHeightCm(normalized);

    const isFollowUp = (() => {
        const intent = classifyIntent(text, terms, history);
        return intent === 'follow_up';
    })();
    const inherited = sessionState.active ? sessionState : {};
    const sex = attrs.sex || inherited.sex || null;
    const pregnancy = attrs.pregnancy ?? inherited.pregnancy ?? null;
    const obesity = attrs.obesity ?? inherited.obesity ?? null;
    const renal_status = attrs.renal_status !== 'unknown' ? attrs.renal_status : (inherited.renal_context ? 'present' : 'unknown');
    const hepatic_status = attrs.hepatic_status !== 'unknown' ? attrs.hepatic_status : (inherited.hepatic_context ? 'present' : 'unknown');
    const ageValue = age.value ?? inherited.age ?? null;
    const ageRange = age.range || inherited.age_range || null;

    // 5. Emergency context (explicit negation respected: "not emergency")
    const emergencyIdx = mask.tokens.findIndex((token) => /emergency/.test(token));
    const urgencyIdx = mask.tokens.findIndex((token) => /urgency/.test(token));
    const emergencyMentioned = emergencyIdx !== -1 || urgencyIdx !== -1;
    const emergencyNegated = emergencyMentioned && ((emergencyIdx !== -1 && mask.mask[emergencyIdx]) || (urgencyIdx !== -1 && mask.mask[urgencyIdx]));
    const emergency_context = {
        hypertensive_emergency: emergencyMentioned ? !emergencyNegated : false,
        hypertensive_urgency: urgencyIdx !== -1 ? !mask.mask[urgencyIdx] : false,
        explicitly_excluded: emergencyNegated,
    };

    // 6. Clinical setting
    const clinical_setting = /\b(icu|critical care)\b|العناية/.test(normalized) ? 'critical_care'
        : /\b(inpatient|admitted|hospital)\b|داخلي|منوم/.test(normalized) ? 'inpatient'
        : /\b(outpatient|clinic)\b|عيادة/.test(normalized) ? 'outpatient'
        : null;

    // 7. Temporal request — FIXED (V2 always forced 'current'). Only explicit
    // recency language yields 'current'; historical questions yield 'historical'.
    const historical = /\b(in 19\d0|in 20\d0|historical|old guideline|previously recommended)\b/.test(normalized);
    const temporal_request = TEMPORAL_CURRENT.test(text) ? 'current' : historical ? 'historical' : 'not_specified';

    // 8. Hypertension derivation (transparent, spec §84): a stated BP reading
    // is itself the measurement; the underlying condition is derived and
    // recorded as derived, never silently inferred from a mention of "BP".
    if (bp && !conditions.some((c) => c.concept === 'hypertension') && !/hypertens|ضغط/.test(normalized)) {
        conditions.push({ concept: 'hypertension', confidence: 0.85, derived_from: 'stated_blood_pressure' });
    }
    if (/hypertens|ضغط/.test(normalized) && !conditions.some((c) => c.concept === 'hypertension')) {
        conditions.push({ concept: 'hypertension', confidence: 0.95 });
    }

    // 9. Intent & comparison
    let intent = classifyIntent(text, terms, history);
    const comparison = detectComparison(normalized);
    if (comparison && ['clinical_management', 'guideline_question', 'complex_case'].includes(intent)) intent = 'guideline_question';
    if (isFollowUp && comparison) intent = 'guideline_question'; // follow-up comparison still needs comparative evidence

    // 10. Follow-up question-topic detection ("طب والحامل؟" -> pregnancy)
    if (isFollowUp && pregnancy === true && !conditions.some((c) => c.concept === 'pregnancy')) {
        conditions.push({ concept: 'pregnancy', confidence: 0.9 });
        pushTerm('pregnancy');
    }

    // 11. Search terms: resolved canonical terms + inherited context dominate;
    // raw tokens are appended so wholly-unseen vocabulary still reaches the
    // retrieval layer, but noise tokens (numbers, negation words, unresolved
    // ambiguous abbreviations, pure Arabic function words) are excluded.
    const AR_FUNCTION_WORDS = new Set(['دلوقتي', 'دولوقتي', 'طب', 'طيب', 'كان', 'عنده', 'عندي', 'بسبب', 'ايه', 'إيه', 'اللي', 'من', 'في', 'على', 'لو', 'دا', 'ده', 'ممحكن', 'ممكن', 'احسن', 'أحسن', 'افضل', 'أفضل', 'ولا', 'أو', 'او', 'هل', 'الـ', 'زي', 'زيادة', 'حالة', 'وهل', 'وبديله', 'مفيش', 'مش', 'ليها', 'ليه', 'زيادة']);
    const NOISE_TOKENS = new Set(['not', 'no', 'like', 'her', 'his', 'she', 'and', 'the', 'with', 'best', 'what', 'is']);
    const rawTokens = tokens.filter((token) => token.length > 2 && !NOISE_TOKENS.has(token) && !AR_FUNCTION_WORDS.has(token) && !mask.mask[tokens.indexOf(token)] && !ambiguities.some((a) => a.token === token) && !/^(\d)/.test(token) && !/^50s$/.test(token));
    for (const token of rawTokens) { const canonical = ENGLISH_SYNONYMS[token] || token; pushTerm(canonical); }
    // Inherited conditions/terms from session state keep follow-up retrieval grounded.
    if (sessionState.active && isFollowUp) {
        if (sessionState.obesity) pushTerm('obesity');
        if (sessionState.pregnancy) pushTerm('pregnancy');
        if (sessionState.renal_context) pushTerm('renal');
    }
    const canonical_terms = terms.slice();

    // 11. Clarification policy (spec §43): only for unresolved, materially
    // relevant ambiguity in the question focus.
    const clarification_required = ambiguities.some((a) => !a.resolved && a.candidates && a.candidates.length > 0);
    const clarification = clarification_required
        ? { question: ambiguities[0].clarification_hint, token: ambiguities[0].token, candidates: ambiguities[0].candidates }
        : null;

    // 12. Complexity class
    const hasModifiers = obesity === true || renal_status === 'present' || hepatic_status === 'present' || pregnancy === true;
    const complexity = classifyComplexity({
        entityCount: entities.length,
        comparison: Boolean(comparison),
        hasModifiers,
        isDosing: intent === 'drug_question',
        ambiguities,
        subQuestionCount: conditions.length + (comparison ? 1 : 0) + (hasModifiers ? 1 : 0),
    });

    const conditionName = conditions[0]?.concept || null;
    const normalizedQuery = terms.join(' ') || rawTokens.slice(0, 8).join(' ');

    return {
        raw_query: text,
        language,
        intent,
        task: intent === 'drug_question' ? 'dose_or_safety' : intent,
        complexity,
        condition: conditionName,
        conditions,
        patient: {
            sex,
            age: { value: ageValue, unit: ageValue != null ? 'years' : null, range: ageRange },
            obesity,
            weight_kg: weightKg,
            height_cm: heightCm,
            pregnancy,
            renal_status,
            hepatic_status,
            activity_level: attrs.sedentary ? 'sedentary' : null,
        },
        clinical_measurements: {
            blood_pressure: bp,
            labs,
        },
        population: { age: ageValue, age_range: ageRange, weight: weightKg, sex, pregnancy }, // legacy fields consumed by planner/sufficiency
        medications,
        drug_classes: drugClasses,
        symptoms,
        labs,
        clinical_setting,
        emergency_context,
        negations: mask.tokens.filter((_, i) => mask.mask[i]),
        follow_up: isFollowUp,
        temporal_request,
        question: { primary: intent, comparison: comparison?.entities || null },
        conversation_context: isFollowUp ? { inherited_from_history: true, prior_state: sessionState } : {},
        search_terms: terms,
        canonical_terms,
        entities,
        normalized_query: normalizedQuery,
        ambiguities,
        clarification_required,
        clarification,
    };
}

module.exports = {
    EGYPTIAN_TERMS,
    ENGLISH_LEXICON,
    interpretClinicalQuery,
    normalizeText,
    detectLanguage,
    rankSearchTerms,
    levenshtein,
};
