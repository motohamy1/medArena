// Regression: composer output must never ship prompt-context markers, empty
// text, or strip-residue as a VERIFIED answer.
//
// Observed in production (2026-10-03): the composer model sometimes echoes the
// trailing evidence-context marker ("[END SOURCE 2] 1.4]"). The honest
// limitation sentence was then classified as a material claim, marked
// UNSUPPORTED, and stripped — leaving the marker fragment as the whole answer
// with status VERIFIED. The client rejects empty text as SYSTEM_FAILURE
// [missing_answer_text] and would render marker fragments as garbage.
//
// Run: node --test tests/
const test = require('node:test');
const assert = require('assert');
const { composeEvidenceAnswer } = require('../services/clinicalAnswerComposer');
const { extractMaterialClaims } = require('../services/claimExtractionService');

const EVIDENCE = [{
    id: 'ev1',
    title: 'Amoxicillin prophylaxis for dental implant placement',
    content: 'amoxicillin prophylaxis for dental implant placement; single preoperative oral dose',
    url: 'https://example.org/ev1',
    evidence_depth: 'abstract',
    source_type: 'literature',
}];
const SUFFICIENCY = { status: 'VERIFIED', score: 1, missing: [] };
const QUERY = {
    raw_query: 'What is the dose of amoxicillin for a 4-year-old with otitis media?',
    intent: 'drug_question',
};

test('limitation statements about the evidence are not treated as material claims', () => {
    const claims = extractMaterialClaims('The evidence is insufficient for the dose of amoxicillin for a 4-year-old with otitis media.');
    assert.equal(claims.length, 0);
});

test('first-person inability statements are not treated as material claims', () => {
    const claims = extractMaterialClaims('I am unable to provide the dose of amoxicillin for a 4-year-old with otitis media, as the supplied evidence does not contain information on this specific use or pediatric dosing for otitis media.');
    assert.equal(claims.length, 0);
});

test('clinical recommendations are still extracted as material claims', () => {
    const claims = extractMaterialClaims('Thiazide-type diuretics are recommended as an initial treatment option for hypertension.');
    assert.equal(claims.length, 1);
});

test('composer keeps the honest limitation sentence and drops echoed context markers', async () => {
    const draft = 'The evidence is insufficient for the dose of amoxicillin for a 4-year-old with otitis media. [END SOURCE 2] 1.4]';
    const response = await composeEvidenceAnswer({ query: QUERY, evidence: EVIDENCE, sufficiency: SUFFICIENCY, draftText: draft });
    assert.ok(response.answer.text.includes('insufficient'), `answer kept: ${response.answer.text}`);
    assert.ok(!/\[(?:END )?SOURCE/i.test(response.answer.text), `no context markers: ${response.answer.text}`);
    assert.ok(!response.limitations.includes('composer_output_invalid'), 'not treated as a failure');
});

test('marker-only composer output never ships as an answer', async () => {
    const response = await composeEvidenceAnswer({ query: QUERY, evidence: EVIDENCE, sufficiency: SUFFICIENCY, draftText: '[END SOURCE 2]' });
    assert.equal(response.evidence.status, 'SYSTEM_FAILURE');
    assert.equal(response.evidence.retryable, true);
    assert.ok(response.limitations.includes('composer_output_invalid'));
    assert.ok(!/\[(?:END )?SOURCE/i.test(response.answer.text), `no context markers: ${response.answer.text}`);
});
