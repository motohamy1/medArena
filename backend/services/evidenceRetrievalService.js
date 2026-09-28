const { searchPubMed } = require('./pubmedService');
const { fetchClinicalLiteratureStrict, getQueryTokens, computeRelevance } = require('./medicalSearchService');
const { searchInternalKnowledge } = require('./knowledgeService');
const { rankEvidence, selectEvidence } = require('./evidenceRankingService');
const { createEvidenceError } = require('./evidenceErrors');
const { executeSourceCall } = require('./sourceHealthService');
const { assessFreshness } = require('./sourceFreshnessService');

// ─────────────────────────────────────────────────────────────────────────────
// Freshness (spec §0.4/§15): never fabricate 'current' from retrieval success.
// External records get an honest freshness band computed from their real
// publication date; internal curated rows from is_active + publication_year.
// ─────────────────────────────────────────────────────────────────────────────

function applyFreshness(item, { requireCurrent = false } = {}) {
    const result = assessFreshness({ publication_date: item.publication_date }, { requireCurrent });
    const ageYears = result.age_days != null ? result.age_days / 365 : null;
    const freshness = item.is_current === true
        ? 'current'
        : ageYears == null
            ? 'unknown'
            : ageYears <= 2 ? 'recent' : 'old';
    return {
        ...item,
        publication_date: item.publication_date || null,
        updated_date: null,
        effective_date: null,
        superseded_date: null,
        version: item.version || null,
        retrieved_at: new Date().toISOString(),
        freshness,
        freshness_score: freshness === 'current' ? 1 : freshness === 'recent' ? 0.9 : freshness === 'old' ? 0.6 : 0.4,
        source_status: 'unknown',
        is_current: item.is_current === true,
    };
}

function normalizeInternalKnowledge(rows) {
    // Human-reviewed internal guideline chunks (spec §6 Tier 1 for curated
    // knowledge; only is_active rows are returned by the match function).
    // Spec §48: a citation must resolve — chunks without source_url/pmid are
    // never surfaced as evidence.
    return (rows || [])
        .filter((row) => row.content && (row.source_url || row.pmid))
        .map((row) => {
            const base = {
                id: `internal_${row.id}`,
                source_id: 'internal_knowledge',
                source_type: 'guideline',
                title: row.title || 'Curated Clinical Guideline',
                organization: row.guideline_society || 'Med Arena Editorial',
                publication_date: row.publication_year ? `${row.publication_year}-01-01` : null,
                version: row.version_tag || null,
                url: row.source_url || null,
                pmid: row.pmid || null,
                doi: null,
                content: row.content || '',
                excerpt: row.content || '',
                authority_tier: 1,
                authority_score: 1,
                relevance_score: typeof row.similarity === 'number' ? row.similarity : 0.7,
                evidence_type_score: 0.9,
                evidence_depth: 'full',
                retrieval_mechanism: row.retrieval_mechanism || 'vector',
                retrieved_at: new Date().toISOString(),
            };
            // is_active is NOT current (spec §0.4): a curated row counts as
            // current only if it is recent by real date, never merely active.
            const year = row.publication_year ? Number(row.publication_year) : null;
            const isRecent = year != null && year >= new Date().getFullYear() - 1;
            base.is_current = row.is_active !== false && isRecent;
            return base;
        });
}

function normalizeLegacyResult(item) {
    const source = String(item.source || '').toLowerCase();
    const sourceId = source.includes('fda') ? 'fda' : source.includes('trial') ? 'clinicaltrials_gov' : 'europe_pmc';
    // Deterministic id (title/pmid based, not index based) so the same paper
    // retrieved by multiple plan variants dedupes in selectEvidence.
    const publicationDate = item.year && /^\d{4}$/.test(String(item.year)) ? `${item.year}-01-01` : null;
    const abstract = item.abstract || '';
    return {
        id: item.pmid ? `${sourceId}_${item.pmid}` : `${sourceId}_${Buffer.from(String(item.title || '')).toString('base64url').slice(0, 16)}`,
        source_id: sourceId,
        source_type: sourceId === 'fda' ? 'regulatory' : sourceId === 'clinicaltrials_gov' ? 'trial_registry' : 'literature',
        title: item.title,
        organization: item.author,
        publication_date: publicationDate,
        url: item.url,
        pmid: item.pmid || null,
        doi: item.doi || null,
        content: abstract,
        excerpt: abstract,
        // Evidence depth (spec §20): literature records without abstracts are
        // metadata_only and must not support strong clinical recommendations.
        evidence_depth: abstract && abstract.length > 200 ? 'abstract' : 'metadata_only',
        authority_tier: sourceId === 'fda' ? 1 : sourceId === 'europe_pmc' ? 2 : 3,
        authority_score: sourceId === 'fda' ? 1 : sourceId === 'europe_pmc' ? 0.85 : 0.7,
        relevance_score: item.relevance_score ?? 0,
        evidence_type_score: sourceId === 'clinicaltrials_gov' ? 0.5 : 0.7,
        retrieved_at: new Date().toISOString(),
    };
}

// Bounded per spec §16/§25: try the planner's query variants (base + focus
// pairs), then one broad (filter-free) expansion round before reporting zero
// evidence.
const MAX_QUERY_VARIANTS = 4;

async function fetchFromSource(sourcePlan, queryText, query, { broad = false, signal } = {}) {
    if (sourcePlan.source_id === 'internal_knowledge') {
        // Hybrid vector→lexical→exact search with structured failures.
        const { items, failures } = await searchInternalKnowledge(queryText, sourcePlan.max_candidates || 5, 0.55, { signal });
        if (!items.length && failures.length) {
            // All internal mechanisms failed — surface the real reason instead
            // of silently continuing as if the source returned nothing.
            throw createEvidenceError(failures.some((f) => f.code === 'EMBEDDING_FAILURE') ? 'EMBEDDING_FAILURE' : 'DATABASE_FAILURE', `internal_knowledge failed: ${failures.map((f) => f.code).join('+')}`, failures);
        }
        return normalizeInternalKnowledge(items);
    }
    if (sourcePlan.source_id === 'pubmed') return (await searchPubMed(queryText, { limit: sourcePlan.max_candidates, signal })).map(normalizeLegacyResult);
    // Each planned source fetches only its own component; the aggregate fetcher
    // otherwise drags trials/FDA into plans that never asked for them.
    // Strict fetch: structured failures surface through executeSourceCall
    // instead of a silent [] (spec §95). "NO_RESULTS" (a legitimately empty
    // search) is NOT a failure — only network/HTTP problems throw.
    const strictFetch = async (sourceId, options) => {
        const { items, failures } = await fetchClinicalLiteratureStrict(queryText, query.category || 'physicians', { ...options, signal });
        const hardFailures = failures.filter((f) => f.code !== 'NO_RESULTS');
        if (!items.length && hardFailures.length) throw createEvidenceError('SOURCE_UNAVAILABLE', `${sourceId} failed: ${hardFailures.map((f) => f.code).join(',')}`, hardFailures);
        return items.map(normalizeLegacyResult);
    };
    if (sourcePlan.source_id === 'europe_pmc') return strictFetch('europe_pmc', { broad, includeTrials: false, includeFda: false });
    if (sourcePlan.source_id === 'clinicaltrials_gov') return strictFetch('clinicaltrials_gov', { broad, includeFda: false });
    if (sourcePlan.source_id === 'fda') return strictFetch('fda', { broad, includeTrials: false });
    return [];
}

// Cross-source deduplication (spec §55): DOI / PMID / normalized title.
function dedupeKey(item) {
    if (item.doi) return `doi:${String(item.doi).toLowerCase()}`;
    if (item.pmid) return `pmid:${String(item.pmid)}`;
    const title = String(item.title || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
    return title ? `title:${title}` : null;
}

const MODIFIER_CONDITIONS = new Set(['obesity', 'pregnancy', 'renal', 'hepatic']);
const MIN_DIRECT_RELEVANCE = 0.55;

function getPrimaryRetrievalAnchor(query = {}) {
    const explicit = (query.retrieval_anchors || []).filter(Boolean);
    if (explicit.length) return explicit[0];

    const conditions = Array.isArray(query.conditions) ? query.conditions : [];
    const primaryCondition = conditions.find((condition) => condition?.concept && !MODIFIER_CONDITIONS.has(condition.concept))?.concept;
    if (primaryCondition) return primaryCondition;
    if (query.condition && !MODIFIER_CONDITIONS.has(query.condition)) return query.condition;

    return query.medications?.[0]
        || query.drug_classes?.[0]
        || query.symptoms?.[0]
        || query.labs?.[0]?.name
        || query.condition
        || null;
}

function evidenceAnchorRelevance(item, query = {}) {
    const anchor = getPrimaryRetrievalAnchor(query);
    const anchorTokens = getQueryTokens(anchor);
    if (!anchorTokens.length) return 0;
    return computeRelevance(`${item?.title || ''} ${item?.content || item?.excerpt || ''}`, anchorTokens);
}

function isEvidenceRelevant(item, query = {}) {
    return evidenceAnchorRelevance(item, query) >= MIN_DIRECT_RELEVANCE;
}

async function retrieveEvidence(plan, query, { forceBroad = false, focusTasks = null, deadline = null } = {}) {
    const failures = [];
    const sourceHealth = [];
    const budgetExceeded = () => Boolean(deadline && Date.now() > deadline);
    const runPlan = async (sourcePlan, { broad = false, queriesOverride = null } = {}) => {
        if (budgetExceeded()) {
            // Request-level budget spent (spec §33): stop this source, record
            // the honest reason instead of silently truncating.
            sourceHealth.push({ sourceId: sourcePlan.source_id, status: 'skipped', errorType: 'RETRIEVAL_TIMEOUT', checkedAt: new Date().toISOString() });
            failures.push({ source_id: sourcePlan.source_id, code: 'RETRIEVAL_TIMEOUT', message: 'request time budget exhausted before this source ran' });
            return [];
        }
        const variants = (queriesOverride || sourcePlan.queries || []).filter(Boolean).slice(0, MAX_QUERY_VARIANTS);
        const collected = [];
        const seenKeys = new Set();
        // Merge results across query variants: each focus query targets a
        // different sub-question, so first-success-only would starve the
        // composer of the evidence it needs. Each variant fetch is bounded by
        // its own per-attempt timeout/retry/breaker (spec V2.1 A.3/A.6) — a
        // slow or failed attempt never blocks the other source families.
        for (const queryText of variants) {
            if (budgetExceeded()) {
                sourceHealth.push({ sourceId: sourcePlan.source_id, status: 'skipped', errorType: 'RETRIEVAL_TIMEOUT', checkedAt: new Date().toISOString() });
                failures.push({ source_id: sourcePlan.source_id, code: 'RETRIEVAL_TIMEOUT', message: 'request time budget exhausted before the next query variant' });
                break;
            }
            const { result: items, health, error } = await executeSourceCall(
                sourcePlan.source_id,
                ({ signal }) => fetchFromSource(sourcePlan, queryText, query, { broad: broad || forceBroad, signal }),
                { deadline },
            );
            sourceHealth.push(health);
            if (items) {
                for (const item of items) {
                    const key = dedupeKey(item);
                    if (key && !seenKeys.has(key)) {
                        seenKeys.add(key);
                        collected.push(item);
                    }
                }
            } else if (error && !error.skipped) {
                failures.push({ source_id: sourcePlan.source_id, code: error.code || 'SOURCE_UNAVAILABLE', message: error.message });
            }
            if (collected.length >= 8) break;
        }
        return collected;
    };

    // Deep retrieval (spec §21): when focusTasks are supplied, each planned
    // source also runs the task-specific queries targeting the missing
    // sub-questions — NOT a repeat of the broad query.
    const results = await Promise.all((plan.plans || []).map(async (sourcePlan) => {
        const taskQueries = focusTasks
            ? focusTasks
                .filter((task) => task.preferred_sources?.includes(sourcePlan.source_id))
                .flatMap((task) => task.queries || [])
                .filter(Boolean)
                .slice(0, MAX_QUERY_VARIANTS)
            : null;
        if (budgetExceeded()) {
            sourceHealth.push({ sourceId: sourcePlan.source_id, status: 'skipped', errorType: 'RETRIEVAL_TIMEOUT', checkedAt: new Date().toISOString() });
            failures.push({ source_id: sourcePlan.source_id, code: 'RETRIEVAL_TIMEOUT', message: 'request time budget exhausted before this source ran' });
            return [];
        }
        const items = await runPlan(sourcePlan, { broad: forceBroad, queriesOverride: taskQueries && taskQueries.length ? taskQueries : null });
        if (items.length || forceBroad || budgetExceeded()) return items;
        // Expansion round: retry the same source family without publication-type/year filters.
        return runPlan(sourcePlan, { broad: true });
    }));
    let candidates = results.flat();

    // Final cross-source dedup pass (PMC/PubMed overlap).
    const seenGlobal = new Set();
    candidates = candidates.filter((item) => {
        const key = dedupeKey(item);
        if (!key || seenGlobal.has(key)) return false;
        seenGlobal.add(key);
        return true;
    });

    // Rerank against the FULL original question (spec §20/§22): focus-query
    // variants inflate token-overlap against their own 2-3 tokens, so rescore
    // every candidate against the complete query before ranking/selection.
    const fullQueryText = query.normalized_query || (query.search_terms || []).join(' ');
    const fullTokens = getQueryTokens(fullQueryText);
    for (const candidate of candidates) {
        candidate.query_relevance_score = computeRelevance(`${candidate.title || ''} ${candidate.content || ''}`, fullTokens);
        candidate.relevance_score = evidenceAnchorRelevance(candidate, query);
    }
    const rawCandidateCount = candidates.length;
    candidates = candidates.filter((candidate) => candidate.relevance_score >= MIN_DIRECT_RELEVANCE);
    // Freshness applied after relevance rescore, before ranking (spec §15).
    const requireCurrent = query.temporal_request === 'current';
    candidates = candidates.map((item) => applyFreshness(item, { requireCurrent }));
    const plannedSourceIds = [...new Set((plan.plans || []).map((sourcePlan) => sourcePlan.source_id))];
    const healthySourceIds = new Set(sourceHealth.filter((entry) => entry.status === 'healthy').map((entry) => entry.sourceId));
    if (rawCandidateCount === 0 && plannedSourceIds.length > 0 && healthySourceIds.size === 0) {
        // Multiple variants may fail for one adapter; count source families,
        // not individual query attempts, so outages never masquerade as empty
        // evidence and timeouts remain retryable.
        const codes = new Set(failures.map((failure) => failure.code));
        const code = codes.has('RETRIEVAL_TIMEOUT')
            ? 'RETRIEVAL_TIMEOUT'
            : codes.has('EMBEDDING_FAILURE')
                ? 'EMBEDDING_FAILURE'
                : codes.has('DATABASE_FAILURE')
                    ? 'DATABASE_FAILURE'
                    : 'SOURCE_UNAVAILABLE';
        throw createEvidenceError(code, 'All planned evidence sources failed before returning usable results', failures);
    }
    const ranked = rankEvidence(candidates, query);
    return { candidates, rejected_count: rawCandidateCount - candidates.length, failures, sourceHealth, ranked, selected: selectEvidence(ranked, Math.min(plan.retrieval_budget || 20, 8)) };
}

module.exports = { retrieveEvidence, applyFreshness, normalizeInternalKnowledge, normalizeLegacyResult, getPrimaryRetrievalAnchor, evidenceAnchorRelevance, isEvidenceRelevant };
