const { callAI } = require('./aiService');
const { safeParseJSON } = require('./jsonUtils');
const { getQueryTokens } = require('./medicalSearchService');

const MODIFIER_CONDITIONS = new Set(['obesity', 'pregnancy', 'renal', 'hepatic']);
const INTENT_TERMS = Object.freeze({
    diagnosis_question: ['diagnostic criteria', 'workup'],
    guideline_question: ['treatment', 'management', 'guideline'],
    clinical_management: ['treatment', 'management', 'guideline'],
    drug_question: ['drug dose', 'safety', 'drug label'],
    comparison: ['comparative effectiveness', 'clinical outcomes'],
    research_question: ['clinical research', 'study'],
    latest_evidence: ['recent updates', 'guideline recommendations', 'trial outcomes'],
});

const TRANSLATION_SYSTEM_PROMPT = `You are a medical search-query translator, not a clinician and not an answer generator.
Translate only the clinical meaning explicitly present in the user's text into concise English search concepts.
Never infer a diagnosis from symptoms, add a drug, recommend treatment, invent patient facts, or resolve an ambiguous abbreviation by guessing. If a term has multiple plausible meanings, set ambiguous=true and confidence below 0.8.
Return exactly one JSON object with this shape:
{"primary_condition": string|null, "medications": string[], "drug_classes": string[], "symptoms": string[], "search_query": string, "confidence": number, "ambiguous": boolean}
All terms must be in English. Use an empty array or null when the concept is not explicitly stated. Confidence must describe translation fidelity, not clinical certainty.`;

function unique(values) {
    return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function isArabic(text) {
    return /\p{Script=Arabic}/u.test(String(text || ''));
}

function isEnglishSearchTerm(text) {
    return /^[\p{Script=Latin}\p{N}\s-]+$/u.test(String(text || '').trim());
}

function cleanConcept(value) {
    if (typeof value !== 'string') return null;
    const cleaned = value.trim().replace(/\s+/g, ' ');
    if (!cleaned || cleaned.length > 100 || !isEnglishSearchTerm(cleaned)) return null;
    return cleaned.toLowerCase();
}

function cleanConceptList(value, limit = 5) {
    if (!Array.isArray(value)) return [];
    return unique(value.slice(0, limit).map(cleanConcept).filter(Boolean));
}

function parseTranslation(raw) {
    const parsed = raw && typeof raw === 'object' ? raw : safeParseJSON(raw, null);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const confidence = Number(parsed.confidence);
    if (!Number.isFinite(confidence) || confidence < 0.85 || confidence > 1 || parsed.ambiguous === true) return null;

    const primaryCondition = parsed.primary_condition === null ? null : cleanConcept(parsed.primary_condition);
    if (parsed.primary_condition && !primaryCondition) return null;
    const medications = cleanConceptList(parsed.medications);
    const drugClasses = cleanConceptList(parsed.drug_classes);
    const symptoms = cleanConceptList(parsed.symptoms);
    const searchQuery = typeof parsed.search_query === 'string' && isEnglishSearchTerm(parsed.search_query)
        ? parsed.search_query.trim().slice(0, 240)
        : '';
    const searchTerms = getQueryTokens(searchQuery);
    if (!primaryCondition && !medications.length && !drugClasses.length && !symptoms.length && !searchTerms.length) return null;

    return { primaryCondition, medications, drugClasses, symptoms, searchQuery, searchTerms, confidence };
}

function parsedAnchor(query = {}) {
    const conditions = Array.isArray(query.conditions) ? query.conditions : [];
    const primaryCondition = conditions.find((condition) => condition?.concept && !MODIFIER_CONDITIONS.has(condition.concept))?.concept;
    if (primaryCondition) return primaryCondition;
    if (query.condition && !MODIFIER_CONDITIONS.has(query.condition)) return query.condition;
    return query.medications?.[0] || query.drug_classes?.[0] || query.symptoms?.[0] || query.labs?.[0]?.name || null;
}

function hasPrimaryDisease(query = {}) {
    const conditions = Array.isArray(query.conditions) ? query.conditions : [];
    return Boolean(
        conditions.find((condition) => condition?.concept && !MODIFIER_CONDITIONS.has(condition.concept))?.concept
        || (query.condition && !MODIFIER_CONDITIONS.has(query.condition)),
    );
}

function fallbackAnchor(query, message) {
    const parsed = parsedAnchor(query);
    if (parsed) return parsed;

    // Obesity can be the topic itself; pregnancy/renal/hepatic status alone
    // cannot safely anchor a treatment search.
    if (query.condition === 'obesity' && query.intent !== 'follow_up' && !query.comparison) return 'obesity';

    // English-only or mixed Arabic-English queries can still be searched directly and
    // must pass the same evidence anchor gate.
    const englishTokens = getQueryTokens(messageWithoutArabic(message));
    if (englishTokens.length) {
        return englishTokens.slice(0, 4).join(' ');
    }
    return null;
}

async function translateClinicalSearchQuery(message) {
    const raw = await callAI(
        TRANSLATION_SYSTEM_PROMPT,
        `Translate this request for evidence search only. Preserve uncertainty and return JSON only.\n\n${String(message).slice(0, 1200)}`,
        [],
        { timeoutMs: 2500, maxOutputTokens: 500 },
    );
    return raw;
}

function mergeTranslation(query, translation, message = '') {
    if (!translation) return query;

    const conditions = Array.isArray(query.conditions) ? [...query.conditions] : [];
    if (translation.primaryCondition && !conditions.some((condition) => condition?.concept === translation.primaryCondition)) {
        conditions.unshift({ concept: translation.primaryCondition, confidence: translation.confidence, source: 'literal_query_translation' });
    }

    const condition = conditions.find((item) => item?.concept && !MODIFIER_CONDITIONS.has(item.concept))?.concept
        || query.condition
        || null;
    const medications = unique([...(query.medications || []), ...translation.medications]);
    const drugClasses = unique([...(query.drug_classes || []), ...translation.drugClasses]);
    const symptoms = unique([...(query.symptoms || []), ...translation.symptoms]);
    const anchor = condition && !MODIFIER_CONDITIONS.has(condition)
        ? condition
        : medications[0] || drugClasses[0] || symptoms[0] || query.retrieval_anchors?.[0] || null;

    return {
        ...query,
        condition,
        conditions,
        medications,
        drug_classes: drugClasses,
        symptoms,
        retrieval_anchors: anchor ? [anchor] : [],
        search_terms: unique([
            ...(query.search_terms || []).filter(isEnglishSearchTerm),
            ...translation.searchTerms,
            ...translation.medications,
            ...translation.drugClasses,
            ...translation.symptoms,
            ...(translation.primaryCondition ? [translation.primaryCondition] : []),
        ]),
        normalized_query: unique([
            ...(translation.primaryCondition ? [translation.primaryCondition] : []),
            ...translation.medications,
            ...translation.drugClasses,
            ...translation.symptoms,
            ...translation.searchTerms,
            ...getQueryTokens(messageWithoutArabic(message || query.raw_query || '')),
        ]).join(' '),
        query_normalization: { source: 'ai_literal_translation', confidence: translation.confidence },
    };
}

function messageWithoutArabic(message) {
    return String(message || '').replace(/\p{Script=Arabic}+/gu, ' ');
}

function normalizeDeterministicQuery(query, message) {
    const anchor = fallbackAnchor(query, message);
    const parsedTerms = (query.search_terms || [])
        .filter(isEnglishSearchTerm)
        .flatMap((term) => getQueryTokens(term));
    const englishTerms = getQueryTokens(messageWithoutArabic(message));
    const intentTerms = INTENT_TERMS[query.intent] || [];
    const allTerms = unique([anchor, ...parsedTerms, ...englishTerms, ...intentTerms]);
    const condition = query.condition || (anchor && !MODIFIER_CONDITIONS.has(anchor) ? anchor : null);
    const conditions = Array.isArray(query.conditions) && query.conditions.length > 0
        ? query.conditions
        : (condition ? [{ concept: condition, confidence: 0.9, source: 'mixed_language_extraction' }] : []);
    const combinedAnchors = unique([
        ...(query.retrieval_anchors || []),
        anchor,
        ...(query.medications || []),
        ...englishTerms,
    ]).filter((a) => a && !MODIFIER_CONDITIONS.has(a));

    return {
        ...query,
        condition,
        conditions,
        retrieval_anchors: combinedAnchors.length ? combinedAnchors : (anchor ? [anchor] : []),
        search_terms: allTerms,
        normalized_query: allTerms.join(' '),
        query_normalization: { source: 'deterministic', confidence: anchor ? 1 : 0 },
    };
}

function clarificationMessage(message) {
    if (isArabic(message)) return 'يرجى توضيح اسم المرض أو الدواء، أو كتابته بالإنجليزية، حتى أبحث عن دليل طبي ذي صلة.';
    return 'Please specify the condition or medicine (or include its English name) so I can search for relevant medical evidence.';
}

async function normalizeClinicalQueryForRetrieval(query, message, options = {}) {
    const translateQuery = options.translateQuery || translateClinicalSearchQuery;
    const rawMessage = String(message || '');
    let normalizedQuery = normalizeDeterministicQuery(query || {}, rawMessage);
    const hasArabic = isArabic(rawMessage);
    const englishTokens = getQueryTokens(messageWithoutArabic(rawMessage));
    const hasEnglishTokens = englishTokens.length > 0;
    // Pure Arabic queries without direct English clinical tokens require translation.
    // If the message has English clinical tokens, we already have exact medical terms.
    const requiresTranslation = !hasPrimaryDisease(query || {}) && (hasArabic ? !hasEnglishTokens : !parsedAnchor(query || {}));
    let translation = null;

    if (requiresTranslation && !(query || {}).clarification_required) {
        try {
            translation = parseTranslation(await translateQuery(rawMessage));
        } catch {
            translation = null;
        }
        if (translation) normalizedQuery = mergeTranslation(normalizedQuery, translation, rawMessage);
    }

    // Do not search on a population modifier alone (e.g. "what about pregnancy?").
    const modifierOnlyFollowUp = normalizedQuery.intent === 'follow_up'
        && MODIFIER_CONDITIONS.has(normalizedQuery.condition)
        && !normalizedQuery.medications?.length
        && !normalizedQuery.drug_classes?.length
        && !(normalizedQuery.conditions || []).some((condition) => condition?.concept && !MODIFIER_CONDITIONS.has(condition.concept));
    const anchor = fallbackAnchor(normalizedQuery, rawMessage);
    normalizedQuery.query_normalization = {
        ...normalizedQuery.query_normalization,
        translation_attempted: requiresTranslation,
        translation_status: requiresTranslation ? (translation ? 'used' : 'fallback') : 'not_needed',
    };
    if (modifierOnlyFollowUp || !anchor) {
        return { status: 'CLARIFICATION_REQUIRED', query: { ...normalizedQuery, retrieval_anchors: [] }, clarification: clarificationMessage(rawMessage) };
    }

    // Keep search text English/canonical; never turn unparsed Arabic into a
    if (translation) {
        normalizedQuery = mergeTranslation(normalizedQuery, translation, rawMessage);
        normalizedQuery.retrieval_anchors = [anchor];
    } else {
        normalizedQuery = normalizeDeterministicQuery(normalizedQuery, rawMessage);
        normalizedQuery.retrieval_anchors = unique([anchor, ...(normalizedQuery.retrieval_anchors || [])]).filter(Boolean);
    }
    return { status: 'OK', query: normalizedQuery };
}

module.exports = {
    normalizeClinicalQueryForRetrieval,
    translateClinicalSearchQuery,
    parseTranslation,
    fallbackAnchor,
};
