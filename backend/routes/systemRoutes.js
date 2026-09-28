// Non-secret system diagnostics (V2.1 spec Appendix B.3).
// Reports which subsystems are available so the release APK / developers can
// distinguish "backend unreachable" from "evidence source degraded".
// NEVER exposes API keys, env values, auth headers, or raw payloads.

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { getSourceHealthSnapshot } = require('../services/sourceHealthService');

const router = express.Router();

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    : null;

async function checkDatabaseWithClient(client, timeoutMs = 2000) {
    const controller = new AbortController();
    let timer;
    try {
        let request = client.from('custom_knowledge').select('id', { count: 'exact', head: true });
        if (typeof request.abortSignal === 'function') request = request.abortSignal(controller.signal);
        const timedOut = new Promise((resolve) => {
            timer = setTimeout(() => {
                controller.abort();
                resolve({ error: { message: 'database health check timed out' }, timedOut: true });
            }, timeoutMs);
        });
        const result = await Promise.race([request, timedOut]);
        const database = !result.error;
        return { database, internalRag: database, databaseConfigured: true, timedOut: Boolean(result.timedOut) };
    } catch {
        return { database: false, internalRag: false, databaseConfigured: true, timedOut: false };
    } finally {
        clearTimeout(timer);
    }
}

async function checkDatabase(timeoutMs = 2000) {
    if (!supabase) return { database: false, internalRag: false, databaseConfigured: false, timedOut: false };
    return checkDatabaseWithClient(supabase, timeoutMs);
}

function sourceStatus(health, key) {
    return health[key]
        ? { ...health[key], tested: true }
        : { healthy: null, state: 'UNTESTED', last_error_type: null, tested: false };
}

// /api/system/status
router.get('/status', async (_req, res) => {
    const startedAt = Date.now();
    const databaseStatus = await checkDatabase();
    const health = getSourceHealthSnapshot();
    res.json({
        backend: true,
        ...databaseStatus,
        embeddingConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY),
        aiProviderConfigured: Boolean(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY),
        sources: {
            pubmed: sourceStatus(health, 'pubmed'),
            europePmc: sourceStatus(health, 'europe_pmc'),
            clinicalTrials: sourceStatus(health, 'clinicaltrials_gov'),
            regulatory: sourceStatus(health, 'fda'),
        },
        checked_at: new Date().toISOString(),
        latency_ms: Date.now() - startedAt,
    });
});

module.exports = router;
module.exports.checkDatabase = checkDatabase;
module.exports.checkDatabaseWithClient = checkDatabaseWithClient;
module.exports.sourceStatus = sourceStatus;
