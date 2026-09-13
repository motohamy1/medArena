const STATUSES = Object.freeze({ VERIFIED: 'VERIFIED', PARTIAL: 'PARTIAL', CONFLICTING: 'CONFLICTING', OUTDATED: 'OUTDATED', NO_EVIDENCE: 'NO_EVIDENCE', SYSTEM_FAILURE: 'SYSTEM_FAILURE' });

function assessEvidenceSufficiency(evidence, query = {}, diagnostics = {}) {
    const items = Array.isArray(evidence) ? evidence : [];
    if (diagnostics.systemFailure && items.length === 0) return { status: STATUSES.SYSTEM_FAILURE, score: 0, missing: ['evidence_service'], conflicts: [], support_coverage: 0 };
    if (items.length === 0) return { status: STATUSES.NO_EVIDENCE, score: 0, missing: ['authoritative_source', 'direct_relevance'], conflicts: [], support_coverage: 0 };
    const authoritative = items.filter((item) => Number(item.authority_tier || 4) <= 1 || Number(item.authority_score || 0) >= 0.9);
    const direct = items.filter((item) => Number(item.relevance_score ?? item.similarity ?? 0) >= 0.55);
    const currentRequired = query.temporal_request === 'current' || query.intent === 'latest_evidence';
    const current = items.filter((item) => item.is_current === true || item.document_status === 'CURRENT' || !currentRequired);
    const conflicts = diagnostics.conflicts || [];
    const missing = [];
    if (authoritative.length === 0) missing.push('authoritative_source');
    if (direct.length === 0) missing.push('direct_relevance');
    if (current.length === 0) missing.push('current_evidence');
    if (query.population?.age != null && !items.some((item) => item.population_match >= 0.7)) missing.push('population_match');
    if (conflicts.length > 0) return { status: STATUSES.CONFLICTING, score: 0.5, missing, conflicts, support_coverage: Number((direct.length / items.length).toFixed(4)) };
    const coverage = direct.length / items.length;
    if (authoritative.length > 0 && direct.length > 0 && current.length > 0) return { status: coverage >= 0.7 ? STATUSES.VERIFIED : STATUSES.PARTIAL, score: Number(((authoritative.length > 0 ? 0.5 : 0) + coverage * 0.5).toFixed(4)), missing, conflicts: [], support_coverage: Number(coverage.toFixed(4)) };
    return { status: current.length === 0 ? STATUSES.OUTDATED : STATUSES.PARTIAL, score: Number((coverage * 0.5).toFixed(4)), missing, conflicts: [], support_coverage: Number(coverage.toFixed(4)) };
}

module.exports = { STATUSES, assessEvidenceSufficiency };
