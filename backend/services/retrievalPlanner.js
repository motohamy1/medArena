const { getSource } = require('../config/sourceRegistry');
const { rankSearchTerms } = require('./clinicalQueryInterpreter');

const BUDGETS = Object.freeze({ guideline_question: 20, drug_question: 20, diagnosis_question: 20, latest_evidence: 30, research_question: 60, complex_case: 40, clinical_management: 20, follow_up: 20 });

// Request-level time budgets (spec §33). Targets, not arbitrary kill switches:
// per-source timeouts (sourceHealthService) remain independent.
const TIME_BUDGETS_MS = Object.freeze({ SIMPLE: 4000, NORMAL: 8000, DEEP: 12000 });

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

// Spec §53: query formulation is adapted per source family — guidelines want
// recommendation phrasing, literature wants study phrasing, regulatory wants
// label phrasing. Not one identical string to every source.
function sourceSpecificQueries(sourceId, baseQuery, coreQuery, focusQueries) {
    switch (sourceId) {
        case 'internal_knowledge':
            return [baseQuery, coreQuery].filter(Boolean);
        case 'europe_pmc':
            return [`${baseQuery} practice guideline`, coreQuery, ...focusQueries.slice(0, 2)].filter(Boolean);
        case 'pubmed':
            return [`${baseQuery} systematic review`, coreQuery].filter(Boolean);
        case 'clinicaltrials_gov':
            return [`${baseQuery} intervention trial`, coreQuery].filter(Boolean);
        case 'fda':
            return [`${baseQuery} label warnings`, coreQuery].filter(Boolean);
        default:
            return [baseQuery, coreQuery].filter(Boolean);
    }
}

function createRetrievalPlan(query, sessionState = {}, tasks = []) {
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
        addPlan('guidelines', 'internal_knowledge', sourceSpecificQueries('internal_knowledge', baseQuery, coreQuery, focusQueries), 5);
        addPlan('guidelines', 'europe_pmc', sourceSpecificQueries('europe_pmc', baseQuery, coreQuery, focusQueries), 20);
        addPlan('literature', 'europe_pmc', sourceSpecificQueries('europe_pmc', baseQuery, coreQuery, focusQueries), 15);
    }
    // PubMed carries abstracts (spec §20) and materially widens coverage for
    // diagnosis/workup questions the internal corpus may not hold.
    if (['diagnosis_question', 'guideline_question', 'clinical_management'].includes(intent)) {
        addPlan('literature', 'pubmed', sourceSpecificQueries('pubmed', baseQuery, coreQuery, focusQueries), 15);
    }
    if (['research_question', 'latest_evidence', 'complex_case'].includes(intent)) {
        addPlan('literature', 'pubmed', sourceSpecificQueries('pubmed', baseQuery, coreQuery, focusQueries), 25);
        addPlan('trials', 'clinicaltrials_gov', sourceSpecificQueries('clinicaltrials_gov', baseQuery, coreQuery, focusQueries), 10);
    }
    if (intent === 'drug_question' || query.medications?.length) {
        addPlan('regulatory', 'fda', sourceSpecificQueries('fda', baseQuery, coreQuery, focusQueries), 10);
    }
    // SIMPLE questions skip the most expensive sources (spec §50): mechanism /
    // definition queries hit internal knowledge + Europe PMC only.
    const complexity = query.complexity || 'NORMAL';
    const trimmedPlans = complexity === 'SIMPLE' ? plans.filter((plan) => plan.source_id !== 'clinicaltrials_gov') : plans;
    return {
        intent,
        complexity,
        tasks,
        plans: trimmedPlans,
        session_state: sessionState,
        retrieval_budget: BUDGETS[intent] || 20,
        minimum_required_authority: intent === 'research_question' ? 2 : 1,
        require_current_evidence: current,
        time_budget_ms: TIME_BUDGETS_MS[complexity] || TIME_BUDGETS_MS.NORMAL,
        max_rounds: intent === 'research_question' || intent === 'complex_case' ? 4 : 3,
        stop_criteria: ['authoritative_source', 'direct_relevance', 'population_match', 'no_unresolved_conflict'],
    };
}

module.exports = { createRetrievalPlan, BUDGETS, TIME_BUDGETS_MS };
