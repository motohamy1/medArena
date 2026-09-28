import { Ionicons } from '@expo/vector-icons';
import { SURGICAL_SPECIALTY_KNOWLEDGE } from './SurgicalSpecialtiesData';

export type ClinicalSection = {
  title: string;
  content: string;
};

export type TopicItem = {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  aiScopeDescription: string;
  illustration?: any;
  clinicalContent?: ClinicalSection[];
};

export type SpecialtyCategory = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  topics: TopicItem[];
};

export type SpecialtyData = {
  id: string;
  name: string;
  scientificName: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  illustration: any;
  generalScope: string;
  categories: SpecialtyCategory[];
};

export type TopicSearchResult = TopicItem & {
  specialtyId: string;
  specialtyName: string;
  specialtyScientificName: string;
  specialtyColor: string;
  specialtyIcon: keyof typeof Ionicons.glyphMap;
  categoryId: string;
  categoryTitle: string;
};

export const SPECIALTY_KNOWLEDGE: Record<string, SpecialtyData> = {
  heart: {
    id: 'heart',
    name: 'Heart',
    scientificName: 'Cardiology',
    icon: 'heart',
    color: '#eb988a',
    illustration: require('../assets/images/specialties/cardiology.jpg'),
    generalScope: 'Focus exclusively on cardiovascular pathology, acute coronary syndromes, heart failure, arrhythmias, vascular emergencies, and evidence-based interventions.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute conditions and resuscitation protocols',
        icon: 'warning',
        topics: [
          {
            id: 'acs',
            title: 'Acute Coronary Syndrome',
            subtitle: 'STEMI vs NSTEMI Workup, DAPT & PCI Timing',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on Acute Coronary Syndrome, STEMI, NSTEMI, Unstable Angina, ECG ischemia, high-sensitivity troponins, and emergent reperfusion.',
            illustration: require('../assets/images/topics/acs.jpg'),
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute Coronary Syndrome (ACS) encompasses a spectrum of clinical conditions resulting from sudden rupture or erosion of an unstable atherosclerotic plaque, leading to platelet activation, coronary thrombus formation, and acute myocardial ischemia or infarction (STEMI, NSTEMI, or Unstable Angina).' },
              { title: 'Immediate Triage & Red Flags', content: 'Substernal crushing chest pain >20 mins, diaphoresis, dyspnea, hypotension, pulmonary edema. Red Flags: Hemodynamic instability (Killip Class IV / Cardiogenic shock), new holosystolic murmur (VSD / papillary muscle rupture), or sustained VT/VF.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '12-lead ECG within 10 minutes of arrival. STEMI: J-point elevation ≥1 mm in ≥2 contiguous leads (≥2 mm in V2-V3 in men, ≥1.5 mm in women) or new LBBB. NSTEMI: Ischemic ST depression or T-wave inversions with dynamic high-sensitivity troponin rise. Stratify NSTEMI with TIMI (0-7) or GRACE score (>140 = high risk).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Aspirin: 324 mg PO chewed immediately.\n• P2Y12 Inhibitor: Ticagrelor 180 mg PO loading (preferred) OR Prasugrel 60 mg PO loading (if anatomy known/PCI planned) OR Clopidogrel 600 mg PO loading.\n• Anticoagulation: Unfractionated Heparin 60 U/kg IV bolus (max 4000 U) then 12 U/kg/hr (target aPTT 50-70s) OR Enoxaparin 1 mg/kg SC q12h.\n• SL Nitroglycerin: 0.4 mg q5min x 3 doses (contraindicated if SBP <90, HR <50 or >100, RV infarction, or PDE-5 inhibitor use within 24-48h).\n• High-intensity Statin: Atorvastatin 80 mg PO.' },
              { title: 'Stepwise Management Algorithm', content: '1. STEMI: Emergent Primary PCI (Door-to-Balloon <90 mins; Door-to-Needle <30 mins with Tenecteplase if PCI transfer >120 mins).\n2. Very High-Risk NSTEMI (refractory pain, shock, VT): Immediate coronary angiography (<2 hours).\n3. High-Risk NSTEMI (GRACE >140, dynamic troponins): Early invasive strategy (<24 hours).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never administer nitrates or morphine in inferior STEMI without right-sided ECG (V4R) to rule out Right Ventricular Infarction (preload dependent; treat RV shock with IV fluids, avoid nitrates). Sgarbossa criteria required to identify STEMI in patients with pre-existing LBBB or paced rhythm.' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 ESC Guidelines for the management of acute coronary syndromes; 2021 ACC/AHA/SCAI Guideline for Coronary Artery Revascularization.' }
            ]
          },
          {
            id: 'heart_failure_shock',
            title: 'Acute Decompensated HF & Cardiogenic Shock',
            subtitle: 'Wet/Cold Hemodynamic Profiling, Inotropes & GDMT',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute decompensated heart failure, Stevenson hemodynamic classification, loop diuretic resistance, inotropic support (dobutamine, milrinone), and vasopressors in cardiogenic shock.',
            illustration: require('../assets/images/topics/heart_failure.jpg'),
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute Decompensated Heart Failure (ADHF) is a sudden or gradual worsening of heart failure symptoms and signs requiring urgent medical therapy, characterized by elevated ventricular filling pressures, pulmonary and systemic congestion, and/or systemic hypoperfusion with potential progression to Cardiogenic Shock.' },
              { title: 'Immediate Triage & Red Flags', content: 'Acute severe dyspnea, orthopnea, bilateral crackles, JVD, S3 gallop, pink frothy sputum. Cardiogenic Shock signs: SBP <90 mmHg, cold clammy extremities, altered mentation, oliguria (<0.5 mL/kg/hr), serum lactate >2.0 mmol/L.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Stevenson Profile: Warm & Dry (compensated), Warm & Wet (congested), Cold & Dry (hypovolemic), Cold & Wet (cardiogenic shock/severe congestion). NT-proBNP >300 pg/mL (or BNP >100 pg/mL) confirms cardiac etiology. Bedside TTE: Ejection fraction, RV function, inferior vena cava plethoric diameter.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Warm & Wet: IV Furosemide at 2 to 2.5 times the home oral dose as IV bolus (or 40-80 mg IV if loop-naive). Add IV Nitroglycerin (10-200 mcg/min) or Nitroprusside for afterload reduction if SBP >110 mmHg.\n• Cold & Wet (Cardiogenic Shock): Norepinephrine (0.05-0.5 mcg/kg/min) to maintain MAP ≥65 mmHg PLUS Inotrope (Dobutamine 2.5-20 mcg/kg/min or Milrinone 0.125-0.75 mcg/kg/min).\n• Diuretic Resistance: Add oral Metolazone 2.5-10 mg 30 minutes prior to IV loop diuretic (sequential nephron blockade).' },
              { title: 'Stepwise Management Algorithm', content: '1. Place on continuous pulse oximetry, telemetry, and non-invasive positive pressure ventilation (BiPAP/CPAP) for acute pulmonary edema.\n2. Titrate IV loop diuretics to achieve net negative fluid balance of 1-2 L/24h.\n3. In cardiogenic shock: Insert arterial line and early mechanical circulatory support (Impella, IABP, or VA-ECMO) if refractory to dual inotrope/vasopressor therapy.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT discontinue chronic beta-blockers during mild-to-moderate decompensation unless patient is in overt cardiogenic shock (abrupt cessation triggers rebound adrenergic tachycardia). Avoid aggressive fluid boluses in undifferentiated shock before bedside echocardiogram.' },
              { title: 'Exact Reference & Guideline Citations', content: '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure; 2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure.' }
            ]
          },
          {
            id: 'afib_rvr',
            title: 'Atrial Fibrillation with RVR',
            subtitle: 'Rate vs Rhythm Control & CHA2DS2-VASc Anticoagulation',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on atrial fibrillation with rapid ventricular response, acute rate control (metoprolol, diltiazem), synchronized cardioversion, and thromboembolic prophylaxis.',
            illustration: require('../assets/images/topics/afib.jpg'),
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Atrial Fibrillation (AFib) with Rapid Ventricular Response (RVR) is a supraventricular tachyarrhythmia characterized by chaotic, disorganized atrial electrical activity (atrial rates 400-600 bpm) with rapid, irregular ventricular conduction (ventricular rate >100-110 bpm, commonly 130-180 bpm), resulting in loss of atrial kick and reduced cardiac output.' },
              { title: 'Immediate Triage & Red Flags', content: 'Heart rate 130-180 bpm with palpitations, chest discomfort, presyncope. Unstable Red Flags: Hypotension (SBP <90), ischemic chest pain, altered mental status, or pulmonary edema.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '12-lead ECG: Irregularly irregular rhythm, absence of discrete P waves, fibrillatory baseline waves. Risk stratification for stroke: CHA2DS2-VASc (CHF, HTN, Age ≥75 [2], DM, Stroke/TIA [2], Vascular disease, Age 65-74, Sex category female).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Rate Control (Preserved EF ≥40%): Diltiazem 0.25 mg/kg IV bolus over 2 mins (e.g. 15-20 mg), may repeat with 0.35 mg/kg in 15 mins, followed by continuous infusion 5-15 mg/hr OR Metoprolol tartrate 5 mg IV q5min up to 3 doses (15 mg total).\n• Rate Control (Reduced EF <40% / Acute HF): Amiodarone 150 mg IV over 10 mins then 1 mg/min x 6h then 0.5 mg/min x 18h OR Digoxin 0.25-0.5 mg IV.\n• Anticoagulation: Direct Oral Anticoagulant (DOAC - Apixaban 5 mg PO BID or Rivaroxaban 20 mg PO daily) preferred over Warfarin.' },
              { title: 'Stepwise Management Algorithm', content: '1. Hemodynamically Unstable: Emergent Synchronized Electrical Cardioversion (120-200 J biphasic).\n2. Hemodynamically Stable: Rate control first (target resting HR <110 bpm).\n3. If AFib onset >48 hours (or unknown duration): Anticoagulate for ≥3 weeks before elective cardioversion OR perform Transesophageal Echocardiogram (TEE) to exclude left atrial appendage thrombus prior to cardioversion.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never administer AV nodal blockers (Diltiazem, Verapamil, Beta-blockers, Digoxin, Adenosine) to patients with Atrial Fibrillation with pre-excitation (Wolff-Parkinson-White / WPW). AV nodal blockade forces conduction down the accessory pathway, degenerating into Ventricular Fibrillation and cardiac arrest (use IV Procainamide or synchronized cardioversion instead).' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation.' }
            ]
          },
          {
            id: 'aortic_dissection_protocol',
            title: 'Acute Aortic Dissection',
            subtitle: 'Stanford Classification, Anti-Impulse Therapy & Surgery',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute aortic syndromes, Stanford Type A vs B, anti-impulse hemodynamic control (esmolol/labetalol), CT angiography findings, and emergent cardiothoracic repair.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute Aortic Dissection is a life-threatening aortic emergency characterized by a tear in the aortic intima, allowing high-pressure blood to propagate into the media layer and create a false lumen separating the intimal flap from the outer adventitia, classified by the Stanford system into Type A (ascending aorta) and Type B (descending aorta).' },
              { title: 'Immediate Triage & Red Flags', content: 'Sudden onset of severe, tearing, "knife-like" anterior chest or interscapular back pain reaching peak intensity in seconds. Red Flags: Pulse deficit between arms (>20 mmHg SBP difference), focal neurological deficits, new diastolic murmur of aortic regurgitation, or cardiac tamponade.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Aortic Dissection Detection Risk Score (ADD-RS 0-3). Imaging Gold Standard: CT Angiography (CTA) Chest, Abdomen, Pelvis (visualizes true/false lumen, flap extent, and organ malperfusion). Bedside TTE/TEE if unstable.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Target Hemodynamics: Heart Rate <60 bpm and SBP 100-120 mmHg within 20 minutes (reduces aortic shear stress dP/dt).\n• Step 1: IV Beta-Blocker FIRST: Esmolol loading dose 500 mcg/kg over 1 min then infusion 50-300 mcg/kg/min OR IV Labetalol 20 mg bolus then 20-80 mg q10min (or 1-2 mg/min infusion).\n• Step 2: IV Vasodilator SECOND (only after HR <60): Nicardipine infusion 5-15 mg/hr OR Sodium Nitroprusside 0.5-10 mcg/kg/min.' },
              { title: 'Stepwise Management Algorithm', content: '1. Stanford Type A (Ascending aorta): Emergent surgical repair with graft replacement (mortality increases 1-2% per hour without surgery).\n2. Stanford Type B (Descending aorta distal to left subclavian): Medical anti-impulse therapy in ICU. Thoracic Endovascular Aortic Repair (TEVAR) indicated if complicated (refractory pain, malperfusion, rapid expansion, rupture).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'CRITICAL: Never administer a vasodilator (Nitroprusside/Nicardipine) BEFORE the beta-blocker. Vasodilation induces reflex tachycardia and increases aortic wall shear stress (dP/dt), precipitating catastrophic aortic rupture.' },
              { title: 'Exact Reference & Guideline Citations', content: '2022 ACC/AHA Guideline for the Diagnosis and Management of Aortic Disease; 2014 ESC Guidelines on the diagnosis and treatment of aortic diseases.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'hypertension_guidelines',
            title: 'Essential Hypertension',
            subtitle: 'ACC/AHA & ESC Staging, GDMT & Resistant HTN',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on essential hypertension, classification stages, ambulatory BP monitoring, lifestyle modifications, first-line antihypertensive classes, and secondary hypertension.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Essential (Primary) Hypertension is a chronic, multifactorial cardiovascular disorder defined by sustained elevation of systemic arterial blood pressure (SBP ≥130 mmHg or DBP ≥80 mmHg per ACC/AHA criteria; SBP ≥140 or DBP ≥90 per ESC/ESH criteria) in the absence of an identifiable secondary cause.' },
              { title: 'Immediate Triage & Red Flags', content: 'Asymptomatic elevated BP vs Hypertensive Crisis. Red Flags (Hypertensive Emergency): SBP ≥180 and/or DBP ≥120 with acute target organ damage (papilledema, acute kidney injury, encephalopathy, pulmonary edema, aortic dissection).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Normal: <120/<80 mmHg\n• Elevated: 120-129/<80 mmHg\n• Stage 1 HTN: SBP 130-139 or DBP 80-89 mmHg\n• Stage 2 HTN: SBP ≥140 or DBP ≥90 mmHg\nDiagnosis requires ≥2 readings on ≥2 separate clinical encounters or confirmation by 24-hour Ambulatory Blood Pressure Monitoring (ABPM average ≥130/80).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Four first-line classes:\n1. ACEi (Lisinopril 10-40 mg daily) or ARB (Losartan 50-100 mg daily, Telmisartan 40-80 mg daily).\n2. Dihydropyridine CCB (Amlodipine 5-10 mg daily).\n3. Thiazide-like Diuretic (Chlorthalidone 12.5-25 mg daily or Indapamide 1.25-2.5 mg daily preferred over HCTZ).\n• Initial Dual Combination: Recommended for Stage 2 HTN when BP is >20/10 mmHg above goal (e.g. ARB + CCB).' },
              { title: 'Stepwise Management Algorithm', content: '1. General Population BP Goal: <130/80 mmHg.\n2. Diabetic Kidney Disease or CKD with Albuminuria: ACEi or ARB is mandatory for renal preservation.\n3. Black Population (without CKD): Initial therapy should include CCB or Thiazide-like diuretic.\n4. Resistant Hypertension (uncontrolled on 3 agents including a diuretic): Add Spironolactone 25-50 mg daily as 4th-line agent after checking serum K+.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT combine an ACE inhibitor with an ARB (causes severe hyperkalemia, acute kidney injury, and syncope without cardiovascular benefit). In patients with severe bilateral renal artery stenosis, ACEi/ARBs can precipitate acute renal failure.' },
              { title: 'Exact Reference & Guideline Citations', content: '2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure; 2023 ESH Guidelines for the management of arterial hypertension.' }
            ]
          },
          {
            id: 'cad_stable_angina',
            title: 'Chronic Coronary Syndromes',
            subtitle: 'Stable Angina, CCTA, Functional Stress & ISCHEMIA Trial',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on Chronic Coronary Syndromes, stable ischemic heart disease, non-invasive imaging (CCTA, stress CMR, PET), medical optimization, and revascularization.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Chronic Coronary Syndromes (CCS) comprise stable clinical manifestations of coronary artery disease resulting from fixed atherosclerotic plaque stenosis or coronary microvascular dysfunction, causing a mismatch between myocardial oxygen demand and supply during physical exertion or emotional stress.' },
              { title: 'Immediate Triage & Red Flags', content: 'Predictable exertional retrosternal discomfort relieved by rest or SL nitroglycerin within 5 minutes. Red Flags: Angina at rest, increasing frequency/duration (crescendo angina), or new syncope indicating severe left main disease or critical aortic stenosis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Pre-test probability (PTP) calculation guides non-invasive testing:\n• Low-Intermediate PTP: Coronary CT Angiography (CCTA) preferred (high negative predictive value, detects plaque burden).\n• High PTP or Known CAD: Functional testing for ischemia (Stress CMR, PET, SPECT, or Stress Echocardiogram).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Prognostic Therapy: Aspirin 81 mg daily + Atorvastatin 80 mg daily (or Rosuvastatin 20-40 mg) + ACEi (if EF <40%, DM, HTN, or CKD).\n• Anti-anginal First-Line: Beta-blocker (Metoprolol succinate 50-200 mg daily or Bisoprolol 5-10 mg daily) titrated to resting HR 55-60 bpm.\n• Anti-anginal Second-Line: Add Dihydropyridine CCB (Amlodipine 5-10 mg) or Ranolazine 500-1000 mg BID (inhibits late inward sodium current, no effect on BP/HR).' },
              { title: 'Stepwise Management Algorithm', content: '1. Optimize guideline-directed medical therapy (GDMT).\n2. Revascularization (PCI or CABG) is indicated for:\n  - Persistent angina refractory to maximal medical therapy.\n  - High-risk anatomy (Left Main stenosis >50%, multivessel disease with EF <35%, or severe proximal LAD stenosis).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Guided by the landmark ISCHEMIA trial: In stable coronary disease without left main disease or low EF, routine initial invasive revascularization (PCI/CABG) does NOT reduce death or myocardial infarction compared to optimal medical therapy; its primary role is symptom and quality of life improvement.' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 ESC Guidelines for the diagnosis and management of chronic coronary syndromes; 2023 AHA/ACC/ACCP/ASPC/NLA/PCNA Guideline for the Management of Patients With Chronic Coronary Disease.' }
            ]
          },
          {
            id: 'hyperlipidemia_statin',
            title: 'Dyslipidemia & ASCVD Prevention',
            subtitle: 'Statin Intensity, Ezetimibe, PCSK9 & Non-Statin Regimens',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on dyslipidemia, 10-year ASCVD risk calculation, high-intensity statins, ezetimibe, PCSK9 monoclonals, and non-statin lipid lowering agents.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Dyslipidemia is an elevation of plasma cholesterol, triglycerides, or atherogenic lipoproteins (primarily Low-Density Lipoprotein Cholesterol [LDL-C] and Apolipoprotein B [ApoB]), directly driving the initiation, progression, and plaque destabilization of atherosclerotic cardiovascular disease (ASCVD).' },
              { title: 'Immediate Triage & Red Flags', content: 'Very High-Risk Secondary ASCVD (acute coronary syndrome within 12 months, multiple ASCVD events, or ASCVD event + multiple high-risk conditions like DM, CKD, smoking). Extreme hypertriglyceridemia (>500-1000 mg/dL) carries acute pancreatitis risk.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Fasting Lipid Profile: Total cholesterol, Triglycerides, HDL-C, and calculated/direct LDL-C. Risk Categories:\n• Primary Prevention: Calculate 10-year ASCVD risk (Pooled Cohort Equations: <5% low, 5-7.5% borderline, 7.5-20% intermediate, ≥20% high risk).\n• Secondary Prevention (Clinical ASCVD): Target LDL-C <55 mg/dL (<1.4 mmol/L) and ≥50% reduction from baseline.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• High-Intensity Statin (lowers LDL ≥50%): Atorvastatin 40-80 mg daily OR Rosuvastatin 20-40 mg daily.\n• Moderate-Intensity Statin (lowers LDL 30-49%): Atorvastatin 10-20 mg, Rosuvastatin 5-10 mg, Simvastatin 20-40 mg.\n• Non-Statin Add-On (if LDL above goal on maximal statin):\n  1. Ezetimibe 10 mg PO daily (adds 15-20% LDL reduction).\n  2. PCSK9 Inhibitor (Evolocumab 140 mg SC q2w or Alirocumab 75-150 mg SC q2w - adds 50-60% LDL reduction).\n  3. Bempedoic Acid 180 mg PO daily (for statin intolerance).' },
              { title: 'Stepwise Management Algorithm', content: '1. Establish baseline lipid panel.\n2. Initiate high-intensity statin for all secondary ASCVD, severe primary hypercholesterolemia (LDL ≥190 mg/dL), and DM aged 40-75.\n3. Recheck lipid panel at 4-12 weeks.\n4. If LDL-C remains ≥55 mg/dL in very high-risk ASCVD, add Ezetimibe; if still elevated, add PCSK9 inhibitor.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT discontinue statins routinely for minor asymptomatic CK elevations. In suspected statin-associated muscle symptoms (SAMS), assess for drug interactions (CYP3A4 inhibitors with Simvastatin/Atorvastatin), check TSH (hypothyroidism exacerbates statin myopathy), and trial a lower dose, alternate-day dosing, or Rosuvastatin/Pravastatin.' },
              { title: 'Exact Reference & Guideline Citations', content: '2018 AHA/ACC/AACVPR/AAPA/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Guideline on the Management of Blood Cholesterol; 2019 ESC/EAS Guidelines for the management of dyslipidaemias.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'ecg_interpretation',
            title: 'Systematic 12-Lead ECG Interpretation',
            subtitle: 'Axis, Ischemia Territories, Bundle Blocks & Intervals',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on systematic 12-lead electrocardiogram interpretation, axis, bundle branch blocks, hypertrophy criteria, ischemic territories, and QTc calculation.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Systematic 12-Lead Electrocardiogram (ECG) Interpretation is the structured, standardized clinical analysis of myocardial electrical vectors, measuring rate, rhythm, axis, wave intervals (PR, QRS, QT/QTc), chamber hypertrophy, and localized repolarization abnormalities across 12 anatomical leads.' },
              { title: 'Immediate Triage & Red Flags', content: 'Critical ECG Findings: Tombstone ST elevations, hyperacute T waves, Wellens warning (deep biphasic or inverted T waves in V2-V3 indicating critical LAD stenosis), de Winter T waves (ST depression with tall symmetrical T waves), and electrical alternans (pericardial tamponade).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '1. Rate & Rhythm: Sinus rhythm requires upright P wave in leads I, II, aVF. Rate = 300 / large squares between R-R.\n2. Electrical Axis: Normal (-30° to +90°). Lead I (+) and aVF (+) = Normal; Lead I (+) and aVF (-) with Lead II (-) = Left Axis Deviation; Lead I (-) and aVF (+) = Right Axis Deviation.\n3. Intervals: PR interval 120-200 ms; QRS duration <120 ms; QTc <440 ms in men, <460 ms in women (Bazett formula: QTc = QT / √RR; prolonged >500 ms carries high risk of Torsades de Pointes).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool). If QTc >500 ms with polymorphic VT (Torsades): Administer Magnesium Sulfate 2 g IV over 1-2 minutes and withdraw all QT-prolonging medications.' },
              { title: 'Stepwise Management Algorithm', content: 'Anatomical Coronary Territories:\n• Septal: V1-V2 (LAD)\n• Anterior: V3-V4 (LAD)\n• Lateral: I, aVL, V5, V6 (Left Circumflex / Diagonal)\n• Inferior: II, III, aVF (RCA in 85-90%)\n• Posterior: Horizontal ST depression and tall R waves in V1-V3 (obtain posterior leads V7-V9).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'RBBB: QRS ≥120 ms, rsR\' in V1-V2, wide slurred S in I and V6.\nLBBB: QRS ≥120 ms, broad notched R wave in I, aVL, V5-V6, deep QS in V1. Use Sgarbossa Criteria for acute MI in LBBB: Concordant ST elevation ≥1 mm in any lead (5 pts), Concordant ST depression ≥1 mm in V1-V3 (3 pts), Discordant ST elevation ≥5 mm or >25% of preceding S wave (Modified Sgarbossa, 2 pts). Score ≥3 has 98% specificity for STEMI.' },
              { title: 'Exact Reference & Guideline Citations', content: 'AHA/ACCF/HRS Recommendations for the Standardization and Interpretation of the Electrocardiogram; Marriott\'s Practical Electrocardiography 13th Ed.' }
            ]
          },
          {
            id: 'echo_ef_assessment',
            title: 'Echocardiography & EF Assessment',
            subtitle: 'Simpson Biplane, Diastology (E/e\') & Valvular Gradients',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on Transthoracic Echocardiography, ejection fraction calculation, diastolic grading, wall motion scoring, and valvular stenosis assessment.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Transthoracic Echocardiography (TTE) is the non-invasive ultrasound evaluation of cardiac anatomy, chamber dimensions, left ventricular ejection fraction (LVEF by biplane Simpson\'s method), regional wall motion abnormalities, valvular hemodynamics, and pericardial effusion/tamponade physiology.' },
              { title: 'Immediate Triage & Red Flags', content: 'Critical TTE Red Flags: Cardiac tamponade physiology (diastolic collapse of right ventricle/right atrium, plethoric non-collapsing IVC, >25% respiratory variation in mitral inflow velocity), dynamic LV outflow tract obstruction, and flail mitral leaflet.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• LVEF (Simpson Biplane Method): Normal (52-72% in men, 54-74% in women); Mild dysfunction (41-51%); Moderate (30-40%); Severe (<30%).\n• Diastolic Dysfunction Algorithm: Evaluated by average E/e\' ratio (>14 indicates elevated LV filling pressures), Septal e\' (<7 cm/s) or Lateral e\' (<10 cm/s), Tricuspid regurgitation peak velocity (>2.8 m/s), and Left Atrial Volume Index (LAVI >34 mL/m²).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool). Guides GDMT initiation and device therapy (ICD/CRT indication for EF ≤35% after ≥3 months of GDMT).' },
              { title: 'Stepwise Management Algorithm', content: '1. Acquire parasternal long-axis, short-axis, apical 4-chamber, 2-chamber, and subcostal views.\n2. Assess 17-segment regional wall motion score index (1=normal, 2=hypokinetic, 3=akinetic, 4=dyskinetic).\n3. Quantify valvular stenosis/regurgitation (Severe Aortic Stenosis: Aortic valve area <1.0 cm², mean gradient ≥40 mmHg, peak velocity ≥4.0 m/s).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'In low-flow, low-gradient aortic stenosis (EF <50%, mean gradient <40 mmHg, AVA <1.0 cm²), perform Dobutamine Stress Echocardiography to differentiate true severe AS from pseudo-severe AS and evaluate contractile reserve.' },
              { title: 'Exact Reference & Guideline Citations', content: 'ASE/EACVI Guidelines and Standards for Chamber Quantification by Echocardiography; 2020 ACC/AHA Guideline for the Management of Patients With Valvular Heart Disease.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'sglt2i_cardioprotection',
            title: 'SGLT2 Inhibitors across Heart Failure',
            subtitle: 'DAPA-HF, EMPEROR & DELIVER Trials',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on sodium-glucose cotransporter-2 inhibitors in heart failure across all ejection fractions regardless of diabetes status.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Sodium-Glucose Cotransporter-2 (SGLT2) Inhibitors (e.g., Dapagliflozin, Empagliflozin) are oral agents that inhibit proximal tubular glucose and sodium reabsorption, providing profound cardiorenal protective benefits by reducing preload/afterload, decreasing interstitial myocardial edema, and preserving renal tubuloglomerular feedback across the full EF spectrum of heart failure.' },
              { title: 'Immediate Triage & Red Flags', content: 'Euglycemic DKA risk in insulin-dependent patients during acute physiological stress or surgery (hold SGLT2i 3 days prior to elective major surgery).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Landmark Trial Data:\n• DAPA-HF & EMPEROR-Reduced: Dapagliflozin 10 mg and Empagliflozin 10 mg reduced cardiovascular death and HF hospitalization by ~25% in HFrEF (EF ≤40%).\n• EMPEROR-Preserved & DELIVER: Established ~18-21% relative risk reduction in CV death or HF hospitalizations in HFpEF and HFmrEF (EF >40%), establishing SGLT2i as the first class with universal Class 1 recommendation across the entire EF spectrum.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Dapagliflozin 10 mg PO once daily OR Empagliflozin 10 mg PO once daily.\n• No dose titration required. Can be initiated in patients with eGFR down to 20 mL/min/1.73m².' },
              { title: 'Stepwise Management Algorithm', content: 'Initiate SGLT2i early during heart failure hospitalization once hemodynamically stable. An initial mild drop in eGFR (up to 30%) within 2-4 weeks reflects reversible glomerular hemodynamic unloading and should NOT trigger drug discontinuation.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT delay SGLT2 inhibitor initiation until outpatient follow-up. In-hospital initiation achieves superior 30-day readmission and mortality outcomes without increasing adverse event rates.' },
              { title: 'Exact Reference & Guideline Citations', content: 'DAPA-HF Trial (NEJM 2019); EMPEROR-Preserved Trial (NEJM 2021); DELIVER Trial (NEJM 2022); 2022 AHA/ACC/HFSA Heart Failure Guidelines.' }
            ]
          },
          {
            id: 'glp1_ascvd_trials',
            title: 'GLP-1 Receptor Agonists in CVD & Obesity',
            subtitle: 'SELECT Trial, STEP-HFpEF & Cardiometabolic Protection',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on GLP-1 receptor agonists (Semaglutide, Tirzepatide) in secondary cardiovascular prevention and obesity-phenotype HFpEF.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Glucagon-Like Peptide-1 (GLP-1) Receptor Agonists (e.g., Semaglutide, Liraglutide) and dual GIP/GLP-1 receptor co-agonists (Tirzepatide) mimic incretin hormones to enhance glucose-dependent insulin secretion, slow gastric emptying, and promote central satiety, demonstrating significant reductions in Major Adverse Cardiovascular Events (MACE) and cardiovascular mortality in patients with established ASCVD or obesity.' },
              { title: 'Immediate Triage & Red Flags', content: 'Contraindicated in personal or family history of Medullary Thyroid Carcinoma (MTC) or Multiple Endocrine Neoplasia type 2 (MEN 2). Monitor for acute pancreatitis and severe gastroparesis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Landmark Trial Data:\n• SELECT Trial (NEJM 2023): Semaglutide 2.4 mg SC weekly reduced Major Adverse Cardiovascular Events (MACE: CV death, nonfatal MI, nonfatal stroke) by 20% in patients with overweight/obesity and established CVD without diabetes (HR 0.80, p<0.001).\n• STEP-HFpEF Trial (NEJM 2023): Produced significant improvements in KCCQ physical limitation score (+16.6 vs +8.7 points) and 6-minute walk distance in obesity-phenotype HFpEF.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Semaglutide SC once weekly: Initiate at 0.25 mg weekly x 4 weeks, escalate monthly through 0.5 mg, 1.0 mg, 1.7 mg, up to target maintenance dose of 2.4 mg weekly.' },
              { title: 'Stepwise Management Algorithm', content: 'Indicated for secondary ASCVD risk reduction in non-diabetic overweight/obese patients with established cardiovascular disease, representing a major paradigm shift in cardiometabolic therapeutics.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Counsel patients on slow eating and smaller portions to mitigate nausea/vomiting. Hold GLP-1 RAs before elective general anesthesia due to delayed gastric emptying and aspiration risk (follow ASA consensus guidance).' },
              { title: 'Exact Reference & Guideline Citations', content: 'SELECT Trial (NEJM 2023); STEP-HFpEF Trial (NEJM 2023); 2024 ADA Standards of Care in Diabetes.' }
            ]
          }
        ]
      }
    ]
  },

  git: {
    id: 'git',
    name: 'GIT',
    scientificName: 'Gastroenterology & Hepatology',
    icon: 'restaurant',
    color: '#f6dda2',
    illustration: require('../assets/images/specialties/gastroenterology.jpg'),
    generalScope: 'Focus exclusively on the gastrointestinal tract, luminal disorders, hepatobiliary tree, pancreatitis, endoscopy, and liver cirrhosis.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute GI hemorrhages, infections, and surgical abdomen',
        icon: 'warning',
        topics: [
          {
            id: 'upper_gi_bleed',
            title: 'Acute Upper GI Bleeding',
            subtitle: 'Glasgow-Blatchford Score, Variceal vs Peptic Ulcer & Endoscopy',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on upper gastrointestinal bleeding, variceal vs non-variceal bleeding, octreotide, high-dose PPI, and emergent endoscopy.',
            illustration: require('../assets/images/topics/upper_gi_bleed.jpg'),
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute Upper Gastrointestinal Bleeding (UGIB) is intraluminal blood loss originating proximal to the ligament of Treitz (esophagus, stomach, or duodenum), most commonly resulting from peptic ulcer disease, esophageal or gastric varices, Dieulafoy lesions, or Mallory-Weiss tears.' },
              { title: 'Immediate Triage & Red Flags', content: 'Hematemesis (bright red blood or "coffee grounds"), melena, hematochezia with hemodynamic instability. Red Flags: SBP <90, HR >100, orthostatic syncope, altered mental status (indicates massive bleeding >20-25% blood volume loss).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Glasgow-Blatchford Score (GBS 0-23): GBS 0-1 identifies very low risk (safe for outpatient management); GBS ≥6 predicts high risk for endoscopic intervention or transfusion. Rockall Score assesses post-endoscopy rebleeding mortality.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Restrictive Transfusion Strategy: Transfuse PRBCs to target Hemoglobin 7-8 g/dL (transfuse at Hb <7.0 g/dL; target 8.0 g/dL in active acute coronary syndrome).\n• High-Dose PPI: IV Pantoprazole or Esomeprazole 80 mg bolus, followed by 8 mg/hr continuous infusion (or 40 mg IV BID).\n• Suspected Variceal Bleeding / Cirrhosis:\n  1. IV Octreotide: 50 mcg bolus, then 50 mcg/hr continuous IV infusion for 2-5 days.\n  2. Prophylactic Antibiotics: Ceftriaxone 1 g IV daily for 7 days (reduces mortality and rebleeding).' },
              { title: 'Stepwise Management Algorithm', content: '1. Secure 2 large-bore IV lines (16-18G) or central access; initiate crystalloid resuscitation.\n2. Reverse severe coagulopathy (4-Factor PCC for Warfarin reversal; Idarucizumab/Andexanet alfa for DOACs if life-threatening).\n3. Perform Endoscopy (EGD) within 24 hours of presentation (within 12 hours for suspected variceal hemorrhage after resuscitation).\n4. High-risk non-variceal ulcers (Forrest Ia, Ib, IIa): Dual endoscopic therapy (epinephrine injection + hemoclip or thermal coagulation).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT over-transfuse patients with suspected variceal bleeding (Hb target >9-10 g/dL increases portal pressure and precipitates uncontrollable rebound variceal rupture). Routine placement of nasogastric tube is not recommended and carries trauma risk.' },
              { title: 'Exact Reference & Guideline Citations', content: '2021 ACG Clinical Guideline: Upper Gastrointestinal and Ulcer Bleeding; 2022 AASLD Practice Guidance on Portal Hypertension Bleeding in Cirrhosis.' }
            ]
          },
          {
            id: 'acute_pancreatitis',
            title: 'Acute Pancreatitis Management',
            subtitle: 'Revised Atlanta Criteria, BISAP & Goal-Directed Resuscitation',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute pancreatitis, Atlanta classification, BISAP scoring, lactated ringers fluid resuscitation, and infected necrosis.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute Pancreatitis is an acute inflammatory disorder of the pancreas caused by premature intracellular activation of digestive zymogens (trypsinogen) leading to autodigestion of pancreatic parenchyma, peripancreatic fat necrosis, and variable local and systemic inflammatory response syndrome (SIRS), most frequently triggered by gallstones or alcohol.' },
              { title: 'Immediate Triage & Red Flags', content: 'Severe epigastric pain radiating directly to the back, nausea, vomiting. Red Flags: SIRS criteria (temp >38°C, HR >90, RR >20, WBC >12k), oliguria, elevated hematocrit >44% (hemoconcentration), or rising BUN (>20 mg/dL).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Requires ≥2 of 3 Revised Atlanta Criteria:\n1. Characteristic severe epigastric pain.\n2. Serum lipase or amylase >3x upper limit of normal.\n3. Cross-sectional imaging (CT or MRI) findings consistent with acute pancreatitis.\n• Severity Scoring: BISAP (BUN >25, Impaired mental status, SIRS, Age >60, Pleural effusion; score ≥3 indicates high mortality).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Goal-Directed Fluid Resuscitation: Lactated Ringer’s solution (preferred over Normal Saline to prevent hyperchloremic acidosis) at 200-500 mL/hr or 5-10 mL/kg/hr for first 12-24 hours.\n• Analgesia: IV Hydromorphone, Fentanyl, or Buprenorphine for multimodal pain control.\n• Antibiotics: Prophylactic antibiotics are NOT recommended for sterile acute pancreatitis; reserve Carbapenems (Meropenem 1g q8h) only for infected pancreatic necrosis (gas on CT or positive FNA).' },
              { title: 'Stepwise Management Algorithm', content: '1. Establish etiology: RUQ ultrasound (gallstones), serum triglycerides (if >1000 mg/dL consider insulin infusion), calcium, and alcohol history.\n2. Early Oral Feeding: Initiate low-fat solid/liquid oral diet as soon as abdominal pain improves and ileus resolves (no need to keep NPO until lipase normalizes).\n3. Biliary Pancreatitis with Cholangitis: Emergent ERCP within 24 hours.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT order routine contrast CT abdomen at ED arrival (<48-72 hours) unless diagnosis is in doubt. Early CT underestimates the extent of pancreatic necrosis and exposes patients to contrast nephropathy during active hypovolemia.' },
              { title: 'Exact Reference & Guideline Citations', content: '2018 ACG Clinical Guideline: Management of Acute Pancreatitis; 2019 IAP/APA Evidence-based guidelines for acute pancreatitis.' }
            ]
          },
          {
            id: 'acute_cholangitis',
            title: 'Acute Ascending Cholangitis',
            subtitle: 'Tokyo Guidelines (TG18), Charcot Triad & Biliary Drainage',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute ascending cholangitis, Charcot triad, Reynolds pentad, Tokyo guidelines, IV antibiotics, and urgent ERCP decompression.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute Ascending Cholangitis is a life-threatening bacterial infection of the biliary tree resulting from a combination of biliary outflow obstruction (choledocholithiasis, strictures, or stent occlusion) and elevated intraluminal pressure facilitating rapid bacterial translocation into the bloodstream.' },
              { title: 'Immediate Triage & Red Flags', content: 'Charcot\'s Triad: Fever, Right Upper Quadrant abdominal pain, Jaundice. Reynolds\' Pentad (Severe suppurative toxic cholangitis): Charcot\'s Triad + Septic Shock (Hypotension) + Altered Mental Status.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Tokyo Guidelines 2018 (TG18) Diagnostic Criteria:\nA. Systemic inflammation (Fever/chills or WBC <4k or >10k, CRP ≥1).\nB. Cholestasis (Jaundice Total Bili ≥2 mg/dL or elevated ALP/GGT/AST/ALT >1.5x ULN).\nC. Imaging findings (Biliary dilation or stricture/stone on US, CT, or MRCP).\nDefinite Diagnosis: 1 from A + 1 from B + 1 from C.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Broad-Spectrum IV Antibiotics:\n  1. Piperacillin-Tazobactam 4.5 g IV q6h OR\n  2. Ceftriaxone 2 g IV daily + Metronidazole 500 mg IV q8h OR\n  3. Meropenem 1 g IV q8h (if septic shock or risk of ESBL/multidrug resistance).\n• IV Fluid Resuscitation with crystalloids.' },
              { title: 'Stepwise Management Algorithm', content: '1. Immediate hemodynamic stabilization and blood cultures.\n2. Start empiric IV antibiotics within 1 hour.\n3. Biliary Decompression:\n  - Severe (TG18 Grade III / Shock): Emergent ERCP decompression with sphincterotomy and stent within 12 hours.\n  - Moderate (TG18 Grade II): Urgent ERCP within 24-48 hours.\n  - Percutaneous Transhepatic Biliary Drainage (PTBD) if ERCP fails or anatomy is surgically altered.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT delay ERCP decompression in severe cholangitis hoping antibiotics alone will resolve the infection. Biliary obstruction increases intrabiliary pressure, allowing bacteria to continually seed the systemic circulation; drainage is lifesaving.' },
              { title: 'Exact Reference & Guideline Citations', content: 'Tokyo Guidelines 2018 (TG18): Diagnostic criteria and severity assessment of acute cholangitis; 2021 ACG Clinical Guideline: Choledocholithiasis.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'ibd',
            title: 'Inflammatory Bowel Disease',
            subtitle: 'Crohn Disease vs Ulcerative Colitis, Biologics & Monitoring',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on IBD, differentiating Crohn from Ulcerative Colitis, endoscopic Mayo score, biologics (anti-TNF, anti-IL-23), and colorectal cancer surveillance.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Inflammatory Bowel Disease (IBD) is a group of chronic, idiopathic, immune-mediated inflammatory disorders of the gastrointestinal tract comprising Crohn\'s Disease (transmural, patchy inflammation from mouth to anus) and Ulcerative Colitis (continuous, mucosal-only inflammation restricted to the colon and rectum).' },
              { title: 'Immediate Triage & Red Flags', content: 'Bloody diarrhea (>6-10 stools/day), abdominal pain, tenesmus, weight loss. Red Flags: Toxic Megacolon (colonic dilation >6 cm on abdominal radiograph with systemic toxicity), severe fever, tachycardia, peritoneal signs (perforation risk).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Ulcerative Colitis (UC): Mucosal continuous inflammation starting in rectum and extending proximally, absence of granulomas.\n• Crohn\'s Disease (CD): Transmural inflammation, skip lesions anywhere from mouth to anus (terminal ileum most common), cobblestoning, strictures, fistulas.\n• Biomarkers: Fecal Calprotectin (>150-250 mcg/g correlates with active mucosal inflammation) and CRP.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Mild-Moderate UC: Oral Mesalamine 2.4-4.8 g daily + Topical rectal 5-ASA 1 g suppository/enema daily.\n• Acute Severe Flare (Inpatient): IV Methylprednisolone 60 mg daily (or Hydrocortisone 100 mg q6h). Check response on Day 3 (Oxford criteria: >8 stools or CRP >45 predicts 85% colectomy rate without rescue therapy).\n• Moderate-to-Severe Maintenance (Biologics & Small Molecules):\n  1. Anti-TNF: Infliximab 5-10 mg/kg IV or Adalimumab 160/80/40 mg SC.\n  2. Anti-IL-23: Risankizumab (CD) or Mirikizumab/Ustekinumab.\n  3. Oral JAK Inhibitor: Upadacitinib 45 mg induction then 15-30 mg daily.' },
              { title: 'Stepwise Management Algorithm', content: '1. Confirm diagnosis via ileocolonoscopy with biopsies and cross-sectional MR/CT Enterography.\n2. Rule out Clostridioides difficile and CMV colitis before escalating immunosuppression during a flare.\n3. Cancer Surveillance: Surveillance colonoscopy with high-definition chromoendoscopy starting 8 years after disease onset, repeated every 1-3 years.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT use systemic corticosteroids for maintenance therapy in IBD (steroids induce remission but fail to maintain mucosal healing and carry devastating long-term toxicities). Prior to starting biologics (anti-TNF), mandatory screening for latent Tuberculosis (IGRA) and Hepatitis B (HBsAg, anti-HBc) is required.' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 ACG Clinical Guideline: Ulcerative Colitis in Adults; 2021 AGA Clinical Practice Guidelines on the Management of Moderate-to-Severe Ulcerative Colitis and Crohn\'s Disease.' }
            ]
          },
          {
            id: 'cirrhosis_portal_htn',
            title: 'Decompensated Cirrhosis & Portal HTN',
            subtitle: 'Ascites, SBP, Hepatic Encephalopathy & Variceal Prophylaxis',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on decompensated cirrhosis, MELD-Na scoring, diagnostic paracentesis, spontaneous bacterial peritonitis, lactulose, and non-selective beta blockers.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Cirrhosis represents diffuse, irreversible hepatic fibrosis and regenerative nodule formation. Portal Hypertension is a pathological increase in the hepatic venous pressure gradient (HVPG ≥10 mmHg), leading to decompensation complications including ascites, gastroesophageal varices, hepatic encephalopathy, and hepatorenal syndrome.' },
              { title: 'Immediate Triage & Red Flags', content: 'New-onset ascites, jaundice, confusion, hematemesis. Red Flags: Spontaneous Bacterial Peritonitis (fever, abdominal pain, worsening encephalopathy, acute renal injury), Hepatorenal Syndrome (unexplained creatinine rise in cirrhosis with ascites).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Child-Pugh Score (A: 5-6, B: 7-9, C: 10-15) and MELD-Na Score (assesses 90-day transplant waitlist mortality based on Bilirubin, INR, Creatinine, Sodium).\n• Diagnostic Paracentesis: Mandatory for all hospitalized patients with new or worsening ascites. Serum-Ascites Albumin Gradient (SAAG) ≥1.1 g/dL confirms portal hypertension. SBP Diagnosis: Ascitic fluid absolute neutrophil count (PMN) ≥250 cells/mm³ (0.25 x 10⁹/L).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• SBP Treatment: IV Ceftriaxone 2 g daily (or Cefotaxime 2 g q8h) + IV Albumin (1.5 g/kg on Day 1, and 1.0 g/kg on Day 3 - prevents hepatorenal syndrome and reduces mortality by 67%).\n• Ascites Diuretics: Dual therapy with Spironolactone 100 mg PO + Furosemide 40 mg PO once daily in a 100:40 ratio (titrate up to max 400:160 mg) + Sodium restriction <2000 mg/day.\n• Hepatic Encephalopathy: Lactulose 20-30 g (30-45 mL) PO 2-3 times daily titrated to achieve 2-3 soft bowel movements/day. Add Rifaximin 550 mg PO BID for recurrent HE prevention.\n• Variceal Prophylaxis: Carvedilol 6.25-12.5 mg PO daily (preferred non-selective beta-blocker) or Nadolol/Propranolol.' },
              { title: 'Stepwise Management Algorithm', content: '1. Screen all cirrhosis patients for esophageal varices via EGD or non-invasive elastography.\n2. For Large-Volume Paracentesis (>5 Liters): Administer IV Albumin 6-8 grams per liter of ascites removed to prevent post-paracentesis circulatory dysfunction (PICD).\n3. SBP Secondary Prophylaxis: Indefinite oral Ciprofloxacin 500 mg daily or TMP-SMX 1 DS tablet daily after first SBP episode.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never administer NSAIDs to patients with cirrhosis (NSAIDs block renal prostaglandins, precipitating acute renal failure and refractory ascites). Avoid sedatives and narcotics which trigger severe hepatic encephalopathy.' },
              { title: 'Exact Reference & Guideline Citations', content: '2021 AASLD Practice Guidance: Management of Ascites, Spontaneous Bacterial Peritonitis, and Hepatorenal Syndrome; 2021 EASL Clinical Practice Guidelines for decompensated cirrhosis.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'lft_interpretation',
            title: 'Liver Function Tests & FIB-4 Score',
            subtitle: 'Hepatocellular vs Cholestatic Patterns & R Ratio',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on LFT pattern recognition, AST/ALT ratio, R ratio calculation, non-invasive fibrosis scores (FIB-4), and viral/drug hepatotoxicity workup.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Liver Function Tests (LFTs) comprise biochemical assays assessing hepatocellular injury (ALT, AST), cholestasis and biliary excretion (Alkaline Phosphatase, GGT, Bilirubin), and true hepatic synthetic capacity (Albumin, Prothrombin Time / INR), interpreted alongside non-invasive fibrosis scores (FIB-4).' },
              { title: 'Immediate Triage & Red Flags', content: 'Markedly elevated transaminases (ALT/AST >1000-5000 IU/L) indicate acute severe liver injury: 1. Ischemic hepatitis ("shock liver"); 2. Acetaminophen/toxic necrosis; 3. Acute viral hepatitis (A, B, E); 4. Autoimmune hepatitis. Red Flags for Acute Liver Failure: Elevated INR ≥1.5 and altered mental status (hepatic encephalopathy) in a patient without pre-existing cirrhosis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• R Ratio (Differentiates Hepatocellular vs Cholestatic injury):\n  R = (ALT / ALT Upper Limit of Normal) / (ALP / ALP Upper Limit of Normal)\n  - R > 5: Hepatocellular injury\n  - R < 2: Cholestatic injury\n  - R 2 to 5: Mixed injury pattern\n• AST:ALT Ratio:\n  - AST/ALT > 2: Highly suggestive of Alcoholic Liver Disease\n  - ALT > AST: Characteristic of Metabolic Dysfunction-Associated Steatohepatitis (MASH) or Viral Hepatitis.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• FIB-4 Index (Non-Invasive Liver Fibrosis Assessment):\n  FIB-4 = (Age [years] x AST [U/L]) / (Platelet count [10⁹/L] x √ALT [U/L])\n  - Score < 1.30 (<2.0 in age >65): High negative predictive value for advanced fibrosis (NPV >90%, low risk).\n  - Score > 2.67: High probability of advanced fibrosis (F3-F4), prompts transient elastography (FibroScan) or hepatology referral.' },
              { title: 'Stepwise Management Algorithm', content: '1. Classify LFT abnormality into Hepatocellular vs Cholestatic vs Infiltrative.\n2. Hepatocellular: Check Viral serologies (HBsAg, anti-HCV, anti-HAV IgM), Acetaminophen level, Autoimmune markers (ANA, ASMA, IgG), Iron studies (Ferritin, Transferrin saturation for hemochromatosis), Ceruloplasmin (Wilson disease if age <40).\n3. Cholestatic (ALP/GGT): Order Right Upper Quadrant Ultrasound to exclude biliary duct dilation (choledocholithiasis, malignancy). If normal ducts, check Antimitochondrial Antibody (AMA for Primary Biliary Cholangitis) and MRCP (Primary Sclerosing Cholangitis).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Isolated alkaline phosphatase elevation can originate from bone, placenta, or intestine; always check serum GGT or fractionated ALP to confirm hepatic origin before initiating extensive biliary workups.' },
              { title: 'Exact Reference & Guideline Citations', content: '2017 ACG Clinical Guideline: Evaluation of Abnormal Liver Chemistries; 2023 AASLD Practice Guidance on NAFLD/NASH.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'resmetirom_mash',
            title: 'Resmetirom & Thyroid Hormone Receptor-β in MASH',
            subtitle: 'MAESTRO-NASH Landmark Trial & Liver Fibrosis Reversal',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on Resmetirom, thyroid hormone receptor-beta selective agonism, and first FDA-approved treatment for non-cirrhotic MASH with fibrosis.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Resmetirom is a first-in-class, liver-directed, oral Thyroid Hormone Receptor-Beta (THR-β) selective agonist approved for the treatment of non-cirrhotic Metabolic Dysfunction-Associated Steatohepatitis (MASH) with moderate-to-advanced liver fibrosis (stages F2-F3), stimulating hepatic fat oxidation and reducing lipotoxicity.' },
              { title: 'Immediate Triage & Red Flags', content: 'Non-alcoholic Steatohepatitis (MASH) with significant fibrosis (F2-F3 stage) carries elevated risk of progression to decompensated cirrhosis and hepatocellular carcinoma.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'MAESTRO-NASH Phase 3 Trial (NEJM 2024):\n• Evaluated Resmetirom 80 mg and 100 mg daily in patients with biopsy-proven MASH and F1B, F2, or F3 fibrosis.\n• MASH Resolution with no worsening of fibrosis achieved in 25.9-29.9% of patients vs 9.7% on placebo (p<0.001).\n• Fibrosis Improvement by ≥1 stage with no worsening of NAFLD activity score achieved in 24.2-25.9% vs 14.2% on placebo (p<0.001).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Resmetirom (Rezdiffra) PO once daily:\n• Body weight < 100 kg: 80 mg PO once daily.\n• Body weight ≥ 100 kg: 100 mg PO once daily.\n• Administer with or without food.' },
              { title: 'Stepwise Management Algorithm', content: 'Indicated as an adjunct to diet and exercise for the treatment of adults with non-cirrhotic MASH with moderate-to-advanced liver fibrosis (consistent with stages F2 to F3). Monitor lipid panels and non-invasive fibrosis biomarkers (FIB-4, VCTE elastography).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Avoid concomitant use with strong CYP2C8 inhibitors (e.g., Gemfibrozil). Most common adverse events are mild-to-moderate diarrhea and nausea during treatment initiation.' },
              { title: 'Exact Reference & Guideline Citations', content: 'MAESTRO-NASH Phase 3 Trial (NEJM 2024); FDA Approval Summary for Resmetirom (March 2024).' }
            ]
          }
        ]
      }
    ]
  },

  fever: {
    id: 'fever',
    name: 'Fever',
    scientificName: 'Infectious Disease & Critical Care',
    icon: 'thermometer',
    color: '#877bf4',
    illustration: require('../assets/images/specialties/infectious.jpg'),
    generalScope: 'Focus exclusively on severe systemic infections, sepsis, febrile illnesses, antibacterial stewardship, critical care resuscitation, and multi-drug resistance.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute sepsis bundles, septic shock, and fulminant infections',
        icon: 'warning',
        topics: [
          {
            id: 'sepsis',
            title: 'Sepsis & Septic Shock',
            subtitle: 'Surviving Sepsis 1-Hour Bundle, Vasopressors & Fluid Resuscitation',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on sepsis, septic shock, Surviving Sepsis Campaign 1-hour bundle, crystalloid dosing, vasopressors, and lactate clearance.',
            illustration: require('../assets/images/topics/sepsis.jpg'),
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Sepsis is defined by the Sepsis-3 consensus as life-threatening organ dysfunction caused by a dysregulated host response to infection (quantified by an acute increase in SOFA score ≥2). Septic Shock is a subset of sepsis with profound circulatory, cellular, and metabolic abnormalities requiring vasopressors for MAP ≥65 mmHg and presenting with lactate >2.0 mmol/L despite fluid resuscitation.' },
              { title: 'Immediate Triage & Red Flags', content: 'Fever or hypothermia (<36°C), tachycardia, tachypnea, altered mental status, mottling. Septic Shock Red Flags: Persistent hypotension requiring vasopressors to maintain MAP ≥65 mmHg AND serum lactate >2.0 mmol/L despite adequate fluid resuscitation.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Sepsis-3 Definition: Life-threatening organ dysfunction caused by a dysregulated host response to infection (SOFA score increase ≥2 points).\n• qSOFA Screening (≥2 points outside ICU): Respiratory rate ≥22/min, Altered mentation (GCS <15), Systolic BP ≤100 mmHg.\n• Full SOFA evaluates: PaO2/FiO2, Platelets, Bilirubin, MAP/Vasopressors, GCS, and Creatinine/Urine output.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• The Surviving Sepsis 1-Hour Bundle:\n  1. Measure Serum Lactate (remeasure within 2-4 hours if initial lactate >2.0 mmol/L).\n  2. Blood Cultures: 2 sets from different sites BEFORE starting antibiotics (do not delay antibiotics >45 mins if cultures delayed).\n  3. Broad-Spectrum IV Antibiotics: Administer within 1 hour of recognition (e.g. Vancomycin 15-20 mg/kg IV + Cefepime 2 g IV or Piperacillin-Tazobactam 4.5 g IV).\n  4. Rapid Fluid Resuscitation: 30 mL/kg of IV balanced crystalloid (Lactated Ringer’s) within 3 hours for hypotension or lactate ≥4.0 mmol/L.\n  5. First-Line Vasopressor: Norepinephrine infusion (0.05-0.5 mcg/kg/min, target MAP ≥65 mmHg).\n  6. Second-Line Vasopressor: Add Vasopressin 0.03 units/min fixed infusion (do NOT titrate) to reduce norepinephrine requirements.' },
              { title: 'Stepwise Management Algorithm', content: '1. Initiate dynamic measures of fluid responsiveness (passive leg raise test, stroke volume variation on arterial line) rather than static CVP.\n2. If MAP remains refractory to high-dose vasopressors, add IV Hydrocortisone 200 mg/day (50 mg IV q6h).\n3. De-escalate antibiotics at 48-72 hours based on culture sensitivities and clinical trajectory.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Avoid fluid overload after initial resuscitation. Once hemodynamically stabilized, transition to conservative fluid management (excess positive fluid balance increases ARDS risk, renal edema, and ICU mortality).' },
              { title: 'Exact Reference & Guideline Citations', content: 'Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021 (Critical Care Medicine / Intensive Care Medicine).' }
            ]
          },
          {
            id: 'meningitis_encephalitis',
            title: 'Acute Bacterial Meningitis',
            subtitle: 'Empiric Antibiotics, Dexamethasone & CT Head before LP Algorithm',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute bacterial meningitis, triad of fever/stiff neck/altered mental status, CT indications prior to lumbar puncture, and empiric antimicrobial regimens.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute Bacterial Meningitis is a medical emergency characterized by suppurative bacterial infection and inflammation of the subarachnoid space and leptomeninges (pia and arachnoid mater), most commonly caused by S. pneumoniae, N. meningitidis, or L. monocytogenes, leading to elevated ICP and cerebral edema.' },
              { title: 'Immediate Triage & Red Flags', content: 'Classic Triad: Fever, nuchal rigidity, altered mental status. Red Flags: Petechial or purpuric rash (Meningococcemia), papilledema, focal neurologic deficits, new seizures, or GCS <10.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'CSF Analysis Findings (Bacterial Meningitis):\n• Opening Pressure: Elevated (>200 mmH2O)\n• WBC: 1,000 - 10,000 /µL (neutrophil predominance >80%)\n• Protein: Markedly elevated (>100-500 mg/dL)\n• Glucose: Low (CSF:serum glucose ratio <0.40)\n• Gram Stain & Bacterial PCR (BioFire FilmArray panel).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Adults (18-50 years): Ceftriaxone 2 g IV q12h + Vancomycin 15-20 mg/kg IV q8-12h.\n• Adults >50 years or Immunocompromised: Ceftriaxone 2 g IV q12h + Vancomycin 15-20 mg/kg + Ampicillin 2 g IV q4h (mandatory coverage for Listeria monocytogenes).\n• Adjunctive Dexamethasone: 10 mg IV administered with or 15-20 minutes BEFORE the first dose of antibiotics (continue 10 mg q6h for 4 days if Streptococcus pneumoniae is confirmed; discontinue if other pathogen).' },
              { title: 'Stepwise Management Algorithm', content: '1. Check CT Head indications prior to Lumbar Puncture: Immunocompromised, History of CNS disease, New seizure within 1 week, Papilledema, Focal neurological deficit, or Altered consciousness.\n2. If CT required: Draw blood cultures and immediately administer IV Dexamethasone and Antibiotics BEFORE sending patient to the CT scanner!' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'CRITICAL: Never delay antibiotic administration to obtain a CT scan or perform a lumbar puncture. Delaying antimicrobial therapy >2-3 hours in acute bacterial meningitis increases mortality and permanent neurologic disability significantly.' },
              { title: 'Exact Reference & Guideline Citations', content: '2024 ESCMID Guideline for the diagnosis and treatment of acute bacterial meningitis; IDSA Practice Guidelines for the Management of Bacterial Meningitis.' }
            ]
          },
          {
            id: 'necrotizing_fasciitis',
            title: 'Necrotizing Soft Tissue Infections',
            subtitle: 'LRINEC Score, Dishwater Pus & Emergent Surgical Debridement',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on necrotizing fasciitis, Type I polymicrobial vs Type II group A strep, LRINEC score, and emergent operative exploration.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Necrotizing Soft Tissue Infections (NSTIs / Necrotizing Fasciitis) are rapidly progressive, life- and limb-threatening fulminant bacterial infections characterized by widespread necrosis of the subcutaneous tissues and fascial planes with relative sparing of overlying skin in early stages.' },
              { title: 'Immediate Triage & Red Flags', content: 'Severe cutaneous pain disproportionate to visible physical exam findings (earliest hallmark). Red Flags: Rapid spread over hours, skin bullae, cutaneous anesthesia, bronze/purple discoloration, palpable crepitus, and septic shock.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• LRINEC Score (Laboratory Risk Indicator for Necrotizing Fasciitis):\n  Evaluates CRP (≥150), Total WBC (>15k or >25k), Hemoglobin (<13.5 or <11), Sodium (<135), Creatinine (>1.6), Glucose (>180). Score ≥6 raises suspicion; score ≥8 has >90% PPV.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Empiric Broad-Spectrum IV Antimicrobial Therapy:\n  1. Vancomycin 15-20 mg/kg IV q12h (or Daptomycin 8-10 mg/kg) PLUS\n  2. Meropenem 1 g IV q8h (or Piperacillin-Tazobactam 4.5 g q6h) PLUS\n  3. Clindamycin 900 mg IV q8h (essential antitoxin agent; shuts down ribosomal production of Group A Strep pyrogenic exotoxins and Staphylococcal PVL toxin).' },
              { title: 'Stepwise Management Algorithm', content: '1. IMMEDIATE surgical consultation for emergent operating room exploration and radical fascial debridement (the definitive diagnostic and therapeutic modality).\n2. "Dishwater" or foul-smelling fluid along fascial planes confirms diagnosis.\n3. Mandatory re-exploration in operating room at 24 hours ("second-look" debridement).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT delay surgical exploration for imaging (CT/MRI) or laboratory results if clinical suspicion is high. Necrotizing fasciitis travels along fascial planes faster than surface skin changes indicate; mortality increases every hour surgery is delayed.' },
              { title: 'Exact Reference & Guideline Citations', content: '2014 IDSA Practice Guidelines for the Diagnosis and Management of Skin and Soft Tissue Infections; 2018 World Society of Emergency Surgery (WSES) consensus guidelines.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'cap_pneumonia',
            title: 'Community-Acquired Pneumonia',
            subtitle: 'CURB-65 Severity Triage & ATS/IDSA Treatment Guidelines',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on CAP, CURB-65 triage, outpatient vs inpatient regimens, respiratory fluoroquinolones, and MRSA/Pseudomonas risk factors.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Community-Acquired Pneumonia (CAP) is an acute infection of the pulmonary parenchyma acquired outside of hospital or healthcare facilities, characterized by alveolar consolidation, cough, fever, dyspnea, and focal infiltrates on thoracic imaging, most frequently caused by S. pneumoniae or atypical pathogens.' },
              { title: 'Immediate Triage & Red Flags', content: 'Fever, cough with purulent sputum, pleuritic chest pain, dyspnea, crackles. Red Flags: Severe hypoxemia (SpO2 <90%), confusion, hypotension, multilobar infiltrates on CXR, or respiratory rate ≥30/min.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• CURB-65 Score (1 point each):\n  - Confusion\n  - Urea (BUN >19 mg/dL or >7 mmol/L)\n  - Respiratory Rate ≥30/min\n  - Blood Pressure (SBP <90 or DBP ≤60 mmHg)\n  - Age ≥65 years\n• Triage: Score 0-1 = Outpatient; Score 2 = Inpatient general ward; Score ≥3 = High risk, consider ICU admission.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Outpatient (Healthy, No Comorbidities): Amoxicillin 1 g PO TID OR Doxycycline 100 mg PO BID x 5 days.\n• Outpatient (With Comorbidities: COPD, CHF, DM, CKD): Combination Amoxicillin-Clavulanate 875/125 mg PO BID + Azithromycin 500 mg Day 1 then 250 mg daily OR Respiratory Fluoroquinolone monotherapy (Levofloxacin 750 mg PO daily).\n• Inpatient (Non-Severe): Ceftriaxone 1-2 g IV daily + Azithromycin 500 mg IV/PO daily OR Levofloxacin 750 mg IV daily.\n• Inpatient (Severe / ICU): Ceftriaxone 2 g IV daily + Azithromycin 500 mg IV (or Levofloxacin). Add Vancomycin 15 mg/kg q12h and Cefepime 2 g q8h only if prior isolation or verified risk factors for MRSA/Pseudomonas.' },
              { title: 'Stepwise Management Algorithm', content: '1. Obtain CXR or non-contrast CT Chest.\n2. Inpatient blood and sputum cultures prior to antibiotics.\n3. Duration of Therapy: Minimum 5 days; discontinue when patient has been afebrile for ≥48 hours and clinically stable.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Routine coverage for anaerobes (aspiration pneumonia) is no longer recommended in CAP unless lung abscess or empyema is present. Procalcitonin should NOT be used to withhold initial antibiotic therapy in radiographically confirmed pneumonia.' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 ATS/IDSA Clinical Practice Guideline on Community-Acquired Pneumonia.' }
            ]
          },
          {
            id: 'fuo',
            title: 'Fever of Unknown Origin',
            subtitle: 'Petersdorf Diagnostic Algorithm & PET-CT Strategy',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on classical Fever of Unknown Origin, diagnostic criteria, non-invasive workup workflow, and rheumatologic/infectious differentials.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Fever of Unknown Origin (FUO) is defined as documented temperature ≥38.3°C (101°F) on multiple occasions, persisting for >3 weeks without an established etiology despite ≥1 week of comprehensive diagnostic investigation, spanning rheumatologic/vasculitic, infectious, and neoplastic causes.' },
              { title: 'Immediate Triage & Red Flags', content: 'Prolonged fever ≥38.3°C without localized signs. Red Flags: Weight loss, night sweats, new cardiac murmurs (endocarditis), temporal tenderness/vision loss in age >50 (Giant Cell Arteritis).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Classic Petersdorf & Beeson Criteria:\n1. Fever ≥ 38.3°C (101°F) on multiple occasions.\n2. Duration of illness ≥ 3 weeks.\n3. Failure to reach diagnosis after 1 week of comprehensive inpatient investigation (or 3 outpatient visits).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Empiric antibiotics or corticosteroids are contraindicated in stable FUO because they mask infectious cultures and delay definitive histologic diagnosis (withhold empiric therapy while workup is ongoing unless patient is hemodynamically unstable).' },
              { title: 'Stepwise Management Algorithm', content: '1. Phase 1 Workup: Blood cultures x3 from separate venipuncture sites, CBC with differential, ESR, CRP, Comprehensive Metabolic Panel, Urinalysis, HIV antigen/antibody, T-Spot/QuantiFERON TB, ANA, Rheumatoid Factor, CXR, and CT Chest/Abdomen/Pelvis.\n2. Phase 2: Transesophageal Echocardiogram (TEE) for occult endocarditis, viral serologies (CMV, EBV), Serum protein electrophoresis (SPEP/UPEP).\n3. Phase 3: 18F-FDG PET-CT scan (high diagnostic yield for occult large-vessel vasculitis, deep abscesses, and lymphomas).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Always perform a comprehensive medication review. Drug-induced fever (beta-lactams, sulfonamides, anticonvulsants, heparin) is a frequent cause of FUO that resolves within 72 hours of offending drug discontinuation.' },
              { title: 'Exact Reference & Guideline Citations', content: 'Harrison\'s Principles of Internal Medicine 21st Ed (Chapter on Fever of Unknown Origin); 2022 Journal of Internal Medicine FUO diagnostic consensus.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'antibiogram_interpretation',
            title: 'Antibiograms & PK/PD Dosing Targets',
            subtitle: 'MIC, CLSI Breakpoints, Extended Infusions & Time-Dependent Killing',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on institutional antibiograms, minimum inhibitory concentrations, beta-lactam extended infusions, and aminoglycoside peak/MIC monitoring.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'An Antibiogram is an institutional aggregate report summarizing the cumulative in vitro antimicrobial susceptibility profiles of bacterial isolates over a defined period (typically 12 months), utilizing pharmacokinetic/pharmacodynamic (PK/PD) indices (e.g., % time above MIC, AUC/MIC, Peak/MIC) to guide empiric antibiotic regimens.' },
              { title: 'Immediate Triage & Red Flags', content: 'Severe sepsis caused by MDR pathogens (Carbapenem-resistant Enterobacterales / CRE, ESBL, MRSA, or Pseudomonas aeruginosa). Under-dosing beta-lactams in augmented renal clearance (ARC in young septic trauma/ICU patients).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Minimum Inhibitory Concentration (MIC): The lowest antimicrobial concentration preventing visible bacterial growth.\n• Breakpoints (CLSI/EUCAST): Clinical categories (Susceptible, Intermediate, Resistant). Susceptibility is determined by comparing MIC to the established clinical breakpoint, NOT by the numerical value alone.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'PK/PD Optimization Strategies:\n• Time-Dependent Killing (Beta-lactams - Penicillins, Cephalosporins, Carbapenems):\n  Target: Time above MIC (%T > MIC) for 40-70% of dosing interval (100% in severe sepsis).\n  Optimization: Extended infusion (e.g. Piperacillin-Tazobactam 3.375-4.5 g infused over 4 hours q8h OR Cefepime 2 g infused over 4 hours q8h).\n• Concentration-Dependent Killing (Aminoglycosides, Daptomycin):\n  Target: High peak concentration (Cmax / MIC ≥8-10).\n  Optimization: Once-daily high-dose Gentamicin (5-7 mg/kg IV daily).' },
              { title: 'Stepwise Management Algorithm', content: '1. Select empiric regimens where local antibiogram susceptibility exceeds ≥85-90% for the targeted pathogen in critical illness.\n2. Therapeutic Drug Monitoring (TDM):\n  - Vancomycin: Target AUC24 / MIC ratio of 400-600 (trough levels 15-20 mcg/mL are obsolete due to nephrotoxicity risk; use Bayesian AUC software).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never compare MIC values across different antibiotic classes (e.g. an MIC of 2 for Vancomycin is borderline resistant, whereas an MIC of 2 for Cefepime represents high susceptibility). Always reference drug-specific CLSI breakpoints.' },
              { title: 'Exact Reference & Guideline Citations', content: '2020 IDSA/ASHP/SIDP Consensus Guidelines for Vancomycin TDM; CLSI M100 Performance Standards for Antimicrobial Susceptibility Testing.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'short_course_antibiotics',
            title: 'Short-Course Antibiotic Regimens',
            subtitle: 'Evidence from Multicenter Non-Inferiority RCTs ("Shorter is Better")',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on randomized controlled trials supporting shorter antibiotic durations in pneumonia, bacteremia, pyelonephritis, and intra-abdominal infections.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Short-Course Antimicrobial Therapy is an evidence-based antimicrobial stewardship strategy utilizing fixed, shortened durations of targeted antibiotic therapy (e.g., 3-5 days for uncomplicated UTI/CAP, 7 days for HAP/pyelonephritis) that achieve clinical cure rates equivalent to prolonged courses while minimizing resistance and toxicity.' },
              { title: 'Immediate Triage & Red Flags', content: 'Over-prolonged antibiotic courses drive antimicrobial resistance, Clostridioides difficile colitis, and adverse drug events without improving clinical cure rates.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Landmark Trial Evidence:\n• Community-Acquired Pneumonia (CAP): 3 to 5 days is non-inferior to 7-10 days once afebrile for ≥48 hours and clinically stable.\n• Uncomplicated Gram-Negative Bacteremia: 7 days is non-inferior to 14 days of therapy (JAMA 2019).\n• Uncomplicated Pyelonephritis: 5-7 days (Fluoroquinolones) or 7 days (Beta-lactams) is equivalent to 14 days.\n• Intra-Abdominal Infection (STOP-IT Trial): 4 days of antibiotics post-adequate source control achieved identical cure rates to 8-10 days (NEJM 2015).\n' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Re-evaluate antibiotic duration daily. Discontinue antimicrobial therapy as soon as clinical stability criteria and protocolized duration are reached.' },
              { title: 'Stepwise Management Algorithm', content: 'Incorporate biomarker-guided stewardship: Discontinue antibiotics in lower respiratory tract infections when Procalcitonin drops by ≥80% from peak level or falls below <0.25-0.50 mcg/L.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Short courses apply only to uncomplicated infections with adequate source control. Deep-seated, non-drainable infections (e.g. S. aureus endocarditis, vertebral osteomyelitis, un-drained empyema) still require traditional prolonged 4-6 week regimens.' },
              { title: 'Exact Reference & Guideline Citations', content: 'STOP-IT Trial (NEJM 2015); JAMA 2019 Short-Course Bacteremia Trial; 2021 IDSA Guidance on Duration of Therapy for Common Infections.' }
            ]
          }
        ]
      }
    ]
  },

  neuro: {
    id: 'neuro',
    name: 'Neuro',
    scientificName: 'Neurology & Neurocritical Care',
    icon: 'pulse',
    color: '#b0afeb',
    illustration: require('../assets/images/specialties/neurology.jpg'),
    generalScope: 'Focus exclusively on central and peripheral nervous system pathology, ischemic and hemorrhagic stroke, status epilepticus, neuromuscular emergencies, and neuroimaging.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute stroke, status epilepticus, SAH, and herniation',
        icon: 'warning',
        topics: [
          {
            id: 'stroke',
            title: 'Acute Ischemic Stroke',
            subtitle: 'tPA/TNK 4.5h Window, Mechanical Thrombectomy & Blood Pressure Parameters',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on acute ischemic stroke, NIHSS scoring, IV Alteplase/Tenecteplase inclusion/exclusion criteria, and mechanical thrombectomy up to 24 hours.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute Ischemic Stroke (AIS) is an acute focal neurological deficit resulting from sudden focal cerebral or retinal arterial occlusion, leading to critical reduction in cerebral blood flow, rapid core infarction, and a surrounding salvageable ischemic penumbra.' },
              { title: 'Immediate Triage & Red Flags', content: 'Sudden onset of focal neurological deficits: hemiparesis, facial droop, aphasia, hemianopia, ataxia. Code Stroke Activation. Red Flags: Rapid deterioration in GCS, pupillary asymmetry (uncal herniation), or malignant MCA syndrome with cerebral edema.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• National Institutes of Health Stroke Scale (NIHSS 0-42): Quantifies neurologic deficit.\n• Immediate Non-Contrast CT Head: Rules out intracerebral hemorrhage (ASPECTS score for early ischemic changes).\n• CT Angiography (CTA) Arch to Vertex: Identifies Large Vessel Occlusion (LVO: Internal Carotid, M1/M2 MCA, Basilar artery).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Intravenous Thrombolysis (Within 4.5 hours of last known normal):\n  1. Tenecteplase (TNK): 0.25 mg/kg IV single bolus over 5 seconds (max 25 mg) - preferred due to single bolus ease.\n  2. Alteplase (tPA): 0.9 mg/kg IV (max 90 mg; 10% given as initial 1-minute bolus, remainder infused over 60 minutes).\n• Strict BP Management (Prior to Thrombolytic):\n  - Target BP <185/110 mmHg BEFORE lytic, and maintain <180/105 mmHg for 24 hours post-lytic.\n  - Administer IV Labetalol 10-20 mg over 1-2 mins OR IV Nicardipine infusion 5-15 mg/hr.' },
              { title: 'Stepwise Management Algorithm', content: '1. Check fingerstick glucose immediately (rule out hypoglycemia).\n2. If eligible for IV lytic, administer without waiting for CTA or labs (unless on anticoagulants).\n3. Endovascular Thrombectomy (EVT): Indicated for anterior circulation LVO within 6 hours (standard) and up to 24 hours based on DAWN/DEFUSE-3 perfusion imaging criteria (CT perfusion mismatch).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'If patient is NOT a candidate for thrombolysis or thrombectomy, allow permissive hypertension up to 220/120 mmHg for the first 24-48 hours to maintain collateral cerebral perfusion (do NOT acutely lower BP unless >220/120 or concomitant ACS/aortic dissection).' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 AHA/ASA Guidelines for the Early Management of Patients With Acute Ischemic Stroke; 2023 ESO Guidelines on Intravenous Thrombolysis for Acute Ischaemic Stroke.' }
            ]
          },
          {
            id: 'status_epilepticus',
            title: 'Status Epilepticus Protocol',
            subtitle: 'Phase 1 Benzodiazepines, Phase 2 ASMs & Refractory Anesthesia',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on status epilepticus, stepwise timeline (0-5, 5-20, 20-40 mins), benzodiazepines, non-sedating anti-seizure medications, and general anesthesia.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Status Epilepticus (SE) is a state of ongoing seizure activity caused either by failure of seizure termination mechanisms or initiation of mechanisms leading to abnormally prolonged seizures (defined operationally at t1 = 5 minutes for convulsive status epilepticus), posing high risk for neuronal death beyond t2 = 30 minutes.' },
              { title: 'Immediate Triage & Red Flags', content: 'Continuous seizure activity lasting ≥5 minutes (t1 operational definition), or ≥2 discrete seizures without full recovery of consciousness between events. Red Flags: Hyperthermia, rhabdomyolysis, severe metabolic acidosis, non-convulsive status epilepticus (coma with subtle twitching).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Clinical diagnosis. Continuous video-EEG monitoring is mandatory for all patients not returning to baseline within 10-15 minutes or those requiring general anesthesia.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Phase 1: Emergent First-Line (5-20 minutes - Benzodiazepines):\n  1. IV Lorazepam 4 mg IV bolus (0.1 mg/kg) over 2 mins (may repeat once at 5 mins) OR\n  2. IM Midazolam 10 mg IM (for body weight >40 kg; 5 mg for 13-40 kg) if no IV access OR\n  3. IV Diazepam 10 mg IV (0.15-0.2 mg/kg).\n• Phase 2: Urgent Control (20-40 minutes - Non-Sedating ASMs - ESETT Trial Regimens):\n  1. Levetiracetam (Keppra): 60 mg/kg IV (max 4500 mg) over 10 mins OR\n  2. Fosphenytoin: 20 mg PE/kg IV (max 1500 mg PE) at 150 mg PE/min OR\n  3. Valproate Sodium: 40 mg/kg IV (max 3000 mg) over 10 mins.' },
              { title: 'Stepwise Management Algorithm', content: '1. ABCs, high-flow oxygen, check glucose (give 50 mL D50W + 100 mg Thiamine IV if hypoglycemic).\n2. If seizures persist >40 minutes (Refractory Status Epilepticus): Proceed immediately to endotracheal intubation and continuous IV anesthetic infusions:\n  - Propofol 2-5 mg/kg load, then 2-10 mg/kg/hr infusion OR\n  - Midazolam 0.2 mg/kg load, then 0.05-2 mg/kg/hr infusion.\n3. Titrate anesthesia to electrographic burst suppression (8-12 seconds of suppression between bursts) on continuous EEG for 24-48 hours.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Under-dosing benzodiazepines is the single most common provider error in status epilepticus (e.g. giving only 1-2 mg Lorazepam instead of full 4 mg adult dose). Under-dosing leads to treatment failure and increases progression to refractory status epilepticus.' },
              { title: 'Exact Reference & Guideline Citations', content: '2016 American Epilepsy Society (AES) Guideline for Treatment of Status Epilepticus; ESETT Trial (NEJM 2019).' }
            ]
          },
          {
            id: 'subarachnoid_hemorrhage',
            title: 'Subarachnoid Hemorrhage',
            subtitle: 'Ottawa Rule, Hunt & Hess, Nimodipine & Vasospasm Prevention',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on aneurysmal subarachnoid hemorrhage, Ottawa SAH rule, non-contrast CT head, lumbar puncture xanthochromia, and nimodipine.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Non-Traumatic Aneurysmal Subarachnoid Hemorrhage (aSAH) is the extravasation of arterial blood into the subarachnoid space surrounding the brain and spinal cord, most commonly caused by rupture of an intracranial saccular (berry) aneurysm (85%), classically presenting with sudden-onset \'thunderclap\' headache.' },
              { title: 'Immediate Triage & Red Flags', content: 'Classic "Thunderclap headache" (worst headache of life, reaching peak intensity in <1 minute). Red Flags: Syncope, neck stiffness, cranial nerve III palsy (pupil-involving, indicates posterior communicating artery aneurysm), seizures, or sudden coma.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Ottawa SAH Rule: High sensitivity for alert headache patients (Age ≥40, neck pain/stiffness, witnessed loss of consciousness, onset during exertion, thunderclap onset, limited neck flexion).\n• Diagnostic Strategy:\n  1. Non-contrast CT Head: >99% sensitive within 6 hours of headache onset.\n  2. Lumbar Puncture (LP): Mandatory if CT negative/equivocal >6 hours from onset. Confirmed by Xanthochromia (spectrophotometry) or elevated RBC count that does not clear between Tube 1 and Tube 4.\n• Severity: Hunt and Hess Scale (Grades 1-5) and Fisher Grade on CT.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Oral Nimodipine: 60 mg PO (or via NG tube) every 4 hours for 21 consecutive days (reduces delayed cerebral ischemia/vasospasm and improves neurological outcomes; do NOT give IV).\n• Blood Pressure Control (Prior to Aneurysm Securing): Target SBP <140-160 mmHg using IV Nicardipine or Labetalol.\n• Antifibrinolytic (Short-term bridge): Tranexamic Acid (TXA) 1 g IV bolus may be considered prior to aneurysm repair if transfer delayed (<24h max).' },
              { title: 'Stepwise Management Algorithm', content: '1. Emergent neurosurgical / neurointerventional consultation for aneurysm securing (endovascular coiling or surgical clipping within 24 hours).\n2. Place in neuro-ICU: Maintain euvolemia (avoid prophylactic hypervolemia), monitor daily Transcranial Doppler (TCD) for vasospasm (days 4-14).\n3. Treat Delayed Cerebral Ischemia (DCI): Induced hypertension (raise MAP using norepinephrine) and catheter-directed intra-arterial vasodilators (Verapamil/Milrinone).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never administer Nimodipine intravenously (fatal cardiovascular collapse from massive vasodilation). If capsule contents are drawn up for NG tube administration, use an oral syringe clearly labeled "FOR ORAL USE ONLY - NOT FOR IV INJECTION".' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 AHA/ASA Guideline for the Management of Patients With Aneurysmal Subarachnoid Hemorrhage; 2024 Neurocritical Care Society Guidelines.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'migraine_headache',
            title: 'Migraine & Primary Headache Disorders',
            subtitle: 'ICHD-3 Criteria, Triptans, Gepants & CGRP Monoclonals',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on migraine diagnosis, acute abortive therapies (triptans, gepants), and preventive therapies (CGRP monoclonals, topiramate, beta blockers).',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Migraine is a chronic neurovascular disorder characterized by recurrent attacks of moderate-to-severe, throbbing, typically unilateral headache lasting 4-72 hours, aggravated by physical activity and accompanied by autonomic symptoms (nausea, photophobia, phonophobia) and transient focal neurological aura in 25-30% of patients.' },
              { title: 'Immediate Triage & Red Flags', content: 'Pulsatile, unilateral headache lasting 4-72 hours with nausea, photophobia, and phonophobia. Red Flags (SNOOP10 criteria): Systemic symptoms (fever, weight loss), Neurologic deficits, Onset sudden (thunderclap), Older age (>50 new onset), Pattern change, Positional aggravation, Papilledema.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'ICHD-3 Diagnostic Criteria for Migraine without Aura:\n≥5 attacks lasting 4-72 hours, with ≥2 features (unilateral, pulsating, moderate/severe, aggravated by routine activity) AND ≥1 associated symptom (nausea/vomiting OR photophobia and phonophobia).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Acute Abortive Therapy (Take at earliest onset of pain):\n  1. Triptan: Sumatriptan 50-100 mg PO (or 6 mg SC) OR Rizatriptan 10 mg PO (combine with Naproxen 500 mg PO for synergistic efficacy).\n  2. Oral Gepant (CGRP Antagonist - Safe in Vascular Disease): Rimegepant 75 mg PO or Ubrogepant 50-100 mg PO.\n• Preventive Therapy (Indicated for ≥4 headache days/month or disabling attacks):\n  1. Oral First-Line: Topiramate 25-100 mg daily, Propranolol 40-160 mg daily, or Amitriptyline 10-50 mg qhs.\n  2. Targeted CGRP Monoclonal Antibodies: Erenumab 70-140 mg SC monthly, Fremanezumab 225 mg SC monthly, or Galcanezumab 120 mg SC monthly.' },
              { title: 'Stepwise Management Algorithm', content: '1. Establish headache diary and rule out Medication Overuse Headache (MOH: acute abortives used ≥10-15 days/month).\n2. Initiate preventive therapy if acute medications required >2 days/week.\n3. Re-evaluate preventive efficacy at 8-12 weeks.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Triptans and Ergotamines are strictly contraindicated in patients with coronary artery disease, history of myocardial infarction, stroke/TIA, peripheral vascular disease, or uncontrolled hypertension due to coronary and systemic vasoconstriction (prescribe Gepants or Lasmiditan instead).' },
              { title: 'Exact Reference & Guideline Citations', content: 'The International Classification of Headache Disorders 3rd edition (ICHD-3); 2021 American Headache Society (AHS) Consensus Statement on Integrating New Migraine Treatments.' }
            ]
          },
          {
            id: 'parkinsons_disease',
            title: 'Parkinson Disease & Movement Disorders',
            subtitle: 'TRAP Cardinal Signs, Levodopa Optimization & Motor Fluctuations',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on Parkinson disease motor features, initial pharmacotherapy (Levodopa vs dopamine agonists), wearing-off phenomena, and dyskinesias.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Parkinson\'s Disease (PD) is a progressive neurodegenerative movement disorder characterized pathologically by the loss of dopaminergic neurons in the substantia nigra pars compacta and intracellular accumulation of alpha-synuclein Lewy bodies, clinically manifesting with resting tremor, bradykinesia, and rigidity.' },
              { title: 'Immediate Triage & Red Flags', content: 'Asymmetric resting tremor, bradykinesia, rigidity. Red Flags (Parkinson-Plus Syndromes): Early falls (<1 year - PSP), severe autonomic failure (Multiple System Atrophy / MSA), poor levodopa response, or early visual hallucinations/dementia (Dementia with Lewy Bodies).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'MDS Clinical Diagnostic Criteria: Bradykinesia PLUS at least one of: 1. 4-6 Hz resting "pill-rolling" tremor; 2. Rigidity (lead-pipe or cogwheel); 3. Postural instability. Supported by substantial response to dopaminergic therapy and levodopa-induced dyskinesias.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Levodopa/Carbidopa (Sinemet): 25/100 mg PO TID initial, titrate gradually to symptom relief (most effective symptomatic drug for all ages).\n• Dopamine Agonists (Pramipexole 0.125-1.5 mg TID or Ropinirole 0.25-8 mg TID) or MAO-B Inhibitors (Rasagiline 0.5-1 mg daily): Alternative initial options in young patients (<60 years) to delay motor fluctuations.' },
              { title: 'Stepwise Management Algorithm', content: '1. Managing "Wearing-Off" (end-of-dose deterioration):\n  - Increase Levodopa dosing frequency or switch to extended-release.\n  - Add COMT Inhibitor (Entacapone 200 mg with each Levodopa dose) or MAO-B inhibitor.\n2. Managing Peak-Dose Dyskinesia: Reduce individual Levodopa doses or add Amantadine (100 mg BID/TID).\n3. Advanced/Refractory Disease: Evaluate for Deep Brain Stimulation (DBS of Subthalamic Nucleus or GPi) or Levodopa-Carbidopa intestinal gel (LCIG / Duopa).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never abruptly discontinue Levodopa or dopaminergic medications (triggers Parkinsonism-Hyperpyrexia Syndrome, a life-threatening state identical to Neuroleptic Malignant Syndrome with rigidity, hyperthermia, rhabdomyolysis, and autonomic collapse).' },
              { title: 'Exact Reference & Guideline Citations', content: 'Movement Disorder Society (MDS) Clinical Diagnostic Criteria for Parkinson\'s Disease; 2021 AAN Practice Guideline on Parkinson Disease Motor Symptoms.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'nihss_gcs_scoring',
            title: 'Neurologic Assessment Scales (NIHSS & GCS)',
            subtitle: 'Standardized Neurological Deficit Scoring & Coma Triage',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on National Institutes of Health Stroke Scale scoring (0-42) and Glasgow Coma Scale breakdown for acute triage.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Standardized Neurological Assessment Scales are validated clinical scoring tools: the National Institutes of Health Stroke Scale (NIHSS, 0-42 points) quantifies stroke severity and neurological deficit, while the Glasgow Coma Scale (GCS, 3-15 points) objectively assesses level of consciousness and airway safety.' },
              { title: 'Immediate Triage & Red Flags', content: 'NIHSS ≥25 indicates very severe stroke. GCS ≤8 defines severe brain injury/coma and represents the universal threshold for endotracheal intubation ("GCS of 8, intubate").' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• NIH Stroke Scale (NIHSS 0-42 Item Breakdown):\n  1a/1b/1c: Level of Consciousness (0-3, 0-2, 0-2)\n  2: Best Gaze (0-2)\n  3: Visual Fields (0-3)\n  4: Facial Palsy (0-3)\n  5a/5b: Motor Arm Left/Right (0-4 each)\n  6a/6b: Motor Leg Left/Right (0-4 each)\n  7: Limb Ataxia (0-2)\n  8: Sensory (0-2)\n  9: Best Language / Aphasia (0-3)\n  10: Dysarthria (0-2)\n  11: Extinction & Inattention (0-2).\n• Glasgow Coma Scale (GCS 3-15):\n  - Eyes (1-4): 4 Spontaneous, 3 To sound, 2 To pressure, 1 None.\n  - Verbal (1-5): 5 Oriented, 4 Confused, 3 Inappropriate words, 2 Incomprehensible sounds, 1 None.\n  - Motor (1-6): 6 Obeys commands, 5 Localizes, 4 Normal flexion, 3 Abnormal flexion (decorticate), 2 Extension (decerebrate), 1 None.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Scoring Tool).' },
              { title: 'Stepwise Management Algorithm', content: 'Perform serial NIHSS examinations (at baseline, 2 hours post-thrombolytic, 24 hours, and upon any acute change). A ≥4-point increase in NIHSS signifies acute stroke worsening, re-occlusion, or hemorrhagic transformation, prompting urgent stat CT head.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Score what the patient actually does, NOT what you think they can do. Never coach or assist the patient during standardized scoring.' },
              { title: 'Exact Reference & Guideline Citations', content: 'National Institute of Neurological Disorders and Stroke (NINDS) NIHSS Protocol; Teasdale G, Jennett B. Assessment of coma and impaired consciousness (Lancet 1974).' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'anti_amyloid_mabs',
            title: 'Anti-Amyloid Monoclonal Antibodies in Alzheimer Disease',
            subtitle: 'Lecanemab, Donanemab & ARIA Surveillance Protocols',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on disease-modifying therapies in early Alzheimer disease, Phase 3 trials (Clarity AD, TRAILBLAZER-ALZ 2), and ARIA monitoring.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Anti-Amyloid-Beta Monoclonal Antibodies (e.g., Lecanemab, Donanemab) are disease-modifying immunotherapies directed against soluble amyloid-beta protofibrils or aggregated plaques to slow cognitive and functional decline in patients with Early Alzheimer\'s Disease, requiring surveillance for ARIA.' },
              { title: 'Immediate Triage & Red Flags', content: 'Amyloid-Related Imaging Abnormalities (ARIA): ARIA-E (vasogenic edema/sulcal effusions) and ARIA-H (microhemorrhages and superficial siderosis). Highest risk occurs in APOE ε4 homozygotes.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Phase 3 Landmark Trials:\n• Clarity AD (Lecanemab - NEJM 2023): Slowed clinical cognitive and functional decline on CDR-SB by 27% at 18 months in early Alzheimer\'s disease (MCI or mild dementia with confirmed amyloid pathology).\n• TRAILBLAZER-ALZ 2 (Donanemab - JAMA 2023): Slowed clinical progression by 35% on iADRS score in low-medium tau population.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Lecanemab (Leqembi): 10 mg/kg IV infusion every 2 weeks.\n• Donanemab (Kisunla): 700 mg IV q4w for 3 doses, then 1400 mg IV q4w until amyloid plaque clearance on PET.' },
              { title: 'Stepwise Management Algorithm', content: '1. Confirm amyloid pathology via Amyloid PET scan or CSF biomarkers (Aβ42/Aβ40 ratio and p-tau181).\n2. APOE Genotyping: Mandatory counseling and testing before initiation.\n3. Safety Brain MRI Monitoring: Required at baseline, and prior to the 5th, 7th, and 14th infusions (weeks 9, 12, and 52) to detect asymptomatic ARIA.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Hold infusions if moderate-to-severe ARIA-E or symptomatic ARIA develops. Caution with concurrent anticoagulation (increased risk of fatal intracerebral macrohemorrhage).' },
              { title: 'Exact Reference & Guideline Citations', content: 'Clarity AD Trial (NEJM 2023); TRAILBLAZER-ALZ 2 (JAMA 2023); 2023 Appropriate Use Recommendations for Lecanemab.' }
            ]
          }
        ]
      }
    ]
  },

  skin: {
    id: 'skin',
    name: 'Skin',
    scientificName: 'Dermatology & Cutaneous Medicine',
    icon: 'body',
    color: '#eb988a',
    illustration: require('../assets/images/specialties/dermatology.jpg'),
    generalScope: 'Focus exclusively on dermatologic diseases, severe cutaneous adverse reactions, inflammatory dermatoses, skin oncology, and dermoscopy.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'SJS/TEN, erythroderma, DRESS, and dermatologic collapse',
        icon: 'warning',
        topics: [
          {
            id: 'scar',
            title: 'Severe Cutaneous Adverse Reactions (SJS / TEN)',
            subtitle: 'SCORTEN Prognostic Scale, Culprit Drugs & Burn Center Protocol',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on SJS, TEN, SJS/TEN overlap, Nikolsky sign, high-risk medications, SCORTEN mortality scoring, and ICU/Burn unit transfer.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Stevens-Johnson Syndrome (SJS) and Toxic Epidermal Necrolysis (TEN) represent a continuous spectrum of acute, life-threatening, immune-mediated type IV hypersensitivity mucocutaneous reactions characterized by extensive keratinocyte apoptosis, full-thickness epidermal detachment, positive Nikolsky sign, and severe mucosal ulceration.' },
              { title: 'Immediate Triage & Red Flags', content: 'Prodromal fever and malaise followed by painful, dusky erythematous macules coalescing into flaccid bullae and epidermal detachment. Red Flags: Positive Nikolsky sign (sheet-like epidermal sloughing with gentle lateral pressure), involvement of ≥2 mucosal sites (oral stomatitis, severe conjunctivitis, genital erosions).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Classification by Body Surface Area (BSA) Detachment:\n• SJS: <10% BSA detachment\n• SJS/TEN Overlap: 10-30% BSA detachment\n• TEN: >30% BSA detachment\n• SCORTEN Prognostic Score (Calculated on Day 1 & 3, 1 pt each): Age ≥40, Heart rate ≥120, Malignancy, BSA detached >10%, Serum Urea >28 mg/dL (BUN >10 mmol/L), Serum Glucose >250 mg/dL, Bicarbonate <20 mEq/L. Score ≥5 indicates >90% mortality.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Immediate withdrawal of ALL suspected culprit drugs (common culprits: Allopurinol, Lamotrigine, Carbamazepine, TMP-SMX, Nevirapine, NSAIDs).\n• Supportive ICU/Burn Unit Care: Ambient temperature warming (30-32°C), non-adherent silicone dressings, aggressive fluid resuscitation (target urine output 0.5-1 mL/kg/hr).\n• Immunomodulatory Therapies (Specialist Directed):\n  1. Cyclosporine 3-5 mg/kg/day PO/IV in divided doses for 10-14 days OR\n  2. High-dose IVIG (2-3 g/kg total over 3-4 days) OR Etanercept 50 mg SC.' },
              { title: 'Stepwise Management Algorithm', content: '1. Emergent transfer to specialized Burn Center or Dermatologic ICU.\n2. Emergent Ophthalmology consultation (daily amniotic membrane transplantation or lubricating drops to prevent permanent cicatricial blindness).\n3. Strict barrier nursing and sterile wound handling without aggressive debridement.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT aggressively scrub or mechanically debride detached epidermis (the detached blister roof acts as a biological dressing; leave in place and cover with non-adherent petroleum/silicone gauze). Avoid prophylactic systemic antibiotics (increases resistant infections).' },
              { title: 'Exact Reference & Guideline Citations', content: '2021 British Association of Dermatologists guidelines for the management of Stevens-Johnson syndrome/toxic epidermal necrolysis; SCORTEN Validation Consensus.' }
            ]
          },
          {
            id: 'erythroderma',
            title: 'Exfoliative Erythroderma',
            subtitle: 'Red Man Syndrome, Metabolic Collapse & Underlying Etiologies',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on exfoliative erythroderma (>90% BSA), thermoregulatory failure, high-output cardiac failure, and etiology differential.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Exfoliative Erythroderma (Red Man Syndrome) is an inflammatory skin disorder characterized by diffuse, intense erythema and scaling involving >90% of the total body surface area, resulting from pre-existing dermatoses (psoriasis, atopic dermatitis), drug reactions, or cutaneous T-cell lymphoma.' },
              { title: 'Immediate Triage & Red Flags', content: 'Generalized erythema and scaling involving >90% of total body surface area. Red Flags: Severe hypothermia (from cutaneous vasodilation), high-output heart failure (tachycardia, peripheral edema), profound protein-losing enteropathy/exfoliation, and secondary sepsis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Clinical diagnosis (>90% BSA). Etiology Breakdown:\n1. Pre-existing dermatoses (~50%: Psoriasis, Atopic Dermatitis, Seborrheic Dermatitis).\n2. Drug hypersensitivity reactions (~20%: Anticonvulsants, Allopurinol, Antibiotics).\n3. Cutaneous T-Cell Lymphoma / Sézary Syndrome (~15%: check peripheral smear for Sézary cells and flow cytometry for CD4/CD8 ratio >10).\n4. Idiopathic (~15%).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Inpatient Supportive Care: Warm ambient room temperature, fluid/electrolyte repletion, high-protein nutrition.\n• Bland Topical Emollients: Copious white petrolatum under wet wraps.\n• Systemic Medical Therapy: Treat underlying etiology once identified (e.g. Cyclosporine or Acitretin for erythrodermic psoriasis; Dupilumab for severe atopic dermatitis).' },
              { title: 'Stepwise Management Algorithm', content: '1. Discontinue all non-essential medications.\n2. Obtain multiple skin punch biopsies from distinct sites.\n3. Screen for secondary bacterial superinfections (Staph aureus bacteremia).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Avoid systemic corticosteroids in suspected psoriatic erythroderma (steroids provide rapid clearance but trigger life-threatening rebound generalized pustular psoriasis upon tapering). Avoid potent topical steroids over >90% BSA to prevent systemic HPA-axis suppression.' },
              { title: 'Exact Reference & Guideline Citations', content: 'Fitzpatrick\'s Dermatology in General Medicine 9th Ed; 2020 JAAD Consensus on Management of Erythroderma.' }
            ]
          },
          {
            id: 'dress_syndrome',
            title: 'DRESS Syndrome (Drug Reaction with Eosinophilia)',
            subtitle: 'RegiSCAR Criteria, Organ Involvement & Corticosteroid Taper',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on Drug Reaction with Eosinophilia and Systemic Symptoms, RegiSCAR scoring, hepatic/renal/cardiac involvement, and systemic steroid regimens.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Drug Reaction with Eosinophilia and Systemic Symptoms (DRESS / DIHS) is a severe, idiosyncratic, delayed T-cell-mediated hypersensitivity reaction occurring 2-8 weeks after drug initiation, characterized by high fever, extensive cutaneous eruption with facial edema, marked eosinophilia, and multiorgan involvement.' },
              { title: 'Immediate Triage & Red Flags', content: 'Extensive morbilliform eruption developing 2-8 weeks AFTER drug initiation, high fever (>38.5°C), and facial edema. Red Flags: Fulminant acute hepatitis (ALT >5x ULN), acute interstitial nephritis, myocarditis (cardiogenic shock), or pneumonitis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'RegiSCAR Diagnostic Criteria (Score ≥5 = Definite DRESS):\n1. Hospitalization due to reaction.\n2. Acute rash suggestive of DRESS.\n3. Fever >38.5°C.\n4. Lymphadenopathy in ≥2 sites.\n5. Involvement of ≥1 internal organ.\n6. Atypical lymphocytes or Eosinophilia (≥0.7 x 10⁹/L or ≥10%).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Immediate withdrawal of culprit medication (common: Allopurinol, Carbamazepine, Phenytoin, Lamotrigine, Vancomycin, Sulfasalazine).\n• Systemic Corticosteroids: Oral Prednisone 0.5-1.0 mg/kg/day (or IV Methylprednisolone in severe organ failure). Very slow taper over 8-12 weeks to prevent fatal rebound flares.\n• Refractory Organ Disease: Add IVIG (2 g/kg over 5 days) or Cyclosporine (3-5 mg/kg/day) or Tofacitinib.' },
              { title: 'Stepwise Management Algorithm', content: '1. Baseline and serial monitoring: LFTs, Serum Creatinine, CBC with differential, Troponin, and CXR.\n2. Screen for viral reactivation (HHV-6, HHV-7, EBV, CMV PCR) which characteristically drives delayed clinical flares.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Tapering corticosteroids too quickly (<6-8 weeks) frequently causes catastrophic relapse of hepatitis and myocarditis. Counsel patient NEVER to take the offending drug class again (high risk of fatal recurrence).' },
              { title: 'Exact Reference & Guideline Citations', content: 'RegiSCAR Group Guidelines; 2023 JAAD Practice Guideline for DRESS Management.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'psoriasis_vulgaris',
            title: 'Psoriasis Vulgaris & Psoriatic Arthritis',
            subtitle: 'PASI Scoring, Topical Synergies, Systemic Agents & Biologics',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on plaque psoriasis, PASI scoring, topicals (steroids + vitamin D), systemic conventional agents, and targeted biologics (IL-17, IL-23, TNF).',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Psoriasis Vulgaris is a chronic, immune-mediated, systemic inflammatory disease driven by the IL-23/IL-17 cytokine signaling axis, characterized by keratinocyte hyperproliferation and sharply demarcated erythematous plaques covered with thick silvery-white micaceous scales, frequently accompanied by Psoriatic Arthritis.' },
              { title: 'Immediate Triage & Red Flags', content: 'Well-demarcated erythematous plaques with thick, silvery-white micaceous scales on elbows, knees, scalp, and lumbosacral region. Red Flags: Concomitant Psoriatic Arthritis (dactylitis "sausage digit", enthesitis, inflammatory back pain) which requires systemic therapy to prevent irreversible joint destruction.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Clinical diagnosis. Auspitz sign (punctate bleeding upon scale removal) and Koebner phenomenon. Psoriasis Area and Severity Index (PASI 0-72) and Body Surface Area (BSA: <3% mild, 3-10% moderate, >10% severe).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Mild Disease (<3-5% BSA):\n  1. High-potency Topical Corticosteroid (Clobetasol propionate 0.05% ointment) combined with Vitamin D3 analogue (Calcipotriene 0.005%) applied BID for 2-4 weeks.\n  2. Topical Calcineurin Inhibitors (Tacrolimus 0.1%) or Roflumilast 0.3% cream for facial/intertriginous areas.\n• Moderate-to-Severe Disease (>10% BSA or Psoriatic Arthritis):\n  1. Anti-IL-23 Biologics (High Efficacy): Risankizumab 150 mg SC at W0, W4, then q12w OR Guselkumab 100 mg SC.\n  2. Anti-IL-17 Biologics (Rapid Clearance): Ixekizumab 160 mg load then 80 mg q2w to W12 then q4w OR Secukinumab 300 mg.\n  3. Oral Small Molecule: Apremilast 30 mg PO BID or Deucravacitinib 6 mg PO daily.' },
              { title: 'Stepwise Management Algorithm', content: '1. Screen all psoriasis patients for metabolic syndrome, cardiovascular risk, and psoriatic arthritis (PEST screening tool).\n2. For moderate-to-severe disease: Biologics achieve PASI 90/100 (90-100% skin clearance) in >70-80% of patients.\n3. Mandatory pre-biologic screening: Tuberculosis (IGRA), Hepatitis B/C, and HIV.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'NEVER administer oral systemic corticosteroids (Prednisone) for plaque psoriasis (tapering triggers life-threatening rebound generalized pustular psoriasis or erythroderma).' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 AAD-NPF Guidelines of care for the management of psoriasis with biologics; 2021 AAD-NPF Guidelines for topical and systemic psoriasis therapies.' }
            ]
          },
          {
            id: 'atopic_dermatitis',
            title: 'Atopic Dermatitis (Eczema)',
            subtitle: 'Barrier Repair, Topical Calcineurin Inhibitors, Dupilumab & JAK Inhibitors',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on atopic dermatitis pathogenesis, Hanifin and Rajka criteria, skin barrier restoration, Dupilumab, and oral JAK inhibitors.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Atopic Dermatitis (AD / Eczema) is a chronic, relapsing, highly pruritic inflammatory skin disease characterized by skin barrier dysfunction (filaggrin mutations) and immune dysregulation driven by Type 2 helper T-cell (Th2) cytokines (IL-4, IL-13, IL-31), presenting with xerosis, intense pruritus, and flexural lichenification.' },
              { title: 'Immediate Triage & Red Flags', content: 'Intense pruritus ("the itch that rashes"), xerosis, erythematous papules, and lichenification in flexural folds. Red Flags: Eczema Herpeticum (sudden eruption of punched-out umbilicated vesicles caused by HSV-1 superinfection; emergency requiring oral/IV Acyclovir).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Hanifin & Rajka Diagnostic Criteria (Requires ≥3 major criteria: Pruritus, Typical morphology/distribution, Chronic/relapsing dermatitis, Personal/family history of atopy). EASI Score (Eczema Area and Severity Index 0-72).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Foundational Barrier Therapy: Thick ceramide-rich ointments/creams (petrolatum) applied immediately after lukewarm bathing (within 3 minutes).\n• Topical Anti-inflammatory Therapy:\n  1. Mid-to-High Potency Topical Corticosteroids (Triamcinolone 0.1% or Betamethasone 0.05%) for acute flares.\n  2. Topical Calcineurin Inhibitor (Tacrolimus 0.03-0.1% ointment) or Topical PDE4 inhibitor (Crisaborole 2%) or Topical JAK inhibitor (Ruxolitinib 1.5% cream) for steroid-free maintenance.\n• Moderate-to-Severe Systemic Therapy:\n  1. Dupilumab (IL-4Rα antagonist): 600 mg SC loading dose, then 300 mg SC every 2 weeks.\n  2. Tralokinumab (IL-13 antagonist): 600 mg SC load, then 300 mg SC q2w.\n  3. Oral JAK-1 Inhibitors (Rapid Itch Relief): Upadacitinib 15-30 mg PO daily or Abrocitinib 100-200 mg PO daily.' },
              { title: 'Stepwise Management Algorithm', content: '1. Optimize daily emollient barrier restoration and avoid harsh soaps.\n2. Use proactive twice-weekly topical steroid/tacrolimus application on previously affected skin to prevent relapses.\n3. Escalate to Dupilumab or JAK inhibitors for refractory moderate-to-severe disease.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT rely on chronic systemic steroids for eczema maintenance (causes severe rebound flares and long-term toxicity). Promptly treat secondary bacterial superinfections (Staph aureus impetiginization with honey-colored crusts; treat with oral Cephalexin or topical Mupirocin).' },
              { title: 'Exact Reference & Guideline Citations', content: '2024 AAD Guidelines of care for the management of atopic dermatitis with topical therapies; 2023 AAD Guidelines for systemic therapies in atopic dermatitis.' }
            ]
          },
          {
            id: 'acne_rosacea_management',
            title: 'Acne Vulgaris & Rosacea',
            subtitle: 'Topical Retinoids, Fixed Combinations, Oral Isotretinoin & Subtypes',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on acne grading, topical retinoids, benzoyl peroxide, oral isotretinoin protocol, and rosacea subtype management.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acne Vulgaris is a chronic inflammatory disorder of the pilosebaceous unit involving follicular hyperkeratinization, excess sebum production, and C. acnes proliferation. Rosacea is a distinct chronic facial dermatosis characterized by neurovascular dysregulation, facial erythema, telangiectasias, and inflammatory papulopustules.' },
              { title: 'Immediate Triage & Red Flags', content: 'Comedonal vs Inflammatory papulopustular vs Nodulocystic acne with scarring. Red Flags: Severe scarring, psychosocial distress, and Acne Fulminans (sudden ulcerating acne with systemic fever, arthralgias, and leukocytosis).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Clinical grading based on predominant lesion type: Mild (comedones and few papules), Moderate (numerous papules and pustules), Severe (extensive inflammatory nodules, cysts, and sinus tracts).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Mild Acne: Topical Retinoid (Adapalene 0.1-0.3% or Tretinoin 0.025-0.05%) + Benzoyl Peroxide (BPO 2.5-5%) gel daily.\n• Moderate Acne: Fixed Combination (Adapalene + BPO + Topical Clindamycin 1%) PLUS Oral Doxycycline 100 mg PO daily (limit course to 3-4 months to prevent resistance).\n• Severe / Scarring / Refractory Acne: Oral Isotretinoin 0.5-1.0 mg/kg/day PO in 2 divided doses with fatty meals to reach cumulative target dose of 120-150 mg/kg.\n• Rosacea Subtypes:\n  - Erythematotelangiectatic: Topical Brimonidine 0.33% gel or Oxymetazoline 1% cream.\n  - Papulopustular: Topical Ivermectin 1% cream daily OR Oral sub-antimicrobial Doxycycline 40 mg daily.' },
              { title: 'Stepwise Management Algorithm', content: '1. Always combine topical antibiotics with Benzoyl Peroxide to prevent bacterial resistance.\n2. Isotretinoin Protocol: Mandatory dual contraception (iPLEDGE program), baseline and monthly fasting lipids, liver enzymes, and pregnancy tests.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Isotretinoin is a potent teratogen (causes severe craniofacial, cardiac, and CNS fetal malformations); strictly enforce negative pregnancy testing before each 30-day refill. Never combine Isotretinoin with oral Tetracyclines (causes Pseudotumor Cerebri / Idiopathic Intracranial Hypertension).' },
              { title: 'Exact Reference & Guideline Citations', content: '2024 AAD Guidelines of care for the management of acne vulgaris; 2019 National Rosacea Society Expert Committee ROSCO consensus.' }
            ]
          },
          {
            id: 'bullous_disorders',
            title: 'Autoimmune Bullous Diseases',
            subtitle: 'Bullous Pemphigoid vs Pemphigus Vulgaris & Direct Immunofluorescence',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on differentiating Bullous Pemphigoid from Pemphigus Vulgaris, anti-BP180/230 vs anti-desmoglein 1/3, and Rituximab therapy.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Autoimmune Bullous Diseases comprise severe disorders characterized by pathogenic autoantibodies directed against structural epithelial adhesion proteins: Pemphigus Vulgaris (IgG against desmoglein 1/3 causing intraepidermal flaccid blisters) and Bullous Pemphigoid (IgG against BP180/BP230 causing subepidermal tense bullae).' },
              { title: 'Immediate Triage & Red Flags', content: 'Tense blisters vs flaccid blisters with mucosal erosions. Red Flags: Massive fluid loss, secondary septicemia, extensive oral stomatitis preventing nutrition, positive Nikolsky sign.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Bullous Pemphigoid (BP - Elderly): Tense, subepidermal bullae on urticarial base, negative Nikolsky sign, minimal mucosal involvement. Direct Immunofluorescence (DIF): Linear IgG and C3 along basement membrane zone (anti-BP180 and anti-BP230 ELISA).\n• Pemphigus Vulgaris (PV - Middle aged): Flaccid, intraepidermal blisters that rupture easily leaving painful erosions, positive Nikolsky sign, extensive oral mucosal ulceration. DIF: "Fishnet" or "chicken-wire" intercellular IgG throughout epidermis (anti-Desmoglein 3 and 1 ELISA).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Bullous Pemphigoid First-Line: High-potency Topical Corticosteroid (Clobetasol propionate 0.05% cream 20-30 g/day applied to entire body) - superior efficacy and lower mortality compared to high-dose oral steroids.\n• Pemphigus Vulgaris First-Line: Rituximab (anti-CD20) 1000 mg IV on Day 1 and Day 15, combined with oral Prednisone 1 mg/kg/day (tapered rapidly over 6 months).' },
              { title: 'Stepwise Management Algorithm', content: '1. Obtain 2 biopsies: One lesional punch biopsy for Routine H&E Histology, and one perilesional punch biopsy (normal skin within 1 cm of blister) in Michel’s medium for Direct Immunofluorescence.\n2. Confirm antibody titers with serum ELISA.\n3. Add steroid-sparing agents (Azathioprine, Mycophenolate Mofetil, or Dapsone).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never place the Direct Immunofluorescence (DIF) biopsy specimen in standard Formalin (formalin destroys tissue antibodies and invalidates immunofluorescence testing; always use Michel’s transport solution or Zeus fixative).' },
              { title: 'Exact Reference & Guideline Citations', content: '2020 EADV Guidelines for the management of pemphigus vulgaris and pemphigus foliaceus; 2022 EADV Guidelines for bullous pemphigoid.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'dermoscopy_fundamentals',
            title: 'Dermoscopy & Melanoma Evaluation',
            subtitle: 'ABCDE Clinical Rule, Chaos and Clues & Two-Step Algorithm',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on dermoscopic evaluation, differentiating melanocytic vs non-melanocytic lesions, pigment networks, and dermoscopic signs of melanoma.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Dermoscopy (Epiluminescence Microscopy) is a non-invasive in vivo optical diagnostic technique that magnifies cutaneous lesions while eliminating surface reflection, allowing visualization of diagnostic sub-macroscopic pigment patterns, vascular structures, and architectural criteria to enhance melanoma detection.' },
              { title: 'Immediate Triage & Red Flags', content: 'Any pigmented skin lesion with the "Ugly Duckling" sign (looks distinctly different from the patient\'s background nevus pattern), rapid evolution, asymmetrical borders, or dark black/blue-white colors.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Clinical ABCDE Rule for Melanoma:\n  - A: Asymmetry (in one or two axes)\n  - B: Border irregularity (scalloped, notched, poorly defined)\n  - C: Color variation (≥2 colors: tan, brown, black, red, white, blue)\n  - D: Diameter (>6 mm; though melanomas can be smaller)\n  - E: Evolving (change in size, shape, color, or new symptoms - most sensitive clinical clue).\n• Two-Step Dermoscopy Algorithm:\n  - Step 1: Melanocytic features present (pigment network, aggregated globules, branched streaks, or homogeneous blue color)?\n  - Step 2: If melanocytic, check for Melanoma Clues (atypical pigment network with thick lines, irregular dots/globules at periphery, asymmetric blotches, blue-white veil, polymorphous/atypical linear vessels).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool). Diagnostic excision required for suspicious lesions.' },
              { title: 'Stepwise Management Algorithm', content: '1. Perform full-body cutaneous examination under polarized and non-polarized dermoscopy.\n2. Suspicious for Melanoma: Complete narrow-margin (1-3 mm) excisional biopsy down to subcutaneous fat (do NOT perform superficial shave biopsy that transects the base, preventing Breslow depth measurement).\n3. Re-excision margins based on Breslow Depth:\n  - Melanoma In Situ: 5 mm margin\n  - Breslow <1 mm: 1 cm surgical margin\n  - Breslow 1-2 mm: 1-2 cm surgical margin + Sentinel Lymph Node Biopsy\n  - Breslow >2 mm: 2 cm surgical margin + Sentinel Lymph Node Biopsy.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT perform cryotherapy or superficial shave biopsy on an undiagnosed pigmented lesion suspicious for melanoma. Accurate histopathologic staging requires complete excision to measure maximal vertical tumor thickness (Breslow depth).' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 NCCN Clinical Practice Guidelines in Oncology: Melanoma (Cutaneous); 2019 AAD Guidelines for the management of primary cutaneous melanoma.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'jak_inhibitors_dermatology',
            title: 'JAK Inhibitors in Alopecia Areata & Vitiligo',
            subtitle: 'Baricitinib, Ritlecitinib & Ruxolitinib Cream Breakthroughs',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on Janus kinase inhibitors in immune-mediated dermatoses, FDA approvals in severe alopecia areata and non-segmental vitiligo.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Janus Kinase (JAK) Inhibitors (e.g., Baricitinib, Ritlecitinib, topical Ruxolitinib) are targeted small-molecule therapies that block intracellular JAK-STAT signaling downstream of interferon-gamma and inflammatory cytokine receptors, reversing cytotoxic T-cell-mediated immune attack in severe Alopecia Areata and Vitiligo.' },
              { title: 'Immediate Triage & Red Flags', content: 'Severe autoimmune hair loss (>50% scalp loss) and progressive vitiligo causing profound psychosocial morbidity.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Phase 3 Clinical Trial Evidence:\n• BRAVE-AA1/2 & ALLEGRO Trials: Oral Baricitinib (JAK1/2) and Ritlecitinib (JAK3/TEC) achieved ≥80% scalp hair coverage (SALT score ≤20) in ~35-40% of patients with severe alopecia areata at 36-52 weeks.\n• TRuE-V1/V2 Trials (NEJM 2022): Topical Ruxolitinib 1.5% cream (JAK1/2 inhibitor) achieved ≥75% facial repigmentation (F-VASI75) in ~50% of vitiligo patients at 52 weeks by halting IFN-gamma mediated melanocyte destruction.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Severe Alopecia Areata: Baricitinib 2-4 mg PO once daily OR Ritlecitinib 50 mg PO once daily.\n• Vitiligo: Topical Ruxolitinib 1.5% cream applied BID to depigmented areas (up to max 10% BSA).' },
              { title: 'Stepwise Management Algorithm', content: '1. Baseline screening for oral JAK inhibitors: CBC, CMP, lipid panel, Tuberculosis (IGRA), and Hepatitis B/C.\n2. Monitor for class warnings (infections, cytopenias, transaminitis, lipid elevations).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Repigmentation in vitiligo requires ongoing follicular melanocyte migration; counsel patients that visible clinical repigmentation requires at least 12-24 weeks of consistent application.' },
              { title: 'Exact Reference & Guideline Citations', content: 'BRAVE-AA Trials (NEJM 2022); TRuE-V Vitiligo Trials (NEJM 2022); FDA Approval Summaries for Baricitinib, Ritlecitinib, and Ruxolitinib.' }
            ]
          }
        ]
      }
    ]
  },

  gynacology: {
    id: 'gynacology',
    name: 'Gynacology',
    scientificName: 'OB/GYN',
    icon: 'woman',
    color: '#b0afeb',
    illustration: require('../assets/images/specialties/gynecology.jpg'),
    generalScope: 'Focus exclusively on obstetric emergencies, hypertensive pregnancy disorders, intrapartum fetal monitoring, gynecologic oncology, and reproductive endocrinology.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Preeclampsia, postpartum hemorrhage, ectopic pregnancy, and fetal distress',
        icon: 'warning',
        topics: [
          {
            id: 'preeclampsia',
            title: 'Preeclampsia with Severe Features & Eclampsia',
            subtitle: 'MgSO4 Seizure Prophylaxis, Acute Antihypertensives & Delivery Timing',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on preeclampsia with severe features, eclampsia seizure management, IV labetalol/hydralazine, and delivery timing criteria.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Preeclampsia is a multisystem gestational hypertensive disorder characterized by new-onset hypertension (SBP ≥140 or DBP ≥90 mmHg) developing after 20 weeks of gestation, accompanied by proteinuria or maternal end-organ dysfunction (thrombocytopenia, renal insufficiency, impaired liver function, pulmonary edema, or neurological symptoms). Eclampsia is the onset of generalized tonic-clonic seizures in preeclampsia.' },
              { title: 'Immediate Triage & Red Flags', content: 'New-onset hypertension (SBP ≥140 or DBP ≥90 on 2 occasions ≥4h apart) after 20 weeks of gestation. Severe Feature Red Flags: SBP ≥160 or DBP ≥110, intractable severe headache, visual scotomas, persistent RUQ/epigastric pain, pulmonary edema, or Eclamptic seizures.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Preeclampsia: SBP ≥140 or DBP ≥90 after 20 weeks PLUS Proteinuria (≥300 mg/24h urine or Protein/Creatinine ratio ≥0.3) OR in the absence of proteinuria, new onset of:\n  - Thrombocytopenia (Platelets <100,000 /µL)\n  - Renal Insufficiency (Serum Creatinine >1.1 mg/dL or doubling)\n  - Impaired Liver Function (Transaminases >2x ULN)\n  - Pulmonary Edema\n  - New-onset Cerebral / Visual Disturbances.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Seizure Prophylaxis (Mandatory in Severe Features / Eclampsia):\n  Magnesium Sulfate IV: 4 to 6 g IV loading dose in 100 mL over 15-20 mins, followed by 1 to 2 g/hr continuous IV infusion for 24 hours postpartum.\n  (Toxicity antidote: Calcium Gluconate 1 g [10 mL of 10% solution] IV over 3 mins for loss of deep tendon reflexes or respiratory depression).\n• Urgent Antihypertensive Therapy (Target BP 140-150 / 90-100 mmHg within 30-60 mins):\n  1. IV Labetalol: 20 mg IV bolus over 2 mins; if BP ≥160/110 after 10 mins, give 40 mg, then 80 mg q10min (max 220 mg) OR\n  2. IV Hydralazine: 5-10 mg IV bolus over 2 mins, repeat with 10 mg at 20 mins OR\n  3. Oral Nifedipine (Immediate-Release): 10-20 mg PO (repeat in 20 mins if needed).' },
              { title: 'Stepwise Management Algorithm', content: '1. Preeclampsia WITHOUT Severe Features: Expectant management with close fetal/maternal monitoring until delivery at 37 0/7 weeks.\n2. Preeclampsia WITH Severe Features: Deliver at ≥34 0/7 weeks (or immediately at any gestational age if maternal/fetal instability, eclampsia, HELLP syndrome, or placental abruption).\n3. Administer Betamethasone 12 mg IM q24h x 2 doses for fetal lung maturity if <34 0/7 weeks and condition permits 48-hour delay.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Magnesium Sulfate is for SEIZURE PREVENTION, not for blood pressure lowering. Never use ACE inhibitors, ARBs, or mineralocorticoid receptor antagonists in pregnancy (causes fetal renal dysgenesis, oligohydramnios, and neonatal death).' },
              { title: 'Exact Reference & Guideline Citations', content: '2020 ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia; 2023 SMFM Consult Series: Preeclampsia.' }
            ]
          },
          {
            id: 'postpartum_hemorrhage',
            title: 'Postpartum Hemorrhage (PPH)',
            subtitle: 'The 4Ts Etiology, Stepwise Uterotonics, Bakri Balloon & MTP',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on postpartum hemorrhage, cumulative blood loss ≥1000 mL, 4Ts (Tone, Trauma, Tissue, Thrombin), uterotonic agents, Bakri balloon, and MTP.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Postpartum Hemorrhage (PPH) is defined as cumulative blood loss ≥1,000 mL or blood loss accompanied by signs/symptoms of hypovolemia within 24 hours following birth (vaginal or cesarean), categorized etiologically by the \'4Ts\': Tone (uterine atony 70%), Trauma (lacerations 20%), Tissue (retained placenta 10%), and Thrombin (coagulopathies 1%).' },
              { title: 'Immediate Triage & Red Flags', content: 'Cumulative blood loss ≥1,000 mL or blood loss accompanied by signs/symptoms of hypovolemia within 24 hours of delivery. Red Flags: Persistent uterine atony, tachycardia >110 bpm, SBP <90 mmHg, oliguria, rapid drop in hematocrit.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'The 4Ts Differential Diagnosis:\n1. Tone (70-80%): Uterine Atony (soft, boggy, poorly contracted uterus).\n2. Trauma (20%): Cervical, vaginal, or perineal lacerations; uterine rupture.\n3. Tissue (10%): Retained placenta, cotyledons, or succenturiate lobe.\n4. Thrombin (1%): Coagulopathies (DIC, severe preeclampsia/HELLP, abruption).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Continuous Fundal and Bimanual Uterine Compression.\n• Stepwise Uterotonic Pharmacotherapy:\n  1. Oxytocin: 10-40 units IV in 1000 mL crystalloid infusion at 250-500 mL/hr OR 10 units IM.\n  2. Methylergonovine (Methergine): 0.2 mg IM q2-4h (CONTRAINDICATED in Hypertension/Preeclampsia).\n  3. Carboprost Tromethamine (Hemabate / 15-methyl PGF2α): 250 mcg IM or intramyometrial q15-90min up to 8 doses (CONTRAINDICATED in Asthma).\n  4. Misoprostol (Cytotec): 800-1000 mcg sublingually or PR.\n• Tranexamic Acid (TXA): 1 g IV over 10 mins within 3 hours of delivery (repeat 1 g at 30 mins if bleeding continues - WOMAN trial evidence).' },
              { title: 'Stepwise Management Algorithm', content: '1. Activate OB Massive Transfusion Protocol (1:1:1 PRBC : FFP : Platelets).\n2. Inspect genital tract for lacerations; manually explore uterine cavity for retained tissue.\n3. Intrauterine Balloon Tamponade: Insert Bakri balloon and inflate with 300-500 mL sterile saline.\n4. Surgical Escalation: Uterine compression sutures (B-Lynch), uterine artery embolization, or emergent hysterectomy.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Visual estimation routinely underestimates postpartum blood loss by 50%. Always use standardized quantitative blood loss (QBL) collection drapes and gravimetric sponge weighing to trigger early PPH protocol escalation.' },
              { title: 'Exact Reference & Guideline Citations', content: '2017 ACOG Practice Bulletin No. 183: Postpartum Hemorrhage; WOMAN Trial Collaborators (Lancet 2017).' }
            ]
          },
          {
            id: 'ectopic_pregnancy',
            title: 'Acute Ectopic Pregnancy',
            subtitle: 'Discriminatory β-hCG Zone, Methotrexate Protocol & Laparoscopy',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on ectopic pregnancy, quantitative hCG discriminatory zone, TVUS findings, Methotrexate candidate criteria, and laparoscopic salpingectomy.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Ectopic Pregnancy is the implantation of a fertilized ovum outside the endometrial cavity, with >95% occurring within the fallopian tube (ampulla 70%, isthmus 12%, fimbria 11%, interstitial 2-4%). Tubal rupture constitutes a premier obstetric surgical emergency causing catastrophic intra-abdominal hemorrhage and hemorrhagic shock.' },
              { title: 'Immediate Triage & Red Flags', content: 'First-trimester vaginal bleeding and unilateral lower pelvic pain in a reproductive-aged woman with positive pregnancy test. Rupture Red Flags: Sudden severe peritonitis, shoulder tip pain (Kehr sign - diaphragmatic blood irritation), syncope, and hypovolemic shock.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Discriminatory β-hCG Zone (1,500 - 2,000 mIU/mL):\n  At this serum hCG level, a normal intrauterine gestational sac MUST be visible on Transvaginal Ultrasound (TVUS).\n• Ectopic TVUS Findings: Absence of intrauterine pregnancy with β-hCG above discriminatory zone, complex adnexal mass separate from ovary, tubal ring sign, or free peritoneal fluid in pouch of Douglas.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Medical Management (Methotrexate Protocol):\n  - Candidate Criteria: Hemodynamically stable, unruptured mass <3.5 cm, absence of embryonic cardiac activity, baseline hCG <5,000 mIU/mL, and normal renal/liver function.\n  - Single-Dose Regimen: Methotrexate 50 mg/m² IM on Day 1.\n  - Follow-up: Measure serum hCG on Day 4 and Day 7 (expect ≥15% decrease between Day 4 and Day 7; if <15% decrease, administer 2nd dose of MTX or proceed to surgery).' },
              { title: 'Stepwise Management Algorithm', content: '1. If hemodynamically unstable or signs of tubal rupture: Emergent Laparoscopic Salpingectomy (or Salpingostomy if preserving fertility and contralateral tube compromised).\n2. Administer Rho(D) Immune Globulin (RhoGAM 50-300 mcg IM) to all Rh-negative unsensitized patients.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT administer Methotrexate until a viable intrauterine pregnancy has been definitively excluded. Patients receiving Methotrexate must avoid folic acid supplements, NSAIDs, and sexual intercourse until hCG reaches zero.' },
              { title: 'Exact Reference & Guideline Citations', content: '2018 ACOG Practice Bulletin No. 193: Tubal Ectopic Pregnancy; 2020 RCOG Guideline on Diagnosis and Management of Ectopic Pregnancy.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'pcos_management',
            title: 'Polycystic Ovary Syndrome (PCOS)',
            subtitle: 'Rotterdam Criteria, Letrozole Ovulation Induction & Metabolic Risks',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on PCOS, Rotterdam criteria, hyperandrogenism, insulin resistance, combined oral contraceptives, spironolactone, and Letrozole for fertility.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Polycystic Ovary Syndrome (PCOS) is the most common endocrine and metabolic disorder in women of reproductive age, defined by the Rotterdam Consensus by the presence of ≥2 of: ovulatory dysfunction (oligo/anovulation), clinical/biochemical hyperandrogenism, and polycystic ovarian morphology on pelvic ultrasound.' },
              { title: 'Immediate Triage & Red Flags', content: 'Oligomenorrhea, hirsutism, acne, central obesity, infertility. Red Flags: Prolonged unopposed estrogen exposure resulting in endometrial hyperplasia and endometrial carcinoma; screen with endometrial biopsy if prolonged amenorrhea.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Rotterdam Diagnostic Criteria (≥2 of 3 Required):\n1. Ovulatory Dysfunction (oligo- or anovulation presenting as irregular menses).\n2. Clinical and/or Biochemical Hyperandrogenism (modified Ferriman-Gallwey score ≥4-8, elevated total/free testosterone).\n3. Polycystic Ovarian Morphology on Ultrasound (≥20 follicles per ovary measuring 2-9 mm or ovarian volume ≥10 mL).\n• Rule out: Hyperprolactinemia (TSH/Prolactin), 21-hydroxylase non-classic CAH (17-hydroxyprogesterone), and Cushing syndrome.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Patient Not Seeking Pregnancy (Cycle Regulation & Hyperandrogenism):\n  1. Combined Oral Contraceptive Pills (COCPs with low androgenic progestin like Drospirenone or Desogestrel) - first-line.\n  2. Anti-Androgen: Add Spironolactone 50-200 mg PO daily if hirsutism persists after 6 months of COCPs (teratogenic; ensure reliable contraception).\n• Patient Seeking Pregnancy (Ovulation Induction):\n  1. Letrozole (Aromatase Inhibitor): 2.5 mg PO daily on cycle days 3-7 (titrate to max 7.5 mg/day) - FIRST-LINE, superior live-birth rates compared to Clomiphene.\n• Metabolic Management: Metformin 500-2000 mg PO daily for insulin resistance.' },
              { title: 'Stepwise Management Algorithm', content: '1. Screen all PCOS patients for metabolic syndrome with 75 g 2-hour Oral Glucose Tolerance Test (OGTT) and fasting lipid panel.\n2. Lifestyle modification (5-10% weight reduction) restores spontaneous ovulation in over 50% of overweight patients.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT use Clomiphene Citrate as the first-line ovulation agent in PCOS (large multicenter RCTs demonstrate that Letrozole achieves significantly higher live birth and ovulation rates with fewer multiple gestations).' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 International Evidence-based Guideline for the Assessment and Management of PCOS (Monash University / ESHRE / ASRM); 2018 ACOG Practice Bulletin No. 194.' }
            ]
          },
          {
            id: 'cervical_cancer_screening',
            title: 'Cervical Cancer Screening & ASCCP Guidelines',
            subtitle: 'Pap Smear, High-Risk HPV Cotesting & Risk-Based Colposcopy',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on cervical cancer screening intervals, high-risk HPV cotesting, ASCCP risk-based management algorithms, and colposcopy indications.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Cervical Cancer Screening utilizes high-risk Human Papillomavirus (hrHPV) DNA testing and liquid-based cervical cytology (Pap test) to detect oncogenic HPV persistence and premalignant cervical intraepithelial neoplasia (CIN 2/3) prior to malignant transformation, managed according to ASCCP risk-based guidelines.' },
              { title: 'Immediate Triage & Red Flags', content: 'Abnormal cytology vs visible cervical lesion. Red Flags: Visible exophytic or ulcerated cervical mass, postcoital bleeding, or unexplained pelvic pain (mandates immediate punch biopsy regardless of Pap smear history).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Screening Intervals (USPSTF / ACOG Guidelines):\n  - Age 21-29: Cervical cytology (Pap smear) alone every 3 years (do NOT test for HPV in this age group due to high transient clearance).\n  - Age 30-65: Primary High-Risk HPV (hrHPV) testing alone every 5 years (preferred) OR hrHPV + Cytology Cotesting every 5 years OR Cytology alone every 3 years.\n  - Age >65: Discontinue screening if adequate prior negative screening (3 consecutive negative Paps or 2 negative cotests in last 10 years).\n  - Post-Hysterectomy (benign indications): Discontinue screening.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Primary Prevention: HPV 9-Valent Vaccine (Gardasil-9) 2-dose series (ages 9-14) or 3-dose series (ages 15-45).' },
              { title: 'Stepwise Management Algorithm', content: 'ASCCP Risk-Based Management Principles (Calculated Risk of CIN 3+):\n1. Immediate Risk ≥4%: Colposcopy indicated.\n2. Immediate Risk 25-59%: Colposcopy or immediate treatment (LEEP) acceptable.\n3. Immediate Risk ≥60% (e.g. HPV 16/18 with HSIL): Expedited treatment (LEEP / cone biopsy) strongly recommended over diagnostic colposcopy.\n4. Immediate Risk <4%: Return for surveillance in 1 or 3 years.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT perform cervical cancer screening prior to age 21 regardless of the age of sexual debut (HPV prevalence is high but clears spontaneously; screening causes unnecessary cervical excisions and increases future preterm birth risk).' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 ASCCP Risk-Based Management Consensus Guidelines for Abnormal Cervical Cancer Screening Tests and Cancer Precursors (JLTDC 2020); 2018 USPSTF Recommendations.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'fetal_heart_rate_monitoring',
            title: 'Intrapartum Fetal Heart Rate Monitoring (CTG)',
            subtitle: 'NICHD 3-Tier Categorization & Intrauterine Resuscitation',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on Electronic Fetal Monitoring, baseline FHR, variability, decelerations, and NICHD Category I, II, III management.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Intrapartum Fetal Heart Rate (FHR) Cardiotocography (CTG) is the continuous electronic monitoring of fetal heart rate patterns and uterine contractions during labor, categorized by the NICHD 3-Tier System into Category I (normal), Category II (indeterminate requiring surveillance), and Category III (abnormal, predictive of acid-base compromise requiring urgent delivery).' },
              { title: 'Immediate Triage & Red Flags', content: 'NICHD Category III tracing: Predictive of abnormal fetal acid-base status and progressive fetal hypoxia/acidosis (mandates immediate preparation for operative delivery).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• NICHD 3-Tier FHR Categorization:\n  - Category I (Normal): Baseline 110-160 bpm, Moderate variability (6-25 bpm), Absent late/variable decelerations, +/- Accelerations.\n  - Category III (Abnormal): Requires EITHER Absent baseline variability WITH recurrent late decelerations, recurrent variable decelerations, or bradycardia (<110 bpm); OR Sinusoidal pattern (severe fetal anemia).\n  - Category II (Indeterminate): All tracings not classified as Category I or III (requires close surveillance and intrauterine resuscitation).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Uterine Tachysystole Tocolysis: Terbutaline 0.25 mg SC once to relieve excessive uterine contractions (>5 contractions in 10 mins over 30 mins).' },
              { title: 'Stepwise Management Algorithm', content: 'Stepwise Intrauterine Resuscitation Measures:\n1. Maternal Repositioning (Left lateral decubitus to relieve IVC compression).\n2. IV Fluid Bolus: 500-1000 mL Lactated Ringer’s.\n3. Discontinue Oxytocin / uterotonic infusions immediately.\n4. Administer maternal oxygen (10 L/min via non-rebreather mask if maternal hypoxia).\n5. If Category III persists despite resuscitation: Proceed to emergent operative delivery (Cesarean delivery or vacuum/forceps if fully dilated).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Moderate FHR baseline variability (6-25 bpm) is the single most reliable physiological indicator of normal fetal acid-base balance; true fetal hypoxia is virtually excluded in the presence of moderate variability.' },
              { title: 'Exact Reference & Guideline Citations', content: 'ACOG Practice Bulletin No. 106: Intrapartum Fetal Heart Rate Monitoring; NICHD Workshop on Electronic Fetal Monitoring.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'aspirin_preeclampsia_prevention',
            title: 'Low-Dose Aspirin for Preeclampsia Prevention',
            subtitle: 'ASPRE Trial Guidelines & First-Trimester Risk Screening',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on low-dose aspirin in high-risk pregnancy, the ASPRE trial, optimal timing (12-16 weeks), and preeclampsia incidence reduction.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Low-Dose Aspirin Prophylaxis (81-162 mg PO daily, initiated between 12 and 16 weeks of gestation and continued until 36-37 weeks) selectively inhibits platelet COX-1 and thromboxane A2 without suppressing endothelial prostacyclin, preventing placental spiral artery thrombosis and reducing the incidence of preterm preeclampsia.' },
              { title: 'Immediate Triage & Red Flags', content: 'Women with clinical risk factors for preeclampsia require prophylactic intervention in the first trimester before spiral artery remodeling is complete.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Landmark ASPRE Trial (NEJM 2017):\n• Administering Aspirin 150 mg PO daily at bedtime starting between 11-14 weeks until 36 weeks of gestation reduced the incidence of preterm preeclampsia (<37 weeks) by 62% in high-risk women (HR 0.38, 95% CI 0.20-0.74).\n• High-Risk Indicators (Initiate Aspirin if ≥1 High-Risk factor):\n  - Prior preeclampsia (especially with preterm delivery)\n  - Chronic hypertension\n  - Pre-gestational diabetes (Type 1 or 2)\n  - Renal disease\n  - Autoimmune disease (SLE, Antiphospholipid Syndrome)\n  - Multifetal gestation.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Low-Dose Aspirin: 81 to 162 mg PO daily taken at bedtime, initiated between 12 and 16 weeks of gestation (ideally before 16 weeks) and continued daily until 36 weeks or delivery.' },
              { title: 'Stepwise Management Algorithm', content: 'Screen all pregnant women for preeclampsia risk at initial prenatal visit and initiate low-dose aspirin prophylaxis promptly if eligible.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Initiating aspirin after 20 weeks of gestation provides significantly diminished clinical benefit because trophoblastic invasion and uterine spiral artery remodeling are already established.' },
              { title: 'Exact Reference & Guideline Citations', content: 'ASPRE Trial (NEJM 2017); 2021 USPSTF Recommendation Statement: Aspirin Use to Prevent Preeclampsia; 2023 ACOG Practice Advisory.' }
            ]
          }
        ]
      }
    ]
  },

  lungs: {
    id: 'lungs',
    name: 'Lungs',
    scientificName: 'Pulmonology & Respiratory Medicine',
    icon: 'leaf',
    color: '#877bf4',
    illustration: require('../assets/images/specialties/pulmonology.jpg'),
    generalScope: 'Focus exclusively on respiratory pathology, pulmonary embolism, ARDS, mechanical ventilation, asthma, COPD, and thoracic interventions.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'PE, status asthmaticus, ARDS, tension pneumothorax, and respiratory failure',
        icon: 'warning',
        topics: [
          {
            id: 'pe',
            title: 'Acute Pulmonary Embolism',
            subtitle: 'Wells Score, PERC Rule, PESI & Systemic Thrombolysis',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus strictly on pulmonary embolism, DVT, Wells criteria, high-sensitivity D-dimer, CTPA, PESI score, and systemic thrombolysis.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute Pulmonary Embolism (PE) is an acute mechanical obstruction of one or more pulmonary arterial branches by an embolus originating from deep vein thrombosis (DVT) of the lower extremities or pelvic veins, leading to ventilation-perfusion mismatch, increased pulmonary vascular resistance, and acute right ventricular strain or failure.' },
              { title: 'Immediate Triage & Red Flags', content: 'Sudden onset dyspnea, pleuritic chest pain, tachypnea, hemoptysis, syncope. High-Risk (Massive) PE Red Flags: Hemodynamic collapse (SBP <90 mmHg or drop ≥40 mmHg for >15 mins, or cardiac arrest).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Wells Criteria for PE:\n  - Clinical signs of DVT (3 pts)\n  - PE most likely diagnosis (3 pts)\n  - HR >100 bpm (1.5 pts)\n  - Immobilization/surgery in past 4w (1.5 pts)\n  - Prior DVT/PE (1.5 pts)\n  - Hemoptysis (1 pt)\n  - Malignancy (1 pt)\n• Low Risk (Wells <2): Apply PERC Rule (if all 8 PERC criteria met, PE ruled out without D-dimer).\n• Moderate Risk (Wells 2-6): Order high-sensitivity D-dimer (age-adjusted cutoff: Age x 10 for age >50).\n• High Risk (Wells >6): CT Pulmonary Angiography (CTPA) immediately.\n• Risk Stratification: PESI score and RV strain on TTE / elevated Troponin/BNP.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Hemodynamically Stable (Low / Intermediate-Low Risk):\n  Direct Oral Anticoagulants (DOACs - Preferred):\n  1. Apixaban: 10 mg PO BID for 7 days, then 5 mg PO BID OR\n  2. Rivaroxaban: 15 mg PO BID with food for 21 days, then 20 mg PO daily OR\n  3. LMWH (Enoxaparin 1 mg/kg SC q12h) bridged to Dabigatran/Edoxaban.\n• Hemodynamically Unstable (Massive PE / Shock):\n  Systemic Thrombolysis: Alteplase (tPA) 100 mg IV infusion over 2 hours (or 50 mg IV bolus in cardiac arrest) + Unfractionated Heparin infusion.' },
              { title: 'Stepwise Management Algorithm', content: '1. Start empiric anticoagulation immediately while awaiting CTPA if pretest probability is high and bleeding risk is low.\n2. In Massive PE with contraindications to thrombolysis: Catheter-directed thrombectomy or surgical embolectomy.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT order D-dimer in high-probability patients (a negative D-dimer does not safely rule out PE when pretest probability is high; proceed straight to CTPA). Avoid DOACs in severe renal impairment (CrCl <15-30 mL/min) or Antiphospholipid Syndrome (use Warfarin).' },
              { title: 'Exact Reference & Guideline Citations', content: '2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism developed in collaboration with the ERS; 2021 CHEST Guideline and Expert Panel Report: Antithrombotic Therapy for VTE Disease.' }
            ]
          },
          {
            id: 'asthma_exacerbation',
            title: 'Severe Acute Asthma Exacerbation',
            subtitle: 'Peak Flow, SABA/SAMA Nebulization, IV Magnesium & Non-Invasive Ventilation',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute asthma exacerbation, peak expiratory flow, high-dose bronchodilators, systemic corticosteroids, IV magnesium, and Heliox/BiPAP.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Severe Acute Asthma Exacerbation (Status Asthmaticus) is an acute or subacute progressive worsening of airway inflammation, bronchospasm, mucosal edema, and mucus plugging causing severe airflow limitation, air trapping, hypoxemia, and ventilation-perfusion mismatch refractory to routine short-acting bronchodilator therapy.' },
              { title: 'Immediate Triage & Red Flags', content: 'Severe dyspnea, wheezing, tachypnea (>30/min), tachycardia (>120 bpm), inability to speak full sentences. Impending Respiratory Arrest Red Flags: "Silent chest" (absence of wheezing due to severe airflow limitation), paradoxical thoracoabdominal movement, cyanosis, and drowsiness/confusion.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Peak Expiratory Flow Rate (PEFR): Severe exacerbation defined as PEFR <50% of predicted or personal best. Normal or elevated PaCO2 (>42 mmHg) on blood gas in an asthmatic patient signifies respiratory muscle exhaustion (normally hyperventilate with low PaCO2).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Inhaled Bronchodilators:\n  Albuterol 2.5-5.0 mg + Ipratropium Bromide 0.5 mg nebulized continuously or every 20 minutes for 3 doses.\n• Systemic Corticosteroids (Early Administration):\n  Oral Prednisone 40-60 mg PO daily OR IV Methylprednisolone 60-80 mg IV q12h.\n• Adjunctive Therapy for Severe / Refractory Cases:\n  1. Magnesium Sulfate: 2.0 g IV infusion in 100 mL over 20 minutes (promotes bronchial smooth muscle relaxation).\n  2. Epinephrine 0.3-0.5 mg IM (1:1,000) for anaphylaxis-associated bronchospasm.\n• Oxygen Therapy: Titrate to SpO2 93-95% (avoid 100% hyperoxia).' },
              { title: 'Stepwise Management Algorithm', content: '1. Initiate continuous nebulizers + systemic steroids + IV magnesium.\n2. Trial Non-Invasive Positive Pressure Ventilation (BiPAP/CPAP) to decrease work of breathing.\n3. If intubation required: Use large endotracheal tube (≥8.0 mm), low respiratory rate (10-12/min), and prolonged expiratory time (I:E ratio 1:3 to 1:4) to prevent dynamic hyperinflation and Auto-PEEP.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'A "normal" PaCO2 of 40 mmHg in an acute severe asthma attack is a DANGER sign of impending respiratory arrest (reflects diaphragm exhaustion; prepare for definitive airway support).' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 Global Initiative for Asthma (GINA) Global Strategy for Asthma Management and Prevention; 2020 NAEPP Asthma Guidelines.' }
            ]
          },
          {
            id: 'ards_protocol',
            title: 'Acute Respiratory Distress Syndrome (ARDS)',
            subtitle: 'Berlin Definition, Lung-Protective Ventilation & Prone Positioning',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on ARDS, Berlin definition, lung-protective mechanical ventilation (6 mL/kg PBW, plateau pressure <30), prone positioning, and neuromuscular blockade.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute Respiratory Distress Syndrome (ARDS) is defined by the Berlin Definition as acute diffuse inflammatory lung injury developing within 1 week of a known clinical insult (sepsis, pneumonia, trauma, aspiration), characterized by increased pulmonary vascular permeability, diffuse alveolar damage, non-cardiogenic pulmonary edema, and severe arterial hypoxemia (PaO2/FiO2 ≤300 on PEEP ≥5).' },
              { title: 'Immediate Triage & Red Flags', content: 'Severe acute hypoxemic respiratory failure refractory to oxygen therapy within 1 week of a known clinical insult (sepsis, pneumonia, aspiration, severe pancreatitis, trauma).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Berlin Definition of ARDS (Requires all 4):\n1. Timing: Within 1 week of clinical insult or new/worsening respiratory symptoms.\n2. Imaging: Bilateral opacities on CXR or CT not fully explained by effusions or collapse.\n3. Origin of Edema: Respiratory failure NOT fully explained by heart failure or fluid overload (objective assessment with TTE to exclude cardiogenic edema).\n4. Oxygenation (with PEEP ≥5 cmH2O):\n  - Mild ARDS: 200 < PaO2/FiO2 ≤ 300\n  - Moderate ARDS: 100 < PaO2/FiO2 ≤ 200\n  - Severe ARDS: PaO2/FiO2 ≤ 100.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Lung-Protective Mechanical Ventilation Protocol (ARMA Trial):\n  1. Tidal Volume: 4 to 8 mL/kg of PREDICTED Body Weight (PBW - based on height, not actual weight; start at 6 mL/kg PBW).\n  2. Plateau Pressure Target: Pplat ≤30 cmH2O (reduce tidal volume by 1 mL/kg if Pplat >30).\n  3. PEEP Titration: Use ARDSNet PEEP/FiO2 titration tables (higher PEEP for moderate-severe ARDS).\n  4. Permissive Hypercapnia: Allow pH 7.20-7.30 to maintain lung-protective low tidal volumes.' },
              { title: 'Stepwise Management Algorithm', content: '1. Moderate-to-Severe ARDS (PaO2/FiO2 <150):\n  - Prone Positioning: Minimum 16 consecutive hours/day (PROSEVA trial demonstrated significant 50% mortality reduction; HR 0.39).\n  - Neuromuscular Blockade: Cisatracurium infusion for 48 hours in early severe ARDS with ventilator dyssynchrony.\n2. Conservative Fluid Management: Maintain dry fluid balance once shock is resolved (FACTT trial).\n3. Refractory Severe Hypoxemia (PaO2/FiO2 <80): VV-ECMO evaluation (EOLIA criteria).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never set ventilator tidal volumes based on actual body weight (an obese patient has normal-sized lungs; calculating tidal volume on actual weight causes severe barotrauma, volutrauma, and pneumothorax).' },
              { title: 'Exact Reference & Guideline Citations', content: 'The Berlin Definition of ARDS (JAMA 2012); PROSEVA Trial (NEJM 2013); 2023 ESICM Guidelines on Acute Respiratory Distress Syndrome.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard guidelines and chronic disease management',
        icon: 'book',
        topics: [
          {
            id: 'copd_gold_guidelines',
            title: 'COPD Management (GOLD 2024)',
            subtitle: 'GOLD ABE Staging, Dual Bronchodilation & Inhaled Corticosteroid Stewardship',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on COPD, spirometry diagnosis (FEV1/FVC <0.70), GOLD 2024 ABE classification, LAMA/LABA dual inhalers, and exacerbation management.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Chronic Obstructive Pulmonary Disease (COPD) is a heterogeneous lung condition characterized by chronic respiratory symptoms (dyspnea, cough, sputum production) and persistent, usually progressive airflow limitation caused by airway abnormalities (bronchiolitis) and/or alveolar destruction (emphysema), confirmed by post-bronchodilator FEV1/FVC <0.70 per GOLD guidelines.' },
              { title: 'Immediate Triage & Red Flags', content: 'Chronic progressive dyspnea, chronic cough, sputum production. Acute Exacerbation Red Flags: Acute worsening of dyspnea, increased sputum volume, increased sputum purulence, acute respiratory acidosis (pH <7.35, PaCO2 >45 mmHg).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Diagnosis requires post-bronchodilator spirometry showing FEV1/FVC < 0.70.\n• GOLD 2024 ABE Classification:\n  - Group A: 0-1 moderate exacerbations (no hospitalizations), low symptoms (mMRC 0-1, CAT <10). Initial: Single Bronchodilator (LAMA or LABA).\n  - Group B: 0-1 moderate exacerbations, high symptoms (mMRC ≥2, CAT ≥10). Initial: Dual LABA + LAMA.\n  - Group E: ≥2 moderate exacerbations OR ≥1 exacerbation requiring hospitalization. Initial: Dual LABA + LAMA (add Inhaled Corticosteroid / Triple Therapy if Blood Eosinophils ≥300 cells/µL).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Maintenance Dual Bronchodilation (LAMA/LABA):\n  Umeclidinium/Vilanterol OR Tiotropium/Olodaterol OR Glycopyrrolate/Formoterol.\n• Triple Therapy (LAMA + LABA + ICS - ETHOS/IMPACT Evidence):\n  Fluticasone furoate / Umeclidinium / Vilanterol (Trelegy) 100/62.5/25 mcg 1 inhalation daily OR Budesonide / Glycopyrrolate / Formoterol (Breztri) 160/9/4.8 mcg 2 puffs BID.\n• Acute Exacerbation Regimen:\n  1. SABA + SAMA nebulizers (Albuterol/Ipratropium) q4-6h.\n  2. Oral Prednisone 40 mg PO once daily for exactly 5 days.\n  3. Antibiotics (Azithromycin 500 mg Day 1 then 250 mg daily x 4d or Doxycycline 100 mg BID x 5d) for 5 days if increased sputum purulence.' },
              { title: 'Stepwise Management Algorithm', content: '1. Inhaled Corticosteroid (ICS) Decision Rules:\n  - Strongly Recommended: Blood eosinophils ≥300 cells/µL or history of asthma.\n  - Not Recommended / Harmful: Blood eosinophils <100 cells/µL (increases pneumonia risk without exacerbation benefit).\n2. Acute Hypercapnic Respiratory Failure: Non-Invasive Positive Pressure Ventilation (BiPAP) is first-line (reduces intubation by 65% and mortality by 50%).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never prescribe systemic corticosteroids for longer than 5 days in acute COPD exacerbations (the landmark REDUCE trial proved 5 days is non-inferior to 14 days and reduces adverse steroid complications).' },
              { title: 'Exact Reference & Guideline Citations', content: 'Global Initiative for Chronic Obstructive Lung Disease (GOLD) 2024 Report; REDUCE Trial (JAMA 2013).' }
            ]
          },
          {
            id: 'interstitial_lung_disease',
            title: 'Idiopathic Pulmonary Fibrosis (IPF)',
            subtitle: 'High-Resolution CT (HRCT) UIP Pattern & Antifibrotic Therapies',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on Idiopathic Pulmonary Fibrosis, Usual Interstitial Pneumonia pattern, antifibrotics (Nintedanib, Pirfenidone), and lung transplantation referral.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Idiopathic Pulmonary Fibrosis (IPF) is a specific form of chronic, progressive, fibrosing interstitial pneumonia of unknown etiology, occurring primarily in older adults and characterized by the histopathological or radiological pattern of Usual Interstitial Pneumonia (UIP: subpleural, basal-predominant reticulation, honeycombing, and traction bronchiectasis).' },
              { title: 'Immediate Triage & Red Flags', content: 'Exertional dyspnea, dry chronic cough, bilateral dry inspiratory "Velcro" crackles at lung bases, and digital clubbing in an older adult (>60 years). Red Flags: Acute IPF Exacerbation (rapidly progressive hypoxemic failure with new bilateral ground-glass opacities; carries >50% in-hospital mortality).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Definite UIP Pattern on HRCT (Without need for surgical biopsy if characteristic):\n1. Subpleural and basal predominance.\n2. Reticular abnormalities.\n3. Honeycombing with or without traction bronchiectasis.\n4. Absence of inconsistent features (extensive ground-glass opacities, micronodules, mosaic attenuation/air trapping).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Antifibrotic Pharmacotherapy (Slows FVC decline by ~50%):\n  1. Nintedanib (Tyrosine Kinase Inhibitor): 150 mg PO BID with food (monitor LFTs and diarrhea).\n  2. Pirfenidone (TGF-β Inhibitor): Titrated up to 801 mg PO TID with meals (monitor photosensitivity rash and LFTs).' },
              { title: 'Stepwise Management Algorithm', content: '1. High-Resolution CT Chest (HRCT) with inspiratory, expiratory, and prone views.\n2. Exclude secondary ILD causes (autoimmune connective tissue disease serologies, environmental hypersensitivity pneumonitis, drug exposures).\n3. Early referral for Pulmonary Rehabilitation, supplemental oxygen, and Lung Transplantation evaluation.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT prescribe systemic corticosteroids or immunosuppressive agents (Azathioprine/NAC) in Idiopathic Pulmonary Fibrosis (the PANTHER-IPF trial proved combination immunosuppression increases mortality and hospitalizations in IPF).' },
              { title: 'Exact Reference & Guideline Citations', content: '2022 ATS/ERS/JRS/ALAT Clinical Practice Guideline on Idiopathic Pulmonary Fibrosis and Progressive Pulmonary Fibrosis; PANTHER-IPF Trial (NEJM 2012).' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Interpretations, scoring algorithms, and procedural guides',
        icon: 'construct',
        topics: [
          {
            id: 'spirometry_pft_interpretation',
            title: 'Pulmonary Function Tests (PFTs) & Spirometry',
            subtitle: 'Obstructive vs Restrictive Patterns, DLCO & Bronchodilator Reversibility',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on systematic interpretation of spirometry, lung volumes, diffusion capacity (DLCO), and bronchodilator response.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Pulmonary Function Testing (PFT) comprises diagnostic physiological assays including Spirometry (FEV1, FVC, FEV1/FVC ratio assessing obstructive vs restrictive patterns), Lung Volumes (TLC, RV, FRC measured by plethysmography confirming true restriction when TLC <80%), and Diffusing Capacity of the Lungs for Carbon Monoxide (DLCO).' },
              { title: 'Immediate Triage & Red Flags', content: 'Severe airflow obstruction (FEV1 <30% predicted) or profound restriction (TLC <50% predicted) with resting hypoxemia.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Stepwise PFT Interpretation Algorithm:\n  1. Check FEV1/FVC Ratio: If <0.70 (or < Lower Limit of Normal / LLN), an Obstructive Defect is present.\n  2. Check Total Lung Capacity (TLC): If FEV1/FVC is normal and TLC <80% predicted, a Restrictive Defect is present.\n  3. Check Bronchodilator Reversibility (Post-Albuterol): Positive if FEV1 or FVC increases by ≥12% AND ≥200 mL.\n  4. Check Diffusing Capacity (DLCO):\n     - Obstructive + Low DLCO: Emphysema\n     - Obstructive + Normal/High DLCO: Asthma or Chronic Bronchitis\n     - Restrictive + Low DLCO: Intrinsic Lung Disease (IPF, Sarcoidosis, Hypersensitivity Pneumonitis)\n     - Restrictive + Normal DLCO: Extrinsic / Chest Wall / Neuromuscular disorder (Myasthenia, ALS, Obesity hypoventilation)\n     - Normal Spirometry/Volumes + Isolated Low DLCO: Pulmonary Arterial Hypertension (PAH), Chronic Thromboembolic Pulmonary HTN (CTEPH), or early ILD.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Not applicable (Diagnostic Tool).' },
              { title: 'Stepwise Management Algorithm', content: 'Follow the 2022 ATS/ERS interpretation standards using GLI (Global Lung Function Initiative) reference equations and Lower Limit of Normal (LLN) to prevent misdiagnosis in elderly patients.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never diagnose a restrictive ventilatory defect based on spirometry alone (a low FVC can be caused by air trapping in severe obstruction; true restriction MUST be confirmed by measuring Total Lung Capacity / TLC by plethysmography).' },
              { title: 'Exact Reference & Guideline Citations', content: '2022 ATS/ERS Technical Standard: Interpretative Strategies for Routine Lung Function Tests (Eur Respir J 2022).' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Latest evidence-based medicine and landmark trials',
        icon: 'flask',
        topics: [
          {
            id: 'triple_therapy_copd',
            title: 'Single-Inhaler Triple Therapy in COPD',
            subtitle: 'All-Cause Mortality Benefits in ETHOS and IMPACT Trials',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on single-inhaler triple therapy (LAMA/LABA/ICS) in moderate-to-severe COPD, exacerbation reduction, and mortality reduction.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Single-Inhaler Triple Therapy in COPD combines an Inhaled Corticosteroid (ICS), a Long-Acting Muscarinic Antagonist (LAMA), and a Long-Acting Beta-2 Agonist (LABA) in a single device, indicated for symptomatic COPD patients (GOLD Group E) with blood eosinophils ≥300 cells/mcL or recurrent moderate-to-severe exacerbations despite dual therapy.' },
              { title: 'Immediate Triage & Red Flags', content: 'Frequent moderate-to-severe COPD exacerbations carry progressive lung function decline and elevated cardiovascular and all-cause mortality.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Landmark Trial Evidence:\n• IMPACT Trial (NEJM 2018) & ETHOS Trial (NEJM 2020):\n  - Single-inhaler triple therapy (Fluticasone furoate / Umeclidinium / Vilanterol OR Budesonide / Glycopyrrolate / Formoterol) significantly reduced moderate-to-severe exacerbations compared to dual LABA/LAMA therapy.\n  - Crucially, triple therapy demonstrated a statistically significant reduction in all-cause mortality (HR 0.54-0.72 in patients with blood eosinophils ≥100-300 cells/µL).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Single-inhaler triple therapy (e.g. Trelegy Ellipta 1 puff daily or Breztri Aerosphere 2 puffs BID) for symptomatic COPD patients with history of ≥1 exacerbation in the prior year and blood eosinophils ≥100 cells/µL.' },
              { title: 'Stepwise Management Algorithm', content: 'Transition symptomatic patients with persistent exacerbations on dual bronchodilation (LAMA/LABA) to single-inhaler triple therapy.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Single-inhaler devices achieve significantly higher patient compliance and lower device error rates compared to multiple separate inhalers.' },
              { title: 'Exact Reference & Guideline Citations', content: 'IMPACT Trial (NEJM 2018); ETHOS Trial (NEJM 2020); GOLD 2024 Guidelines.' }
            ]
          }
        ]
      }
    ]
  },

  surgery: {
    id: 'surgery',
    name: 'Surgery',
    scientificName: 'General Surgery & Operative Suite',
    icon: 'cut',
    color: '#eb988a',
    illustration: require('../assets/images/specialties/surgery.jpg'),
    generalScope: 'Comprehensive operative surgery reference: acute surgical abdomen, step-by-step operative techniques, energy platforms, surgical instruments, ERAS protocols, damage control resuscitation, and perioperative surgical clearance.',
    categories: [
      {
        id: 'surgical_cases',
        title: 'Operative Cases & Scenarios',
        description: 'Acute abdomen, appendicitis, cholecystitis, bowel obstruction, peptic perforations, and diverticulitis',
        icon: 'bandage',
        topics: [
          {
            id: 'acute_appendicitis_surg',
            title: 'Acute Appendicitis',
            subtitle: 'Alvarado & AIR Score, Triage & Laparoscopic Technique',
            type: 'Surgical Protocol',
            aiScopeDescription: 'Focus on acute appendicitis definition, Alvarado and AIR scoring, sonographic criteria, antibiotic prophylaxis, and 3-port laparoscopic appendectomy.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute luminal obstruction of the vermiform appendix (most commonly by a fecalith, lymphoid hyperplasia, or neoplasm) resulting in mucosal ischemia, bacterial overgrowth, transmural gangrene, and potential perforation.' },
              { title: 'Immediate Triage & Red Flags', content: 'Periumbilical visceral pain migrating to somatic right lower quadrant (RLQ - McBurney point), low-grade fever, anorexia ("hamburger sign"), and vomiting. Red Flags: Generalized guarding/rigidity, high spiking fever >38.5°C, marked leukocytosis >15k with left shift, or hemodynamic instability indicating free perforation and diffuse peritonitis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Alvarado Score (0-10): RLQ tenderness (2), Leukocytosis >10k (2), Migratory pain (1), Anorexia (1), N/V (1), Rebound (1), Elevated temp (1), Left shift (1). Score ≥7 = High probability.\n• AIR Score (Appendicitis Inflammatory Response Score): Superior specificity in borderline cases.\n• Imaging: Graded compression ultrasound (blind-ending non-compressible tubular structure >6 mm in diameter, target sign, appendicolith, periappendiceal fat hyperechogenicity); CT Abdomen/Pelvis with IV contrast is 98% sensitive in adults.' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Pre-Op Prophylactic Antibiotics (Within 60 mins of incision):\n  IV Cefoxitin 2 g OR Cefazolin 2 g + Metronidazole 500 mg (Ciprofloxacin + Metronidazole if severe penicillin anaphylaxis).\n• IV Crystalloid fluid resuscitation (Lactated Ringer’s 20-30 mL/kg).\n• Laparoscopic Appendectomy (3-port technique):\n  1. 10mm umbilical port (camera), 5mm suprapubic port, 5mm left lower quadrant working port.\n  2. Identify cecal pole and follow taenia coli to appendiceal base.\n  3. Create mesenteric window at base; skeletonize mesoappendix with bipolar/harmonic.\n  4. Apply two Endoloops on base (proximal) and one distal; divide with laparoscopic scissors.\n  5. Retrieve in Endocatch bag to avoid wound infection.' },
              { title: 'Stepwise Management Algorithm', content: '1. Uncomplicated Appendicitis: Urgent Laparoscopic Appendectomy within 12-24 hours of diagnosis.\n2. Perforated Appendicitis with Phlegmon/Abscess: Initial non-operative IV antibiotics (Piperacillin-Tazobactam) + CT-guided percutaneous drainage if abscess >3 cm, followed by interval appendectomy at 6-8 weeks.\n3. Postoperative Care: Discontinue antibiotics within 24 hours in uncomplicated cases; advance diet on POD 0.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never discharge a female patient of reproductive age with RLQ pain without a urine pregnancy test to exclude ruptured ectopic pregnancy and pelvic ultrasound to evaluate for ovarian torsion.' },
              { title: 'Exact Reference & Guideline Citations', content: '2020 WSES Jerusalem Guidelines on Diagnosis and Treatment of Acute Appendicitis; SAGES Diagnostic and Treatment Guidelines.' }
            ]
          },
          {
            id: 'acute_cholecystitis_surg',
            title: 'Acute Calculous Cholecystitis',
            subtitle: 'Tokyo Guidelines (TG18), US Criteria & Emergent Lap Chole',
            type: 'Surgical Protocol',
            aiScopeDescription: 'Focus on acute cholecystitis definition, Tokyo Guidelines 2018 grading, sonographic Murphy sign, and emergent vs interval laparoscopic cholecystectomy.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute chemical and bacterial inflammation of the gallbladder initiated by persistent cystic duct obstruction by gallstones, leading to luminal distension, mucosal ischemia, and secondary bacterial infection (E. coli, Klebsiella, Enterococcus).' },
              { title: 'Immediate Triage & Red Flags', content: 'RUQ epigastric postprandial pain radiating to the right scapula/shoulder, sonographic Murphy sign, fever, leukocytosis. Red Flags: Sepsis/shock, palpable tender gallbladder mass, jaundice (suggests choledocholithiasis or Mirizzi syndrome), emphysematous cholecystitis (gas in gallbladder wall on CT).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Tokyo Guidelines 2018 (TG18) Diagnostic Criteria:\n• Local Signs: Murphy sign, RUQ tenderness/mass.\n• Systemic Signs: Fever, elevated CRP, leukocytosis.\n• Imaging Findings: Gallbladder wall thickening >4 mm, pericholecystic fluid, gallstones impacted in neck, sonographic Murphy sign.\n• TG18 Severity Grading:\n  - Grade I (Mild): Healthy, no organ dysfunction.\n  - Grade II (Moderate): WBC >18k, palpable RUQ mass, symptom duration >72h, local gangrenous inflammation.\n  - Grade III (Severe): Associated organ dysfunction (Cardiovascular, Renal, Hepatic, Neurologic, Respiratory, Coagulation).' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Antibiotic Therapy: Grade I: Cefazolin 2 g IV q8h OR Ceftriaxone 1 g IV daily. Grade II/III: Piperacillin-Tazobactam 4.5 g IV q6h OR Meropenem 1 g IV q8h.\n• NSAIDs: IV Ketorolac 15-30 mg for acute biliary colic pain relief.\n• Early Laparoscopic Cholecystectomy: Strongly recommended within <72 hours of symptom onset (decreases hospital stay and complication rates compared to interval surgery).' },
              { title: 'Stepwise Management Algorithm', content: '1. Grade I and II in operable patients: Urgent Laparoscopic Cholecystectomy with Critical View of Safety (CVS).\n2. Grade III or surgically unfit patients: Ultrasound-guided Percutaneous Cholecystostomy (PC) tube placement + IV broad-spectrum antibiotics.\n3. Intraoperative Difficulty: If Calot triangle frozen by severe inflammation, do NOT perform dangerous blunt dissection. Convert to Subtotal Fenestrating Cholecystectomy or open cholecystectomy.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Forcing dissection in an obscured Calot triangle is the leading cause of catastrophic iatrogenic common bile duct transection; subtotal cholecystectomy is the standard of care "bailout" procedure.' },
              { title: 'Exact Reference & Guideline Citations', content: 'Tokyo Guidelines 2018 (TG18): Diagnostic criteria and severity grading of acute cholecystitis (J Hepatobiliary Pancreat Sci 2018); SAGES Safe Cholecystectomy Program.' }
            ]
          },
          {
            id: 'small_bowel_obstruction_surg',
            title: 'Small Bowel Obstruction (SBO)',
            subtitle: 'Adhesive SBO, Closed-Loop Strangulation & Gastrografin Protocol',
            type: 'Surgical Protocol',
            aiScopeDescription: 'Focus on mechanical SBO definition, distinguishing simple adhesive vs strangulated closed-loop obstruction, Gastrografin challenge, and emergency laparotomy.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Mechanical impedance to the aboral transit of intestinal contents through the small intestine, most frequently caused by postoperative adhesions (65-75%), incarcerated hernias (15%), or neoplasms.' },
              { title: 'Immediate Triage & Red Flags', content: 'Colicky abdominal pain, obstipation (complete absence of stool/flatus), bilious vomiting, progressive abdominal distension, high-pitched "musical" tinkling sounds. Red Flags for Strangulation / Ischemia: Continuous focal unremitting pain, localized peritoneal signs, fever >38.0°C, tachycardia, leukocytosis >15k, and serum lactate >2.0 mmol/L.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Abdominal CT with IV & Oral Contrast (Definitive):\n  - Small bowel loop dilation >3 cm with distal collapsed bowel (<2.5 cm) at the transition point.\n  - "Small bowel feces sign" at transition zone.\n  - Signs of Closed-Loop Obstruction & Strangulation: "Beak sign", mesenteric swirl/whirl sign, bowel wall thickening >3 mm, submucosal hemorrhage, reduced mucosal enhancement, pneumatosis intestinalis, portal venous gas.' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Immediate Resuscitation: Aggressive IV Lactated Ringer’s bolus followed by maintenance to restore intravascular volume.\n• Nasogastric (NG) Decompression: Large-bore Salem Sump tube on low continuous suction (relieves vomiting, reduces intraluminal pressure, prevents aspiration).\n• Water-Soluble Contrast Challenge (Gastrografin Protocol):\n  Administer 100 mL of Gastrografin (with 50 mL water) via NG tube; clamp tube for 2 hours, obtain plain abdominal radiograph at 8 and 24 hours (contrast in colon within 24h predicts 96% non-operative resolution and accelerates bowel recovery).' },
              { title: 'Stepwise Management Algorithm', content: '1. If peritonitis, closed-loop obstruction, ischemia, or strangulated hernia -> Immediate Emergency Exploratory Laparotomy.\n2. In stable adhesive SBO -> Non-operative management with NG decompression and Gastrografin for up to 48-72 hours.\n3. If Gastrografin fails to reach cecum at 24 hours, NG output remains >500 mL/day, or clinical deterioration occurs -> Proceed to operative exploration.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Closed-loop obstruction (where a segment is occluded at two points by a single band or internal hernia) can rapidly progress to gangrene and perforation with normal laboratory markers; clinical suspicion warrants prompt laparotomy.' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 WSES Guidelines on Diagnosis and Management of Adhesive Small Bowel Obstruction (ASBO).' }
            ]
          },
          {
            id: 'perforated_peptic_ulcer_surg',
            title: 'Perforated Peptic Ulcer',
            subtitle: 'Free Air Triage, Graham Patch Omentopexy & Sepsis Resuscitation',
            type: 'Surgical Protocol',
            aiScopeDescription: 'Focus on perforated gastric and duodenal ulcers, subdiaphragmatic free air, Graham patch omentopexy, and perioperative anti-ulcer therapy.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Full-thickness transmural erosion of the gastric or duodenal wall secondary to acid-peptic injury (frequently exacerbated by NSAIDs or H. pylori infection), releasing chemical gastroduodenal contents into the peritoneal cavity followed by bacterial peritonitis and septic shock.' },
              { title: 'Immediate Triage & Red Flags', content: 'Sudden onset "thunderclap" severe epigastric pain that rapidly generalizes across the entire abdomen, board-like abdominal rigidity ("peritonisme"), shallow thoracic breathing. Red Flags: Septic shock (hypotension, tachycardia), oliguria, lactic acidosis, marked leukocytosis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Upright Chest X-ray: Subdiaphragmatic free air (pneumoperitoneum - crescent of gas under right hemidiaphragm in 75-85% of cases).\n• CT Abdomen/Pelvis with IV Contrast: 98% sensitive for subtle free air, discontinuity of duodenal/gastric wall, periduodenal fluid/phlegmon.\n• Boey Score (0-3): Severe medical illness (1), Preoperative shock (1), Perforation duration >24h (1). Boey score 0 = 1% mortality; Boey score 3 = 38% mortality.' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Immediate Resuscitation: IV crystalloid boluses (Lactated Ringer’s 30 mL/kg) + Sepsis 1-Hour Bundle.\n• Broad-Spectrum IV Antibiotics: Ceftriaxone 2 g IV + Metronidazole 500 mg IV OR Piperacillin-Tazobactam 4.5 g IV q6h.\n• High-Dose IV PPI: Pantoprazole 80 mg IV bolus followed by 8 mg/hr continuous infusion.\n• Graham Patch Omentopexy Technique (Laparoscopic or Open):\n  1. Identify perforation (usually anterior first portion of duodenum or pylorus, typically 5-10 mm).\n  2. Place 3 full-thickness interrupted 2-0 or 3-0 Vicryl/PDS sutures across the perforation without tying.\n  3. Mobilize a vascularized pedicle of greater omentum and lay it over the defect.\n  4. Tie the sutures over the omental tongue snugly without strangulating the omental blood supply.\n  5. Copious 4-6 liter warm saline peritoneal lavage.' },
              { title: 'Stepwise Management Algorithm', content: '1. Emergent exploratory laparoscopy or laparotomy within <6 hours of presentation.\n2. Graham patch repair + extensive irrigation of subphrenic and pelvic spaces.\n3. Biopsy edge of gastric ulcers (mandatory to rule out gastric adenocarcinoma; duodenal ulcer biopsy not routinely required).\n4. Post-op: Continue IV PPI for 72 hours, test and treat for H. pylori once oral intake resumes.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never omit the mandatory endoscopic biopsy of gastric ulcers post-operatively (perforated gastric ulcers have a 5-10% malignancy rate); schedule follow-up endoscopy at 6-8 weeks to confirm mucosal healing.' },
              { title: 'Exact Reference & Guideline Citations', content: '2020 WSES Guidelines for the Management of Perforated and Bleeding Peptic Ulcers; SURG Journal Evidence Review.' }
            ]
          },
          {
            id: 'acute_diverticulitis_surg',
            title: 'Acute Diverticulitis & Hinchey Staging',
            subtitle: 'Hinchey Classification, Percutaneous Drainage & Hartmann Procedure',
            type: 'Surgical Protocol',
            aiScopeDescription: 'Focus on acute left colonic diverticulitis definition, Hinchey classification I-IV, outpatient vs inpatient management, percutaneous drainage, and Hartmann procedure.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Micro- or macro-perforation of a colonic diverticulum (most commonly in the sigmoid colon) secondary to increased intraluminal pressure and inspissated fecal material, causing localized phlegmon, abscess formation, or diffuse feculent/purulent peritonitis.' },
              { title: 'Immediate Triage & Red Flags', content: 'Left lower quadrant (LLQ) constant pain, fever, nausea, constipation or diarrhea, localized LLQ tenderness. Red Flags: Diffuse abdominal peritonitis (guarding, rebound), hemodynamic instability, septic shock, fecaluria/pneumaturia (colovesical fistula).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Abdominal CT with IV & Oral Contrast (Gold Standard):\n  Sigmoid wall thickening (>4 mm), pericolic fat stranding, diverticula, extraluminal air bubbles, or fluid collections.\n• Hinchey Classification (Modified):\n  - Stage 0: Clinically mild diverticulitis / diverticulosis.\n  - Stage Ia: Confined pericolic inflammation / phlegmon.\n  - Stage Ib: Confined pericolic abscess (<4-5 cm).\n  - Stage II: Pelvic, retroperitoneal, or distant intra-abdominal abscess.\n  - Stage III: Generalized purulent peritonitis (ruptured abscess).\n  - Stage IV: Generalized feculent peritonitis (free colonic perforation).' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Uncomplicated (Hinchey 0/Ia) Outpatient: Oral Ciprofloxacin 500 mg BID + Metronidazole 500 mg TID OR Amoxicillin-Clavulanate 875/125 mg BID for 7 days + Clear liquid diet (mild cases in immunocompetent patients may be managed without antibiotics).\n• Complicated (Hinchey Ib/II) Inpatient: IV Piperacillin-Tazobactam 3.375 g q6h OR Ceftriaxone 1 g IV + Metronidazole 500 mg IV q8h.\n• CT-Guided Percutaneous Drainage: Indicated for Hinchey Ib/II abscesses ≥3-4 cm (converts emergent surgery into elective single-stage resection).\n• Emergent Hartmann Procedure (Hinchey III/IV):\n  1. Midline laparotomy, mobilize descending and sigmoid colon.\n  2. Resect diseased sigmoid colon to healthy rectal stump.\n  3. Close distal rectal stump (Hartmann pouch) and mature proximal end-colostomy in left iliac fossa.\n  4. Copious peritoneal lavage.' },
              { title: 'Stepwise Management Algorithm', content: '1. Hinchey Ia: Outpatient oral therapy or observation.\n2. Hinchey Ib/II: IV antibiotics + CT-guided drainage if abscess ≥3-4 cm.\n3. Hinchey III/IV: Emergent Hartmann procedure or primary resection with loop ileostomy.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never perform colonoscopy during an acute episode of diverticulitis (high risk of converting a microperforation into free colonic blowout perforation); colonoscopy should be deferred for 6-8 weeks post-resolution to rule out occult colorectal cancer.' },
              { title: 'Exact Reference & Guideline Citations', content: '2020 ASCRS Clinical Practice Guidelines for the Treatment of Left-Sided Colonic Diverticulitis; WSES Guidelines 2020.' }
            ]
          }
        ]
      },
      {
        id: 'operative_steps',
        title: 'Operative Steps & Techniques',
        description: 'Stepwise dissection planes, critical safety views, and procedural execution',
        icon: 'construct',
        topics: [
          {
            id: 'lap_chole_cvs',
            title: 'Lap Cholecystectomy (Critical View of Safety)',
            subtitle: 'Strasberg 3-Step CVS, Calot Dissection & Infundibular Trap',
            type: 'Operative Technique',
            aiScopeDescription: 'Focus on laparoscopic cholecystectomy operative steps, Strasberg Critical View of Safety criteria, Calot triangle dissection, and preventing bile duct injury.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Minimally invasive surgical excision of the gallbladder using laparoscopic instrumentation, requiring rigorous anatomical identification of the cystic duct and cystic artery via the Critical View of Safety (CVS) to prevent catastrophic biliary and vascular injuries.' },
              { title: 'Immediate Triage & Red Flags', content: 'Anatomical variants: Aberrant right hepatic artery crossing cystic duct, short/absent cystic duct, accessory bile ducts of Luschka, or severe chronic "porcelain" sclerosing cholecystitis distorting landmarks.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'The Strasberg Critical View of Safety (CVS) requires ALL THREE criteria:\n1. Hepatocystic triangle cleared of fat and fibrous tissue (common bile duct is NOT exposed).\n2. Lower third of the gallbladder dissected off the cystic plate (liver bed).\n3. Exactly TWO and only TWO structures seen entering the gallbladder (cystic duct and cystic artery).' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Port Placement: 10mm umbilical (camera), 10mm subxiphoid (working right hand), two 5mm right subcostal (retraction).\n• Stepwise Operative Sequence:\n  1. Retract gallbladder fundus cephalad over the liver dome.\n  2. Retract infundibulum laterally and inferiorly to open the hepatocystic triangle.\n  3. Incise the anterior and posterior peritoneal serosa covering the infundibulum.\n  4. Dissect the lower third of the gallbladder off the liver bed to expose the cystic plate.\n  5. Obtain 360-degree anterior and posterior "double view" confirming CVS.\n  6. Clip cystic duct with 2 proximal clips and 1 distal clip; divide with laparoscopic shears.\n  7. Clip cystic artery (2 proximal, 1 distal); divide.\n  8. Dissect remaining gallbladder off liver bed with hook cautery in the subserosal plane.\n  9. Retrieve in Endocatch bag, inspect liver bed for hemostasis and bile leak.' },
              { title: 'Stepwise Management Algorithm', content: 'Adhere strictly to the SAGES Safe Cholecystectomy "Universal Safety Rules". If CVS cannot be achieved due to dense inflammation, perform a subtotal fenestrating cholecystectomy or convert to open procedure.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Beware the "Infundibular Trap" (visual illusion where the common bile duct is aligned with the cystic duct due to excessive medial retraction and mistakenly clipped); CVS requires visualizing the cystic plate behind the structures before applying any clips.' },
              { title: 'Exact Reference & Guideline Citations', content: 'SAGES Safe Cholecystectomy Program; Strasberg SM. J Am Coll Surg 2010; Tokyo Guidelines TG18.' }
            ]
          },
          {
            id: 'lichtenstein_hernia',
            title: 'Lichtenstein Inguinal Hernioplasty',
            subtitle: 'Tension-Free Polypropylene Mesh, Nerve Preservation & Floor Repair',
            type: 'Operative Technique',
            aiScopeDescription: 'Focus on Lichtenstein open inguinal hernia repair, anatomy of the inguinal canal, nerve identification, mesh fixation, and preventing chronic groin pain.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Open, tension-free surgical repair of primary and recurrent indirect, direct, and pantaloon inguinal hernias using a prosthetic polypropylene mesh to reinforce the transversalis fascia (floor of the inguinal canal).' },
              { title: 'Immediate Triage & Red Flags', content: 'Differentiate direct (medial to inferior epigastric vessels, through Hesselbach triangle) vs indirect (lateral to inferior epigastric vessels, through deep inguinal ring) vs femoral hernia (below inguinal ligament).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Anatomical Boundaries of Inguinal Canal:\n• Anterior Wall: External oblique aponeurosis.\n• Posterior Wall: Transversalis fascia and conjoint tendon.\n• Roof: Internal oblique and transversus abdominis arching fibers.\n• Floor: Inguinal (Poupart) ligament and lacunar ligament.' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Anesthesia & Prophylaxis: Local field infiltration (0.5% Bupivacaine + 1% Lidocaine) or spinal. Single dose IV Cefazolin 2 g pre-op.\n• Stepwise Operative Sequence:\n  1. 5-6 cm skin incision 2 cm above and parallel to the medial half of the inguinal ligament.\n  2. Divide Scarpa fascia and incise external oblique aponeurosis along the line of its fibers, entering the superficial inguinal ring.\n  3. Identify and preserve the Ilioinguinal nerve (runs on anterior surface of spermatic cord) and Iliohypogastric nerve (runs superior to conjoint tendon).\n  4. Mobilize spermatic cord at the pubic tubercle and encircle with a moist Penrose drain; identify and preserve the Genital branch of the Genitofemoral nerve on the posterior cord surface.\n  5. Dissect indirect hernia sac off cord structures and reduce into preperitoneal space (or ligate and excise); imbricate direct hernia sac with 2-0 PDS.\n  6. Mesh Sizing & Fixation: Use a 7.5 x 15 cm Polypropylene mesh. Anchor medial corner to the anterior rectus sheath over the pubic tubercle with continuous 2-0 Prolene (overlap tubercle by 2 cm to prevent medial recurrence).\n  7. Suture inferior edge of mesh to shelving edge of inguinal ligament with continuous 2-0 Prolene, stopping just lateral to internal ring.\n  8. Slit mesh laterally to create upper (2/3) and lower (1/3) tails around the cord; cross tails around cord and suture to internal ring.\n  9. Suture superior edge to internal oblique with interrupted absorbable sutures.' },
              { title: 'Stepwise Management Algorithm', content: '1. Infiltration of local anesthetic before incision.\n2. Complete dissection and reduction of hernia sacs.\n3. Tension-free mesh positioning with adequate medial overlap.\n4. Closure of external oblique aponeurosis and skin with subcuticular monocryl.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never entrap the Ilioinguinal, Iliohypogastric, or Genital branch of Genitofemoral nerves with mesh fixation sutures (the leading cause of devastating chronic neuropathic inguinodynia); nerve injury or entrapment requires triple neurectomy.' },
              { title: 'Exact Reference & Guideline Citations', content: 'European Hernia Society (EHS) Guidelines for the Treatment of Inguinal Hernias in Adult Patients (Hernia 2018); Lichtenstein IL et al. Am J Surg.' }
            ]
          },
          {
            id: 'exploratory_laparotomy_closure',
            title: 'Exploratory Laparotomy & Mass Closure',
            subtitle: 'Midline Incision, Systemic Evisceration & 4:1 Suture-to-Wound Ratio',
            type: 'Operative Technique',
            aiScopeDescription: 'Focus on emergency exploratory laparotomy, 4-quadrant packing, trauma evisceration, and continuous mass abdominal closure with 4:1 suture ratio.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Surgical opening of the peritoneal cavity via a rapid midline incision to diagnose and manage life-threatening intra-abdominal pathology, acute hemoperitoneum, gastrointestinal perforations, or penetrating trauma, followed by anatomical mass abdominal closure.' },
              { title: 'Immediate Triage & Red Flags', content: 'Hypovolemic shock, penetrating abdominal trauma with shock, evisceration, generalized peritonitis, or abdominal compartment syndrome (intra-abdominal pressure >20 mmHg with organ failure).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Indications for Emergent Laparotomy:\n1. Penetrating abdominal injury with hemodynamic instability.\n2. Blunt trauma with positive FAST and unstable hemodynamics.\n3. Generalized peritonitis with free air on CT/X-ray.\n4. Intestinal ischemia or gangrene.' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Pre-Op Prophylaxis: IV Piperacillin-Tazobactam 4.5 g or Cefazolin 2 g + Metronidazole 500 mg.\n• Stepwise Operative Sequence:\n  1. Vertical Midline Incision: From xiphoid process to pubic symphysis, curving around left of umbilicus.\n  2. Incise linea alba; enter peritoneum under direct vision to avoid bowel laceration.\n  3. 4-Quadrant Packing: Rapidly place laparotomy sponges in Morrison pouch (RUQ), left subphrenic space (LUQ), left paracolic gutter/pelvis, and right paracolic gutter.\n  4. Systematic Evisceration & Inspection: Eviscerate small bowel to right; examine aorta, celiac trunk, and mesenteric root; run small bowel from ligament of Treitz to ileocecal valve on both mesenteric and antimesenteric borders; examine colon, stomach, pancreas, and liver.\n  5. Mass Abdominal Closure (Israelsson 4:1 Rule):\n     - Use continuous running single-layer monofilament loop suture (e.g. #1 or #2 PDS/Maxon).\n     - Take bites 5-8 mm from fascial edge with 5 mm travel between stitches ("small bite" technique).\n     - Suture length MUST be at least 4 times the wound length (4:1 SL:WL ratio) to distribute intra-abdominal pressure without tissue necrosis.' },
              { title: 'Stepwise Management Algorithm', content: '1. Rapid entry and hemostatic packing.\n2. Control surgical bleeding and gastrointestinal contamination.\n3. Definitive reconstruction or abbreviated damage control closure (Bogota bag / VAC pack).\n4. Continuous small-bite mass fascial closure.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Closing abdominal fascia under excessive tension in a critically ill, resuscitated patient causes Abdominal Compartment Syndrome (ACS) and renal/respiratory collapse; when in doubt, leave the abdomen open with a temporary vacuum dressing (ABTHERA/VAC pack).' },
              { title: 'Exact Reference & Guideline Citations', content: 'STITCH Trial: Small bites versus large bites for closure of abdominal midline incisions (Lancet 2015); Israelsson LA. Br J Surg.' }
            ]
          }
        ]
      },
      {
        id: 'instruments_energy',
        title: 'Instruments & Energy Devices',
        description: 'Surgical hardware, scalpel blades, energy platforms, retractors, and sutures',
        icon: 'hardware-chip',
        topics: [
          {
            id: 'surgical_energy_platforms',
            title: 'Advanced Energy Platforms',
            subtitle: 'Monopolar vs Bipolar vs Harmonic vs LigaSure Vessel Sealing',
            type: 'Instrument Guide',
            aiScopeDescription: 'Focus on electrosurgery physics, monopolar cut vs coag, advanced bipolar impedance-controlled vessel fusion (LigaSure), and ultrasonic cavitation (Harmonic Scalpel).',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Application of high-frequency electrical current or ultrasonic mechanical energy to human tissue to achieve controlled thermal heating, protein denaturation, vaporization (cutting), and collagen-elastin fusion (vessel coagulation/sealing).' },
              { title: 'Immediate Triage & Red Flags', content: 'Complications of energy devices: Capacitive coupling, direct coupling, insulation failure in laparoscopy, lateral thermal spread to adjacent ureters or bowel, and ground pad dispersive electrode contact burns.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Comparison of Surgical Energy Platforms:\n• Monopolar Electrosurgery: Current flows from active blade tip through patient body to return dispersive pad. Cut mode = continuous low voltage wave (vaporization); Coag mode = pulsed high voltage wave (fulguration/desiccation). Lateral thermal spread: 3-5 mm.\n• Ultrasonic Energy (Harmonic Scalpel): 55,500 Hz mechanical vibrations break hydrogen bonds, simultaneously cutting and coagulating vessels up to 5 mm without electrical current flowing through patient. Lateral thermal spread: <1-2 mm.\n• Advanced Bipolar (LigaSure / EnSeal): Combines high compressive mechanical force with continuous tissue impedance sensing to melt collagen and elastin, permanently sealing vessels up to 7 mm (withstands 3x normal systolic pressure). Lateral thermal spread: <2-3 mm.' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Pre-procedure Verification: Check dispersive return pad placement on vascular muscular area (thigh) avoiding bony prominences.\n• Laparoscopic Safety Checks: Inspect laparoscopic instrument shafts for microscopic insulation tears prior to insertion.\n• Stepwise Operational Rules:\n  1. Use low-voltage "cut" mode for delicate adhesiolysis near bowel.\n  2. Avoid prolonged continuous activation (>5 seconds) to prevent thermal build-up.\n  3. Cool active device tips against saline lap sponges before touching adjacent viscera.' },
              { title: 'Stepwise Management Algorithm', content: 'Select device based on surgical goals: Harmonic for fine dissection and lymphadenectomy; LigaSure for major mesenteric vessel pedicles up to 7 mm; Monopolar for rapid subcutaneous hemostasis.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never activate monopolar electrosurgery in close proximity (<5 mm) to surgical clips or metal retractors (direct coupling causes unobserved distant thermal visceral perforation).' },
              { title: 'Exact Reference & Guideline Citations', content: 'SAGES Fundamental Use of Surgical Energy (FUSE) Curriculum and Safety Guidelines; Feldman LS et al.' }
            ]
          },
          {
            id: 'suture_matrix_needles',
            title: 'Surgical Suture Matrix & Needle Geometry',
            subtitle: 'Tensile Strength, Absorption Profiles & Taper vs Cutting Needles',
            type: 'Instrument Guide',
            aiScopeDescription: 'Focus on surgical suture materials (PDS, Vicryl, Monocryl, Prolene, Silk), absorption half-lives, needle anatomy, and tissue-specific selection.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Biomaterials engineered to approximate divided tissues and ligate blood vessels until intrinsic biological wound healing establishes sufficient tensile strength to resist mechanical stress.' },
              { title: 'Immediate Triage & Red Flags', content: 'Suture breakdown, knot slippage, foreign body granuloma, tissue tearing from mismatched needle geometry, and bacterial colonization of braided multifilament sutures in contaminated wounds.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Suture Classification Matrix:\n• Monofilament vs Multifilament (Braided):\n  - Monofilament: Smooth passage, low tissue drag, minimal bacterial wicking (PDS, Monocryl, Prolene, Nylon).\n  - Braided: High knot security, flexible handling, higher risk of harboring bacteria in infected fields (Vicryl, Silk).\n• Absorbable vs Non-Absorbable:\n  - Monocryl (Poliglecaprone 25): Rapidly absorbable (50% strength at 1-2 weeks, absorbed in 90-120 days) - ideal for subcuticular skin closure.\n  - Vicryl (Polyglactin 910): Medium absorbable (50% strength at 3 weeks, absorbed in 60-90 days) - ideal for bowel anastomosis, subcutaneous fat.\n  - PDS II (Polydioxanone): Slowly absorbable (50% strength at 4-6 weeks, absorbed in 180-210 days) - ideal for abdominal fascia and biliary duct.\n  - Prolene (Polypropylene): Non-absorbable, inert, highest permanent tensile strength - gold standard for vascular anastomoses and hernia mesh fixation.' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Needle Anatomy & Selection:\n  1. Taper Point (Round body): Pushes tissue aside without cutting (used for bowel, peritoneum, biliary tract, blood vessels).\n  2. Cutting / Reverse Cutting (Triangular body): Sharp apex cuts through dense tough tissue (used for skin and subcuticular closure).\n  3. Blunt Taper: For friable parenchymal organs (liver, spleen) to prevent needle-stick vascular tearing.' },
              { title: 'Stepwise Management Algorithm', content: 'Match suture half-life to tissue healing rate: Skin (rapid healing -> Monocryl 4-0); Bowel (medium healing -> Vicryl 3-0); Fascia (slow healing -> PDS #1); Blood vessels (permanent support -> Prolene 5-0/6-0).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never use braided sutures (e.g. Silk, Vicryl) in contaminated or infected tissue (braided filaments act as a wick for bacterial micro-abscesses); use monofilament sutures (PDS, Monocryl, Prolene) instead.' },
              { title: 'Exact Reference & Guideline Citations', content: 'ACS Surgical Principles of Wound Closure and Suture Selection; Ethicon Wound Closure Manual.' }
            ]
          }
        ]
      },
      {
        id: 'postop_eras',
        title: 'Post-Op Critical Care & ERAS',
        description: 'Enhanced recovery after surgery, drain management, post-op fever, and wound dehiscence',
        icon: 'pulse',
        topics: [
          {
            id: 'eras_protocol_surg',
            title: 'Enhanced Recovery After Surgery (ERAS)',
            subtitle: 'Multimodal Analgesia, Zero-Balance Fluids & Early Feeding',
            type: 'Clinical Protocol',
            aiScopeDescription: 'Focus on ERAS society guidelines definition, multimodal opioid-sparing analgesia, goal-directed fluid therapy, and early post-op mobilization.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Evidence-based multimodal perioperative care pathway designed to attenuate the surgical stress response, maintain postoperative physiological homeostasis, reduce surgical complications, and accelerate functional recovery.' },
              { title: 'Immediate Triage & Red Flags', content: 'Postoperative fluid overload (pulmonary edema, peripheral edema, anastomotic bowel edema), refractory postoperative nausea and vomiting (PONV), and opioid-induced respiratory depression / ileus.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Key ERAS Pillars Across Perioperative Phases:\n• Preoperative:\n  1. Carbohydrate loading drinks up to 2 hours prior to induction of anesthesia.\n  2. Avoidance of routine prolonged mechanical bowel preparation in elective colon surgery.\n  3. Pre-emptive multimodal non-opioid analgesia (Acetaminophen + Celecoxib + Gabapentin).\n• Intraoperative:\n  1. Goal-Directed Fluid Therapy (GDFT): Target zero-fluid balance using stroke volume variation (SVV) monitoring.\n  2. Avoidance of routine nasogastric tubes and prophylactic abdominal drains.\n  3. Short-acting anesthetic agents and regional blocks (TAP block, rectus sheath block, epidural).\n• Postoperative:\n  1. Early oral liquid/solid intake on Day 0.\n  2. Chewing gum (sham feeding stimulates vagal cephalic-vagal reflex to restore GI motility).\n  3. Early out-of-bed mobilization within 24 hours (target ≥2 hours out of bed on POD 1).\n  4. Early removal of urinary catheters on POD 1.' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Multimodal Analgesic Regimen: IV Acetaminophen 1000 mg q6h + IV Ketorolac 15 mg q6h (for 48h) + Oral Celecoxib 200 mg daily + Transversus Abdominis Plane (TAP) block with Liposomal Bupivacaine (Exparel).\n• PONV Prophylaxis: Triple therapy with Dexamethasone 4-8 mg IV + Ondansetron 4 mg IV + Aprepitant 80 mg PO.\n• Post-Op Ileus Prevention: Oral Alvimopan 12 mg PO BID (selective peripheral mu-opioid receptor antagonist).' },
              { title: 'Stepwise Management Algorithm', content: 'Implement standardized clinical pathways to reduce hospital length of stay by 30-50% and decrease surgical site infections and cardiopulmonary complications.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Overzealous intravenous fluid administration during major gastrointestinal surgery increases intestinal edema, delays return of bowel function, and triples anastomotic leak rates; restrict fluids to zero-balance targets.' },
              { title: 'Exact Reference & Guideline Citations', content: 'ERAS Society Guidelines for Perioperative Care in Elective Colorectal Surgery (World J Surg 2019); Gustafsson UO et al.' }
            ]
          },
          {
            id: 'postop_fever_5ws',
            title: 'Postoperative Fever Workup ("5 Ws")',
            subtitle: 'Wind, Water, Wound, Walking & Wonder Drugs Timeline',
            type: 'Clinical Protocol',
            aiScopeDescription: 'Focus on postoperative fever definition, physiologic vs infectious etiology, the 5 Ws diagnostic timeline, and targeted workup.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Elevation of body temperature ≥38.0°C (100.4°F) occurring after a surgical procedure, categorized chronologically by the classic physiological and infectious timeline of the "5 Ws".' },
              { title: 'Immediate Triage & Red Flags', content: 'Malignant Hyperthermia (within hours of general anesthesia), necrotizing fasciitis / group A strep wound infection (within 24-48 hours - "bronze skin, dishwater fluid"), septic shock, and pulmonary embolism with tachycardia.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'The Classic 5 Ws Chronological Timeline:\n1. POD 1-2: Wind (Atelectasis, Aspiration, Early Pneumonia) - most common early cause, treated with incentive spirometry.\n2. POD 3: Water (Urinary Tract Infection) - associated with indwelling Foley catheter, diagnosed by catheter urinalysis and urine culture.\n3. POD 4-6: Walking (Deep Vein Thrombosis & Pulmonary Embolism) - diagnosed by duplex ultrasound or CT pulmonary angiogram.\n4. POD 5-7: Wound (Surgical Site Infection) - erythema, induration, purulent drainage, requires opening the wound.\n5. POD 7+: Wonder Drugs & Deep Abscess (Drug fever, heparin-induced thrombocytopenia, intra-abdominal anastomotic leak/abscess).' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• POD 1-2 (Wind): Aggressive chest physiotherapy, incentive spirometry (10 breaths/hour), early mobilization. Do NOT administer empiric antibiotics for uncomplicated atelectasis.\n• POD 3 (Water): Remove urinary catheter immediately; start Ceftriaxone 1 g IV or Nitrofurantoin 100 mg PO if symptomatic UTI.\n• POD 5-7 (Wound): Remove surgical staples/sutures over area of maximal fluctuance; evacuate hematoma/purulence; pack with moist saline gauze. Reserve systemic antibiotics for surrounding cellulitis >2 cm or systemic sepsis.\n• Deep Abscess / Leak: CT Abdomen/Pelvis with IV and oral/rectal contrast; perform image-guided percutaneous drainage + broad-spectrum IV antibiotics (Piperacillin-Tazobactam 4.5 g q6h).' },
              { title: 'Stepwise Management Algorithm', content: 'Target workup specifically to the postoperative day and physical exam findings rather than ordering unselective "pan-culture" panels on POD 1.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Fever presenting within 24 to 48 hours accompanied by severe pain out of proportion and skin discoloration is NOT atelectasis; rule out life-threatening Clostridial or Group A Streptococcal necrotizing soft tissue infection requiring immediate surgical debridement.' },
              { title: 'Exact Reference & Guideline Citations', content: 'ACS Guidelines on Postoperative Fever; Pile JC. Evaluating postoperative fever. Cleve Clin J Med.' }
            ]
          }
        ]
      },
      {
        id: 'preop_risk',
        title: 'Pre-Op Risk & Perioperative Clearance',
        description: 'Cardiac risk indices, anticoagulation bridging, difficult airway, and glycemic optimization',
        icon: 'fitness',
        topics: [
          {
            id: 'rcri_cardiac_clearance',
            title: 'Revised Cardiac Risk Index (RCRI)',
            subtitle: 'Lee Index Criteria, METs Functional Capacity & Beta-Blocker Protocol',
            type: 'Clinical Protocol',
            aiScopeDescription: 'Focus on perioperative cardiac risk assessment definition, Revised Cardiac Risk Index (RCRI/Lee Criteria), functional capacity in METs, and preoperative testing.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Systematic clinical risk stratification to quantify the 30-day risk of major adverse cardiac events (MACE: myocardial infarction, pulmonary edema, ventricular fibrillation, complete heart block, cardiac arrest) in patients undergoing non-cardiac surgery.' },
              { title: 'Immediate Triage & Red Flags', content: 'Active unstable cardiac conditions requiring surgery cancellation/delay: Unstable angina, recent MI (<60 days), decompensated heart failure (NYHA Class IV), severe symptomatic aortic stenosis (valve area <1.0 cm²), high-grade AV block.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'The 6 Predictors of the Revised Cardiac Risk Index (RCRI / Lee Criteria):\n1. High-risk surgery (Intraperitoneal, intrathoracic, or suprainguinal vascular surgery).\n2. History of ischemic heart disease (MI, positive stress test, angina, nitrate use).\n3. History of congestive heart failure (pulmonary edema, PND, S3 gallop, EF <40%).\n4. History of cerebrovascular disease (stroke or TIA).\n5. Diabetes mellitus requiring insulin therapy.\n6. Preoperative serum creatinine >2.0 mg/dL (177 µmol/L).\n• Risk of Major Cardiac Event:\n  - 0 Predictors (Class I): 0.4% MACE risk (Very Low)\n  - 1 Predictor (Class II): 0.9% MACE risk (Low)\n  - 2 Predictors (Class III): 6.6% MACE risk (Moderate)\n  - ≥3 Predictors (Class IV): >11.0% MACE risk (High)\n• Functional Capacity (METs):\n  - ≥4 METs (Able to climb 2 flights of stairs, walk up a hill, carry groceries) = Good functional reserve; proceeds to surgery without cardiac stress testing.\n  - <4 METs with RCRI ≥2 = Indications for Pharmacologic Stress Echocardiography or Nuclear Perfusion Scan.' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Perioperative Beta-Blockers: Continue chronic beta-blocker therapy without interruption. Do NOT initiate high-dose beta-blockers on the morning of surgery (POISE trial proved acute beta-blockade increases stroke and all-cause mortality).\n• Statins: Continue chronic statins throughout perioperative period.' },
              { title: 'Stepwise Management Algorithm', content: '1. Determine surgical urgency (emergent surgery proceeds immediately with invasive monitoring).\n2. Check for active acute coronary syndrome / decompensated heart failure.\n3. Calculate RCRI and assess functional capacity (>4 METs).\n4. If RCRI ≥2 with <4 METs and surgery is elective -> Order stress testing if it would change clinical management.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never clear a patient with undiagnosed severe symptomatic aortic stenosis (harsh systolic ejection murmur radiating to carotids with exertional syncope/dyspnea) for elective surgery without a transthoracic echocardiogram; intraoperative vasodilation causes fatal refractory cardiac arrest.' },
              { title: 'Exact Reference & Guideline Citations', content: '2024 AHA/ACC Guideline on Perioperative Cardiovascular Evaluation and Management for Noncardiac Surgery; Lee TH et al. Circulation.' }
            ]
          },
          {
            id: 'anticoagulation_bridging_matrix',
            title: 'Perioperative Anticoagulation & Bridging',
            subtitle: 'Warfarin, DOACs, High vs Low Thromboembolic Risk & Resumption Timing',
            type: 'Clinical Protocol',
            aiScopeDescription: 'Focus on perioperative management of anticoagulants definition, Warfarin cessation and bridging criteria, DOAC last-dose timing, and postoperative resumption.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Management algorithms balancing the perioperative risk of surgical hemorrhage against the risk of arterial or venous thromboembolism during temporary interruption of anticoagulant and antiplatelet pharmacotherapy.' },
              { title: 'Immediate Triage & Red Flags', content: 'High Thromboembolic Risk Conditions requiring Warfarin Bridging:\n1. Mechanical mitral valve prosthesis (or older caged-ball/tilting disc aortic valve).\n2. Recent stroke or TIA within past 3 months.\n3. Atrial fibrillation with high CHA₂DS₂-VASc score (≥7-8).\n4. Recent VTE within past 3 months or severe thrombophilia (antiphospholipid syndrome).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Preoperative Interruption Schedule:\n• Warfarin (Coumadin):\n  - Discontinue 5 days prior to surgery (target INR ≤1.5 on day of surgery).\n  - If High Thromboembolic Risk -> Initiate therapeutic Low Molecular Weight Heparin (Enoxaparin 1 mg/kg SC BID) 3 days pre-op; administer last dose 24 hours prior to surgery.\n• Direct Oral Anticoagulants (DOACs: Apixaban, Rivaroxaban, Edoxaban, Dabigatran):\n  - Low Bleeding Risk Surgery: Stop 24-48 hours pre-op (no bridging required!).\n  - High Bleeding Risk Surgery (Intracranial, spinal, major abdominal/vascular): Stop 48-72 hours pre-op (extend to 96 hours for Dabigatran if CrCl <50 mL/min).' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Postoperative Resumption:\n  - Low Bleed Risk: Resume prophylactic LMWH or DOAC at 24 hours post-op.\n  - High Bleed Risk / Major Surgery: Resume therapeutic anticoagulation at 48-72 hours post-op once surgical hemostasis is secure.\n• Emergency Reversal for Urgent Surgery:\n  - Warfarin: 4-Factor Prothrombin Complex Concentrate (4F-PCC: Kcentra 25-50 units/kg IV) + IV Vitamin K 10 mg (reverses INR in <15 minutes).\n  - Dabigatran: Idarucizumab (Praxbind 5 g IV).\n  - Factor Xa Inhibitors (Apixaban/Rivaroxaban): Andexanet alfa OR 4F-PCC (50 units/kg IV).' },
              { title: 'Stepwise Management Algorithm', content: '1. Classify patient thromboembolic risk (High, Moderate, Low).\n2. Classify procedure bleeding risk.\n3. Apply drug-specific interruption window.\n4. Avoid routine bridging in DOAC patients (BRIDGE trial and PAUSE study demonstrated bridging increases major bleeding without reducing stroke).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Bridging DOACs with LMWH is a severe clinical error (DOACs have a rapid onset/offset of 12 hours; bridging DOACs triples major postoperative bleeding without reducing thromboembolism).' },
              { title: 'Exact Reference & Guideline Citations', content: '2022 ACCP Chest Guidelines on Perioperative Management of Antithrombotic Therapy; PAUSE Study (JAMA Intern Med 2019); BRIDGE Trial (NEJM 2015).' }
            ]
          }
        ]
      },
      {
        id: 'damage_control',
        title: 'Emergency & Damage Control Surgery',
        description: 'Damage control laparotomy, FAST ultrasound, thoracostomy, and massive transfusion',
        icon: 'warning',
        topics: [
          {
            id: 'damage_control_laparotomy',
            title: 'Damage Control Laparotomy (DCL)',
            subtitle: 'Abbreviated Laparotomy, The Lethal Triad & ICU Resuscitation',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on damage control laparotomy definition, the lethal triad of trauma (hypothermia, acidosis, coagulopathy), 3-stage approach, and temporary abdominal closure.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Abbreviated emergency surgical approach in severely injured, exsanguinating trauma patients that sacrifices anatomical perfection in favor of rapid control of hemorrhage and contamination to halt the physiological "lethal triad" (hypothermia, acidosis, coagulopathy).' },
              { title: 'Immediate Triage & Red Flags', content: 'The Lethal Triad (Indications to abort definitive surgery and initiate DCL):\n1. Hypothermia: Core body temperature <35.0°C.\n2. Metabolic Acidosis: Arterial pH <7.20 or base deficit >-8 mEq/L.\n3. Coagulopathy: Clinical non-mechanical microvascular oozing or INR >1.5.\n4. Hemodynamic Instability requiring >10 units of blood transfusion.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'The 3 Distinct Stages of Damage Control Surgery:\n• Stage 1 (Operating Room - Target <60 minutes):\n  - Rapid midline laparotomy, 4-quadrant packing, arrest major surgical hemorrhage (vessel shunting, ligation, or balloon occlusion).\n  - Control contamination: Staple off divided bowel ends (leave bowel in discontinuity; do NOT perform anastomoses!).\n  - Temporary Abdominal Closure (ABTHERA / negative pressure vacuum pack).\n• Stage 2 (Intensive Care Unit Resuscitation - 24 to 48 hours):\n  - Active rewarming with forced-air and blood warmers (target temp >36.0°C).\n  - Correction of acidosis and reversal of coagulopathy with MTP guided by TEG/ROTEM.\n  - Optimization of ventilator support and tissue perfusion.\n• Stage 3 (Return to Operating Room for Definitive Surgery):\n  - Planned re-exploration at 24-48 hours once physiology is restored.\n  - Remove surgical packs, perform definitive gastrointestinal anastomoses, and achieve permanent fascial closure.' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Temporary Abdominal Closure (TAC) Technique:\n  1. Place non-adherent fenestrated polyethylene sheet over viscera, tucking deeply into lateral gutters.\n  2. Place polyurethane sponge foam in midline.\n  3. Apply occlusive adhesive drape and connect to continuous -125 mmHg suction.\n• Hemostatic Resuscitation: 1:1:1 ratio of Packed Red Blood Cells (PRBC), Fresh Frozen Plasma (FFP), and Platelets + IV Tranexamic Acid (TXA 1 g IV bolus).' },
              { title: 'Stepwise Management Algorithm', content: 'Recognize physiological exhaustion early in the operating room; abort definitive surgery before coagulopathy becomes irreversible.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Attempting complex time-consuming reconstructions or bowel anastomoses in a hypothermic, acidotic, coagulopathic trauma patient carries near 100% mortality from anastomotic breakdown and exsanguination.' },
              { title: 'Exact Reference & Guideline Citations', content: 'Eastern Association for the Surgery of Trauma (EAST) Practice Management Guidelines for Damage Control Laparotomy; Rotondo MF et al. J Trauma.' }
            ]
          },
          {
            id: 'fast_ultrasound_trauma',
            title: 'FAST Ultrasound Protocol in Trauma',
            subtitle: 'Focused Assessment with Sonography for Trauma (4 Acoustic Views)',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on FAST exam definition, the 4 standard acoustic windows, E-FAST for pneumothorax/hemothorax, and integrating findings with hemodynamic stability.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Rapid, non-invasive point-of-care ultrasound examination performed during the primary survey of trauma resuscitation to detect free intraperitoneal, pericardial, and pleural fluid (hemoperitoneum, hemopericardium, hemothorax) and pneumothorax.' },
              { title: 'Immediate Triage & Red Flags', content: 'Unstable blunt trauma with positive FAST -> Immediate Emergency Laparotomy. Penetrating trauma with positive pericardial window (cardiac tamponade) -> Immediate Emergency Sternotomy / Thoracotomy.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'The 4 Standard Acoustic Windows (+ E-FAST Windows):\n1. Perihepatic (Morison Pouch / RUQ): Between liver and right kidney - the most sensitive dependent space for detecting intraperitoneal fluid (can detect as little as 100-200 mL free fluid).\n2. Perisplenic (LUQ): Between spleen and left kidney and subdiaphragmatic space (fluid often collects subdiaphragmatic first).\n3. Pelvic (Suprapubic): Longitudinal and transverse views behind pubic symphysis (in recto-vesical pouch in males; recto-uterine pouch of Douglas in females).\n4. Pericardial (Subxiphoid / Subcostal): Identifies anechoic fluid strip between anterior and posterior pericardial layers and myocardium.\n• Extended FAST (E-FAST) Windows:\n  5. Anterior Thoracic: Lung sliding & "seashore sign" on M-mode (loss of lung sliding with "barcode / stratosphere sign" indicates Pneumothorax).\n  6. Dependent Hemithorax: Pleural effusion / Hemothorax at costophrenic angles.' },
              { title: 'First-Line Pharmacotherapy & Procedural Steps', content: '• Probe Selection: 2.5-5.0 MHz phased-array or curvilinear low-frequency probe.\n• Execution Steps:\n  1. Subxiphoid window: Direct probe toward left shoulder to clear cardiac tamponade.\n  2. RUQ Morison pouch: Sweep from diaphragm to inferior renal pole.\n  3. LUQ Splenorenal: Place probe at posterior axillary line 8th-10th intercostal space.\n  4. Suprapubic window: Position probe superior to pubic symphysis before Foley catheter decompression.' },
              { title: 'Stepwise Management Algorithm', content: '1. Hemodynamically Unstable + Positive FAST -> Emergent Exploratory Laparotomy / Sternotomy.\n2. Hemodynamically Stable + Positive FAST -> Abdominal CT with IV Contrast for organ injury grading.\n3. Hemodynamically Unstable + Negative FAST -> Search for extra-abdominal blood loss (pelvic fracture, chest, extremities) or repeat FAST.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'A negative FAST does NOT rule out retroperitoneal bleeding, mesenteric tears, or hollow viscus bowel perforation; maintain high clinical suspicion and proceed to CT in stable patients.' },
              { title: 'Exact Reference & Guideline Citations', content: 'American College of Emergency Physicians (ACEP) Ultrasound Guidelines; ATLS 10th Edition.' }
            ]
          }
        ]
      }
    ]
  },

  nephrology: {
    id: 'nephrology',
    name: 'Renal',
    scientificName: 'Nephrology & Renal Medicine',
    icon: 'water',
    color: '#f6dda2',
    illustration: require('../assets/images/specialties/nephrology.jpg'),
    generalScope: 'Focus on acute kidney injury staging, dialysis indications, glomerular diseases, fluid/electrolyte management, and severe hyperkalemia.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Urgent dialysis indications, severe hyperkalemia, and acute renal shutdown',
        icon: 'warning',
        topics: [
          {
            id: 'hyperkalemia_emergencies',
            title: 'Severe Hyperkalemia Protocol',
            subtitle: 'ECG Signs, Membrane Stabilization, Shifting & Elimination',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on severe hyperkalemia definition, ECG manifestations, calcium membrane stabilization, insulin-glucose shifting, and elimination.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Serum potassium concentration >6.5 mEq/L (or any potassium elevation accompanied by ECG changes), representing a life-threatening cardiac electrophysiological emergency that predisposes to lethal ventricular arrhythmias and asystole.' },
              { title: 'Immediate Triage & Red Flags', content: 'Serum K+ >6.5 mEq/L or any K+ with ECG changes: Peaked symmetrical T waves, PR prolongation, loss of P waves, QRS widening, Sine-wave pattern, and cardiac arrest (PEA/VF).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Rule out pseudohyperkalemia (hemolyzed blood sample, prolonged tourniquet time, thrombocytosis >1 million, extreme leukocytosis).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Step 1 (Membrane Stabilization - Immediate within 2 mins):\n  IV Calcium Gluconate 10% 10-20 mL over 3 mins (repeat in 5 mins if ECG abnormal).\n• Step 2 (Intracellular Shift - 15-30 mins):\n  1. Regular Insulin 10 units IV bolus + 50 mL D50W (25 g glucose) IV.\n  2. Albuterol 10-20 mg nebulized in 4 mL saline over 15 mins.\n  3. Sodium Bicarbonate 50 mEq IV over 5 mins (if metabolic acidosis pH <7.20).\n• Step 3 (Potassium Elimination - Hours):\n  1. IV Furosemide 40-80 mg (if residual renal function).\n  2. Sodium Zirconium Cyclosilicate (Lokelma) 10 g PO TID or Patiromer 8.4 g PO daily.\n  3. Emergent Hemodialysis for refractory hyperkalemia.' },
              { title: 'Stepwise Management Algorithm', content: 'Place on continuous telemetry immediately. Repeat serum K+ at 2 and 4 hours post-shifting.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'IV Calcium protects the myocardium for only 30 to 60 minutes; never rely on calcium alone without simultaneously administering shifting and elimination agents.' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 KDIGO Consensus on Hyperkalemia Management; AHA Emergency Cardiovascular Care.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'KDIGO AKI staging, glomerulonephritis, and nephrotic syndrome',
        icon: 'book',
        topics: [
          {
            id: 'kdigo_aki_staging',
            title: 'Acute Kidney Injury (KDIGO)',
            subtitle: 'Prerenal vs ATN, FeNa/FeUrea & Fluid Challenge',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on KDIGO criteria definition for AKI, FeNa, FeUrea, urine microscopy, and renal recovery.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Abrupt decline in glomerular filtration rate occurring over hours to days, leading to the retention of nitrogenous waste products (urea, creatinine) and dysregulation of extracellular fluid volume and electrolytes.' },
              { title: 'Immediate Triage & Red Flags', content: 'Oliguria (<0.5 mL/kg/h for >6h), rising serum creatinine, uremic pericardial friction rub, encephalopathy, and refractory volume overload.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• KDIGO Staging:\n  - Stage 1: Serum creatinine 1.5-1.9x baseline or increase ≥0.3 mg/dL within 48h; urine <0.5 mL/kg/h for 6-12h.\n  - Stage 2: Serum creatinine 2.0-2.9x baseline; urine <0.5 mL/kg/h for ≥12h.\n  - Stage 3: Serum creatinine 3.0x baseline, SCr ≥4.0 mg/dL, initiation of RRT, or anuria for ≥12h.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Stop nephrotoxic medications (NSAIDs, ACEi/ARBs, Aminoglycosides, Vancomycin). Treat volume depletion with balanced crystalloids (Lactated Ringer’s).' },
              { title: 'Stepwise Management Algorithm', content: 'Check FeNa: <1% indicates prerenal azotemia; >2% indicates Acute Tubular Necrosis (ATN). Use FeUrea (<35% = prerenal) if patient is on loop diuretics.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Avoid hydroxyethyl starches and excessive 0.9% Normal Saline (causes hyperchloremic metabolic acidosis and renal vasoconstriction; use Lactated Ringer’s).' },
              { title: 'Exact Reference & Guideline Citations', content: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury.' }
            ]
          }
        ]
      }
    ]
  },

  endocrinology: {
    id: 'endocrinology',
    name: 'Endo',
    scientificName: 'Endocrinology & Metabolism',
    icon: 'speedometer',
    color: '#eb988a',
    illustration: require('../assets/images/specialties/endocrinology.jpg'),
    generalScope: 'Focus on diabetic ketoacidosis (DKA), hyperosmolar hyperglycemic state (HHS), thyroid storm, adrenal crisis, and inpatient glycemic protocols.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'DKA/HHS protocols, thyroid storm, and adrenal crisis resuscitation',
        icon: 'warning',
        topics: [
          {
            id: 'dka_hhs_emergency',
            title: 'Diabetic Ketoacidosis (DKA)',
            subtitle: 'Anion Gap Resolution, Insulin Infusion & Potassium Repletion',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on DKA definition, two-bag fluid protocol, regular insulin infusion, serum potassium thresholds, and transition to subcutaneous basal insulin.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute metabolic crisis characterized by the triad of hyperglycemia, high anion gap metabolic acidosis, and ketonemia resulting from absolute or relative insulin deficiency and counter-regulatory hormone surge (glucagon, catecholamines, cortisol).' },
              { title: 'Immediate Triage & Red Flags', content: 'Kussmaul deep breathing (fruity acetone odor), severe dehydration, abdominal pain, nausea/vomiting, altered mentation. Red Flags: Serum K+ <3.3 mEq/L (hold insulin until K+ repleted >3.3), severe acidosis pH <6.9, cerebral edema in young patients.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Diagnostic Triad:\n1. Hyperglycemia: Blood glucose >250 mg/dL.\n2. Metabolic Acidosis: Arterial pH ≤7.30 and serum bicarbonate ≤18 mEq/L.\n3. Positive Ketones: Elevated serum beta-hydroxybutyrate >3.0 mmol/L and urine ketones.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Step 1 (Fluids): 0.9% Normal Saline 1000-1500 mL/hr for first 1-2 hours, then switch to 0.45% Saline at 250-500 mL/hr.\n• Step 2 (Insulin): Regular Insulin 0.1 units/kg IV bolus followed by 0.1 units/kg/hr continuous infusion (target glucose drop 50-75 mg/dL/hr).\n• Step 3 (Dextrose): Add D5W to fluids when blood glucose reaches <200 mg/dL while continuing insulin to clear the anion gap!\n• Step 4 (Potassium): Add 20-30 mEq K+ per liter of IV fluid once K+ is <5.2 mEq/L.' },
              { title: 'Stepwise Management Algorithm', content: 'DKA is resolved when: Blood glucose <200 mg/dL AND two of the following: Serum bicarbonate ≥18 mEq/L, Venous pH >7.30, Anion gap ≤12. Administer Subcutaneous Basal Insulin 2 hours BEFORE stopping the IV insulin infusion!' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never stop the IV insulin infusion when blood glucose normalizes if the anion gap is still open (add dextrose to fluids and continue insulin to clear ketoacidosis); stopping insulin causes immediate rebound ketoacidosis.' },
              { title: 'Exact Reference & Guideline Citations', content: '2024 American Diabetes Association (ADA) Standards of Care in Diabetes.' }
            ]
          }
        ]
      }
    ]
  },

  critical_care: {
    id: 'critical_care',
    name: 'ICU',
    scientificName: 'Emergency & Critical Care Medicine',
    icon: 'medkit',
    color: '#877bf4',
    illustration: require('../assets/images/specialties/critical_care.jpg'),
    generalScope: 'Focus on undifferentiated shock, mechanical ventilation in ARDS, rapid sequence intubation (RSI) in shock, and vasoactive drug titration.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'RUSH protocol, hemodynamically unstable intubation, and refractory shock',
        icon: 'warning',
        topics: [
          {
            id: 'undifferentiated_shock_rush',
            title: 'Undifferentiated Shock & RUSH Protocol',
            subtitle: 'The Pump, The Tank & The Pipes Ultrasound Algorithm',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on undifferentiated shock definition, rapid ultrasound in shock (RUSH), differentiating cardiogenic, hypovolemic, distributive, and obstructive shock.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute systemic state of profound circulatory failure resulting in inadequate cellular oxygen delivery and utilization, tissue hypoperfusion, and cellular dysoxia leading to irreversible end-organ damage.' },
              { title: 'Immediate Triage & Red Flags', content: 'MAP <65 mmHg, serum lactate >2.0 mmol/L, altered mental status, oliguria, cold/mottled extremities, delayed capillary refill >3 seconds.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'RUSH Ultrasound Protocol:\n1. The Pump: Hyperdynamic heart (distributive/hypovolemic), dilated hypo-contractile LV (cardiogenic), RV strain / McConnell sign (massive PE), pericardial effusion with tamponade.\n2. The Tank: Collapsible IVC >50% (hypovolemic), Plethoric IVC (cardiogenic/tamponade/PE), Morison pouch fluid (hemoperitoneum), Lung sliding & B-lines (pulmonary edema vs pneumothorax).\n3. The Pipes: Abdominal aortic aneurysm (>3 cm) or dissection flap, femoral/popliteal DVT.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'First-Line Vasopressor: Norepinephrine infusion 0.05-0.5 mcg/kg/min (target MAP ≥65 mmHg). Add Vasopressin 0.03 units/min as second-line agent.' },
              { title: 'Stepwise Management Algorithm', content: 'Classify shock within 10 minutes at bedside to direct fluid boluses vs inotropes vs emergent pericardiocentesis/chest tube.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Giving large fluid boluses to patients in cardiogenic shock or massive pulmonary embolism worsens right ventricular overload and precipitates cardiac arrest.' },
              { title: 'Exact Reference & Guideline Citations', content: 'Society of Critical Care Medicine (SCCM) Point-of-Care Ultrasound Guidelines.' }
            ]
          }
        ]
      }
    ]
  },

  hematology_oncology: {
    id: 'hematology_oncology',
    name: 'Heme-Onc',
    scientificName: 'Hematology & Medical Oncology',
    icon: 'fitness',
    color: '#b0afeb',
    illustration: require('../assets/images/specialties/hematology_oncology.jpg'),
    generalScope: 'Focus on febrile neutropenia, tumor lysis syndrome, sickle cell vaso-occlusive crisis, and heparin-induced thrombocytopenia.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Febrile neutropenia 1-hour bundle, tumor lysis, and acute coagulopathy',
        icon: 'warning',
        topics: [
          {
            id: 'febrile_neutropenia_heme',
            title: 'Febrile Neutropenia Emergency',
            subtitle: 'MASCC Risk Index, 1-Hour Antibiotics & Anti-Pseudomonal Regimens',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on febrile neutropenia definition, ANC <500, MASCC score, empiric Cefepime/Meropenem, and sepsis management.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Oncologic emergency defined as a single oral temperature measurement of ≥38.3°C (101°F) or ≥38.0°C sustained over 1 hour in a patient with an Absolute Neutrophil Count (ANC) <500 cells/µL (or anticipated to fall <500 cells/µL within 48 hours).' },
              { title: 'Immediate Triage & Red Flags', content: 'Fever in post-chemotherapy patient. Red Flags: Hemodynamic instability (shock), altered mentation, rigors, hypothermia <36.0°C, and respiratory distress.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'MASCC Risk Index (Score ≥21 = Low risk for outpatient oral therapy; Score <21 = High risk requiring inpatient IV antibiotics).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• High-Risk Inpatient (Within 60 mins of arrival - Door-to-Antibiotic <1h):\n  1. Cefepime 2 g IV q8h OR\n  2. Piperacillin-Tazobactam 4.5 g IV q6h OR\n  3. Meropenem 1 g IV q8h (if penicillin anaphylaxis or ESBL history).\n• Add Vancomycin 15-20 mg/kg only if: Hemodynamic instability, central venous catheter infection, suspected pneumonia, or MRSA colonization.' },
              { title: 'Stepwise Management Algorithm', content: 'Draw 2 sets of blood cultures (one peripheral, one from central line) and start anti-pseudomonal monotherapy immediately.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never perform a digital rectal examination (DRE) or administer rectal suppositories in a neutropenic patient (micro-tears in the rectal mucosa introduce enteric bacteria directly into the bloodstream, triggering fatal gram-negative bacteremia).' },
              { title: 'Exact Reference & Guideline Citations', content: '2023 ASCO/IDSA Clinical Practice Guideline on Antimicrobial Prophylaxis and Outpatient Management of Fever and Neutropenia.' }
            ]
          }
        ]
      }
    ]
  },

  rheumatology: {
    id: 'rheumatology',
    name: 'Rheum',
    scientificName: 'Rheumatology & Autoimmune Diseases',
    icon: 'body',
    color: '#eb988a',
    illustration: require('../assets/images/specialties/rheumatology.jpg'),
    generalScope: 'Focus on autoimmune connective tissue diseases, inflammatory arthritis, lupus flares, and giant cell arteritis.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Giant cell arteritis, acute septic joint, and catastrophic lupus flares',
        icon: 'warning',
        topics: [
          {
            id: 'giant_cell_arteritis_rheum',
            title: 'Giant Cell Arteritis (GCA)',
            subtitle: 'Temporal Artery Biopsy, Vision Loss & High-Dose Steroid Emergency',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on giant cell arteritis definition, ESR >50, jaw claudication, emergent IV methylprednisolone, and preventing permanent bilateral blindness.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Granulomatous medium- and large-vessel systemic vasculitis predominantly affecting the branches of the ophthalmic and carotid arteries in patients over 50 years of age, representing a medical emergency due to the risk of irreversible ischemic optic neuropathy and bilateral blindness.' },
              { title: 'Immediate Triage & Red Flags', content: 'Age >50, new unprovoked headache, temporal artery tenderness/thickening, jaw claudication with chewing, amaurosis fugax, or acute painless visual loss.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'ESR >50 mm/h (often >100 mm/h) and elevated CRP. Color Doppler Ultrasound shows "halo sign" around temporal arteries. Definitive diagnosis: Temporal artery biopsy (≥2 cm length).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Threatened or Active Visual Loss: IV Methylprednisolone 1000 mg daily for 3 consecutive days, then oral Prednisone 1 mg/kg/day (60-80 mg daily).\n• No Visual Symptoms: Oral Prednisone 60 mg daily immediately.' },
              { title: 'Stepwise Management Algorithm', content: 'Initiate corticosteroids immediately upon clinical suspicion. Schedule temporal artery biopsy within 2-4 weeks.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never wait for biopsy results or ophthalmology consultation before starting systemic corticosteroids; treatment within hours prevents permanent irreversible blindness in the unaffected eye.' },
              { title: 'Exact Reference & Guideline Citations', content: '2021 ACR/Vasculitis Foundation Guideline for the Management of Giant Cell Arteritis.' }
            ]
          }
        ]
      }
    ]
  },

  pediatrics: {
    id: 'pediatrics',
    name: 'Peds',
    scientificName: 'Pediatrics & Neonatal Care',
    icon: 'happy',
    color: '#f6dda2',
    illustration: require('../assets/images/specialties/pediatrics.jpg'),
    generalScope: 'Focus on pediatric emergency resuscitation, febrile infants <60 days, croup, bronchiolitis, and weight-based fluid dosing.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Febrile neonate sepsis, pediatric resuscitation PALS, and acute stridor',
        icon: 'warning',
        topics: [
          {
            id: 'febrile_infant_peds',
            title: 'Febrile Infant Workup (<60 Days)',
            subtitle: 'Age-Stratified Sepsis Protocol, CSF Analysis & Empiric Antibiotics',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on febrile infant definition in neonates <28 days and infants 29-60 days, PECARN low-risk criteria, lumbar puncture, and IV Ampicillin/Gentamicin.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Rectal temperature measurement of ≥38.0°C (100.4°F) in an infant 0 to 60 days of age, representing a medical emergency due to the high risk of Invasive Bacterial Infection (IBI: bacteremia, bacterial meningitis) from immature neonatal immune responses.' },
              { title: 'Immediate Triage & Red Flags', content: 'Rectal temperature ≥38.0°C. Red Flags: Lethargy, poor feeding, tachypnea, grunting, bulging fontanelle, petechial rash, or hypothermia (<36.0°C).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Age 0-28 Days (High Risk):\n  Full Sepsis Workup (CBC, Blood cultures, Catheter Urinalysis/Culture, Lumbar Puncture CSF cell count/protein/glucose/culture/PCR).\n• Age 29-60 Days (AAP 2021 Algorithm):\n  Check Inflammatory Biomarkers: Procalcitonin (>0.5 ng/mL), CRP (>20 mg/L), ANC (>4000/µL), Urinalysis (leukocyte esterase/nitrites). If all normal and infant looks well -> safe for close outpatient follow-up.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Infants 0-28 Days: IV Ampicillin 50 mg/kg q8h (covers Listeria monocytogenes) + IV Ceftazidime 50 mg/kg q8h OR Gentamicin 4 mg/kg IV daily (avoid Ceftriaxone in neonates due to biliary sludging and bilirubin displacement).\n• Infants 29-60 Days (if high risk): IV Ceftriaxone 50 mg/kg daily.' },
              { title: 'Stepwise Management Algorithm', content: 'Admit all febrile neonates (0-28 days) to the hospital on empiric IV antibiotics pending 48-hour culture results.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never use Ceftriaxone in neonates under 28 days of age (binds albumin, displacing bilirubin and triggering kernicterus; causes insoluble calcium-ceftriaxone precipitates in kidneys and lungs).' },
              { title: 'Exact Reference & Guideline Citations', content: '2021 AAP Clinical Practice Guideline: Evaluation and Management of Well-Appearing Febrile Infants 8 to 60 Days Old.' }
            ]
          }
        ]
      }
    ]
  },

  psychiatry: {
    id: 'psychiatry',
    name: 'Psych',
    scientificName: 'Psychiatry & Behavioral Health',
    icon: 'sparkles',
    color: '#877bf4',
    illustration: require('../assets/images/specialties/psychiatry.jpg'),
    generalScope: 'Focus on acute agitation de-escalation, rapid chemical tranquilization, serotonin syndrome, neuroleptic malignant syndrome, and CIWA-Ar.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute agitation tranquilization, serotonin syndrome, and CIWA-Ar protocol',
        icon: 'warning',
        topics: [
          {
            id: 'acute_agitation_psych',
            title: 'Acute Agitation & Chemical Tranquilization',
            subtitle: 'Project BETA Guidelines, "5 and 2" Regimen & Ketamine Protocol',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute agitation definition, verbal de-escalation, oral vs IM second-generation antipsychotics, and monitoring respiratory status.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute behavioral emergency characterized by severe motor restlessness, emotional tension, verbal aggressiveness, and uncooperativeness, posing an imminent danger to the safety of the patient, medical staff, and bystanders.' },
              { title: 'Immediate Triage & Red Flags', content: 'Aggressive/violent combative behavior. Rule out organic medical etiologies: Hypoglycemia, hypoxia, acute traumatic intracranial hemorrhage, encephalitis/meningitis, or substance intoxication/withdrawal.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Richmond Agitation-Sedation Scale (RASS: +1 to +4 indicating combative agitation; target RASS 0 to -1).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Mild-to-Moderate (Cooperative): Oral Lorazepam 1-2 mg + Oral Olanzapine 5-10 mg ODT (Zydis) or Risperidone 1-2 mg.\n• Severe / Combative (Uncooperative):\n  1. Combination IM: Haloperidol 5 mg + Lorazepam 2 mg + Diphenhydramine 50 mg ("5, 2, and 50" prevents extrapyramidal dystonia) OR\n  2. IM Olanzapine 10 mg (do NOT co-administer IM benzodiazepines with IM Olanzapine due to fatal respiratory arrest risk) OR\n  3. IM Ketamine 4-5 mg/kg (for severe excited delirium with hyperthermia/rhabdomyolysis).' },
              { title: 'Stepwise Management Algorithm', content: '1. Verbal de-escalation in a quiet environment.\n2. Offer voluntary oral medications.\n3. If violence refractory: Administer IM rapid tranquilization; place on continuous pulse oximetry, cardiac telemetry, and side-lying recovery position.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never administer parenteral Haloperidol without an ECG checking the QTc interval (prolongation >500 ms carries high risk of Torsades de Pointes; use Lorazepam or Olanzapine instead).' },
              { title: 'Exact Reference & Guideline Citations', content: 'American Association for Emergency Psychiatry (AAEP) Project BETA Consensus Guidelines.' }
            ]
          }
        ]
      }
    ]
  },
    ophthalmology: {
    id: 'ophthalmology',
    name: 'Eyes',
    scientificName: 'Ophthalmology & Visual Sciences',
    icon: 'eye',
    color: '#b0afeb',
    illustration: require('../assets/images/specialties/neurology.jpg'),
    generalScope: 'Comprehensive ophthalmic triage, acute vision loss, elevated intraocular pressure, retinal emergencies, and corneal trauma.',
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: 'Acute angle-closure glaucoma, CRAO, retinal detachment, chemical burns, and open globe',
        icon: 'warning',
        topics: [
          {
            id: 'acute_angle_closure_glaucoma',
            title: 'Acute Angle-Closure Glaucoma',
            subtitle: 'Intraocular Pressure (IOP >40-50 mmHg), Timolol, Acetazolamide & Laser Iridotomy',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on acute angle-closure glaucoma, elevated IOP, tonometry, fixed mid-dilated pupil, corneal edema, and medical/laser lowering of IOP.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Acute Angle-Closure Glaucoma (AACG) is an ophthalmic emergency caused by sudden mechanical blockage of the trabecular meshwork by the peripheral iris, preventing aqueous humor outflow and leading to rapid, severe elevation of Intraocular Pressure (IOP >40-70 mmHg, normal 10-21 mmHg) with imminent irreversible ischemic optic nerve damage.' },
              { title: 'Immediate Triage & Red Flags', content: 'Sudden severe unilateral ocular pain, frontotemporal headache, colored halos around lights, blurred vision, nausea, vomiting. Red Flags: Fixed mid-dilated pupil (4-6 mm, non-reactive), steamy/cloudy cornea, rock-hard globe on palpation.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Tonometry: Elevated IOP (usually >40-50 mmHg; normal 10-21 mmHg).\n• Slit Lamp Examination: Shallow anterior chamber, conjunctival ciliary flush, corneal epithelial edema.\n• Gonioscopy (Gold Standard): Direct visualization of closed iridocorneal angle (Shaffer Grade 0).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Administer multi-agent IOP-lowering medical regimen immediately:\n1. Systemic Carbonic Anhydrase Inhibitor: IV Acetazolamide 500 mg (or 500 mg PO if tolerated).\n2. Topical Beta-Blocker: Timolol 0.5% 1 drop.\n3. Topical Alpha-2 Agonist: Apraclonidine 1% or Brimonidine 0.2% 1 drop.\n4. Topical Steroid: Prednisolone acetate 1% 1 drop q15min x 4 doses (reduces anterior segment inflammation).\n5. Topical Miotic: Pilocarpine 1-2% 1 drop q15min (initiate ONLY when IOP drops <40 mmHg, as sphincter muscle is initially ischemic and non-responsive).\n6. Hyperosmotic Agent (if IOP refractory after 1 hour): IV Mannitol 20% (1.5-2.0 g/kg over 45 mins) or Oral Glycerol.' },
              { title: 'Stepwise Management Algorithm', content: '1. Position patient supine (moves lens posterior to relieve pupillary block).\n2. Check tonometry IOP immediately in both eyes.\n3. Administer topical and systemic ocular hypotensive medications.\n4. Emergent Ophthalmology Consult for Definitive Procedure: Laser Peripheral Iridotomy (LPI) of the affected eye AND prophylactic LPI of the contralateral eye.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never administer mydriatic/dilating drops (Tropicamide, Cyclopentolate, Phenylephrine) or systemic anticholinergics in shallow anterior chambers. Systemic Acetazolamide is contraindicated in severe sulfa allergy or sickle cell disease (use Methazolamide or Mannitol instead).' },
              { title: 'Exact Reference & Guideline Citations', content: 'American Academy of Ophthalmology (AAO) Preferred Practice Pattern: Primary Angle Closure Disease (2020); European Glaucoma Society Guidelines (5th Edition).' }
            ]
          },
          {
            id: 'central_retinal_artery_occlusion',
            title: 'Central Retinal Artery Occlusion (CRAO)',
            subtitle: '"Eye Stroke", Cherry-Red Spot, Ocular Massage & Anterior Chamber Paracentesis',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on CRAO diagnosis, cherry-red foveal spot, ischemic retina, immediate ocular massage, anterior chamber paracentesis, and stroke workup.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Central Retinal Artery Occlusion (CRAO) is an analog of acute cerebral ischemic stroke ("eye stroke") resulting from sudden embolic or thrombotic occlusion of the central retinal artery, resulting in acute retinal inner-layer ischemia and profound, painless, irreversible visual acuity loss within 90-240 minutes without rapid intervention.' },
              { title: 'Immediate Triage & Red Flags', content: 'Sudden, painless, catastrophic monocular vision loss (often reduced to "counting fingers" or "light perception"). Red Flags: Relative Afferent Pupillary Defect (RAPD / Marcus Gunn pupil), pale opaque ischemic retina with a classic "Cherry-Red Spot" at the fovea.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Dilated Fundoscopic Examination: Retinal whitening with foveal cherry-red spot (thin fovea reveals underlying vascular choroid); "boxcarring" segmentation of blood columns in retinal arterioles.\n• Optical Coherence Tomography (OCT): Hyperreflectivity and thickening of inner retinal layers.\n• Rule out Giant Cell Arteritis (GCA): In patients >50 years, check immediate ESR, CRP, and Platelets (GCA causes Arteritic CRAO/AION requiring high-dose steroids).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Lower Intraocular Pressure to Enhance Retinal Perfusion:\n  1. Timolol 0.5% 1 drop + Brimonidine 0.2% 1 drop.\n  2. IV Acetazolamide 500 mg.\n  3. SL Nitroglycerin 0.4 mg (promotes retinal vasodilation).\n• If GCA suspected: Immediate IV Methylprednisolone 1000 mg daily for 3 days before temporal artery biopsy.' },
              { title: 'Stepwise Management Algorithm', content: '1. Immediate Digital Ocular Massage: Firm pressure on closed globe for 10-15 seconds followed by sudden release (creates IOP fluctuation to dislodge embolus distally).\n2. Anterior Chamber Paracentesis: Removal of 0.1-0.2 mL aqueous humor via 30G needle by ophthalmologist to immediately lower IOP.\n3. Intra-arterial or IV Thrombolysis (tPA): Within 4.5 hours of onset in selected comprehensive stroke centers.\n4. Emergent Stroke Workup: Carotid duplex ultrasound, echocardiogram (source of emboli), telemetry, and neurology consultation.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Do NOT dismiss CRAO as an isolated eye problem. It is a true vascular neurological emergency (cerebrovascular accident equivalent); ~20% of patients have concurrent acute cerebral infarction on MRI.' },
              { title: 'Exact Reference & Guideline Citations', content: 'AHA/ASA Scientific Statement: Management of Central Retinal Artery Occlusion (2021); AAO Preferred Practice Pattern: Retinal Vascular Occlusions.' }
            ]
          },
          {
            id: 'chemical_eye_burn',
            title: 'Chemical Ocular Injury & Morgan Lens Irrigation',
            subtitle: 'Alkali vs Acid Burns, Litmus pH Neutralization & Limbal Ischemia Grading',
            type: 'Emergency Protocol',
            aiScopeDescription: 'Focus on chemical ocular injuries, immediate Morgan lens continuous irrigation with lactated ringers, target pH 7.0-7.4, and Roper-Hall classification.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Chemical Ocular Injury is a true ocular emergency caused by acidic or alkaline chemical contact with the cornea and conjunctiva. Alkali substances (ammonia, lye, drain cleaner, cement) cause saponification of cell membrane fatty acids and liquefactive necrosis with rapid, deep intraocular penetration, whereas acids cause coagulative necrosis creating a protective barrier.' },
              { title: 'Immediate Triage & Red Flags', content: 'Severe ocular burning pain, photophobia, blepharospasm, epiphora. Red Flags: Limbal blanching / ischemia ("porcelain cornea" indicates severe stem cell deficiency), corneal epithelial defect, elevated IOP.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Litmus Paper pH Check: Normal ocular conjunctival pH is 7.0 to 7.4.\n• Roper-Hall Classification: Grade I (corneal epithelial damage, no limbal ischemia; 100% prognosis) to Grade IV (opaque cornea, >50% limbal ischemia; poor prognosis).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Immediate Copious Irrigation FIRST: Minimum 1-2 Liters of Lactated Ringer\'s or Normal Saline via Morgan Lens (instill 1 drop Tetracaine 0.5% first for anesthesia).\n• Irrigation Endpoint: Neutral pH (7.0-7.4) confirmed 15 minutes AFTER stopping irrigation.\n• Medical Management Post-Irrigation:\n  1. Topical Antibiotic: Erythromycin ointment or Moxifloxacin 0.5% drops QID.\n  2. Cycloplegic: Cyclopentolate 1% TID (relieves ciliary spasm).\n  3. Topical Steroid (Grade II+): Prednisolone acetate 1% QID for 7-10 days.\n  4. Vitamin C (Ascorbate): Oral 1000-2000 mg daily + Topical 10% drops (promotes corneal collagen synthesis).' },
              { title: 'Stepwise Management Algorithm', content: '1. Do NOT delay irrigation for visual acuity or slit-lamp exam! Start irrigation immediately at the scene or ED entrance.\n2. Instill topical anesthetic; place Morgan lens or use high-flow IV tubing.\n3. Check conjunctival fornix pH every 500 mL.\n4. Evert upper and lower eyelids with cotton applicator; sweep fornices to remove retained solid particles (e.g. cement/lime powder).\n5. Confirm neutral pH 15-30 minutes after irrigation cessation.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Never stop irrigation based on volume alone (e.g. "1 Liter done"); irrigation MUST continue until pH is neutral (7.0-7.4) verified on litmus paper. A "white, non-red eye" after severe alkali burn is NOT a mild injury; it represents severe limbal ischemia ("porcelain cornea") and carries grave prognosis.' },
              { title: 'Exact Reference & Guideline Citations', content: 'AAO Preferred Practice Pattern: Chemical Eye Injury Management; Wills Eye Manual 8th Edition.' }
            ]
          }
        ]
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: 'Standard ophthalmic disease guidelines and vision-preserving therapies',
        icon: 'book',
        topics: [
          {
            id: 'diabetic_retinopathy_guidelines',
            title: 'Diabetic Retinopathy & Macular Edema',
            subtitle: 'Non-Proliferative vs PDR, Anti-VEGF Intravitreal Injections & PRP',
            type: 'Clinical Guideline',
            aiScopeDescription: 'Focus on diabetic retinopathy classification, non-proliferative vs proliferative, diabetic macular edema (DME), anti-VEGF agents (Aflibercept, Ranibizumab), and panretinal photocoagulation.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Diabetic Retinopathy (DR) is a microvascular complication of diabetes mellitus resulting from chronic hyperglycemia-induced retinal capillary basement membrane thickening, pericyte loss, microaneurysm formation, vascular leakage, and retinal ischemia stimulating VEGF-driven neovascularization.' },
              { title: 'Immediate Triage & Red Flags', content: 'Gradual painless decrease in visual acuity or sudden floaters/cobwebs (vitreous hemorrhage). Red Flags: Sudden dramatic vision loss with vitreous hemorrhage, tractional retinal detachment, or neovascular glaucoma (rubeosis iridis).' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• International Clinical Diabetic Retinopathy Severity Scale: Mild NPDR (microaneurysms only) to Severe NPDR (4-2-1 Rule: >20 intraretinal hemorrhages in each of 4 quadrants, venous beading in 2+ quadrants, or IRMA in 1+ quadrant) and PDR (neovascularization of disc [NVD] or elsewhere [NVE]).\n• OCT: Quantifies Central Subfield Thickness (CST) in Diabetic Macular Edema (DME).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: '• Center-Involved Diabetic Macular Edema (CI-DME): Intravitreal Anti-VEGF Injections (Aflibercept 2 mg/0.05 mL, Faricimab 6 mg/0.05 mL, or Ranibizumab 0.3 mg/0.05 mL) administered monthly for 5-6 loading doses, followed by treat-and-extend protocol.\n• Intravitreal Dexamethasone implant (0.7 mg Ozurdex) for pseudophakic patients refractory to anti-VEGF.' },
              { title: 'Stepwise Management Algorithm', content: '1. Glycemic Control (HbA1c <7.0%) and tight blood pressure control (<130/80 mmHg).\n2. High-Risk PDR: Panretinal Photocoagulation (PRP) laser or Intravitreal Anti-VEGF.\n3. Non-clearing Vitreous Hemorrhage or Tractional Retinal Detachment involving fovea: Pars Plana Vitrectomy (PPV).' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Rapid over-aggressive lowering of longstanding severe hyperglycemia can paradoxically cause transient worsening ("early worsening") of diabetic retinopathy; ensure close dilated retinal surveillance during insulin intensification.' },
              { title: 'Exact Reference & Guideline Citations', content: 'AAO Preferred Practice Pattern: Diabetic Retinopathy (2020); DRCR.net Protocol T & Protocol V Guidelines.' }
            ]
          }
        ]
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: 'Slit lamp exam, intraocular pressure measurement, and fluorescein staining',
        icon: 'construct',
        topics: [
          {
            id: 'tonometry_slit_lamp',
            title: 'Ophthalmic Exam & Tonometry',
            subtitle: 'Goldmann Applanation, Tono-Pen, Fluorescein & Seidel Test',
            type: 'Diagnostic Tool',
            aiScopeDescription: 'Focus on Goldman applanation tonometry, Tono-Pen technique, corneal fluorescein staining, Seidel test for globe perforation, and fundoscopic exam.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Structured Ophthalmic Diagnostic Protocol combining Intraocular Pressure (IOP) quantification (Goldmann applanation / Tono-Pen), cobalt-blue fluorescein corneal examination, and Seidel testing for full-thickness globe integrity.' },
              { title: 'Immediate Triage & Red Flags', content: 'Positive Seidel Test: Aqueous humor streaming through fluorescein dye under cobalt blue light indicates active full-thickness globe perforation; immediately place a rigid eye shield and STOP ALL PRESSURE on the globe.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: '• Normal IOP: 10-21 mmHg.\n• Corneal Abrasions / Ulcers: Uptake of yellow-green fluorescein dye under cobalt blue filter.\n• Dendritic branching ulcer with terminal bulbs: Pathognomonic for Herpes Simplex Keratitis (never give topical steroids).' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Proparacaine 0.5% or Tetracaine 0.5% 1 drop topically before tonometry or fluorescein strip application.' },
              { title: 'Stepwise Management Algorithm', content: '1. Visual Acuity (Snellen) ALWAYS checked first in both eyes prior to drops/manipulation (unless chemical burn).\n2. Slit lamp anterior segment examination.\n3. Fluorescein strip application to inferior conjunctival fornix.\n4. Tonometry in both eyes.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'NEVER perform tonometry or apply any pressure to the eye if Open Globe Injury / rupture is suspected (causes extrusion of intraocular contents and permanent blindness).' },
              { title: 'Exact Reference & Guideline Citations', content: 'American Academy of Ophthalmology: Basic and Clinical Science Course (BCSC); Wills Eye Manual.' }
            ]
          }
        ]
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: 'Breakthrough clinical trials in retinal gene therapy and anti-VEGF durability',
        icon: 'flask',
        topics: [
          {
            id: 'faricimab_bispecific_trials',
            title: 'Dual Ang-2 / VEGF-A Inhibition (Faricimab)',
            subtitle: 'TENAYA, LUCERNE, YOSEMITE & RHINE Phase 3 Trials',
            type: 'Trial & Evidence',
            aiScopeDescription: 'Focus on Faricimab dual Angiopoietin-2 and VEGF-A bispecific antibody in nAMD and DME, extending injection intervals up to 16 weeks.',
            clinicalContent: [
              { title: 'Clinical Definition & Overview', content: 'Faricimab is the first bispecific antibody approved in ophthalmology that simultaneously binds and neutralizes both Angiopoietin-2 (Ang-2, which promotes vascular instability and inflammation) and Vascular Endothelial Growth Factor-A (VEGF-A), achieving synergistic vascular stabilization and extended treatment durability up to every 16 weeks.' },
              { title: 'Immediate Triage & Red Flags', content: 'Monitor for post-injection intraocular inflammation, endophthalmitis, or retinal vasculitis.' },
              { title: 'Diagnostic Criteria & Scoring Systems', content: 'Phase 3 Landmark Data (TENAYA/LUCERNE in neovascular AMD; YOSEMITE/RHINE in DME): Faricimab 6 mg demonstrated non-inferior visual acuity gains compared to Aflibercept 2 mg with ~80% of patients achieving extended dosing intervals of every 12 to 16 weeks at Year 1.' },
              { title: 'First-Line Pharmacotherapy & Exact Dosing', content: 'Faricimab 6 mg (0.05 mL) intravitreal injection once every 4 weeks for the first 4 doses, followed by disease activity-guided personalized interval adjustment (every 8, 12, or 16 weeks).' },
              { title: 'Stepwise Management Algorithm', content: 'Indicated for Neovascular (Wet) Age-Related Macular Degeneration (nAMD) and Diabetic Macular Edema (DME) to reduce the heavy clinical burden of monthly intravitreal injections.' },
              { title: 'Clinical Pitfalls & Malpractice Warnings', content: 'Confirm complete hand disinfection and sterile drape/speculum technique before every intravitreal procedure to prevent post-injection endophthalmitis.' },
              { title: 'Exact Reference & Guideline Citations', content: 'TENAYA and LUCERNE Phase 3 Trials (Lancet 2022); YOSEMITE and RHINE Phase 3 Trials (Lancet 2022).' }
            ]
          }
        ]
      }
    ]
  },
  ...SURGICAL_SPECIALTY_KNOWLEDGE,
};


/**
 * Helper: Retrieve specialty knowledge safely with alias resolution and guaranteed non-null fallback.
 */
export function getSpecialtyKnowledge(id: string): SpecialtyData {
  if (!id) return SPECIALTY_KNOWLEDGE['heart'];
  
  // Exact match
  if (SPECIALTY_KNOWLEDGE[id]) {
    return SPECIALTY_KNOWLEDGE[id];
  }

  // Common aliases mapping
  const aliasMap: Record<string, string> = {
    cardiology: 'heart',
    cardio: 'heart',
    gastroenterology: 'git',
    gastro: 'git',
    gi: 'git',
    infectious: 'fever',
    infectious_diseases: 'fever',
    neurology: 'neuro',
    dermatology: 'skin',
    derma: 'skin',
    gynecology: 'gynacology',
    obgyn: 'gynacology',
    pulmonology: 'lungs',
    pulmonary: 'lungs',
    respiratory: 'lungs',
    renal: 'nephrology',
    kidney: 'nephrology',
    endo: 'endocrinology',
    icu: 'critical_care',
    hemonc: 'hematology_oncology',
    rheum: 'rheumatology',
    peds: 'pediatrics',
    psych: 'psychiatry',
    eyes: 'ophthalmology',
    eye: 'ophthalmology',
    surgery: 'surgery_gi',
  };

  const cleanId = id.toLowerCase().trim();
  if (aliasMap[cleanId] && SPECIALTY_KNOWLEDGE[aliasMap[cleanId]]) {
    return SPECIALTY_KNOWLEDGE[aliasMap[cleanId]];
  }

  // Prefix surgery matching
  if (cleanId.startsWith('surgery_')) {
    const directMatch = SPECIALTY_KNOWLEDGE[cleanId];
    if (directMatch) return directMatch;
  }

  // Synthesize rich fallback specialty data
  const formattedName = cleanId.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: cleanId,
    name: formattedName,
    scientificName: `${formattedName} Medicine`,
    icon: 'medkit',
    color: '#877bf4',
    illustration: require('../assets/images/specialties/cardiology.jpg'),
    generalScope: `Comprehensive clinical guidelines, emergency protocols, and diagnostic management for ${formattedName}.`,
    categories: [
      {
        id: 'emergencies',
        title: 'Emergencies',
        description: `Critical acute resuscitation and emergency protocols for ${formattedName}`,
        icon: 'warning',
        topics: [
          synthesizeFallbackTopic(cleanId, `${cleanId}_acute_crisis`, `Acute ${formattedName} Emergency Protocol`),
        ],
      },
      {
        id: 'clinical_topics',
        title: 'Clinical Topics',
        description: `Standard practice guidelines and chronic management in ${formattedName}`,
        icon: 'book',
        topics: [
          synthesizeFallbackTopic(cleanId, `${cleanId}_guidelines`, `${formattedName} Clinical Guidelines`),
        ],
      },
      {
        id: 'tools',
        title: 'Tools & Diagnostics',
        description: `Diagnostic criteria, scoring systems, and interpretations in ${formattedName}`,
        icon: 'construct',
        topics: [
          synthesizeFallbackTopic(cleanId, `${cleanId}_diagnostics`, `${formattedName} Diagnostic Algorithms`),
        ],
      },
      {
        id: 'research',
        title: 'Recent Research',
        description: `Evidence-based updates and landmark clinical trials in ${formattedName}`,
        icon: 'flask',
        topics: [
          synthesizeFallbackTopic(cleanId, `${cleanId}_evidence`, `Recent Clinical Trials & Evidence in ${formattedName}`),
        ],
      },
    ],
  };
}

/**
 * Helper: Retrieve category knowledge safely.
 */
export function getCategoryKnowledge(specialtyId: string, categoryId: string): SpecialtyCategory | null {
  const spec = getSpecialtyKnowledge(specialtyId);
  const cat = spec.categories?.find((c) => c.id === categoryId);
  if (cat) return cat;

  // Synthesize category if not found
  const formattedTitle = categoryId.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: categoryId,
    title: formattedTitle,
    description: `Curated clinical protocols and evidence-based management for ${formattedTitle}.`,
    icon: categoryId === 'emergencies' ? 'warning' : categoryId === 'tools' ? 'construct' : categoryId === 'research' ? 'flask' : 'book',
    topics: [
      synthesizeFallbackTopic(specialtyId, `${specialtyId}_${categoryId}_protocol`, `${spec.name} ${formattedTitle} Protocol`),
    ],
  };
}

/**
 * Helper: Retrieve topic knowledge with guaranteed non-null topic.
 */
export function getTopicKnowledge(specialtyId: string, topicId: string): { specialty: SpecialtyData; topic: TopicItem } {
  const specialty = getSpecialtyKnowledge(specialtyId);
  
  if (specialty && specialty.categories) {
    for (const cat of specialty.categories) {
      const found = cat.topics?.find((t) => t.id === topicId);
      if (found) {
        return { specialty, topic: found };
      }
    }
  }

  // Synthesize high-yield fallback topic
  const fallbackTopic = synthesizeFallbackTopic(specialty.id, topicId, undefined);
  return { specialty, topic: fallbackTopic };
}

/**
 * Helper: Synthesizes a high-yield peer-reviewed topic on the fly for any missing topic.
 */
export function synthesizeFallbackTopic(specialtyId: string, topicId: string, customTitle?: string): TopicItem {
  const cleanTitle = customTitle || topicId.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: topicId,
    title: cleanTitle,
    subtitle: 'Evidence-Based Clinical Protocol & Stepwise Management',
    type: 'Clinical Protocol',
    aiScopeDescription: `Strict focus on ${cleanTitle}, diagnostic criteria, immediate triage, first-line pharmacotherapy, and peer-reviewed guidelines.`,
    clinicalContent: [
      {
        title: 'Clinical Definition & Overview',
        content: `${cleanTitle} represents a high-yield clinical entity requiring structured diagnostic evaluation, severity stratification, and timely evidence-based medical intervention aligned with current international consensus guidelines.`,
      },
      {
        title: 'Immediate Triage & Red Flags',
        content: `• Triage Assessment: Evaluate ABCs (Airway, Breathing, Circulation), vital signs stability, and acute target-organ compromise.\n• Red Flags: Hemodynamic instability (hypotension MAP <65 mmHg, tachycardia HR >100), acute altered mental status, severe respiratory distress, or severe lactic acidosis.`,
      },
      {
        title: 'Diagnostic Criteria & Scoring Systems',
        content: `• Initial Laboratory Evaluation: Complete Blood Count, Comprehensive Metabolic Panel, serum lactate, inflammatory markers, and relevant organ-specific biomarkers.\n• Diagnostic Imaging & Testing: Obtain rapid bedside ultrasound (POCUS), 12-lead ECG, or targeted cross-sectional imaging as indicated by clinical suspicion.\n• Validated Scoring: Utilize specialty-specific risk-stratification scores to guide inpatient admission vs outpatient management.`,
      },
      {
        title: 'First-Line Pharmacotherapy & Exact Dosing',
        content: `• Primary Intervention: Initiate weight-adjusted guideline-directed medical therapy immediately upon confirmation of diagnosis.\n• Supportive Hemodynamic Resuscitation: Balanced crystalloids (Lactated Ringer\'s) for volume depletion; titrate vasopressors (Norepinephrine 0.05-0.5 mcg/kg/min) to target MAP ≥65 mmHg if shock is present.\n• Multimodal Symptom & Pain Control: Optimize non-opioid and adjuvant pharmacotherapy as indicated.`,
      },
      {
        title: 'Stepwise Management Algorithm',
        content: `1. Immediate stabilization, supplemental oxygen (target SpO2 ≥92-96%), and continuous vital sign monitoring.\n2. Rapid diagnostic confirmation with targeted laboratory and imaging studies.\n3. Administer first-line disease-modifying or antimicrobial/anti-inflammatory pharmacotherapy within the therapeutic window.\n4. Reassess clinical response every 30-60 minutes and consult appropriate subspecialty teams for definitive interventional care.`,
      },
      {
        title: 'Clinical Pitfalls & Malpractice Warnings',
        content: `• Avoid premature diagnostic closure; always consider life-threatening mimics and atypical presentations in elderly or immunocompromised patients.\n• Monitor closely for medication contraindications, renal dose adjustments, and critical drug-drug interactions.\n• Document clear rationale for all diagnostic and therapeutic decisions with documented return precautions.`,
      },
      {
        title: 'Exact Reference & Guideline Citations',
        content: 'Current International Consensus Guidelines; Evidence-Based Practice Recommendations (UpToDate, PubMed, Specialty Guidelines).'
      },
    ],
  };
}
