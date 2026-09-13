const SOURCE_REGISTRY = Object.freeze({
    who: {
        id: 'who',
        name: 'WHO',
        type: 'guideline',
        tier: 1,
        authorityScore: 1,
        jurisdictions: ['international'],
        capabilities: ['guideline', 'recommendation', 'surveillance'],
        enabled: true,
    },
    nice: {
        id: 'nice',
        name: 'NICE',
        type: 'guideline',
        tier: 1,
        authorityScore: 1,
        jurisdictions: ['UK', 'international'],
        capabilities: ['guideline', 'recommendation', 'surveillance'],
        enabled: true,
    },
    cdc: {
        id: 'cdc',
        name: 'CDC',
        type: 'guideline',
        tier: 1,
        authorityScore: 1,
        jurisdictions: ['US', 'international'],
        capabilities: ['guideline', 'recommendation', 'surveillance'],
        enabled: true,
    },
    fda: {
        id: 'fda',
        name: 'FDA',
        type: 'regulatory',
        tier: 1,
        authorityScore: 1,
        jurisdictions: ['US'],
        capabilities: ['label', 'warning', 'safety'],
        enabled: true,
    },
    ema: {
        id: 'ema',
        name: 'EMA',
        type: 'regulatory',
        tier: 1,
        authorityScore: 1,
        jurisdictions: ['EU', 'international'],
        capabilities: ['label', 'warning', 'safety'],
        enabled: true,
    },
    mhra: {
        id: 'mhra',
        name: 'MHRA',
        type: 'regulatory',
        tier: 1,
        authorityScore: 1,
        jurisdictions: ['UK'],
        capabilities: ['safety', 'alert'],
        enabled: true,
    },
    pubmed: {
        id: 'pubmed',
        name: 'NCBI PubMed',
        type: 'literature',
        tier: 2,
        authorityScore: 0.85,
        jurisdictions: ['international'],
        capabilities: ['search', 'article_metadata', 'abstract'],
        enabled: true,
    },
    europe_pmc: {
        id: 'europe_pmc',
        name: 'Europe PMC',
        type: 'literature',
        tier: 2,
        authorityScore: 0.85,
        jurisdictions: ['international'],
        capabilities: ['search', 'article_metadata', 'abstract'],
        enabled: true,
    },
    clinicaltrials_gov: {
        id: 'clinicaltrials_gov',
        name: 'ClinicalTrials.gov',
        type: 'trial_registry',
        tier: 3,
        authorityScore: 0.7,
        jurisdictions: ['international'],
        capabilities: ['trial_discovery', 'emerging_evidence'],
        enabled: true,
    },
    huggingface_medical_reasoning: {
        id: 'huggingface_medical_reasoning',
        name: 'Hugging Face Medical Reasoning Dataset',
        type: 'discovery',
        tier: 4,
        authorityScore: 0.1,
        jurisdictions: ['international'],
        capabilities: ['discovery'],
        enabled: false,
    },
});

function getSource(sourceId) {
    return SOURCE_REGISTRY[sourceId] || null;
}

function listEnabledSources() {
    return Object.values(SOURCE_REGISTRY).filter((source) => source.enabled);
}

module.exports = {
    SOURCE_REGISTRY,
    getSource,
    listEnabledSources,
};
