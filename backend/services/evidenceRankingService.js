const DEFAULT_WEIGHTS = Object.freeze({ relevance: 0.45, authority: 0.2, populationMatch: 0.15, freshness: 0.1, evidenceType: 0.1 });

// Spec §20: defaults are starting values, tuned per intent — authority
// dominates guideline lookups, freshness dominates "latest", population match
// dominates dosing.
const INTENT_WEIGHTS = Object.freeze({
    guideline_question: Object.freeze({ relevance: 0.4, authority: 0.35, populationMatch: 0.1, freshness: 0.05, evidenceType: 0.1 }),
    clinical_management: Object.freeze({ relevance: 0.4, authority: 0.3, populationMatch: 0.15, freshness: 0.05, evidenceType: 0.1 }),
    diagnosis_question: Object.freeze({ relevance: 0.45, authority: 0.25, populationMatch: 0.15, freshness: 0.05, evidenceType: 0.1 }),
    drug_question: Object.freeze({ relevance: 0.35, authority: 0.25, populationMatch: 0.25, freshness: 0.05, evidenceType: 0.1 }),
    latest_evidence: Object.freeze({ relevance: 0.4, authority: 0.15, populationMatch: 0.1, freshness: 0.25, evidenceType: 0.1 }),
    research_question: Object.freeze({ relevance: 0.45, authority: 0.2, populationMatch: 0.1, freshness: 0.15, evidenceType: 0.1 }),
});

function clamp(value) { return Math.max(0, Math.min(1, Number(value) || 0)); }

function scoreEvidence(item, query, weights) {
    const resolvedWeights = weights || INTENT_WEIGHTS[query?.intent] || DEFAULT_WEIGHTS;
    const relevance = clamp(item.relevance_score ?? item.similarity);
    const authority = clamp(item.authority_score);
    const populationMatch = clamp(item.population_match ?? 0.5);
    const freshness = clamp(item.freshness_score ?? 0.5);
    const evidenceType = clamp(item.evidence_type_score ?? 0.5);
    const finalScore = relevance * resolvedWeights.relevance + authority * resolvedWeights.authority + populationMatch * resolvedWeights.populationMatch + freshness * resolvedWeights.freshness + evidenceType * resolvedWeights.evidenceType;
    return { ...item, relevance_score: relevance, authority_score: authority, population_match: populationMatch, freshness_score: freshness, evidence_type_score: evidenceType, final_score: Number(finalScore.toFixed(6)), query_intent: query?.intent || null };
}

function rankEvidence(candidates, query, weights = DEFAULT_WEIGHTS) {
    return (Array.isArray(candidates) ? candidates : []).map((item) => scoreEvidence(item, query, weights)).sort((a, b) => b.final_score - a.final_score);
}

function selectEvidence(candidates, limit = 8) {
    const selected = [];
    const seen = new Set();
    for (const candidate of candidates || []) {
        const id = candidate.id || candidate.source_id || candidate.url;
        if (!id || seen.has(id) || !candidate.content) continue;
        seen.add(id);
        selected.push(candidate);
        if (selected.length >= limit) break;
    }
    return selected;
}

module.exports = { DEFAULT_WEIGHTS, scoreEvidence, rankEvidence, selectEvidence };
