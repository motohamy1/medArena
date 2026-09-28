import { SpecialtyData } from '../SpecialtyData';

export const GI_SURGERY_SPECIALTY: SpecialtyData = {
  id: 'surgery_gi',
  name: 'GI Surgery',
  scientificName: 'Gastrointestinal & General Surgery',
  icon: 'cut',
  color: '#eb988a', // Rose
  illustration: require('../../assets/images/specialties/gastroenterology.jpg'),
  generalScope: 'Comprehensive gastrointestinal and abdominal surgery covering foregut, hepatobiliary, pancreatic, colorectal, abdominal wall, bariatric, and emergency general surgery.',
  categories: [
    {
      id: 'hepatobiliary_pancreatic',
      title: 'Hepatobiliary & Pancreatic Surgeries',
      description: 'Gallbladder, biliary tree, liver resections, and complex pancreatic surgery',
      icon: 'restaurant-outline',
      topics: [
        {
          id: 'lap_cholecystectomy',
          title: 'Laparoscopic Cholecystectomy',
          subtitle: 'Critical View of Safety, Calot Triangle & Strasberg Criteria',
          type: 'Standard Minimally Invasive',
          aiScopeDescription: 'Laparoscopic Cholecystectomy, Strasberg Critical View of Safety, Calot triangle clearance, IOC, and bile duct injury prevention.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 42-year-old female presents with episodic postprandial RUQ colicky pain radiating to the right scapula, aggravated by fatty meals. Positive Murphy sign. Ultrasound: Multiple mobile gallstones with acoustic shadowing, gallbladder wall 3.2 mm, normal CBD (4 mm). Indication: Symptomatic cholelithiasis indicated for elective Laparoscopic Cholecystectomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• ASA Classification: ASA II.\n• Clearance: RCRI <1%.\n• Antibiotics: Single-dose IV Cefazolin 2g within 60 mins before incision.\n• VTE Prophylaxis: Bilateral SCDs and pre-induction Subcutaneous Heparin 5000 units.\n• Positioning: Supine, reverse Trendelenburg 15° with left lateral tilt. ChloraPrep 2% skin prep.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Access: 10mm supraumbilical port via open Hasson; 12-15 mmHg pneumoperitoneum. Insert 10mm subxiphoid, 5mm subcostal, and 5mm anterior axillary ports.\n2. Retraction: Fundus retracted cephalad; infundibulum retracted laterally and inferiorly.\n3. Calot Triangle Dissection: Clear fat from hepatocystic triangle.\n4. Strasberg Critical View of Safety (CVS): (a) Hepatocystic triangle cleared of fat/fibrous tissue; (b) Lower third of gallbladder dissected off liver bed; (c) Only TWO structures entering gallbladder (cystic duct & cystic artery).\n5. Division: Apply 2 proximal and 1 distal titanium clip on cystic artery and duct and divide with endoscopic scissors.\n6. Mobilization: Dissect gallbladder from liver bed with monopolar L-hook. Extract in Endo-Catch bag via umbilical port.\n7. Closure: Fascia closed with 0-Vicryl; skin with 4-0 Monocryl.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Bile Duct Injury: Stop dissection; convert to subtotal fenestrating cholecystectomy or intraoperative cholangiogram (IOC) if anatomy unclear.\n• Cystic Artery Avulsion: Direct pressure with grasper; suction and clip under direct vision.\n• Spilled Stones: Meticulous retrieval with specimen bag and copious irrigation.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• PACU: Monitor vitals q15min x 1h, then q30min x 2h.\n• Analgesia: Multimodal non-opioid (IV Acetaminophen 1g + Ketorolac 15mg).\n• Diet & Discharge: Oral liquids in 2h; advance to regular diet; discharge same day (POD 0).'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Scope: 30° 10mm Laparoscope.\n• Trocars: 2x 10mm Hasson/bladed, 2x 5mm trocars.\n• Instruments: Maryland dissector, atraumatic toothed grasper, Monopolar L-hook, Ligaclip 10mm applier, Endo-Catch 10mm bag.'
            }
          ]
        },
        {
          id: 'subtotal_fenestrating_cholecystectomy',
          title: 'Subtotal Fenestrating Cholecystectomy',
          subtitle: 'Hostile Calot Triangle, Frozen Porta & Strasberg Bailout Technique',
          type: 'Surgical Bailout Protocol',
          aiScopeDescription: 'Subtotal cholecystectomy for acute severe cholecystitis, frozen Calot triangle, internal cystic duct closure, and biliary fistula prevention.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 68-year-old male with 6 days of acute gangrenous cholecystitis presents with severe inflammation and dense fibrous adhesions obscuring the hepatocystic triangle (frozen Calot triangle). Dissection cannot safely establish the Critical View of Safety. Indication: Bailout Subtotal Fenestrating Cholecystectomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• ASA III-E; Broad-spectrum IV Piperacillin-Tazobactam 4.5g.\n• Positioning: Reverse Trendelenburg with left lateral tilt; conversion laparotomy tray immediately available.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Decompression: Aspirate purulent gallbladder contents with laparoscopic aspirating needle.\n2. Incision: Open anterior gallbladder wall longitudinally from fundus to Hartmann pouch.\n3. Stone Evacuation: Evacuate all gallstones into specimen bag.\n4. Resection: Excise anterior and lateral free walls of the gallbladder, leaving the posterior wall attached to the liver bed (cauterize retained posterior mucosa with spray electrocoagulation).\n5. Cystic Duct Closure: Identify internal cystic duct orifice from inside Hartmann pouch; suture closed with internal purse-string or figure-of-eight 2-0 Vicryl/PDS.\n6. Drainage: Place a 19 Fr Blake closed-suction drain in Morison pouch.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Biliary Leak: Managed non-operatively with the placed closed-suction drain; ERCP stenting if high-output (>200 mL/d) beyond POD 5.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Monitor drain output daily for bile; keep drain in place until output <30 mL/24h of clear fluid.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Laparoscopic suction-irrigator, endo-needle holder, 2-0 Vicryl/PDS, 19 Fr Blake silicone drain.'
            }
          ]
        },
        {
          id: 'whipple_pancreatoduodenectomy',
          title: 'Pancreatoduodenectomy (Whipple Procedure)',
          subtitle: 'Pancreatic Head Adenocarcinoma, SMV/PV Tunneling & 3 Anastomoses',
          type: 'Major Complex Oncologic',
          aiScopeDescription: 'Whipple procedure, pancreatic head resection, SMA/SMV dissection, pancreaticojejunostomy, and post-pancreatectomy hemorrhage.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 64-year-old male presents with painless progressive obstructive jaundice, weight loss, total bilirubin 12.4 mg/dL, and CA 19-9 420 U/mL. CT: 2.8 cm resectable mass in pancreatic head causing double duct sign without vascular encasement. Indication: Classic or Pylorus-Preserving Whipple Procedure.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• ASA III; RCRI 2; Pre-op Vitamin K 10mg IV daily x 3 days.\n• Blood: 4 units PRBCs crossmatched; Thoracic epidural (T7-T8) placed.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Exploration & Kocherization: Extensive Kocher maneuver to aorta and IVC.\n2. Portal Dissection: Ligate gastroduodenal artery (GDA) with 2-0 Silk transfixion stitch.\n3. Tunneling & Transection: Tunnel beneath neck anterior to SMV/PV. Transect stomach, proximal jejunum, pancreas neck, and common hepatic duct.\n4. Specimen Delivery: Dissect uncinate process off SMA right lateral wall with serial hemoclips.\n5. Reconstruction (3 Anastomoses): (a) Pancreaticojejunostomy (duct-to-mucosa with 5-0 PDS); (b) Hepaticojejunostomy (4-0 PDS); (c) Gastrojejunostomy (stapled/hand-sewn).\n6. Drains: 2x closed-suction JP drains.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Postoperative Pancreatic Fistula (POPF): Check drain amylase on POD 3 (>3x serum).\n• Post-Pancreatectomy Hemorrhage: Intervene with emergent transcatheter angioembolization for GDA stump pseudoaneurysm.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Strict fluid zero-balance in ICU to prevent anastomotic edema. Early enteral J-tube feeds on POD 2.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Bookwalter retractor, LigaSure 5mm, Satinsky vascular clamp, 5-0 PDS (duct-to-mucosa), loop #1 PDS.'
            }
          ]
        },
        {
          id: 'distal_pancreatectomy_splenectomy',
          title: 'Distal Pancreatectomy with Splenectomy',
          subtitle: 'Pancreatic Body/Tail Neoplasms, Splenic Artery/Vein Ligation & Stapler Transection',
          type: 'Complex Oncologic Surgery',
          aiScopeDescription: 'Distal Pancreatectomy, body/tail neuroendocrine tumors and adenocarcinoma, splenic vessel ligation, and staple line reinforcement.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 58-year-old female presents with vague epigastric pain. MRI: 3.5 cm cystic/solid mucinous cystic neoplasm (MCN) in the pancreatic tail abutting the splenic hilum. Indication: Laparoscopic or Open Distal Pancreatectomy and Splenectomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Pre-op encapsulated organism vaccines (Pneumococcal, Meningococcal, Hib) administered 14 days pre-op.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Exposure: Enter lesser sac through gastrocolic omentum; retract stomach cephalad.\n2. Inferior & Superior Mobilization: Dissect along inferior border of pancreas, identify splenic vein.\n3. Splenic Vessel Control: Ligate splenic artery and vein at pancreatic neck with Endo-GIA vascular staplers.\n4. Pancreatic Transection: Transect pancreas neck slowly over 2-3 minutes with reinforced Endo-GIA stapler (Black/Purple cartridge with Seamguard).\n5. Splenic Mobilization: Mobilize spleen laterally, divide short gastric vessels, and deliver specimen en bloc.\n6. Drainage: Place JP drain at pancreatic stump.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Pancreatic leak: Controlled with closed-suction JP drain and NPO/TPN if output high.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Check drain amylase on POD 3. Thrombocytosis monitoring (Aspirin if platelets >750k).'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Endo-GIA 60mm stapler with Seamguard, Harmonic scalpel, Bookwalter retractor.'
            }
          ]
        },
        {
          id: 'lap_right_hepatectomy',
          title: 'Right Hepatectomy (Segments V-VIII)',
          subtitle: 'Colorectal Liver Metastasis, Glissonean Pedicle & Cavitron Ultrasonic Aspirator (CUSA)',
          type: 'Major Hepatobiliary Resection',
          aiScopeDescription: 'Right Hepatectomy, liver metastases, future liver remnant (FLR), CUSA parenchymal transection, and low CVP anesthesia.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 60-year-old male with resected sigmoid colon adenocarcinoma presents with solitary 5 cm right hepatic lobe metastasis (Segments VI/VII). Future Liver Remnant (FLR) volume is 38% on volumetry. Indication: Right Hepatectomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Anesthesia: Low Central Venous Pressure (CVP <5 mmHg) maintained during parenchymal transection to minimize hepatic vein bleeding.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Inflow Control: Extrahepatic isolation and ligation of right hepatic artery and right portal vein branch.\n2. Ischemic Demarcation: Visualize Cantlie line demarcation from gallbladder fossa to IVC.\n3. Parenchymal Transection: CUSA (Cavitron Ultrasonic Surgical Aspirator) ultrasonic dissection along Cantlie line, clipping small vessels.\n4. Outflow Control: Staple right hepatic vein with vascular Endo-GIA stapler at IVC confluence.\n5. Bile Leak Test: White gauze test on cut liver surface.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Air Embolism / Major Bleeding: If hepatic vein tears, clamp with Satinsky, lower table, and repair with 4-0 Prolene.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• ICU monitoring for post-hepatectomy liver failure (50-50 criteria: Bilirubin >50 µmol/L and PT <50% on POD 5).'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• CUSA ultrasonic aspirator, Pringle clamp, vascular stapler, FloSeal hemostatic matrix.'
            }
          ]
        },
        {
          id: 'lap_left_lateral_segmentectomy',
          title: 'Laparoscopic Left Lateral Sectionectomy (Segments II/III)',
          subtitle: 'Standard Anatomical Hepatic Resection for Benign/Malignant Lesions',
          type: 'Minimally Invasive Hepatic',
          aiScopeDescription: 'Segments II and III resection, left Glissonean pedicle stapling, and laparoscopic parenchymal transection.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 45-year-old female presents with a 6 cm symptomatic hepatic adenoma in segment II/III. Indication: Laparoscopic Left Lateral Sectionectomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Pre-op contrast MRI with Primovist; low CVP (<5 mmHg) anesthetic management.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Ports: 4-port laparoscopic setup.\n2. Falciform & Triangular Ligament: Mobilize left triangular ligament.\n3. Pedicle Isolation: Encircle Glissonean pedicle for segments II/III with vascular tape; transect with vascular stapler.\n4. Transection: Dissect along falciform ligament using LigaSure/Thunderbeat.\n5. Outflow: Staple left hepatic vein tributary; extract specimen via Pfannenstiel incision.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Hemostasis: Bipolar coagulation and tachosil hemostatic fleece patch on raw surface.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Same-day ambulation; discharge on POD 1 or 2 with baseline LFT checks.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Thunderbeat energy device, Endo-GIA vascular staplers, Endo-Catch 15mm bag.'
            }
          ]
        },
        {
          id: 'choledochal_cyst_excision',
          title: 'Choledochal Cyst Excision & Roux-en-Y Hepaticojejunostomy',
          subtitle: 'Todani Type I Cyst, Complete Excision & Biliary Reconstruction',
          type: 'Reconstructive Biliary Surgery',
          aiScopeDescription: 'Choledochal cyst Todani classification, malignancy risk, full excision to confluence, and Roux-en-Y reconstruction.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 29-year-old female presents with recurrent cholangitis, RUQ pain, and jaundice. MRCP: Todani Type IC fusiform dilation of the entire extrahepatic bile duct (3.8 cm diameter) with anomalous pancreaticobiliary junction. Indication: Complete Cyst Excision and Roux-en-Y Hepaticojejunostomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Broad-spectrum antibiotics; blood crossmatch 2 units PRBCs.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Cholecystectomy: Perform cholecystectomy in continuity with cyst.\n2. Distal Cyst Dissection: Dissect cyst wall down into the pancreatic head to the narrow junction with the pancreatic duct; transfix with 3-0 PDS (prevent pancreatic duct injury).\n3. Proximal Dissection: Dissect cyst proximally to healthy common hepatic duct confluence.\n4. Reconstruction: Construct 40-50 cm retrocolic Roux-en-Y jejunal limb; perform end-to-side Hepaticojejunostomy with interrupted 4-0/5-0 PDS.\n5. Jejunojejunostomy: Side-to-side stapled bowel anastomosis.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Pancreatic Duct Injury: Avoid deep clamping at distal cyst taper; cannulate duct if questionable.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Monitor drain bilirubin; advance diet on POD 2-3.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• 5-0 PDS on RB-1 needle, GIA 60mm stapler, Omni-Tract retractor.'
            }
          ]
        },
        {
          id: 'open_common_bile_duct_exploration',
          title: 'Open Common Bile Duct Exploration (CBDE) & T-Tube',
          subtitle: 'Choledocholithiasis, Choledochotomy, Fogarty Extraction & T-Tube Drainage',
          type: 'Biliary Emergency / Reconstruction',
          aiScopeDescription: 'Choledocholithiasis failed ERCP, choledochotomy, flexible choledochoscopy, stone basket extraction, and T-tube placement.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 74-year-old female with altered anatomy (prior Roux-en-Y gastric bypass) presents with acute cholangitis and an impacted 14 mm stone in the distal common bile duct refractory to endoscopic access. Indication: Open Choledochotomy and Common Bile Duct Exploration.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Sepsis bundle resuscitation with IV Piperacillin-Tazobactam; correct coagulopathy.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Exposure: Right subcostal Kocher incision; expose hepatoduodenal ligament.\n2. Needle Aspiration: Confirm CBD by aspirating bile with fine needle.\n3. Choledochotomy: Longitudinal 1 cm anterior incision on CBD between stay sutures.\n4. Stone Extraction: Pass 4 Fr biliary Fogarty balloon catheter and flexible choledochoscope with Dormia basket to retrieve stones.\n5. T-Tube Placement: Insert 14-16 Fr rubber T-tube; close choledochotomy around T-tube with interrupted 4-0 PDS.\n6. Completion Cholangiogram: Inject contrast through T-tube to confirm free flow into duodenum and zero retained stones.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Duodenal stricture / ampullary trauma: Never force rigid metal instruments through the ampulla of Vater.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Keep T-tube to gravity drainage; perform T-tube cholangiogram at 2-3 weeks post-op before removal.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Flexible choledochoscope, Dormia stone basket, 4 Fr Fogarty catheter, 14 Fr latex T-tube.'
            }
          ]
        }
      ]
    },
    {
      id: 'foregut_bariatric',
      title: 'Esophageal, Foregut & Bariatric Surgeries',
      description: 'Hiatal hernia, fundoplication, gastrectomy, and metabolic weight loss procedures',
      icon: 'fitness-outline',
      topics: [
        {
          id: 'lap_nissen_fundoplication',
          title: 'Laparoscopic Nissen Fundoplication',
          subtitle: 'GERD, Hiatal Hernia Repair, Crural Approximation & 360° Wrap',
          type: 'Foregut Functional Surgery',
          aiScopeDescription: 'Nissen fundoplication, hiatal hernia reduction, crural closure, short gastric division, "floppy" 360-degree 2 cm wrap over 56 Fr bougie.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 46-year-old male presents with severe refractory GERD, regurgitation, and a 4 cm Type I sliding hiatal hernia on barium swallow. DeMeester score on 24h pH monitoring: 48.2 (severe acid exposure). Indication: Laparoscopic Hiatal Hernia Repair with 360° Nissen Fundoplication.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Pre-op High-Resolution Esophageal Manometry confirms normal peristaltic amplitude (>30 mmHg).'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Access: 5-port upper abdominal configuration; Nathanson liver retractor placed.\n2. Dissection: Dissect phrenoesophageal membrane; mobilize distal 3-4 cm of intra-abdominal esophagus.\n3. Short Gastrics: Divide upper short gastric vessels with ultrasonic shears to mobilize gastric fundus.\n4. Crural Repair: Approximate right and left diaphragmatic crura posteriorly using interrupted 0-Ethibond or 0-PDS sutures.\n5. Fundoplication: Pass fundus behind esophagus (shoeshine maneuver); create a 2 cm floppy 360° wrap around esophagus over a 56 Fr esophageal bougie using three 2-0 Silk sutures (including the anterior esophageal wall in the middle stitch).'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Wrap too tight / Dysphagia: Prevented by calibrating over 56 Fr bougie and ensuring shoeshine mobility.\n• Pneumothorax / Pleural tear: Treat conservatively unless tension pneumothorax.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Soft mechanical diet for 2-4 weeks; avoid carbonated beverages and straws.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Nathanson liver retractor, 56 Fr esophageal bougie, Harmonic shears, 0-Ethibond sutures.'
            }
          ]
        },
        {
          id: 'lap_heller_myotomy',
          title: 'Laparoscopic Heller Myotomy with Dor Fundoplication',
          subtitle: 'Achalasia, Eckardt Score, 7cm Myotomy & Anterior Partial Wrap',
          type: 'Foregut Functional Surgery',
          aiScopeDescription: 'Esophageal achalasia, Eckardt score, circular/longitudinal muscle myotomy (5cm esophagus, 2cm stomach), and Dor anterior fundoplication.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 34-year-old female presents with progressive dysphagia to both solids and liquids, regurgitation of undigested food, and 6 kg weight loss (Eckardt score 7). Barium swallow: "Bird\'s beak" tapering of GE junction. Manometry: Type II Achalasia with absent peristalsis and panesophageal pressurization. Indication: Laparoscopic Heller Myotomy with Anterior Dor Fundoplication.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Liquid diet for 48h pre-op; large-bore Ewald tube stomach lavage before intubation.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Exposure: Expose anterior GE junction and distal 5 cm of mediastinal esophagus.\n2. Myotomy: Incise longitudinal and circular esophageal muscle layers anteriorly using hook electrocautery or micro-scissors down to the bulging submucosa (extend 5 cm onto esophagus and 2 cm onto gastric cardia).\n3. Endoscopic / Air Leak Test: Perform intraoperative upper endoscopy; insufflate air to verify mucosal integrity and wide GEJ opening.\n4. Dor Fundoplication: Construct 180° anterior partial wrap suturing fundus to left and right edges of the myotomy with 2-0 Silk to cover exposed mucosa and prevent GERD.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Mucosal Perforation: Close immediately with interrupted 4-0 PDS and cover with the Dor fundoplication.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Gastrografin swallow on POD 1 before starting liquid diet.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Flexible intraoperative gastroscope, hook cautery, 2-0 Silk, 4-0 PDS.'
            }
          ]
        },
        {
          id: 'lap_roux_en_y_gastric_bypass',
          title: 'Laparoscopic Roux-en-Y Gastric Bypass (LRYGB)',
          subtitle: 'Morbid Obesity, 30mL Gastric Pouch, 150cm Roux Limb & Petersen Defect Closure',
          type: 'Bariatric & Metabolic Surgery',
          aiScopeDescription: 'Roux-en-Y Gastric Bypass, 30 mL pouch, 100 cm biliopancreatic limb, 150 cm Roux limb, gastrojejunostomy, and Petersen internal hernia closure.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 41-year-old male with BMI 46.5 kg/m², poorly controlled Type 2 Diabetes on insulin, severe sleep apnea, and HTN presents for bariatric surgery. Indication: Laparoscopic Roux-en-Y Gastric Bypass.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Pre-op CPAP optimization; multi-disciplinary bariatric clearance; pre-op 2-week liver-shrinking low-calorie diet.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Gastric Pouch Creation: Create a vertical 30 mL restrictive gastric pouch along the lesser curvature using linear Endo-GIA staplers (Purple/Black cartridges).\n2. Biliopancreatic Limb: Measure 50-100 cm of proximal jejunum from Ligament of Treitz; divide jejunum.\n3. Roux Limb: Measure 100-150 cm alimentary Roux limb antecolic.\n4. Gastrojejunostomy (GJ): Create 15-20 mm hand-sewn or linear stapled GJ anastomosis.\n5. Jejunojejunostomy (JJ): Side-to-side stapled JJ between biliopancreatic limb and Roux limb.\n6. Mesenteric Defect Closure: Mandatory closure of Petersen defect and transverse mesocolon / mesenteric defect with running permanent 2-0 Ethibond sutures (prevents internal herniation).\n7. Leak Test: Methylene blue instillation leak test.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Anastomotic Leak: Inspect staple lines; oversew any suspicious points with 3-0 Vicryl/PDS.\n• Internal Hernia: Sudden post-op colicky pain without fever warrants emergent CT or laparoscopy.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Early mobilization in 2 hours; bariatric clear liquids POD 1; lifelong multivitamin, B12, iron, and calcium supplementation.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Bariatric long trocars and instruments, Endo-GIA Tri-Staple 60mm, 2-0 Ethibond sutures.'
            }
          ]
        },
        {
          id: 'lap_sleeve_gastrectomy',
          title: 'Laparoscopic Sleeve Gastrectomy (LSG)',
          subtitle: 'Greater Curvature Resection, 36-40 Fr Bougie Calibration & Staple Line Reinforcement',
          type: 'Bariatric Surgery Protocol',
          aiScopeDescription: 'Sleeve gastrectomy, greater curvature mobilization, short gastric division, 38 Fr calibration, and staple line bleeding/leak prevention.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 35-year-old female with BMI 42 kg/m² and PCOS presents for bariatric metabolic surgery. Indication: Laparoscopic Sleeve Gastrectomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Pre-op H. pylori screening and eradication; DVT chemoprophylaxis.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Mobilization: Dissect gastrocolic ligament and short gastric vessels from 4 cm proximal to pylorus up to the angle of His.\n2. Bougie Placement: Insert 36-40 Fr bougie along the lesser curvature.\n3. Gastric Transection: Sequential firings of Endo-GIA staplers (Black/Purple cartridges) parallel to the bougie from 4 cm pre-pyloric to 1 cm lateral to esophagus.\n4. Staple Line Inspection: Oversew or apply Seamguard buttress material to prevent bleeding/leak.\n5. Extraction: Remove 80% resected stomach specimen in Endo-Catch bag.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Staple Line Leak at Angle of His: High-pressure leak site; manage with endoscopic pigtail drain stenting or re-laparoscopy.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Sips of water on POD 0, bariatric liquid diet POD 1; Omeprazole 40mg daily x 3 months.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• 38 Fr bariatric bougie, LigaSure Maryland jaw, Endo-GIA 60mm reinforced staplers.'
            }
          ]
        },
        {
          id: 'subtotal_gastrectomy_d2_lymphadenectomy',
          title: 'Subtotal Gastrectomy with D2 Lymphadenectomy',
          subtitle: 'Distal Gastric Cancer, Station 1-12 Lymph Nodes & Billroth II / Roux-en-Y Reconstruction',
          type: 'Major Oncologic Gastric',
          aiScopeDescription: 'Gastric adenocarcinoma, 5 cm margins, D2 lymph node dissection (stations 1-12), and Roux-en-Y gastrojejunostomy.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 62-year-old male presents with early satiety, melena, and iron deficiency anemia. Upper endoscopy: 3 cm ulcerated adenocarcinoma of the gastric antrum (Lauren intestinal type). CT: cT2 N1 M0 with no distant disease. Indication: Subtotal Gastrectomy with D2 Lymph Node Dissection and Roux-en-Y Reconstruction.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Nutritional assessment; type and cross 2 units PRBCs.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Omentectomy: Strip greater omentum off transverse colon.\n2. Duodenal Division: Divide right gastric and right gastroepiploic vessels; transect proximal duodenum with linear stapler.\n3. D2 Lymphadenectomy: Systematically clear lymph node stations 1-6 (perigastric) and stations 7 (left gastric artery), 8a (common hepatic), 9 (celiac trunk), 11p (splenic artery), and 12a (hepatoduodenal).\n4. Gastric Transection: Transect stomach with ≥5 cm proximal macroscopic margin.\n5. Reconstruction: Antecolic Roux-en-Y Gastrojejunostomy or Billroth II with Braun enteroenterostomy.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Duodenal Stump Blowout: Suture reinforce duodenal staple line; place nearby JP drain.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• ERAS protocol, early oral feeding on POD 3 once bowel function returns.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Bookwalter retractor, GIA 60/80mm linear stapler, LigaSure energy device.'
            }
          ]
        },
        {
          id: 'total_gastrectomy_roux_en_y',
          title: 'Total Gastrectomy with D2 Lymphadenectomy & Roux-en-Y Esophagojejunostomy',
          subtitle: 'Proximal Gastric Cancer, CDH1 Mutation & Circular Stapled End-to-Side Anastomosis',
          type: 'Major Oncologic Gastric',
          aiScopeDescription: 'Total gastrectomy, diffuse gastric cancer, D2 nodal clearance, and circular stapled (Orvil / EEA 25mm) Esophagojejunostomy.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 53-year-old female presents with diffuse signet-ring cell adenocarcinoma of the gastric body. CT: cT3 N1 M0. Indication: Total Gastrectomy with D2 Lymphadenectomy and Roux-en-Y Esophagojejunostomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Blood preparation; preoperative pulmonary optimization.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Dissection & Omentectomy: En-bloc resection of greater and lesser omentum.\n2. Vascular Ligation & D2 Nodes: Ligate left gastric, right gastric, gastroepiploic, and short gastric vessels with stations 1-12 lymph nodes.\n3. Transection: Transect duodenum distally; transect distal esophagus 2 cm above GE junction with frozen section margin confirmation.\n4. Esophagojejunostomy: Insert 25mm circular EEA stapler anvil into esophagus (purse-string 2-0 Prolene or transoral Orvil device); connect to circular stapler in Roux limb to construct end-to-side anastomosis.\n5. Complete 45 cm Roux-en-Y Jejunojejunostomy.\n6. Leak Test: Air/saline immersion test.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Esophagojejunal Leak: Check tissue donuts for completeness; suture reinforce posterior wall.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Water-soluble contrast swallow on POD 4; lifelong vitamin B12 IM injections (1000 mcg monthly).'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• 25mm Circular EEA stapler with Orvil system, Bookwalter retractor, linear staplers.'
            }
          ]
        },
        {
          id: 'lap_graham_patch_repair',
          title: 'Laparoscopic Graham Patch Omental Repair for Perforated Peptic Ulcer',
          subtitle: 'Pneumoperitoneum, Peritoneal Lavage & 3-Suture Vascularized Omental Plug',
          type: 'Emergency Foregut Protocol',
          aiScopeDescription: 'Perforated duodenal/gastric ulcer, Graham patch omentoplasty, peritoneal lavage, and IV PPI infusion.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 49-year-old male smoker taking chronic high-dose NSAIDs presents with sudden catastrophic epigastric pain and rigid "board-like" abdomen. Upright CXR: Massive subdiaphragmatic free air (pneumoperitoneum). Indication: Emergent Laparoscopic or Open Graham Patch Repair.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Resuscitation with balanced crystalloids; IV Pantoprazole 80mg bolus + 8mg/h infusion; IV Ceftriaxone + Metronidazole.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Access: Supraumbilical 10mm port, 2x 5mm working ports.\n2. Exploration & Suction: Aspirate 1.5L of bilious fluid; identify 5 mm perforation on anterior duodenal bulb.\n3. Biopsy: Biopsy ulcer edge if gastric (rule out malignancy).\n4. Suture Placement: Place three full-thickness 2-0 Vicryl/Silk stay sutures across the perforation without tying.\n5. Omental Plug: Mobilize a vascularized pedicle of greater omentum; place over the perforation and tie the sutures gently over the omental plug without strangulating the tissue.\n6. Copious Lavage: 6-8 Liters of warm saline peritoneal washout.\n7. Subhepatic closed-suction drain.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Giant Perforations (>2 cm): Consider pyloroplasty, Graham-patch gastrostomy, or antrectomy.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Keep NPO with NG tube decompression until flatus; treat for H. pylori post-operatively.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Laparoscopic suction-irrigator, 2-0 Vicryl sutures on SH needle, 19 Fr Blake drain.'
            }
          ]
        }
      ]
    },
    {
      id: 'colorectal_anorectal',
      title: 'Colorectal & Anorectal Surgeries',
      description: 'Colectomies, low anterior resection, stoma creation, and perianal procedures',
      icon: 'git-commit-outline',
      topics: [
        {
          id: 'lap_right_hemicolectomy',
          title: 'Laparoscopic Right Hemicolectomy',
          subtitle: 'Cecal / Ascending Colon Cancer, CME with Central Vascular Ligation & Ileocolic Anastomosis',
          type: 'Minimally Invasive Colorectal',
          aiScopeDescription: 'Right hemicolectomy, Complete Mesocolic Excision (CME), ileocolic and right colic artery ligation, and extracorporeal/intracorporeal anastomosis.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 67-year-old female presents with microcytic iron deficiency anemia and fatigue. Colonoscopy: 4 cm ulcerated adenocarcinoma of the cecum. CT: cT3 N1 M0 with no distant metastases. Indication: Laparoscopic Right Hemicolectomy with Complete Mesocolic Excision.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• ERAS Colorectal Pathway: Preoperative mechanical bowel prep with oral antibiotics (Neomycin + Metronidazole) and carbohydrate loading drink.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Medial-to-Lateral Dissection: Incise peritoneum at root of mesentery below ileocolic pedicle. Dissect retroperitoneal plane, identifying and protecting right ureter and gonadal vessels and duodenum (D3/D4).\n2. Central Vascular Ligation (CVL): Ligate ileocolic artery and vein and right branch of middle colic artery at their origins with hemoclips/energy.\n3. Lateral Mobilization: Incise line of Toldt along right paracolic gutter; mobilize hepatic flexure.\n4. Resection: Transect terminal ileum 10 cm proximal to IC valve and transverse colon distal to hepatic flexure.\n5. Anastomosis: Construct isoperistaltic side-to-side stapled ileocolic anastomosis (intracorporeal or extracorporeal via small midline extraction incision).\n6. Close mesenteric defect with 3-0 Vicryl.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Duodenal / Ureteral Injury: Always identify duodenum before high ligation of the ileocolic pedicle.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• ERAS: Early oral intake on POD 0/1; Alvimopan (Entereg) 12mg PO BID to prevent post-op ileus; discharge POD 2-3.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Endo-GIA 60mm stapler (Blue/Purple cartridges), LigaSure/Harmonic, Alexis wound protector.'
            }
          ]
        },
        {
          id: 'lap_low_anterior_resection',
          title: 'Laparoscopic Low Anterior Resection (LAR) with TME',
          subtitle: 'Mid/Low Rectal Cancer, Total Mesorectal Excision & Diverting Loop Ileostomy',
          type: 'Complex Oncologic Colorectal',
          aiScopeDescription: 'Low Anterior Resection (LAR), Total Mesorectal Excision (TME), "holy plane" of Heald, autonomic nerve preservation, circular stapled colorectal anastomosis, and loop ileostomy.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 56-year-old male with mid-rectal adenocarcinoma at 7 cm from the anal verge completes neoadjuvant chemoradiation (TNT protocol). Restaging MRI: yT2 yN0. Indication: Laparoscopic Low Anterior Resection with Total Mesorectal Excision (TME) and Diverting Loop Ileostomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Stoma marking in RLQ by WOC nurse; mechanical bowel prep + oral antibiotics; rigid proctoscopy in OR.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. IMA High Ligation: Isolate and ligate Inferior Mesenteric Artery 1.5 cm from aorta and IMV at inferior border of pancreas (preserves superior hypogastric plexus nerves).\n2. Splenic Flexure Mobilization: Take down splenic flexure for tension-free descent into pelvis.\n3. Total Mesorectal Excision (TME): Dissect in the avascular "holy plane" between visceral mesorectal fascia and parietal presacral fascia under direct vision down to the pelvic floor/levator ani.\n4. Rectal Transection: Transect rectum ≥2 cm distal to tumor margin with articulating curved cutter stapler (Contour or Endo-GIA).\n5. Colorectal Anastomosis: 28/29mm circular EEA end-to-end colorectal anastomosis; complete air-leak test with rigid sigmoidoscopy.\n6. Diverting Stoma: Construct loop ileostomy in RLQ to protect low anastomosis.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Anastomotic Leak: Prevented by tension-free, well-vascularized bowel (check ICG fluorescence) and diverting loop ileostomy.\n• Autonomic Nerve Injury: Avoid injuring hypogastric nerves (erectile/ejaculatory dysfunction).'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Stoma education; ERAS diet advancement; stoma reversal scheduled at 8-12 weeks.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• 29mm Circular EEA stapler, articulating Endo-GIA 45/60mm stapler, rigid sigmoidoscope.'
            }
          ]
        },
        {
          id: 'lap_hartmann_procedure',
          title: 'Hartmann Procedure for Perforated Diverticulitis',
          subtitle: 'Hinchey III/IV Diverticulitis, Sigmoid Resection, End Colostomy & Rectal Stump',
          type: 'Emergency Colorectal Protocol',
          aiScopeDescription: 'Hinchey III/IV diverticulitis, purulent/feculent peritonitis, sigmoid colectomy, end colostomy, and Hartmann pouch closure.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 63-year-old male presents with 3 days of LLQ pain, high fever, septic shock (BP 85/50, HR 125), and generalized peritoneal rigidity. CT: Perforated sigmoid diverticulitis with gross feculent peritonitis and extraluminal gas (Hinchey IV). Indication: Emergent Laparotomy and Hartmann Procedure.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Sepsis resuscitation, broad-spectrum IV antibiotics, blood crossmatch, stoma site marking in LLQ.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Midline Laparotomy: Rapid evacuation of feculent peritonitis and 10L warm saline irrigation.\n2. Sigmoid Mobilization: Mobilize phlegmonous sigmoid colon off left iliac vessels and ureter.\n3. Resection: Divide sigmoid colon proximally at healthy descending colon and distally at rectosigmoid junction with GIA staplers.\n4. Rectal Stump: Close rectal stump (Hartmann pouch) securely with stapler, or leave long stay sutures to sacral promontory for easy future reversal.\n5. End Colostomy: Bring proximal descending colon through left lower quadrant rectus muscle as a matured end colostomy.\n6. Pelvic Drainage: Place closed-suction JP drain in pelvis.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Left Ureteral Injury: Stenting or direct identification before dividing lateral peritoneal attachments in severe inflammation.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• ICU sepsis care; stoma color/vitality checks q4h; stoma reversal (Hartmann reversal) planned in 3-6 months.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Balfour retractor, GIA 60/80mm staplers, end-stoma trephine instruments.'
            }
          ]
        },
        {
          id: 'abdominoperineal_resection_apr',
          title: 'Abdominoperineal Resection (APR / Miles Operation)',
          subtitle: 'Very Low Rectal / Anal Margin Cancer, Extralevator APR & Permanent End Colostomy',
          type: 'Major Complex Colorectal',
          aiScopeDescription: 'Abdominoperineal resection, levator ani en-bloc excision, cylindrical extralevator APR (ELAPR), and perineal defect reconstruction.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 59-year-old male presents with adenocarcinoma of the low rectum 2 cm from the anal verge invading the internal anal sphincter (sphincter-saving surgery impossible). Indication: Extralevator Abdominoperineal Resection (ELAPR).'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Stoma marking in LLQ; bowel prep; prone jack-knife or lithotomy positioning.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Abdominal Phase: Mobilize left colon, high IMA ligation, TME dissection to pelvic floor.\n2. End Colostomy: Mature end colostomy in LLQ.\n3. Perineal Phase: Prone jack-knife position; purse-string anus; incise ischiorectal fossa lateral to external sphincter; excise levator ani origins off pelvic sidewalls to deliver cylindrical specimen.\n4. Perineal Closure: Biological mesh or VRAM (vertical rectus abdominis myocutaneous) flap closure of perineal pelvic floor defect.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Perineal Wound Dehiscence: Prevented by flap/mesh reconstruction.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Avoid sitting on perineum for 2 weeks; stoma management.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Lone Star perineal retractor, Bookwalter retractor, biological mesh.'
            }
          ]
        },
        {
          id: 'lap_total_proctocolectomy_ipaa',
          title: 'Total Proctocolectomy with Ileal Pouch-Anal Anastomosis (IPAA / J-Pouch)',
          subtitle: 'Refractory Ulcerative Colitis, FAP & 2-Stage J-Pouch Reconstruction',
          type: 'Complex Colorectal Reconstruction',
          aiScopeDescription: 'Restorative proctocolectomy, Ulcerative Colitis, FAP, 15 cm J-pouch construction, hand-sewn/stapled pouch-anal anastomosis, and loop ileostomy.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 28-year-old female with severe pancolitis Ulcerative Colitis refractory to Infliximab and Upadacitinib presents for definitive surgical management. Indication: Restorative Total Proctocolectomy with Ileal J-Pouch Anal Anastomosis (IPAA).'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Taper corticosteroids; nutritional optimization; stoma site marking.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Total Colectomy: Mobilize and resect entire colon from cecum to rectosigmoid.\n2. Proctectomy: Close rectal dissection precisely on the rectal wall to preserve pelvic autonomic nerves.\n3. J-Pouch Construction: Fold distal 30 cm of terminal ileum into a 15 cm "J" configuration; construct pouch with sequential Endo-GIA linear staplers.\n4. Ileal Pouch-Anal Anastomosis (IPAA): Double-stapled or hand-sewn anastomosis at the dentate line.\n5. Diverting Loop Ileostomy: RLQ loop ileostomy.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Pouch Ischemia / Tension: Perform mesenteric lengthening incisions on peritoneal leaves of SMA if pouch does not reach pelvis easily.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Contrast pouchogram at 8 weeks prior to loop ileostomy reversal.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Endo-GIA 60/100mm staplers, circular EEA stapler, Lone Star retractor.'
            }
          ]
        },
        {
          id: 'subtotal_colectomy_end_ileostomy',
          title: 'Subtotal Colectomy with End Ileostomy for Toxic Megacolon',
          subtitle: 'Severe Acute Colitis, C. difficile Colitis & Abdominal Wall Hartmann Closure',
          type: 'Emergency Colorectal Protocol',
          aiScopeDescription: 'Toxic megacolon, fulminant Clostridioides difficile colitis, acute severe UC flare, cecal blow-out prevention, and subtotal colectomy.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 32-year-old male with acute severe ulcerative colitis admitted for 4 days on IV steroids develops worsening abdominal distension, tachycardia (HR 135), fever (39.2°C), and WBC 28,000/µL. Abdominal X-ray: Transverse colon dilation to 7.5 cm (toxic megacolon). Indication: Emergent Subtotal Colectomy with End Ileostomy.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Resuscitation; hold all antimotility agents/opioids; RLQ stoma marking.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Laparotomy: Midline incision; handle friable distended colon extremely gently to avoid intraoperative rupture.\n2. Mobilization: Mobilize right colon, transverse colon, and left colon off retroperitoneum.\n3. Resection: Transect terminal ileum 5 cm from IC valve and rectosigmoid junction at the sacral promontory.\n4. Rectal Stump: Close rectosigmoid stump with stapler or mature as mucous fistula in LLQ / subcutaneous tissue.\n5. End Ileostomy: Mature end ileostomy in RLQ with everted Brooke spout.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Intraoperative Perforation: Copious warm saline irrigation and broad-spectrum antibiotic coverage.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Monitor high stoma output (>1500 mL/d); replacement with oral rehydration solution and loperamide.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• GIA 60/80mm linear staplers, Balfour retractor, 3-0 Vicryl for stoma maturation.'
            }
          ]
        }
      ]
    },
    {
      id: 'abdominal_wall_hernia',
      title: 'Abdominal Wall & Hernia Surgery',
      description: 'Inguinal, ventral, incisional, and component separation repairs',
      icon: 'shield-checkmark-outline',
      topics: [
        {
          id: 'lichtenstein_inguinal_hernioplasty',
          title: 'Lichtenstein Tension-Free Inguinal Hernioplasty',
          subtitle: 'Direct/Indirect Inguinal Hernia, Ilioinguinal Nerve Preservation & Polypropylene Mesh',
          type: 'Standard Open Hernia Repair',
          aiScopeDescription: 'Lichtenstein repair, open inguinal canal, ilioinguinal/genitofemoral nerve preservation, mesh fixation to pubic tubercle and inguinal ligament.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 55-year-old male presents with a reducible right groin bulge that increases with coughing and standing. Exam: Cough impulse present at external inguinal ring. Indication: Elective Lichtenstein Inguinal Hernioplasty.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• ASA I-II; Local/regional or general anesthesia; single-dose Cefazolin.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Incision: Oblique skin incision 2 cm above and parallel to inguinal ligament.\n2. Open Canal: Incise external oblique aponeurosis along the line of its fibers.\n3. Nerve Identification: Identify and gently preserve ilioinguinal nerve, iliohypogastric nerve, and genital branch of genitofemoral nerve.\n4. Cord Mobilization: Mobilize spermatic cord at pubic tubercle; encircle with Penrose drain.\n5. Hernia Sac: Dissect and invert direct sac (or dissect and high-ligate indirect sac).\n6. Mesh Placement: 7.5 x 15 cm polypropylene mesh trimmed. Suture lower border to pubic tubercle (overlapping 2 cm medial) and shelving edge of inguinal ligament with running 2-0 Prolene. Slit mesh around spermatic cord and suture tails together behind cord.\n7. Layered closure.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Chronic Inguinodynia / Nerve Entrapment: Never place sutures into periosteum of pubic tubercle or entrap ilioinguinal nerve.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Same-day discharge; no heavy lifting (>15 lbs) for 4 weeks.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Penrose drain, 2-0 Prolene on SH needle, 7.5x15 cm Polypropylene mesh.'
            }
          ]
        },
        {
          id: 'lap_tapp_tep_hernia',
          title: 'Laparoscopic TAPP & TEP Inguinal Hernia Repair',
          subtitle: 'Preperitoneal Anatomy, "Doom & Pain Triangles" & 3D Max Mesh Fixation',
          type: 'Minimally Invasive Hernia',
          aiScopeDescription: 'Transabdominal Preperitoneal (TAPP) and Totally Extraperitoneal (TEP), Triangle of Doom, Triangle of Pain, and preperitoneal mesh placement.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 44-year-old active male presents with bilateral reducible inguinal hernias. Indication: Laparoscopic TAPP or TEP Bilateral Inguinal Hernia Repair.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• GETA with muscle relaxation; empty bladder with voiding pre-op.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Access: Umbilical 10mm port + two 5mm lower quadrant working ports.\n2. Peritoneal Flap (TAPP): Incise peritoneum from anterior superior iliac spine to medial umbilical ligament 4 cm above defect.\n3. Dissection of Myopectoral Orifice: Dissect Cooper ligament, pubic symphysis, direct space, indirect space, and femoral ring.\n4. Critical Safety Zones:\n  - Triangle of Doom (medial): Between vas deferens and gonadal vessels (contains External Iliac Artery and Vein - NEVER tack here).\n  - Triangle of Pain (lateral): Lateral to gonadal vessels and below iliopubic tract (contains lateral femoral cutaneous and femoral nerve branches - NEVER tack here).\n5. Mesh Placement: 10x15 cm anatomically contoured 3D mesh placed covering all hernia orifices. Secure mesh medially to Cooper ligament with absorbable tacks.\n6. Peritoneal Closure: Close peritoneal flap with continuous running 3-0 V-Loc barbed suture.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Major Vascular Injury: Avoid tacks in Triangle of Doom.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Rapid recovery; return to desk work in 3-5 days, sports in 2 weeks.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• 3D Max anatomically contoured mesh, AbsorbaTack 5mm fixation device, 3-0 V-Loc.'
            }
          ]
        },
        {
          id: 'tar_component_separation_ventral_hernia',
          title: 'Transversus Abdominis Release (TAR) / Posterior Component Separation',
          subtitle: 'Loss of Domain Incisional Hernia, Retro-Rectus Space & Sublay Mesh',
          type: 'Complex Abdominal Wall Reconstruction',
          aiScopeDescription: 'Incisional hernia, loss of domain, retro-rectus Rives-Stoppa space, Transversus Abdominis Release (TAR), and 30x30 cm sublay mesh.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 58-year-old male with prior midline trauma laparotomy presents with a massive 16 cm wide recurrent midline incisional hernia with 25% loss of domain on CT. Indication: Open Posterior Component Separation with Transversus Abdominis Muscle Release (TAR) and Sublay Mesh.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Pre-op Botulinum Toxin A (Botox) injections into lateral abdominal wall 4 weeks pre-op; smoking cessation.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Incision & Lysis: Excision of old midline scar; complete adhesiolysis.\n2. Retro-Rectus Entry (Rives-Stoppa): Incise posterior rectus sheath bilaterally 1 cm from medial edge to develop retro-rectus space.\n3. Transversus Abdominis Release (TAR): Incise posterior lamella of internal oblique medial to neurovascular bundles to expose and divide the transversus abdominis muscle fibers from subxiphoid to space of Retzius.\n4. Posterior Layer Closure: Re-approximate posterior rectus sheaths in midline with running 2-0 PDS.\n5. Sublay Mesh Placement: Place large 30x40 cm medium-weight polypropylene or macroporous mesh in the vast retro-muscular space with 5 cm overlap beyond all margins.\n6. Anterior Closure: Close anterior rectus sheath in midline tension-free over closed-suction drains.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Seroma / Mesh Infection: Prevented by meticulous drainage and strict sterile technique.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Abdominal binder; multimodal analgesia; avoid lifting >20 lbs for 8 weeks.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• 30x40 cm Soft Polypropylene Mesh, 2x 19 Fr Blake drains, Bookwalter retractor.'
            }
          ]
        },
        {
          id: 'strangulated_femoral_hernia_repair',
          title: 'Emergency Strangulated Femoral Hernia Repair (McVay / Lotheissen)',
          subtitle: 'Femoral Canal Obstruction, Lacunar Ligament Division & Cooper Ligament Repair',
          type: 'Emergency Hernia Protocol',
          aiScopeDescription: 'Strangulated femoral hernia, small bowel ischemia, Lacunar ligament incising, McVay Cooper ligament repair, and bowel resection.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 78-year-old female presents with small bowel obstruction and an exquisitely tender, non-reducible 2.5 cm mass in the right groin below the inguinal ligament (femoral triangle). CT: Incarcerated loop of ileum in the femoral canal. Indication: Emergent Right Femoral Hernia Exploration and Repair (High Approach of McEvedy or Lotheissen).'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Rapid IV crystalloid resuscitation, NG tube decompression, IV Cefoxitin 2g.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. High Inguinal / Preperitoneal Incision: Expose the preperitoneal space above the inguinal ligament.\n2. Constriction Ring Release: Carefully incise the rigid lacunar (Gimbernat) ligament medially to release the strangulated femoral ring (watch for aberrant obturator artery "Corona Mortis").\n3. Viability Assessment: Deliver herniated ileal loop; inspect for peristalsis and pink color with warm laparotomy packs (if necrotic, perform segmental resection and anastomosis).\n4. Defect Closure (McVay Technique): Suture the conjoined tendon to Cooper ligament with interrupted 0-Prolene/Ethibond sutures, transitioning laterally to the femoral sheath (transition stitch) to close the femoral ring.\n5. Layered closure.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Corona Mortis Hemorrhage: Ligate aberrant obturator vessel immediately with figure-of-eight suture if injured during lacunar ligament division.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Monitor for post-op ileus; advance diet as tolerated.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• 0-Ethibond sutures, DeBakey forceps, GIA 60mm stapler.'
            }
          ]
        }
      ]
    }
  ]
};
