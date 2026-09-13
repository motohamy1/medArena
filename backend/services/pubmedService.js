const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const DEFAULT_TIMEOUT_MS = 5000;

async function fetchJson(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw Object.assign(new Error(`PubMed request failed with ${response.status}`), { code: response.status === 429 ? 'RATE_LIMITED' : 'SOURCE_UNAVAILABLE' });
        return response.json();
    } finally {
        clearTimeout(timer);
    }
}

async function searchPubMed(query, options = {}) {
    const params = new URLSearchParams({ db: 'pubmed', term: query, retmode: 'json', retmax: String(options.limit || 5), sort: options.sort || 'relevance', tool: process.env.NCBI_TOOL || 'med-arena-evidence-engine', email: process.env.NCBI_EMAIL || '' });
    if (process.env.NCBI_API_KEY) params.set('api_key', process.env.NCBI_API_KEY);
    const result = await fetchJson(`${BASE_URL}/esearch.fcgi?${params}`);
    const ids = result?.esearchresult?.idlist || [];
    if (!ids.length) return [];
    const summaries = await fetchJson(`${BASE_URL}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json&tool=${params.get('tool')}&email=${params.get('email')}`);
    return ids.map((id) => {
        const item = summaries?.result?.[id] || {};
        return { id: `pubmed_${id}`, source_id: 'pubmed', source_type: 'literature', title: item.title || 'PubMed article', author: item.sortfirstauthor || null, publication_date: item.pubdate || null, pmid: id, url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, content: item.title || '', excerpt: item.title || '', authority_tier: 2, authority_score: 0.85, evidence_type_score: 0.6, retrieved_at: new Date().toISOString() };
    });
}

module.exports = { searchPubMed };
