// Clinical safety gate (spec V3 §39/§43/§87).
//
// For medication/dosing/high-risk questions the system requires stronger
// evidence AND the clinically necessary inputs. If a critical input is missing,
// ask a TARGETED clarification — never fabricate a dose, never silently answer
// from partial information.
//
// Rules:
//   - pediatric dosing requires BOTH age and weight
//   - insulin / chemotherapy / anticoagulant / toxic dosing requires an
//     explicit indication (condition)
//   - renal-dosing questions without renal status -> proceed (renal status is
//     part of the question itself), but flagged in limitations
//
// The gate only fires when the answer materially depends on the missing value
// (spec §43: no unnecessary questions).

const PEDIATRIC_CUE = /\b(child|children|kid|pediatric|paediatric|infant|neonate|newborn|toddler)\b|طفل|أطفال|اطفال|طفلة|طفلين/i;
const INSULIN_CUE = /\binsulin\b|انسولين/i;
const CHEMO_CUE = /\b(chemotherap|oncology dose|cisplatin|doxorubicin|methotrexate)\b/i;

function assessDosingSafety(query) {
    if (query.intent !== 'drug_question') return null;

    const raw = String(query.raw_query || '');
    const isPediatric = PEDIATRIC_CUE.test(raw);
    const isInsulin = /insulin|انسولين/i.test(raw);
    const isChemo = CHEMO_CUE.test(raw);
    const isAnticoag = /heparin|warfarin|apixaban|anticoagul/i.test(raw);

    if (isPediatric) {
        const hasAge = (query.patient?.age?.value != null || query.patient?.age?.range != null)
            || (query.population?.age != null || query.population?.age_range != null);
        const hasWeight = query.patient?.weight_kg != null || query.population?.weight != null;
        const missingAge = !hasAge;
        const missingWeight = !hasWeight;
        if (missingAge || missingWeight) {
            const missing = [
                missingAge ? 'age' : null,
                missingWeight ? 'weight' : null,
            ].filter(Boolean);
            return {
                question: `To give a safe pediatric dose I need the child's exact ${missing.join(' and ')}. ${missing.map((m) => `What is the ${m}?`).join(' ')}`,
                missing,
                reason: 'pediatric_dosing_missing_parameters',
            };
        }
    }
    if ((isInsulin || isChemo || isAnticoag) && !query.condition) {
        return {
            question: 'Which indication is this medication intended for? The dose and safety profile depend on it.',
            missing: ['indication'],
            reason: 'high_risk_dosing_missing_indication',
        };
    }
    return null;
}

module.exports = { assessDosingSafety, PEDIATRIC_CUE };
