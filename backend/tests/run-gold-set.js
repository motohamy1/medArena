// Benchmark runner (spec V3 §103): executes tests/gold-set.json against a
// live /api/chat/v2 and reports per-category interpretation/retrieval results.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { evaluateBenchmarkResult } = require('../../scripts/benchmark-evaluator');
const BASE = process.env.BENCH_URL || 'http://localhost:3001/api/chat/v2';
(async () => {
    const gold = JSON.parse(fs.readFileSync(path.join(__dirname, 'gold-set.json'), 'utf8'));
    // Build reference histories: answer stubs for history_ref queries.
    const answerStubs = {};
    const results = [];
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const item of gold.queries) {
        const history = [];
        if (item.history_ref) {
            const parent = gold.queries.find((q) => q.id === item.history_ref);
            if (parent) {
                history.push({ text: parent.q, isUser: true });
                history.push({ text: answerStubs[parent.id] || `Based on retrieved guideline evidence regarding "${parent.q.slice(0, 60)}", the recommended approach is as follows.`, isUser: false });
            }
        }
        const started = Date.now();
        let status = 'HTTP_ERROR';
        let data = {};
        let sources = 0;
        let ms = 0;
        try {
            const requestId = `gold_${item.id}_${Date.now().toString(36)}`;
            const res = await fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId }, body: JSON.stringify({ message: item.q, history }), signal: AbortSignal.timeout(30000) });
            data = await res.json();
            ms = Date.now() - started;
            status = data.evidence?.status || data.error?.code || 'UNKNOWN';
            sources = (data.sources || []).length;
            if (data.answer?.text) answerStubs[item.id] = data.answer.text;
        } catch (error) {
            ms = Date.now() - started;
            status = `ERROR:${error.message.slice(0, 60)}`;
        }
        await sleep(800); // spacing: avoid rate-limit storms during the sweep
        const evaluation = evaluateBenchmarkResult(item, data);
        const stages = data.timing?.stages?.map((stage) => `${stage.stage}:${stage.duration_ms}`).join(',') || '';
        console.log(`${evaluation.pass ? 'PASS' : 'FAIL'} ${item.id.padEnd(9)} ${status.padEnd(22)} ${String(ms).padStart(6)}ms src=${String(sources).padStart(2)} stages=[${stages}] issues=[${evaluation.errors.join(',')}]`);
    }
})();
