import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

type CategoryPageProps = {
  categoryName: string;
  categoryIcon: keyof typeof Ionicons.glyphMap;
  categoryColor: string;
};

type TopicItem = {
  title: string;
  subtitle: string;
  type: string;
};

const specialtyTopics: Record<string, TopicItem[]> = {
  Heart: [
    { title: 'Acute Myocardial Infarction', subtitle: 'STEMI vs NSTEMI Workup & Management', type: 'Clinical Protocol' },
    { title: 'Heart Failure Management', subtitle: 'HFrEF vs HFpEF Evidence-based Guidelines', type: 'Guidelines' },
    { title: 'Atrial Fibrillation Management', subtitle: 'Rate vs Rhythm control & CHA2DS2-VASc', type: 'Scoring & Protocol' },
  ],
  GIT: [
    { title: 'Acute Upper GI Bleeding', subtitle: 'Endoscopy timing, Glasgow-Blatchford Score', type: 'Emergency Workup' },
    { title: 'Inflammatory Bowel Disease', subtitle: 'Crohn\'s vs Ulcerative Colitis Differential', type: 'Differential' },
    { title: 'Acute Pancreatitis Evaluation', subtitle: 'Ranson Criteria & Initial Resuscitation', type: 'Criteria' },
  ],
  Fever: [
    { title: 'Sepsis & Septic Shock', subtitle: 'qSOFA & Surviving Sepsis Campaign Guidelines', type: 'Critical Care' },
    { title: 'Fever of Unknown Origin (FUO)', subtitle: 'Diagnostic Algorithm & Investigation Workflow', type: 'Workup' },
  ],
  Neuro: [
    { title: 'Acute Ischemic Stroke', subtitle: 'tPA Window, NIHSS Score & CT Protocol', type: 'Emergency' },
    { title: 'Status Epilepticus Management', subtitle: 'First & Second-line Anticonvulsant Protocol', type: 'Protocol' },
  ],
  Skin: [
    { title: 'Severe Cutaneous Adverse Reactions', subtitle: 'SJS/TEN Diagnosis & Burn Unit Transfer', type: 'Dermatology' },
    { title: 'Common Dermatological Lesions', subtitle: 'Morphology & Differential Diagnosis', type: 'Clinical Guide' },
  ],
  Gynacology: [
    { title: 'Preeclampsia & Eclampsia', subtitle: 'MgSO4 Protocol & Delivery Timing', type: 'OB/GYN Protocol' },
    { title: 'Abnormal Uterine Bleeding (AUB)', subtitle: 'PALM-COEIN Classification & Workup', type: 'Classification' },
  ],
  Lungs: [
    { title: 'Acute Pulmonary Embolism', subtitle: 'Wells Score, PERC Rule & Anticoagulation', type: 'Clinical Decision' },
    { title: 'Severe Asthma Exacerbation', subtitle: 'Peak Flow, Steroids & Ventilator Management', type: 'Protocol' },
  ],
};

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categoryName,
  categoryIcon,
  categoryColor,
}) => {
  const topics = specialtyTopics[categoryName] || [
    { title: `${categoryName} Clinical Workup`, subtitle: 'Evidence-based diagnostic and treatment guidelines', type: 'General' }
  ];

  const handleStartConsultation = (query: string) => {
    router.push({
      pathname: '/(tabs)/ChatTab',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#23262b" />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-white text-xl font-sans-bold">{categoryName} Specialty</Text>
          <Text className="text-turquoise text-xs font-sans-semibold uppercase tracking-wider">
            Physician Clinical Resources
          </Text>
        </View>
        <View className="w-10 h-10 rounded-full bg-teal-medium items-center justify-center border border-white/10">
          <Ionicons name={categoryIcon} size={20} color={categoryColor} />
        </View>
      </View>

      {/* Topic Cards */}
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View className="mb-2">
          <Text className="text-gray-muted text-xs font-sans-bold uppercase tracking-wider mb-1">High-Yield Topics</Text>
          <Text className="text-white text-lg font-sans-bold">Clinical Cases & Guidelines</Text>
        </View>

        {topics.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleStartConsultation(item.title)}
            className="bg-teal-medium/50 border border-white/10 p-4 rounded-2xl flex-row items-center justify-between"
          >
            <View className="flex-1 mr-3">
              <View className="self-start px-2 py-0.5 rounded bg-turquoise/20 border border-turquoise/30 mb-1.5">
                <Text className="text-[10px] font-sans-bold text-turquoise uppercase">{item.type}</Text>
              </View>
              <Text className="text-white font-sans-bold text-base mb-1">{item.title}</Text>
              <Text className="text-gray-muted text-xs">{item.subtitle}</Text>
            </View>
            <View className="w-9 h-9 rounded-full bg-turquoise/10 items-center justify-center">
              <Ionicons name="sparkles" size={18} color={Colors.accent} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Ask AI CTA */}
        <TouchableOpacity
          onPress={() => handleStartConsultation(categoryName)}
          className="mt-4 bg-turquoise p-4 rounded-2xl flex-row items-center justify-center gap-2"
        >
          <Ionicons name="chatbubbles" size={20} color={Colors.ink} />
          <Text className="text-ink font-sans-bold text-base">Ask Medical AI About {categoryName}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
