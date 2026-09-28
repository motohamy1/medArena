const { getQueryTokens, computeRelevance } = require('../backend/services/medicalSearchService');

const EXPECTED_ABSTENTION = new Set(['NO_EVIDENCE', 'NO_RELEVANT_EVIDENCE']);
const CLARIFIABLE = new Set(['NO_EVIDENCE', 'NO_RELEVANT_EVIDENCE', 'CLARIFICATION_REQUIRED']);
const ANSWER_STATUSES = new Set(['VERIFIED', 'PARTIAL', 'CONFLICTING', 'OUTDATED']);
const MODIFIERS = new Set(['obesity', 'pregnancy', 'renal', 'hepatic']);

function expectedStatusPass(expected, actual) {
    if (expected === 'abstain') return EXPECTED_ABSTENTION.has(actual);
    if (expected === 'abstain_or_clarify') return CLARIFIABLE.has(actual);
    return String(expected || '').split('|').map((status) => status.trim()).includes(actual);
}

function getAnchorGroups(item, data) {
    if (Array.isArray(item.expected_source_terms) && item.expected_source_terms.length) {
        return item.expected_source_terms.map((term) => getQueryTokens(term)).filter((tokens) => tokens.length);
    }
    const metadata = data.query_metadata || {};
    const condition = (metadata.conditions || []).find((entry) => entry?.concept && !MODIFIERS.has(entry.concept))?.concept
        || (metadata.condition && !MODIFIERS.has(metadata.condition) ? metadata.condition : null);
    const anchor = (metadata.retrieval_anchors || []).find(Boolean)
        || condition
        || metadata.medications?.[0]
        || metadata.drug_classes?.[0]
        || metadata.symptoms?.[0]
        || metadata.labs?.[0]?.name;
    const tokens = getQueryTokens(anchor || '');
    return tokens.length ? [tokens] : [];
}

function sourceText(source) {
    return `${source?.title || ''} ${source?.excerpt || ''} ${source?.content || ''}`;
}

function evaluateBenchmarkResult(item, data) {
    const status = data?.evidence?.status || 'UNKNOWN';
    const sources = Array.isArray(data?.sources) ? data.sources : [];
    const claims = Array.isArray(data?.claims) ? data.claims : [];
    const errors = [];
    const statusOk = expectedStatusPass(item.expected_status, status);
    if (!statusOk) errors.push(`unexpected_status:${status}`);

    const isExpectedAnswer = String(item.expected_status || '').split('|').some((expected) => ANSWER_STATUSES.has(expected.trim()));
    if (isExpectedAnswer) {
        if (!String(data?.answer?.text || '').trim()) errors.push('missing_answer_text');
        if (!sources.length) errors.push('missing_sources');
        if (sources.some((source) => !source?.id || !source?.title || !(source?.url || source?.pmid || source?.doi))) errors.push('unresolvable_source');

        const anchorGroups = getAnchorGroups(item, data);
        if (!anchorGroups.length) errors.push('missing_canonical_anchor');
        for (const tokens of anchorGroups) {
            if (!sources.some((source) => computeRelevance(sourceText(source), tokens) >= 0.55)) {
                errors.push(`no_source_for_anchor:${tokens.join('_')}`);
            }
        }

        for (const claim of claims) {
            if (claim.support_level === 'UNSUPPORTED') errors.push(`unsupported_claim:${String(claim.id || claim.text || 'unknown').slice(0, 40)}`);
            if (!Array.isArray(claim.source_ids) || claim.source_ids.some((id) => !sources.some((source) => source.id === id))) {
                errors.push(`unlinked_claim:${String(claim.id || claim.text || 'unknown').slice(0, 40)}`);
            }
        }
    } else if (EXPECTED_ABSTENTION.has(status) || status === 'CLARIFICATION_REQUIRED') {
        if (sources.length) errors.push('abstention_contains_sources');
        if (claims.length) errors.push('abstention_contains_claims');
    }

    const expectedTypes = item.expected_source_types || [];
    const sourceTypes = [...new Set(sources.map((source) => source?.source_type).filter(Boolean))];
    const sourceTypesOk = !expectedTypes.length || expectedTypes.some((type) => sourceTypes.includes(type));
    if (!sourceTypesOk) errors.push(`missing_expected_source_type:${expectedTypes.join('|')}`);

    return { pass: errors.length === 0, status, errors, source_types: sourceTypes, source_count: sources.length };
}

module.exports = { evaluateBenchmarkResult, expectedStatusPass, getAnchorGroups };
