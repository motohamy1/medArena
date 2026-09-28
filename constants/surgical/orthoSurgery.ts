import { SpecialtyData } from '../SpecialtyData';

export const ORTHOPEDIC_SURGERY_SPECIALTY: SpecialtyData = {
  id: 'surgery_ortho',
  name: 'Orthopedics',
  scientificName: 'Orthopedic & Trauma Surgery',
  icon: 'fitness',
  color: '#f6dda2', // Mint
  illustration: require('../../assets/images/specialties/pulmonology.jpg'),
  generalScope: 'Comprehensive joint arthroplasty, trauma fracture fixation, intramedullary nailing, arthroscopic sports reconstruction, and orthopedic emergencies.',
  categories: [
    {
      id: 'arthroplasty_joint_replacement',
      title: 'Joint Arthroplasty & Reconstruction',
      description: 'Total hip and knee replacements, unicompartmental knee, and shoulder arthroplasty',
      icon: 'fitness-outline',
      topics: [
        {
          id: 'total_hip_arthroplasty_tha',
          title: 'Primary Total Hip Arthroplasty (THA)',
          subtitle: 'End-Stage Osteoarthritis, Direct Anterior / Posterior Approach & Uncemented Press-Fit Cup',
          type: 'Joint Arthroplasty Protocol',
          aiScopeDescription: 'Total Hip Arthroplasty, direct anterior approach, posterior approach, acetabular reaming, press-fit uncemented cup, femoral broaching, and leg length restoration.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 66-year-old male presents with severe groin pain, restricted internal rotation (<5°), and antalgic gait. Pelvis Radiograph: Kellgren-Lawrence Grade IV hip osteoarthritis with superior joint space obliteration, osteophytes, and subchondral sclerosis. Indication: Primary Total Hip Arthroplasty.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Neuraxial spinal anesthesia; IV Cefazolin 2-3g; IV Tranexamic Acid (TXA 1g pre-incision + 1g at closure).'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Approach (Direct Anterior or Posterior): Posterolateral curved incision centered over greater trochanter; divide fascia lata and reflect short external rotators.\n2. Neck Osteotomy: Resect femoral neck with oscillating saw at templated height above lesser trochanter.\n3. Acetabular Preparation: Ream acetabulum sequentially down to bleeding subchondral bone; press-fit porous-coated uncemented titanium shell (40-45° inclination, 15-20° anteversion); secure with 2 dome screws; impact cross-linked polyethylene liner.\n4. Femoral Preparation: Sequentially broach femoral canal; trial reduction with trial head/neck (test stability and leg length).\n5. Final Implants: Impact definitive titanium femoral stem; place 36mm ceramic/metal femoral head; reduce hip.\n6. Capsule Repair: Securely repair posterior capsule and external rotators through trochanteric drill holes; layered closure.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Intraoperative Calcar Fracture: Stabilize with cerclage cable before seating definitive stem.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Full weight-bearing with walker on POD 0; Aspirin 81mg BID for 4 weeks for VTE prophylaxis; discharge same-day or POD 1.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Stryker System 8 oscillating saw and reamer, Hohmann retractors, Stryker Trident/Accolade hip implant system.'
            }
          ]
        },
        {
          id: 'total_knee_arthroplasty_tka',
          title: 'Total Knee Arthroplasty (TKA)',
          subtitle: 'Tricompartmental Osteoarthritis, Measured Resection, Gap Balancing & Cemented Implants',
          type: 'Joint Arthroplasty Protocol',
          aiScopeDescription: 'Total Knee Arthroplasty, measured resection vs gap balancing, distal femoral cut, proximal tibial cut, flexion/extension gap symmetry, and cemented components.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 69-year-old female presents with severe bilateral varus knee deformity, crepitus, and severe pain with ambulation. Radiographs: Bone-on-bone medial compartment arthritis with patellofemoral osteoarthritis. Indication: Total Knee Arthroplasty.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Spinal anesthesia with adductor canal block; pneumatic thigh tourniquet (250 mmHg); IV TXA 1g.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Incision & Arthrotomy: Anterior midline skin incision; medial parapatellar arthrotomy; evert patella.\n2. Distal Femoral Cut: Intramedullary alignment rod; 5-6° valgus distal femoral resection guide.\n3. Proximal Tibial Cut: Extramedullary alignment guide; resect proximal tibia perpendicular to mechanical axis with 3° posterior slope.\n4. 4-in-1 Femoral Resection: Anterior, posterior, and chamfer cuts set with 3° external rotation relative to posterior condylar axis.\n5. Gap Balancing: Confirm equal rectangular extension and flexion gaps (spacer block).\n6. Patellar Resurfacing: Resect patellar articular surface; drill peg holes.\n7. Cementing & Implantation: Pressurize PMMA bone cement; seat definitive femoral component, tibial baseplate, and cross-linked polyethylene insert; clamp patella until cement cures.\n8. Layered closure in 30° flexion.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Medial Collateral Ligament (MCL) Transection: Repair with suture anchor or convert to constrained condylar knee (CCK) insert.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Continuous passive motion / immediate ambulation on POD 0; target 0-90° ROM before discharge.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Stryker Triathlon / Zimmer Persona TKA system, pneumatic tourniquet, PMMA bone cement and vacuum mixer.'
            }
          ]
        }
      ]
    },
    {
      id: 'trauma_fracture_fixation',
      title: 'Trauma & Fracture Fixation',
      description: 'Intramedullary nailing, plate osteosynthesis, and sports arthroscopy',
      icon: 'construct-outline',
      topics: [
        {
          id: 'femoral_shaft_intramedullary_nailing',
          title: 'Antegrade Intramedullary Nailing for Femoral Shaft Fracture',
          subtitle: 'Winquist-Hansen Midshaft Fracture, Piriformis/Trochanteric Entry & Reamed Locking Nail',
          type: 'Orthopedic Trauma Protocol',
          aiScopeDescription: 'Femur fracture, fracture table traction, antegrade entry, reaming, intramedullary locking nail, and proximal/distal interlocking.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 24-year-old male arrives after a motorcycle crash with an isolated closed midshaft left femur fracture (OTA/AO 32-A3). Indication: Reamed Antegrade Intramedullary Nailing.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• General anesthesia; radiolucent fracture table with boot traction; C-arm fluoroscopy positioned.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Traction & Reduction: Establish gross length and rotational alignment under C-arm fluoroscopy.\n2. Entry Point: 3 cm proximal skin incision; enter greater trochanter tip or piriformis fossa with awl/cannulated drill under AP/lateral views.\n3. Guide Wire Placement: Pass 3.0mm ball-tipped guide wire across fracture site into distal femoral metaphysis center.\n4. Sequential Reaming: Ream canal sequentially in 0.5mm increments up to 1.5mm greater than templated nail diameter.\n5. Nail Insertion: Insert titanium intramedullary nail (e.g. 11mm x 380mm) over guide wire to subchondral depth.\n6. Interlocking Screws: Place proximal dynamic/static locking screws via target arm; place distal locking screws using "perfect circles" radiolucent freehand technique.\n7. Layered wound closure.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Malrotation: Check cortical thickness and patellar orientation relative to lesser trochanter to avoid rotational deformity.'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Weight-bearing as tolerated with crutches; DVT prophylaxis with LMWH for 4 weeks.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Synthes Expert A2FN / Stryker T2 femoral nail set, flexible intramedullary reamers, radiolucent drill.'
            }
          ]
        },
        {
          id: 'arthroscopic_acl_reconstruction',
          title: 'Arthroscopic Anterior Cruciate Ligament (ACL) Reconstruction',
          subtitle: 'Complete ACL Rupture, Quadrupled Semitendinosus/Gracilis Autograft & Endobutton Fixation',
          type: 'Sports Medicine Arthroscopy',
          aiScopeDescription: 'ACL reconstruction, Lachman test, hamstring autograft harvest, femoral tunnel drilling (independent/retrograde), tibial tunnel, and suspensory fixation.',
          clinicalContent: [
            {
              title: 'Case Scenario & Clinical Presentation',
              content: 'A 21-year-old soccer player presents with acute knee pop, immediate hemarthrosis, positive Lachman (3+ with no endpoint) and positive Pivot-Shift test. MRI: Complete ACL midsubstance tear. Indication: Arthroscopic ACL Reconstruction with Hamstring Autograft.'
            },
            {
              title: 'Preoperative Risk & Preoperative Preparation',
              content: '• Pre-op prehab to eliminate joint effusion and restore full extension; general/regional anesthesia.'
            },
            {
              title: 'Operative Steps & Techniques',
              content: '1. Graft Harvest: 3 cm incision over pes anserinus; harvest semitendinosus and gracilis tendons with tendon stripper; prepare on back-table into a 4-strand graft (8.5-9.0mm diameter) pre-tensioned with #2 FiberWire.\n2. Diagnostic Arthroscopy: Anteromedial and anterolateral portals; debride ACL stump; evaluate menisci and repair if torn.\n3. Femoral Tunnel: Flexible reamer or transportal drilling through anteromedial portal at the center of the femoral footprint in 120° knee flexion; flip Endobutton on lateral femoral cortex.\n4. Tibial Tunnel: Drill tibial tunnel at 55° angle centered in tibial footprint.\n5. Graft Passage & Fixation: Pull graft into femoral tunnel, deploy Endobutton cortical button. Cycle knee 20 times. Secure distal graft in tibial tunnel with bioabsorbable interference screw at 20° flexion and maximal manual tension.'
            },
            {
              title: 'Complications & Intraoperative Management',
              content: '• Tunnel Malposition (Roof Impingement): Avoid anterior tibial tunnel (must enter posterior to anterior horn of lateral meniscus).'
            },
            {
              title: 'Post-Operative Critical Care & Monitoring',
              content: '• Hinged knee brace locked in extension; immediate quad sets and heel slides; return to cutting sports at 9 months.'
            },
            {
              title: 'Surgical Instruments & Equipment',
              content: '• Arthrex TightRope / Smith & Nephew Endobutton, tendon stripper, bioabsorbable interference screws, 30° arthroscope.'
            }
          ]
        }
      ]
    }
  ]
};
