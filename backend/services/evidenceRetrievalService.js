const { searchPubMed } = require('./pubmedService');
const { fetchClinicalLiterature, getQueryTokens, computeRelevance } = require('./medicalSearchService');
const { searchCustomKnowledge } = require('./knowledgeService');
const { rankEvidence, selectEvidence } = require('./evidenceRankingService');
const { createEvidenceError } = require('./evidenceErrors');

function normalizeInternalKnowledge(rows) {
    // Human-reviewed internal guideline chunks (spec §6 Tier 1 for curated
    // knowledge; only is_active rows are returned by the match function).
    // Spec §48: a citation must resolve — chunks without source_url/pmid are
    // never surfaced as evidence.
    return (rows || [])
        .filter((row) => row.content && (row.source_url || row.pmid))
        .map((row) => ({
        id: `internal_${row.id}`,
        source_id: 'internal_knowledge',
        source_type: 'guideline',
        title: row.title || 'Curated Clinical Guideline',
        organization: row.guideline_society || 'Med Arena Editorial',
        publication_date: row.publication_year ? String(row.publication_year) : null,
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
        is_current: row.is_active !== false,
        retrieved_at: new Date().toISOString(),
    }));
}

function normalizeLegacyResult(item) {
    const source = String(item.source || '').toLowerCase();
    const sourceId = source.includes('fda') ? 'fda' : source.includes('trial') ? 'clinicaltrials_gov' : 'europe_pmc';
    // Deterministic id (title/pmid based, not index based) so the same paper
    // retrieved by multiple plan variants dedupes in selectEvidence.
    return { id: item.pmid ? `${sourceId}_${item.pmid}` : `${sourceId}_${Buffer.from(String(item.title || '')).toString('base64url').slice(0, 16)}`, source_id: sourceId, source_type: sourceId === 'fda' ? 'regulatory' : sourceId === 'clinicaltrials_gov' ? 'trial_registry' : 'literature', title: item.title, organization: item.author, publication_date: item.year, url: item.url, pmid: item.pmid, doi: item.doi, content: item.abstract || '', excerpt: item.abstract || '', authority_tier: sourceId === 'fda' ? 1 : sourceId === 'europe_pmc' ? 2 : 3, authority_score: sourceId === 'fda' ? 1 : sourceId === 'europe_pmc' ? 0.85 : 0.7, relevance_score: item.relevance_score || 0.6, evidence_type_score: sourceId === 'clinicaltrials_gov' ? 0.5 : 0.7, is_current: true, retrieved_at: new Date().toISOString() };
}

// Bounded per spec §16/§25: try the planner's query variants (base + focus
// pairs), then one broad (filter-free) expansion round before reporting zero
// evidence.
const MAX_QUERY_VARIANTS = 4;

async function fetchFromSource(sourcePlan, queryText, query, { broad = false } = {}) {
    if (sourcePlan.source_id === 'internal_knowledge') {
        return searchCustomKnowledge(queryText, sourcePlan.max_candidates || 5, 0.55).then(normalizeInternalKnowledge);
    }
    if (sourcePlan.source_id === 'pubmed') return (await searchPubMed(queryText, { limit: sourcePlan.max_candidates })).map(normalizeLegacyResult);
    // Each planned source fetches only its own component; the aggregate fetcher
    // otherwise drags trials/FDA into plans that never asked for them.
    if (sourcePlan.source_id === 'europe_pmc') return (await fetchClinicalLiterature(queryText, query.category || 'physicians', { broad, includeTrials: false, includeFda: false })).map(normalizeLegacyResult);
    if (sourcePlan.source_id === 'clinicaltrials_gov') return (await fetchClinicalLiterature(queryText, query.category || 'physicians', { broad, includeFda: false })).map(normalizeLegacyResult);
    if (sourcePlan.source_id === 'fda') return (await fetchClinicalLiterature(queryText, query.category || 'physicians', { broad, includeTrials: false })).map(normalizeLegacyResult);
    return [];
}

async function retrieveEvidence(plan, query, { forceBroad = false } = {}) {
    const failures = [];
    const runPlan = async (sourcePlan, { broad = false } = {}) => {
        const variants = (sourcePlan.queries || []).filter(Boolean).slice(0, MAX_QUERY_VARIANTS);
        const collected = [];
        const seenTitles = new Set();
        // Merge results across query variants: each focus query targets a
        // different sub-question, so first-success-only would starve the
        // composer of the evidence it needs.
        for (const queryText of variants) {
            try {
                const items = await fetchFromSource(sourcePlan, queryText, query, { broad: broad || forceBroad });
                for (const item of items) {
                    const key = String(item.title || '').toLowerCase();
                    if (key && !seenTitles.has(key)) {
                        seenTitles.add(key);
                        collected.push(item);
                    }
                }
            } catch (error) {
                failures.push({ source_id: sourcePlan.source_id, code: error.code || 'SOURCE_UNAVAILABLE', message: error.message });
            }
            if (collected.length >= 8) break;
        }
        return collected;
    };

    const results = await Promise.all((plan.plans || []).map(async (sourcePlan) => {
        const items = await runPlan(sourcePlan, { broad: forceBroad });
        if (items.length || forceBroad) return items;
        // Expansion round: retry the same source family without publication-type/year filters.
        return runPlan(sourcePlan, { broad: true });
    }));
    const candidates = results.flat();
    // Rerank against the FULL original question (spec §20/§22): focus-query
    // variants inflate token-overlap against their own 2-3 tokens, so rescore
    // every candidate against the complete query before ranking/selection.
    const fullQueryText = query.normalized_query || (query.search_terms || []).join(' ');
    if (fullQueryText) {
        const fullTokens = getQueryTokens(fullQueryText);
        if (fullTokens.length) {
            for (const candidate of candidates) {
                candidate.relevance_score = computeRelevance(`${candidate.title || ''} ${candidate.content || ''}`, fullTokens);
            }
        }
    }
    if (!candidates.length && failures.length === (plan.plans || []).length) throw createEvidenceError('SOURCE_UNAVAILABLE', 'All planned evidence sources failed', failures);
    return { candidates, failures, ranked: rankEvidence(candidates, query), selected: selectEvidence(rankEvidence(candidates, query), Math.min(plan.retrieval_budget || 20, 8)) };
}

module.exports = { retrieveEvidence };
