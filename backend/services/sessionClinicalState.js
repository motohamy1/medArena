// Spec §8/§18: conversation history alone is not enough. A structured session
// clinical state carries patient context across turns so follow-up questions
// ("طب وبديله؟" / "طب والحامل؟") resolve against established demographics.
// Attributes are only ever extracted from what the user stated — never invented
// (unknown stays unknown).
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
    const ageRange = (() => {
        const decade = scanText.match(/\b(?:in\s+)?(?:her|his|their)\s+(\d)0s\b/) || scanText.match(/\b(\d)0th\s+decade\b/) || scanText.match(/فوق\s*(?:ال)?(?:خمسين|50)/);
        if (decade) {
            const base = decade[1] ? Number(decade[1]) * 10 : 50;
            return [base, base + 9];
        }
        return null;
    })();
    const weight = extractNumber(scanText, [/(?:weight|wt|وزن)\s*(?:ها|ه)?\s*(\d{1,3}(?:\.\d+)?)\s*(?:kg|كيلو)?/, /(\d{1,3}(?:\.\d+)?)\s*kg/]);
    const female = /\b(female|woman|lady|she|her)\b|مريضة|انثى|أنثى/.test(scanText);
    const male = /\b(male|man)\b|مريض(?!ة)/.test(scanText);
    const sex = female && !male ? 'female' : male && !female ? 'male' : null;
    const pregnancy = /\bpregnant\b|\bpregnancy\b|حامل|الحمل/.test(scanText) || null;
    const obesity = /\bobes|سمنة|وزن.{0,10}(زيادة|زايد|كثير)/.test(scanText) || null;
    const renal = /\b(ckd|renal failure|renal impairment|kidney (failure|disease|impairment))\b|فشل كلوي|قصر الكلى/.test(scanText) || null;
    const hepatic = /\b(cirrhosis|hepatic impairment|liver (failure|disease))\b|تليف الكبد|فشل كبدي/.test(scanText) || null;
    const bloodPressure = (() => {
        const match = scanText.match(/(\d{2,3})\s*(?:\/|x|over|على)\s*(\d{2,3})/);
        if (!match) return null;
        const systolic = Number(match[1]);
        const diastolic = Number(match[2]);
        if (systolic >= 60 && systolic <= 250 && diastolic >= 30 && diastolic <= 150 && systolic > diastolic) {
            return { systolic, diastolic, unit: 'mmHg' };
        }
        return null;
    })();

    const state = {
        active: Boolean(age != null || ageRange || weight != null || pregnancy || obesity || renal || hepatic || sex || bloodPressure),
        age: age ?? null,
        age_range: ageRange,
        weight: weight ?? null,
        sex,
        pregnancy,
        obesity,
        blood_pressure: bloodPressure,
        renal_context: renal,
        hepatic_context: hepatic,
        updated_at: new Date().toISOString(),
    };
    return state;
}

module.exports = { extractSessionClinicalState };
