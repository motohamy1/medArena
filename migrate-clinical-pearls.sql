-- ============================================================
-- MEDICAL ARENA: Clinical Pearls Table Migration + Seed
-- 
-- INSTRUCTIONS: Run this entire script in your Supabase SQL Editor
-- (Database > SQL Editor > New Query > Paste > Run)
-- It is safe to re-run multiple times (idempotent).
-- ============================================================

-- Step 1: Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.clinical_pearls (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    specialty_id TEXT NOT NULL,
    specialty_name TEXT NOT NULL,
    specialty_color TEXT NOT NULL,
    specialty_icon TEXT NOT NULL,
    citation TEXT NOT NULL,
    takeaway TEXT,
    pearl TEXT,
    key_numbers TEXT,
    badge TEXT,
    rule TEXT,
    action TEXT,
    pitfall TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Ensure all columns exist if table was created with an older schema
ALTER TABLE public.clinical_pearls
  ADD COLUMN IF NOT EXISTS rule TEXT,
  ADD COLUMN IF NOT EXISTS action TEXT,
  ADD COLUMN IF NOT EXISTS pitfall TEXT,
  ADD COLUMN IF NOT EXISTS badge TEXT,
  ADD COLUMN IF NOT EXISTS key_numbers TEXT,
  ADD COLUMN IF NOT EXISTS takeaway TEXT,
  ADD COLUMN IF NOT EXISTS pearl TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 3: Indexes & Row Level Security
CREATE INDEX IF NOT EXISTS idx_clinical_pearls_specialty ON public.clinical_pearls (specialty_id);
CREATE INDEX IF NOT EXISTS idx_clinical_pearls_active ON public.clinical_pearls (is_active);

ALTER TABLE public.clinical_pearls ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'clinical_pearls' 
        AND policyname = 'Allow public read access on clinical_pearls'
    ) THEN
        CREATE POLICY "Allow public read access on clinical_pearls"
            ON public.clinical_pearls FOR SELECT
            USING (true);
    END IF;
END
$$;

-- Step 4: Seed all 18 clinical pearls (safe to re-run)
INSERT INTO public.clinical_pearls
  (id, title, category, specialty_id, specialty_name, specialty_color, specialty_icon,
   badge, rule, action, pitfall, citation, takeaway, pearl, key_numbers, is_active)
VALUES

-- CARDIOLOGY
('pearl_cardio_1','RV Infarction Preload Collapse','Emergency Hemodynamics','heart','Cardiology','#FF6B6B','heart','V4R STE >= 1mm',
 'Right ventricular infarction is strictly preload-dependent; nitroglycerin and morphine cause sudden catastrophic hypotension.',
 'Obtain right-sided ECG (V4R) on all inferior STEMIs. Resuscitate hypotension with rapid IV crystalloid boluses.',
 'Do NOT administer nitrates or diuretics even if pulmonary rales are suspected before confirming RV status.',
 'AHA/ACC STEMI Guidelines 2023',
 'RV infarction is preload-dependent — nitrates kill.','V4R STE >=1mm confirms RV MI. Give IV fluids, avoid nitrates.','V4R STE >= 1mm',true),

('pearl_cardio_2','Modified Sgarbossa in LBBB','ECG Diagnosis','heart','Cardiology','#FF6B6B','pulse','ST/S Ratio <= -0.25',
 'ST/S ratio <= -0.25 in leads with discordant ST elevation identifies acute coronary occlusion with 91% sensitivity in LBBB.',
 'Measure ST elevation at J-point divided by S-wave depth. If <= -0.25, activate emergency catheterization lab.',
 'Do not wait for biomarkers or rely on the outdated arbitrary 5mm discordant elevation rule.',
 'Smith et al. / ESC Guidelines 2024',
 'Concordant ST changes or ST/S <= -0.25 = occluded artery in LBBB.','Activate cath lab — do not wait for troponins.','ST/S Ratio <= -0.25',true),

('pearl_cardio_3','Aortic Dissection Beta-Blocker First','Resuscitation Protocol','heart','Cardiology','#FF6B6B','flame','HR < 60 | SBP 100-120',
 'IV Beta-blockade MUST precede vasodilator therapy to eliminate reflex tachycardia and aortic shear stress (dP/dt).',
 'Infuse IV Esmolol or Labetalol targeting HR < 60 bpm, then add IV Nicardipine/Nitroprusside for SBP 100-120 mmHg.',
 'Giving vasodilators first accelerates intimal tear propagation due to reflex sympathetic inotropy.',
 'AHA/ACC Aortic Disease Consensus',
 'Beta-blocker before vasodilator in aortic dissection. Always.','Target HR <60, then SBP 100-120 with nicardipine.','HR < 60 | SBP 100-120',true),

-- INFECTIOUS DISEASE
('pearl_fever_1','Bacterial Meningitis Steroid Timing','Neuro-Infectious','fever','Infectious Disease','#F59E0B','thermometer','10mg IV Dexamethasone',
 'Dexamethasone reduces neurological sequelae and hearing loss only when given BEFORE or WITH initial antibiotics.',
 'Administer Dexamethasone 10 mg IV immediately prior to or with Ceftriaxone 2g IV + Vancomycin 15-20 mg/kg IV.',
 'Steroids administered >1 hour after antibiotics provide zero clinical benefit due to completed bacterial lysis.',
 'IDSA Bacterial Meningitis Guidelines',
 'Dex BEFORE antibiotics in bacterial meningitis.','Dexamethasone 10mg IV + Ceftriaxone 2g IV. Simultaneously.','10mg IV Dexamethasone',true),

('pearl_fever_2','Balanced Crystalloids in Sepsis','Fluid Resuscitation','fever','Critical Care','#F59E0B','water','30 mL/kg Balanced Solution',
 'Lactated Ringer / Plasma-Lyte significantly reduces acute kidney injury and dialysis compared to 0.9% Normal Saline.',
 'Infuse 30 mL/kg balanced crystalloids within 3 hours. Reassess volume status via capillary refill and dynamic response.',
 'Large volumes of 0.9% Saline (154 mEq/L chloride) cause hyperchloremic metabolic acidosis and renal vasoconstriction.',
 'Surviving Sepsis / SMART Trial',
 'Balanced crystalloids (LR/Plasma-Lyte) over NS in sepsis.','30 mL/kg within 3h — then reassess.','30 mL/kg Balanced Solution',true),

('pearl_fever_3','Febrile Neutropenia Golden Hour','Oncology Emergency','fever','Infectious Disease','#F59E0B','shield-checkmark','ANC < 500 | T >= 38.3C',
 'Every 60-minute delay in antipseudomonal antibiotic delivery increases in-hospital mortality in neutropenic fever.',
 'Initiate Cefepime 2g IV q8h or Piperacillin-Tazobactam 4.5g IV q6h within 1 hour of fever presentation.',
 'Do not withhold empiric antibiotics while waiting for chest X-rays, blood cultures, or urinalysis results.',
 'ASCO/IDSA Sepsis Guidelines',
 'ANC <500 + fever = antibiotics within 60 minutes.','Cefepime 2g IV q8h — cultures first, antibiotics immediately after.','ANC < 500 | T >= 38.3C',true),

-- NEUROLOGY
('pearl_neuro_1','Status Epilepticus 5-Min Benchmark','Emergency Neurology','neuro','Neurology','#8B5CF6','flash','5-Minute Threshold',
 'Seizures persisting >=5 minutes rarely stop spontaneously and cause GABA-receptor internalisation and neuronal death.',
 'Min 5-10: Lorazepam 4 mg IV or Midazolam 10 mg IM. Min 10-20: Levetiracetam 60 mg/kg IV (max 4500mg) over 10 min.',
 'Do not repeat benzodiazepines multiple times without escalating to full-dose 2nd-line ASM.',
 'AES Guidelines / ESETT Trial',
 'Seizure >=5 min = treat immediately.','Lorazepam 4mg IV then Levetiracetam 60 mg/kg IV if seizure continues.','5-Minute Threshold',true),

('pearl_neuro_2','Permissive HTN in Ischemic Stroke','Neurovascular Protocol','neuro','Neurology','#8B5CF6','hardware-chip','Target < 220/120 mmHg',
 'The ischemic penumbra depends entirely on collateral perfusion pressure; aggressive BP lowering precipitates infarct extension.',
 'Maintain BP up to 220/120 mmHg unless end-organ damage occurs. If thrombolysis planned, titrate strictly to < 185/110 mmHg.',
 'Never give sublingual nifedipine or aggressive IV anti-hypertensives in acute stroke without tPA indication.',
 'AHA/ASA Ischemic Stroke Guidelines',
 'Allow BP up to 220/120 in acute ischemic stroke.','Only lower BP if giving tPA (target <185/110) or end-organ damage.','Target < 220/120 mmHg',true),

-- PULMONOLOGY
('pearl_lungs_1','ARDS Low Tidal Volume Strategy','Mechanical Ventilation','lungs','Pulmonology','#06B6D4','fitness','6 mL/kg Predicted Weight',
 'Ventilator lung injury is prevented by setting tidal volume based on PREDICTED Body Weight (PBW), not actual weight.',
 'Set initial Vt = 6 mL/kg PBW. Maintain plateau pressure Pplat < 30 cmH2O and driving pressure < 15 cmH2O.',
 'Using actual weight in obese patients leads to catastrophic barotrauma and massive inflammatory cytokine surge.',
 'ARDSNet ARMA Trial / ATS Guidelines',
 'Tidal volume in ARDS = 6 mL/kg PREDICTED body weight.','Pplat <30, driving pressure <15. Calculate IBW from height.','6 mL/kg Predicted Weight',true),

('pearl_lungs_2','COPD Exacerbation Steroid Ceiling','Evidence Pulmonology','lungs','Pulmonology','#06B6D4','leaf','Prednisone 40mg x 5 Days',
 '5 days of oral systemic steroids is non-inferior to 14 days and avoids high-dose immunosuppression and hyperglycemia.',
 'Prescribe Prednisone 40 mg PO once daily for exactly 5 days with bronchodilators and targeted antibiotics if purulent sputum.',
 'Do not extend corticosteroid courses beyond 5 days; it increases re-hospitalization without symptom benefit.',
 'GOLD 2024 / REDUCE Trial',
 '5-day prednisolone = 14-day prednisolone in COPD exacerbation.','Prednisone 40mg x 5 days. Add azithromycin if purulent sputum.','Prednisone 40mg x 5 Days',true),

-- GASTROENTEROLOGY
('pearl_git_1','Variceal Bleed Antibiotic Mandate','Hepatology Emergency','git','Gastroenterology','#10B981','restaurant','Ceftriaxone 1g IV Daily',
 'Bacterial translocation occurs in up to 50% of cirrhotic GI bleeds; early antibiotics slash 30-day mortality by >50%.',
 'Start Ceftriaxone 1g IV daily immediately upon triage, along with Octreotide 50mcg IV bolus + 50mcg/hr infusion.',
 'Delaying antibiotics until endoscopic confirmation significantly increases recurrent hemorrhage and fatal bacteremia.',
 'AASLD / Baveno VII Consensus',
 'Cirrhotics with GI bleed MUST get prophylactic antibiotics.','Ceftriaxone 1g IV daily + Octreotide infusion. Start in triage.','Ceftriaxone 1g IV Daily',true),

('pearl_git_2','Acute Pancreatitis Early Enteral Diet','Clinical Nutrition','git','Gastroenterology','#10B981','nutrition','Oral Diet within 24h',
 'Early enteral feeding protects the gut mucosal barrier, preventing gut bacterial translocation and infected necrosis.',
 'Initiate low-fat solid or liquid oral diet as soon as nausea and abdominal pain improve, regardless of lipase levels.',
 'Prolonged NPO (bowel rest) and TPN increase infectious complications, ICU stay, and mortality.',
 'ACG Guidelines / PANTER & PYTHON Trials',
 'Feed pancreatitis patients early — NPO increases complications.','Low-fat oral diet as tolerated within 24h. Lipase level does not matter.','Oral Diet within 24h',true),

-- DERMATOLOGY
('pearl_skin_1','Anaphylaxis IM Thigh Epinephrine','Emergency Allergy','skin','Dermatology','#EC4899','body','0.3-0.5mg IM (1:1,000)',
 'Intramuscular injection into the mid-anterolateral thigh achieves peak plasma levels in 8 min vs >34 min subcutaneously.',
 'Inject Epinephrine 1:1,000 (0.3-0.5 mL) IM into anterolateral thigh immediately. Repeat q5-15 min for refractory symptoms.',
 'Never substitute antihistamines or steroids as first-line therapy; they do not reverse airway edema or shock.',
 'WAO / EAACI Anaphylaxis Guidelines',
 'Epinephrine IM thigh — not SC, not deltoid.','0.3-0.5mg IM anterolateral thigh. Antihistamines are NEVER first-line.','0.3-0.5mg IM (1:1,000)',true),

('pearl_skin_2','SCORTEN in SJS / TEN Transfer','Dermatology ICU','skin','Dermatology','#EC4899','bandage','SCORTEN >= 3 = ICU/Burn',
 'Calculate SCORTEN within the first 24 hours of admission to assess epidermal detachment risk and predict mortality.',
 'Evaluate 7 criteria (Age, HR, Malignancy, Detachment >10%, Urea, Glucose, Bicarbonate). Score >=3 mandates Burn ICU transfer.',
 'Do not manage extensive epidermal necrosis in general wards without specialized fluid and barrier wound care.',
 'BAD Guidelines / SCORTEN Consensus',
 'SCORTEN >=3 in TEN = immediate Burn ICU transfer.','Calculate within 24h. Stop culprit drug immediately.','SCORTEN >= 3 = ICU/Burn',true),

-- OB/GYN
('pearl_gyn_1','Severe Preeclampsia Magnesium','Obstetric Emergency','gynacology','OB/GYN','#F97316','woman','4-6g IV Loading Dose',
 'Magnesium Sulfate is the definitive seizure prophylaxis drug of choice; it is NOT an antihypertensive agent.',
 'Loading: 4-6 g IV over 15-20 min, then 1-2 g/hr maintenance. Keep 10% Calcium Gluconate 1g IV bedside for loss of patellar reflexes.',
 'Do not withhold magnesium in severe features (BP >=160/110, platelets <100k, visual disturbances, epigastric pain).',
 'ACOG Practice Bulletin No. 222',
 'MgSO4 prevents eclampsia — it is NOT an antihypertensive.','4-6g loading, 1-2g/hr maintenance. Calcium gluconate antidote bedside.','4-6g IV Loading Dose',true),

('pearl_gyn_2','Postpartum Hemorrhage Stepwise 4Ts','Obstetric Resuscitation','gynacology','OB/GYN','#F97316','medkit','Blood Loss > 1000 mL',
 'Assess the 4Ts (Tone 70%, Trauma 20%, Tissue 10%, Thrombin 1%) and advance uterotonics rapidly in sequence.',
 'Oxytocin 10-40 IU then Methylergonovine 0.2mg IM (Avoid in HTN) then Carboprost 250mcg IM (Avoid in Asthma) then Misoprostol 800mcg.',
 'Do not delay surgical or tamponade intervention if 2nd-line uterotonics fail to achieve uterine tone within 15 minutes.',
 'ACOG / WHO Postpartum Guidelines',
 'PPH 4Ts: Tone, Trauma, Tissue, Thrombin. Advance uterotonics in sequence.','Oxytocin then Methylergonovine then Carboprost then Misoprostol. Then surgery.','Blood Loss > 1000 mL',true),

-- ADVANCED EMERGENCY & RESUSCITATION
('pearl_cardio_4','WPW with Pre-Excited AFib','Emergency Arrhythmia','heart','Cardiology','#FF6B6B','pulse','Avoid AV Nodal Blockers',
 'AV nodal blockers (Adenosine, Beta-blockers, CCBs, Digoxin) force chaotic conduction down the accessory pathway into fatal VFib.',
 'Perform emergent synchronized cardioversion if unstable. If stable, administer IV Procainamide 20-50 mg/min or Ibutilide.',
 'Never give Adenosine or Diltiazem for irregular wide-complex tachycardia — it precipitates ventricular fibrillation and arrest.',
 'AHA/ACC/HRS Arrhythmia Guidelines 2023',
 'AV blockers in WPW + AFib cause VFib. Use Procainamide or shock.','Cardioversion or Procainamide. Never give adenosine/diltiazem.','Avoid AV Nodal Blockers',true),

('pearl_kidney_1','Hyperkalemia Membrane Stabilization','Emergency Electrolytes','kidneys','Nephrology','#00D2D3','flash','10% Calcium Gluconate 10mL',
 'IV Calcium stabilizes the myocardial cardiac membrane threshold within 1-3 minutes; it does NOT lower serum potassium levels.',
 'Administer 10% Calcium Gluconate 10-20 mL IV over 2-3 mins (repeat in 5 mins if ECG unchanged). Then initiate shift therapy (Insulin + D50).',
 'Assuming calcium lowers potassium or omitting repeat doses when peaked T waves and widened QRS persist.',
 'KDIGO Clinical Practice Guideline 2024',
 'Calcium protects the heart in 2 mins; it does not eliminate K+.','Give IV Calcium first, then regular insulin 10U + 50g Dextrose.','10% Calcium Gluconate 10mL',true),

('pearl_kidney_2','Osmotic Demyelination Hyponatremia','Neuro-Nephrology','kidneys','Nephrology','#00D2D3','water','Max 8 mEq/L in 24h',
 'Overly rapid correction of chronic hyponatremia (>8 mEq/L in 24h) causes irreversible pontine osmotic demyelination syndrome (ODS).',
 'In severe symptomatic hyponatremia (seizures/coma), infuse 3% Hypertonic Saline 100 mL IV over 10 min (up to 3x) targeting 4-6 mEq/L rise.',
 'Using 0.9% Normal Saline for chronic SIADH causes unpredictable, rapid overcorrection and brainstem damage.',
 'European Clinical Practice Hyponatremia Guidelines',
 'Never correct Na+ faster than 8 mEq/L per 24 hours.','Use 3% Saline boluses for seizures, target max 8 mEq/L rise per day.','Max 8 mEq/L in 24h',true),

('pearl_neuro_3','Stroke Blood Pressure before tPA','Acute Stroke Protocol','brain','Neurology','#9B51E0','flash','BP < 185/110 mmHg',
 'Thrombolysis with Alteplase/Tenecteplase is contraindicated if blood pressure exceeds 185/110 mmHg due to fatal intracerebral hemorrhage.',
 'Administer IV Nicardipine infusion 5-15 mg/hr or Labetalol 10-20 mg IV push to achieve BP <185/110 before administering lytic therapy.',
 'Administering IV thrombolytics before lowering systolic pressure below 185 mmHg causes catastrophic intracranial bleeding.',
 'AHA/ASA Stroke Guidelines 2024',
 'BP MUST be <185/110 before administering IV thrombolytics.','Titrate IV Nicardipine or Labetalol before tPA.','BP < 185/110 mmHg',true),

('pearl_neuro_4','Status Epilepticus Benchmark Minute 5-10','Neuro-Critical Care','brain','Neurology','#9B51E0','alarm','Lorazepam 4mg IV at 5 Min',
 'Neuronal injury and GABA receptor downregulation begin after 5 minutes of continuous seizure activity, making delayed therapy ineffective.',
 'Minute 0-5: Lorazepam 4 mg IV (or Midazolam 10 mg IM). Minute 5-10: Repeat once. Minute 10-20: Levetiracetam 60 mg/kg IV (max 4500 mg).',
 'Underdosing benzodiazepines (giving 1-2 mg lorazepam) fails to terminate seizures and promotes pharmacoresistance.',
 'AES Status Epilepticus Guidelines',
 'Underdosing benzos causes refractory status. Give 4mg Lorazepam.','Full dose benzo early, then IV Levetiracetam 60mg/kg.','Lorazepam 4mg IV at 5 Min',true),

('pearl_lungs_3','ARDS Prone Positioning Timing','Critical Care Ventilation','lungs','Pulmonology','#4ECDC4','bed','PaO2/FiO2 < 150 mmHg',
 'Early prolonged prone positioning (>=16 consecutive hours/day) reduces 28-day mortality by 50% in moderate-to-severe ARDS.',
 'Initiate prone positioning within 24-36 hours of diagnosis when PaO2/FiO2 ratio remains <150 mmHg with PEEP >=10 cmH2O.',
 'Reserving prone positioning as a last-resort rescue maneuver after extensive ventilator-induced lung injury (VILI) has already occurred.',
 'PROSEVA Study / ATS Guidelines',
 'Prone position >=16 hours/day early when PaO2/FiO2 <150.','Initiate early prone positioning within 36 hours.','PaO2/FiO2 < 150 mmHg',true),

('pearl_lungs_4','Severe Asthma Magnesium Sulfate','Airway Resuscitation','lungs','Pulmonology','#4ECDC4','medkit','2g IV over 20 Mins',
 'IV Magnesium sulfate produces bronchial smooth muscle relaxation by inhibiting calcium influx in refractory bronchospasm.',
 'Administer Magnesium Sulfate 2 g IV in 100 mL D5W over 20 minutes in patients failing continuous nebulized albuterol + ipratropium.',
 'Waiting until respiratory arrest or exhaustion before adding IV magnesium or systemic corticosteroids.',
 'GINA Asthma Guidelines 2024',
 'IV Magnesium 2g is safe, fast smooth muscle dilator in severe asthma.','2g IV in 20 min when inhaled bronchodilators fail.','2g IV over 20 Mins',true),

('pearl_surg_1','Tension Pneumothorax Clinical Decompression','Trauma Resuscitation','surgery','General Surgery','#E11D48','fitness','5th ICS Mid-Axillary',
 'Tension pneumothorax is a strictly clinical diagnosis of obstructive shock; waiting for radiological imaging is a fatal delay.',
 'Immediately perform needle thoracostomy with 14-gauge catheter at 5th intercostal space anterior to mid-axillary line (or 2nd ICS MCL).',
 'Sending an unstable, hypotensive patient with unilateral absent breath sounds and tracheal deviation to the CT scanner.',
 'ATLS 10th Edition / ACS-COT',
 'Decompress tension pneumothorax IMMEDIATELY. Never wait for CXR.','5th ICS mid-axillary needle decompression, then tube thoracostomy.','5th ICS Mid-Axillary',true),

('pearl_tox_1','Acetaminophen 4-Hour Nomogram','Clinical Toxicology','stomach','Toxicology','#FF9F43','flask','4-Hour APAP Level',
 'The Rumack-Matthew nomogram is valid ONLY for acute single ingestions measured between 4 and 24 hours post-ingestion.',
 'Administer IV N-Acetylcysteine (NAC) 150 mg/kg loading over 1h immediately if level exceeds the treatment line or if time of ingestion is >8h.',
 'Drawing APAP concentration before 4 hours post-ingestion leads to falsely low levels before complete gastrointestinal absorption.',
 'Abtract Toxicological Consensus / AACT',
 'Rumack nomogram valid only at >=4 hours. Give NAC before 8 hours.','Level at 4h. Give NAC immediately if line exceeded.','4-Hour APAP Level',true),

('pearl_peds_1','Pediatric Croup Single Dexamethasone','Pediatric Airway','children','Pediatrics','#F368E0','happy','0.6 mg/kg Oral / IM',
 'A single dose of Dexamethasone reduces hospitalization rates, return visits, and epinephrine requirements in all croup severities.',
 'Administer Dexamethasone 0.6 mg/kg (max 16 mg) PO or IM. In moderate-to-severe stridor at rest, add nebulized racemic epinephrine 0.5 mL.',
 'Discharging a child within 2 hours of racemic epinephrine without observing for rebound mucosal edema and bronchospasm.',
 'AAP Croup Clinical Guidelines',
 'Single dose Dexamethasone 0.6mg/kg for all croup. Observe post-epi.','Dexamethasone 0.6 mg/kg single dose PO. Nebulized epinephrine if stridor.','0.6 mg/kg Oral / IM',true)

ON CONFLICT (id) DO UPDATE SET
  rule       = EXCLUDED.rule,
  action     = EXCLUDED.action,
  pitfall    = EXCLUDED.pitfall,
  badge      = EXCLUDED.badge,
  is_active  = EXCLUDED.is_active,
  title      = EXCLUDED.title,
  category   = EXCLUDED.category,
  takeaway   = EXCLUDED.takeaway,
  pearl      = EXCLUDED.pearl;

-- Verify: should return 28 rows
SELECT id, title, specialty_name, is_active FROM public.clinical_pearls ORDER BY specialty_id, id;
