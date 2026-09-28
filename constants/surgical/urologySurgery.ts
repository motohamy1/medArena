import { SpecialtyData } from '../SpecialtyData';

export const UROLOGY_SURGERY_SPECIALTY: SpecialtyData = {
  id: 'surgery_urology',
  name: 'Urology',
  scientificName: 'Urological & Pelvic Surgery',
  icon: 'medkit',
  color: '#877bf4', // Teal
  illustration: require('../../assets/images/specialties/dermatology.jpg'),
  generalScope: 'Comprehensive endourology, laser lithotripsy, robotic urologic oncology, and acute urological emergency surgeries.',
  categories: [
    {
      id: 'endourology_oncology',
      title: 'Endourology & Urologic Oncology',
      description: 'Laser stone fragmentation, robotic prostatectomy, and radical nephrectomy',
      icon: 'medkit-outline',
      topics: [
        {
          id: 'flexible_ureteroscopy_laser_lithotripsy',
          title: 'Flexible Ureteroscopy & Holmium:YAG Laser Lithotripsy (fURS)',
          subtitle: 'Upper Pole / Renal Pelvis Calculus, Dusting vs Popcorning & Double-J Stent',
          type: 'Endourology Protocol',
          aiScopeDescription: 'Flexible Ureteroscopy (fURS), Holmium:YAG / Thulium fiber laser dusting, nitinol tipless stone basket, and ureteral access sheath.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 47-year-old male presents with intractable right flank pain and hematuria. Non-Contrast CT KUB: 12 mm dense stone (1200 HU) in the right renal pelvis with moderate hydronephrosis. Indication: Flexible Ureteroscopy with Laser Lithotripsy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Confirm negative urine culture; single-dose IV Ciprofloxacin or Cefazolin; general anesthesia; dorsal lithotomy position.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Rigid Cystoscopy & Retrograde Pyelogram: Place 0.038" sensor guidewire under fluoroscopic vision into renal pelvis.\n2. Ureteral Access Sheath: Advance 11/13 Fr hydrophilic ureteral access sheath over guidewire into upper ureter.\n3. Flexible Ureteroscopy: Introduce digital flexible ureteroscope through sheath into renal collecting system; systematically inspect all calyces.\n4. Laser Lithotripsy: Pass 200 µm Holmium:YAG or Thulium Fiber Laser (TFL) fiber; set to "Dusting" mode (low energy 0.4 J, high frequency 30-50 Hz) or "Fragmentation" (1.0 J, 10 Hz) to pulverize stone into fine dust <1 mm.\n5. Basket Extraction: Extract residual fragments with 1.9 Fr nitinol tipless basket.\n6. Stenting: Deploy 6 Fr 24cm Double-J ureteral stent over wire under fluoroscopy.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Ureteral Avulsion / Stricture: Never force an access sheath; if tight ureter, place stent and return for staged fURS in 2 weeks.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Outpatient same-day discharge; Tamsulosin 0.4mg daily to reduce stent discomfort; stent removal in 5-7 days.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Olympus / Boston Scientific digital flexible ureteroscope, Lumenis 100W Holmium laser, 1.9 Fr nitinol basket, Double-J stent.'
            }
          ]
        },
        {
          id: 'robotic_radical_prostatectomy_rarp',
          title: 'Robotic-Assisted Radical Prostatectomy (RARP)',
          subtitle: 'Prostate Cancer, Bilateral Neurovascular Bundle Sparing & Vesicourethral Anastomosis (Van Velthoven)',
          type: 'Robotic Urologic Oncology',
          aiScopeDescription: 'RARP, da Vinci robotic platform, nerve sparing, endopelvic fascia, dorsal venous complex, and running Van Velthoven anastomosis.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 61-year-old male with localized prostate cancer (PSA 7.8 ng/mL, Gleason 3+4=7, cT2a) presents for definitive curative surgery. Multiparametric MRI: 1.4 cm PI-RADS 5 lesion in peripheral zone without capsular invasion. Indication: Bilateral Nerve-Sparing Robotic Radical Prostatectomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Steep Trendelenburg (25-30°); 6-port transperitoneal robotic setup (da Vinci Xi platform); pneumatic calf compression.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Bladder Takedown: Incise peritoneum, drop bladder, develop space of Retzius.\n2. Endopelvic Fascia & DVC: Open endopelvic fascia bilaterally; control dorsal venous complex (DVC) with 0-Vicryl figure-of-eight stitch.\n3. Bladder Neck Transection: Identify bladder neck-prostate junction with balloon catheter; transect anterior and posterior bladder neck.\n4. Seminal Vesicles: Dissect and divide vas deferens and seminal vesicles.\n5. Nerve-Sparing Dissection: Interfascial or intrafascial dissection along the prostatic pseudocapsule with micro-bipolar energy and clips to preserve the cavernous neurovascular bundles bilaterally (erectile preservation).\n6. Apical Transection: Transect urethra sharply at the prostatic apex with maximal urethral length preservation (continence preservation).\n7. Vesicourethral Anastomosis: Construct running watertight Van Velthoven anastomosis between bladder neck and urethral stump using bidirectional barbed 3-0 V-Loc suture over a 18 Fr silicone Foley catheter.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Rectal Injury: Inspect posterior plane; repair in 2 layers with 3-0 Vicryl and cover with omentum.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Early ambulation POD 0; discharge POD 1; Foley catheter removed at 7-10 days after cystogram.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• da Vinci Xi Surgical System (ProGrasp, Maryland bipolar, Hot Shear monopolar scissors), 3-0 V-Loc sutures.'
            }
          ]
        },
        {
          id: 'emergent_testicular_torsion_detorsion',
          title: 'Emergent Testicular Detorsion & Bilateral Orchiopexy',
          subtitle: '6-Hour Ischemic Window, Bell-Clapper Deformity & 3-Point Dartos Pouch Fixation',
          type: 'Emergency Urologic Protocol',
          aiScopeDescription: 'Testicular torsion, bell-clapper anomaly, emergent scrotal exploration, warm reperfusion, bilateral 3-point orchiopexy.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 15-year-old male presents with acute severe right testicular pain for 3 hours, high riding transverse testicle, absent cremasteric reflex, and Doppler ultrasound showing zero arterial flow. Indication: Emergent Right Scrotal Exploration and Bilateral Orchiopexy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Immediate emergency OR transport; general anesthesia; sterile prep of scrotum and groins.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Scrotal Incision: Transverse right hemiscrotal incision; deliver testis out of tunica vaginalis.\n2. Detorsion: Detorse spermatic cord (typically 360-540° medial to lateral).\n3. Reperfusion: Wrap testis in warm moist laparotomy packs for 10-15 minutes with 100% FiO2; verify return of pink capillary bleeding on parenchymal puncture.\n4. Right Fixation: Sub-dartos pouch creation; 3-point fixation of tunica albuginea to dartos with non-absorbable 3-0 Prolene.\n5. Mandatory Contralateral Left Orchiopexy: Open left hemiscrotum and fixate left testicle with 3-point sutures (prevents future contralateral torsion).\n6. Layered closure with 3-0 Vicryl and 4-0 Monocryl.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Non-Viable Necrotic Testis: If black after 15 mins warm ischemia, perform orchiectomy.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Scrotal support; ice packs for 48h; avoid heavy exercise for 4 weeks.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Minor surgery tray, fine bipolar forceps, 3-0 Prolene on RB-1 needle.'
            }
          ]
        }
      ]
    }
  ]
};
