import { Ionicons } from '@expo/vector-icons';

export type SurgeryCategoryItem = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
  keyPoints: string[];
  casesOrExamples: {
    name: string;
    detail: string;
    protocol: string;
  }[];
  instruments?: string[];
  clinicalPearls: string;
  aiPrompt: string;
};

export type MedicineSpecialtyItem = {
  id: string;
  name: string;
  scientificName: string;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  scope: string;
  corePillars: string[];
  highYieldTopics: {
    title: string;
    summary: string;
    guideline: string;
  }[];
  clinicalPearls: string;
  aiPrompt: string;
};

// ==========================================
// 1. SURGICAL SUITE DATA
// ==========================================
export const SURGERY_CATEGORIES: SurgeryCategoryItem[] = [
  {
    id: 'surgical_cases',
    title: 'Operative Cases & Scenarios',
    subtitle: 'Acute Abdomen, Bowel Ischemia, Trauma & Biliary Emergencies',
    badge: 'SURGICAL CASES',
    icon: 'bandage-outline',
    color: '#eb988a', // Rose
    description: 'High-yield surgical admissions, triage decision pathways, emergent operative indications, and acute abdominal pain protocols.',
    keyPoints: [
      'Immediate evaluation of peritonitis and peritoneal signs (rebound, involuntary guarding, rigidity)',
      'Cross-sectional contrast CT abdomen/pelvis timing & lactate monitoring',
      'Operating Room (OR) timing: Emergent (<2h) vs Urgent (<24h) vs Elective',
      'Antibiotic source control and surgical resuscitation'
    ],
    casesOrExamples: [
      {
        name: 'Acute Appendicitis (Alvarado & AIR Score)',
        detail: 'Periumbilical pain migrating to RLQ (McBurney point), anorexia, leukocytosis with left shift.',
        protocol: 'Laparoscopic Appendectomy within 12-24 hours. Pre-op single dose IV Cefoxitin 2g or Cipro + Flagyl.'
      },
      {
        name: 'Acute Gangrenous Cholecystitis',
        detail: 'RUQ tenderness (Murphy sign), fever, leukocytosis, pericholecystic fluid, sonographic wall thickening >4mm.',
        protocol: 'Urgent Laparoscopic Cholecystectomy (<72h of symptom onset). Tokyo Guidelines Grade I/II triage.'
      },
      {
        name: 'Small Bowel Obstruction (SBO)',
        detail: 'Obstipation, colicky pain, vomiting, dilated bowel loops (>3cm), transition point on CT.',
        protocol: 'NPO, NG tube decompression, IV fluids. Emergent laparotomy if closed-loop, strangulation, or peritonitis.'
      },
      {
        name: 'Perforated Peptic Ulcer & Free Air',
        detail: 'Sudden catastrophic epigastric pain, pneumoperitoneum under diaphragm on upright CXR/CT.',
        protocol: 'Immediate resuscitation, IV PPI infusion, emergent laparotomy with Graham Patch (omental plug) repair.'
      }
    ],
    instruments: ['Laparoscopic Trocar Set (5mm/10mm/12mm)', 'Babcock Grasper', 'Maryland Dissector', 'Endo-Catch Retrieval Bag'],
    clinicalPearls: 'Never delay operating room transport for serial imaging if the patient displays overt peritonitis with hemodynamic instability (free rupture/perforation requires immediate surgical exploration).',
    aiPrompt: 'Provide an evidence-based surgical management protocol and operative decision workflow for acute surgical cases including acute abdomen, appendicitis, cholecystitis, and bowel obstruction.'
  },
  {
    id: 'operative_steps',
    title: 'Operative Steps & Techniques',
    subtitle: 'Stepwise Dissection, Critical Safety Views & Anastomoses',
    badge: 'OPERATIVE STEPS',
    icon: 'cut-outline',
    color: '#f6dda2', // Luminous Mint
    description: 'Precise chronological surgical dissection stages, anatomical landmark identification, critical views of safety, and closure techniques.',
    keyPoints: [
      'Patient positioning, skin prep (ChloraPrep 2%), and surgical timeout',
      'Trocar placement ergonomics and initial optical entry (Hasson vs Veress vs Optical)',
      'Dissection planes and mandatory anatomical landmark verification',
      'Fascial closure techniques (4:1 suture-to-wound length ratio with PDS/Prolene)'
    ],
    casesOrExamples: [
      {
        name: 'Laparoscopic Cholecystectomy (Critical View of Safety)',
        detail: 'Clearance of Calot triangle: 1. Hepatocystic triangle cleared of fat/fibrous tissue; 2. Lower third of gallbladder dissected off cystic plate; 3. Only TWO structures seen entering gallbladder (cystic duct & cystic artery).',
        protocol: 'Verify Critical View of Safety (Strasberg) before clipping or cutting any structure. If unclear, perform subtotal fenestrating cholecystectomy.'
      },
      {
        name: 'Lichtenstein Inguinal Hernioplasty',
        detail: 'Oblique groin incision, open external oblique aponeurosis, identify and preserve ilioinguinal & genital nerves, mobilize spermatic cord, reduce/ligate sac, place polypropylene mesh.',
        protocol: 'Fix mesh to pubic tubercle with 2cm medial overlap; slit mesh around cord and suture to inguinal ligament with running 2-0 Prolene.'
      },
      {
        name: 'Laparoscopic Appendectomy',
        detail: 'Pneumoperitoneum at 12-15 mmHg, 10mm umbilical + two 5mm lower abdominal ports, mobilize cecum, skeletonize mesoappendix with bipolar/harmonic, base ligated with Endoloops or Endo-GIA stapler.',
        protocol: 'Inspect appendiceal base for cecal involvement (if involved, perform partial cecectomy). Extract in specimen bag.'
      },
      {
        name: 'Exploratory Laparotomy & Mass Closure',
        detail: 'Midline incision through linea alba, four-quadrant abdominal packing, systematic small bowel run from ligament of Treitz to ileocecal valve.',
        protocol: 'Closure: Running continuous #1 PDS suture with 5mm bites and 5mm travel (small-bites technique, 4:1 suture-to-wound length ratio).'
      }
    ],
    instruments: ['Monopolar Hook Electrosurgery', 'Titanium Clip Applier', 'Endo GIA Stapler 45/60mm', 'Needle Driver & 2-0/3-0 Suture'],
    clinicalPearls: 'In laparoscopic cholecystectomy, never clip a tubular structure based on assumption; the Critical View of Safety requires clear visualization of the liver bed (cystic plate) above the dissection line.',
    aiPrompt: 'Describe the exact stepwise surgical technique, anatomical dissection planes, critical landmarks, and operative pitfalls for standard open and laparoscopic general surgery procedures.'
  },
  {
    id: 'instruments_energy',
    title: 'Surgical Instruments & Devices',
    subtitle: 'Scalpels, Energy Platforms, Retractors, Staplers & Sutures',
    badge: 'INSTRUMENTS & ENERGY',
    icon: 'hardware-chip-outline',
    color: '#877bf4', // Jewel Teal
    description: 'Operating room instrument inventory, scalpel blade mechanics, advanced bipolar & ultrasonic energy platforms, retractor sets, and suture selection.',
    keyPoints: [
      'Scalpel selection: #10 (large skin incisions), #11 (stab incisions/drainage), #15 (delicate precision incisions)',
      'Electrosurgery: Monopolar (cut vs coag current, ground pad safety) vs Bipolar',
      'Advanced Energy: Ultrasonic Harmonic Scalpel (55.5 kHz mechanical vibration) vs Advanced Bipolar (LigaSure vessel sealing up to 7mm)',
      'Suture Matrix: Absorbable (Vicryl, Monocryl, PDS) vs Non-Absorbable (Prolene, Silk, Nylon)'
    ],
    casesOrExamples: [
      {
        name: 'Retractor Systems & Exposure',
        detail: 'Self-retaining table-mounted Bookwalter & Balfour retractors provide deep pelvic/upper GI exposure; Army-Navy, Richardson, Deaver, and Senn retractors for layered soft tissue.',
        protocol: 'Pad retractor blades with moist lap sponges to prevent femoral/peroneal nerve compression and ischemic visceral injury.'
      },
      {
        name: 'Vessel Sealing & Energy Platforms',
        detail: 'Harmonic ACE+ cuts and coagulates simultaneously via ultrasonic friction (minimal lateral thermal spread <2mm). LigaSure uses impedance sensing for permanent vessel fusion.',
        protocol: 'Cool energy device tips against saline or moist sponges before touching adjacent bowel or ureters.'
      },
      {
        name: 'Suture & Needle Matrix',
        detail: 'Fascia: #1 PDS (slow absorbable loop). Bowel Anastomosis: 3-0/4-0 Vicryl inner mucosal + 3-0 Silk Lambert outer seromuscular. Skin: 4-0 Monocryl subcuticular or stainless steel clips.',
        protocol: 'Use tapered needles (RB-1, SH) for vascular/GI tissue to prevent tearing; cutting needles (FS-2, PS-2) for skin and dense tendon.'
      },
      {
        name: 'Endomechanical Staplers (Endo-GIA)',
        detail: 'Vascular/thin tissue (White/Grey 2.0-2.5mm), regular GI tissue (Blue 3.0-3.5mm), thick stomach/rectum (Gold/Green 3.8-4.8mm).',
        protocol: 'Always pre-compress tissue for 15 seconds before firing to eliminate fluid edema and ensure secure staple formation.'
      }
    ],
    instruments: ['Bookwalter Retractor', 'LigaSure Advance', 'Harmonic ACE+', 'Debakey Atraumatic Tissue Forceps', 'Metzenbaum Scissors'],
    clinicalPearls: 'Always match surgical staple cartridge color to target tissue thickness: firing a blue cartridge on thick fibrotic stomach risks tissue shear and catastrophic staple line dehiscence.',
    aiPrompt: 'Detail the comprehensive surgical instrument tray, scalpels, retractor systems, electrosurgical energy settings, and suture/staple selection algorithms in modern surgery.'
  },
  {
    id: 'postop_eras',
    title: 'Post-Op Critical Care & ERAS',
    subtitle: 'Enhanced Recovery, Drain Management, Post-Op Fever & SSI',
    badge: 'POST-OP & ERAS',
    icon: 'pulse-outline',
    color: '#b0afeb', // Lavender
    description: 'Enhanced Recovery After Surgery (ERAS) pathways, fluid balance, surgical drain output algorithms, post-op fever differential, and wound complications.',
    keyPoints: [
      'ERAS Protocols: Early multimodal non-opioid analgesia, early feeding within 24h, zero-balance IV fluids, and day 0 mobilization',
      'Post-Op Fever "5 Ws": Wind (Atelectasis d1-2), Water (UTI d3), Wound (SSI d5-7), Walking (DVT/PE d7+), Wonder drugs (dany)',
      'Surgical Site Infection (SSI) bundle: Weight-based pre-op antibiotics within 60 mins of incision, normothermia, glycemic target <180 mg/dL',
      'Drain Output Rules: Serosanguinous vs Purulent vs Bilious/Enteric (amylase/bilirubin drain testing)'
    ],
    casesOrExamples: [
      {
        name: 'Postoperative Ileus vs Early SBO',
        detail: 'Post-op ileus shows diffuse gas throughout small and large bowel without transition point, hypoactive sounds.',
        protocol: 'Discontinue IV opioids, initiate chewing gum, oral alvimopan (mu-opioid antagonist), minimize IV fluid overload, encourage early ambulation.'
      },
      {
        name: 'Surgical Drain Output & Removal',
        detail: 'Jackson-Pratt (JP) & Blake closed-suction drains. Test drain fluid for Amylase (pancreatic fistula if >3x serum) or Bilirubin (biliary leak).',
        protocol: 'Remove abdominal drains when output <30-50 mL/24h of clear serosanguinous fluid and patient tolerating solid diet.'
      },
      {
        name: 'Wound Dehiscence & Evisceration',
        detail: 'Sudden serosanguinous "salmon-colored" fluid gushing from midline incision between post-op day 5-8.',
        protocol: 'Cover eviscerated bowel with sterile saline-soaked gauze, administer IV analgesia and broad-spectrum antibiotics, transport immediately to operating room.'
      }
    ],
    instruments: ['Jackson-Pratt (JP) 100mL Bulb', 'Chest Tube Pleurovac Unit', 'Negative Pressure Wound VAC', 'Suture Removal Kit'],
    clinicalPearls: 'Salmon-pink watery drainage from a fresh abdominal surgical wound on post-op day 5 to 7 is pathognomonic for deep fascial dehiscence requiring immediate bedside sterile dressing and emergent OR repair.',
    aiPrompt: 'Explain post-operative critical care algorithms, ERAS pathways, post-op fever workups, drain output management, and surgical site infection prevention guidelines.'
  },
  {
    id: 'preop_risk',
    title: 'Pre-Op Risk & Perioperative Clearance',
    subtitle: 'ASA Staging, Cardiac RCRI, Airway Mallampati & Anticoagulation Bridging',
    badge: 'PRE-OP RISK',
    icon: 'shield-checkmark-outline',
    color: '#eb988a', // Rose
    description: 'Systematic preoperative risk stratification, revised cardiac risk index (RCRI), pulmonary risk (ARISCAT), difficult airway screening, and anticoagulant interruption.',
    keyPoints: [
      'ASA Physical Status (I to VI and Emergent E designation)',
      'Lee Revised Cardiac Risk Index (RCRI: High-risk surgery, Ischemic heart disease, CHF, Cerebrovascular disease, Insulin therapy, Creatinine >2.0 mg/dL)',
      'Mallampati Airway Classification (Class I to IV) and LEMON difficult intubation criteria',
      'Anticoagulation / Antiplatelet Interruption: Warfarin (hold 5d, target INR <1.5), DOACs (hold 24-48h based on CrCl), Aspirin (continue unless high bleeding risk neuro/eye surgery)'
    ],
    casesOrExamples: [
      {
        name: 'Pre-Op Cardiac Risk Assessment',
        detail: 'Functional capacity measured in METs (>4 METs = climbing 2 flights of stairs without stopping).',
        protocol: 'If RCRI \u22652 or METs <4 with high-risk surgery, obtain preoperative 12-lead ECG, NT-proBNP, and cardiology consultation for pharmacologic stress testing.'
      },
      {
        name: 'Anticoagulation Bridging Protocol',
        detail: 'High thrombotic risk (Mechanical mitral valve, AFib CHA2DS2-VASc \u22657, recent VTE <3 months): Bridge with therapeutic LMWH (Enoxaparin 1 mg/kg SC BID).',
        protocol: 'Stop LMWH 24 hours prior to surgery. Resume LMWH 24-48 hours post-op once surgical hemostasis is secured.'
      }
    ],
    clinicalPearls: 'Never hold beta-blockers on the morning of surgery in chronically treated patients (abrupt cessation causes rebound tachycardia and intraoperative myocardial infarction); do NOT initiate de novo high-dose beta-blockers on the day of surgery.',
    aiPrompt: 'Provide a structured preoperative clinical evaluation, ASA physical classification, RCRI cardiac risk algorithm, and perioperative anticoagulation management guide.'
  },
  {
    id: 'damage_control',
    title: 'Emergency & Damage Control Surgery',
    subtitle: 'Lethal Triad, Trauma Laparotomy, FAST & Massive Transfusion',
    badge: 'DAMAGE CONTROL',
    icon: 'flame-outline',
    color: '#877bf4', // Jewel Teal
    description: 'Resuscitation in catastrophic hemorrhage, abrogation of the "Lethal Triad" (Hypothermia, Acidosis, Coagulopathy), and rapid abbreviated operative staging.',
    keyPoints: [
      'Damage Control Surgery Principle: Abbreviated initial laparotomy (<60-90 mins) to control hemorrhage and contamination, followed by ICU resuscitation and definitive second-look repair',
      'The Trauma Lethal Triad: Body temp <35\u00b0C, pH <7.20, and progressive coagulopathy',
      'Massive Transfusion Protocol (MTP): Balanced 1:1:1 ratio (Packed Red Blood Cells : Fresh practical Frozen Plasma : Platelets) + Tranexamic Acid (TXA 1g IV within 3h of injury)',
      'FAST Ultrasound: 4 views (Pericardial, RUQ Morison pouch, LUQ Splenorenal, Pelvic pouch of Douglas)'
    ],
    casesOrExamples: [
      {
        name: 'Damage Control Laparotomy Stages',
        detail: 'Stage 1: Four-quadrant packing, rapid splenectomy/packing, stapled bowel resection without anastomosis, temporary abdominal closure (AbThera/Bogota bag). Stage 2: ICU re-warming and correction of coagulopathy. Stage 3: Return to OR in 24-48h for definitive reconstruction.',
        protocol: 'Do NOT attempt complex reconstructions or bowel anastomoses in a cold, acidotic, coagulopathic trauma patient.'
      },
      {
        name: 'Tube Thoracostomy (Chest Tube Insertion)',
        detail: '4th or 5th intercostal space anterior to mid-axillary line ("Safe Triangle"). Blunt dissection over the rib superior border into pleural space.',
        protocol: 'Emergent Thoracotomy Indication: >1500 mL immediate initial blood output OR >200 mL/hr continuous output for 2-4 consecutive hours.'
      }
    ],
    instruments: ['Vascular Satinsky Clamps', 'AbThera Open Abdomen Dressing', 'Chest Tube 28-36 Fr', 'Rapid Blood Infuser (Belmont/Level 1)'],
    clinicalPearls: 'In trauma hemorrhage, administer Tranexamic Acid (TXA) 1g IV bolus within 3 hours of injury (CRASH-2 trial); administration after 3 hours increases mortality due to vascular thrombosis.',
    aiPrompt: 'Outline the principles of Damage Control Surgery, trauma resuscitation, management of the lethal triad, and massive transfusion protocols.'
  }
];

// ==========================================
// 2. EXPANDED MEDICAL SPECIALTIES DATA
// ==========================================
export const EXPANDED_MEDICINE_SPECIALTIES: MedicineSpecialtyItem[] = [
  {
    id: 'nephrology',
    name: 'Nephrology',
    scientificName: 'Nephrology & Renal Medicine',
    badge: 'NEPHROLOGY',
    icon: 'water-outline',
    color: '#f6dda2', // Mint
    scope: 'Acute kidney injury staging, dialysis indications, glomerular diseases, fluid/electrolyte management, and resistant hypertension.',
    corePillars: ['KDIGO AKI Staging', 'Urgent Dialysis "AEIOU"', 'Acid-Base & Potassium Emergencies', 'Nephrotic vs Nephritic Syndromes'],
    highYieldTopics: [
      {
        title: 'Acute Kidney Injury (KDIGO Staging)',
        summary: 'Stage 1: SCr 1.5-1.9x baseline or urine <0.5 mL/kg/h for 6-12h. Stage 2: SCr 2.0-2.9x baseline. Stage 3: SCr \u22653.0x baseline, SCr \u22654.0 mg/dL, or initiation of RRT.',
        guideline: '2023 KDIGO AKI Clinical Practice Guidelines'
      },
      {
        title: 'Urgent Dialysis Indications ("AEIOU")',
        summary: 'A - Intractable metabolic Acidosis (pH <7.15); E - Refractory Electrolytes (severe Hyperkalemia >6.5 mEq/L with ECG changes); I - Ingestions/Toxins (SLIME: Salicylates, Lithium, Isopropanol, Methanol, Ethylene glycol); O - Volume Overload refractory to diuretics; U - Symptomatic Uremia (pericarditis, encephalopathy, bleeding).',
        guideline: 'Critical Care Nephrology Consensus'
      },
      {
        title: 'Severe Hyperkalemia Management',
        summary: 'Step 1 (Membrane Stabilization): IV Calcium Gluconate 10% 10-20 mL over 3 mins; Step 2 (Intracellular Shift): Regular Insulin 10 units IV + D50W 50 mL + Albuterol 10-20 mg nebulized; Step 3 (Elimination): IV Furosemide, Patiromer/Lokelma, or Emergent Hemodialysis.',
        guideline: 'AHA Emergency Cardiovascular Care Guidelines'
      }
    ],
    clinicalPearls: 'IV Calcium stabilizes cardiac myocyte membranes in severe hyperkalemia within 1-3 minutes but does NOT lower serum potassium; always immediately pair calcium with shifting agents (Insulin/D50) and elimination therapy.',
    aiPrompt: 'Provide an evidence-based clinical guide on Nephrology topics including AKI KDIGO staging, dialysis indications, severe hyperkalemia, and acid-base disturbances.'
  },
  {
    id: 'endocrinology',
    name: 'Endocrinology',
    scientificName: 'Endocrinology & Metabolism',
    badge: 'ENDOCRINOLOGY',
    icon: 'speedometer-outline',
    color: '#eb988a', // Rose
    scope: 'Diabetic emergencies, thyroid crisis, adrenal insufficiency, pituitary disorders, and inpatient glycemic control algorithms.',
    corePillars: ['DKA & HHS Protocols', 'Thyroid Storm (Burch-Wartofsky)', 'Adrenal Crisis & Stress Dosing', 'Hypercalcemia & Parathyroid Crisis'],
    highYieldTopics: [
      {
        title: 'Diabetic Ketoacidosis (DKA) Management',
        summary: 'Diagnostic Triad: Hyperglycemia (>250 mg/dL), Anion gap acidosis (>12 mEq/L, pH <7.30, HCO3 <18), Ketonemia. Initial therapy: Isotonic Saline 1-1.5 L/hr + Regular Insulin IV infusion 0.1 units/kg/hr. DO NOT give insulin if K+ <3.3 mEq/L. Add D5W when glucose <200 mg/dL.',
        guideline: '2024 ADA Standards of Care in Diabetes'
      },
      {
        title: 'Thyroid Storm (Burch-Wartofsky Score \u226545)',
        summary: 'Quadruple Therapy: 1. Beta-blockade: Propranolol 60-80 mg PO q4h or IV Esmolol; 2. Thionamide: Propylthiouracil (PTU) 500-1000 mg loading then 200 mg q4h (blocks peripheral T4->T3 conversion); 3. Iodine Solution (Lugol / SSKI) given 1 HOUR AFTER thionamide; 4. Glucocorticoid: IV Hydrocortisone 100 mg q8h.',
        guideline: '2023 American Thyroid Association Guidelines'
      },
      {
        title: 'Acute Adrenal Crisis',
        summary: 'Refractory hypotension, hypoglycemia, hyponatremia, hyperkalemia. Immediate treatment: IV Hydrocortisone 100 mg stat bolus followed by 50-100 mg IV q6-8h + Rapid D5NS fluid resuscitation. Do not wait for cortisol lab results before treating.',
        guideline: 'Endocrine Society Clinical Practice Guidelines'
      }
    ],
    clinicalPearls: 'In Thyroid Storm, never administer Iodine solution before or simultaneously with the antithyroid drug (PTU/Methimazole); giving iodine first provides substrate for new hormone synthesis and exacerbates the crisis. Wait at least 1 hour after PTU.',
    aiPrompt: 'Provide comprehensive diagnostic and therapeutic guidelines in Endocrinology, covering DKA/HHS protocols, thyroid storm, adrenal crisis, and hypercalcemia.'
  },
  {
    id: 'critical_care',
    name: 'Critical Care',
    scientificName: 'Emergency & Critical Care Medicine',
    badge: 'CRITICAL CARE',
    icon: 'medkit-outline',
    color: '#877bf4', // Jewel Teal
    scope: 'Undifferentiated shock, mechanical ventilation protocols, rapid sequence intubation, hemodynamic monitoring, and ICU sedation/paralysis.',
    corePillars: ['RUSH Shock Ultrasound Protocol', 'RSI Airway & Hemodynamic Optimization', 'ARDS Lung-Protective Ventilation', 'Vasoactive Agent Titration Matrix'],
    highYieldTopics: [
      {
        title: 'Undifferentiated Shock (RUSH Protocol)',
        summary: 'The Rapid Ultrasound in Shock (RUSH) examines: 1. The Pump (cardiac contractility, tamponade, RV strain); 2. The Tank (IVC collapsibility, Morison pouch, lung B-lines/pneumothorax); 3. The Pipes (aortic aneurysm, DVT).',
        guideline: 'SCCM Critical Care Ultrasound Consensus'
      },
      {
        title: 'Rapid Sequence Intubation (RSI) in Shock',
        summary: 'Avoid induction hemodynamics collapse: Pre-oxygenate with flush-rate O2. Induction agent: Etomidate (0.2-0.3 mg/kg) or Ketamine (1-2 mg/kg). Paralytic: Rocuronium (1.2 mg/kg) or Succinylcholine (1.5 mg/kg). Start low-dose push-dose vasopressor proactively.',
        guideline: 'Difficult Airway Society (DAS) Guidelines'
      },
      {
        title: 'Vasoactive Infusion Selection',
        summary: 'First-line Sepsis/Distributive: Norepinephrine (0.05-0.5 mcg/kg/min). Add Vasopressin (0.03 U/min). Cardiogenic Shock: Norepinephrine + Dobutamine (2.5-20 mcg/kg/min) or Milrinone. Anaphylactic Shock: IM Epinephrine (0.3-0.5 mg 1:1,000) then IV infusion.',
        guideline: 'Surviving Sepsis Campaign Guidelines'
      }
    ],
    clinicalPearls: 'During RSI in critically ill, hypotensive patients, always reduce the induction sedative dose by 50% while maintaining or increasing the neuromuscular blockade dose to prevent catastrophic peri-intubation cardiovascular collapse.',
    aiPrompt: 'Provide evidence-based clinical algorithms for Critical Care Medicine including undifferentiated shock, mechanical ventilation, RSI in hemodynamically unstable patients, and inotrope/vasopressor titration.'
  },
  {
    id: 'hematology_oncology',
    name: 'Hematology',
    scientificName: 'Hematology & Medical Oncology',
    badge: 'HEME / ONC',
    icon: 'fitness-outline',
    color: '#b0afeb', // Lavender
    scope: 'Febrile neutropenia, oncologic emergencies, sickle cell vaso-occlusive crisis, coagulation disorders, and transfusion medicine.',
    corePillars: ['Febrile Neutropenia MASCC Score', 'Tumor Lysis Syndrome (Cairo-Bishop)', 'Heparin-Induced Thrombocytopenia (4Ts)', 'Anticoagulant Reversal Agents'],
    highYieldTopics: [
      {
        title: 'Febrile Neutropenia Emergency',
        summary: 'Definition: Single oral temp \u226538.3\u00b0C (101\u00b0F) with Absolute Neutrophil Count (ANC) <500 cells/\u00b5L. Immediate empiric anti-pseudomonal monotherapy (Cefepime 2g IV q8h, Piperacillin-Tazobactam 4.5g IV q6h, or Meropenem 1g IV q8h) within 60 minutes of arrival.',
        guideline: '2023 ASCO/IDSA Clinical Practice Guideline'
      },
      {
        title: 'Tumor Lysis Syndrome (TLS)',
        summary: 'Metabolic abnormalities: Hyperuricemia (>8 mg/dL), Hyperkalemia (>6.0 mEq/L), Hyperphosphatemia (>4.5 mg/dL), Hypocalcemia (<7.0 mg/dL). Prevention/Treatment: Aggressive IV hydration (2.5-3 L/m\u00b2/day) + Allopurinol (prevention) or Rasburicase 0.2 mg/kg IV (active lysis/high uric acid).',
        guideline: 'Cairo-Bishop TLS Classification & Guidelines'
      },
      {
        title: 'Heparin-Induced Thrombocytopenia (HIT)',
        summary: '4Ts Score (Thrombocytopenia >50% drop, Timing d5-10, Thrombosis, oTher causes). If score \u22654: Stop all heparin products immediately, order Anti-PF4/Heparin ELISA, and initiate non-heparin anticoagulation (Argatroban 2 mcg/kg/min or Fondaparinux).',
        guideline: '2022 American Society of Hematology (ASH) Guidelines'
      }
    ],
    clinicalPearls: 'Never administer Platelet transfusions in Heparin-Induced Thrombocytopenia (HIT) or Thrombotic Thrombocytopenic Purpura (TTP); transfusing platelets "fuels the fire" and precipitates fatal arterial and venous thrombosis.',
    aiPrompt: 'Detail hematology and oncology emergency protocols including febrile neutropenia, tumor lysis syndrome, HIT evaluation, and anticoagulant reversal.'
  },
  {
    id: 'rheumatology',
    name: 'Rheumatology',
    scientificName: 'Rheumatology & Autoimmune Diseases',
    badge: 'RHEUMATOLOGY',
    icon: 'body-outline',
    color: '#eb988a', // Rose
    scope: 'Autoimmune connective tissue diseases, inflammatory arthritis, vasculitis syndromes, lupus flares, and biologic DMARD safety protocols.',
    corePillars: ['Lupus Nephritis & SLE Flares', 'Giant Cell Arteritis & PMR', 'Acute Monoarthritis (Gout vs Septic)', 'ANCA-Associated Vasculitis'],
    highYieldTopics: [
      {
        title: 'Giant Cell Arteritis (Temporal Arteritis)',
        summary: 'Age >50, new headache, scalp tenderness, jaw claudication, visual changes, ESR >50 mm/h. Emergency Treatment: Immediate IV Methylprednisolone 1g daily x 3 days (if visual symptoms) or Oral Prednisone 60 mg daily to prevent permanent irreversible blindness. Schedule temporal artery biopsy within 1-2 weeks.',
        guideline: '2021 ACR/Vasculitis Foundation Guideline'
      },
      {
        title: 'Acute Monoarthritis Workup',
        summary: 'Mandatory Arthrocentesis prior to antibiotics: Synovial fluid analysis for WBC count, differential, Gram stain, and polarized light microscopy (Monosodium urate needle crystals: negatively birefringent; CPPD rhomboid crystals: positively birefringent). Synovial WBC >50,000/\u00b5L with >90% PMNs = treat as Septic Arthritis until cultures negative.',
        guideline: 'ACR Gout & Septic Joint Guidelines'
      }
    ],
    clinicalPearls: 'Never delay systemic corticosteroid therapy in suspected Giant Cell Arteritis while waiting for a temporal artery biopsy; histological features persist on biopsy for up to 2-4 weeks after steroid initiation, and treatment prevents contralateral vision loss.',
    aiPrompt: 'Provide diagnostic and treatment protocols for rheumatology emergencies, including Giant Cell Arteritis, acute septic vs crystal arthritis, and systemic lupus flares.'
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    scientificName: 'Pediatrics & Neonatal Medicine',
    badge: 'PEDIATRICS',
    icon: 'happy-outline',
    color: '#f6dda2', // Mint
    scope: 'Pediatric emergency resuscitation, weight-based calculations, pediatric infectious diseases, respiratory distress, and neonatology milestones.',
    corePillars: ['PALS Resuscitation & Broselow', 'Pediatric Fluid & Electrolyte Dosing', 'Febrile Infant Protocol (<60 days)', 'Croup (Westley) vs Epiglottitis'],
    highYieldTopics: [
      {
        title: 'Febrile Infant Workup (<60 Days Old)',
        summary: 'Infants <28 days: Full sepsis workup (CBC, Blood cultures, Urinalysis/Urine culture via catheter, Lumbar Puncture CSF) + Hospitalize on IV Ampicillin (for Listeria) + Ceftazidime/Gentamicin. Infants 29-60 days: Stratify by PECARN or Step-by-Step criteria (Procalcitonin, CRP, UA).',
        guideline: '2021 AAP Clinical Practice Guideline on Febrile Infants'
      },
      {
        title: 'Croup vs Epiglottitis Management',
        summary: 'Croup (Laryngotracheobronchitis): Barking "seal-like" cough, stridor, steeple sign on AP neck X-ray. Treatment: Oral Dexamethasone 0.6 mg/kg single dose + Nebulized Racemic Epinephrine 0.5 mL (if stridor at rest). Epiglottitis: High fever, tripod positioning, drooling, thumbprint sign (DO NOT agitate child; emergent airway in OR).',
        guideline: 'PALS Emergency Protocols'
      },
      {
        title: 'Pediatric Fluid Resuscitation (Holliday-Segar)',
        summary: 'Maintenance Fluid (4-2-1 Rule): 4 mL/kg/h for first 10kg + 2 mL/kg/h for next 10kg + 1 mL/kg/h for each kg above 20kg. Bolus for Hypovolemic Shock: 20 mL/kg IV isotonic crystalloid (Lactated Ringer\u2019s or Normal Saline) pushed over 10-20 minutes.',
        guideline: 'PALS / AAP Fluid Guidelines'
      }
    ],
    clinicalPearls: 'In suspected acute epiglottitis in children, never examine the pharynx with a tongue depressor or agitate the patient with venipuncture in unmonitored settings; direct stimulation triggers immediate, fatal complete laryngospasm.',
    aiPrompt: 'Explain pediatric emergency resuscitation, neonatal fever protocols, croup/epiglottitis differentiation, and Holliday-Segar fluid calculations.'
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry',
    scientificName: 'Psychiatry & Behavioral Health',
    badge: 'PSYCHIATRY',
    icon: 'sparkles-outline',
    color: '#877bf4', // Jewel Teal
    scope: 'Acute psych emergency triage, rapid chemical tranquilization, serotonin syndrome, neuroleptic malignant syndrome, and alcohol withdrawal protocols.',
    corePillars: ['Agitation Protocol (BETA Consensus)', 'Serotonin Syndrome (Hunter Criteria)', 'NMS vs Serotonin Syndrome', 'CIWA-Ar Alcohol Withdrawal'],
    highYieldTopics: [
      {
        title: 'Acute Agitation & Chemical Tranquilization',
        summary: 'Verbal de-escalation first. Pharmacotherapy (Project BETA guidelines): Mild/Moderate: Oral Lorazepam 1-2 mg or Olanzapine 5-10 mg Zydis. Severe/Violent: Combination IM Haloperidol 5 mg + IM Lorazepam 2 mg ("5 and 2") OR IM Olanzapine 10 mg or IM Ketamine 4-5 mg/kg (for severe excited delirium).',
        guideline: 'American Association for Emergency Psychiatry (Project BETA)'
      },
      {
        title: 'Serotonin Syndrome vs Neuroleptic Malignant Syndrome (NMS)',
        summary: 'Serotonin Syndrome: Caused by serotonergic excess (SSRIs, practical SNRIs, MAOIs, Tramadol). Hallmark: Hyperreflexia, spontaneous Clonus, myoclonus, tremor, diarrhea, rapid onset (<24h). Treatment: Stop agent, IV Lorazepam, Cyproheptadine (5-HT2A antagonist 12 mg initial). NMS: Caused by D2 blockade (antipsychotics). Hallmark: "Lead-pipe" muscle rigidity, hyporeflexia, extreme hyperthermia, high CK >10,000, slow onset (days). practical Treatment: Dantrolene, Bromocriptine.',
        guideline: 'Toxicology & Neurocritical Care Guidelines'
      },
      {
        title: 'Alcohol Withdrawal & Delirium Tremens (CIWA-Ar)',
        summary: 'Symptom-triggered Benzodiazepine protocol based on CIWA-Ar score (score \u22658-10 = active treatment). Diazepam 10-20 mg PO/IV or Lorazepam 2-4 mg IV q1-2h until calm and CIWA <8. Always give IV Thiamine 500 mg TID BEFORE glucose to prevent Wernicke encephalopathy.',
        guideline: 'ASAM Clinical Practice Guideline on Alcohol Withdrawal'
      }
    ],
    clinicalPearls: 'Always administer high-dose intravenous Thiamine BEFORE or concurrent with any glucose/dextrose infusions in patients with alcohol use disorder or malnutrition; infusing glucose alone rapidly exhausts remaining thiamine stores and triggers acute irreversible Wernicke encephalopathy.',
    aiPrompt: 'Provide behavioral health and psychiatric emergency guidance covering acute agitation practical tranquilization, CIWA alcohol withdrawal protocols, and serotonin syndrome vs NMS differentiation.'
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    scientificName: 'Ophthalmology & Visual Sciences',
    badge: 'OPHTHALMOLOGY',
    icon: 'eye-outline',
    color: '#b0afeb', // Lavender
    scope: 'Acute vision loss, ocular emergencies, glaucoma crises, retinal detachment, chemical burns, and orbital pathology.',
    corePillars: ['Acute Angle-Closure Glaucoma', 'Central Retinal Artery Occlusion', 'Chemical Eye Burns (Roper-Hall)', 'Orbital Compartment Syndrome'],
    highYieldTopics: [
      {
        title: 'Acute Angle-Closure Glaucoma',
        summary: 'Sudden severe eye pain, halos around lights, fixed mid-dilated pupil, IOP >40 mmHg. Emergency treatment: Topical Timolol 0.5% + Pilocarpine 2% + IV Acetazolamide 500 mg + IV Mannitol 1-2 g/kg. Definitive: Laser peripheral iridotomy.',
        guideline: 'AAO Preferred Practice Pattern \u2014 Primary Angle Closure'
      },
      {
        title: 'Central Retinal Artery Occlusion (CRAO)',
        summary: 'Painless sudden monocular vision loss, cherry-red spot on fundoscopy, afferent pupillary defect. Time-critical (<4-6 hours): Ocular massage, anterior chamber paracentesis, high-flow O2, IV tPA consideration. Rule out Giant Cell Arteritis with ESR/CRP.',
        guideline: 'AHA/ASA Acute Retinal Ischemia Guidelines'
      },
      {
        title: 'Chemical Eye Burn Emergency',
        summary: 'Immediate copious irrigation with isotonic saline or Ringer lactate for minimum 30 minutes before any examination. Check pH every 5 minutes until neutral (7.0-7.4). Alkali burns (worse prognosis) practical penetrate deeper than acid burns. Grade severity with Roper-Hall classification.',
        guideline: 'AAO Emergency Ophthalmology Guidelines'
      }
    ],
    clinicalPearls: 'In chemical eye burns, never delay irrigation to check visual acuity or perform slit-lamp examination; immediate continuous irrigation for at least 30 minutes is the single most important intervention to prevent permanent corneal damage and blindness.',
    aiPrompt: 'Provide emergency ophthalmology protocols including acute angle-closure glaucoma, central retinal artery occlusion, chemical burns, and orbital compartment syndrome.'
  }
];
