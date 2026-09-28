const test = require('node:test');
const assert = require('node:assert/strict');
const { createRetrievalPlan, TIME_BUDGETS_MS } = require('../services/retrievalPlanner');

test('retrieval plan invokes each evidence source family once per round', () => {
    const plan = createRetrievalPlan({ intent: 'clinical_management', complexity: 'NORMAL', condition: 'hypertension', search_terms: ['hypertension', 'treatment'], normalized_query: 'hypertension treatment' });
    const sourceIds = plan.plans.map((source) => source.source_id);

    assert.equal(new Set(sourceIds).size, sourceIds.length);
    assert.equal(sourceIds.filter((sourceId) => sourceId === 'europe_pmc').length, 1);
    assert.equal(plan.max_rounds, 2);
});

test('request retrieval budgets are bounded for every complexity tier', () => {
    assert.deepEqual(TIME_BUDGETS_MS, { SIMPLE: 3500, NORMAL: 6000, DEEP: 8000 });
});
