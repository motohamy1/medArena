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

async function checkDatabase() {
    if (!supabase) return { database: false, internalRag: false };
    try {
        const { error } = await supabase.from('custom_knowledge').select('id', { count: 'exact', head: true });
        const database = !error;
        return { database, internalRag: database };
    } catch {
        return { database: false, internalRag: false };
    }
}

// /api/system/status
router.get('/status', async (_req, res) => {
    const startedAt = Date.now();
    const { database, internalRag } = await checkDatabase();
    const health = getSourceHealthSnapshot();
    const sourceHealthy = (key) => (health[key] ? health[key].healthy : true); // untested sources report enabled
    res.json({
        backend: true,
        database,
        embedding: Boolean(process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY),
        internalRag,
        pubmed: sourceHealthy('pubmed'),
        europePmc: sourceHealthy('europe_pmc'),
        clinicalTrials: sourceHealthy('clinicaltrials_gov'),
        regulatory: sourceHealthy('fda'),
        aiProvider: Boolean(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY),
        checked_at: new Date().toISOString(),
        latency_ms: Date.now() - startedAt,
    });
});

module.exports = router;
