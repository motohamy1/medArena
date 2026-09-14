// Contract tests for /api/chat/v2 (spec §65C + §69 adverse subset).
// Usage: node scripts/test-chat-contract.js [baseUrl]
// Defaults to http://localhost:3011; exits non-zero on any contract violation.
const BASE_URL = process.argv[2] || process.env.CHAT_TEST_URL || 'http://localhost:3011';
const EVIDENCE_STATUSES = ['VERIFIED', 'PARTIAL', 'CONFLICTING', 'OUTDATED', 'NO_EVIDENCE', 'SYSTEM_FAILURE'];

let failures = 0;
let passed = 0;

function check(name, condition, detail = '') {
    if (condition) {
        passed++;
        console.log(`  PASS ${name}`);
    } else {
        failures++;
        console.log(`  FAIL ${name} ${detail}`);
    }
}

function validateContract(label, data) {
    check(`${label}: answer.text is string`, typeof data.answer?.text === 'string' && data.answer.text.length > 0);
    check(`${label}: answer.type is string`, typeof data.answer?.type === 'string');
    check(`${label}: sections is array`, Array.isArray(data.answer?.sections));
    check(`${label}: evidence.status valid`, EVIDENCE_STATUSES.includes(data.evidence?.status), `got ${data.evidence?.status}`);
    check(`${label}: evidence.checked_at present`, Boolean(data.evidence?.checked_at));
    check(`${label}: sources array with valid metadata`, Array.isArray(data.sources) && data.sources.every((s) => s.id && s.title && (s.url || s.pmid || s.doi)));
    check(`${label}: claims linked to sources`, Array.isArray(data.claims) && data.claims.every((c) => Array.isArray(c.source_ids)));
    check(`${label}: limitations array`, Array.isArray(data.limitations));
    check(`${label}: query_metadata object`, data.query_metadata && typeof data.query_metadata === 'object');
}

async function post(body) {
    const response = await fetch(`${BASE_URL}/api/chat/v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
    });
    return { status: response.status, data: await response.json().catch(() => ({})) };
}

const CASES = [
    { label: 'greeting', body: { message: 'Hi', history: [] }, expect: (d) => d.answer?.type === 'conversation' && (d.sources || []).length === 0 },
    { label: 'english clinical', body: { message: 'treatment of helicobacter pylori', history: [] }, expect: (d) => !['NO_EVIDENCE', 'SYSTEM_FAILURE'].includes(d.evidence?.status) },
    { label: 'typo-heavy query', body: { message: 'treatment of hylobacter pylori', history: [] }, expect: () => true },
    { label: 'multi-part guideline', body: { message: 'Explain the Tokyo Guidelines 2018 diagnostic criteria and severity grading for Acute Cholangitis, empiric antibiotics, and urgent biliary drainage timing.', history: [] }, expect: (d) => !['SYSTEM_FAILURE'].includes(d.evidence?.status) },
    { label: 'nonsense abstains', body: { message: 'zzz qwerty frumious bandersnatch treatment', history: [] }, expect: (d) => ['NO_EVIDENCE', 'SYSTEM_FAILURE'].includes(d.evidence?.status) },
    { label: 'follow-up', body: { message: 'what about alternative regimens?', history: [{ text: 'treatment of helicobacter pylori', isUser: true }, { text: 'First-line therapy is bismuth quadruple therapy for 14 days.', isUser: false }] }, expect: () => true },
    { label: 'egyptian arabic', body: { message: 'علاج جرثومة المعدة', history: [] }, expect: () => true },
];

(async () => {
    console.log(`Contract tests against ${BASE_URL}`);
    let healthy = false;
    try {
        const health = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(10000) });
        healthy = health.ok;
    } catch { healthy = false; }
    if (!healthy) {
        console.error('Backend unreachable — start it first (cd backend && PORT=3011 node server.js)');
        process.exit(2);
    }

    for (const testCase of CASES) {
        console.log(`\nCASE ${testCase.label}`);
        try {
            const { status, data } = await post(testCase.body);
            check(`${testCase.label}: HTTP 200`, status === 200, `got ${status}`);
            if (status === 200) {
                validateContract(testCase.label, data);
                check(`${testCase.label}: case expectation`, Boolean(testCase.expect(data)));
            }
        } catch (error) {
            failures++;
            console.log(`  FAIL ${testCase.label}: ${error.message}`);
        }
    }

    // Adverse: missing message must 400 with error contract
    console.log('\nCASE missing message');
    const bad = await post({ history: [] });
    check('missing message: HTTP 400', bad.status === 400);
    check('missing message: error code', Boolean(bad.data.code));

    console.log(`\n${passed} passed, ${failures} failed`);
    process.exit(failures ? 1 : 0);
})();
