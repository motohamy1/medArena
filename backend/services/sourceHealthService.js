// Reliability layer (V2.1 spec Appendix A.2/A.3/A.6, §43):
// - per-attempt timeouts (a timeout applies to a single attempt, never the
//   whole answer lifecycle — the old global 2.5s Promise.race is gone);
// - bounded retries with backoff for transient failures only;
// - per-source circuit breaker (CLOSED -> OPEN -> HALF_OPEN);
// - SourceHealth metadata on every adapter call.
//
// Health metadata is also surfaced (never secrets) via /api/system/status.

const SOURCE_TIMEOUT_MS = {
    internal_knowledge: 4000, // includes Gemini query embedding
    pubmed: 5000,
    europe_pmc: 5000,
    clinicaltrials_gov: 6000,
    fda: 5000,
};
const DEFAULT_TIMEOUT_MS = 5000;
const MAX_RETRIES = 2; // spec §43: max 2 retries for transient errors
const BREAKER_THRESHOLD = 3; // consecutive failures before OPEN
const BREAKER_COOLDOWN_MS = 60000;

const TRANSIENT_CODES = new Set(['RETRIEVAL_TIMEOUT', 'SOURCE_UNAVAILABLE', 'RATE_LIMITED', 'NETWORK_ERROR']);

// sourceId -> { failures, openedAt, state, lastHealth }
const breakers = new Map();

function getBreaker(sourceId) {
    let breaker = breakers.get(sourceId);
    if (!breaker) {
        breaker = { failures: 0, openedAt: 0, state: 'CLOSED', lastHealth: null };
        breakers.set(sourceId, breaker);
    }
    return breaker;
}

function allowAttempt(breaker, now) {
    if (breaker.state === 'OPEN') {
        if (now - breaker.openedAt >= BREAKER_COOLDOWN_MS) {
            breaker.state = 'HALF_OPEN'; // one probe attempt
            return true;
        }
        return false;
    }
    return true;
}

function recordSuccess(breaker) {
    breaker.failures = 0;
    breaker.state = 'CLOSED';
}

function recordFailure(breaker, now) {
    breaker.failures += 1;
    if (breaker.state === 'HALF_OPEN' || breaker.failures >= BREAKER_THRESHOLD) {
        breaker.state = 'OPEN';
        breaker.openedAt = now;
    }
}

function timeoutError(ms) {
    const error = new Error(`Source attempt exceeded ${ms}ms per-attempt timeout`);
    error.code = 'RETRIEVAL_TIMEOUT';
    return error;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Bounded wait on one attempt. Abort the actual adapter as well as the race so
// timed-out fetches do not continue consuming sockets and provider quota.
function withAttemptTimeout(fn, ms) {
    const controller = new AbortController();
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
            controller.abort();
            reject(timeoutError(ms));
        }, ms);
    });
    const attempt = Promise.resolve()
        .then(() => fn({ signal: controller.signal, timeoutMs: ms }))
        .catch((error) => {
            if (controller.signal.aborted || error?.name === 'AbortError') throw timeoutError(ms);
            throw error;
        });
    return Promise.race([attempt, timeout]).finally(() => clearTimeout(timer));
}

function isTransient(error) {
    return TRANSIENT_CODES.has(error && error.code);
}

/**
 * Execute one source adapter call with per-attempt timeout, bounded retries,
 * circuit breaker, and health metadata.
 * @returns {Promise<{result: any, health: object}>}
 */
async function executeSourceCall(sourceId, fn, { timeoutMs, maxRetries = MAX_RETRIES, deadline = null } = {}) {
    const configuredTimeout = timeoutMs || SOURCE_TIMEOUT_MS[sourceId] || DEFAULT_TIMEOUT_MS;
    const breaker = getBreaker(sourceId);
    const now = Date.now();

    if (!allowAttempt(breaker, now)) {
        const health = {
            sourceId,
            status: 'unhealthy',
            errorType: 'CIRCUIT_OPEN',
            checkedAt: new Date(now).toISOString(),
        };
        breaker.lastHealth = health;
        const error = new Error(`Source ${sourceId} skipped: circuit breaker OPEN`);
        error.code = 'SOURCE_UNAVAILABLE';
        error.skipped = true;
        return { result: null, health, error };
    }

    let lastError;
    let attempts = 0;
    const totalStartedAt = Date.now();
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        const remaining = deadline ? deadline - Date.now() : configuredTimeout;
        if (remaining <= 0) {
            lastError = timeoutError(configuredTimeout);
            break;
        }
        const effectiveTimeout = Math.max(1, Math.min(configuredTimeout, remaining));
        const startedAt = Date.now();
        attempts += 1;
        try {
            const result = await withAttemptTimeout(fn, effectiveTimeout);
            recordSuccess(breaker);
            const health = {
                sourceId,
                status: 'healthy',
                latencyMs: Date.now() - startedAt,
                attempts: attempt + 1,
                checkedAt: new Date().toISOString(),
            };
            breaker.lastHealth = health;
            return { result, health };
        } catch (error) {
            lastError = error;
            // Clearly invalid requests (4xx semantics, parse errors) are not
            // retried; only transient failures get bounded backoff (spec §43).
            if (!isTransient(error) || attempt === maxRetries) break;
            const backoffMs = 250 * (attempt + 1);
            if (deadline && Date.now() + backoffMs >= deadline) break;
            await sleep(backoffMs);
        }
    }

    recordFailure(breaker, Date.now());
    const health = {
        sourceId,
        status: 'unhealthy',
        latencyMs: Date.now() - totalStartedAt,
        errorType: (lastError && lastError.code) || 'SOURCE_UNAVAILABLE',
        attempts,
        checkedAt: new Date().toISOString(),
    };
    breaker.lastHealth = health;
    return { result: null, health, error: lastError };
}

// Non-secret snapshot for /api/system/status (spec B.3): booleans only plus
// error type of the last failure. Never include URLs/keys/payloads.
function getSourceHealthSnapshot() {
    const snapshot = {};
    for (const [sourceId, breaker] of breakers.entries()) {
        const health = breaker.lastHealth;
        snapshot[sourceId] = {
            healthy: breaker.state !== 'OPEN' && (!health || health.status !== 'unhealthy'),
            state: breaker.state,
            last_error_type: health && health.status === 'unhealthy' ? health.errorType : null,
        };
    }
    return snapshot;
}

module.exports = { executeSourceCall, getSourceHealthSnapshot, SOURCE_TIMEOUT_MS, withAttemptTimeout };
