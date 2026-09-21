// Evidence cache (spec V3 §35/§64).
//
// Key: canonical clinical representation (sorted canonical terms + patient
// modifiers + measurements) — NOT raw text. Arabic "الضغط 160/90" and English
// "BP 160/90" resolve to the same canonical key because both normalize to the
// same canonical terms via the interpreter lexicon.
//
// Stale entries are never silently passed as live: every hit carries
// cached_at + stale flag so the response can be labeled
// "Previously verified cached evidence — not live refreshed."

const DEFAULT_TTL_MS = Number(process.env.EVIDENCE_CACHE_TTL_MS || 30 * 60 * 1000); // 30 min
const MAX_ENTRIES = Number(process.env.EVIDENCE_CACHE_MAX_ENTRIES || 200);

// sourceId -> Map(key -> entry)
const store = new Map();

function buildCacheKey(query) {
    // Arabic-script surface tokens are excluded: they are un-normalized noise
    // ("الضغط", "العلاج") whose canonical meaning is already captured by the
    // mapped canonical terms + conditions. This lets Arabic and English
    // phrasings of the same clinical question share a cache key.
    const hasArabicScript = (term) => /[\u0600-\u06ff]/.test(term);
    const canonicalTerms = [...new Set([
        ...(query.canonical_terms || query.search_terms || []),
        ...(query.conditions || []).map((c) => c.concept),
    ])]
        .map((term) => String(term).toLowerCase().trim())
        .filter((term) => term.length > 2 && !hasArabicScript(term))
        .sort();
    const patientBits = [
        query.patient?.sex,
        query.patient?.obesity === true ? 'obese' : null,
        query.patient?.pregnancy === true ? 'pregnant' : query.patient?.pregnancy === false ? 'not_pregnant' : null,
        query.patient?.renal_status === 'present' ? 'renal' : null,
        query.patient?.hepatic_status === 'present' ? 'hepatic' : null,
        query.patient?.age?.range ? `age_${query.patient.age.range[0]}-${query.patient.age.range[1] ?? '+'}` : null,
        query.clinical_measurements?.blood_pressure ? `bp_${query.clinical_measurements.blood_pressure.systolic}/${query.clinical_measurements.blood_pressure.diastolic}` : null,
        query.clinical_setting,
        query.intent,
        query.temporal_request === 'current' ? 'currency_current' : 'currency_flex',
    ].filter(Boolean).sort();
    return [...canonicalTerms.slice(0, 12), ...patientBits].join('|');
}

function get(query, { ttlMs = DEFAULT_TTL_MS } = {}) {
    const key = buildCacheKey(query);
    const entry = store.get(key);
    if (!entry) return { hit: false };
    const ageMs = Date.now() - entry.cached_at;
    if (ageMs > ttlMs) {
        store.delete(key);
        return { hit: false, expired: true };
    }
    // LRU-ish touch: reinsert to mark recency.
    store.delete(key);
    store.set(key, entry);
    return {
        hit: true,
        selected: entry.selected,
        candidates: entry.candidates,
        cached_at: entry.cached_at,
        age_ms: ageMs,
        stale: ageMs > ttlMs / 2,
    };
}

function set(query, { selected = [], candidates = [] } = {}) {
    if (!selected.length) return;
    const key = buildCacheKey(query);
    // Bound memory: drop the oldest entry when at capacity.
    if (store.size >= MAX_ENTRIES) {
        const oldest = store.keys().next().value;
        if (oldest) store.delete(oldest);
    }
    store.set(key, { selected, candidates, cached_at: Date.now() });
}

function clear() {
    store.clear();
}

function stats() {
    return { entries: store.size, ttl_ms: DEFAULT_TTL_MS };
}

module.exports = { buildCacheKey, get, set, clear, stats };
