const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateBenchmarkResult } = require('../../scripts/benchmark-evaluator');

const answerCase = {
    id: 'quality-positive',
    expected_status: 'VERIFIED|PARTIAL',
    q: 'What are diagnostic criteria for acute pancreatitis?',
};
const relevantSource = {
    id: 'pmc_123',
    title: 'Diagnostic criteria for acute pancreatitis',
    source_type: 'literature',
    excerpt: 'Acute pancreatitis is diagnosed using established clinical and laboratory criteria.',
    url: 'https://example.org/123',
};

function response(overrides = {}) {
    return {
        answer: { text: 'Acute pancreatitis is diagnosed using the stated criteria.' },
        evidence: { status: 'PARTIAL' },
        query_metadata: { retrieval_anchors: ['acute pancreatitis'] },
        sources: [relevantSource],
        claims: [{ id: 'claim_1', text: 'Acute pancreatitis uses stated criteria.', support_level: 'SUPPORTED', source_ids: ['pmc_123'] }],
        ...overrides,
    };
}

test('benchmark requires exact expected status and relevant, resolvable citations', () => {
    assert.equal(evaluateBenchmarkResult(answerCase, response()).pass, true);

    const unrelated = response({ sources: [{ ...relevantSource, title: 'Unrelated software treatment workflow', excerpt: 'An unrelated optimization system with no clinical condition.' }] });
    const result = evaluateBenchmarkResult(answerCase, unrelated);
    assert.equal(result.pass, false);
    assert.ok(result.errors.some((error) => error.startsWith('no_source_for_anchor:')));
});

test('infrastructure failure cannot pass a case whose expected outcome is abstention', () => {
    const result = evaluateBenchmarkResult({ ...answerCase, expected_status: 'abstain' }, {
        answer: { text: 'Backend unavailable' },
        evidence: { status: 'SYSTEM_FAILURE' },
        sources: [],
        claims: [],
    });
    assert.equal(result.pass, false);
    assert.ok(result.errors.includes('unexpected_status:SYSTEM_FAILURE'));
});

test('abstentions cannot expose source cards or material claims', () => {
    const result = evaluateBenchmarkResult({ ...answerCase, expected_status: 'abstain' }, {
        answer: { text: 'No relevant evidence.' },
        evidence: { status: 'NO_RELEVANT_EVIDENCE' },
        sources: [relevantSource],
        claims: [{ id: 'claim_1', text: 'An unsupported claim.', source_ids: [] }],
    });
    assert.equal(result.pass, false);
    assert.ok(result.errors.includes('abstention_contains_sources'));
    assert.ok(result.errors.includes('abstention_contains_claims'));
});

test('unsupported or unlinked claims fail benchmark quality', () => {
    const result = evaluateBenchmarkResult(answerCase, response({
        claims: [{ id: 'claim_2', text: 'Unsupported clinical advice.', support_level: 'UNSUPPORTED', source_ids: ['missing'] }],
    }));
    assert.equal(result.pass, false);
    assert.ok(result.errors.some((error) => error.startsWith('unsupported_claim:')));
    assert.ok(result.errors.some((error) => error.startsWith('unlinked_claim:')));
});
