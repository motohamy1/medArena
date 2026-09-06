import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { MEDICAL_UPDATES_DATA, MedicalUpdate } from '../constants/MedicalUpdatesData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 320);
const CARD_GAP = 14;

// Distinct theme configuration for glassmorphic update cards
const getUpdateTheme = (item: MedicalUpdate) => {
  switch (item.category) {
    case 'Clinical Trial':
      return {
        color: '#4bc0b8', // Medical Jewel Teal
        gradient: ['rgba(109, 194, 189, 0.26)', '#0e2427', '#071315'] as const,
        border: 'rgba(109, 194, 189, 0.45)',
        shadow: '#4bc0b8',
        tagIcon: 'flask' as const,
      };
    case 'Practice Guideline':
      return {
        color: '#cbc8f5', // Soft Lavender / Periwinkle
        gradient: ['rgba(203, 200, 245, 0.26)', '#1c1736', '#0c0919'] as const,
        border: 'rgba(203, 200, 245, 0.45)',
        shadow: '#cbc8f5',
        tagIcon: 'ribbon' as const,
      };
    case 'FDA Approval':
      return {
        color: '#a9e4e8', // Luminous Mint
        gradient: ['rgba(169, 228, 232, 0.26)', '#133534', '#061716'] as const,
        border: 'rgba(169, 228, 232, 0.45)',
        shadow: '#a9e4e8',
        tagIcon: 'checkmark-circle' as const,
      };
    case 'Safety Alert':
    default:
      return {
        color: '#f9bac9', // Pastel Rose
        gradient: ['rgba(249, 186, 201, 0.26)', '#381525', '#16070e'] as const,
        border: 'rgba(249, 186, 201, 0.45)',
        shadow: '#f9bac9',
        tagIcon: 'warning' as const,
      };
  }
};

export const MedicalUpdatesCarousel: React.FC = () => {
  const [selectedUpdate, setSelectedUpdate] = useState<MedicalUpdate | null>(null);

  const handleConsultAI = (update: MedicalUpdate) => {
    setSelectedUpdate(null);
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: {
        query: update.promptQuery,
        autoSend: 'true',
      },
    } as any);
  };

  const renderCard = ({ item, index }: { item: MedicalUpdate; index: number }) => {
    const theme = getUpdateTheme(item);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
          setSelectedUpdate(item);
        }}
        style={[
          styles.glassCardTouchable,
          {
            borderColor: theme.border,
            shadowColor: theme.shadow,
            marginLeft: index === 0 ? 20 : 0,
            marginRight: index === MEDICAL_UPDATES_DATA.length - 1 ? 20 : CARD_GAP,
          },
        ]}
      >
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassCardGradient}
        >
          {/* Top Header Row */}
          <View className="flex-row items-center justify-between mb-2.5">
            <View
              className="px-2.5 py-1 rounded-lg border flex-row items-center gap-1.5 flex-shrink-0"
              style={{
                backgroundColor: `${theme.color}20`,
                borderColor: `${theme.color}45`,
              }}
            >
              <Ionicons name={item.specialtyIcon as any} size={12} color={theme.color} />
              <Text
                className="text-[10px] font-sans-bold uppercase tracking-wider"
                style={{ color: theme.color, includeFontPadding: false }}
              >
                {item.specialtyName}
              </Text>
            </View>

            <View className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 flex-row items-center gap-1 flex-shrink-0">
              <Ionicons name="calendar-outline" size={10} color="#cbd5e1" />
              <Text className="text-[10px] font-sans-medium text-gray-300" style={{ includeFontPadding: false }}>
                {item.date}
              </Text>
            </View>
          </View>

          {/* Badge Banner */}
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: theme.color }}
            />
            <Text
              className="text-[10.5px] font-mono font-bold uppercase tracking-wider"
              style={{ color: theme.color, includeFontPadding: false }}
            >
              {item.badge}
            </Text>
          </View>

          {/* Title */}
          <Text
            className="text-[15px] font-sans-bold text-white leading-5 mb-2"
            numberOfLines={2}
            style={{ includeFontPadding: false }}
          >
            {item.title}
          </Text>

          {/* Glassmorphic Summary Box with Colored Left Accent */}
          <View
            style={[
              styles.summaryGlassBox,
              { borderLeftColor: theme.color },
            ]}
          >
            <Text
              className="text-[11.5px] font-sans text-gray-200 leading-4"
              numberOfLines={3}
              style={{ includeFontPadding: false }}
            >
              {item.headline}
            </Text>
          </View>

          {/* Card Footer */}
          <View className="pt-2.5 border-t border-white/10 flex-row items-center justify-between mt-auto gap-2">
            <Text
              className="text-[10px] font-mono text-gray-400 flex-1"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ flexShrink: 1, includeFontPadding: false }}
            >
              📄 {item.journalOrSource}
            </Text>
            <View
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full border flex-shrink-0"
              style={{
                backgroundColor: `${theme.color}18` ,
                borderColor: `${theme.color}50`,
              }}
            >
              <Text
                className="text-[10.5px] font-sans-bold"
                style={{ color: theme.color, includeFontPadding: false }}
              >
                Read Brief
              </Text>
              <Ionicons name="arrow-forward" size={11} color={theme.color} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const selectedTheme = selectedUpdate ? getUpdateTheme(selectedUpdate) : null;

  return (
    <View className="mb-8">
      {/* Section Header */}
      <View className="px-6 flex-row items-center justify-between mb-3.5">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-teal/15 border border-teal/30 items-center justify-center">
            <Ionicons name="newspaper-outline" size={16} color={Colors.teal} />
          </View>
          <View>
            <Text className="text-[17px] font-sans-bold text-white">
              Latest Medical Updates
            </Text>
            <Text className="text-[11px] font-sans-medium text-gray-muted">
              Clinical Trials • Guidelines • FDA Approvals
            </Text>
          </View>
        </View>

        <View className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
          <Text className="text-[10.5px] font-mono text-lime font-bold">
            {MEDICAL_UPDATES_DATA.length} New
          </Text>
        </View>
      </View>

      {/* Horizontal Album Carousel */}
      <FlatList
        data={MEDICAL_UPDATES_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
      />

      {/* Detail Modal with Matching Glassmorphism */}
      <Modal
        visible={!!selectedUpdate}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUpdate(null)}
      >
        <View className="flex-1 bg-black/85 justify-center items-center px-5">
          {selectedUpdate && selectedTheme && (
            <View
              className="w-full max-w-md rounded-3xl border overflow-hidden max-h-[85%]"
              style={{
                borderColor: selectedTheme.border,
                shadowColor: selectedTheme.shadow,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.5,
                shadowRadius: 24,
                elevation: 16,
                backgroundColor: '#0c1017',
              }}
            >
              <LinearGradient
                colors={selectedTheme.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 22 }}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Header Tag */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View
                      className="px-2.5 py-1 rounded-lg border flex-row items-center gap-1.5"
                      style={{
                        backgroundColor: `${selectedTheme.color}25`,
                        borderColor: `${selectedTheme.color}50`,
                      }}
                    >
                      <Ionicons
                        name={selectedUpdate.specialtyIcon as any}
                        size={13}
                        color={selectedTheme.color}
                      />
                      <Text
                        className="text-[10.5px] font-sans-bold uppercase tracking-wider"
                        style={{ color: selectedTheme.color, includeFontPadding: false }}
                      >
                        {selectedUpdate.specialtyName}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => setSelectedUpdate(null)}
                      className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  {/* Evidence Badge */}
                  <View className="mb-2">
                    <Text
                      className="text-[11.5px] font-mono font-bold"
                      style={{ color: selectedTheme.color, includeFontPadding: false }}
                    >
                      ⚡ {selectedUpdate.badge} • {selectedUpdate.date}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text className="text-[18px] font-sans-bold text-white leading-6 mb-3" style={{ includeFontPadding: false }}>
                    {selectedUpdate.title}
                  </Text>

                  {/* Headline Box */}
                  <View
                    className="border rounded-2xl p-3.5 mb-4"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderLeftColor: selectedTheme.color,
                      borderLeftWidth: 3.5,
                    }}
                  >
                    <Text className="text-[13px] font-sans text-gray-200 leading-5" style={{ includeFontPadding: false }}>
                      {selectedUpdate.headline}
                    </Text>
                  </View>

                  {/* Key Takeaways */}
                  <Text
                    className="text-[12.5px] font-sans-bold uppercase tracking-wider mb-2"
                    style={{ color: selectedTheme.color, includeFontPadding: false }}
                  >
                    Key Takeaways
                  </Text>
                  <View className="gap-2 mb-4">
                    {selectedUpdate.keyTakeaways.map((point, idx) => (
                      <View key={idx} className="flex-row items-start gap-2">
                        <View
                          className="w-1.5 h-1.5 rounded-full mt-1.5"
                          style={{ backgroundColor: selectedTheme.color }}
                        />
                        <Text className="text-[12.5px] font-sans text-gray-300 flex-1 leading-4.5" style={{ includeFontPadding: false }}>
                          {point}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Clinical Impact */}
                  <View
                    className="border rounded-xl p-3 mb-4"
                    style={{
                      backgroundColor: `${selectedTheme.color}10`,
                      borderColor: `${selectedTheme.color}35`,
                    }}
                  >
                    <Text
                      className="text-[11px] font-sans-bold uppercase mb-1"
                      style={{ color: selectedTheme.color, includeFontPadding: false }}
                    >
                      Clinical Practice Impact
                    </Text>
                    <Text className="text-[12px] font-sans text-gray-200 leading-4.5" style={{ includeFontPadding: false }}>
                      {selectedUpdate.clinicalImpact}
                    </Text>
                  </View>

                  {/* Citation */}
                  <Text className="text-[11px] font-mono text-gray-400 mb-5" style={{ includeFontPadding: false }}>
                    📚 Source: {selectedUpdate.journalOrSource}
                  </Text>

                  {/* Action Button */}
                  <TouchableOpacity
                    onPress={() => handleConsultAI(selectedUpdate)}
                    className="w-full py-3.5 rounded-full flex-row items-center justify-center gap-2 active:opacity-90 mb-2.5"
                    style={{
                      backgroundColor: selectedTheme.color,
                      shadowColor: selectedTheme.color,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Ionicons name="sparkles" size={16} color="#010101" />
                    <Text className="text-[#010101] font-sans-bold text-[14px]" style={{ includeFontPadding: false }}>
                      Consult AI for Deep Analysis
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setSelectedUpdate(null)}
                    className="w-full py-2 items-center justify-center"
                  >
                    <Text className="text-gray-400 font-sans-medium text-[13px]" style={{ includeFontPadding: false }}>
                      Dismiss
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </LinearGradient>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 4,
  },
  glassCardTouchable: {
    width: CARD_WIDTH,
    minHeight: 215,
    borderRadius: 22,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 7,
    backgroundColor: '#0c1017',
  },
  glassCardGradient: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  summaryGlassBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderLeftWidth: 3,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
});
