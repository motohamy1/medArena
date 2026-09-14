const { getSource } = require('../config/sourceRegistry');
const { rankSearchTerms } = require('./clinicalQueryInterpreter');

const BUDGETS = Object.freeze({ guideline_question: 20, drug_question: 20, diagnosis_question: 20, latest_evidence: 30, research_question: 60, complex_case: 40, clinical_management: 20, follow_up: 20 });

// Condition-anchored focus queries: "acute cholangitis" (the adjacent pair
// containing the condition) plus "condition + modifier" variants map to the
// distinct sub-questions inside one message (spec §16: multiple retrieval
// formulations).
function buildFocusQueries(terms) {
    const ranked = rankSearchTerms(terms);
    const condition = ranked[0];
    if (!condition || condition.length < 5) return [];
    const focus = [];
    for (const modifier of ranked.slice(1)) {
        if (focus.length >= 3) break;
        focus.push(`${condition} ${modifier}`);
    }
    for (let i = 0; i < terms.length - 1; i++) {
        const pair = `${terms[i]} ${terms[i + 1]}`;
        if (pair.includes(condition) && pair !== condition && !focus.includes(pair)) {
            focus.unshift(pair); // e.g. "acute cholangitis"
            break;
        }
    }
    return focus.slice(0, 4);
}

function createRetrievalPlan(query, sessionState = {}) {
    const intent = query.intent || 'clinical_management';
    const terms = query.search_terms || [];
    const baseQuery = query.normalized_query || terms.join(' ') || query.condition || '';
    // Focused fallback: the longest (most discriminating) clinical terms only.
    const coreQuery = rankSearchTerms(terms).slice(0, 6).join(' ') || baseQuery;
    const focusQueries = buildFocusQueries(terms);
    const current = query.temporal_request === 'current';
    const plans = [];
    const addPlan = (sourceFamily, sourceId, queries, maxCandidates) => {
        const source = getSource(sourceId);
        if (source?.enabled) plans.push({ source_family: sourceFamily, source_id: sourceId, queries, max_candidates: maxCandidates });
    };
    if (['guideline_question', 'clinical_management', 'diagnosis_question', 'drug_question', 'latest_evidence', 'complex_case', 'follow_up'].includes(intent)) {
        // Internal curated RAG first (spec §3/§26: search_internal_knowledge),
        // then external adapters. Unimplemented registry entries are never planned.
        addPlan('guidelines', 'internal_knowledge', [coreQuery || baseQuery, baseQuery], 5);
        addPlan('guidelines', 'europe_pmc', [baseQuery + ' guideline', coreQuery, ...focusQueries.slice(0, 2)], 20);
        addPlan('literature', 'europe_pmc', [baseQuery, ...focusQueries], 15);
    }
    if (['research_question', 'latest_evidence', 'complex_case'].includes(intent)) {
        addPlan('literature', 'pubmed', [baseQuery, coreQuery], 25);
        addPlan('trials', 'clinicaltrials_gov', [baseQuery, coreQuery], 10);
    }
    if (intent === 'drug_question' || query.medications?.length) {
        addPlan('regulatory', 'fda', [baseQuery + ' label warnings', coreQuery], 10);
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
