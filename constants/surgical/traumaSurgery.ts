import { SpecialtyData } from '../SpecialtyData';

export const TRAUMA_SURGERY_SPECIALTY: SpecialtyData = {
  id: 'surgery_trauma',
  name: 'Trauma Surgery',
  scientificName: 'Trauma & Acute Care Surgery',
  icon: 'flame',
  color: '#eb988a', // Rose
  illustration: require('../../assets/images/specialties/infectious.jpg'),
  generalScope: 'Comprehensive acute trauma resuscitation, damage control surgery, massive transfusion protocols, emergency thoracotomy, solid organ injury, and compartment syndromes.',
  categories: [
    {
      id: 'damage_control_laparotomy',
      title: 'Damage Control Surgery & Resuscitation',
      description: 'Damage control laparotomy, lethal triad reversal, and massive transfusion protocols',
      icon: 'flame-outline',
      topics: [
        {
          id: 'trauma_damage_control_laparotomy',
          title: 'Trauma Damage Control Laparotomy & Four-Quadrant Packing',
          subtitle: 'Lethal Triad, Stapled Bowel Resection without Anastomosis & AbThera TAC',
          type: 'Emergency Damage Control Protocol',
          aiScopeDescription: 'Damage control laparotomy, lethal triad (hypothermia, acidosis, coagulopathy), four-quadrant packing, temporary abdominal closure (TAC), and second-look laparotomy.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 22-year-old male arrives in profound hemorrhagic shock following multiple abdominal gunshot wounds. BP 70/40, HR 145. FAST: Massive free fluid. Blood Gas: pH 7.12, Base Deficit -14, Lactate 8.4 mmol/L, Core Temp 34.5°C (Trauma Lethal Triad). Indication: Immediate Damage Control Laparotomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Activate 1:1:1 Massive Transfusion Protocol (MTP) + IV Tranexamic Acid (TXA 1g bolus); Level 1 rapid infuser in OR heated to 28°C.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Incision & Packing: Rapid xiphoid-to-pubis laparotomy; eviscerate bowel; pack all four quadrants with laparotomy sponges.\n2. Bleeding Control: Systematically unpack. Perform rapid splenectomy if shattered or Pringle maneuver for hepatic bleeding.\n3. Contamination Control: Rapid bowel run; staple across bowel injuries with GIA staplers without anastomosis or stomas.\n4. Abbreviated Surgery: Stop operation at <60 mins once bleeding/contamination controlled.\n5. Temporary Abdominal Closure (TAC): AbThera open abdomen negative pressure dressing (-125 mmHg).\n6. ICU Transport: Immediate transport to ICU for rewarming and correction of coagulopathy.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Abdominal Compartment Syndrome: Prevented by leaving abdomen open with vacuum dressing.\n• Second-Look: Return to OR in 24-48h for pack removal and definitive reconstruction.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• ICU: Target core temp >36°C, MAP >65 mmHg, lactate clearance q2h, ROTEM-guided coagulation correction.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Balfour retractor, GIA 60/80mm linear staplers, AbThera open abdomen dressing, Level 1 rapid infuser.'
            }
          ]
        },
        {
          id: 'resuscitative_ed_thoracotomy',
          title: 'Resuscitative Emergency Department Thoracotomy (EDT)',
          subtitle: 'Agonal Penetrating Trauma, Pericardiotomy, Cardiac Massage & Descending Aortic Cross-Clamping',
          type: 'Emergency Resuscitative Surgery',
          aiScopeDescription: 'Left anterolateral emergency thoracotomy, pericardiotomy for tamponade, open cardiac massage, and descending thoracic aortic cross-clamping.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 26-year-old male with a stab wound to the left parasternal 4th intercostal space loses vital signs upon arrival at the trauma bay (witnessed cardiac arrest <5 minutes). Indication: Immediate Left Anterolateral Resuscitative ED Thoracotomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Preformed Thoracotomy Tray opened immediately in trauma bay; intubation with right mainstem bronchial ventilation if possible.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Incision: Curvilinear left anterolateral thoracotomy in 5th intercostal space from sternum to mid-axillary line with #10 scalpel; divide intercostal muscles.\n2. Rib Spreading: Insert Finochietto rib retractor with handle directed toward axilla.\n3. Pericardiotomy: Grasp tense pericardium with toothed forceps; incise anterior and parallel to the phrenic nerve; evacuate hemopericardium / tamponade.\n4. Cardiac Repair: Digital control of right ventricular laceration; repair with 3-0 Prolene horizontal mattress sutures with Teflon pledgets or Foley catheter balloon tamponade.\n5. Internal Cardiac Massage: Two-handed bimanual internal cardiac massage.\n6. Aortic Cross-Clamping: Retract left lung anteriorly; mobilize descending thoracic aorta above diaphragm; apply DeBakey or Satinsky vascular cross-clamp (redistributes blood to coronary and cerebral circulation).'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Phrenic Nerve Transection: Incise pericardium strictly longitudinal and anterior to the phrenic nerve.\n• Esophageal Clamping: Palpate the nasogastric tube to differentiate esophagus from thoracic aorta.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• If ROSC achieved, transfer immediately to OR for definitive chest closure and ICU resuscitation.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Finochietto rib retractor, Lebsche sternal knife, Satinsky aortic clamp, 3-0 Prolene pledgeted sutures.'
            }
          ]
        },
        {
          id: 'four_compartment_leg_fasciotomy',
          title: 'Four-Compartment Lower Leg Fasciotomy',
          subtitle: 'Compartment Syndrome, Delta Pressure <30mmHg & Dual-Incision Technique',
          type: 'Emergency Limb Salvage',
          aiScopeDescription: 'Acute compartment syndrome, intracompartmental pressure measurement, dual-incision four-compartment fasciotomy, and vessel loops shoelace closure.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 31-year-old male with a closed high-energy tibia fracture status-post casting develops severe pain out of proportion to exam, tense "woody" calf swelling, and severe pain on passive stretch of the toes. Compartment pressure: 46 mmHg (Diastolic BP 70 mmHg -> Delta P 24 mmHg, <30 mmHg threshold). Indication: Emergent Dual-Incision Four-Compartment Fasciotomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Immediate cast removal; emergency OR transport without delay.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Anterolateral Incision: 15-20 cm longitudinal incision 2 cm lateral to anterior tibial crest between fibula and tibia.\n2. Anterior & Lateral Compartments: Identify intermuscular septum; incise anterior fascia (Anterior compartment containing anterior tibial artery and deep peroneal nerve); incise lateral fascia over peroneus muscles (Lateral compartment containing superficial peroneal nerve).\n3. Posteromedial Incision: 15-20 cm longitudinal incision 2 cm posterior to posterior tibial border.\n4. Superficial & Deep Posterior Compartments: Incise gastrocnemius-soleus fascia (Superficial posterior compartment); release soleus bridge off tibia to widely decompress the Deep posterior compartment (containing posterior tibial and peroneal vessels and tibial nerve).\n5. Muscle Viability: Confirm all muscle bellies are pink, bleed upon puncture, and contract with electrocautery (4 Cs: Color, Consistency, Contractility, Capillary bleeding).\n6. Negative Pressure Dressing: Place vessel-loop "shoelace" dermatotraction and negative pressure wound therapy (VAC dressing).'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Incomplete Decompression: Most common failure is missing the deep posterior compartment under the soleus.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Delayed primary closure or split-thickness skin graft in 5-7 days; monitor for rhabdomyolysis and myoglobinuria.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Long Metzenbaum scissors, Stryker intracompartmental pressure monitor, vessel loops, wound VAC.'
            }
          ]
        }
      ]
    }
  ]
};
