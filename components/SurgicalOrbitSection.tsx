import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import {
  ORBIT_SIZE,
  CENTER_SIZE,
  BUTTON_SIZE,
  ORBIT_NODE_POSITIONS,
  OrbitRings,
  OrbitNode,
  OrbitCenterHub,
  OrbitSectionLabel,
  type OrbitSpecialtyNode,
} from './OrbitPrimitives';

export type SurgicalSpecialtyItem = OrbitSpecialtyNode;

// 8 Orbit Specialties (7 primary surgical disciplines + Plastics)
export const SURGICAL_ORBIT_SPECIALTIES: SurgicalSpecialtyItem[] = [
  {
    id: 'surgery_gi',
    name: 'GI Surgery',
    scientificName: 'Gastrointestinal & General Surgery',
    icon: 'cut',
    color: '#f9bac9', // Rose
    description: 'Hepatobiliary, colorectal, laparoscopy, and acute abdomen',
  },
  {
    id: 'surgery_neuro',
    name: 'Neurosurgery',
    scientificName: 'Neurological & Spine Surgery',
    icon: 'pulse',
    color: '#a9e4e8', // Mint
    description: 'Craniotomy, brain trauma, spine instrumentation, and ACDF',
  },
  {
    id: 'surgery_cardio',
    name: 'Cardiothoracic',
    scientificName: 'Cardiothoracic & Thoracic Surgery',
    icon: 'heart',
    color: '#4bc0b8', // Teal
    description: 'CABG, valve replacement, VATS lobectomy, and CPB',
  },
  {
    id: 'surgery_vascular',
    name: 'Vascular',
    scientificName: 'Vascular & Endovascular Surgery',
    icon: 'git-network',
    color: '#cbc8f5', // Lavender
    description: 'EVAR, carotid endarterectomy, bypass, and limb salvage',
  },
  {
    id: 'surgery_trauma',
    name: 'Trauma & Acute',
    scientificName: 'Trauma & Acute Care Surgery',
    icon: 'flame',
    color: '#f9bac9', // Rose
    description: 'Damage control laparotomy, lethal triad, and thoracotomy',
  },
  {
    id: 'surgery_ortho',
    name: 'Orthopedics',
    scientificName: 'Orthopedic & Trauma Surgery',
    icon: 'fitness',
    color: '#a9e4e8', // Mint
    description: 'Total hip/knee arthroplasty, fracture fixation, and ACL',
  },
  {
    id: 'surgery_urology',
    name: 'Urology',
    scientificName: 'Urological & Pelvic Surgery',
    icon: 'medkit',
    color: '#4bc0b8', // Teal
    description: 'Endourology, laser lithotripsy, robotic prostatectomy, and torsion',
  },
  {
    id: 'surgery_plastics',
    name: 'Plastic Surgery',
    scientificName: 'Plastic, Reconstructive & Burn Surgery',
    icon: 'body-outline',
    color: '#f9bac9', // Rose
    description: 'Microsurgical free flap transfer, skin grafting, burn excision, and wound coverage',
  },
];

// Surgical specialties for the second wheel
export const EXPANDED_SURGICAL_SPECIALTIES: SurgicalSpecialtyItem[] = [
  {
    id: 'surgery_pediatric',
    name: 'Pediatric Surgery',
    scientificName: 'Pediatric & Neonatal Surgery',
    icon: 'people-outline',
    color: '#a9e4e8',
    description: 'Congenital anomalies, pediatric hernia, pyloric stenosis, and Hirschsprung disease',
  },
  {
    id: 'surgery_ent',
    name: 'ENT / Head & Neck',
    scientificName: 'Otolaryngology & Head/Neck Surgery',
    icon: 'headset-outline',
    color: '#4bc0b8',
    description: 'Tracheostomy, neck dissection, thyroidectomy, endoscopic sinus surgery, and mastoidectomy',
  },
  {
    id: 'surgery_onco',
    name: 'Surgical Oncology',
    scientificName: 'Complex General Surgical Oncology',
    icon: 'shield-outline',
    color: '#cbc8f5',
    description: 'Hyperthermic intraperitoneal chemotherapy (HIPEC), sarcoma resection, and sentinel lymph node biopsy',
  },
  {
    id: 'surgery_transplant',
    name: 'Transplant Surgery',
    scientificName: 'Abdominal & Thoracic Organ Transplantation',
    icon: 'repeat-outline',
    color: '#a9e4e8',
    description: 'Deceased & living donor renal transplant, orthotopic liver transplant, and immunosuppression',
  },
  {
    id: 'surgery_bariatric',
    name: 'Bariatric',
    scientificName: 'Bariatric & Metabolic Surgery',
    icon: 'resize-outline',
    color: '#f9bac9',
    description: 'Sleeve gastrectomy, Roux-en-Y gastric bypass, and metabolic syndrome resolution',
  },
  {
    id: 'surgery_hepatobiliary',
    name: 'Hepatobiliary',
    scientificName: 'Hepatobiliary & Pancreatic Surgery',
    icon: 'flask-outline',
    color: '#4bc0b8',
    description: 'Whipple procedure, hepatectomy, bile duct reconstruction, and pancreatic necrosectomy',
  },
  {
    id: 'surgery_maxillofacial',
    name: 'Maxillofacial',
    scientificName: 'Oral & Maxillofacial Surgery',
    icon: 'happy-outline',
    color: '#cbc8f5',
    description: 'Orthognathic surgery, TMJ reconstruction, facial fracture fixation, and cleft repair',
  },
  {
    id: 'surgery_endocrine',
    name: 'Endocrine Surgery',
    scientificName: 'Endocrine & Thyroid Surgery',
    icon: 'nuclear-outline',
    color: '#a9e4e8',
    description: 'Thyroidectomy, parathyroidectomy, adrenalectomy, and MEN syndrome management',
  },
];

export const SurgicalOrbitSection: React.FC = () => {
  const handleOpenSpecialty = (specialtyId: string) => {
    router.push(`/specialty/${specialtyId}` as any);
  };

  const handleCenterHubPress = () => {
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: { query: 'Surgical Operative Protocol and Procedure Guide' },
    } as any);
  };

  return (
    <View className="px-6 pb-8" style={{ paddingTop: 14 }}>
      {/* Section Header with Surgical Domain Identifier */}
      <OrbitSectionLabel
        variant="surgical"
        badgeLabel="SURGICAL"
        badgeSubtitle="Operative specialties"
        title="Surgical Specialties & Procedures"
        description="Tap any surgical specialty to explore operative cases, techniques, pre-op clearance & critical care"
      />

      {/* Circular Surgical Orbit — Engineered Precision & Segmented Ticks */}
      <View
        className="mx-auto mb-10 relative"
        style={{ width: ORBIT_SIZE, height: ORBIT_SIZE, marginTop: BUTTON_SIZE / 2 }}
      >
        {/* Surgical Segmented Double-Ring with Calibrated Ticks & Crosshairs */}
        <OrbitRings variant="surgical" size={ORBIT_SIZE} />

        {/* Center hub — Surgical Suite AI Advisor in Technical Obsidian & Surgical Teal */}
        <OrbitCenterHub
          title="Ask Surgical AI"
          icon="cut"
          variant="surgical"
          size={CENTER_SIZE}
          onPress={handleCenterHubPress}
        />

        {/* 8 Precision Calibrated Surgical Nodes */}
        {SURGICAL_ORBIT_SPECIALTIES.map((spec, index) => {
          const pos = ORBIT_NODE_POSITIONS[index];
          if (!pos) return null;
          return (
            <OrbitNode
              key={spec.id}
              specialty={spec}
              size={BUTTON_SIZE}
              top={pos.top}
              left={pos.left}
              variant="surgical"
              onPress={() => handleOpenSpecialty(spec.id)}
            />
          );
        })}
      </View>
    </View>
  );
};
