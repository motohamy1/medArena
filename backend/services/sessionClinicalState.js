// Spec §18: conversation history alone is not enough. A structured session
// clinical state carries patient context across turns so follow-up questions
// ("طب وبديله؟") resolve against established demographics. Attributes are only
// ever extracted from what the user stated — never invented.
function extractNumber(text, patterns) {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return Number(match[1]);
    }
    return null;
}

function extractSessionClinicalState(history = [], message = '') {
    const userTurns = [...(history || []), { text: message, isUser: true }].filter((turn) => turn && turn.isUser);
    const scanText = userTurns.map((turn) => String(turn.text || '')).join(' ').toLowerCase();
    if (!scanText.trim()) return { active: false };

    const age = extractNumber(scanText, [/(?:age|aged|year|years|سن)\s*(\d{1,3})/, /(\d{1,3})\s*(?:year|years|سنة)/]);
    const weight = extractNumber(scanText, [/(?:weight|wt|وزن)\s*(\d{1,3}(?:\.\d+)?)\s*(?:kg|كيلو)?/, /(\d{1,3}(?:\.\d+)?)\s*kg/]);
    const pregnancy = /\bpregnant\b|\bpregnancy\b|حامل|الحمل/.test(scanText) || null;
    const renal = /\b(ckd|renal failure|renal impairment|kidney (failure|disease|impairment))\b|فشل كلوي|قصر الكلى/.test(scanText) || null;
    const hepatic = /\b(cirrhosis|hepatic impairment|liver (failure|disease))\b|تليف الكبد|فشل كبدي/.test(scanText) || null;

    const state = {
        active: Boolean(age != null || weight != null || pregnancy || renal || hepatic),
        age: age ?? null,
        weight: weight ?? null,
        sex: null,
        pregnancy,
        renal_context: renal,
        hepatic_context: hepatic,
        updated_at: new Date().toISOString(),
    };
    return state;
}

module.exports = { extractSessionClinicalState };
