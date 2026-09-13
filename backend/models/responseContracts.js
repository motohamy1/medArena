const EVIDENCE_STATUSES = Object.freeze(['VERIFIED', 'PARTIAL', 'CONFLICTING', 'OUTDATED', 'NO_EVIDENCE', 'SYSTEM_FAILURE']);

function createAbstentionResponse({ status = 'NO_EVIDENCE', queryMetadata = {}, limitations = [], checkedAt = new Date().toISOString() } = {}) {
    const messageByStatus = {
        NO_EVIDENCE: "I couldn't retrieve sufficient authoritative evidence to verify that point.",
        SYSTEM_FAILURE: "The evidence service could not be reached right now, so I can't verify this answer safely.",
        OUTDATED: 'I found relevant evidence, but I could not confirm that it is current enough for this request.',
    };
    return buildResponseContract({
        answer: { type: 'clinical_guidance', text: messageByStatus[status] || "I couldn't verify this answer from sufficient evidence.", sections: [] },
        evidence: { status, checked_at: checkedAt, freshness: status === 'OUTDATED' ? 'outdated' : 'unknown', sources_used: 0, primary_source_id: null, sufficiency_score: 0 },
        claims: [], sources: [], conflicts: [], limitations: limitations.length ? limitations : ['insufficient_authoritative_evidence'], query_metadata: queryMetadata,
    });
}

function buildResponseContract({ answer, evidence, claims = [], sources = [], conflicts = [], limitations = [], query_metadata = {} }) {
    if (!answer || typeof answer.text !== 'string') throw new Error('VALIDATION_FAILURE: answer.text is required');
    if (!EVIDENCE_STATUSES.includes(evidence?.status)) throw new Error('VALIDATION_FAILURE: invalid evidence.status');
    const validSources = sources.filter((source) => source && source.id && source.title && (source.url || source.pmid || source.doi));
    const sourceIds = new Set(validSources.map((source) => source.id));
    const validClaims = claims.filter((claim) => claim && claim.id && claim.text && Array.isArray(claim.source_ids) && claim.source_ids.every((id) => sourceIds.has(id)));
    return {
        answer: { type: answer.type || 'clinical_guidance', text: answer.text, sections: Array.isArray(answer.sections) ? answer.sections : [] },
        evidence: { status: evidence.status, checked_at: evidence.checked_at || new Date().toISOString(), freshness: evidence.freshness || 'unknown', sources_used: validSources.length, primary_source_id: sourceIds.has(evidence.primary_source_id) ? evidence.primary_source_id : null, sufficiency_score: evidence.sufficiency_score ?? null },
        claims: validClaims,
        sources: validSources,
        conflicts: Array.isArray(conflicts) ? conflicts : [],
        limitations: Array.isArray(limitations) ? limitations : [],
        query_metadata: query_metadata || {},
    };
}

module.exports = { EVIDENCE_STATUSES, buildResponseContract, createAbstentionResponse };
