const test = require('node:test');
const assert = require('node:assert/strict');
const { interpretClinicalQuery } = require('../services/clinicalQueryInterpreter');
const { normalizeClinicalQueryForRetrieval } = require('../services/clinicalQueryNormalizationService');

const successfulTranslation = async () => JSON.stringify({
    primary_condition: 'sacroiliitis',
    medications: [],
    drug_classes: [],
    symptoms: [],
    search_query: 'sacroiliitis diagnosis treatment',
    confidence: 0.96,
    ambiguous: false,
});

test('known Arabic conditions are normalized deterministically without a model call', async () => {
    const query = interpretClinicalQuery('ماهي معايير تشخيص التهاب البنكرياس الحاد؟', []);
    let called = false;

    const result = await normalizeClinicalQueryForRetrieval(query, query.raw_query, {
        translateQuery: async () => { called = true; throw new Error('must not run'); },
    });

    assert.equal(called, false);
    assert.equal(result.status, 'OK');
    assert.equal(result.query.condition, 'acute pancreatitis');
    assert.ok(result.query.normalized_query.includes('acute pancreatitis'));
    assert.doesNotMatch(result.query.normalized_query, /\p{Script=Arabic}/u);
});

test('unresolved Arabic terms use a validated AI search translation', async () => {
    const message = 'ماهي معايير تشخيص التهاب المفصل العجزي؟';
    const query = interpretClinicalQuery(message, []);
    const result = await normalizeClinicalQueryForRetrieval(query, message, { translateQuery: successfulTranslation });

    assert.equal(result.status, 'OK');
    assert.equal(result.query.condition, 'sacroiliitis');
    assert.deepEqual(result.query.retrieval_anchors, ['sacroiliitis']);
    assert.match(result.query.normalized_query, /sacroiliitis/);
    assert.doesNotMatch(result.query.normalized_query, /\p{Script=Arabic}/u);
    assert.equal(result.query.raw_query, message);
});

test('low-confidence or ambiguous translations request clarification instead of searching broadly', async () => {
    const message = 'علاج مصطلح طبي غير واضح';
    const query = interpretClinicalQuery(message, []);
    const result = await normalizeClinicalQueryForRetrieval(query, message, {
        translateQuery: async () => ({ primary_condition: 'unknown', search_query: 'treatment', confidence: 0.42, ambiguous: true }),
    });

    assert.equal(result.status, 'CLARIFICATION_REQUIRED');
    assert.equal(result.query.retrieval_anchors.length, 0);
});

test('failed translation preserves a known parsed anchor but never returns raw Arabic as search text', async () => {
    const message = 'ما علاج التهاب المرارة؟';
    const query = interpretClinicalQuery(message, []);
    const result = await normalizeClinicalQueryForRetrieval(query, message, {
        translateQuery: async () => { throw new Error('provider unavailable'); },
    });

    assert.equal(result.status, 'OK');
    assert.equal(result.query.retrieval_anchors[0], 'cholecystitis');
    assert.doesNotMatch(result.query.normalized_query, /\p{Script=Arabic}/u);
});

test('unrecognized Arabic with no model response requests clarification', async () => {
    const message = 'مصطلح مرضي غير معروف';
    const query = interpretClinicalQuery(message, []);
    const result = await normalizeClinicalQueryForRetrieval(query, message, {
        translateQuery: async () => { throw new Error('provider unavailable'); },
    });

    assert.equal(result.status, 'CLARIFICATION_REQUIRED');
});
