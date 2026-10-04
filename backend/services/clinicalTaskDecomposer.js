// Clinical Task Decomposer (spec V3 §12–§13).
//
// Converts an interpreted canonical clinical query into bounded answerable
// evidence tasks with explicit evidence requirements. Retrieval plans then
// target these tasks individually instead of one broad query per intent.

const TASK_CATALOG = Object.freeze({
    guideline_question: [
        { id: 'classify_context', question: 'clinical context classification', required_evidence_type: 'guideline', priority: 1 },
        { id: 'first_line_classes', question: 'recommended initial treatment classes', required_evidence_type: 'guideline', priority: 1 },
        { id: 'patient_modifiers', question: 'patient-specific treatment modifiers', required_evidence_type: 'guideline', priority: 2, only_if: (q) => Boolean(q.patient.obesity || q.patient.renal_status === 'present' || q.patient.hepatic_status === 'present' || q.patient.pregnancy || q.patient.age.value || q.patient.age.range) },
    ],
    clinical_management: [
        { id: 'management_recommendation', question: 'management recommendation', required_evidence_type: 'guideline', priority: 1 },
        { id: 'patient_modifiers', question: 'patient-specific considerations', required_evidence_type: 'guideline', priority: 2, only_if: (q) => Boolean(q.patient.obesity || q.patient.renal_status === 'present' || q.patient.hepatic_status === 'present' || q.patient.pregnancy) },
    ],
    drug_question: [
        { id: 'dose_determination', question: 'dose/route/frequency for the stated indication', required_evidence_type: 'regulatory', priority: 1 },
        { id: 'dose_modifiers', question: 'renal/hepatic/age/weight dose adjustments', required_evidence_type: 'regulatory', priority: 2, only_if: (q) => q.patient.renal_status !== 'unknown' || q.patient.hepatic_status !== 'unknown' || Boolean(q.patient.age.value != null || q.patient.age.range) || q.patient.weight_kg != null },
        { id: 'dose_safety', question: 'contraindications and key warnings', required_evidence_type: 'regulatory', priority: 2 },
    ],
    diagnosis_question: [
        { id: 'diagnostic_criteria', question: 'diagnostic criteria', required_evidence_type: 'guideline', priority: 1 },
        { id: 'workup_tests', question: 'recommended workup and tests', required_evidence_type: 'guideline', priority: 2 },
    ],
    research_question: [
        { id: 'evidence_landscape', question: 'recent studies and trial evidence', required_evidence_type: 'literature', priority: 1 },
    ],
    latest_evidence: [
        { id: 'recent_updates', question: 'most recent updates and recommendations', required_evidence_type: 'literature', priority: 1 },
        { id: 'current_guideline', question: 'current guideline position', required_evidence_type: 'guideline', priority: 2 },
    ],
    comparison: [
        { id: 'comparison_efficacy', question: 'comparative efficacy and outcomes between the two options', required_evidence_type: 'literature', priority: 1 },
        { id: 'comparison_guideline', question: 'guideline positioning of each option', required_evidence_type: 'guideline', priority: 1 },
        { id: 'comparison_modifiers', question: 'patient-specific modifier favoring one option', required_evidence_type: 'guideline', priority: 2, only_if: (q) => Boolean(q.patient.obesity || q.patient.renal_status === 'present' || q.patient.pregnancy) },
    ],
    follow_up: [
        { id: 'context_target', question: 'the specific aspect raised by the follow-up within established context', required_evidence_type: 'guideline', priority: 1 },
    ],
});

// Specialty-society preference by condition family (spec §18). Only sources
// that actually have retrieval paths are relevant today (europe_pmc, pubmed,
// internal_knowledge); society names steer query formulation, not new adapters.
const SOCIETY_HINTS = Object.freeze([
    { match: /hypertens|blood pressure|cardio/, societies: ['hypertension guideline', 'cardiology society guideline'] },
    { match: /cholangitis|cholecystitis|biliary|gallbladder|hepatic|liver|jaundice/, societies: ['hepatology guideline', 'AASLD', 'EASL', 'GI endoscopy guideline'] },
    { match: /renal|kidney|creatinine|dialysis/, societies: ['KDIGO', 'nephrology guideline'] },
    { match: /asthma/, societies: ['GINA'] },
    { match: /copd/, societies: ['GOLD'] },
    { match: /pneumonia|sepsis|infection|antibiotic/, societies: ['IDSA', 'infectious disease guideline'] },
    { match: /gastroenteritis|diarrh|enteritis/, societies: ['IDSA infectious diarrhea guideline', 'ESPGHAN gastroenteritis guideline', 'AAP diarrhea guideline'] },
    { match: /pregnan/, societies: ['obstetric guideline', 'pregnancy safety data'] },
]);

function societyHintsFor(conditions = []) {
    const text = conditions.map((c) => c.concept).join(' ');
    for (const hint of SOCIETY_HINTS) {
        if (hint.match.test(text)) return hint.societies;
    }
    return [];
}

function buildTasks(query) {
    const tasks = [];
    const seen = new Set();
    const addTask = (task) => {
        if (seen.has(task.id)) return;
        seen.add(task.id);
        tasks.push({
            task_id: task.id,
            question: task.question,
            required_evidence_type: task.required_evidence_type,
            preferred_sources: task.required_evidence_type === 'guideline' ? ['internal_knowledge', 'europe_pmc'] : task.required_evidence_type === 'regulatory' ? ['fda', 'europe_pmc'] : ['pubmed', 'europe_pmc'],
            minimum_quality: task.priority === 1 ? 'authoritative' : 'relevant',
            freshness_requirement: query.temporal_request === 'current' ? 'current' : 'not_specified',
            status: 'pending',
            queries: [],
        });
    };

    const primaryIntent = query.intent;
    const catalogKey = primaryIntent === 'follow_up' && query.question?.comparison ? 'comparison' : primaryIntent;
    for (const task of TASK_CATALOG[catalogKey] || TASK_CATALOG.clinical_management) {
        if (task.only_if && !task.only_if(query)) continue;
        addTask(task);
    }
    // Comparison detection upgrades the task set (spec §86): a comparison asks
    // for comparative evidence even when the surface intent is guideline.
    if (query.question?.comparison && catalogKey !== 'comparison') {
        for (const task of TASK_CATALOG.comparison) {
            if (task.only_if && !task.only_if(query)) continue;
            addTask(task);
        }
    }
    return tasks;
}

// Controlled query variants per task (spec §57): bounded, entity-anchored,
// never uncontrolled synonym explosion.
function buildTaskQueries(task, query) {
    const baseTerms = (query.search_terms || []).filter((term) => term.length > 2).slice(0, 6);
    // Anchor the clinical question on the DISEASE, not on patient attributes:
    // "obesity" alone would retrieve weight-management content instead of the
    // hypertension treatment evidence the question is actually about.
    const MODIFIER_CONDITIONS = new Set(['obesity', 'pregnancy']);
    const diseaseConditions = (query.conditions || []).filter((c) => !MODIFIER_CONDITIONS.has(c.concept));
    const condition = query.condition && !MODIFIER_CONDITIONS.has(query.condition)
        ? query.condition
        : diseaseConditions[0]?.concept || query.condition || baseTerms[0] || '';
    const entities = [...(query.drug_classes || []), ...(query.medications || [])];
    const isBacterial = (query.search_terms || []).includes('bacterial')
        || (query.conditions || []).some((c) => c.concept.includes('bacterial'))
        || (query.entities || []).some((e) => e.name === 'bacterial');
    const hasAntibiotic = (query.search_terms || []).includes('antibiotic')
        || (query.drug_classes || []).includes('antibiotic')
        || (query.entities || []).some((e) => e.name === 'antibiotic');
    const isPediatric = Boolean(
        query.population?.pediatric
        || query.patient?.pediatric
        || (query.search_terms || []).includes('pediatric')
        || query.patient?.age?.range
        || query.patient?.age?.value != null,
    );
    const variants = [];
    const push = (q) => { const v = q.trim(); if (v.length > 3 && !variants.includes(v)) variants.push(v); };

    switch (task.task_id) {
        case 'first_line_classes':
        case 'management_recommendation':
        case 'current_guideline':
            if (isBacterial || hasAntibiotic) {
                push(`${condition} antibiotic guideline`);
                if (isPediatric) push(`${condition} antibiotic pediatric guideline`);
                push(`${condition} antimicrobial therapy recommendations`);
            }
            if (isPediatric && !(isBacterial || hasAntibiotic)) {
                push(`${condition} guideline pediatric`);
            }
            push(`${condition} first-line treatment guideline`);
            push(`${condition} management recommendation guideline`);
            for (const society of societyHintsFor(query.conditions)) {
                const cleanSociety = society.replace(new RegExp(`^${condition}\\b\\s*`, 'i'), '').trim();
                if (cleanSociety) push(`${condition} ${cleanSociety}`);
            }
            break;
        case 'patient_modifiers':
        case 'comparison_modifiers':
            if (query.patient.obesity) push(`obesity ${condition || 'hypertension'} treatment consideration`);
            if (query.patient.pregnancy) push(`pregnancy ${condition || condition === '' ? (query.condition || 'treatment') : 'treatment'} safety`);
            if (query.patient.renal_status === 'present') push(`renal impairment ${query.condition || 'drug'} dosing`);
            if (isPediatric) push(`${condition || 'treatment'} pediatric guidelines children`);
            break;
        case 'comparison_efficacy':
            for (const entity of entities) push(`${entity} ${condition || ''} outcomes`.trim());
            if (entities.length >= 2) push(`${entities[0]} versus ${entities[1]} ${condition || ''}`.trim());
            break;
        case 'comparison_guideline':
            for (const entity of entities) push(`${condition || 'hypertension'} guideline ${entity}`.trim());
            break;
        case 'dose_determination':
            const detDrugs = (query.medications && query.medications.length) ? query.medications : entities;
            for (const drug of detDrugs) {
                push(`${drug} dose administration`);
                if (condition) push(`${drug} ${condition} dose`);
            }
            if (query.search_terms?.includes('vitamin')) push(`${condition} vitamin deficiency supplementation guideline`);
            push(`${query.condition || ''} drug dose`.trim());
            break;
        case 'dose_modifiers':
            const modDrugs = (query.medications && query.medications.length) ? query.medications : (entities.length ? entities : (condition ? [condition] : []));
            for (const drug of modDrugs) {
                push(`${drug} renal dose adjustment`);
                if (query.patient?.age?.value != null || query.patient?.age?.range || query.population?.age != null) {
                    push(`${drug} pediatric dose`);
                }
                if (query.patient?.weight_kg != null || query.population?.weight != null) {
                    push(`${drug} weight dosing`);
                }
            }
            break;
        case 'dose_safety':
            const safeDrugs = (query.medications && query.medications.length) ? query.medications : (entities.length ? entities : (condition ? [condition] : []));
            for (const drug of safeDrugs) push(`${drug} contraindications warnings`);
            break;
        case 'diagnostic_criteria':
            push(`${condition} diagnostic criteria guideline`);
            break;
        case 'workup_tests':
            push(`${condition} workup evaluation guideline`);
            break;
        case 'evidence_landscape':
        case 'recent_updates':
            if (isBacterial || hasAntibiotic) {
                push(`${condition} antibiotic recent study`);
                if (isPediatric) push(`${condition} antibiotic pediatric recent study`);
                push(`${condition} antimicrobial trial outcomes`);
            } else {
                push(`${condition || baseTerms.join(' ')} recent study`);
                push(`${condition || baseTerms.join(' ')} trial outcomes`);
                if (isPediatric) push(`${condition} pediatric recent study`);
            }
            break;
        case 'context_target':
            push([condition, ...(query.search_terms || [])].filter(Boolean).slice(0, 5).join(' '));
            break;
        default:
            push(baseTerms.join(' '));
    }
    task.queries = variants.slice(0, 4); // bounded (spec §57)
    return task;
}

function decomposeClinicalTask(query) {
    const tasks = buildTasks(query);
    for (const task of tasks) buildTaskQueries(task, query);
    return tasks;
}

module.exports = { decomposeClinicalTask, TASK_CATALOG, societyHintsFor };
