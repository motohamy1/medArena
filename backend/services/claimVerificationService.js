const SUPPORT_LEVELS = Object.freeze(['SUPPORTED_DIRECT', 'SUPPORTED_INDIRECT', 'CONFLICTING', 'UNSUPPORTED']);

function normalize(value) { return String(value || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean); }

function verifyClaim(claim, evidence = [], conflicts = []) {
    const claimTokens = new Set(normalize(claim.text));
    const matches = evidence.map((item) => {
        const contentTokens = new Set(normalize(item.content || item.excerpt));
        const overlap = [...claimTokens].filter((token) => token.length > 3 && contentTokens.has(token)).length;
        const ratio = claimTokens.size ? overlap / claimTokens.size : 0;
        return { item, ratio };
    }).filter((match) => match.ratio >= 0.35).sort((a, b) => b.ratio - a.ratio);
    const conflict = conflicts.some((conflictItem) => conflictItem.topic && normalize(claim.text).some((token) => normalize(conflictItem.topic).includes(token)));
    if (conflict) return { ...claim, support_level: 'CONFLICTING', source_ids: matches.map((match) => match.item.id).filter(Boolean) };
    if (matches.length === 0) return { ...claim, support_level: 'UNSUPPORTED', source_ids: [] };
    return { ...claim, support_level: matches[0].ratio >= 0.6 ? 'SUPPORTED_DIRECT' : 'SUPPORTED_INDIRECT', source_ids: matches.map((match) => match.item.id).filter(Boolean) };
}

function verifyClaims(claims, evidence, conflicts = []) { return (claims || []).map((claim) => verifyClaim(claim, evidence, conflicts)); }

module.exports = { SUPPORT_LEVELS, verifyClaim, verifyClaims };
