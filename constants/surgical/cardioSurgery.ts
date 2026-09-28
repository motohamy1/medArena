import { SpecialtyData } from '../SpecialtyData';

export const CARDIOTHORACIC_SURGERY_SPECIALTY: SpecialtyData = {
  id: 'surgery_cardio',
  name: 'Cardiothoracic',
  scientificName: 'Cardiothoracic & Thoracic Surgery',
  icon: 'heart',
  color: '#877bf4', // Teal
  illustration: require('../../assets/images/specialties/cardiology.jpg'),
  generalScope: 'Comprehensive adult cardiac, congenital, thoracic aortic, pulmonary resections, mediastinal, and cardiopulmonary bypass critical care protocols.',
  categories: [
    {
      id: 'coronary_valvular',
      title: 'Coronary & Valvular Heart Surgery',
      description: 'CABG, aortic/mitral valve replacements and repairs, and CPB weaning',
      icon: 'heart-outline',
      topics: [
        {
          id: 'multivessel_cabg_lima',
          title: 'Multivessel CABG with LIMA-to-LAD & Saphenous Vein Grafts',
          subtitle: 'Triple Vessel CAD, LIMA Harvest, Del Nido Cardioplegia & Microvascular Anastomoses',
          type: 'Open Cardiac Surgical Protocol',
          aiScopeDescription: 'CABG x3, LIMA to LAD, SVG conduits, Cardiopulmonary bypass, Del Nido cardioplegia, 8-0 Prolene anastomoses, and TTFM flow verification.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 63-year-old diabetic male presents with unstable angina (CCS Class III). Coronary Angiogram: 90% proximal LAD stenosis, 85% OM1 stenosis, and 95% RCA stenosis (SYNTAX score 36). Indication: Triple-Vessel CABG (LIMA-LAD, SVG-OM1, SVG-PDA).'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• STS risk score 2.1%; hold Clopidogrel 5d; TEE probe; arterial line + Swan-Ganz catheter.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Harvest: Median sternotomy; harvest LIMA skeletonized and greater saphenous vein via endoscopic harvest (EVH).\n2. Cannulation & CPB: Heparin (300-400 U/kg, ACT >480s); ascending aortic and two-stage right atrial cannulation.\n3. Cross-clamp & Arrest: Cross-clamp aorta; deliver cold blood or Del Nido cardioplegia.\n4. Distal Anastomoses: (a) SVG to PDA (7-0 Prolene); (b) SVG to OM1 (7-0 Prolene); (c) LIMA to LAD (running continuous 8-0 Prolene under 4.0x loupes).\n5. Proximal Anastomoses: Side-biting aortic clamp; punch 4.0mm aortotomies; sew vein grafts with 6-0 Prolene.\n6. Wean & Reverse: De-air heart; remove cross-clamp; wean CPB; Protamine reversal (ACT <140s); Transit-Time Flow Measurement (TTFM flow >20 mL/min); wire sternum.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Graft Dysfunction: If TTFM shows pulsatility index >5.0 or flow <15 mL/min, revise anastomosis immediately.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• CVICU: Extubation at 4-6h; Aspirin 81mg within 6h; chest tube output monitoring (<150 mL/h).'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Sternal saw, CPB console, Castroviejo micro-needle holder, 8-0/7-0 Prolene, sternal wires.'
            }
          ]
        },
        {
          id: 'surgical_aortic_valve_replacement_savr',
          title: 'Surgical Aortic Valve Replacement (SAVR)',
          subtitle: 'Severe Aortic Stenosis, Annular Decalcification & Bioprosthetic / Mechanical Valve',
          type: 'Valvular Cardiac Protocol',
          aiScopeDescription: 'Aortic valve replacement, severe aortic stenosis, aortotomy, annular decalcification, non-pledgeted/pledgeted 2-0 Ethibond sutures, and valve sizing.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 72-year-old male presents with exertional syncope and dyspnea (NYHA III). Echo: Critical calcific aortic stenosis (Aortic Valve Area 0.65 cm², mean gradient 52 mmHg, peak velocity 4.6 m/s). Indication: Surgical Aortic Valve Replacement (SAVR).'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Pre-op dental clearance to prevent endocarditis; valve type selection (Bovine Pericardial Bioprosthetic vs Mechanical).'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Sternotomy & CPB: Median sternotomy, standard aortic and right atrial cannulation, initiate CPB, cross-clamp aorta, antegrade + retrograde cardioplegia.\n2. Aortotomy: Transverse hockey-stick or oblique aortotomy 1 cm above the sinotubular junction.\n3. Valve Excision: Resect 3 calcified aortic valve cusps; meticulously debride annular calcium with rongeurs (prevent calcium embolization into left ventricle).\n4. Sizing: Size annulus with manufacturer sizer.\n5. Annular Sutures: Place 12-15 non-absorbable 2-0 braided Ethibond mattress sutures with Teflon pledgets around the annulus.\n6. Valve Seating & Tying: Parachute bioprosthetic valve into position; tie sutures with Cor-Knot or hand knots. Confirm coronary ostia patency (>10 mm distance).\n7. Aortotomy Closure: Two-layer running 4-0 Prolene closure with felt strips.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Complete Heart Block: Avoid deep suture placement in membranous septum between non-coronary and right coronary cusps.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Post-op echocardiogram; temporary pacing wires on standby; discharge in 4-5 days.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Edwards Magna Ease / Medtronic Avalus valve, Cor-Knot automated suture fastener, 2-0 Ethibond pledgeted sutures.'
            }
          ]
        },
        {
          id: 'mitral_valve_repair_annuloplasty',
          title: 'Mitral Valve Repair with Rigid Annuloplasty Ring',
          subtitle: 'Degenerative Mitral Regurgitation (Barlow/P2 Prolapse), Artificial Chordae (Gore-Tex) & Ring Sizing',
          type: 'Complex Valvular Reconstruction',
          aiScopeDescription: 'Mitral valve repair, severe MR, P2 leaflet resection, Gore-Tex neo-chordae, and Carpentier-Edwards Physio II annuloplasty ring.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 56-year-old male presents with severe symptomatic mitral regurgitation due to P2 segment prolapse (ruptured chordae tendineae). Echo: Severe 4+ MR, dilated left atrium, LVEF 60%. Indication: Mitral Valve Repair.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• TEE confirmation of repairable anatomy; bicaval cannulation setup.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Bicaval Cannulation: Superior and Inferior Vena Cava cannulation with snared tapes.\n2. Left Atriotomy: Enter left atrium via Sondergaard groove posterior to interatrial groove.\n3. Leaflet Reconstruction: Place 4-0 CV-4 Gore-Tex artificial neo-chordae from papillary muscle head to free edge of prolapsing P2 segment (or triangular resection).\n4. Annuloplasty Ring: Measure anterior leaflet intertrigonal distance; place 10-12 braided 2-0 Ti-Cron sutures around mitral annulus and parachute Carpentier-Edwards annuloplasty ring to restore annular geometry.\n5. Saline Competence Test: Pressurize left ventricle with cold saline; confirm excellent coaptation line (>8 mm) and zero regurgitation.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Systolic Anterior Motion (SAM): Avoid small ring oversizing in thick septum; treat intraoperatively with volume and beta-blockers.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• TEE check before CPB decannulation; Warfarin anticoagulation for 3 months (target INR 2.0-3.0).'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Carpentier-Edwards Physio II annuloplasty ring, CV-4 Gore-Tex suture, Cosgrove mitral retractor.'
            }
          ]
        }
      ]
    },
    {
      id: 'aortic_thoracic_emergencies',
      title: 'Thoracic Aorta & Emergency Surgery',
      description: 'Type A dissection repairs, emergent thoracotomy, and VATS pulmonary resections',
      icon: 'flame-outline',
      topics: [
        {
          id: 'type_a_dissection_hemiarch_repair',
          title: 'Emergency Ascending Aorta & Hemiarch Replacement for Type A Dissection',
          subtitle: 'Stanford Type A, Deep Hypothermic Circulatory Arrest (DHCA) & Dacron Graft',
          type: 'Emergency Cardiac Surgery Protocol',
          aiScopeDescription: 'Stanford Type A dissection, cannulation strategy (axillary/femoral), Deep Hypothermic Circulatory Arrest (DHCA 18°C), antegrade cerebral perfusion, and Dacron graft replacement.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 58-year-old male presents with sudden tearing chest/back pain and asymmetric radial pulses. CTA: Acute Stanford Type A Aortic Dissection extending from aortic root to aortic arch with pericardial effusion and aortic insufficiency. Indication: Emergent Surgical Repair with Ascending Aorta and Hemiarch Replacement under DHCA.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• ASA V-E (1-2% mortality per hour delay); anti-impulse therapy during OR prep.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Cannulation: Right axillary artery cannulation (via 8mm Dacron side-graft) and right atrial venous cannulation for CPB.\n2. Cooling: Cool patient to 18-20°C (Deep Hypothermic Circulatory Arrest - DHCA); establish Antegrade Cerebral Perfusion (ACP) via axillary graft at 10 mL/kg/min.\n3. Arch Inspection & Hemiarch Anastomosis: Open aortic arch; resect intimal tear. Construct distal open hemiarch anastomosis with beveled Dacron graft and running 3-0 Prolene with Teflon felt strips (sandwich technique).\n4. Systemic Reperfusion: Cannulate graft branch to resume lower body perfusion and begin gradual rewarming.\n5. Proximal Reconstruction: Resuspend aortic valve commissures with 4-0 pledgeted Prolene; replace ascending aorta with Dacron graft; sew proximal anastomosis above sinotubular junction.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Coagulopathic Bleeding: MTP protocol; Cryoprecipitate and Platelets; Prothrombin Complex Concentrates (PCC).'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Neuroprotective ICU care: Maintain normothermia, strict SBP <120 mmHg, serial neuro checks.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Gelweave / Hemashield Dacron aortic graft (26-30mm), right axillary cannula, 3-0/4-0 Prolene, BioGlue.'
            }
          ]
        },
        {
          id: 'vats_right_upper_lobectomy',
          title: 'VATS Right Upper Lobectomy with Systematic Lymphadenectomy',
          subtitle: 'Stage I NSCLC, Single-Lung Deflation, Pulmonary Vessel Stapling & Station 2R/4R/7 Dissection',
          type: 'Thoracic Surgical Protocol',
          aiScopeDescription: 'VATS lobectomy, single-lung ventilation, pulmonary vein/artery stapling, bronchus stapling, and mediastinal lymph node dissection.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 59-year-old female presents with a 2.4 cm solid nodule in the right upper lobe. PET-CT: SUV 6.8, N0 M0. PFTs: ppoFEV1 74%. Indication: VATS Right Upper Lobectomy with Systematic Mediastinal Lymphadenectomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Left-sided double-lumen tube (DLT 37 Fr); lateral decubitus position.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Ports: 3-port VATS (10mm camera 7th ICS, 3 cm utility 4th ICS anterior, 5mm retraction 7th ICS posterior).\n2. Vein: Dissect RUL pulmonary vein and divide with Endo-GIA 45mm vascular stapler (White/Tan cartridge).\n3. Artery: Staple truncus anterior and posterior ascending arterial branches.\n4. Bronchus: Clear station 10 lymph nodes; divide RUL bronchus with Purple/Gold tissue stapler; test air leak under water seal.\n5. Fissure & Specimen: Staple horizontal and oblique fissures; extract specimen in Endo-Catch bag.\n6. Lymph Nodes: Dissect stations 2R, 4R, 7, 8, 9.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Pulmonary Artery Laceration: Direct pressure with sponge stick; convert to thoracotomy if bleeding uncontrollable.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• 24 Fr Blake chest drain to water seal; early ambulation POD 0; remove tube when output <200 mL/d with no air leak.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• 30° HD Thoracoscope, Scanlan VATS instruments, Endo-GIA Tri-Staple 45/60mm staplers.'
            }
          ]
        }
      ]
    }
  ]
};
