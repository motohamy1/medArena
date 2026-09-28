// Retrieval benchmark runner (spec §66/§67). Measures evidence status,
// source-type recall, and latency against a running /api/chat/v2.
// Usage: node scripts/run-retrieval-benchmark.js [baseUrl] [goldSetPath]
const fs = require('fs');
const path = require('path');
const { evaluateBenchmarkResult } = require('./benchmark-evaluator');

const BASE_URL = process.argv[2] || process.env.CHAT_TEST_URL || 'http://localhost:3011';
const GOLD_PATH = process.argv[3] || path.join(__dirname, '..', 'backend', 'tests', 'gold-set.json');

(async () => {
    const gold = JSON.parse(fs.readFileSync(GOLD_PATH, 'utf8'));
    const results = [];
    for (const item of gold.queries) {
        const startedAt = Date.now();
        let data = {};
        let status = 'ERROR';
        let httpStatus = 0;
        try {
            const history = (item.history || []).map((text, index) => ({ text, isUser: index % 2 === 0 }));
            const requestId = `bench_${item.id}_${Date.now().toString(36)}`;
            const response = await fetch(`${BASE_URL}/api/chat/v2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId },
                body: JSON.stringify({ message: item.q, history }),
                signal: AbortSignal.timeout(30000),
            });
            httpStatus = response.status;
            data = await response.json();
            status = data.evidence?.status || 'UNKNOWN';
        } catch (error) {
            status = `ERROR:${error.message.slice(0, 60)}`;
        }
        const evaluation = evaluateBenchmarkResult(item, data);
        const latency = Date.now() - startedAt;
        const timing = data.timing?.stages?.map((stage) => `${stage.stage}:${stage.duration_ms}`).join(',') || '';
        results.push({ id: item.id, status, http_status: httpStatus, latency_ms: latency, ...evaluation, timing });
        console.log(`${evaluation.pass ? 'PASS' : 'FAIL'} ${item.id} http=${httpStatus} status=${status} ${latency}ms sources=${evaluation.source_count} stages=[${timing}] issues=[${evaluation.errors.join(',')}]`);
    }

    const passed = results.filter((r) => r.pass).length;
    const avgLatency = Math.round(results.reduce((sum, r) => sum + r.latency_ms, 0) / (results.length || 1));
    console.log(`\nEnd-to-end quality (status + source relevance + claim links): ${passed}/${results.length}`);
    console.log(`Average latency: ${avgLatency}ms`);
})();
