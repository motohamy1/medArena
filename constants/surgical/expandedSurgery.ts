import { SpecialtyData } from '../SpecialtyData';

export const EXPANDED_SURGICAL_KNOWLEDGE: Record<string, SpecialtyData> = {
  surgery_plastics: {
    id: 'surgery_plastics',
    name: 'Plastic Surgery',
    scientificName: 'Plastic, Reconstructive & Burn Surgery',
    icon: 'body-outline',
    color: '#eb988a', // Rose
    illustration: require('../../assets/images/specialties/dermatology.jpg'),
    generalScope: 'Comprehensive reconstructive microsurgery, free flap transfers, burn management, skin grafting, and aesthetic plastic surgery.',
    categories: [
      {
        id: 'microsurgery_reconstruction',
        title: 'Microsurgery & Wound Coverage',
        description: 'Perforator flaps, free tissue transfers, and composite defect reconstructions',
        icon: 'construct-outline',
        topics: [
          {
            id: 'alt_free_flap_protocol',
            title: 'Anterolateral Thigh (ALT) Perforator Free Flap',
            subtitle: 'Complex Tibial Defect, Septocutaneous Perforators & 9-0 Nylon Microvascular Anastomosis',
            type: 'Reconstructive Microsurgery Protocol',
            aiScopeDescription: 'ALT free flap, lateral circumflex femoral artery, microvascular coupler, operating microscope, and flap salvage.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 54-year-old male presents with an 8x6 cm composite soft tissue defect over the distal third of the tibia with exposed bone following a Gustilo-Anderson Grade IIIB open tibia fracture. Indication: Microvascular Free Tissue Transfer with Anterolateral Thigh (ALT) Perforator Flap.'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Acoustic Doppler mapping of thigh perforators; CTA lower extremity confirming patent anterior/posterior tibial arteries; 2-team simultaneous approach.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Flap Design: 10x8 cm skin paddle centered along ASIS-patella axis over perforator cluster.\n2. Subfascial Dissection: Incise medial fascia lata, identify LCFA descending branch perforators between rectus femoris and vastus lateralis.\n3. Intramuscular Dissection: Dissect perforator through vastus lateralis back to main LCFA trunk to obtain 8-10 cm pedicle length.\n4. Recipient Bed: Expose posterior tibial artery and venae comitantes under microscope.\n5. Microvascular Anastomoses: Arterial end-to-side anastomosis with interrupted 9-0 Nylon; venous anastomosis with 2.5mm GEM Microvascular Anastomotic Coupler.\n6. Inset & Drain: Inset flap with 3-0 Monocryl; Blake drain; primary donor closure.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Flap Pallor / Arterial Thrombosis: Immediate re-exploration, anastomotic revision, and intra-arterial tPA flush.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Hourly Doppler checks for 24h; warm room (>23°C); Aspirin 81mg daily.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• Operating microscope, micro-Acland clamps, 9-0/10-0 Nylon sutures, GEM 2.5mm coupler.'
              }
            ]
          }
        ]
      }
    ]
  },

  surgery_pediatric: {
    id: 'surgery_pediatric',
    name: 'Pediatric Surgery',
    scientificName: 'Pediatric & Neonatal Surgery',
    icon: 'people-outline',
    color: '#f6dda2', // Mint
    illustration: require('../../assets/images/specialties/gastroenterology.jpg'),
    generalScope: 'Comprehensive neonatal congenital anomaly repairs, pediatric general surgery, and pediatric surgical emergencies.',
    categories: [
      {
        id: 'neonatal_pediatric_emergencies',
        title: 'Pediatric & Neonatal Surgeries',
        description: 'Pyloric stenosis, congenital hernia, TEF, and malrotation',
        icon: 'happy-outline',
        topics: [
          {
            id: 'lap_pyloromyotomy_ramstedt',
            title: 'Laparoscopic Pyloromyotomy (Ramstedt)',
            subtitle: 'Hypertrophic Pyloric Stenosis, Electrolyte Normalization & Mucosal Integrity Test',
            type: 'Pediatric Surgical Protocol',
            aiScopeDescription: 'Pyloric stenosis, hypochloremic alkalosis correction, laparoscopic pyloromyotomy, Benson spreader, and mucosal leak test.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 4-week-old male infant presents with non-bilious projectile vomiting after feeds and a palpable epigastric "olive". Ultrasound: Pyloric muscle thickness 4.5 mm, channel length 17 mm. Labs: Hypochloremic hypokalemic metabolic alkalosis. Indication: Laparoscopic Ramstedt Pyloromyotomy after medical electrolyte normalization.'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Correct electrolytes first (Cl >100 mEq/L, K >3.5 mEq/L, HCO3 <30 mEq/L); stomach decompression with NG tube.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Access: 3mm umbilical scope port, 2x 3mm RUQ and LUQ working ports.\n2. Pyloric Incision: Longitudinal seromuscular incision on anterior pyloric olive with micro-knife.\n3. Muscle Spreading: Introduce 3mm Benson pyloric spreader; spread circular fibers until submucosa bulges freely.\n4. Air Leak Test: Inject 50 mL air through OG tube under saline immersion; confirm zero mucosal bubbling.\n5. Closure: Desufflate; 3-0 Vicryl for umbilical fascia; Dermabond on skin.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Duodenal Mucosal Perforation: Repair with interrupted 5-0 PDS and omental patch.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Oral feeds initiated at 4-6 hours post-op; discharge POD 1.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• 3mm pediatric laparoscope and instruments, Benson pyloric spreader, Dermabond.'
              }
            ]
          }
        ]
      }
    ]
  },

  surgery_ent: {
    id: 'surgery_ent',
    name: 'ENT / Head & Neck',
    scientificName: 'Otolaryngology & Head/Neck Surgery',
    icon: 'headset-outline',
    color: '#877bf4', // Teal
    illustration: require('../../assets/images/specialties/pulmonology.jpg'),
    generalScope: 'Comprehensive endocrine neck surgery, surgical airway management, endoscopic sinus surgery, and head and neck oncology.',
    categories: [
      {
        id: 'head_neck_endocrine',
        title: 'Head, Neck & Airway Surgeries',
        description: 'Thyroidectomy, parathyroidectomy, tracheostomy, and neck dissection',
        icon: 'headset-outline',
        topics: [
          {
            id: 'total_thyroidectomy_ionm',
            title: 'Total Thyroidectomy with Intraoperative Nerve Monitoring',
            subtitle: 'Bethesda VI Papillary Thyroid Carcinoma, RLN / EBSLN Preservation & Parathyroid Autotransplantation',
            type: 'Endocrine Surgical Protocol',
            aiScopeDescription: 'Total thyroidectomy, intraoperative nerve monitoring (IONM), Berry ligament, parathyroid preservation, and vocal cord mobility.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 38-year-old female presents with a 2.8 cm TI-RADS 5 right thyroid nodule. FNA: Bethesda VI (Papillary Thyroid Carcinoma). Indication: Total Thyroidectomy with Continuous Intraoperative Nerve Monitoring (IONM).'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• NIM 3.0 nerve monitoring endotracheal tube with electrodes placed between vocal cords; avoid paralytics after induction.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Incision: Low collar Kocher incision; elevate subplatysmal flaps; open strap muscles in midline.\n2. Superior Pole: Ligate superior vessels close to capsule with LigaSure; preserve EBSLN.\n3. RLN Mapping: Identify Recurrent Laryngeal Nerve (RLN) in tracheoesophageal groove with IONM probe (1-2 mA; confirm baseline V1/R1 EMG response >500 µV).\n4. Parathyroids: Dissect superior and inferior parathyroid glands off thyroid capsule on their vascular pedicles.\n5. Berry Ligament: Divide vascular ligament of Berry under direct RLN visualization; resect gland.\n6. Confirm final V2/R2 nerve signals bilaterally; layered closure.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Loss of Signal (LOS) on First Side: Stop and stage the contralateral lobe to prevent bilateral vocal cord paralysis.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Check 4h post-op ionized calcium and PTH; discharge on POD 1 with Levothyroxine.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• NIM 3.0 Nerve Monitor, LigaSure Small Jaw, Green thyroid retractors.'
              }
            ]
          }
        ]
      }
    ]
  },

  surgery_onco: {
    id: 'surgery_onco',
    name: 'Surgical Oncology',
    scientificName: 'Complex General Surgical Oncology',
    icon: 'shield-outline',
    color: '#b0afeb', // Lavender
    illustration: require('../../assets/images/specialties/gastroenterology.jpg'),
    generalScope: 'Comprehensive complex multivisceral oncologic resections, cytoreductive surgery, HIPEC, and retroperitoneal sarcomas.',
    categories: [
      {
        id: 'cytoreduction_peritonectomy',
        title: 'Cytoreduction & Advanced Oncology',
        description: 'Sugarbaker peritonectomy, heated chemoperfusion, and sarcoma resections',
        icon: 'flask-outline',
        topics: [
          {
            id: 'crs_hipec_sugarbaker',
            title: 'Cytoreductive Surgery (CRS) & 42°C HIPEC',
            subtitle: 'Pseudomyxoma Peritonei, Peritoneal Cancer Index (PCI) & Mitomycin-C Perfusion',
            type: 'Complex Surgical Oncology Protocol',
            aiScopeDescription: 'CRS, Sugarbaker peritonectomy, PCI scoring, CC-0 completeness, and 42°C Hyperthermic Intraperitoneal Chemotherapy.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 52-year-old female presents with low-grade appendiceal mucinous neoplasm (LAMN) and pseudomyxoma peritonei (PCI score 14/39). Indication: Complete Cytoreductive Surgery (CRS) with 42°C Hyperthermic Intraperitoneal Chemotherapy (HIPEC) using Mitomycin-C.'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Extensive pre-op nutritional and cardiac optimization; IV Sodium Thiosulfate for nephroprotection; forced diuresis.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Laparotomy: Full midline laparotomy; calculate exact PCI across 13 regions.\n2. Sugarbaker Peritonectomy: Greater omentectomy, right/left diaphragmatic peritonectomy, and pelvic peritonectomy achieving CC-0 cytoreduction.\n3. HIPEC Perfusion: Place inflow/outflow catheters connected to hyperthermic pump; circulate Mitomycin-C (35 mg/m²) at 41.5-42.5°C for 90 minutes.\n4. Washout & Reconstruction: Saline lavage; construct bowel anastomoses AFTER chemotherapy washout; mass closure.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Acute Nephrotoxicity / Bone Marrow Suppression: Maintain high urine output (>100 mL/h); monitor CBC and G-CSF.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Surgical ICU protocol; TPN on POD 2 for prolonged ileus; 28-day extended VTE prophylaxis with LMWH.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• Belmont Hyperthermia Perfusion Pump, Omni-Tract retractor, spray electrocautery, loop #1 PDS.'
              }
            ]
          }
        ]
      }
    ]
  },

  surgery_transplant: {
    id: 'surgery_transplant',
    name: 'Transplant Surgery',
    scientificName: 'Abdominal & Thoracic Organ Transplantation',
    icon: 'repeat-outline',
    color: '#f6dda2', // Mint
    illustration: require('../../assets/images/specialties/nephrology.jpg'),
    generalScope: 'Comprehensive deceased and living donor kidney, liver, and pancreas organ transplantation and immunosuppression protocols.',
    categories: [
      {
        id: 'renal_hepatic_allograft',
        title: 'Organ Allograft Transplantation',
        description: 'Back-table vascular preparation, iliac anastomoses, and Lich-Gregoir reimplantation',
        icon: 'repeat-outline',
        topics: [
          {
            id: 'deceased_donor_renal_allograft',
            title: 'Deceased Donor Renal Allograft Transplantation',
            subtitle: 'Iliac Vascular Anastomoses (5-0/6-0 Prolene) & Lich-Gregoir Ureteroneocystostomy with Double-J Stent',
            type: 'Organ Transplantation Protocol',
            aiScopeDescription: 'Kidney transplant, cold ischemic time, Carrel patch, external iliac vein/artery anastomoses, Lich-Gregoir reimplantation, and Thymoglobulin induction.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 49-year-old male with ESRD on hemodialysis receives an offer for a deceased donor kidney transplant (KDPI 22%, CIT 12h, negative crossmatch). Indication: Heterotopic Renal Allograft Transplantation into Right Iliac Fossa.'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Pre-op dialysis (K+ 4.1 mEq/L); induction with Thymoglobulin 1.5 mg/kg + Methylprednisolone 500mg IV; distend bladder with Methylene Blue saline.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Back-Table Prep: On ice slush, inspect donor kidney, Carrel patch, renal vein, and ureter; flush with cold UW solution.\n2. Extra-Peritoneal Exposure: Right lower quadrant Gibson incision; reflect peritoneum medially to expose external iliac vessels.\n3. Venous Anastomosis: End-to-side anastomosis of donor renal vein to recipient External Iliac Vein with running 5-0/6-0 Prolene.\n4. Arterial Anastomosis: End-to-side anastomosis of donor Carrel patch to External Iliac Artery with running 5-0/6-0 Prolene.\n5. Reperfusion: IV Mannitol 25g + Furosemide 100mg; release venous then arterial clamps; kidney becomes immediately pink and pulsatile.\n6. Ureteroneocystostomy (Lich-Gregoir): Extravesical submucosal tunnel; spatulate ureter over 6 Fr Double-J stent; suture to bladder mucosa with 5-0 PDS; close detrusor with 4-0 Vicryl anti-reflux valve.\n7. JP drain; layered closure.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Hyperacute Rejection / Thrombosis: Immediate Doppler ultrasound; emergent re-exploration if vascular compromise.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Hourly mL-for-mL urine output fluid replacement; Tacrolimus, MMF, and Prednisone triple maintenance immunosuppression.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• Satinsky clamps, Cooley clamps, Castroviejo needle holder, 6 Fr Double-J stent, 5-0/6-0 Prolene.'
              }
            ]
          }
        ]
      }
    ]
  },

  surgery_bariatric: {
    id: 'surgery_bariatric',
    name: 'Bariatric',
    scientificName: 'Bariatric & Metabolic Surgery',
    icon: 'resize-outline',
    color: '#eb988a', // Rose
    illustration: require('../../assets/images/specialties/gastroenterology.jpg'),
    generalScope: 'Laparoscopic sleeve gastrectomy, Roux-en-Y gastric bypass, revision bariatric surgery, and metabolic syndrome resolution.',
    categories: [
      {
        id: 'bariatric_metabolic_procedures',
        title: 'Bariatric & Metabolic Procedures',
        description: 'Sleeve gastrectomy, Roux-en-Y gastric bypass, and staple line reinforcement',
        icon: 'resize-outline',
        topics: [
          {
            id: 'lap_sleeve_gastrectomy',
            title: 'Laparoscopic Sleeve Gastrectomy (LSG)',
            subtitle: '36-40 Fr Bougie Calibration, Greater Curvature Skeletonization & Staple Line Reinforcement',
            type: 'Metabolic & Bariatric Surgery Protocol',
            aiScopeDescription: 'Laparoscopic sleeve gastrectomy, 36-40 Fr bougie, Endo-GIA stapler heights, angle of His, and methylene blue leak test.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 36-year-old female with Class III obesity (BMI 44.2 kg/m²), type 2 diabetes mellitus, and severe obstructive sleep apnea presents for elective metabolic surgery. Indication: Laparoscopic Sleeve Gastrectomy (LSG).'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Multi-disciplinary clearance (dietitian, psychology, bariatric surgeon, pulmonology CPAP compliance); 2-week low-calorie liver-shrinking diet; weight-based enoxaparin 40mg SC BID.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Access: 5-trocar layout (12mm camera above umbilicus, 12mm right/left working ports, 5mm assistant and Nathanson liver retractor).\n2. Skeletonization: Mobilize greater curvature using ultrasonic shears starting 4 cm proximal to pylorus up to left crus and Angle of His, taking short gastric vessels.\n3. Bougie Placement: Pass a 36-40 Fr calibrated bougie along lesser curvature into duodenum.\n4. Gastric Transection: Serial Endo-GIA linear stapling (Black/Green cartridges for thick antrum, Purple/Gold for body and fundus) parallel to bougie.\n5. Reinforcement: Over-sew staple line with 3-0 V-Loc running suture or apply seam reinforcement.\n6. Integrity Testing: Intraoperative methylene blue or air-leak test via bougie under saline immersion.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Staple Line Leak at Angle of His: Primary over-sewing with 3-0 PDS and omental patch; laparoscopic drain placement.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• ERAS bariatric pathway: Clear liquids at POD 1; early ambulation at 2 hours post-op; lifelong bariatric multivitamins.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• 36-40 Fr bariatric bougie, Endo-GIA Tri-Staple 60mm cartridges, Harmonic HD1000i, Nathanson liver retractor.'
              }
            ]
          },
          {
            id: 'lap_rygb_protocol',
            title: 'Laparoscopic Roux-en-Y Gastric Bypass',
            subtitle: '15-30 mL Gastric Pouch, 100-150 cm Roux Limb & Petersen Defect Closure',
            type: 'Metabolic & Bariatric Surgery Protocol',
            aiScopeDescription: 'Roux-en-Y gastric bypass, small gastric pouch, gastrojejunostomy, jejunojejunostomy, and internal hernia closure.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 42-year-old male with BMI 48.5 kg/m² and refractory GERD with Barrett esophagus presents for metabolic surgery. Indication: Laparoscopic Roux-en-Y Gastric Bypass (RYGB).'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Pre-op upper endoscopy; H. pylori eradication; stop NSAIDs; preoperative incentive spirometry and DVT prophylaxis.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Gastric Pouch: Create 15-30 mL lesser curvature pouch using linear staplers starting 3 cm distal to GE junction.\n2. Biliopancreatic Limb: Measure 50 cm distal to ligament of Treitz and divide jejunum.\n3. Roux Limb: Measure 100-150 cm alimentary limb; create antecolic gastrojejunostomy with linear stapler (25-30mm) or circular stapler.\n4. Jejunojejunostomy: Side-to-side 60mm stapled anastomosis between biliopancreatic and Roux limbs.\n5. Defect Closure: Mandatory non-absorbable continuous closure of Petersen and mesenteric defects to prevent internal herniation.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Anastomotic Tension / Leak: Immediate tension-free revision and closed-suction drainage.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Early oral hydration; monitor for dumping syndrome, marginal ulceration (PPI for 3 months), and fat-soluble vitamin deficiencies.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• Endo-GIA stapler, 2-0 Ethibond non-absorbable suture, laparoscopic suction-irrigator.'
              }
            ]
          }
        ]
      }
    ]
  },

  surgery_hepatobiliary: {
    id: 'surgery_hepatobiliary',
    name: 'Hepatobiliary',
    scientificName: 'Hepatobiliary & Pancreatic Surgery',
    icon: 'flask-outline',
    color: '#877bf4', // Teal
    illustration: require('../../assets/images/specialties/gastroenterology.jpg'),
    generalScope: 'Complex liver resections, classic Whipple pancreaticoduodenectomy, biliary stricture reconstruction, and liver trauma.',
    categories: [
      {
        id: 'pancreatic_hepatic_resections',
        title: 'HPB Operative Protocols',
        description: 'Whipple pancreaticoduodenectomy, anatomic hepatectomy, and hepaticojejunostomy',
        icon: 'flask-outline',
        topics: [
          {
            id: 'classic_whipple_procedure',
            title: 'Pancreaticoduodenectomy (Whipple Procedure)',
            subtitle: 'Pancreatic Head Adenocarcinoma, SMV/PV Tunneling & Triple Reconstruction',
            type: 'Complex Hepatobiliary Protocol',
            aiScopeDescription: 'Whipple procedure, pancreaticoduodenectomy, Cattell-Braasch maneuver, SMV tunnel, duct-to-mucosa pancreaticojejunostomy, and POPF.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 63-year-old male presents with painless jaundice (Total Bilirubin 14.2 mg/dL), weight loss, and Courvoisier sign. Pancreatic protocol CT: 2.6 cm resectable mass in pancreatic head without vascular invasion. Indication: Classic Open Pancreaticoduodenectomy (Whipple).'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Pre-op nutritional optimization, correct coagulopathy with Vitamin K; crossmatch 4 units PRBC; thoracic epidural analgesia.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Exploration & Resectability: Right subcostal Chevron incision; extensive Kocher maneuver mobilizing C-loop duodenum past IVC and aorta.\n2. SMV/PV Tunneling: Develop anterior vascular tunnel between neck of pancreas and superior mesenteric vein / portal vein.\n3. Resection: Transect stomach/pylorus, common hepatic duct above cystic duct, neck of pancreas, and proximal jejunum (ligament of Treitz).\n4. Retroperitoneal Margin: Dissect uncinate process off SMA right lateral wall using clips and energy.\n5. Triple Reconstruction (Child method):\n   a. Pancreaticojejunostomy: Two-layer modified Blumgart or duct-to-mucosa (5-0 PDS inner, 3-0 Prolene outer).\n   b. Hepaticojejunostomy: End-to-side biliary anastomosis with interrupted 4-0/5-0 PDS.\n   c. Gastrojejunostomy: Antecolic handsewn or stapled anastomosis 40 cm distal to biliary hookup.\n6. Bilateral closed-suction JP drains placed near anastomoses.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Postoperative Pancreatic Fistula (POPF Grade B/C): Drain fluid amylase >3x serum on POD 3; maintain drains, somatostatin analogue, and nutritional support.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• ICU recovery; monitor blood glucose (insulin protocol); daily drain amylase; PPI infusion.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• Bookwalter table retractor, vascular clamps (Satinsky), 4-0/5-0 PDS sutures, Jackson-Pratt drains.'
              }
            ]
          },
          {
            id: 'lap_right_hepatectomy',
            title: 'Anatomic Right Hepatectomy',
            subtitle: 'Segments V-VIII Resection, Pringle Maneuver & CUSA Ultrasonic Cavitron Dissection',
            type: 'Complex Hepatobiliary Protocol',
            aiScopeDescription: 'Right hepatectomy, Pringle maneuver, Cantlie line, CUSA parenchymal transection, and post-hepatectomy liver failure.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 57-year-old female with solitary 6 cm colorectal liver metastasis in segments VI/VII with future liver remnant (FLR) of 38%. Indication: Anatomic Right Hepatectomy.'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Triphasic liver CT/MRI volumetry; ICG clearance test; low central venous pressure (CVP <5 mmHg) anesthetic plan to minimize back-bleeding.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Exposure & Mobilization: Right subcostal incision; take down right triangular and coronary ligaments.\n2. Inflow Control: Dissect porta hepatis; selectively ligate right hepatic artery and right portal vein branch.\n3. Demarcation: Observe ischemic line along Cantlie line (IVC to gallbladder fossa).\n4. Parenchymal Transection: Cavitron Ultrasonic Surgical Aspirator (CUSA) with bipolar electrocautery; apply intermittent Pringle maneuver (15 min clamp / 5 min release).\n5. Outflow Control: Staple right hepatic vein with vascular Endo-GIA (tan/white load).\n6. Hemostasis: Argon plasma coagulation on raw liver surface; tachosil sealant patch.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Hepatic Vein Avulsion / Air Embolism: Immediate Pringle clamp, pack liver bed, flood field with saline, repair with 4-0 Prolene.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Monitor INR, bilirubin, and lactate for post-hepatectomy liver failure (50-50 criteria POD 5); maintain euvolemia.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• CUSA ultrasonic aspirator, Pringle tourniquet (rummel), Endo-GIA vascular stapler, Argon beam coagulator.'
              }
            ]
          }
        ]
      }
    ]
  },

  surgery_maxillofacial: {
    id: 'surgery_maxillofacial',
    name: 'Maxillofacial',
    scientificName: 'Oral & Maxillofacial Surgery',
    icon: 'happy-outline',
    color: '#b0afeb', // Lavender
    illustration: require('../../assets/images/specialties/psychiatry.jpg'),
    generalScope: 'Complex orthognathic surgery, facial trauma reconstruction, TMJ arthroplasty, and craniofacial anomalies.',
    categories: [
      {
        id: 'orthognathic_facial_trauma',
        title: 'Maxillofacial & Trauma Protocols',
        description: 'Bimaxillary orthognathic osteotomies, mandibular ORIF, and ZMC fracture repair',
        icon: 'happy-outline',
        topics: [
          {
            id: 'bimaxillary_orthognathic_surgery',
            title: 'Bimaxillary Orthognathic Surgery (Le Fort I + BSSO)',
            subtitle: 'Maxillary Impaction/Advancement, Mandibular Bilateral Sagittal Split & Rigid Fixation',
            type: 'Craniomaxillofacial Protocol',
            aiScopeDescription: 'Le Fort I osteotomy, BSSO, IAN nerve preservation, intermediate splint, and titanium miniplates.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 22-year-old male with severe Class III skeletal malocclusion, maxillary hypoplasia, mandibular prognathism, and anterior open bite presents after 18 months of decompensating orthodontic preparation. Indication: Bimaxillary Orthognathic Surgery (Le Fort I Osteotomy + Bilateral Sagittal Split Osteotomy).'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Virtual Surgical Planning (VSP) with 3D CAD/CAM occlusal splints; nasotracheal intubation; pre-op systemic dexamethasone.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Le Fort I Osteotomy: Maxillary vestibular incision from first molar to first molar; osteotomy of anterior/lateral maxillary walls, nasal septum, and pterygomaxillary dysjunction with reciprocating saw.\n2. Downfracture & Mobilization: Downfracture maxilla; mobilize into final position using intermediate 3D-printed wafer splint; secure with 4x 1.5mm L-shaped titanium miniplates.\n3. Mandibular BSSO: Oblique mucosal incision along anterior mandibular ramus; identify lingula and Inferior Alveolar Nerve (IAN).\n4. Sagittal Osteotomy: Horizontal medial cut above lingula, vertical anterior lateral cut at second molar; split ramus using sagittal split osteotomes.\n5. Maxillomandibular Fixation: Intermaxillary fixation (IMF) with final splint; fixate proximal and distal mandibular segments with 2.0mm bicortical screws or miniplates.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Bad Split / IAN Injury: Immediate repositioning and stabilization with lag screws; preserve nerve sheath continuity.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Wire cutters at bedside; elastics guide guidance; cool humidified O2; liquid puree diet for 6 weeks.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• Reciprocating / oscillating saws, Smith bone spreaders, 1.5/2.0mm MatrixMIDFACE miniplate sets.'
              }
            ]
          },
          {
            id: 'mandible_fracture_orif',
            title: 'Mandibular Angle & Parasymphyseal ORIF',
            subtitle: 'Champy Ideal Line of Osteosynthesis, Transoral Approach & 2.0mm Titanium Fixation',
            type: 'Craniomaxillofacial Protocol',
            aiScopeDescription: 'Mandible fracture, Champy line, transoral approach, Erich arch bars, and rigid titanium fixation.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 28-year-old male presents with severe facial trauma following a motor vehicle collision, exhibiting malocclusion, step-off deformity at right mandibular angle, and left parasymphyseal mobility. Indication: Open Reduction and Internal Fixation (ORIF).'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• 3D maxillofacial CT scan; apply Erich arch bars for temporary intermaxillary fixation (IMF) establishing anatomic dental occlusion.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Incision: Intraoral vestibular approach with subperiosteal dissection preserving mental nerve.\n2. Reduction: Anatomic reduction of fracture segments confirmed by restoration of native dental intercuspation under IMF.\n3. Fixation (Champy Principle): Place a 2.0mm monocortical miniplate along superior border (tension band) and a 2.0mm load-bearing plate along inferior border.\n4. Angle Fracture: Place superior border miniplate along external oblique ridge transorally with trochar system.\n5. Layered Closure: Copious irrigation and watertight closure with 3-0 chromic gut.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Mental Nerve Paresthesia: Gentle retraction; avoid excessive traction on nerve bundle.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Post-op panoramic radiograph (OPG); soft diet 4-6 weeks; chlorhexidine 0.12% oral rinses.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• Erich arch bars, 2.0mm MatrixMANDIBLE plating system, transbuccal trocar set.'
              }
            ]
          }
        ]
      }
    ]
  },

  surgery_endocrine: {
    id: 'surgery_endocrine',
    name: 'Endocrine Surgery',
    scientificName: 'Endocrine & Thyroid Surgery',
    icon: 'nuclear-outline',
    color: '#f6dda2', // Mint
    illustration: require('../../assets/images/specialties/endocrinology.jpg'),
    generalScope: 'Targeted parathyroidectomy, retroperitoneal laparoscopic adrenalectomy, thyroid surgery, and MEN syndrome management.',
    categories: [
      {
        id: 'endocrine_adrenal_parathyroid',
        title: 'Endocrine Surgical Protocols',
        description: 'Minimally invasive parathyroidectomy, laparoscopic adrenalectomy, and Miami criteria',
        icon: 'nuclear-outline',
        topics: [
          {
            id: 'targeted_parathyroidectomy_miami',
            title: 'Targeted Parathyroidectomy (Miami Criteria)',
            subtitle: 'Primary Hyperparathyroidism, Intraoperative PTH (ioPTH) Drop >50% & Adenoma Resection',
            type: 'Endocrine Surgical Protocol',
            aiScopeDescription: 'Parathyroidectomy, Sestamibi SPECT-CT, Miami criteria, intraoperative PTH monitoring, and recurrent laryngeal nerve preservation.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 58-year-old postmenopausal female presents with osteoporosis, recurrent nephrolithiasis, elevated serum calcium (11.4 mg/dL), and intact PTH (118 pg/mL). 99mTc-Sestamibi SPECT/CT: Concordant left inferior parathyroid adenoma. Indication: Focused Minimally Invasive Parathyroidectomy (MIP) with Intraoperative PTH monitoring.'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Baseline intraoperative PTH blood draw (pre-incision and pre-excision); continuous neuromonitoring of RLN.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Incision: Focused 2.5 cm lateral neck incision along Langer skin crease.\n2. Dissection: Separate strap muscles from sternocleidomastoid; retract thyroid lobe medially.\n3. Identification: Identify enlarged reddish-brown hypercellular left inferior parathyroid gland (0.8 g).\n4. Resection: Clip and divide single feeding vascular pedicle off inferior thyroid artery without capsule rupture.\n5. Intraoperative PTH (ioPTH) Assay: Draw blood at 5 and 10 minutes post-excision.\n6. Confirmation (Miami Criteria): Confirm >50% drop in ioPTH from baseline into normal range (92 pg/mL dropped to 18 pg/mL at 10 mins).'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Failure to Drop ioPTH: Perform bilateral neck exploration (BNE) to identify multiglandular disease or ectopic adenoma.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• Monitor for postoperative hypocalcemia (Chvostek / Trousseau signs); oral calcium carbonate 1000mg + Calcitriol 0.25 mcg daily.'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• Rapid ioPTH analyzer, NIM 3.0 nerve monitor, small jaw bipolar forceps, hemoclips.'
              }
            ]
          },
          {
            id: 'lap_adrenalectomy_pheo',
            title: 'Laparoscopic Transabdominal Adrenalectomy',
            subtitle: 'Pheochromocytoma, Alpha-Blockade (Phenoxybenzamine), Early Vein Ligation & Hemodynamic Control',
            type: 'Endocrine Surgical Protocol',
            aiScopeDescription: 'Adrenalectomy, pheochromocytoma, Roizen criteria, phenoxybenzamine alpha-blockade, and main adrenal vein ligation.',
            clinicalContent: [
              {
                title: 'Case Scenario & Clinical Presentation',
                content: 'A 45-year-old male presents with episodic headache, diaphoresis, and hypertension. 24-hour urine metanephrines are 5x ULN. Abdominal MRI: 4.2 cm left adrenal mass. Indication: Laparoscopic Transabdominal Left Adrenalectomy.'
              },
              {
                title: 'Preoperative Risk & Preoperative Preparation',
                content: '• Mandatory pre-op alpha-blockade (Phenoxybenzamine 10-20 mg TID for 14 days) followed by beta-blockade only after alpha-blockade established (Roizen criteria); aggressive pre-op salt loading.'
              },
              {
                title: 'Operative Steps & Techniques',
                content: '1. Patient Position: Right lateral decubitus at 60 degrees; 4 subcostal trocars.\n2. Splenorenal Mobilization: Incise line of Toldt, mobilize spleen and tail of pancreas medially off retroperitoneum.\n3. Exposure: Identify left renal vein and left gonadal vein crossing.\n4. Central Adrenal Vein: Dissect and doubly clip the main left adrenal vein as it enters left renal vein BEFORE gland manipulation to prevent catecholamine surge.\n5. Circumferential Dissection: Mobilize adrenal gland from surrounding retroperitoneal fat and superior poles using ultrasonic energy.\n6. Specimen Extraction: Retrieve intact in Endocatch bag.'
              },
              {
                title: 'Complications & Intraoperative Management',
                content: '• Severe Intraoperative Hypotension: Common immediately following adrenal vein ligation (due to sudden catecholamine withdrawal); resuscitate with IV fluids and norepinephrine infusion.'
              },
              {
                title: 'Post-Operative Critical Care & Monitoring',
                content: '• ICU hemodynamic monitoring for 24 hours; wean vasopressors; monitor blood glucose (rebound hypoglycemia risk).'
              },
              {
                title: 'Surgical Instruments & Equipment',
                content: '• Harmonic ACE+, vascular titanium clips (Hem-o-lok), Endocatch specimen bag, arterial line.'
              }
            ]
          }
        ]
      }
    ]
  }
};
