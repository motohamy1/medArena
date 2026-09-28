import { SpecialtyData } from '../SpecialtyData';

export const VASCULAR_SURGERY_SPECIALTY: SpecialtyData = {
  id: 'surgery_vascular',
  name: 'Vascular',
  scientificName: 'Vascular & Endovascular Surgery',
  icon: 'git-network',
  color: '#b0afeb', // Lavender
  illustration: require('../../assets/images/specialties/cardiology.jpg'),
  generalScope: 'Comprehensive open vascular and endovascular surgery, aortic aneurysm repairs, cerebrovascular disease, peripheral arterial disease, and dialysis access.',
  categories: [
    {
      id: 'aortic_cerebrovascular',
      title: 'Aortic & Cerebrovascular Surgeries',
      description: 'EVAR, TEVAR, open AAA, carotid endarterectomy, and TCAR',
      icon: 'git-branch-outline',
      topics: [
        {
          id: 'evar_infrarenal_aaa_repair',
          title: 'Endovascular Aneurysm Repair (EVAR)',
          subtitle: '5.8cm AAA, Modular Bifurcated Stent-Graft & Complete Sac Exclusion',
          type: 'Endovascular Surgical Protocol',
          aiScopeDescription: 'EVAR, infrarenal abdominal aortic aneurysm, landing zones, main body deployment, gate cannulation, and endoleak detection.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 71-year-old male presents for surveillance of an infrarenal AAA. CTA: 5.8 cm AAA with suitable neck (length 18 mm, angulation 35°, diameter 22 mm) and patent iliacs. Indication: Elective Endovascular Aneurysm Repair (EVAR).'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Bilateral ultrasound-guided femoral access with Preclose ProGlide sutures; IV Heparin (80 U/kg, ACT >250s).'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Access: Bilateral common femoral artery cannulation with 0.035" Lunderquist stiff wires.\n2. Angiography: Pigtail catheter marks lowest renal artery origin.\n3. Main Body Deployment: Deploy bifurcated main body stent-graft below renal arteries under fluoroscopy.\n4. Gate Cannulation: Cannulate contralateral gate from opposite groin; confirm in orthogonal views.\n5. Iliac Limbs: Deploy bilateral modular iliac limb extensions ending proximal to internal iliac bifurcation.\n6. Molding & Completion: Coda balloon molding of seal zones; completion angiogram confirms zero Type I/III endoleak and patent renals.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Type IA Endoleak: Re-balloon or place aortic extension cuff / Palmaz stent.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Flat bed rest 2-4h; check distal pulses; discharge on POD 1; CTA surveillance at 1 month and 1 year.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Medtronic Endurant IIs / Gore Excluder, Coda balloon, Perclose ProGlide x4, 0.035" Lunderquist wires.'
            }
          ]
        },
        {
          id: 'carotid_endarterectomy_cea',
          title: 'Carotid Endarterectomy (CEA) with Bovine Patch',
          subtitle: '80% Symptomatic Stenosis, Pruitt-Inahara Shunt & Cranial Nerve Preservation',
          type: 'Vascular Cerebrovascular Protocol',
          aiScopeDescription: 'Carotid endarterectomy, CEA, plaque excision, Pruitt-Inahara shunt, bovine pericardial patch, and cranial nerve preservation.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 68-year-old male presents with transient amaurosis fugax and right arm weakness (TIA). CTA: 80% left internal carotid artery stenosis with ulcerated plaque. Indication: Urgent Left Carotid Endarterectomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Maintain Aspirin; arterial line; EEG / cerebral oximetry neuromonitoring.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Incision: Along anterior border of SCM.\n2. Dissection: Identify and protect CN XII (Hypoglossal), CN X (Vagus), and Ansa cervicalis.\n3. Clamping: Heparinize (5000 U); clamp ICA, CCA, and ECA; insert Pruitt-Inahara shunt if EEG slows.\n4. Endarterectomy: Longitudinal arteriotomy; peel atheromatous plaque in subadventitial plane; feather distal endpoint.\n5. Patch Angioplasty: Sew bovine pericardial patch with continuous 6-0 Prolene; flush CCA and ICA; restore flow to ECA first, then ICA.\n6. Protamine reversal; Blake drain.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Acute Post-Op Deficit: Immediate surgical re-exploration for thrombosis/flap.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Strict SBP 110-140 mmHg with IV Nicardipine/Labetalol to prevent hyperperfusion syndrome; discharge POD 1.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• DeBakey vascular clamps, Pruitt-Inahara shunt, bovine pericardial patch, 6-0 Prolene.'
            }
          ]
        }
      ]
    },
    {
      id: 'pad_limb_salvage',
      title: 'Peripheral Arterial Disease & Dialysis Access',
      description: 'Bypass grafting, thrombectomy, and arteriovenous fistula creation',
      icon: 'pulse-outline',
      topics: [
        {
          id: 'femoral_popliteal_bypass',
          title: 'Femoral-Popliteal Bypass with Greater Saphenous Vein (GSV)',
          subtitle: 'Critical Limb Threatening Ischemia (CLTI), Reversed/In Situ Vein & Distal Anastomosis',
          type: 'Peripheral Arterial Reconstruction',
          aiScopeDescription: 'Fem-pop bypass, critical limb ischemia, Rutherford classification, reversed GSV conduit, and distal popliteal anastomosis.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 67-year-old diabetic smoker presents with ischemic rest pain in the left foot and non-healing toe ulcer (Rutherford Category 5). Angiogram: Complete occlusion of the left superficial femoral artery (SFA) with reconstitution of the below-knee popliteal artery. Indication: Left Femoral to Below-Knee Popliteal Bypass with Reversed Saphenous Vein.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Vein mapping confirms adequate GSV (>3.5 mm diameter); Aspirin and statin optimization.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Exposure: Longitudinal groin incision exposing Common Femoral Artery (CFA), SFA, and profunda femoris. Medial below-knee incision exposing below-knee popliteal artery.\n2. Vein Harvest: Harvest GSV from thigh and leg; mark orientation and flush with heparinized blood/papaverine.\n3. Tunneling: Subfascial anatomic tunnel created along the course of the SFA.\n4. Distal Anastomosis: Longitudinal arteriotomy on popliteal artery; end-to-side anastomosis with reversed GSV using running 6-0 Prolene.\n5. Proximal Anastomosis: Beveled end-to-side anastomosis to CFA with 5-0/6-0 Prolene.\n6. De-airing & Flow Confirmation: Confirm strong palpable distal pedal pulses or audible continuous-wave Doppler signals.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Conduit Thrombosis: Immediate intraoperative revision, Fogarty thrombectomy, or intraoperative completion angiography.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Check distal pulses and ABI q1h x 6h; therapeutic anticoagulation/antiplatelet; discharge POD 2-3.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Castroviejo micro-needle holder, Potts-Smith scissors, Gore tunneler, 6-0 Prolene.'
            }
          ]
        },
        {
          id: 'brescia_cimino_av_fistula',
          title: 'Brescia-Cimino Radiocephalic Arteriovenous (AV) Fistula',
          subtitle: 'End-Stage Renal Disease, Radial Artery to Cephalic Vein Anastomosis (7-0 Prolene)',
          type: 'Vascular Access Surgery',
          aiScopeDescription: 'Radiocephalic AV fistula, Brescia-Cimino, radial artery, cephalic vein, end-to-side anastomosis, and "Rule of 6s" maturation.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 54-year-old male with progressive ESRD (eGFR 11 mL/min) requires permanent hemodialysis vascular access. Duplex Ultrasound: Radial artery 2.6 mm (>2.0 mm) with normal Allen test, non-thrombosed cephalic vein 2.8 mm (>2.5 mm). Indication: Left Wrist Brescia-Cimino Radiocephalic AV Fistula.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Local infiltration anesthesia with 1% Lidocaine or regional axillary block.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Incision: Longitudinal or curvilinear incision over the anatomical snuffbox / distal forearm between radial artery and cephalic vein.\n2. Dissection: Mobilize 4 cm of cephalic vein; ligate side branches with 4-0 Silk. Mobilize radial artery; control with micro-vascular loops.\n3. Heparinization: Local or systemic heparin (3000 U).\n4. Anastomosis: Transect cephalic vein distally and spatulate; create 8 mm longitudinal arteriotomy on radial artery. Construct end-to-side anastomosis with running continuous 7-0 Prolene under 3.5x loupes.\n5. Thrill Confirmation: Release clamps; palpate continuous, low-resistance palpable thrill and audible bruit over the cephalic vein.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Steal Syndrome: Hand ischemia/pain; prevent by limiting arteriotomy length to ≤8 mm.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Hand exercises with stress ball starting at 2 weeks; evaluate "Rule of 6s" maturation at 6 weeks (Flow >600 mL/min, Depth <6 mm, Diameter >6 mm).'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Micro-vascular bulldog clamps, Castroviejo needle holder, 7-0 Prolene on BV-1 needle.'
            }
          ]
        }
      ]
    }
  ]
};
