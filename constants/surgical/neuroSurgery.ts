import { SpecialtyData } from '../SpecialtyData';

export const NEUROSURGERY_SPECIALTY: SpecialtyData = {
  id: 'surgery_neuro',
  name: 'Neurosurgery',
  scientificName: 'Neurological & Spine Surgery',
  icon: 'pulse',
  color: '#f6dda2', // Mint
  illustration: require('../../assets/images/specialties/neurology.jpg'),
  generalScope: 'Comprehensive cranial, cerebrovascular, skull base, spinal instrumentation, neurotrauma, and functional neurosurgical procedures.',
  categories: [
    {
      id: 'cranial_trauma_emergencies',
      title: 'Cranial Trauma & Emergency Craniotomies',
      description: 'Acute hematoma evacuations, ICP crises, and traumatic brain injury decompressive surgery',
      icon: 'warning-outline',
      topics: [
        {
          id: 'acute_sdh_trauma_craniectomy',
          title: 'Craniotomy & Decompressive Craniectomy for Acute SDH',
          subtitle: 'Uncal Herniation, Reverse Question-Mark Flap & Expansile Duraplasty',
          type: 'Emergency Neurotrauma Protocol',
          aiScopeDescription: 'Acute subdural hematoma, trauma flap, brain herniation, ICP control, expansile duraplasty, and bone flap banking.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 28-year-old male arrives after a high-speed MVC. GCS drops to 6 (E1V1M4) with an ipsilateral right blown pupil (6 mm fixed) and left hemiplegia. CT Head: 18 mm hyperdense crescentic extra-axial collection with 12 mm midline shift and uncal herniation. Indication: Emergent Trauma Craniotomy / Decompressive Craniectomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• ASA V-E; IV Mannitol 20% 1.0 g/kg and 3% Hypertonic Saline 250 mL bolus administered during OR transport.\n• Positioning: Supine, head turned 45-60° on horseshoe or 3-pin Mayfield clamp; 2% ChloraPrep prep.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Incision: Large reverse question-mark trauma incision (Kempe flap) starting 1 cm preauricular to sagittal midline.\n2. Hemostasis: Apply Raney scalp clips down to bone; reflect musculocutaneous flap anteriorly with fish-hooks.\n3. Bone Flap: High-speed Midas Rex drill places 4-5 burr holes; connect with craniotome footplate; rongeur temporal bone down to floor of middle fossa.\n4. Dural Opening: Stellate or C-shaped dural incision hinged on superior sagittal sinus.\n5. Evacuation: Gently irrigate and aspirate subdural clot with #7/9 Frazier suction over cottonoids.\n6. Hemostasis: Bipolar coagulation of bleeding cortical bridging veins; Surgicel Fibrillar and FloSeal.\n7. Decompressive Closure: Expansile duraplasty with DuraGen / pericranium and 4-0 Prolene; leave bone flap out if brain swollen above skull rim. Subgaleal JP drain; staple skin.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Mushrooming Brain Swelling: Deepen anesthesia, 3% saline bolus, hyperventilate to PaCO2 30 mmHg, open basal cisterns.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Neuro-ICU: Invasive ICP monitor (target ICP <20 mmHg, CPP 60-70 mmHg); IV Keppra 1000mg q12h x 7d for seizure prophylaxis.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Midas Rex drill with B1 footplate, Malis bipolar generator, Frazier suctions (size 7, 9, 11), DuraGen matrix, Raney clips.'
            }
          ]
        },
        {
          id: 'epidural_hematoma_pterional_craniotomy',
          title: 'Emergency Craniotomy for Epidural Hematoma (EDH)',
          subtitle: 'Lucid Interval, Middle Meningeal Artery Ligation & Dural Tenting Sutures',
          type: 'Emergency Neurotrauma Protocol',
          aiScopeDescription: 'Epidural hematoma, middle meningeal artery rupture, lucid interval, biconvex lens on CT, and dural hitching sutures.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 19-year-old male struck in the right temporal region with a baseball experienced brief loss of consciousness, followed by a 2-hour lucid interval, then acute coma (GCS 7) with a dilated right pupil. Non-Contrast Head CT: Classic biconvex (lenticular) hyperdense extra-axial collection in the right temporoparietal region underlying a squamous temporal bone fracture with 9 mm midline shift. Indication: Emergent Right Pterional / Temporal Craniotomy for Epidural Hematoma Evacuation.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• ASA IV-E; Immediate OR transport without delay; rapid sequence intubation.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Incision: Curvilinear question-mark or linear temporal incision centered over fracture/pterion.\n2. Bone Flap: Rapid burr hole over hematoma to immediately decompress brain; elevate 6x6 cm bone flap.\n3. Clot Evacuation: Evacuate solid, rubbery arterial clot with Frazier suction and curettes.\n4. MMA Ligation: Identify bleeding Middle Meningeal Artery (MMA) in the bone groove or foramen spinosum; coagulate with bipolar cautery, pack foramen spinosum with bone wax or 4-0 Silk transfixion stitch.\n5. Dural Hitching (Tenting Sutures): Place multiple circumferential 4-0 Nurolon dural tenting sutures through drill holes in the bone edge to obliterate the epidural space and prevent re-accumulation.\n6. Bone Flap Replacement: Re-fixate bone flap with low-profile titanium cranial plates and 4mm screws; layered galea and skin closure.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Persistent Epidural Bleeding: Bone wax bleeding skull edges and place central dural hitch stitch.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Rapid awakening expected; repeat CT at 6 hours post-op; discharge in 48 hours if neurological exam intact.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• High-speed cranial perforator, cranial titanium plating kit, bone wax, 4-0 Nurolon sutures.'
            }
          ]
        },
        {
          id: 'burr_hole_evacuation_chronic_sdh',
          title: 'Double Burr-Hole Evacuation for Chronic Subdural Hematoma (CSDH)',
          subtitle: 'Motor Weakness in Elderly, "Motor Oil" Fluid Drainage & Subdural Subdural Drain',
          type: 'Minimally Invasive Cranial',
          aiScopeDescription: 'Chronic subdural hematoma, double burr-hole drainage, copious warm saline irrigation, closed-system Jackson-Pratt subdural drain.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'An 81-year-old male taking Aspirin presents with 3 weeks of progressive confusion, cognitive decline, and left-sided hemiparesis. CT Head: Hypodense/isodense crescentic collection measuring 22 mm with 8 mm midline shift. Indication: Double Burr-Hole Drainage with Subdural Drain.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Local anesthesia with sedation or general anesthesia; hold antiplatelet agents.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Incisions: Two 3 cm linear incisions (frontal and parietal) over maximal hematoma thickness.\n2. Burr Holes: Drill two 14 mm burr holes with high-speed perforator.\n3. Dural Opening: Cruciate incision of outer dura and inner pseudomembrane; dark "motor oil" subdural fluid under pressure egresses spontaneously.\n4. Warm Irrigation: Irrigate subdural space gently between burr holes with 2-3 Liters of warm normal saline until effluent is crystal clear.\n5. Subdural Drain: Place a soft silastic Jackson-Pratt catheter in the subdural space connected to a closed drainage bulb.\n6. Skin Closure: Close galea with 3-0 Vicryl; staples to skin.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Acute Bleeding / Cortical Vessel Tear: Copious irrigation; avoid vigorous catheter manipulation.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Keep patient flat in bed for 24-48 hours to encourage brain expansion; remove drain at 48 hours.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Cranial perforator drill, Frazier suction, 10 Fr Jackson-Pratt silicone drain.'
            }
          ]
        },
        {
          id: 'external_ventricular_drain_evd',
          title: 'Bedside / OR External Ventricular Drain (EVD / Kocher Point)',
          subtitle: 'Hydrocephalus, ICP Crisis, Kocher Point Landmark & Catheter Trajectory',
          type: 'Emergency Neuro-Critical Procedure',
          aiScopeDescription: 'External ventricular drain (EVD) placement, Kocher point (11 cm back, 3 cm lateral), Monro foramen trajectory, ICP leveling.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 56-year-old female presents with acute subarachnoid hemorrhage and deteriorating mental status (GCS 8). CT: Acute tetraventricular hydrocephalus with biventricular enlargement (Evans index 0.38). Indication: Emergency External Ventricular Drain (EVD) Insertion.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Bedside sterile prep with 2% ChloraPrep; local infiltration with 1% Lidocaine with Epinephrine.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Anatomical Landmark (Kocher Point): Mark point 11 cm posterior from nasion in the mid-pupillary line (3 cm lateral to midline, 1 cm anterior to coronal suture).\n2. Burr Hole: Twist drill or cranial hand drill perpendicular to skull surface.\n3. Dural Puncture: Perforate dura with #11 blade.\n4. Catheter Trajectory: Aim ventricular catheter toward medial canthus of ipsilateral eye in coronal plane and external auditory meatus in sagittal plane.\n5. Ventricle Entry: Advance catheter to depth of 5.5-6.0 cm; feel slight "pop" as frontal horn of lateral ventricle is entered; CSF flows spontaneously.\n6. Tunneling & Leveling: Subcutaneously tunnel catheter 5 cm posteriorly; connect to Medtronic Duet EVD transducer leveled to the Foramen of Monro (tragus).'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Intraventricular Hemorrhage (IVH): Avoid multiple passes; do not advance deeper than 6.5 cm.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Level EVD at +10 to +15 cmH2O above tragus; CSF collection for daily culture/cell count.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Medtronic/Integra Antimicrobial EVD Kit with Codman tunneling tool and Duet transducer.'
            }
          ]
        }
      ]
    },
    {
      id: 'cerebrovascular_skull_base',
      title: 'Cerebrovascular & Skull Base Microsurgery',
      description: 'Aneurysm clipping, AVM resections, skull base tumors, and microvascular decompression',
      icon: 'git-network-outline',
      topics: [
        {
          id: 'mca_aneurysm_clipping',
          title: 'Microsurgical Pterional Clipping of MCA Bifurcation Aneurysm',
          subtitle: 'Yasargil Pterional Approach, Sylvian Fissure Split & Sugita Clip Application',
          type: 'Microsurgical Cerebrovascular',
          aiScopeDescription: 'MCA bifurcation aneurysm, Yasargil pterional craniotomy, sphenoid ridge drilling, Sylvian fissure dissection, and temporary clipping.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 50-year-old female presents with sudden onset "thunderclap" headache (Hunt & Hess Grade II, Fisher Grade 3). CT Angiogram: Ruptured 7 mm saccular aneurysm of the right Middle Cerebral Artery (MCA) bifurcation with a wide neck (dome-to-neck ratio 1.2). Indication: Right Pterional Craniotomy and Microsurgical Aneurysm Clipping.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Strict SBP control (<140 mmHg) with IV Nicardipine; Intraoperative MEP/SSEP neuromonitoring and Indocyanine Green (ICG) angiography.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Pterional Craniotomy: Curvilinear frontotemporal incision; frontotemporal bone flap; drill sphenoid wing down to superior orbital fissure.\n2. Dural Opening & Brain Relaxation: Open dura curved toward orbit; aspirate CSF from carotid cistern.\n3. Sylvian Fissure Split: Under operating microscope (12x), sharply split the distal-to-proximal Sylvian fissure with micro-scissors and arachnoid knife.\n4. MCA M1 & Bifurcation Exposure: Identify main M1 trunk (proximal control); follow to bifurcation, exposing superior and inferior M2 branches.\n5. Neck Dissection & Clipping: Dissect aneurysm neck free of perforators; apply temporary M1 clip if needed (<5 mins under burst suppression); apply permanent Sugita/Yasargil titanium mini-curved clip across aneurysm neck.\n6. ICG Completion Angiography: Inject IV Indocyanine Green (ICG); inspect under infrared microscope to confirm complete aneurysm obliteration and patent parent M1/M2 vessels.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Intraoperative Rupture: Apply suction, temporary M1 clip, and bipolar coagulation of bleb before final clipping.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Neuro-ICU: Nimodipine 60mg PO q4h x 21d to prevent delayed cerebral ischemia/vasospasm; transcranial Doppler (TCD) daily.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Operating microscope, Yasargil titanium aneurysm clip appliers and clips, Flow 800 ICG infrared module.'
            }
          ]
        },
        {
          id: 'microvascular_decompression_trigeminal',
          title: 'Microvascular Decompression (MVD) for Trigeminal Neuralgia (Jannetta)',
          subtitle: 'Retrosigmoid Craniotomy, Superior Cerebellar Artery & Teflon Felt Interposition',
          type: 'Functional Cranial Microsurgery',
          aiScopeDescription: 'Trigeminal neuralgia, Jannetta microvascular decompression, retrosigmoid craniotomy, superior cerebellar artery (SCA) conflict, and Teflon sponge.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 57-year-old male presents with severe, lancinating, electric shock-like facial pain in the right V2/V3 distribution triggered by shaving and chewing, refractory to Carbamazepine (Tegretol). 3D CISS MRI: Neurovascular compression of the right trigeminal root entry zone by a loop of the Superior Cerebellar Artery (SCA). Indication: Retrosigmoid Craniotomy and Microvascular Decompression (Jannetta Procedure).'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Brainstem Auditory Evoked Potentials (BAEP) and CN VII/VIII monitoring setup.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Position & Incision: Park bench or lateral position; 5 cm vertical retroauricular incision 2 cm posterior to the mastoid groove.\n2. Retrosigmoid Craniotomy: 3x3 cm craniotomy exposing the junction of the transverse and sigmoid sinuses.\n3. Supracerebellar Approach: Open dura; gently retract superior cerebellum with narrow blade to visualize the cerebellopontine angle.\n4. Nerve & Vessel Identification: Identify CN V root entry zone (REZ) at the brainstem; dissect compressing loop of SCA away from the nerve.\n5. Teflon Interposition: Insert shredded Teflon (polytetrafluoroethylene) felt sponges between the pulsating artery and the trigeminal nerve root.\n6. Watertight Dural Closure: 4-0 Nurolon watertight closure with fibrin sealant.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Hearing Loss / CN VIII Injury: Avoid cerebellar over-retraction; monitor BAEP wave V latency.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Immediate relief of facial pain; discharge on POD 2.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Greenberg retractor, micro-dissectors (Rhoton #1-5), shredded Teflon felt, DuraSeal.'
            }
          ]
        },
        {
          id: 'transsphenoidal_pituitary_adenoma_resection',
          title: 'Endoscopic Endonasal Transsphenoidal Pituitary Adenoma Resection',
          subtitle: 'Cushing / Acromegaly / Non-Functioning Macroadenoma, Sellar Reconstruction & CSF Leak Prevention',
          type: 'Endoscopic Skull Base',
          aiScopeDescription: 'Pituitary macroadenoma, bitemporal hemianopsia, endoscopic endonasal binostril approach, sphenoidotomy, sellar opening, and Hadad nasoseptal flap.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 48-year-old male presents with progressive bitemporal hemianopsia on visual field testing. Pituitary MRI: 2.6 cm sellar mass with suprasellar extension compressing the optic chiasm (non-functioning pituitary macroadenoma). Indication: Endoscopic Endonasal Transsphenoidal Resection.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Pre-op endocrine hormone panel (ACTH, Cortisol, Prolactin, IGF-1, TSH); neuronavigation CT/MRI fusion.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Binostril Endoscopic Entry: 0° and 30° rigid endoscopes; harvest Hadad-Bassagasteguy vascularized nasoseptal flap.\n2. Sphenoidotomy: Wide anterior sphenoidotomy; identify optic-carotid recesses (OCR) and sellar floor.\n3. Sellar Opening: Remove sellar bone with Kerrison rongeurs; cruciate incision of sellar dura.\n4. Adenoma Resection: Curette tumor using ring curettes and suction; inspect descent of diaphragmatic sella.\n5. Sellar Reconstruction: Inset fat graft/fascia lata and position nasoseptal flap with DuraSeal and nasal packing.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Internal Carotid Artery (ICA) Laceration: Rare catastrophic complication; pack with muscle graft and emergent endovascular balloon occlusion.\n• Post-Op CSF Leak: Lumbar drain placement if high-flow intraoperative leak.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Monitor for Diabetes Insipidus (DI: Urine output >300 mL/h x 2 consecutive hours, specific gravity <1.005; treat with oral/IV DDAVP); check morning serum cortisol POD 1.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Karl Storz HD Endoscopy tower, StealthStation neuronavigation, Hardy/Rhoton pituitary ring curettes.'
            }
          ]
        }
      ]
    },
    {
      id: 'spine_surgery_instrumentation',
      title: 'Spine Surgery & Decompression/Instrumentation',
      description: 'Anterior & posterior cervical, thoracic, and lumbar decompression and fusion procedures',
      icon: 'fitness-outline',
      topics: [
        {
          id: 'acdf_anterior_cervical_fusion',
          title: 'Anterior Cervical Discectomy & Fusion (ACDF)',
          subtitle: 'Cervical Radiculopathy/Myelopathy, Caspar Distraction, PEEK Cage & Anterior Locking Plate',
          type: 'Spine Surgery Protocol',
          aiScopeDescription: 'ACDF, Smith-Robinson approach, recurrent laryngeal nerve, Caspar pins, PLL resection, interbody fusion, and anterior plate.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 51-year-old male presents with C6 radiculopathy and numbness in thumb/index finger with biceps weakness (4/5). MRI: C5-C6 herniated disc compressing right C6 nerve root. Indication: C5-C6 Anterior Cervical Discectomy and Fusion.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• SSEP/MEP neuromonitoring; fiberoptic intubation; supine with neck slightly extended.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Smith-Robinson Approach: Transverse skin crease incision over SCM medial border at cricoid level.\n2. Plane: Medial to carotid sheath and lateral to trachea/esophagus.\n3. Caspar Distraction: Insert Caspar pins into C5 and C6 vertebral bodies.\n4. Discectomy: Evacuate disc; resect Posterior Longitudinal Ligament (PLL) under microscope to decompress dura and C6 nerve roots.\n5. Fusion: Decorticate endplates; place PEEK cage with DBM.\n6. Plating: Secure anterior titanium locking plate with screws.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Recurrent Laryngeal Nerve Injury: Deflate/reinflate ETT cuff to 15-20 mmHg after retractor placement.\n• Post-Op Neck Hematoma: Bedside surgical release if acute stridor develops.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• PACU airway check; discharge on POD 1 with lifting restrictions.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Caspar distractor, TrimLine retractor, PEEK cage, anterior plate system.'
            }
          ]
        },
        {
          id: 'lumbar_microdiscectomy_l4_l5',
          title: 'Minimally Invasive Lumbar Microdiscectomy (L4-L5)',
          subtitle: 'Sciatica, Tubular Retractor, Flavectomy & Herniated Disc Fragmentectomy',
          type: 'Minimally Invasive Spine',
          aiScopeDescription: 'Lumbar disc herniation, sciatica, tubular retractor docking, partial hemilaminectomy, flavectomy, and traversing nerve root mobilization.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 39-year-old female presents with severe right L5 sciatica and foot drop (EHL weakness 3/5) refractory to 6 weeks of conservative management. MRI: Large paracentral disc herniation at L4-L5 compressing the traversing right L5 nerve root. Indication: Tubular Minimally Invasive Lumbar Microdiscectomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Fluoroscopic level verification; prone positioning on Wilson frame.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Incision & Dilation: 2 cm paramedian skin incision 1.5 cm lateral to midline; sequential dilators docked over L4-L5 facet-laminar junction.\n2. Tubular Retractor: Expand 18mm tubular retractor and fixate to table arm; confirm level on lateral fluoroscopy.\n3. Laminotomy & Flavectomy: Under operating microscope, perform hemilaminotomy with high-speed burr; excise ligamentum flavum with 2mm Kerrison rongeur.\n4. Nerve Root Mobilization: Gently retract traversing L5 nerve root medially with micro-nerve retractor to expose the herniated disc.\n5. Fragmentectomy: Incise annulus and extract extruded disc fragments with pituitary rongeurs; confirm free nerve root mobilization.\n6. Closure: Layered closure with 2-0 Vicryl and 4-0 Monocryl.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Dural Tear (CSF Leak): Repair with 5-0 Prolene and DuraGen patch + fibrin glue.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Immediate relief of leg pain; discharge same-day (POD 0) in 3-4 hours.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• METRx tubular retractor system, micro-pituitary rongeurs, 2mm Kerrison punch.'
            }
          ]
        },
        {
          id: 'tlif_lumbar_fusion',
          title: 'Transforaminal Lumbar Interbody Fusion (TLIF)',
          subtitle: 'Spondylolisthesis, Unilateral Facetectomy, Pedicle Screws & Interbody Cage',
          type: 'Complex Spine Instrumentation',
          aiScopeDescription: 'TLIF, degenerative spondylolisthesis, spinal stenosis, unilateral facetectomy, pedicle screw-rod instrumentation, and interbody cage placement.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 62-year-old male presents with neurogenic claudication and mechanical low back pain. Radiographs/MRI: Grade II L4-L5 Degenerative Spondylolisthesis with severe central canal and bilateral lateral recess stenosis. Indication: L4-L5 Transforaminal Lumbar Interbody Fusion (TLIF).'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Intraoperative neuromonitoring (EMG pedicle screw stimulation and MEP/SSEP); prone on Jackson spinal table.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Pedicle Screw Insertion: Place bilateral L4 and L5 polyaxial pedicle screws under fluoroscopy/navigation (test with triggered EMG >10 mA).\n2. Unilateral Complete Facetectomy: Resect inferior articular process of L4 and superior articular process of L5 on the more symptomatic side to open the neural foramen.\n3. Discectomy: Enter disc space safely in Kambin triangle lateral to the traversing nerve root; complete discectomy and endplate decortication.\n4. Interbody Cage: Insert curved PEEK/Titanium interbody spacer packed with autologous local bone graft.\n5. Rod Placement & Compression: Place bilateral titanium rods; apply lordotic compression across screws to restore sagittal alignment.\n6. Layered wound closure over deep subfascial drain.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Pedicle Wall Breach: If EMG triggers at <6 mA, reposition screw immediately under fluoroscopic guidance.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Ambulate on POD 1 with physical therapy; drain removed when <50 mL/d.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Spine pedicle screw system (6.5mm screws), curved TLIF cage, Jackson table.'
            }
          ]
        }
      ]
    }
  ]
};
