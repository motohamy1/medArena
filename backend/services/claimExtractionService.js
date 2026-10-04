// Material-claim extraction (spec V3 §24).
//
// A sentence is a material clinical claim only when it asserts something about
// the patient's care. Sentences whose subject is the retrieved evidence itself
// and that state an absence/limitation ("the evidence is insufficient", "the
// sources do not provide dosing") are limitation statements: stripping them as
// "unsupported claims" deleted the whole honest answer and left echoed prompt
// markers as the response text (observed in production 2026-10-03).

const MATERIAL_PATTERN = /\b(recommend|avoid|use|dose|risk|contraindicat|should|must|ممنوع|ينصح|جرعة|خطر)\w*/i;

const EVIDENCE_SUBJECT_PATTERN = /^(?:the\s+|based on (?:the\s+)?)?(?:provided|supplied|available|retrieved|selected|current)?\s*(?:evidence|sources?|literature|data|guidelines?|articles?|studies|records?)\b/i;
// First-person inability statements ("I cannot provide the dose... because the
// evidence does not contain it") are limitation statements too — the model
// must be able to say it cannot answer without that sentence being stripped.
const INABILITY_PREFIX_PATTERN = /^i(?:'m| am)?\s+(?:unable|not able|cannot|can't|can not)\b/i;
const LIMITATION_CUE_PATTERN = /\b(?:insufficient|inadequate|limited|lacking|lacks|unavailable|not available|not provided|not included|not reported|not specified|does not (?:contain|provide|include|address|report|specify|support)|do not (?:contain|provide|include|address|report|specify|support)|no (?:dosing|evidence|information|data|details|specific|direct))\b/i;

// Prompt-context markers ([SOURCE 2 | ...], [END SOURCE 2]) are never claims.
const CONTEXT_MARKER_ONLY_PATTERN = /^(?:\[\s*(?:END\s+)?SOURCE\s*\d+[^\]]*\]\s*)+$/i;

function isEvidenceLimitationStatement(text) {
    const value = String(text || '').trim();
    if (!LIMITATION_CUE_PATTERN.test(value)) return false;
    return EVIDENCE_SUBJECT_PATTERN.test(value) || INABILITY_PREFIX_PATTERN.test(value);
}

function extractMaterialClaims(text) {
    return String(text || '')
        .split(/(?<=[.!?؟])\s+|\n+/)
        .map((part) => part.trim())
        .filter((part) => part.length >= 20)
        .filter((part) => !CONTEXT_MARKER_ONLY_PATTERN.test(part))
        .filter((part) => !isEvidenceLimitationStatement(part))
        .filter((part) => MATERIAL_PATTERN.test(part))
        .map((claim, index) => ({ id: `claim_${index + 1}`, text: claim, material: true }));
}

module.exports = { extractMaterialClaims };
