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

// Shared tokenization for relevance checks.
function getQueryTokens(queryKeywords) {
    const stopWords = new Set(['and', 'the', 'for', 'with', 'under', 'over', 'from', 'what', 'how', 'when', 'which', 'latest', 'recent', 'only', 'guideline', 'guidelines']);
    return String(queryKeywords || '')
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2 && !stopWords.has(t) && !/^\d+$/.test(t));
}

// Token-overlap relevance in [0,1]. The denominator is capped so long clinical
// questions don't dilute scores below usable thresholds; an irrelevant record
// scores ~0 while a focused one scores high.
function computeRelevance(text, tokens) {
    if (!tokens.length) return 0.6;
    const combined = String(text || '').toLowerCase();
    const matches = tokens.filter(tok => {
        if (tok === 'pylori' || tok === 'helicobacter') return combined.includes('pylori') || combined.includes('helicobacter');
        if (tok.startsWith('child') || tok.startsWith('pediatr')) return combined.includes('child') || combined.includes('pediatr') || combined.includes('adolesc');
        return combined.includes(tok);
    });
    return Number(Math.min(1, matches.length / Math.min(tokens.length, 6)).toFixed(4));
}

function isRelevantLiterature(ref, queryKeywords) {
    if (!ref || !ref.title) return false;
    const combinedText = `${ref.title} ${ref.abstract || ''}`.toLowerCase();
    const tokens = getQueryTokens(queryKeywords);

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
    const { broad = false, includeTrials = true, includeFda = true } = options;
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
                `(${core.slice(0, 6).join(' ')})${categoryFilter}`,
                `(${core.slice(0, 3).join(' ')})${categoryFilter}`,
            ] : [
                `(${cleanQuery})${categoryFilter}${evidenceSuffix}${yearFilter}`,
                `(${cleanQuery})${categoryFilter}${evidenceSuffix}`,
                `(${cleanQuery})${categoryFilter}`,
                `(${core.slice(0, 6).join(' ')})${categoryFilter}`,
                `(${core.slice(0, 3).join(' ')})${categoryFilter}`,
            ];

            for (const enhancedQuery of variants) {
                try {
                    const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
                    url.searchParams.append('query', enhancedQuery);
                    url.searchParams.append('format', 'json');
                    url.searchParams.append('resultType', 'core');
                    url.searchParams.append('pageSize', '4');
                    // Europe PMC's default ranking is relevance — measurably better for
                    // clinical queries than date/citation sorting, which surfaces
                    // tangential full-text matches. Recency intent is enforced by the
                    // PUB_YEAR filter instead. An invalid sort value also makes the API
                    // return a version-only stub.
                    const response = await fetch(url.toString());
                    if (!response.ok) continue;
                    const data = await response.json();
                    let results = data.resultList?.result || [];
                    if (!results.length && (data.hitCount === undefined || data.hitCount > 0)) {
                        // A stub response ({"version":...} without resultList) means the
                        // request was rejected or throttled; retry once unsorted.
                        const retryUrl = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
                        retryUrl.searchParams.append('query', enhancedQuery);
                        retryUrl.searchParams.append('format', 'json');
                        retryUrl.searchParams.append('resultType', 'core');
                        retryUrl.searchParams.append('pageSize', '4');
                        const retryResponse = await fetch(retryUrl.toString());
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
                } catch { continue; }
            }
            return [];
        };

        // 2. ClinicalTrials.gov (Latest ongoing/completed trials)
        const fetchTrials = async () => {
            try {
                const cleanQuery = query.replace(/[()]/g, ' ').trim();
                const tokens = getQueryTokens(cleanQuery);
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
            } catch { return []; }
        };

        // 3. OpenFDA (Drug labels, warnings)
        const fetchFDA = async () => {
            try {
                const cleanQuery = query.replace(/[()]/g, ' ').trim();
                const tokens = getQueryTokens(cleanQuery);
                // openFDA phrase-searches fail on long natural-language queries;
                // AND the top discriminating tokens instead (spec §16 expansion).
                const focus = tokens.slice(0, 3);
                const termQuery = focus.length ? `(${focus.join(' AND ')})` : `"${cleanQuery}"`;
                const url = new URL('https://api.fda.gov/drug/label.json');
                url.searchParams.append('search', `indications_and_usage:${termQuery} OR generic_name:${termQuery}`);
                url.searchParams.append('limit', '1');

                const response = await fetch(url.toString());
                if (!response.ok) return [];
                const data = await response.json();
                const results = data.results || [];

                return results.map(r => {
                    const abstract = `INDICATIONS: ${r.indications_and_usage?.[0] || 'N/A'}\nWARNINGS: ${r.boxed_warning?.[0] || r.warnings?.[0] || 'No boxed warnings.'}`;
                    return {
                        source: 'OpenFDA (FDA.gov)',
                        title: `FDA Label: ${r.openfda?.brand_name?.[0] || r.openfda?.generic_name?.[0] || 'Drug'}`,
                        author: 'U.S. FDA Center for Drug Evaluation',
                        journal: 'FDA Official Labeling',
                        year: r.effective_time?.substring(0,4) || 'Current',
                        url: 'https://www.accessdata.fda.gov/scripts/cder/daf/',
                        abstract,
                        type: 'Official FDA Data',
                        relevance_score: computeRelevance(`${r.openfda?.brand_name?.[0] || ''} ${r.openfda?.generic_name?.[0] || ''} ${abstract}`, tokens),
                    };
                }).filter(r => isRelevantLiterature(r, cleanQuery));
            } catch { return []; }
        };

        const tasks = [fetchPMC(true), fetchPMC(false)];
        if (includeTrials) tasks.push(fetchTrials());
        if (includeFda) tasks.push(fetchFDA());
        const [pmcLatest, pmcFoundational, trials = [], fda = []] = await Promise.all(tasks);

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
    getQueryTokens,
    computeRelevance,
};
