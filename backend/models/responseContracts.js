// Structured response contract (spec V3 §28, §29, §32, §38).
//
// Statuses now match the spec's failure taxonomy; every abstention carries a
// structured reason and the frontend maps statuses to distinct UI states
// (System Failure ≠ No Relevant Evidence ≠ Retrieval Unavailable).

const EVIDENCE_STATUSES = Object.freeze([
    'VERIFIED', 'PARTIAL', 'CONFLICTING', 'OUTDATED',
    'NO_EVIDENCE', 'NO_RELEVANT_EVIDENCE',
    'SOURCE_UNAVAILABLE', 'RETRIEVAL_TIMEOUT',
    'SYSTEM_FAILURE', 'CLARIFICATION_REQUIRED',
]);

const ABSTENTION_MESSAGES = Object.freeze({
    NO_EVIDENCE: "I couldn't retrieve sufficient authoritative evidence to verify that point.",
    NO_RELEVANT_EVIDENCE: 'I searched the available authoritative sources but found no evidence directly relevant to this question.',
    SOURCE_UNAVAILABLE: 'The evidence sources needed for this question are unavailable right now, so I cannot verify an answer.',
    RETRIEVAL_TIMEOUT: 'Evidence retrieval did not complete within the allowed time, so I cannot verify an answer yet. Please retry.',
    SYSTEM_FAILURE: 'The evidence service could not be reached right now, so I cannot verify this answer safely.',
    OUTDATED: 'I found relevant evidence, but I could not confirm that it is current enough for this request.',
    CLARIFICATION_REQUIRED: null, // composed by createClarificationResponse
});

function createAbstentionResponse({ status = 'NO_RELEVANT_EVIDENCE', queryMetadata = {}, limitations = [], checkedAt = new Date().toISOString(), retryable = false } = {}) {
    return buildResponseContract({
        answer: { type: 'clinical_guidance', text: ABSTENTION_MESSAGES[status] || "I couldn't verify this answer from sufficient evidence.", sections: [] },
        evidence: { status, checked_at: checkedAt, freshness: status === 'OUTDATED' ? 'outdated' : 'unknown', sources_used: 0, primary_source_id: null, sufficiency_score: 0, retryable },
        claims: [], sources: [], conflicts: [], limitations: limitations.length ? limitations : ['insufficient_authoritative_evidence'], query_metadata: queryMetadata,
    });
}

// Spec §43/§105: ambiguity that materially changes the answer asks a targeted
// clarification question instead of guessing (CCP → "Did you mean CCB?").
function createClarificationResponse({ clarification, queryMetadata = {}, checkedAt = new Date().toISOString() } = {}) {
    const question = clarification?.question || 'Could you clarify the clinical term you used?';
    return buildResponseContract({
        answer: { type: 'clarification', text: question, sections: [] },
        evidence: { status: 'CLARIFICATION_REQUIRED', checked_at: checkedAt, freshness: 'unknown', sources_used: 0, primary_source_id: null, sufficiency_score: 0 },
        claims: [], sources: [], conflicts: [], limitations: ['ambiguous_clinical_term'], query_metadata: query_metadata,
    });
}

// Structured HTTP error (spec §38): machine-readable code + retryable flag.
function buildErrorResponse({ code, message, retryable = false, requestId = null, details = null }) {
    return { error: { code, message, retryable }, request_id: requestId };
}

function buildResponseContract({ answer, evidence, claims = [], sources = [], conflicts = [], limitations = [], query_metadata = {} }) {
    if (!answer || typeof answer.text !== 'string') throw new Error('VALIDATION_FAILURE: answer.text is required');
    if (!EVIDENCE_STATUSES.includes(evidence?.status)) throw new Error(`VALIDATION_FAILURE: invalid evidence.status ${evidence?.status}`);
    const validSources = sources.filter((source) => source && source.id && source.title && (source.url || source.pmid || source.doi));
    const sourceIds = new Set(validSources.map((source) => source.id));
    const validClaims = claims.filter((claim) => claim && claim.id && claim.text && Array.isArray(claim.source_ids) && claim.source_ids.every((id) => sourceIds.has(id)));
    return {
        answer: { type: answer.type || 'clinical_guidance', text: answer.text, sections: Array.isArray(answer.sections) ? answer.sections : [] },
        evidence: { status: evidence.status, checked_at: evidence.checked_at || new Date().toISOString(), freshness: evidence.freshness || 'unknown', sources_used: validSources.length, primary_source_id: sourceIds.has(evidence.primary_source_id) ? evidence.primary_source_id : null, sufficiency_score: evidence.sufficiency_score ?? null, ...(evidence.retryable !== undefined ? { retryable: evidence.retryable } : {}) },
        claims: validClaims,
        sources: validSources,
        conflicts: Array.isArray(conflicts) ? conflicts : [],
        limitations: Array.isArray(limitations) ? limitations : [],
        query_metadata: query_metadata || {},
    };
}

module.exports = { EVIDENCE_STATUSES, buildResponseContract, createAbstentionResponse, createClarificationResponse, buildErrorResponse };
