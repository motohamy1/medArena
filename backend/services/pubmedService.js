const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const DEFAULT_TIMEOUT_MS = 5000;

function timeoutException(message) {
    return Object.assign(new Error(message), { code: 'RETRIEVAL_TIMEOUT', name: 'AbortError' });
}

async function fetchJson(url, timeoutMs = DEFAULT_TIMEOUT_MS, parentSignal = null) {
    const controller = new AbortController();
    const abortFromParent = () => controller.abort();
    if (parentSignal?.aborted) controller.abort();
    else parentSignal?.addEventListener('abort', abortFromParent, { once: true });
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw Object.assign(new Error(`PubMed request failed with ${response.status}`), { code: response.status === 429 ? 'RATE_LIMITED' : 'SOURCE_UNAVAILABLE' });
        return await response.json();
    } catch (error) {
        if (controller.signal.aborted || error?.name === 'AbortError') throw timeoutException('PubMed request exceeded its retrieval deadline');
        throw error;
    } finally {
        clearTimeout(timer);
        parentSignal?.removeEventListener('abort', abortFromParent);
    }
}

// Spec §20: PubMed title metadata is NOT full evidence. Fetch abstracts via
// efetch so claims can be verified against real content; records without an
// abstract keep evidence_depth='metadata_only' and are gated by claim
// verification (they can never directly support a claim).
async function fetchAbstracts(ids, options = {}) {
    if (!ids.length) return {};
    const params = new URLSearchParams({ db: 'pubmed', id: ids.join(','), rettype: 'abstract', retmode: 'xml', tool: process.env.NCBI_TOOL || 'med-arena-evidence-engine', email: process.env.NCBI_EMAIL || '' });
    if (process.env.NCBI_API_KEY) params.set('api_key', process.env.NCBI_API_KEY);
    const controller = new AbortController();
    const abortFromParent = () => controller.abort();
    if (options.signal?.aborted) controller.abort();
    else options.signal?.addEventListener('abort', abortFromParent, { once: true });
    const timer = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT_MS);
    let xml;
    try {
        const response = await fetch(`${BASE_URL}/efetch.fcgi?${params}`, { signal: controller.signal });
        if (!response.ok) throw Object.assign(new Error(`PubMed efetch failed with ${response.status}`), { code: 'SOURCE_UNAVAILABLE' });
        xml = await response.text();
    } catch (error) {
        if (controller.signal.aborted || error?.name === 'AbortError') throw timeoutException('PubMed abstract request exceeded its retrieval deadline');
        throw error;
    } finally {
        clearTimeout(timer);
        options.signal?.removeEventListener('abort', abortFromParent);
    }
    const abstracts = {};
    const articleBlocks = xml.split('<PubmedArticle>').slice(1);
    for (const block of articleBlocks) {
        const pmid = block.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1];
        const abstractText = (block.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/) || [])
            ?.slice(1).join(' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (pmid && abstractText) abstracts[pmid] = abstractText;
    }
    return abstracts;
}

async function searchPubMed(query, options = {}) {
    const params = new URLSearchParams({ db: 'pubmed', term: query, retmode: 'json', retmax: String(options.limit || 5), sort: options.sort || 'relevance', tool: process.env.NCBI_TOOL || 'med-arena-evidence-engine', email: process.env.NCBI_EMAIL || '' });
    if (process.env.NCBI_API_KEY) params.set('api_key', process.env.NCBI_API_KEY);
    const result = await fetchJson(`${BASE_URL}/esearch.fcgi?${params}`, options.timeoutMs || DEFAULT_TIMEOUT_MS, options.signal);
    const ids = result?.esearchresult?.idlist || [];
    if (!ids.length) return [];
    const [summaries, abstracts] = await Promise.all([
        fetchJson(`${BASE_URL}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json&tool=${params.get('tool')}&email=${params.get('email')}`, options.timeoutMs || DEFAULT_TIMEOUT_MS, options.signal),
        fetchAbstracts(ids, options).catch((error) => {
            if (options.signal?.aborted || error?.code === 'RETRIEVAL_TIMEOUT') throw error;
            return {}; // a non-timeout abstract failure must not kill metadata results
        }),
    ]);
    return ids.map((id) => {
        const item = summaries?.result?.[id] || {};
        const abstract = abstracts[id] || '';
        return { id: `pubmed_${id}`, source_id: 'pubmed', source_type: 'literature', title: item.title || 'PubMed article', author: item.sortfirstauthor || null, publication_date: item.pubdate || null, pmid: id, url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, content: abstract || item.title || '', excerpt: abstract || item.title || '', evidence_depth: abstract ? 'abstract' : 'metadata_only', authority_tier: 2, authority_score: 0.85, evidence_type_score: 0.6, retrieved_at: new Date().toISOString() };
    });
}

module.exports = { searchPubMed };
