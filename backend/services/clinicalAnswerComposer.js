const { createAbstentionResponse, buildResponseContract } = require('../models/responseContracts');
const { extractMaterialClaims } = require('./claimExtractionService');
const { verifyClaims } = require('./claimVerificationService');

function buildEvidenceSource(item) {
    if (!item.id || !item.title || !(item.url || item.pmid || item.doi)) return null;
    return { id: item.id, source_type: item.source_type || item.sourceType || 'unknown', organization: item.organization || item.authority_source || null, title: item.title, version: item.version_tag || item.version || null, publication_date: item.publication_date || item.year || null, retrieved_at: item.retrieved_at || new Date().toISOString(), url: item.url || null, pmid: item.pmid || null, doi: item.doi || null, excerpt: item.excerpt || item.content || '' };
}

// Spec §4: natural language stays in text; distinct parts additionally land in
// structured sections parsed from the draft's "### Heading" markdown lines.
function parseDraftSections(draftText) {
    const text = String(draftText || '');
    const matches = [...text.matchAll(/^###\s+(.+)$/gm)];
    if (matches.length < 2) return [];
    const sections = [];
    for (let i = 0; i < matches.length; i++) {
        const title = matches[i][1].trim();
        const start = matches[i].index + matches[i][0].length;
        const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
        const body = text.slice(start, end).trim();
        if (title && body) sections.push({ id: `section_${sections.length + 1}`, title, text: body });
    }
    return sections;
}

function composeEvidenceAnswer({ query, evidence = [], sufficiency, conflicts = [], limitations = [], draftText, provider, sessionState }) {
    if (!sufficiency || ['NO_EVIDENCE', 'SYSTEM_FAILURE', 'OUTDATED'].includes(sufficiency.status)) return createAbstentionResponse({ status: sufficiency.status, queryMetadata: query, limitations: sufficiency.missing || limitations });
    const sources = evidence.map(buildEvidenceSource).filter(Boolean);
    const claims = verifyClaims(extractMaterialClaims(draftText || ''), evidence, conflicts);
    const unsupported = claims.filter((claim) => claim.support_level === 'UNSUPPORTED');
    const supportedClaims = claims.filter((claim) => claim.support_level !== 'UNSUPPORTED');
    const answerText = unsupported.length ? `${draftText}\n\nI could not verify every clinical claim from the retrieved sources; unsupported details have been omitted from the evidence record.` : draftText;
    return buildResponseContract({ answer: { type: query.intent || 'clinical_guidance', text: answerText, sections: parseDraftSections(answerText) }, evidence: { ...sufficiency, checked_at: new Date().toISOString(), freshness: sufficiency.status === 'VERIFIED' ? 'current' : 'mixed', sources_used: sources.length, primary_source_id: sources[0]?.id || null, sufficiency_score: sufficiency.score }, claims: supportedClaims, sources, conflicts, limitations: [...limitations, ...(unsupported.length ? ['some_generated_claims_failed_source_support'] : []), ...(provider ? [] : ['model_provider_not_recorded'])], query_metadata: { ...query, provider: provider || null, patient_context: sessionState || null } });
}

module.exports = { composeEvidenceAnswer };
