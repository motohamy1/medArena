function extractMaterialClaims(text) {
    return String(text || '').split(/(?<=[.!?؟])\s+|\n+/).map((part, index) => part.trim()).filter((part) => part.length >= 20 && /\b(recommend|avoid|use|dose|risk|contraindicat|should|must|ممنوع|ينصح|جرعة|خطر)\w*/i.test(part)).map((claim, index) => ({ id: `claim_${index + 1}`, text: claim, material: true }));
}

module.exports = { extractMaterialClaims };
