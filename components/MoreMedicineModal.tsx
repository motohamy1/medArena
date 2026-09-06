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
import {
  EXPANDED_MEDICINE_SPECIALTIES,
  MedicineSpecialtyItem,
} from '../constants/ExpandedSpecialtiesData';

interface MoreMedicineModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MoreMedicineModal: React.FC<MoreMedicineModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<MedicineSpecialtyItem | null>(null);

  const handleOpenDetail = (item: MedicineSpecialtyItem) => {
    setSelectedSpecialty(item);
  };

  const handleCloseDetail = () => {
    setSelectedSpecialty(null);
  };

  const handleConsultAi = (item: MedicineSpecialtyItem) => {
    handleCloseDetail();
    onClose();
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: {
        query: item.aiPrompt,
        categoryContext: item.scientificName,
      },
    } as any);
  };

  return (
    <>
      {/* Main List Modal */}
      <Modal
        visible={visible && !selectedSpecialty}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View className="flex-row items-center justify-between pb-3.5 border-b border-white/10">
              <View className="flex-row items-center gap-2.5">
                <View className="w-10 h-10 rounded-2xl bg-[#4bc0b8]20 border border-[#4bc0b8]40 items-center justify-center">
                  <Ionicons name="medical" size={20} color="#4bc0b8" />
                </View>
                <View>
                  <Text className="text-[10px] font-mono text-[#4bc0b8] font-bold uppercase tracking-wider">
                    Expanded Clinical Disciplines
                  </Text>
                  <Text className="text-[17px] font-sans-bold text-white leading-tight">
                    More Medical Specialties
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text className="text-[12px] font-sans text-gray-400 mt-2 mb-3.5 px-0.5">
              Select a specialized internal medicine domain to review clinical protocols, high-yield pillars, and AI consultation.
            </Text>

            {/* Specialties List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View className="flex flex-col gap-3">
                {EXPANDED_MEDICINE_SPECIALTIES.map((spec) => (
                  <TouchableOpacity
                    key={spec.id}
                    onPress={() => handleOpenDetail(spec)}
                    activeOpacity={0.8}
                    style={[
                      styles.cardContainer,
                      {
                        borderColor: `${spec.color}35`,
                        shadowColor: spec.color,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[`${spec.color}15`, `${spec.color}04`, '#080c0e']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.cardGradient}
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                          <View
                            className="w-10 h-10 rounded-xl items-center justify-center border"
                            style={{
                              backgroundColor: `${spec.color}18`,
                              borderColor: `${spec.color}45`,
                            }}
                          >
                            <Ionicons name={spec.icon} size={19} color={spec.color} />
                          </View>
                          <View className="flex-1">
                            <View
                              className="self-start px-2 py-0.5 rounded-md border mb-0.5"
                              style={{
                                backgroundColor: `${spec.color}15`,
                                borderColor: `${spec.color}40`,
                              }}
                            >
                              <Text
                                className="text-[9px] font-mono font-bold uppercase tracking-wider"
                                style={{ color: spec.color }}
                              >
                                {spec.badge}
                              </Text>
                            </View>
                            <Text
                              className="text-[14.5px] font-sans-bold text-white leading-tight"
                              numberOfLines={1}
                            >
                              {spec.scientificName}
                            </Text>
                          </View>
                        </View>

                        <View
                          className="w-7 h-7 rounded-full items-center justify-center border"
                          style={{
                            backgroundColor: `${spec.color}12`,
                            borderColor: `${spec.color}35`,
                          }}
                        >
                          <Ionicons name="chevron-forward" size={14} color={spec.color} />
                        </View>
                      </View>

                      <Text
                        className="text-[11.5px] font-sans text-gray-300 mt-2 leading-relaxed"
                        numberOfLines={2}
                      >
                        {spec.scope}
                      </Text>

                      {/* Core Pillars preview */}
                      <View className="flex-row flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-white/5">
                        {spec.corePillars.slice(0, 3).map((pillar, i) => (
                          <View
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-black/40 border border-white/10"
                          >
                            <Text className="text-[9.5px] font-sans-medium text-gray-300">
                              {pillar}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sub Detail Modal */}
      <Modal
        visible={visible && !!selectedSpecialty}
        transparent
        animationType="slide"
        onRequestClose={handleCloseDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSpecialty && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
              >
                {/* Header with back & close */}
                <View className="flex-row items-center justify-between pb-3 border-b border-white/10">
                  <TouchableOpacity
                    onPress={handleCloseDetail}
                    className="flex-row items-center gap-1.5 pr-2 py-1"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="arrow-back" size={18} color="#fff" />
                    <Text className="text-[12px] font-sans-semibold text-gray-300">Back</Text>
                  </TouchableOpacity>

                  <View className="flex-1 items-center px-2">
                    <Text
                      className="text-[10px] font-mono font-bold uppercase"
                      style={{ color: selectedSpecialty.color }}
                    >
                      {selectedSpecialty.badge}
                    </Text>
                    <Text
                      className="text-[15px] font-sans-bold text-white text-center leading-tight"
                      numberOfLines={1}
                    >
                      {selectedSpecialty.scientificName}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      handleCloseDetail();
                      onClose();
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Scope */}
                <View className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5">
                  <Text className="text-[12px] font-sans-medium text-gray-200 leading-relaxed">
                    {selectedSpecialty.scope}
                  </Text>
                </View>

                {/* Clinical Pearl */}
                {selectedSpecialty.clinicalPearls && (
                  <View
                    className="mt-3.5 p-3.5 rounded-2xl border"
                    style={{
                      backgroundColor: `${selectedSpecialty.color}10`,
                      borderColor: `${selectedSpecialty.color}40`,
                    }}
                  >
                    <View className="flex-row items-center gap-1.5 mb-1">
                      <Ionicons name="shield-checkmark" size={14} color={selectedSpecialty.color} />
                      <Text
                        className="text-[11px] font-sans-bold uppercase tracking-wider"
                        style={{ color: selectedSpecialty.color }}
                      >
                        Clinical Pearl & High-Yield Caveat
                      </Text>
                    </View>
                    <Text className="text-[12px] font-sans text-gray-200 leading-relaxed">
                      {selectedSpecialty.clinicalPearls}
                    </Text>
                  </View>
                )}

                {/* Core Pillars */}
                <View className="mt-4">
                  <Text className="text-[12px] font-sans-bold text-gray-300 uppercase tracking-wider mb-2">
                    Core Clinical Pillars
                  </Text>
                  <View className="flex-row flex-wrap gap-1.5">
                    {selectedSpecialty.corePillars.map((p, i) => (
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
                    {selectedSpecialty.highYieldTopics.map((top, i) => (
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
                            backgroundColor: `${selectedSpecialty.color}10`,
                            borderColor: `${selectedSpecialty.color}30`,
                          }}
                        >
                          <Text
                            className="text-[9.5px] font-mono font-bold"
                            style={{ color: selectedSpecialty.color }}
                          >
                            Ref: {top.guideline}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="mt-6">
                  <TouchableOpacity
                    onPress={() => handleConsultAi(selectedSpecialty)}
                    className="w-full py-3.5 rounded-xl items-center justify-center flex-row gap-2 border active:opacity-85"
                    style={{
                      backgroundColor: selectedSpecialty.color,
                      borderColor: selectedSpecialty.color,
                      shadowColor: selectedSpecialty.color,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.35,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Ionicons name="chatbubbles" size={16} color="#010101" />
                    <Text className="text-[#010101] font-sans-bold text-[13px]">
                      Consult Specialist AI ({selectedSpecialty.name})
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 18,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#080c0d',
  },
  cardGradient: {
    padding: 13,
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
