const { searchPubMed } = require('./pubmedService');
const { fetchClinicalLiterature } = require('./medicalSearchService');
const { rankEvidence, selectEvidence } = require('./evidenceRankingService');
const { createEvidenceError } = require('./evidenceErrors');

function normalizeLegacyResult(item, index) {
    const source = String(item.source || '').toLowerCase();
    const sourceId = source.includes('fda') ? 'fda' : source.includes('trial') ? 'clinicaltrials_gov' : 'europe_pmc';
    return { id: item.pmid ? `${sourceId}_${item.pmid}` : `${sourceId}_${index}_${Buffer.from(String(item.title || '')).toString('base64url').slice(0, 16)}`, source_id: sourceId, source_type: sourceId === 'fda' ? 'regulatory' : sourceId === 'clinicaltrials_gov' ? 'trial_registry' : 'literature', title: item.title, organization: item.author, publication_date: item.year, url: item.url, pmid: item.pmid, doi: item.doi, content: item.abstract || '', excerpt: item.abstract || '', authority_tier: sourceId === 'fda' ? 1 : sourceId === 'europe_pmc' ? 2 : 3, authority_score: sourceId === 'fda' ? 1 : sourceId === 'europe_pmc' ? 0.85 : 0.7, relevance_score: item.relevance_score || 0.6, evidence_type_score: sourceId === 'clinicaltrials_gov' ? 0.5 : 0.7, is_current: true, retrieved_at: new Date().toISOString() };
}

async function retrieveEvidence(plan, query) {
    const failures = [];
    const results = await Promise.all((plan.plans || []).map(async (sourcePlan) => {
        try {
            const queryText = sourcePlan.queries[0];
            if (sourcePlan.source_id === 'pubmed') return (await searchPubMed(queryText, { limit: sourcePlan.max_candidates })).map(normalizeLegacyResult);
            if (sourcePlan.source_id === 'europe_pmc' || sourcePlan.source_id === 'clinicaltrials_gov' || sourcePlan.source_id === 'fda') return (await fetchClinicalLiterature(queryText, query.category || 'physicians')).map(normalizeLegacyResult);
            return [];
        } catch (error) {
            failures.push({ source_id: sourcePlan.source_id, code: error.code || 'SOURCE_UNAVAILABLE', message: error.message });
            return [];
        }
    }));
    const candidates = results.flat();
    if (!candidates.length && failures.length === (plan.plans || []).length) throw createEvidenceError('SOURCE_UNAVAILABLE', 'All planned evidence sources failed', failures);
    return { candidates, failures, ranked: rankEvidence(candidates, query), selected: selectEvidence(rankEvidence(candidates, query), Math.min(plan.retrieval_budget || 20, 8)) };
}

module.exports = { retrieveEvidence };
