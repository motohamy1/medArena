import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import {
  EXPANDED_MEDICINE_SPECIALTIES,
  MedicineSpecialtyItem,
  SURGERY_CATEGORIES,
  SurgeryCategoryItem,
} from '../constants/ExpandedSpecialtiesData';

type ActiveTab = 'all' | 'surgery' | 'medicine';

interface ExpandedSpecialtiesSectionProps {
  onScrollRequested?: () => void;
}

export const ExpandedSpecialtiesSection: React.FC<ExpandedSpecialtiesSectionProps> = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [selectedSurgery, setSelectedSurgery] = useState<SurgeryCategoryItem | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineSpecialtyItem | null>(null);

  const handleOpenSurgeryModal = (item: SurgeryCategoryItem) => {
    setSelectedSurgery(item);
  };

  const handleOpenMedicineModal = (item: MedicineSpecialtyItem) => {
    setSelectedMedicine(item);
  };

  const handleCloseModal = () => {
    setSelectedSurgery(null);
    setSelectedMedicine(null);
  };

  const handleConsultAiFromSurgery = (item: SurgeryCategoryItem) => {
    handleCloseModal();
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: {
        query: item.aiPrompt,
        categoryContext: item.title,
      },
    } as any);
  };

  const handleConsultAiFromMedicine = (item: MedicineSpecialtyItem) => {
    handleCloseModal();
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: {
        query: item.aiPrompt,
        categoryContext: item.scientificName,
      },
    } as any);
  };

  return (
    <View className="mt-4 px-6">
      {/* Section Header */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-1.5">
          <View className="flex-row items-center gap-2">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: Colors.main }}
            />
            <Text className="text-[11px] font-sans-bold uppercase tracking-wider text-gray-400">
              Specialized Clinical Domains
            </Text>
          </View>
          <View className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
            <Text className="text-[10px] font-mono text-gray-400">
              {SURGERY_CATEGORIES.length + EXPANDED_MEDICINE_SPECIALTIES.length} Disciplines
            </Text>
          </View>
        </View>

        <Text className="text-[19px] font-sans-bold text-white">
          Surgery Suite & Medical Disciplines
        </Text>
        <Text className="text-[12px] font-sans text-gray-400 mt-0.5">
          Operative cases, surgical steps, instruments & subspecialty decision trees
        </Text>
      </View>

      {/* Segmented Filter Bar */}
      <View className="flex-row items-center gap-2 mb-5 p-1 bg-[#090e10] rounded-2xl border border-white/10">
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          className="flex-1 py-2 rounded-xl items-center justify-center flex-row gap-1.5"
          style={{
            backgroundColor: activeTab === 'all' ? `${Colors.main}20` : 'transparent',
            borderColor: activeTab === 'all' ? `${Colors.main}50` : 'transparent',
            borderWidth: 1,
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="apps"
            size={13}
            color={activeTab === 'all' ? Colors.main : '#737373'}
          />
          <Text
            className="text-[12px] font-sans-bold"
            style={{ color: activeTab === 'all' ? Colors.main : '#9ca3af' }}
          >
            All Disciplines
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('surgery')}
          className="flex-1 py-2 rounded-xl items-center justify-center flex-row gap-1.5"
          style={{
            backgroundColor: activeTab === 'surgery' ? '#f9bac925' : 'transparent',
            borderColor: activeTab === 'surgery' ? '#f9bac960' : 'transparent',
            borderWidth: 1,
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="cut"
            size={13}
            color={activeTab === 'surgery' ? '#f9bac9' : '#737373'}
          />
          <Text
            className="text-[12px] font-sans-bold"
            style={{ color: activeTab === 'surgery' ? '#f9bac9' : '#9ca3af' }}
          >
            Surgical Suite
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('medicine')}
          className="flex-1 py-2 rounded-xl items-center justify-center flex-row gap-1.5"
          style={{
            backgroundColor: activeTab === 'medicine' ? '#4bc0b825' : 'transparent',
            borderColor: activeTab === 'medicine' ? '#4bc0b860' : 'transparent',
            borderWidth: 1,
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="medical"
            size={13}
            color={activeTab === 'medicine' ? '#4bc0b8' : '#737373'}
          />
          <Text
            className="text-[12px] font-sans-bold"
            style={{ color: activeTab === 'medicine' ? '#4bc0b8' : '#9ca3af' }}
          >
            Medicine
          </Text>
        </TouchableOpacity>
      </View>

      {/* 1. SURGICAL SUITE CARDS */}
      {(activeTab === 'all' || activeTab === 'surgery') && (
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3 px-0.5">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-lg bg-[#f9bac9]20 items-center justify-center border border-[#f9bac9]40">
                <Ionicons name="cut" size={12} color="#f9bac9" />
              </View>
              <Text className="text-[15px] font-sans-bold text-white">
                Surgical Suite & Operative Medicine
              </Text>
            </View>
            <Text className="text-[11px] font-sans-medium text-gray-400">
              {SURGERY_CATEGORIES.length} Categories
            </Text>
          </View>

          <View className="flex flex-col gap-3">
            {SURGERY_CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleOpenSurgeryModal(item)}
                activeOpacity={0.82}
                style={[
                  styles.cardContainer,
                  {
                    borderColor: `${item.color}35`,
                    shadowColor: item.color,
                  },
                ]}
              >
                <LinearGradient
                  colors={[`${item.color}15`, `${item.color}05`, '#080c0e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View className="flex-row items-start justify-between">
                    {/* Icon + Badge */}
                    <View className="flex-row items-center gap-2.5">
                      <View
                        className="w-11 h-11 rounded-2xl items-center justify-center border"
                        style={{
                          backgroundColor: `${item.color}18`,
                          borderColor: `${item.color}45`,
                          shadowColor: item.color,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 5,
                          elevation: 3,
                        }}
                      >
                        <Ionicons name={item.icon} size={20} color={item.color} />
                      </View>
                      <View>
                        <View
                          className="self-start px-2 py-0.5 rounded-md border mb-1"
                          style={{
                            backgroundColor: `${item.color}15`,
                            borderColor: `${item.color}40`,
                          }}
                        >
                          <Text
                            className="text-[9px] font-mono font-bold tracking-wider uppercase"
                            style={{ color: item.color }}
                          >
                            {item.badge}
                          </Text>
                        </View>
                        <Text className="text-[15px] font-sans-bold text-white leading-tight">
                          {item.title}
                        </Text>
                      </View>
                    </View>

                    {/* Arrow badge */}
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center border"
                      style={{
                        backgroundColor: `${item.color}12`,
                        borderColor: `${item.color}35`,
                      }}
                    >
                      <Ionicons name="chevron-forward" size={15} color={item.color} />
                    </View>
                  </View>

                  {/* Subtitle & Key Scope */}
                  <Text className="text-[12px] font-sans text-gray-300 mt-2.5 leading-4">
                    {item.subtitle}
                  </Text>

                  {/* Micro Category Pill Preview */}
                  <View className="flex-row flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/5">
                    {item.casesOrExamples.slice(0, 2).map((c, i) => (
                      <View
                        key={i}
                        className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/10"
                      >
                        <View
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <Text
                          className="text-[10px] font-sans-medium text-gray-300 max-w-[150px]"
                          numberOfLines={1}
                        >
                          {c.name}
                        </Text>
                      </View>
                    ))}
                    {item.instruments && item.instruments.length > 0 && (
                      <View className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/10">
                        <Ionicons name="hardware-chip" size={10} color={item.color} />
                        <Text
                          className="text-[10px] font-sans-medium text-gray-400 max-w-[120px]"
                          numberOfLines={1}
                        >
                          {item.instruments[0]}
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 2. EXPANDED MEDICAL SPECIALTIES CARDS */}
      {(activeTab === 'all' || activeTab === 'medicine') && (
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3 px-0.5">
            <View className="flex-row items-center gap-2">
              <View className="w-6 h-6 rounded-lg bg-[#4bc0b8]20 items-center justify-center border border-[#4bc0b8]40">
                <Ionicons name="fitness" size={12} color="#4bc0b8" />
              </View>
              <Text className="text-[15px] font-sans-bold text-white">
                More Medical Specialties
              </Text>
            </View>
            <Text className="text-[11px] font-sans-medium text-gray-400">
              {EXPANDED_MEDICINE_SPECIALTIES.length} Disciplines
            </Text>
          </View>

          <View className="grid grid-cols-1 gap-3">
            {EXPANDED_MEDICINE_SPECIALTIES.map((spec) => (
              <TouchableOpacity
                key={spec.id}
                onPress={() => handleOpenMedicineModal(spec)}
                activeOpacity={0.82}
                style={[
                  styles.cardContainer,
                  {
                    borderColor: `${spec.color}35`,
                    shadowColor: spec.color,
                  },
                ]}
              >
                <LinearGradient
                  colors={[`${spec.color}14`, `${spec.color}04`, '#080c0e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                      <View
                        className="w-11 h-11 rounded-2xl items-center justify-center border"
                        style={{
                          backgroundColor: `${spec.color}18`,
                          borderColor: `${spec.color}45`,
                          shadowColor: spec.color,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 5,
                          elevation: 3,
                        }}
                      >
                        <Ionicons name={spec.icon} size={20} color={spec.color} />
                      </View>
                      <View className="flex-1">
                        <View
                          className="self-start px-2 py-0.5 rounded-md border mb-1"
                          style={{
                            backgroundColor: `${spec.color}15`,
                            borderColor: `${spec.color}40`,
                          }}
                        >
                          <Text
                            className="text-[9px] font-mono font-bold tracking-wider uppercase"
                            style={{ color: spec.color }}
                          >
                            {spec.badge}
                          </Text>
                        </View>
                        <Text
                          className="text-[15px] font-sans-bold text-white leading-tight"
                          numberOfLines={1}
                        >
                          {spec.scientificName}
                        </Text>
                      </View>
                    </View>

                    <View
                      className="w-8 h-8 rounded-full items-center justify-center border"
                      style={{
                        backgroundColor: `${spec.color}12`,
                        borderColor: `${spec.color}35`,
                      }}
                    >
                      <Ionicons name="chevron-forward" size={15} color={spec.color} />
                    </View>
                  </View>

                  <Text
                    className="text-[12px] font-sans text-gray-300 mt-2.5 leading-4"
                    numberOfLines={2}
                  >
                    {spec.scope}
                  </Text>

                  {/* Core Pillars Chips */}
                  <View className="flex-row flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/5">
                    {spec.corePillars.slice(0, 3).map((pillar, i) => (
                      <View
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-black/40 border border-white/10"
                      >
                        <Text className="text-[10px] font-sans-medium text-gray-300">
                          {pillar}
                        </Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ==================================================== */}
      {/* 3. INTERACTIVE SURGERY DETAIL MODAL */}
      {/* ==================================================== */}
      <Modal
        visible={!!selectedSurgery}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSurgery && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Modal Header */}
                <View className="flex-row items-center justify-between pb-3 border-b border-white/10">
                  <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center border"
                      style={{
                        backgroundColor: `${selectedSurgery.color}22`,
                        borderColor: `${selectedSurgery.color}50`,
                      }}
                    >
                      <Ionicons
                        name={selectedSurgery.icon}
                        size={20}
                        color={selectedSurgery.color}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-[10px] font-mono font-bold tracking-wider uppercase"
                        style={{ color: selectedSurgery.color }}
                      >
                        {selectedSurgery.badge}
                      </Text>
                      <Text className="text-[17px] font-sans-bold text-white leading-tight">
                        {selectedSurgery.title}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleCloseModal}
                    className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Subtitle & Scope */}
                <View className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5">
                  <Text className="text-[12px] font-sans-medium text-gray-200 leading-relaxed">
                    {selectedSurgery.description}
                  </Text>
                </View>

                {/* Clinical Pearl Warning */}
                {selectedSurgery.clinicalPearls && (
                  <View
                    className="mt-3.5 p-3.5 rounded-2xl border"
                    style={{
                      backgroundColor: `${selectedSurgery.color}10`,
                      borderColor: `${selectedSurgery.color}40`,
                    }}
                  >
                    <View className="flex-row items-center gap-1.5 mb-1">
                      <Ionicons name="alert-circle" size={14} color={selectedSurgery.color} />
                      <Text
                        className="text-[11px] font-sans-bold uppercase tracking-wider"
                        style={{ color: selectedSurgery.color }}
                      >
                        Surgical Pearl & Malpractice Caveat
                      </Text>
                    </View>
                    <Text className="text-[12px] font-sans text-gray-200 leading-relaxed">
                      {selectedSurgery.clinicalPearls}
                    </Text>
                  </View>
                )}

                {/* Key Decision Points */}
                <View className="mt-4">
                  <Text className="text-[12px] font-sans-bold text-gray-300 uppercase tracking-wider mb-2">
                    Core Technical Criteria
                  </Text>
                  <View className="flex flex-col gap-1.5">
                    {selectedSurgery.keyPoints.map((pt, i) => (
                      <View key={i} className="flex-row items-start gap-2">
                        <View
                          className="w-1.5 h-1.5 rounded-full mt-1.5"
                          style={{ backgroundColor: selectedSurgery.color }}
                        />
                        <Text className="text-[12px] font-sans text-gray-300 flex-1 leading-relaxed">
                          {pt}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Specific Cases or Operative Steps */}
                <View className="mt-4">
                  <Text className="text-[12px] font-sans-bold text-gray-300 uppercase tracking-wider mb-2.5">
                    Protocols & Stepwise Technique
                  </Text>
                  <View className="flex flex-col gap-2.5">
                    {selectedSurgery.casesOrExamples.map((item, i) => (
                      <View
                        key={i}
                        className="p-3 rounded-xl bg-[#090d0f] border border-white/10"
                      >
                        <Text className="text-[13px] font-sans-bold text-white mb-1">
                          {item.name}
                        </Text>
                        <Text className="text-[11.5px] font-sans text-gray-300 leading-relaxed mb-2">
                          {item.detail}
                        </Text>
                        <View
                          className="p-2 rounded-lg border"
                          style={{
                            backgroundColor: `${selectedSurgery.color}08`,
                            borderColor: `${selectedSurgery.color}25`,
                          }}
                        >
                          <Text
                            className="text-[11px] font-sans-semibold leading-relaxed"
                            style={{ color: selectedSurgery.color }}
                          >
                            Protocol: {item.protocol}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Instruments If Available */}
                {selectedSurgery.instruments && selectedSurgery.instruments.length > 0 && (
                  <View className="mt-4">
                    <Text className="text-[12px] font-sans-bold text-gray-300 uppercase tracking-wider mb-2">
                      Target Instruments & Hardware
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5">
                      {selectedSurgery.instruments.map((inst, i) => (
                        <View
                          key={i}
                          className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10"
                        >
                          <Ionicons name="hardware-chip-outline" size={12} color={selectedSurgery.color} />
                          <Text className="text-[11px] font-sans-medium text-gray-200">
                            {inst}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View className="mt-6 flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleConsultAiFromSurgery(selectedSurgery)}
                    className="flex-1 py-3.5 rounded-xl items-center justify-center flex-row gap-2 border active:opacity-85"
                    style={{
                      backgroundColor: selectedSurgery.color,
                      borderColor: selectedSurgery.color,
                      shadowColor: selectedSurgery.color,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.35,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Ionicons name="chatbubbles" size={16} color="#010101" />
                    <Text className="text-[#010101] font-sans-bold text-[13px]">
                      Consult Surgical AI Advisor
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ==================================================== */}
      {/* 4. INTERACTIVE MEDICINE DETAIL MODAL */}
      {/* ==================================================== */}
      <Modal
        visible={!!selectedMedicine}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMedicine && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Modal Header */}
                <View className="flex-row items-center justify-between pb-3 border-b border-white/10">
                  <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center border"
                      style={{
                        backgroundColor: `${selectedMedicine.color}22`,
                        borderColor: `${selectedMedicine.color}50`,
                      }}
                    >
                      <Ionicons
                        name={selectedMedicine.icon}
                        size={20}
                        color={selectedMedicine.color}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-[10px] font-mono font-bold tracking-wider uppercase"
                        style={{ color: selectedMedicine.color }}
                      >
                        {selectedMedicine.badge}
                      </Text>
                      <Text className="text-[17px] font-sans-bold text-white leading-tight">
                        {selectedMedicine.scientificName}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleCloseModal}
                    className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Scope Description */}
                <View className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5">
                  <Text className="text-[12px] font-sans-medium text-gray-200 leading-relaxed">
                    {selectedMedicine.scope}
                  </Text>
                </View>

                {/* Clinical Pearl Warning */}
                {selectedMedicine.clinicalPearls && (
                  <View
                    className="mt-3.5 p-3.5 rounded-2xl border"
                    style={{
                      backgroundColor: `${selectedMedicine.color}10`,
                      borderColor: `${selectedMedicine.color}40`,
                    }}
                  >
                    <View className="flex-row items-center gap-1.5 mb-1">
                      <Ionicons name="shield-checkmark" size={14} color={selectedMedicine.color} />
                      <Text
                        className="text-[11px] font-sans-bold uppercase tracking-wider"
                        style={{ color: selectedMedicine.color }}
                      >
                        High-Yield Point-of-Care Pearl
                      </Text>
                    </View>
                    <Text className="text-[12px] font-sans text-gray-200 leading-relaxed">
                      {selectedMedicine.clinicalPearls}
                    </Text>
                  </View>
                )}

                {/* Core Pillars */}
                <View className="mt-4">
                  <Text className="text-[12px] font-sans-bold text-gray-300 uppercase tracking-wider mb-2">
                    Core Clinical Pillars
                  </Text>
                  <View className="flex-row flex-wrap gap-1.5">
                    {selectedMedicine.corePillars.map((p, i) => (
                      <View
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10"
                      >
                        <Text className="text-[11px] font-sans-medium text-gray-200">
                          {p}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* High Yield Topics */}
                <View className="mt-4">
                  <Text className="text-[12px] font-sans-bold text-gray-300 uppercase tracking-wider mb-2.5">
                    Verified Protocols & Guidelines
                  </Text>
                  <View className="flex flex-col gap-2.5">
                    {selectedMedicine.highYieldTopics.map((top, i) => (
                      <View
                        key={i}
                        className="p-3 rounded-xl bg-[#090d0f] border border-white/10"
                      >
                        <Text className="text-[13px] font-sans-bold text-white mb-1">
                          {top.title}
                        </Text>
                        <Text className="text-[11.5px] font-sans text-gray-300 leading-relaxed mb-2">
                          {top.summary}
                        </Text>
                        <View
                          className="self-start px-2 py-0.5 rounded border"
                          style={{
                            backgroundColor: `${selectedMedicine.color}10`,
                            borderColor: `${selectedMedicine.color}30`,
                          }}
                        >
                          <Text
                            className="text-[9.5px] font-mono font-bold"
                            style={{ color: selectedMedicine.color }}
                          >
                            Ref: {top.guideline}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="mt-6 flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleConsultAiFromMedicine(selectedMedicine)}
                    className="flex-1 py-3.5 rounded-xl items-center justify-center flex-row gap-2 border active:opacity-85"
                    style={{
                      backgroundColor: selectedMedicine.color,
                      borderColor: selectedMedicine.color,
                      shadowColor: selectedMedicine.color,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.35,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Ionicons name="chatbubbles" size={16} color="#010101" />
                    <Text className="text-[#010101] font-sans-bold text-[13px]">
                      Consult Specialist AI ({selectedMedicine.name})
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#080c0d',
  },
  cardGradient: {
    padding: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#080c0e',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: '88%',
  },
});