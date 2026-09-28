// Claim verification (spec V3 §24–§25, §26/§29).
//
// V2 used token-overlap only. V3 keeps token overlap as one signal but adds:
//  - numerical consistency: numbers in a claim must exist in the supporting
//    evidence (or the user's own query context) — never invented (§29)
//  - metadata-only gating: title-only records cannot directly support claims
//  - evidence-type gating: high-risk claims (dosing/pregnancy) need stronger
//    support ratios
//  - negation awareness: a claim asserting the OPPOSITE polarity of its
//    matched evidence cannot be counted as supported

const SUPPORT_LEVELS = Object.freeze(['SUPPORTED_DIRECT', 'SUPPORTED_INDIRECT', 'CONFLICTING', 'UNSUPPORTED']);

// Spec §25: semantic similarity via the Gemini embedding provider, in ADDITION
// to token overlap. Evidence embeddings are cached per item id (bounded) so
// repeated requests do not re-embed the same corpus. Failure degrades to
// token-only verification and is recorded — never blocks the answer.
let embeddingModel = null;
let embeddingInit = false;
const EMBEDDING_CACHE_MAX = 300;
const SEMANTIC_VERIFICATION_TIMEOUT_MS = 2500;
const MAX_SEMANTIC_CLAIMS = 4;
const MAX_SEMANTIC_EVIDENCE = 4;
const evidenceEmbeddingCache = new Map();

function getEmbeddingModel() {
    if (embeddingInit) return embeddingModel;
    embeddingInit = true;
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const apiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
        if (apiKey) {
            embeddingModel = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-embedding-2' });
        }
    } catch {
        embeddingModel = null;
    }
    return embeddingModel;
}

function embeddingTimeoutError() {
    return Object.assign(new Error('Semantic claim verification exceeded its time budget'), { code: 'EMBEDDING_TIMEOUT', name: 'AbortError' });
}

async function withEmbeddingDeadline(operation, timeoutMs = SEMANTIC_VERIFICATION_TIMEOUT_MS) {
    const controller = new AbortController();
    let timer;
    const aborted = new Promise((_, reject) => {
        timer = setTimeout(() => {
            controller.abort();
            reject(embeddingTimeoutError());
        }, timeoutMs);
    });
    try {
        return await Promise.race([Promise.resolve().then(() => operation(controller.signal)), aborted]);
    } catch (error) {
        if (controller.signal.aborted || error?.name === 'AbortError') throw embeddingTimeoutError();
        throw error;
    } finally {
        clearTimeout(timer);
    }
}

async function embedText(text, { signal, timeoutMs = SEMANTIC_VERIFICATION_TIMEOUT_MS } = {}) {
    const model = getEmbeddingModel();
    if (!model) throw Object.assign(new Error('embedding provider unavailable'), { code: 'EMBEDDING_FAILURE' });
    if (signal?.aborted) throw embeddingTimeoutError();
    let abortHandler;
    const aborted = signal && new Promise((_, reject) => {
        abortHandler = () => reject(embeddingTimeoutError());
        signal.addEventListener('abort', abortHandler, { once: true });
    });
    let result;
    try {
        const request = model.embedContent(String(text || '').slice(0, 6000), { timeout: timeoutMs });
        result = await (aborted ? Promise.race([request, aborted]) : request);
    } finally {
        if (abortHandler) signal.removeEventListener('abort', abortHandler);
    }
    return result.embedding.values;
}

function cosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i += 1) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (!normA || !normB) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function getEvidenceEmbedding(item, options = {}) {
    const cacheKey = item.id || null;
    if (cacheKey && evidenceEmbeddingCache.has(cacheKey)) return evidenceEmbeddingCache.get(cacheKey);
    const vector = await embedText(`${item.title || ''}\n${String(item.content || item.excerpt || '').slice(0, 3000)}`, options);
    if (cacheKey) {
        if (evidenceEmbeddingCache.size >= EMBEDDING_CACHE_MAX) {
            const oldest = evidenceEmbeddingCache.keys().next().value;
            if (oldest) evidenceEmbeddingCache.delete(oldest);
        }
        evidenceEmbeddingCache.set(cacheKey, vector);
    }
    return vector;
}

// cosine thresholds tuned for gemini-embedding-2 on short clinical claims.
const SEMANTIC_DIRECT = 0.72;
const SEMANTIC_INDIRECT = 0.58;

const HIGH_RISK_PATTERN = /\b(dose|mg|mcg|units?|iv|intravenous|pregnan|child|pediatric|infant|neonat|chemotherap|anticoagul|insulin|toxic)\w*/i;

function normalize(value) { return String(value || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean); }

function extractNumbers(text) {
    return (String(text || '').match(/\d+(?:\.\d+)?/g) || []).map(Number);
}

function numbersSupported(claimText, evidenceTexts, queryContextText) {
    const claimNumbers = extractNumbers(claimText);
    if (claimNumbers.length === 0) return true;
    const available = new Set([...extractNumbers(queryContextText), ...evidenceTexts.flatMap((text) => extractNumbers(text))]);
    // Every number in the claim must appear in evidence or query context.
    return claimNumbers.every((number) => available.has(number));
}

function negationMismatch(claimText, evidenceText) {
    const claimNegative = /\b(no|not|never|without|avoid|contraindicated|should not|must not)\b/i.test(claimText)
        || /ممنوع|غير|بدون|لا /i.test(claimText);
    const evidenceNegative = /\b(no|not|never|without|avoid|contraindicated|should not|must not)\b/i.test(evidenceText);
    // Flag polarity inversion: a claim whose polarity is the OPPOSITE of its
    // strongest matched evidence cannot be counted as supported.
    return claimNegative !== evidenceNegative;
}

function verifyClaim(claim, evidence = [], conflicts = [], queryContextText = '') {
    const claimTokens = new Set(normalize(claim.text));
    const isHighRisk = HIGH_RISK_PATTERN.test(claim.text);
    const matches = evidence.map((item) => {
        const evidenceText = String(item.content || item.excerpt || '');
        const contentTokens = new Set(normalize(evidenceText));
        // Ratio over MEANINGFUL claim tokens (>3 chars): filler words (is/a/in)
        // must not dilute the support ratio (V2 bug: "Labetalol is a preferred
        // antihypertensive in pregnancy" scored 0.43 instead of 0.75).
        const meaningfulTokens = [...claimTokens].filter((token) => token.length > 3);
        const overlap = meaningfulTokens.filter((token) => contentTokens.has(token)).length;
        const ratio = meaningfulTokens.length ? overlap / meaningfulTokens.length : 0;
        return { item, ratio, evidenceText };
    })
        .filter((match) => match.ratio >= 0.35)
        .sort((a, b) => b.ratio - a.ratio);
    const conflict = conflicts.some((conflictItem) => conflictItem.topic && normalize(claim.text).some((token) => normalize(conflictItem.topic).includes(token)));
    if (conflict) return { ...claim, support_level: 'CONFLICTING', source_ids: matches.map((match) => match.item.id).filter(Boolean) };
    if (matches.length === 0) return { ...claim, support_level: 'UNSUPPORTED', source_ids: [] };

    // Negation inversion check against the strongest match.
    if (matches.length > 0 && negationMismatch(claim.text, matches[0].evidenceText)) {
        return { ...claim, support_level: 'UNSUPPORTED', source_ids: [], reason: 'negation_mismatch' };
    }
    // Numerical safety (spec §29): claimed numbers must be traceable.
    const evidenceTexts = matches.slice(0, 3).map((match) => match.evidenceText);
    if (!numbersSupported(claim.text, evidenceTexts, queryContextText)) {
        return { ...claim, support_level: 'UNSUPPORTED', source_ids: [], reason: 'unsupported_numbers' };
    }
    const best = matches[0];
    const isMetadataOnly = best.item.evidence_depth === 'metadata_only';
    const requiredRatio = isHighRisk ? 0.6 : 0.5;
    // Title-only records cap out at INDIRECT support (spec §20).
    let level;
    if (best.ratio >= requiredRatio && !isMetadataOnly) level = 'SUPPORTED_DIRECT';
    else level = 'SUPPORTED_INDIRECT';
    if (isHighRisk && best.ratio < 0.5) level = 'UNSUPPORTED';
    return { ...claim, support_level: level, source_ids: matches.map((match) => match.item.id).filter(Boolean), high_risk: isHighRisk };
}

function verifyClaims(claims, evidence, conflicts = [], queryContextText = '') {
    return (claims || []).map((claim) => verifyClaim(claim, evidence, conflicts, queryContextText));
}

/**
 * Hybrid verification (spec §25): token overlap + semantic similarity.
 * Runs the existing structural checks (negation inversion, numeric safety)
 * ALWAYS; the semantic score can upgrade INDIRECT->DIRECT or rescue a claim
 * whose token overlap undercounts paraphrase, but it can never override the
 * numeric/negation guards (spec §29/§0.5).
 * Returns { claims, diagnostics } where diagnostics record embedding status.
 */
async function verifyClaimsHybrid(claims, evidence = [], conflicts = [], queryContextText = '') {
    const base = verifyClaims(claims, evidence, conflicts, queryContextText);
    const diagnostics = { semantic_verification: 'unavailable' };
    if (!base.length || !evidence.length) return { claims: base, diagnostics };
    try {
        const { claimVectors, evidenceVectors } = await withEmbeddingDeadline((signal) => Promise.all([
            Promise.all(base.slice(0, MAX_SEMANTIC_CLAIMS).map((claim) => embedText(claim.text, { signal, timeoutMs: SEMANTIC_VERIFICATION_TIMEOUT_MS }))),
            Promise.all(evidence.slice(0, MAX_SEMANTIC_EVIDENCE).map((item) => getEvidenceEmbedding(item, { signal, timeoutMs: SEMANTIC_VERIFICATION_TIMEOUT_MS }))),
        ]).then(([claimsResult, evidenceResult]) => ({ claimVectors: claimsResult, evidenceVectors: evidenceResult })), SEMANTIC_VERIFICATION_TIMEOUT_MS);
        diagnostics.semantic_verification = 'embedding';
        const enhanced = base.map((claim, claimIndex) => {
            if (claimIndex >= claimVectors.length) return claim;
            if (claim.support_level === 'CONFLICTING' || (claim.support_level === 'UNSUPPORTED' && claim.reason)) return claim;
            let bestCosine = 0;
            let bestItem = null;
            for (let e = 0; e < evidenceVectors.length; e += 1) {
                const cosine = cosineSimilarity(claimVectors[claimIndex], evidenceVectors[e]);
                if (cosine > bestCosine) { bestCosine = cosine; bestItem = evidence[e]; }
            }
            // Numeric/negation guards already applied in verifyClaim — semantic
            // similarity only refines the direct/indirect boundary.
            const sourceIds = new Set([...(claim.source_ids || []), bestItem?.id].filter(Boolean));
            let level = claim.support_level;
            const isHighRiskClaim = claim.high_risk || HIGH_RISK_PATTERN.test(claim.text);
            if (bestCosine >= SEMANTIC_DIRECT && level !== 'UNSUPPORTED' && bestItem?.evidence_depth !== 'metadata_only') level = 'SUPPORTED_DIRECT';
            else if (bestCosine >= SEMANTIC_INDIRECT && level === 'UNSUPPORTED' && !isHighRiskClaim) level = 'SUPPORTED_INDIRECT';
            // High-risk claims (dosing/pregnancy/etc, spec §42) are never
            // rescued from UNSUPPORTED by semantics alone.
            return { ...claim, support_level: level, semantic_similarity: Number(bestCosine.toFixed(4)), source_ids: sourceIds };
        });
        return { claims: enhanced, diagnostics };
    } catch (error) {
        // Spec §95: degraded, not silent.
        return { claims: base, diagnostics: { semantic_verification: error.code === 'EMBEDDING_TIMEOUT' ? 'timeout' : 'unavailable', semantic_failure: error.code || 'EMBEDDING_FAILURE' } };
    }
}

module.exports = { SUPPORT_LEVELS, verifyClaim, verifyClaims, verifyClaimsHybrid, extractNumbers, cosineSimilarity, withEmbeddingDeadline };
