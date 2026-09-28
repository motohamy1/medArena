const test = require('node:test');
const assert = require('node:assert/strict');
const {
    getQueryTokens,
    computeRelevance,
    isRelevantLiterature,
} = require('../services/medicalSearchService');
const { normalizeLegacyResult, isEvidenceRelevant } = require('../services/evidenceRetrievalService');

test('Arabic clinical terms survive tokenization while intent words are discarded', () => {
    const tokens = getQueryTokens('ماهي معايير تشخيص التهاب البنكرياس الحاد؟');

    assert.deepEqual(tokens, ['التهاب', 'البنكرياس', 'الحاد']);
});

test('a query with no discriminative terms cannot receive neutral relevance', () => {
    assert.equal(computeRelevance('Unrelated engineering article', []), 0);
    assert.equal(isRelevantLiterature({ title: 'A clinical treatment system', abstract: 'A generic paper.' }, 'treatment guideline'), false);
});

test('Arabic-only queries fail closed against unrelated English literature', () => {
    const unrelated = {
        title: 'Machine-learning treatment optimization in software systems',
        abstract: 'An engineering method for optimizing treatment workflows.',
    };

    assert.equal(isRelevantLiterature(unrelated, 'علاج التهاب البنكرياس الحاد'), false);
});

test('clinical disease anchors match while generic-word overlap does not', () => {
    const relevant = {
        title: 'Diagnostic criteria for acute pancreatitis',
        abstract: 'Evidence-based evaluation of acute pancreatitis in adults.',
    };
    const unrelated = {
        title: 'Acute optimization of treatment systems',
        abstract: 'A generic method for evaluating clinical workflows.',
    };

    assert.equal(isRelevantLiterature(relevant, 'acute pancreatitis diagnostic criteria'), true);
    assert.equal(isRelevantLiterature(unrelated, 'acute pancreatitis diagnostic criteria'), false);
});

test('an explicit zero relevance score is never replaced by a positive default', () => {
    const normalized = normalizeLegacyResult({
        source: 'Europe PMC / PubMed',
        title: 'Unrelated paper',
        abstract: 'No matching concepts.',
        relevance_score: 0,
    });

    assert.equal(normalized.relevance_score, 0);
});

test('retrieval relevance uses the primary disease, not obesity as a modifier', () => {
    const query = {
        condition: 'obesity',
        conditions: [{ concept: 'obesity' }, { concept: 'hypertension' }],
        normalized_query: 'hypertension obesity treatment',
    };

    assert.equal(isEvidenceRelevant({ title: 'Hypertension treatment in adults', content: 'Guideline for hypertension.' }, query), true);
    assert.equal(isEvidenceRelevant({ title: 'Obesity management in adults', content: 'Weight management guideline.' }, query), false);
});

test('retrieval evidence with no canonical anchor is rejected', () => {
    assert.equal(isEvidenceRelevant({ title: 'Treatment algorithms', content: 'A general review.' }, { normalized_query: 'treatment guideline' }), false);
});
