import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopicItem } from '../constants/SpecialtyData';
import { Colors } from '../constants/Colors';

interface ClinicalGuideProps {
  topicData: TopicItem;
  themeColor: string;
  specialtyIllustration?: any;
  targetSectionIndex?: number;
  onBackToMap?: () => void;
}

export default function ClinicalGuide({
  topicData,
  themeColor,
  specialtyIllustration,
  targetSectionIndex,
  onBackToMap,
}: ClinicalGuideProps) {
  const illustration = topicData.illustration || specialtyIllustration;
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeSectionFilter, setActiveSectionFilter] = useState<number | null>(
    targetSectionIndex !== undefined ? targetSectionIndex : null
  );

  useEffect(() => {
    if (targetSectionIndex !== undefined && targetSectionIndex >= 0) {
      setActiveSectionFilter(targetSectionIndex);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (targetSectionIndex === undefined) {
      setActiveSectionFilter(null);
    }
  }, [targetSectionIndex]);

  const allSections = topicData.clinicalContent || [];
  const displaySections =
    activeSectionFilter !== null && allSections[activeSectionFilter]
      ? [{ section: allSections[activeSectionFilter], index: activeSectionFilter }]
      : allSections.map((sec, idx) => ({ section: sec, index: idx }));

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header / Hero */}
      <View className="items-center mt-6 mb-4 px-6">
        <View
          className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2"
          style={{ borderColor: `${themeColor}60` }}
        >
          {illustration ? (
            <Image
              source={illustration}
              className="w-full h-full opacity-85"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-teal-dark items-center justify-center">
              <Ionicons name="medical" size={32} color={themeColor} />
            </View>
          )}
        </View>

        {/* Type Badge */}
        <View
          className="px-3 py-1 rounded-full border mb-2"
          style={{ backgroundColor: `${themeColor}15`, borderColor: `${themeColor}40` }}
        >
          <Text className="text-[11px] font-sans-bold uppercase tracking-wider" style={{ color: themeColor }}>
            {topicData.type || 'Clinical Reference'}
          </Text>
        </View>

        <Text className="text-white text-2xl font-sans-bold text-center mb-1 leading-tight">{topicData.title}</Text>
        <Text className="text-gray-300 text-sm font-sans-medium text-center leading-5 px-2">
          {topicData.subtitle}
        </Text>
      </View>

      {/* Quick Section Jumpers with 'All' Tab */}
      {allSections.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-2 mb-4 border-y border-white/5 bg-teal-dark/30"
          contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}
        >
          <TouchableOpacity
            onPress={() => setActiveSectionFilter(null)}
            className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 ${
              activeSectionFilter === null
                ? 'bg-white/15 border-white/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <Ionicons
              name="layers-outline"
              size={12}
              color={activeSectionFilter === null ? themeColor : '#94a3b8'}
            />
            <Text
              className={`text-[11px] font-sans-semibold ${
                activeSectionFilter === null ? 'text-white font-bold' : 'text-gray-400'
              }`}
            >
              All Sections
            </Text>
          </TouchableOpacity>

          {allSections.map((sec, idx) => {
            const isSelected = activeSectionFilter === idx;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveSectionFilter(isSelected ? null : idx)}
                className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white/15 border-white/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <Ionicons
                  name={getIconForSection(sec.title)}
                  size={12}
                  color={isSelected ? themeColor : '#94a3b8'}
                />
                <Text
                  className={`text-[11px] font-sans-semibold ${
                    isSelected ? 'text-white font-bold' : 'text-gray-300'
                  }`}
                >
                  {sec.title.split('&')[0].trim()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Active Filter Pill Notice or Return to Map Pill */}
      {activeSectionFilter !== null && allSections[activeSectionFilter] && (
        <View className="px-5 mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="scan-outline" size={13} color={themeColor} />
            <Text className="text-gray-300 text-xs font-sans-semibold">
              Focused Section View
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            {onBackToMap && (
              <TouchableOpacity
                onPress={onBackToMap}
                className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.12] border border-white/20 active:opacity-60"
              >
                <Ionicons name="git-network-outline" size={12} color={themeColor} />
                <Text className="text-xs font-sans-semibold" style={{ color: themeColor }}>
                  Back to Map
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setActiveSectionFilter(null)}
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/10"
            >
              <Text className="text-xs font-sans-medium text-gray-300">View All</Text>
              <Ionicons name="close-circle" size={13} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Clinical Content Sections */}
      <View className="px-5">
        {displaySections.length > 0 ? (
          displaySections.map(({ section, index }) => {
            const style = getSectionCardStyle(section.title, themeColor);

            return (
              <View key={index} className="mb-5">
                {/* Section Header */}
                <View className="flex-row items-center mb-2.5">
                  <View
                    className="w-7 h-7 rounded-full items-center justify-center mr-2.5 border"
                    style={{ backgroundColor: style.iconBg, borderColor: style.iconBorder }}
                  >
                    <Ionicons
                      name={getIconForSection(section.title)}
                      size={14}
                      color={style.iconColor}
                    />
                  </View>
                  <Text className="text-white text-base font-sans-bold flex-1">{section.title}</Text>
                </View>

                {/* Section Content Container */}
                <View
                  className="rounded-2xl p-4 border"
                  style={{ backgroundColor: style.cardBg, borderColor: style.cardBorder }}
                >
                  <Text className="text-gray-200 text-sm leading-6 font-sans">
                    {section.content}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-12 px-6">
            <Ionicons name="document-text-outline" size={48} color="#404040" />
            <Text className="text-gray-400 mt-4 text-center text-sm leading-5">
              Clinical guidelines for this topic are being compiled from active medical references.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function getIconForSection(title: string): keyof typeof Ionicons.glyphMap {
  const lower = title.toLowerCase();
  if (lower.includes('definition') || lower.includes('overview') || lower.includes('introduction')) return 'book-outline';
  if (lower.includes('operative step') || lower.includes('surgical technique') || lower.includes('dissection')) return 'cut';
  if (lower.includes('instrument') || lower.includes('equipment') || lower.includes('device') || lower.includes('suture')) return 'hardware-chip';
  if (lower.includes('preoperative') || lower.includes('pre-op') || lower.includes('clearance') || lower.includes('risk')) return 'shield-checkmark';
  if (lower.includes('post-operative') || lower.includes('post-op') || lower.includes('critical care') || lower.includes('eras') || lower.includes('drain')) return 'pulse';
  if (lower.includes('complication') || lower.includes('intraoperative') || lower.includes('pitfall') || lower.includes('malpractice') || lower.includes('warning')) return 'alert-circle';
  if (lower.includes('scenario') || lower.includes('presentation') || lower.includes('history')) return 'document-text';
  if (lower.includes('triage') || lower.includes('red flag') || lower.includes('emergency')) return 'warning';
  if (lower.includes('diagnostic') || lower.includes('criteria') || lower.includes('scoring') || lower.includes('scale')) return 'clipboard';
  if (lower.includes('pharmacotherapy') || lower.includes('dosing') || lower.includes('medication') || lower.includes('drug')) return 'medkit';
  if (lower.includes('algorithm') || lower.includes('stepwise') || lower.includes('management') || lower.includes('protocol')) return 'git-network';
  if (lower.includes('citation') || lower.includes('reference') || lower.includes('guideline') || lower.includes('trial')) return 'book';
  return 'information-circle';
}

function getSectionCardStyle(title: string, themeColor: string) {
  const lower = title.toLowerCase();

  // Clinical Definition & Overview (Clean Lavender / Indigo)
  if (lower.includes('definition') || lower.includes('overview') || lower.includes('introduction')) {
    return {
      cardBg: 'rgba(203, 200, 245, 0.08)',
      cardBorder: 'rgba(203, 200, 245, 0.4)',
      iconBg: 'rgba(203, 200, 245, 0.2)',
      iconBorder: 'rgba(203, 200, 245, 0.55)',
      iconColor: '#cbc8f5',
    };
  }

  // Operative Steps & Techniques (Surgical Cut - Vibrant Mint/Teal)
  if (lower.includes('operative step') || lower.includes('surgical technique') || lower.includes('dissection')) {
    return {
      cardBg: 'rgba(169, 228, 232, 0.07)',
      cardBorder: 'rgba(169, 228, 232, 0.35)',
      iconBg: 'rgba(169, 228, 232, 0.18)',
      iconBorder: 'rgba(169, 228, 232, 0.5)',
      iconColor: '#a9e4e8',
    };
  }

  // Preoperative Risk & Preparation (Shield - Rose / Light Amber)
  if (lower.includes('preoperative') || lower.includes('pre-op') || lower.includes('clearance')) {
    return {
      cardBg: 'rgba(249, 186, 201, 0.07)',
      cardBorder: 'rgba(249, 186, 201, 0.35)',
      iconBg: 'rgba(249, 186, 201, 0.18)',
      iconBorder: 'rgba(249, 186, 201, 0.5)',
      iconColor: '#f9bac9',
    };
  }

  // Clinical Pitfalls & Malpractice Warnings / Critical Alerts (Pastel Rose Pink)
  if (lower.includes('complication') || lower.includes('pitfall') || lower.includes('malpractice') || lower.includes('warning') || lower.includes('red flag') || lower.includes('emergency')) {
    return {
      cardBg: 'rgba(249, 186, 201, 0.08)',
      cardBorder: 'rgba(249, 186, 201, 0.45)',
      iconBg: 'rgba(249, 186, 201, 0.2)',
      iconBorder: 'rgba(249, 186, 201, 0.6)',
      iconColor: '#f9bac9',
    };
  }

  // Diagnostic / Investigations (Jewel Teal)
  if (lower.includes('diagnostic') || lower.includes('investigation') || lower.includes('workup') || lower.includes('criteria') || lower.includes('scoring')) {
    return {
      cardBg: 'rgba(109, 194, 189, 0.07)',
      cardBorder: 'rgba(109, 194, 189, 0.35)',
      iconBg: 'rgba(109, 194, 189, 0.18)',
      iconBorder: 'rgba(109, 194, 189, 0.5)',
      iconColor: '#4bc0b8',
    };
  }

  // Default theme
  return {
    cardBg: `${themeColor}0f`,
    cardBorder: `${themeColor}40`,
    iconBg: `${themeColor}22`,
    iconBorder: `${themeColor}55`,
    iconColor: themeColor,
  };
}
