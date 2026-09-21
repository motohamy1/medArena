// Claim verification (spec V3 §24–§25, §26/§29).
//
// V2 used token-overlap only. V3 keeps token overlap as one signal but adds:
//  - numerical consistency: numbers in a claim must exist in the supporting
//    evidence (or the user's own query context) — never invented (§29)
//  - metadata-only gating: title-only records cannot directly support claims
//  - evidence-type gating: high-risk claims (dosing/pregnancy) need stronger
//    support ratios
//  - negation awareness: a claim asserting the OPPOSITE polarity of its
//    matched evidence cannot be counted as supported

const SUPPORT_LEVELS = Object.freeze(['SUPPORTED_DIRECT', 'SUPPORTED_INDIRECT', 'CONFLICTING', 'UNSUPPORTED']);

const HIGH_RISK_PATTERN = /\b(dose|mg|mcg|units?|iv|intravenous|pregnan|child|pediatric|infant|neonat|chemotherap|anticoagul|insulin|toxic)\w*/i;

function normalize(value) { return String(value || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean); }

function extractNumbers(text) {
    return (String(text || '').match(/\d+(?:\.\d+)?/g) || []).map(Number);
}

function numbersSupported(claimText, evidenceTexts, queryContextText) {
    const claimNumbers = extractNumbers(claimText);
    if (claimNumbers.length === 0) return true;
    const available = new Set([...extractNumbers(queryContextText), ...evidenceTexts.flatMap((text) => extractNumbers(text))]);
    // Every number in the claim must appear in evidence or query context.
    return claimNumbers.every((number) => available.has(number));
}

function negationMismatch(claimText, evidenceText) {
    const claimNegative = /\b(no|not|never|without|avoid|contraindicated|should not|must not)\b/i.test(claimText)
        || /ممنوع|غير|بدون|لا /i.test(claimText);
    const evidenceNegative = /\b(no|not|never|without|avoid|contraindicated|should not|must not)\b/i.test(evidenceText);
    // Flag polarity inversion: a claim whose polarity is the OPPOSITE of its
    // strongest matched evidence cannot be counted as supported.
    return claimNegative !== evidenceNegative;
}

function verifyClaim(claim, evidence = [], conflicts = [], queryContextText = '') {
    const claimTokens = new Set(normalize(claim.text));
    const isHighRisk = HIGH_RISK_PATTERN.test(claim.text);
    const matches = evidence.map((item) => {
        const evidenceText = String(item.content || item.excerpt || '');
        const contentTokens = new Set(normalize(evidenceText));
        const overlap = [...claimTokens].filter((token) => token.length > 3 && contentTokens.has(token)).length;
        const ratio = claimTokens.size ? overlap / claimTokens.size : 0;
        return { item, ratio, evidenceText };
    })
        .filter((match) => match.ratio >= 0.35)
        .sort((a, b) => b.ratio - a.ratio);
    const conflict = conflicts.some((conflictItem) => conflictItem.topic && normalize(claim.text).some((token) => normalize(conflictItem.topic).includes(token)));
    if (conflict) return { ...claim, support_level: 'CONFLICTING', source_ids: matches.map((match) => match.item.id).filter(Boolean) };
    if (matches.length === 0) return { ...claim, support_level: 'UNSUPPORTED', source_ids: [] };

    // Negation inversion check against the strongest match.
    if (matches.length > 0 && negationMismatch(claim.text, matches[0].evidenceText)) {
        return { ...claim, support_level: 'UNSUPPORTED', source_ids: [], reason: 'negation_mismatch' };
    }
    // Numerical safety (spec §29): claimed numbers must be traceable.
    const evidenceTexts = matches.slice(0, 3).map((match) => match.evidenceText);
    if (!numbersSupported(claim.text, evidenceTexts, queryContextText)) {
        return { ...claim, support_level: 'UNSUPPORTED', source_ids: [], reason: 'unsupported_numbers' };
    }
    const best = matches[0];
    const isMetadataOnly = best.item.evidence_depth === 'metadata_only';
    const requiredRatio = isHighRisk ? 0.6 : 0.5;
    // Title-only records cap out at INDIRECT support (spec §20).
    let level;
    if (best.ratio >= requiredRatio && !isMetadataOnly) level = 'SUPPORTED_DIRECT';
    else level = 'SUPPORTED_INDIRECT';
    if (isHighRisk && best.ratio < 0.5) level = 'UNSUPPORTED';
    return { ...claim, support_level: level, source_ids: matches.map((match) => match.item.id).filter(Boolean), high_risk: isHighRisk };
}

function verifyClaims(claims, evidence, conflicts = [], queryContextText = '') {
    return (claims || []).map((claim) => verifyClaim(claim, evidence, conflicts, queryContextText));
}

module.exports = { SUPPORT_LEVELS, verifyClaim, verifyClaims, extractNumbers };
