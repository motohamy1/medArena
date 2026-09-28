const test = require('node:test');
const assert = require('node:assert/strict');
const { withEmbeddingDeadline } = require('../services/claimVerificationService');

test('semantic claim verification cannot hang the answer pipeline', async () => {
    let aborted = false;
    await assert.rejects(
        withEmbeddingDeadline((signal) => new Promise((resolve, reject) => {
            signal.addEventListener('abort', () => {
                aborted = true;
                reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
            }, { once: true });
        }), 20),
        (error) => error.code === 'EMBEDDING_TIMEOUT',
    );
    assert.equal(aborted, true);
});
