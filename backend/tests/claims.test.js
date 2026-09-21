// Spec V3 §70 G–J + §71: retrieval, sufficiency, claims, contract units.
// Run: node --test tests/
const test = require('node:test');
const assert = require('assert');
const { applyFreshness } = require('../services/evidenceRetrievalService');
const { assessEvidenceSufficiency, buildCoverageMatrix } = require('../services/evidenceSufficiencyService');
const { verifyClaims, extractNumbers } = require('../services/claimVerificationService');
const { extractMaterialClaims } = require('../services/claimExtractionService');
const { stripUnsupportedClaims } = require('../services/clinicalAnswerComposer');
const { createAbstentionResponse, createClarificationResponse, buildErrorResponse } = require('../models/responseContracts');
const { decomposeClinicalTask } = require('../services/clinicalTaskDecomposer');
const { interpretClinicalQuery } = require('../services/clinicalQueryInterpreter');

const FIVE_YEARS_AGO = new Date(Date.now() - 5 * 365.25 * 24 * 3600 * 1000).toISOString().slice(0, 10);
const NOW = new Date().toISOString().slice(0, 10);

// ── Freshness (§0.4/§15): never fabricate currency ──
test('freshness: recent publication -> recent, not current', () => {
    const item = applyFreshness({ publication_date: NOW, title: 'x' }, {});
    assert.equal(item.freshness, 'recent');
    assert.equal(item.is_current, false);
});
test('freshness: old publication -> old', () => {
    const item = applyFreshness({ publication_date: FIVE_YEARS_AGO, title: 'x' }, {});
    assert.equal(item.freshness, 'old');
});
test('freshness: unknown date -> unknown (never converted to current)', () => {
    const item = applyFreshness({ title: 'x' }, {});
    assert.equal(item.freshness, 'unknown');
    assert.equal(item.is_current, false);
});

// ── Sufficiency (§6/§32): failure classes are distinct ──
test('empty evidence with working search -> NO_RELEVANT_EVIDENCE', () => {
    const result = assessEvidenceSufficiency([], {}, {});
    assert.equal(result.status, 'NO_RELEVANT_EVIDENCE');
});
test('source failure -> SOURCE_UNAVAILABLE (not no-evidence)', () => {
    const result = assessEvidenceSufficiency([], {}, { sourceUnavailable: true });
    assert.equal(result.status, 'SOURCE_UNAVAILABLE');
});
test('infrastructure failure -> SYSTEM_FAILURE', () => {
    const result = assessEvidenceSufficiency([], {}, { systemFailure: true });
    assert.equal(result.status, 'SYSTEM_FAILURE');
});
test('currency required but evidence only old -> OUTDATED', () => {
    const evidence = [{ authority_tier: 1, relevance_score: 0.9, freshness: 'old', is_current: false, content: 'x' }];
    const query = { temporal_request: 'current' };
    const result = assessEvidenceSufficiency(evidence, query, {});
    assert.equal(result.status, 'OUTDATED');
    assert.ok(result.missing.includes('current_evidence'));
});
test('recent evidence accepted when currency requested', () => {
    const evidence = [{ authority_tier: 1, relevance_score: 0.9, freshness: 'recent', content: 'x' }];
    const result = assessEvidenceSufficiency(evidence, { temporal_request: 'current' }, {});
    assert.ok(['VERIFIED', 'PARTIAL'].includes(result.status));
});
test('stated demographics with no matching population -> population_match missing', () => {
    const evidence = [{ authority_tier: 1, relevance_score: 0.9, freshness: 'recent', content: 'general management advice' }];
    const query = { patient: { pregnancy: true }, temporal_request: 'not_specified' };
    const result = assessEvidenceSufficiency(evidence, query, {});
    assert.ok(result.missing.includes('population_match'));
});

// ── Coverage matrix (§22/§26) ──
test('coverage matrix: supported/partial/unsupported per task', () => {
    const tasks = [
        { task_id: 't1', question: 'first line classes', queries: ['first line classes'] },
        { task_id: 't2', question: 'pregnancy modifiers', queries: ['pregnancy safety'] },
    ];
    const evidence = [
        { id: 'e1', title: 'first line treatment classes', content: 'recommended first line classes include thiazide and ccb', relevance_score: 0.9, freshness: 'recent' },
        { id: 'e2', title: 'obesity outcomes', content: 'obesity treatment outcomes', relevance_score: 0.8, freshness: 'recent' },
    ];
    const matrix = buildCoverageMatrix(tasks, evidence);
    assert.equal(matrix[0].coverage, 'supported');
    assert.equal(matrix[1].coverage, 'unsupported');
});

// ── Claim verification (§24–§26, §29) ──
test('TEST J: supported claim kept, unsupported claim removed', () => {
    const evidence = [{
        id: 'ev1', title: 'Hypertension guideline', content: 'thiazide-type diuretics are recommended as an initial treatment option for hypertension', relevance_score: 0.9, freshness: 'recent',
    }];
    const claims = extractMaterialClaims('Thiazide-type diuretics are recommended as an initial treatment option. Chlorthalidone doses should be 999 mg daily.');
    const verified = verifyClaims(claims, evidence, [], 'bp 160/90');
    const supported = verified.filter((claim) => claim.support_level !== 'UNSUPPORTED');
    const unsupported = verified.filter((claim) => claim.support_level === 'UNSUPPORTED');
    assert.equal(supported.length, 1);
    assert.equal(unsupported.length, 1); // invented 999 mg number has no evidence
});

test('numeric safety: invented dose numbers -> UNSUPPORTED (§26/§29)', () => {
    const evidence = [{ id: 'ev1', content: 'recommended dose is 5 mg once daily', relevance_score: 0.9 }];
    const claims = [{ id: 'c1', text: 'The recommended dose is 50 mg once daily for this patient.' }];
    const verified = verifyClaims(claims, evidence, [], 'bp 160/90');
    assert.equal(verified[0].support_level, 'UNSUPPORTED');
    assert.equal(verified[0].reason, 'unsupported_numbers');
});

test('negation inversion: claim contradicts evidence polarity -> UNSUPPORTED', () => {
    const evidence = [{ id: 'ev1', content: 'ACE inhibitors are contraindicated in pregnancy and should not be used.', relevance_score: 0.9 }];
    const claims = [{ id: 'c1', text: 'ACE inhibitors are recommended and safe to use in pregnancy.' }];
    const verified = verifyClaims(claims, evidence, [], '');
    assert.equal(verified[0].support_level, 'UNSUPPORTED');
});

test('metadata-only evidence cannot directly support claims (§20)', () => {
    const evidence = [{ id: 'ev1', title: 'Some title mentioning thiazide', content: 'thiazide', evidence_depth: 'metadata_only', relevance_score: 0.9 }];
    const claims = [{ id: 'c1', text: 'Thiazide diuretics are recommended as initial treatment for hypertension.' }];
    const verified = verifyClaims(claims, evidence, [], '');
    assert.notEqual(verified[0].support_level, 'SUPPORTED_DIRECT');
});

test('extractNumbers', () => {
    assert.deepEqual(extractNumbers('dose 5 mg twice, BP 160/90'), [5, 160, 90]);
});

// ── Composer strip (§0.5): removal, not appended disclaimer ──
test('stripUnsupportedClaims removes unsupported sentences from draft', () => {
    const draft = 'Use thiazide as first line. The dose is 999 mg twice daily which is a made up dosing schedule.';
    const claims = [
        { id: 'c1', text: 'Use thiazide as first line.', support_level: 'SUPPORTED_DIRECT', source_ids: ['e1'] },
        { id: 'c2', text: 'The dose is 999 mg twice daily which is a made up dosing schedule.', support_level: 'UNSUPPORTED', source_ids: [] },
    ];
    const { text, removedCount } = stripUnsupportedClaims(draft, claims);
    assert.equal(removedCount, 1);
    assert.ok(!text.includes('999 mg'));
    assert.ok(text.includes('Use thiazide as first line'));
});

// ── Response contract (§28/§32/§38) ──
test('abstention responses carry distinct statuses', () => {
    const noRelevant = createAbstentionResponse({ status: 'NO_RELEVANT_EVIDENCE' });
    const sourceDown = createAbstentionResponse({ status: 'SOURCE_UNAVAILABLE', retryable: true });
    assert.equal(noRelevant.evidence.status, 'NO_RELEVANT_EVIDENCE');
    assert.equal(sourceDown.evidence.status, 'SOURCE_UNAVAILABLE');
    assert.equal(sourceDown.evidence.retryable, true);
    assert.notEqual(noRelevant.answer.text, sourceDown.answer.text);
});

test('clarification response shape (§43/§105)', () => {
    const response = createClarificationResponse({ clarification: { question: 'Did you mean calcium channel blocker?' } });
    assert.equal(response.evidence.status, 'CLARIFICATION_REQUIRED');
    assert.ok(response.answer.text.includes('calcium channel blocker'));
});

test('structured error body (§38)', () => {
    const body = buildErrorResponse({ code: 'PUBMED_TIMEOUT', message: 'PubMed retrieval timed out', retryable: true });
    assert.equal(body.error.code, 'PUBMED_TIMEOUT');
    assert.equal(body.error.retryable, true);
});
