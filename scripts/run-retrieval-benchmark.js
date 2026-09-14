// Retrieval benchmark runner (spec §66/§67). Measures evidence status,
// source-type recall, and latency against a running /api/chat/v2.
// Usage: node scripts/run-retrieval-benchmark.js [baseUrl] [goldSetPath]
const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2] || process.env.CHAT_TEST_URL || 'http://localhost:3011';
const GOLD_PATH = process.argv[3] || path.join(__dirname, '..', 'backend', 'tests', 'gold-set.json');

(async () => {
    const gold = JSON.parse(fs.readFileSync(GOLD_PATH, 'utf8'));
    const results = [];
    for (const item of gold.queries) {
        const startedAt = Date.now();
        let status = 'ERROR';
        let sourceTypes = [];
        try {
            const history = (item.history || []).map((text, index) => ({ text, isUser: index % 2 === 0 }));
            const response = await fetch(`${BASE_URL}/api/chat/v2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: item.q, history }),
                signal: AbortSignal.timeout(150000),
            });
            const data = await response.json();
            status = data.evidence?.status || 'UNKNOWN';
            sourceTypes = [...new Set((data.sources || []).map((s) => s.source_type))];
        } catch (error) {
            status = `ERROR:${error.message.slice(0, 60)}`;
        }
        const abstained = ['NO_EVIDENCE', 'SYSTEM_FAILURE'].includes(status);
        const statusOk = item.expected_status === 'abstain' ? abstained : !abstained;
        const typesOk = (item.expected_source_types || []).length === 0 || (item.expected_source_types || []).some((t) => sourceTypes.includes(t));
        results.push({ id: item.id, status, latency_ms: Date.now() - startedAt, status_ok: statusOk, source_types_ok: typesOk, source_types: sourceTypes });
        console.log(`${statusOk && typesOk ? 'PASS' : 'FAIL'} ${item.id} status=${status} ${(Date.now() - startedAt)}ms types=[${sourceTypes.join(',')}]`);
    }

    const statusOk = results.filter((r) => r.status_ok).length;
    const typesOk = results.filter((r) => r.source_types_ok).length;
    const avgLatency = Math.round(results.reduce((sum, r) => sum + r.latency_ms, 0) / (results.length || 1));
    console.log(`\nAbstention/status accuracy: ${statusOk}/${results.length}`);
    console.log(`Source-type recall: ${typesOk}/${results.length}`);
    console.log(`Average latency: ${avgLatency}ms`);
})();
