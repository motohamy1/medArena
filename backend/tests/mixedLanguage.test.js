const test = require('node:test');
const assert = require('node:assert/strict');
const { interpretClinicalQuery } = require('../services/clinicalQueryInterpreter');
const { normalizeClinicalQueryForRetrieval } = require('../services/clinicalQueryNormalizationService');

test('mixed query: extracts English condition without demanding clarification', async () => {
    const text = 'لو مريض عنده pericarditis ايه ال first line treatment؟';
    const query = interpretClinicalQuery(text);
    const normalized = await normalizeClinicalQueryForRetrieval(query, text);

    assert.equal(normalized.status, 'OK');
    assert.ok(normalized.query.retrieval_anchors.includes('pericarditis'));
    assert.ok(normalized.query.search_terms.includes('pericarditis'));
    assert.ok(normalized.query.search_terms.includes('treatment'));
});

test('mixed query: multi-word condition (acute mesenteric ischemia)', async () => {
    const text = 'علاج ال acute mesenteric ischemia؟';
    const query = interpretClinicalQuery(text);
    const normalized = await normalizeClinicalQueryForRetrieval(query, text);

    assert.equal(normalized.status, 'OK');
    assert.ok(normalized.query.retrieval_anchors.includes('acute mesenteric ischemia'));
    assert.ok(normalized.query.search_terms.includes('acute'));
    assert.ok(normalized.query.search_terms.includes('mesenteric'));
    assert.ok(normalized.query.search_terms.includes('ischemia'));
});

test('mixed query: pediatric age with English condition and drug', async () => {
    const text = 'طفل 4 سنين عنده croup ايه ال dose بتاعة dexamethasone؟';
    const query = interpretClinicalQuery(text);
    const normalized = await normalizeClinicalQueryForRetrieval(query, text);

    assert.equal(normalized.status, 'OK');
    assert.ok(normalized.query.retrieval_anchors.length > 0);
    assert.ok(normalized.query.search_terms.includes('croup') || normalized.query.search_terms.includes('dexamethasone'));
    assert.equal(query.patient.age.value, 4);
});

test('mixed query: Egyptian Arabic conversational stops are cleanly stripped from search', async () => {
    const text = 'لو عيان 60 سنة عنده acute pancreatitis ايه ال initial fluid resuscitation؟';
    const query = interpretClinicalQuery(text);
    const normalized = await normalizeClinicalQueryForRetrieval(query, text);

    assert.equal(normalized.status, 'OK');
    assert.ok(normalized.query.retrieval_anchors.includes('acute pancreatitis'));
    // Conversational Arabic stops should not appear in English search query
    assert.ok(!normalized.query.search_terms.includes('عيان'));
    assert.ok(!normalized.query.search_terms.includes('سنة'));
});

test('mixed query: pediatric age + weight + condition + drug passes safety gate and decomposes pediatric tasks', async () => {
    const { assessDosingSafety } = require('../services/clinicalSafetyGate');
    const { decomposeClinicalTask } = require('../services/clinicalTaskDecomposer');

    const text = 'طفل 4 سنين وزنه 16 كيلو عنده croup ايه ال dose بتاعة dexamethasone؟';
    const query = interpretClinicalQuery(text);
    const normalized = await normalizeClinicalQueryForRetrieval(query, text);

    assert.equal(normalized.status, 'OK');
    assert.equal(query.patient.age.value, 4);
    assert.equal(query.patient.weight_kg, 16);
    assert.equal(normalized.query.condition, 'croup');
    assert.ok(normalized.query.medications.includes('dexamethasone'));
    assert.ok(normalized.query.retrieval_anchors.includes('croup'));
    assert.ok(normalized.query.retrieval_anchors.includes('dexamethasone'));

    // Safety gate must NOT demand clarification when age and weight are present
    const safetyCheck = assessDosingSafety(normalized.query);
    assert.equal(safetyCheck, null);

    // Task decomposition must include pediatric queries
    const tasks = decomposeClinicalTask(normalized.query);
    const doseModifierTask = tasks.find((t) => t.task_id === 'dose_modifiers');
    assert.ok(doseModifierTask);
    assert.ok(doseModifierTask.queries.some((q) => q.includes('pediatric')));
});

