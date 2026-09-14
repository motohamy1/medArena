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

function isRelevantLiterature(ref, queryKeywords) {
    if (!ref || !ref.title) return false;
    const combinedText = `${ref.title} ${ref.abstract || ''}`.toLowerCase();
    
    // Break query keywords into meaningful tokens (exclude common stop words)
    const stopWords = new Set(['and', 'the', 'for', 'with', 'under', 'over', 'from', 'what', 'how', 'when', 'which', 'latest', 'recent', 'only', 'guideline', 'guidelines']);
    const tokens = queryKeywords
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2 && !stopWords.has(t));
    
    if (tokens.length === 0) return true;
    
    // Check if at least one key disease/concept token matches the title or abstract
    const matches = tokens.filter(tok => {
        // Handle variations like pylori -> pylori/pyloridis, child -> child/children/pediatric
        if (tok === 'pylori' || tok === 'helicobacter') return combinedText.includes('pylori') || combinedText.includes('helicobacter');
        if (tok.startsWith('child') || tok.startsWith('pediatr')) return combinedText.includes('child') || combinedText.includes('pediatr') || combinedText.includes('adolesc');
        return combinedText.includes(tok);
    });

    return matches.length >= Math.min(2, tokens.length);
}

async function fetchClinicalLiterature(query, specialtyId, options = {}) {
    const { broad = false } = options;
    try {
        // Sanitize specialtyId: Ignore generic user roles like 'physicians', 'dentists', 'nurses', 'general'
        const validSpecialties = ['cardiology', 'pulmonology', 'gastroenterology', 'neurology', 'pediatrics', 'dermatology', 'infectious', 'endocrinology', 'nephrology', 'oncology', 'rheumatology'];
        const isSpecificSpecialty = specialtyId && validSpecialties.includes(specialtyId.toLowerCase());
        let categoryFilter = isSpecificSpecialty ? ` AND (${specialtyId})` : '';
        let evidenceFilter = broad ? '' : '(PUB_TYPE:"Systematic Review" OR PUB_TYPE:"Meta-Analysis" OR PUB_TYPE:"Practice Guideline" OR PUB_TYPE:"Review" OR PUB_TYPE:"Clinical Trial")';

        // 1. Europe PMC (Aggregates PubMed, PMC, Guidelines, Systematic Reviews)
        const fetchPMC = async (sortParam, isRecentOnly = false) => {
            try {
                const currentYear = new Date().getFullYear();
                const yearFilter = isRecentOnly && !broad ? ` AND (PUB_YEAR:[${currentYear - 2} TO ${currentYear}])` : '';
                // Ensure query terms are clean and not enclosed in broken syntax
                const cleanQuery = query.replace(/[()]/g, ' ').trim();
                const enhancedQuery = `(${cleanQuery})${categoryFilter}${evidenceFilter ? ` AND ${evidenceFilter}` : ''}${yearFilter}`;
                const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
                url.searchParams.append('query', enhancedQuery);
                url.searchParams.append('format', 'json');
                url.searchParams.append('resultType', 'core');
                url.searchParams.append('pageSize', '4');
                // Europe PMC's default ranking is relevance — measurably better for clinical
                // queries than date/citation sorting, which surfaces tangential full-text
                // matches. Recency intent is enforced by the PUB_YEAR filter instead.
                // An invalid sort value also makes the API return a version-only stub.
                if (sortParam) url.searchParams.append('sort', sortParam);

                const response = await fetch(url.toString());
                if (!response.ok) return [];
                const data = await response.json();
                const results = data.resultList?.result || [];
                if (!results.length && (data.hitCount === undefined || data.hitCount > 0)) {
                    // A stub response ({"version":...} without resultList) means the request was
                    // rejected or throttled; retry once unsorted before giving up.
                    const retryUrl = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
                    retryUrl.searchParams.append('query', enhancedQuery);
                    retryUrl.searchParams.append('format', 'json');
                    retryUrl.searchParams.append('resultType', 'core');
                    retryUrl.searchParams.append('pageSize', '4');
                    const retryResponse = await fetch(retryUrl.toString());
                    if (!retryResponse.ok) return [];
                    const retryData = await retryResponse.json();
                    results.push(...(retryData.resultList?.result || []));
                }
                
                return results.map(r => ({
                    source: 'Europe PMC / PubMed',
                    title: r.title,
                    author: r.authorString || 'Medical Consensus Group',
                    journal: r.journalTitle || r.pubType || 'Medical Journal',
                    year: r.pubYear ? r.pubYear.toString() : 'Recent',
                    url: r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : (r.doi ? `https://doi.org/${r.doi}` : `https://europepmc.org/article/MED/${r.id}`),
                    abstract: r.abstractText ? r.abstractText.replace(/<\/?(?:b|i|p|sup|sub)>/g, '') : '',
                    type: isRecentOnly ? 'Latest Evidence / Update (2024+)' : 'Landmark Guideline / Consensus'
                })).filter(r => r.abstract && isRelevantLiterature(r, cleanQuery));
            } catch { return []; }
        };

        // 2. ClinicalTrials.gov (Latest ongoing/completed trials)
        const fetchTrials = async () => {
            try {
                const cleanQuery = query.replace(/[()]/g, ' ').trim();
                const url = new URL('https://clinicaltrials.gov/api/v2/studies');
                url.searchParams.append('query.cond', cleanQuery);
                url.searchParams.append('pageSize', '2');
                url.searchParams.append('sort', 'LastUpdatePostDate:desc'); // Get latest
                
                const response = await fetch(url.toString());
                if (!response.ok) return [];
                const data = await response.json();
                const studies = data.studies || [];
                
                return studies.map(s => {
                    const protocol = s.protocolSection || {};
                    const nctId = protocol.identificationModule?.nctId || '';
                    return {
                        source: 'ClinicalTrials.gov',
                        title: protocol.identificationModule?.briefTitle || 'Clinical Trial',
                        author: protocol.sponsorCollaboratorsModule?.leadSponsor?.name || 'Clinical Research Sponsor',
                        journal: 'ClinicalTrials.gov Registry',
                        year: protocol.statusModule?.lastUpdateSubmitDate?.split('-')[0] || 'Recent',
                        url: nctId ? `https://clinicaltrials.gov/study/${nctId}` : 'https://clinicaltrials.gov',
                        abstract: protocol.descriptionModule?.briefSummary || 'Clinical trial investigating the condition or intervention.',
                        type: 'Clinical Trial / Experimental'
                    };
                }).filter(r => isRelevantLiterature(r, cleanQuery));
            } catch { return []; }
        };

        // 3. OpenFDA (Drug labels, warnings)
        const fetchFDA = async () => {
            try {
                const cleanQuery = query.replace(/[()]/g, ' ').trim();
                const url = new URL('https://api.fda.gov/drug/label.json');
                url.searchParams.append('search', `indications_and_usage:"${cleanQuery}" OR generic_name:"${cleanQuery}"`);
                url.searchParams.append('limit', '1');
                
                const response = await fetch(url.toString());
                if (!response.ok) return [];
                const data = await response.json();
                const results = data.results || [];
                
                return results.map(r => ({
                    source: 'OpenFDA (FDA.gov)',
                    title: `FDA Label: ${r.openfda?.brand_name?.[0] || r.openfda?.generic_name?.[0] || 'Drug'}`,
                    author: 'U.S. FDA Center for Drug Evaluation',
                    journal: 'FDA Official Labeling',
                    year: r.effective_time?.substring(0,4) || 'Current',
                    url: 'https://www.accessdata.fda.gov/scripts/cder/daf/',
                    abstract: `INDICATIONS: ${r.indications_and_usage?.[0] || 'N/A'}\nWARNINGS: ${r.boxed_warning?.[0] || r.warnings?.[0] || 'No boxed warnings.'}`,
                    type: 'Official FDA Data'
                })).filter(r => isRelevantLiterature(r, cleanQuery));
            } catch { return []; }
        };

        const [pmcLatest, pmcFoundational, trials, fda] = await Promise.all([
            fetchPMC(null, true), // Relevance-ranked within the 2024+ year filter
            fetchPMC(null, false), // Relevance-ranked foundational consensus
            fetchTrials(),
            fetchFDA()
        ]);

        // Prioritize newest 2024+ evidence first, followed by foundational consensus
        const allRefs = [...pmcLatest, ...pmcFoundational, ...trials, ...fda];
        return allRefs.slice(0, 6); // Limit total context size
    } catch {
        return [];
    }
}

module.exports = {
    fetchMedicalKnowledge,
    fetchClinicalLiterature,
};
