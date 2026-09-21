// Evidence sufficiency + per-task coverage matrix (spec V3 §22, §25–§26).
//
// V2 collapsed every failure toward NO_EVIDENCE and treated fabricated
// is_current flags as proof of currency. V3:
//  - consumes the real freshness bands set by evidenceRetrievalService
//  - distinguishes NO_RELEVANT_EVIDENCE (search worked, nothing relevant)
//    from SOURCE_UNAVAILABLE (sources failed) and INSUFFICIENT_EVIDENCE
//  - produces a per-task coverage matrix so the composer knows which parts
//    of the question are supported

const STATUSES = Object.freeze({
    VERIFIED: 'VERIFIED',
    PARTIAL: 'PARTIAL',
    CONFLICTING: 'CONFLICTING',
    OUTDATED: 'OUTDATED',
    NO_EVIDENCE: 'NO_EVIDENCE',
    NO_RELEVANT_EVIDENCE: 'NO_RELEVANT_EVIDENCE',
    SOURCE_UNAVAILABLE: 'SOURCE_UNAVAILABLE',
    SYSTEM_FAILURE: 'SYSTEM_FAILURE',
    CLARIFICATION_REQUIRED: 'CLARIFICATION_REQUIRED',
});

// Honest freshness acceptance (spec §0.4/§15): 'current' or 'recent' bands are
// acceptable; 'old'/'unknown' count only when currency was not requested.
const ACCEPTABLE_FRESHNESS = new Set(['current', 'recent']);

function assessEvidenceSufficiency(evidence, query = {}, diagnostics = {}) {
    const items = Array.isArray(evidence) ? evidence : [];

    if (diagnostics.systemFailure && items.length === 0) {
        return { status: STATUSES.SYSTEM_FAILURE, score: 0, missing: ['evidence_service'], conflicts: [], support_coverage: 0 };
    }
    if (diagnostics.sourceUnavailable && items.length === 0) {
        return { status: STATUSES.SOURCE_UNAVAILABLE, score: 0, missing: ['source_availability'], conflicts: [], support_coverage: 0 };
    }
    if (items.length === 0) {
        // Retrieval ran and legitimately found nothing relevant.
        return { status: STATUSES.NO_RELEVANT_EVIDENCE, score: 0, missing: ['authoritative_source', 'direct_relevance'], conflicts: [], support_coverage: 0 };
    }

    const authoritative = items.filter((item) => Number(item.authority_tier || 4) <= 1 || Number(item.authority_score || 0) >= 0.9);
    const direct = items.filter((item) => Number(item.relevance_score ?? item.similarity ?? 0) >= 0.55);
    const currentRequired = query.temporal_request === 'current' || query.intent === 'latest_evidence';
    const current = items.filter((item) =>
        !currentRequired
        || item.is_current === true
        || item.document_status === 'CURRENT'
        || ACCEPTABLE_FRESHNESS.has(item.freshness)
    );
    const conflicts = diagnostics.conflicts || [];
    const missing = [];
    if (authoritative.length === 0) missing.push('authoritative_source');
    if (direct.length === 0) missing.push('direct_relevance');
    if (currentRequired && current.length === 0) missing.push('current_evidence');

    // Population match: only claimed when evidence actually mentions the
    // stated demographics; never a constant 0.5 default (spec §84/§85).
    const populationTerms = [];
    if (query.population?.sex) populationTerms.push(query.population.sex);
    if (query.patient?.pregnancy) populationTerms.push('pregnan');
    if (query.patient?.obesity) populationTerms.push('obes');
    const populationMentionCount = populationTerms.length
        ? items.filter((item) => {
            const text = `${item.title || ''} ${item.content || ''}`.toLowerCase();
            return populationTerms.every((term) => text.includes(term));
        }).length
        : 0;
    if (populationTerms.length > 0 && populationMentionCount === 0) missing.push('population_match');

    if (conflicts.length > 0) {
        return { status: STATUSES.CONFLICTING, score: 0.5, missing, conflicts, support_coverage: Number((direct.length / items.length).toFixed(4)) };
    }
    // Explicitly superseded/withdrawn documents (real temporal metadata, not
    // "old by date") must not be presented as an answer basis (spec §15/§82).
    const supersededOnly = items.every((item) => item.document_status === 'SUPERSEDED' || item.document_status === 'WITHDRAWN' || item.superseded_date);
    if (supersededOnly) {
        return { status: STATUSES.OUTDATED, score: 0.2, missing: [...missing, 'superseded_documents'], conflicts: [], support_coverage: Number((direct.length / items.length).toFixed(4)) };
    }
    const coverage = direct.length / items.length;
    if (direct.length === 0) {
        // Retrieval ran but nothing directly relevant: honest abstention,
        // never a weak PARTIAL built on tangential records (spec §23/§26).
        return { status: STATUSES.NO_RELEVANT_EVIDENCE, score: 0, missing, conflicts: [], support_coverage: 0 };
    }
    if (authoritative.length > 0 && direct.length > 0 && (!currentRequired || current.length > 0)) {
        return {
            status: coverage >= 0.7 ? STATUSES.VERIFIED : STATUSES.PARTIAL,
            score: Number(((authoritative.length > 0 ? 0.5 : 0) + coverage * 0.5).toFixed(4)),
            missing,
            conflicts: [],
            support_coverage: Number(coverage.toFixed(4)),
        };
    }
    if (currentRequired && current.length === 0 && direct.length > 0) {
        // Spec §14: current evidence is PREFERRED for treatment questions, not
        // mandatory. Old-but-relevant evidence yields PARTIAL with the gap
        // recorded; full abstention (OUTDATED) is reserved for explicitly
        // superseded documents.
        return { status: STATUSES.PARTIAL, score: Number((coverage * 0.4).toFixed(4)), missing, conflicts: [], support_coverage: Number(coverage.toFixed(4)) };
    }
    return { status: STATUSES.PARTIAL, score: Number((coverage * 0.5).toFixed(4)), missing, conflicts: [], support_coverage: Number(coverage.toFixed(4)) };
}

// Per-task coverage (spec §22): PARTIAL means *some material parts* are
// supported — the response must identify which parts.
function buildCoverageMatrix(tasks, evidence = []) {
    const items = Array.isArray(evidence) ? evidence : [];
    return (tasks || []).map((task) => {
        const textProbe = `${task.question} ${(task.queries || []).join(' ')}`.toLowerCase();
        const probeTerms = [...new Set(textProbe.split(/[^a-z0-9]+/).filter((term) => term.length > 4))].slice(0, 8);
        const relevant = items.filter((item) => {
            const itemText = `${item.title || ''} ${item.content || ''}`.toLowerCase();
            const hits = probeTerms.filter((term) => itemText.includes(term)).length;
            return Number(item.relevance_score ?? 0) >= 0.55 && hits >= Math.min(2, Math.max(1, probeTerms.length - 2));
        });
        const supported = relevant.filter((item) => ACCEPTABLE_FRESHNESS.has(item.freshness) || !task.freshness_requirement || task.freshness_requirement === 'not_specified');
        let coverage;
        if (supported.length > 0) coverage = 'supported';
        else if (relevant.length > 0) coverage = 'partially_supported';
        else coverage = 'unsupported';
        return {
            task_id: task.task_id,
            question: task.question,
            coverage,
            supporting_evidence_ids: (coverage === 'supported' ? supported : relevant).map((item) => item.id).slice(0, 4),
        };
    });
}

module.exports = { STATUSES, assessEvidenceSufficiency, buildCoverageMatrix };
