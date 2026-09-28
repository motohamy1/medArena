const test = require('node:test');
const assert = require('node:assert/strict');
const { executeSourceCall } = require('../services/sourceHealthService');

test('source timeouts abort the in-flight adapter instead of leaving background work running', async () => {
    let aborted = false;
    const result = await executeSourceCall('test_abort_source', ({ signal }) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
            aborted = true;
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        }, { once: true });
    }), { timeoutMs: 20, maxRetries: 0 });

    assert.equal(result.error.code, 'RETRIEVAL_TIMEOUT');
    assert.equal(aborted, true);
    assert.equal(result.health.attempts, 1);
});

test('request deadline caps retries and attempt timeouts', async () => {
    let calls = 0;
    const result = await executeSourceCall('test_deadline_source', ({ signal }) => new Promise((resolve, reject) => {
        calls += 1;
        signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })), { once: true });
    }), { timeoutMs: 1000, maxRetries: 2, deadline: Date.now() + 20 });

    assert.equal(calls, 1);
    assert.equal(result.error.code, 'RETRIEVAL_TIMEOUT');
});
