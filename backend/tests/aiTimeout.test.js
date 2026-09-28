const test = require('node:test');
const assert = require('node:assert/strict');
const { withProviderTimeout } = require('../services/aiService');

test('AI provider calls receive an abort when the shared model deadline expires', async () => {
    let aborted = false;
    await assert.rejects(
        withProviderTimeout((signal) => new Promise((resolve, reject) => {
            signal.addEventListener('abort', () => {
                aborted = true;
                reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
            }, { once: true });
        }), Date.now() + 20, 'test-provider'),
        (error) => error.code === 'AI_TIMEOUT',
    );
    assert.equal(aborted, true);
});

test('AI provider wrapper returns a result before its deadline', async () => {
    const value = await withProviderTimeout(async () => 'ok', Date.now() + 1000, 'test-provider');
    assert.equal(value, 'ok');
});
