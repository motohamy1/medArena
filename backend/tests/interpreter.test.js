// Spec V3 §70 A–F + §69: interpreter unit tests.
// Run: node --test tests/ (wired via npm test in backend/package.json)
const test = require('node:test');
const assert = require('node:assert');
const { interpretClinicalQuery, normalizeText, detectLanguage, rankSearchTerms, levenshtein } = require('../services/clinicalQueryInterpreter');

const CASE_A_HISTORY = [
    { text: 'female obese in her 50s BP 160/90 not emergency or urgency outpatient what is best treatment?', isUser: true },
    { text: 'Based on retrieved guideline evidence...', isUser: false },
];

test('TEST A: parses female/50s/obesity/BP/setting/negation/temporal', () => {
    const query = interpretClinicalQuery('female obese in her 50s BP 160/90 not emergency or urgency outpatient what is best treatment?', []);
    assert.equal(query.patient.sex, 'female');
    assert.deepEqual(query.patient.age.range, [50, 59]);
    assert.equal(query.patient.obesity, true);
    assert.deepEqual(query.clinical_measurements.blood_pressure, { systolic: 160, diastolic: 90, unit: 'mmHg' });
    assert.equal(query.clinical_setting, 'outpatient');
    assert.equal(query.emergency_context.hypertensive_emergency, false);
    assert.equal(query.emergency_context.explicitly_excluded, true);
    assert.ok(query.conditions.some((c) => c.concept === 'hypertension'));
    assert.equal(query.temporal_request, 'not_specified'); // §11: no fake "current"
});

test('TEST B: inherits context, normalizes typos, keeps CCP ambiguous', () => {
    const query = interpretClinicalQuery('طب هل CCP أحسن ولا dthiazide like diurctic في حالة الـobese؟', CASE_A_HISTORY);
    assert.equal(query.patient.sex, 'female'); // inherited
    assert.deepEqual(query.patient.age.range, [50, 59]); // inherited
    assert.equal(query.patient.obesity, true); // inherited
    assert.ok(query.drug_classes.includes('thiazide')); // dthiazide normalized
    assert.ok(query.drug_classes.includes('diuretic')); // diurctic normalized
    assert.ok(query.question.comparison); // comparison intent
    assert.equal(query.clarification_required, true); // CCP not silently resolved
    assert.ok(query.clarification.question.toLowerCase().includes('calcium channel blocker'));
});

test('TEST C: pregnancy follow-up inherits the case', () => {
    const query = interpretClinicalQuery('طب والحامل؟', CASE_A_HISTORY);
    assert.equal(query.follow_up, true);
    assert.equal(query.patient.pregnancy, true);
    assert.equal(query.patient.sex, 'female');
    assert.ok(query.conditions.some((c) => c.concept === 'hypertension' || c.concept === 'pregnancy'));
});

test('TEST D: cholangitis + vitamin intent detected', () => {
    const query = interpretClinicalQuery('دلوقتي لو adult كان عنده jaundice بسبب acute cholangitis ايه الفيتامينات اللي محتاجها؟', []);
    assert.ok(query.conditions.some((c) => c.concept === 'acute cholangitis'));
    assert.ok(query.search_terms.includes('jaundice'));
    assert.equal(query.intent, 'drug_question');
});

test('TEST E: "dthiazide" resolves to thiazide candidate', () => {
    const query = interpretClinicalQuery('dthiazide', []);
    assert.ok(query.drug_classes.includes('thiazide'));
});

test('TEST F: "مفيش emergency" is explicit negation', () => {
    const query = interpretClinicalQuery('مفيش emergency', []);
    assert.equal(query.emergency_context.hypertensive_emergency, false);
    assert.equal(query.emergency_context.explicitly_excluded, true);
});

test('explicit recency language requests current; otherwise not_specified', () => {
    assert.equal(interpretClinicalQuery('latest recommendations for hypertension treatment', []).temporal_request, 'current');
    assert.equal(interpretClinicalQuery('what was recommended in 2021 for hypertension', []).temporal_request, 'historical');
    assert.equal(interpretClinicalQuery('mechanism of action of metformin', []).temporal_request, 'not_specified');
});

test('negation: مش حامل -> pregnancy false', () => {
    const query = interpretClinicalQuery('مش حامل', []);
    assert.equal(query.patient.pregnancy, false);
});

test('age decade phrasing: 50th decade -> range 50-59, no fabricated exact age', () => {
    const query = interpretClinicalQuery('female in her 50th decade with hypertension', []);
    assert.deepEqual(query.patient.age.range, [50, 59]);
    assert.equal(query.patient.age.value, null);
});

test('BP parsing plausibility: rejects impossible readings', () => {
    const query = interpretClinicalQuery('bp 30/20 what to do', []);
    assert.equal(query.clinical_measurements.blood_pressure, null);
});

test('utilities', () => {
    assert.equal(normalizeText('Hello,  World!'), 'hello world');
    assert.equal(detectLanguage('ضغط 160/90 with amlodipine').mixed, true);
    assert.deepEqual(rankSearchTerms(['a', 'chronic kidney disease']), ['chronic kidney disease', 'a']);
    assert.equal(levenshtein('diurctic', 'diuretic'), 1);
    assert.equal(levenshtein('dthiazide', 'thiazide'), 1);
});

test('primary disease outranks obesity and pregnancy modifiers', () => {
    const query = interpretClinicalQuery('female obese in her 50s with hypertension, best outpatient treatment?', []);
    assert.equal(query.condition, 'hypertension');
});

test('Arabic acute pancreatitis is resolved as a canonical disease', () => {
    const query = interpretClinicalQuery('ماهي معايير تشخيص التهاب البنكرياس الحاد؟', []);
    assert.equal(query.condition, 'acute pancreatitis');
    assert.ok(query.search_terms.includes('acute pancreatitis'));
});

test('comparison follow-up keeps the established disease as its retrieval anchor', () => {
    const query = interpretClinicalQuery('طب هل CCB أحسن ولا thiazide like diuretic في حالة الـobese؟', CASE_A_HISTORY);
    assert.equal(query.condition, 'hypertension');
});
