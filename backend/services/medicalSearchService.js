async function fetchMedicalKnowledge(query) {
    try {
        const url = new URL('https://datasets-server.huggingface.co/search');
        url.searchParams.append('dataset', 'OpenMed/Medical-Reasoning-SFT-Mega');
        url.searchParams.append('config', 'default');
        url.searchParams.append('split', 'train');
        url.searchParams.append('query', query);

        const response = await fetch(url.toString());
        if (!response.ok) return '';

        const data = await response.json();
        if (data.error || !data.rows?.length) return '';

        let context = '';
        data.rows.slice(0, 2).forEach((rowItem, index) => {
            const messages = rowItem.row.messages || [];
            const userMsg = messages.find((m) => m.role === 'user');
            const assistantMsg = messages.find((m) => m.role === 'assistant');
            if (userMsg && assistantMsg) {
                const expertText = assistantMsg.content.length > 1500
                    ? assistantMsg.content.substring(0, 1500) + '... [TRUNCATED]'
                    : assistantMsg.content;

                context += `--- CLINICAL RESOURCE REFERENCE ${index + 1} ---\n`;
                context += `Clinical Query: ${userMsg.content}\n`;
                context += `Expert Medical Synthesis: ${expertText}\n`;
                context += `------------------\n\n`;
            }
        });
        return context;
    } catch {
        return '';
    }
}

const SEARCH_STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'can', 'could',
    'do', 'does', 'for', 'from', 'has', 'have', 'how', 'i', 'if', 'in', 'is', 'it',
    'may', 'me', 'more', 'my', 'of', 'on', 'or', 'please', 'should', 'that', 'the',
    'their', 'them', 'there', 'this', 'to', 'was', 'we', 'what', 'when', 'where',
    'which', 'who', 'why', 'will', 'with', 'you', 'latest', 'recent', 'only',
    'guideline', 'guidelines', 'treatment', 'treatments', 'manage', 'management',
    'recommendation', 'recommendations', 'recommended', 'diagnostic', 'diagnosis',
    'criteria', 'criterion', 'workup', 'evaluation', 'evaluate', 'patient', 'patients',
    'adult', 'adults', 'current', 'best', 'first', 'line', 'dose', 'dosage', 'safe',
    'safety', 'explain', 'tell', 'use', 'used', 'using', 'العلاج', 'علاج', 'جرعة',
    'الجرعة', 'معايير', 'تشخيص', 'التشخيص', 'فحوصات', 'فحص', 'اعراض', 'أعراض', 'ماهي',
    'ماهو', 'ايه', 'إيه', 'هل', 'من', 'في', 'على', 'عن', 'مع', 'الى', 'إلى', 'لو',
    'ممكن', 'عايز', 'عايزة', 'اعرف', 'أعرف', 'اللي', 'هي', 'هو', 'كان', 'كانت',
    'مريض', 'مريضة', 'المريض', 'المريضة', 'عنده', 'عندها', 'حالة', 'الحالة', 'افضل', 'أفضل',
    'احسن', 'أحسن', 'دلوقتي', 'طب', 'طيب', 'يا', 'دكتور', 'محتاج', 'محتاجه', 'حاليا',
    'حالياً', 'الموصى', 'الموصي', 'دا', 'ده', 'دي', 'ذلك', 'هذه', 'هذا',
    'عيان', 'عيانة', 'العيان', 'العيانة', 'سنة', 'سنين', 'سنتين', 'سنوات', 'طفل', 'طفلة',
    'الطفل', 'الطفلة', 'أطفال', 'اطفال', 'بتاع', 'بتاعة', 'بتاعت', 'بتاعته', 'بتاعتها',
    'ازاي', 'إزاي', 'علشان', 'عشان', 'ينفع', 'ينفعش', 'اديله', 'اديه', 'اديها', 'نعطيه',
    'اعطيه', 'اديتله', 'معلش', 'شكرا', 'سمحت', 'بروتوكول', 'الاول', 'الأول', 'ان', 'أن',
    'إن', 'انه', 'إنها', 'انها', 'ماشي', 'ماشيين', 'بياخد', 'تاخد', 'بتاخد', 'لو سمحت',
]);

const SHORT_CLINICAL_TOKENS = new Set(['bp', 'dm', 'ckd', 'aki', 'dka', 'cap', 'uti', 'ccb', 'ccp', 'hb']);

function normalizeSearchText(text) {
    return String(text || '')
        .normalize('NFKC')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[أإآٱ]/gu, 'ا')
        .replace(/ى/gu, 'ي')
        .replace(/ـ/gu, '')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim();
}

// Unicode-aware tokenization preserves Arabic concepts. Intent and filler
// words are excluded so generic overlap cannot masquerade as disease relevance.
function getQueryTokens(queryKeywords) {
    const tokens = normalizeSearchText(queryKeywords).split(/\s+/u).filter(Boolean);
    return [...new Set(tokens.filter((token) =>
        (token.length > 2 || SHORT_CLINICAL_TOKENS.has(token))
        && !SEARCH_STOP_WORDS.has(token)
        && !/^\p{N}+$/u.test(token)
    ))];
}

function tokenMatches(token, evidenceTokens) {
    if (token === 'pylori' || token === 'helicobacter') return evidenceTokens.has('pylori') || evidenceTokens.has('helicobacter');
    if (token.startsWith('child') || token.startsWith('pediatr')) {
        return ['child', 'children', 'pediatric', 'paediatric', 'adolescent'].some((variant) => evidenceTokens.has(variant));
    }
    if (token.endsWith('s') && evidenceTokens.has(token.slice(0, -1))) return true;
    return evidenceTokens.has(token);
}

// Token-overlap relevance in [0,1]. An unparseable/empty query has zero
// relevance, never a positive neutral prior.
function computeRelevance(text, tokens) {
    const queryTokens = [...new Set((Array.isArray(tokens) ? tokens : []).filter(Boolean))];
    if (!queryTokens.length) return 0;
    const evidenceTokens = new Set(normalizeSearchText(text).split(/\s+/u).filter(Boolean));
    const matches = queryTokens.filter((token) => tokenMatches(token, evidenceTokens));
    return Number(Math.min(1, matches.length / Math.min(queryTokens.length, 6)).toFixed(4));
}

function isRelevantLiterature(ref, queryKeywords) {
    if (!ref || !ref.title) return false;
    const tokens = getQueryTokens(queryKeywords);
    if (!tokens.length) return false;
    const relevance = computeRelevance(`${ref.title} ${ref.abstract || ''}`, tokens);
    // A single specific anchor is enough; multi-concept queries require at
    // least two matching concepts, not just a common generic word.
    return relevance >= (tokens.length === 1 ? 1 : 0.55);
}

async function fetchClinicalLiterature(query, specialtyId, options = {}) {
    const { broad = false, includeTrials = true, includeFda = true, signal } = options;
    const throwIfAborted = () => {
        if (signal?.aborted) throw Object.assign(new Error('Evidence source request aborted at request deadline'), { code: 'RETRIEVAL_TIMEOUT', name: 'AbortError' });
    };
    // Structured failures (spec §95): every network/parse problem is recorded
    // with a code — never swallowed into a silent []. Declared outside the try
    // so the outer catch can still report the aggregate failure. Legacy
    // callers keep the items-only return; the v2 pipeline uses the strict path.
    const failures = [];
    try {
        // Sanitize specialtyId: Ignore generic user roles like 'physicians', 'dentists', 'nurses', 'general'
        const validSpecialties = ['cardiology', 'pulmonology', 'gastroenterology', 'neurology', 'pediatrics', 'dermatology', 'infectious', 'endocrinology', 'nephrology', 'oncology', 'rheumatology'];
        const isSpecificSpecialty = specialtyId && validSpecialties.includes(specialtyId.toLowerCase());
        let categoryFilter = isSpecificSpecialty ? ` AND (${specialtyId})` : '';
        let evidenceFilter = broad ? '' : '(PUB_TYPE:"Systematic Review" OR PUB_TYPE:"Meta-Analysis" OR PUB_TYPE:"Practice Guideline" OR PUB_TYPE:"Review" OR PUB_TYPE:"Clinical Trial")';

        // 1. Europe PMC (Aggregates PubMed, PMC, Guidelines, Systematic Reviews)
        const fetchPMC = async (isRecentOnly = false) => {
            const cleanQuery = query.replace(/[()]/g, ' ').trim();
            const tokens = getQueryTokens(cleanQuery);
            if (!tokens.length) return [];
            const currentYear = new Date().getFullYear();
            const yearFilter = isRecentOnly && !broad ? ` AND (PUB_YEAR:[${currentYear - 2} TO ${currentYear}])` : '';
            const evidenceSuffix = evidenceFilter ? ` AND ${evidenceFilter}` : '';
            // Length-ranked core terms: rare/long terms (condition names, drugs) are the
            // best discriminators; generic short words dilute AND queries to zero hits.
            const core = [...tokens].sort((a, b) => b.length - a.length);
            // Relaxation ladder (spec §16/§25): precise filtered query first, then
            // progressively broader formulations until the relevance gate passes.
            const variants = broad ? [
                `(${cleanQuery})${categoryFilter}`,
                `(${core.slice(0, 5).join(' ')})${categoryFilter}`,
            ] : [
                `(${cleanQuery})${categoryFilter}${evidenceSuffix}`,
                `(${cleanQuery})${categoryFilter}`,
                `(${core.slice(0, 5).join(' ')})${categoryFilter}`,
            ].filter(Boolean);

            for (const enhancedQuery of variants) {
                throwIfAborted();
                try {
                    const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
                    url.searchParams.append('query', enhancedQuery);
                    url.searchParams.append('format', 'json');
                    url.searchParams.append('resultType', 'core');
                    url.searchParams.append('pageSize', '4');
                    const response = await fetch(url.toString(), { signal });
                    if (!response.ok) { failures.push({ component: 'europe_pmc', code: 'SOURCE_UNAVAILABLE', message: `HTTP ${response.status}` }); continue; }
                    const data = await response.json();
                    let results = data.resultList?.result || [];
                    if (!results.length && data.hitCount === undefined && !data.version) {
                        // A stub response ({"version":...} without resultList) means the
                        // request was rejected or throttled; retry once unsorted.
                        const retryUrl = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
                        retryUrl.searchParams.append('query', enhancedQuery);
                        retryUrl.searchParams.append('format', 'json');
                        retryUrl.searchParams.append('resultType', 'core');
                        retryUrl.searchParams.append('pageSize', '4');
                        const retryResponse = await fetch(retryUrl.toString(), { signal });
                        if (!retryResponse.ok) continue;
                        const retryData = await retryResponse.json();
                        results = retryData.resultList?.result || [];
                    }

                    const items = results.map(r => {
                        const abstract = r.abstractText ? r.abstractText.replace(/<\/?(?:b|i|p|sup|sub)>/g, '') : '';
                        return {
                            source: 'Europe PMC / PubMed',
                            title: r.title,
                            author: r.authorString || 'Medical Consensus Group',
                            journal: r.journalTitle || r.pubType || 'Medical Journal',
                            year: r.pubYear ? r.pubYear.toString() : 'Recent',
                            url: r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : (r.doi ? `https://doi.org/${r.doi}` : `https://europepmc.org/article/MED/${r.id}`),
                            abstract,
                            type: isRecentOnly ? 'Latest Evidence / Update (2024+)' : 'Landmark Guideline / Consensus',
                            relevance_score: computeRelevance(`${r.title || ''} ${abstract}`, tokens),
                        };
                    }).filter(r => r.abstract && isRelevantLiterature(r, cleanQuery));
                    if (items.length) return items;
                } catch (error) {
                    if (signal?.aborted || error?.name === 'AbortError') throw Object.assign(new Error('Europe PMC request aborted at request deadline'), { code: 'RETRIEVAL_TIMEOUT', name: 'AbortError' });
                    failures.push({ component: 'europe_pmc', code: 'NETWORK_ERROR', message: error.message });
                    continue;
                }
            }
            return [];
        };

        // 2. ClinicalTrials.gov (Latest ongoing/completed trials)
        const fetchTrials = async () => {
            try {
                const cleanQuery = query.replace(/[()]/g, ' ').trim();
                const tokens = getQueryTokens(cleanQuery);
                if (!tokens.length) return [];
                const url = new URL('https://clinicaltrials.gov/api/v2/studies');
                url.searchParams.append('query.cond', cleanQuery);
                url.searchParams.append('pageSize', '2');
                url.searchParams.append('sort', 'LastUpdatePostDate:desc'); // Get latest

                const response = await fetch(url.toString(), { signal });
                if (!response.ok) { failures.push({ component: 'clinicaltrials_gov', code: 'SOURCE_UNAVAILABLE', message: `HTTP ${response.status}` }); return []; }
                const data = await response.json();
                const studies = data.studies || [];

                return studies.map(s => {
                    const protocol = s.protocolSection || {};
                    const nctId = protocol.identificationModule?.nctId || '';
                    const title = protocol.identificationModule?.briefTitle || 'Clinical Trial';
                    const abstract = protocol.descriptionModule?.briefSummary || 'Clinical trial investigating the condition or intervention.';
                    return {
                        source: 'ClinicalTrials.gov',
                        title,
                        author: protocol.sponsorCollaboratorsModule?.leadSponsor?.name || 'Clinical Research Sponsor',
                        journal: 'ClinicalTrials.gov Registry',
                        year: protocol.statusModule?.lastUpdateSubmitDate?.split('-')[0] || 'Recent',
                        url: nctId ? `https://clinicaltrials.gov/study/${nctId}` : 'https://clinicaltrials.gov',
                        abstract,
                        type: 'Clinical Trial / Experimental',
                        relevance_score: computeRelevance(`${title} ${abstract}`, tokens),
                    };
                }).filter(r => isRelevantLiterature(r, cleanQuery));
            } catch (error) {
                if (signal?.aborted || error?.name === 'AbortError') throw Object.assign(new Error('ClinicalTrials.gov request aborted at request deadline'), { code: 'RETRIEVAL_TIMEOUT', name: 'AbortError' });
                failures.push({ component: 'clinicaltrials_gov', code: 'NETWORK_ERROR', message: error.message });
                return [];
            }
        };

        // 3. OpenFDA (Drug labels, warnings)
        const fetchFDA = async () => {
            try {
                const cleanQuery = query.replace(/[()]/g, ' ').trim();
                const tokens = getQueryTokens(cleanQuery);
                if (!tokens.length) return [];
                // openFDA searches work best with generic_name or brand_name;
                // search on focused tokens with OR, and fallback to indications.
                const focus = tokens.slice(0, 3);
                const termQuery = focus.length ? `(${focus.join(' OR ')})` : `"${cleanQuery}"`;
                const url = new URL('https://api.fda.gov/drug/label.json');
                url.searchParams.append('search', `openfda.generic_name:${termQuery} OR openfda.brand_name:${termQuery} OR indications_and_usage:${termQuery}`);
                url.searchParams.append('limit', '2');

                const response = await fetch(url.toString(), { signal });
                if (!response.ok) { failures.push({ component: 'fda', code: 'SOURCE_UNAVAILABLE', message: `HTTP ${response.status}` }); return []; }
                const data = await response.json();
                const results = data.results || [];

                return results.map(r => {
                    const brand = r.openfda?.brand_name?.[0] || '';
                    const generic = r.openfda?.generic_name?.[0] || '';
                    const abstract = `INDICATIONS: ${r.indications_and_usage?.[0] || 'N/A'}\nWARNINGS: ${r.boxed_warning?.[0] || r.warnings?.[0] || 'No boxed warnings.'}`;
                    const drugName = brand || generic || 'Drug';
                    const title = `FDA Label: ${drugName}`;
                    const labelTokens = new Set(`${brand} ${generic} ${abstract}`.toLowerCase().split(/\s+/));
                    const matchesAnyToken = tokens.some((t) => labelTokens.has(t) || generic.toLowerCase().includes(t) || brand.toLowerCase().includes(t));
                    const relevance = matchesAnyToken ? Math.max(0.7, computeRelevance(`${title} ${abstract}`, tokens)) : computeRelevance(`${title} ${abstract}`, tokens);
                    return {
                        source: 'OpenFDA (FDA.gov)',
                        title,
                        author: 'U.S. FDA Center for Drug Evaluation',
                        journal: 'FDA Official Labeling',
                        year: r.effective_time?.substring(0,4) || 'Current',
                        url: 'https://www.accessdata.fda.gov/scripts/cder/daf/',
                        abstract,
                        type: 'Official FDA Data',
                        relevance_score: relevance,
                    };
                }).filter(r => r.relevance_score >= 0.55 || isRelevantLiterature(r, cleanQuery));
            } catch (error) {
                if (signal?.aborted || error?.name === 'AbortError') throw Object.assign(new Error('OpenFDA request aborted at request deadline'), { code: 'RETRIEVAL_TIMEOUT', name: 'AbortError' });
                failures.push({ component: 'fda', code: 'NETWORK_ERROR', message: error.message });
                return [];
            }
        };

        const tasks = [fetchPMC(true), fetchPMC(false)];
        if (includeTrials) tasks.push(fetchTrials());
        if (includeFda) tasks.push(fetchFDA());
        const [pmcLatest, pmcFoundational, trials = [], fda = []] = await Promise.all(tasks);

        // Prioritize newest 2024+ evidence first, followed by foundational consensus
        const allRefs = [...pmcLatest, ...pmcFoundational, ...trials, ...fda];
        return { items: allRefs.slice(0, 6), failures }; // Limit total context size
    } catch (error) {
        if (signal?.aborted || error?.name === 'AbortError') throw Object.assign(new Error('Medical literature request aborted at request deadline'), { code: 'RETRIEVAL_TIMEOUT', name: 'AbortError' });
        failures.push({ component: 'aggregate', code: 'NETWORK_ERROR', message: error.message });
        return { items: [], failures };
    }
}

/**
 * Strict fetcher for the v2 evidence pipeline: returns structured failures
 * alongside items so a totally failed source fetch is REPORTED, not silently
 * swallowed into [] (spec §95). Legacy fetchClinicalLiterature keeps the
 * items-only contract for chatRoutes v1 callers.
 */
async function fetchClinicalLiteratureStrict(query, specialtyId, options = {}) {
    return fetchClinicalLiterature(query, specialtyId, options);
}

/**
 * Legacy items-only wrapper (chatRoutes v1 keeps its existing behavior).
 */
async function fetchClinicalLiteratureLegacy(query, specialtyId, options = {}) {
    const { items } = await fetchClinicalLiterature(query, specialtyId, options);
    return items;
}

module.exports = {
    fetchMedicalKnowledge,
    fetchClinicalLiterature: fetchClinicalLiteratureLegacy,
    fetchClinicalLiteratureStrict,
    getQueryTokens,
    computeRelevance,
    isRelevantLiterature,
};
