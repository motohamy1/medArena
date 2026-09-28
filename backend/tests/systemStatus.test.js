const test = require('node:test');
const assert = require('node:assert/strict');
const { checkDatabase, checkDatabaseWithClient, sourceStatus } = require('../routes/systemRoutes');

test('unconfigured database status is explicit', async () => {
    const result = await checkDatabase(20);
    assert.equal(result.databaseConfigured, false);
    assert.equal(result.database, false);
});

test('database diagnostic times out quickly and aborts the Supabase request', async () => {
    let aborted = false;
    const client = {
        from() {
            return {
                select() { return this; },
                abortSignal(signal) {
                    signal.addEventListener('abort', () => { aborted = true; }, { once: true });
                    return new Promise(() => {});
                },
            };
        },
    };

    const startedAt = Date.now();
    const result = await checkDatabaseWithClient(client, 20);
    assert.equal(result.database, false);
    assert.equal(result.timedOut, true);
    assert.equal(aborted, true);
    assert.ok(Date.now() - startedAt < 250);
});

test('untested sources are reported as untested, not falsely healthy', () => {
    assert.deepEqual(sourceStatus({}, 'pubmed'), {
        healthy: null,
        state: 'UNTESTED',
        last_error_type: null,
        tested: false,
    });
});
