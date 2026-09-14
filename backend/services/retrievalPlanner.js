const { getSource } = require('../config/sourceRegistry');

const BUDGETS = Object.freeze({ guideline_question: 20, drug_question: 20, diagnosis_question: 20, latest_evidence: 30, research_question: 60, complex_case: 40, clinical_management: 20, follow_up: 20 });

function createRetrievalPlan(query, sessionState = {}) {
    const intent = query.intent || 'clinical_management';
    const terms = query.search_terms || [];
    const baseQuery = query.normalized_query || terms.join(' ') || query.condition || '';
    const current = query.temporal_request === 'current';
    const plans = [];
    const addPlan = (sourceFamily, sourceId, queries, maxCandidates) => {
        const source = getSource(sourceId);
        if (source?.enabled) plans.push({ source_family: sourceFamily, source_id: sourceId, queries, max_candidates: maxCandidates });
    };
    if (['guideline_question', 'clinical_management', 'diagnosis_question', 'drug_question', 'latest_evidence', 'complex_case', 'follow_up'].includes(intent)) {
        // Only plan sources with implemented adapters; unimplemented registry entries
        // silently return nothing and dilute the candidate pool (spec §75).
        addPlan('guidelines', 'europe_pmc', [baseQuery + ' guideline', ...terms.slice(0, 3)], 20);
        addPlan('literature', 'europe_pmc', [baseQuery], 15);
    }
    if (['research_question', 'latest_evidence', 'complex_case'].includes(intent)) {
        addPlan('literature', 'pubmed', [baseQuery, ...terms.slice(0, 3)], 25);
        addPlan('trials', 'clinicaltrials_gov', [baseQuery], 10);
    }
    if (intent === 'drug_question' || query.medications?.length) {
        addPlan('regulatory', 'fda', [baseQuery + ' label warnings'], 10);
    }
    return {
        intent,
        plans,
        session_state: sessionState,
        retrieval_budget: BUDGETS[intent] || 20,
        minimum_required_authority: intent === 'research_question' ? 2 : 1,
        require_current_evidence: current,
        max_rounds: intent === 'research_question' || intent === 'complex_case' ? 4 : 3,
        stop_criteria: ['authoritative_source', 'direct_relevance', 'population_match', 'no_unresolved_conflict'],
    };
}

module.exports = { createRetrievalPlan, BUDGETS };
