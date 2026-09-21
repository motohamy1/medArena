// Benchmark runner (spec V3 §103): executes tests/gold-set.json against a
// live /api/chat/v2 and reports per-category interpretation/retrieval results.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
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
        let sources = 0;
        let answer = '';
        let ms = 0;
        try {
            const res = await fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: item.q, history }) });
            const data = await res.json();
            ms = Date.now() - started;
            status = data.evidence?.status || data.error?.code || 'UNKNOWN';
            sources = (data.sources || []).length;
            answer = (data.answer?.text || data.error?.message || '').slice(0, 80).replace(/\n/g, ' ');
            if (data.answer?.text) answerStubs[item.id] = data.answer.text;
        } catch (error) {
            ms = Date.now() - started;
            answer = error.message;
        }
        await sleep(800); // spacing: avoid rate-limit storms during the sweep
        const expected = item.expected_status;
        const pass = expected === 'abstain'
            ? ['NO_RELEVANT_EVIDENCE', 'NO_EVIDENCE', 'SOURCE_UNAVAILABLE', 'SYSTEM_FAILURE', 'RETRIEVAL_TIMEOUT'].includes(status)
            : expected.includes(status) || (expected === 'abstain_or_clarify' && status === 'CLARIFICATION_REQUIRED');
        console.log(`${pass ? 'PASS' : 'FAIL'} ${item.id.padEnd(9)} ${status.padEnd(22)} ${String(ms).padStart(6)}ms src=${String(sources).padStart(2)} | ${answer}`);
    }
})();
