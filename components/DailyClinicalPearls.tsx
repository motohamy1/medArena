import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { ClinicalPearl } from '../constants/DailyPearlsData';
import { dbService } from '../services/dbService';
import { ScrollStack } from './ScrollStack/ScrollStack';

const STORAGE_DATE_KEY = '@med_arena_pearls_date';
const STORAGE_REGEN_KEY = '@med_arena_pearls_regen_count';
const STORAGE_OFFSET_KEY = '@med_arena_pearls_offset';
const MAX_FREE_REGENS = 3;

export const DailyClinicalPearls = () => {
  const [pearls, setPearls] = useState<ClinicalPearl[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [regensRemaining, setRegensRemaining] = useState(MAX_FREE_REGENS);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPearl, setSelectedPearl] = useState<ClinicalPearl | null>(null);

  // Rotation animation for the regenerate icon
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Initialize daily state from AsyncStorage
  useEffect(() => {
    async function initDailyState() {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const storedDate = await AsyncStorage.getItem(STORAGE_DATE_KEY);
        const storedRegen = await AsyncStorage.getItem(STORAGE_REGEN_KEY);
        const storedOffset = await AsyncStorage.getItem(STORAGE_OFFSET_KEY);

        let currentOffset = 0;
        let remaining = MAX_FREE_REGENS;

        if (storedDate === todayStr) {
          remaining = storedRegen !== null ? parseInt(storedRegen, 10) : MAX_FREE_REGENS;
          currentOffset = storedOffset !== null ? parseInt(storedOffset, 10) : 0;
        } else {
          await AsyncStorage.setItem(STORAGE_DATE_KEY, todayStr);
          await AsyncStorage.setItem(STORAGE_REGEN_KEY, MAX_FREE_REGENS.toString());
          await AsyncStorage.setItem(STORAGE_OFFSET_KEY, '0');
        }

        setRegensRemaining(remaining);
        setOffset(currentOffset);

        const data = await dbService.getDailyClinicalPearls(currentOffset, 5);
        setPearls(data);
      } catch {
        const data = await dbService.getDailyClinicalPearls(0, 5);
        setPearls(data);
      } finally {
        setLoading(false);
      }
    }

    initDailyState();
  }, []);

  const handleRegenerate = useCallback(async () => {
    if (regensRemaining <= 0) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
      setShowUpgradeModal(true);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    Animated.sequence([
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);
    const nextOffset = offset + 1;
    const nextRemaining = regensRemaining - 1;

    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      await AsyncStorage.setItem(STORAGE_DATE_KEY, todayStr);
      await AsyncStorage.setItem(STORAGE_REGEN_KEY, nextRemaining.toString());
      await AsyncStorage.setItem(STORAGE_OFFSET_KEY, nextOffset.toString());

      setOffset(nextOffset);
      setRegensRemaining(nextRemaining);

      const freshPearls = await dbService.generateFreshClinicalPearls(undefined, 5);
      if (freshPearls && freshPearls.length > 0) {
        setPearls(freshPearls);
      } else {
        const fallback = await dbService.getDailyClinicalPearls(nextOffset, 5);
        setPearls(fallback);
      }
    } catch {
      const fallback = await dbService.getDailyClinicalPearls(nextOffset, 5);
      setPearls(fallback);
    } finally {
      setLoading(false);
    }
  }, [offset, regensRemaining, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleConsultAI = (pearl: ClinicalPearl) => {
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: { 
        query: `Explain the clinical rationale, mechanism, and guideline evidence for: "${pearl.title}" (${pearl.citation}).`,
        autoSend: 'true',
      },
    } as any);
  };

  return (
    <View className="px-6 pb-12 mt-4">
      {/* Subtle Visual Divider */}
      <View className="h-px bg-white/10 mb-5" />

      {/* Header Row */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 items-center justify-center">
            <Ionicons name="sparkles" size={16} color={Colors.gold} />
          </View>
          <View>
            <Text className="text-[17px] font-sans-bold text-white">
              Daily High-Yield Pearls
            </Text>
            <Text className="text-[11px] font-sans-medium text-gray-muted tracking-wide">
              Swipe Deck • Evidence & Pitfalls
            </Text>
          </View>
        </View>

        {/* Regenerate Action Button */}
        <TouchableOpacity
          onPress={handleRegenerate}
          activeOpacity={0.7}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-medium border border-white/10"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons
              name="sync"
              size={13}
              color={regensRemaining > 0 ? Colors.main : Colors.gold}
            />
          </Animated.View>
          <Text
            className="text-[11px] font-sans-semibold"
            style={{ color: regensRemaining > 0 ? Colors.main : Colors.gold }}
          >
            {regensRemaining > 0 ? `Shuffle (${regensRemaining})` : 'Upgrade'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ScrollStack Deck */}
      {loading ? (
        <View className="py-20 items-center justify-center">
          <ActivityIndicator size="small" color={Colors.main} />
          <Text className="text-gray-muted text-[12px] font-sans-medium mt-3">
            Loading today&apos;s clinical pearls deck...
          </Text>
        </View>
      ) : (
        <ScrollStack>
          {pearls.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.92}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setSelectedPearl(item);
              }}
              style={[
                styles.glassCardTouchable,
                {
                  borderColor: `${item.specialtyColor}50`,
                },
              ]}
            >
              <LinearGradient
                colors={[
                  `${item.specialtyColor}22`,
                  '#121922',
                  '#0a0e14',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glassCardGradient}
              >
                {/* Top Row: Specialty Badge + Key Threshold Badge */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View
                      style={[
                        styles.specialtyPill,
                        {
                          backgroundColor: `${item.specialtyColor}20`,
                          borderColor: `${item.specialtyColor}45`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.specialtyIcon as any}
                        size={12}
                        color={item.specialtyColor}
                      />
                      <Text
                        style={[
                          styles.specialtyPillText,
                          { color: item.specialtyColor },
                        ]}
                      >
                        {item.specialtyName}
                      </Text>
                    </View>

                    {item.badge ? (
                      <View style={styles.metricBadge}>
                        <Text style={styles.metricBadgeText} numberOfLines={1}>
                          {item.badge}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.pearlIconBox}>
                    <Ionicons name="sparkles" size={14} color={item.specialtyColor} />
                  </View>
                </View>

                {/* Catchy Title */}
                <Text style={styles.pearlTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                {/* Summary / Rule Box */}
                <View
                  style={[
                    styles.ruleSummaryBox,
                    { borderLeftColor: item.specialtyColor },
                  ]}
                >
                  <Text style={styles.ruleSummaryText} numberOfLines={2}>
                    <Text
                      style={[
                        styles.ruleHighlight,
                        { color: item.specialtyColor },
                      ]}
                    >
                      💡 Core Rule:{' '}
                    </Text>
                    {item.rule}
                  </Text>
                </View>

                {/* Footer: Citation & View Protocol */}
                <View style={styles.cardFooterRow}>
                  <View style={styles.citationBox}>
                    <Ionicons
                      name="book-outline"
                      size={12}
                      color="#94a3b8"
                      style={{ flexShrink: 0 }}
                    />
                    <Text
                      style={styles.citationText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.citation}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.tapDetailsBadge,
                      {
                        borderColor: `${item.specialtyColor}55`,
                        backgroundColor: `${item.specialtyColor}18`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tapDetailsText,
                        { color: item.specialtyColor },
                      ]}
                      numberOfLines={1}
                    >
                      View Protocol
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={11}
                      color={item.specialtyColor}
                      style={{ flexShrink: 0 }}
                    />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollStack>
      )}

      {/* Comprehensive Pearl Details Modal */}
      <Modal
        visible={!!selectedPearl}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPearl(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdropDismiss}
            activeOpacity={1}
            onPress={() => setSelectedPearl(null)}
          />

          <View style={styles.modalSheetContainer}>
            <View style={styles.modalPullHandle} />

            {selectedPearl && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.modalTopBar}>
                  <View
                    style={[
                      styles.modalSpecialtyPill,
                      {
                        backgroundColor: `${selectedPearl.specialtyColor}20`,
                        borderColor: `${selectedPearl.specialtyColor}50`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={selectedPearl.specialtyIcon as any}
                      size={13}
                      color={selectedPearl.specialtyColor}
                    />
                    <Text
                      style={[
                        styles.modalSpecialtyText,
                        { color: selectedPearl.specialtyColor },
                      ]}
                    >
                      {selectedPearl.specialtyName}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedPearl(null)}
                    activeOpacity={0.7}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons name="close" size={20} color="#cbd5e1" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedPearl.title}</Text>

                {selectedPearl.badge ? (
                  <View
                    style={[
                      styles.modalMetricBadge,
                      { borderColor: `${selectedPearl.specialtyColor}40` },
                    ]}
                  >
                    <Ionicons
                      name="speedometer-outline"
                      size={14}
                      color={selectedPearl.specialtyColor}
                    />
                    <Text
                      style={[
                        styles.modalMetricText,
                        { color: selectedPearl.specialtyColor },
                      ]}
                    >
                      Key Metric: {selectedPearl.badge}
                    </Text>
                  </View>
                ) : null}

                {/* SECTION 1: Core Rule */}
                <View
                  style={[
                    styles.modalSectionCard,
                    {
                      borderLeftColor: Colors.teal,
                      borderLeftWidth: 3.5,
                      backgroundColor: 'rgba(109, 194, 189, 0.08)',
                    },
                  ]}
                >
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="bulb" size={16} color={Colors.teal} />
                    <Text
                      style={[styles.modalSectionTitle, { color: Colors.teal }]}
                    >
                      Core Rule & Physiological Rationale
                    </Text>
                  </View>
                  <Text style={styles.modalSectionBody}>
                    {selectedPearl.rule}
                  </Text>
                </View>

                {/* SECTION 2: Action Protocol */}
                <View
                  style={[
                    styles.modalSectionCard,
                    {
                      borderLeftColor: Colors.main,
                      borderLeftWidth: 3.5,
                      backgroundColor: 'rgba(169, 228, 232, 0.06)',
                    },
                  ]}
                >
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="flash" size={16} color={Colors.main} />
                    <Text
                      style={[styles.modalSectionTitle, { color: Colors.main }]}
                    >
                      Action Protocol & Precise Dosing
                    </Text>
                  </View>
                  <Text style={styles.modalSectionBody}>
                    {selectedPearl.action}
                  </Text>
                </View>

                {/* SECTION 3: Pitfall */}
                {selectedPearl.pitfall ? (
                  <View
                    style={[
                      styles.modalSectionCard,
                      {
                        borderLeftColor: Colors.pink,
                        borderLeftWidth: 3.5,
                        backgroundColor: 'rgba(249, 186, 201, 0.08)',
                      },
                    ]}
                  >
                    <View style={styles.modalSectionHeader}>
                      <Ionicons name="warning" size={16} color={Colors.pink} />
                      <Text
                        style={[
                          styles.modalSectionTitle,
                          { color: Colors.pink },
                        ]}
                      >
                        High-Risk Pitfall & Warning
                      </Text>
                    </View>
                    <Text style={[styles.modalSectionBody, { color: '#ffd6e7' }]}>
                      {selectedPearl.pitfall}
                    </Text>
                  </View>
                ) : null}

                {/* SECTION 4: Citation */}
                <View style={styles.modalCitationBox}>
                  <Ionicons name="book" size={14} color="#94a3b8" />
                  <Text style={styles.modalCitationText}>
                    Evidence Source: {selectedPearl.citation}
                  </Text>
                </View>

                {/* Consult AI Button */}
                <TouchableOpacity
                  onPress={() => {
                    const pearlToConsult = selectedPearl;
                    setSelectedPearl(null);
                    handleConsultAI(pearlToConsult);
                  }}
                  activeOpacity={0.85}
                  style={[
                    styles.modalConsultBtn,
                    { backgroundColor: selectedPearl.specialtyColor },
                  ]}
                >
                  <Ionicons name="sparkles" size={16} color={Colors.ink} />
                  <Text style={styles.modalConsultBtnText}>
                    Consult Specialist AI on this Pearl
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.ink} />
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Upgrade / Daily Limit Modal */}
      <Modal
        visible={showUpgradeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View className="flex-1 bg-black/80 items-center justify-center px-6">
          <View
            className="w-full max-w-sm rounded-3xl bg-teal-dark border border-gold/30 p-6"
            style={{
              shadowColor: Colors.gold,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <View className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/40 items-center justify-center mx-auto mb-4">
              <Ionicons name="star" size={28} color={Colors.gold} />
            </View>

            <Text className="text-white font-sans-bold text-[19px] text-center mb-1.5">
              Daily Shuffle Limit Reached
            </Text>

            <Text className="text-gray-muted font-sans text-[13px] text-center leading-5 mb-5">
              You&apos;ve used all <Text className="text-white font-sans-semibold">3 free daily shuffles</Text>. Your free quota resets every midnight at 00:00.
            </Text>

            <View className="bg-deep-teal rounded-2xl p-3.5 border border-white/5 mb-5 gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
                <Text className="text-gray-200 text-[12px] font-sans-medium">
                  Unlimited daily clinical shuffles
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
                <Text className="text-gray-200 text-[12px] font-sans-medium">
                  Filter pearls by your specific sub-specialty
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
                <Text className="text-gray-200 text-[12px] font-sans-medium">
                  Save & bookmark pearls to custom study decks
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowUpgradeModal(false)}
              className="w-full py-3.5 rounded-full bg-gold items-center justify-center mb-2.5 active:opacity-90"
              style={{
                shadowColor: Colors.gold,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text className="text-ink font-sans-bold text-[14px]">
                Upgrade to Pro (Coming Soon)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowUpgradeModal(false)}
              className="w-full py-2.5 items-center justify-center"
            >
              <Text className="text-gray-400 font-sans-medium text-[13px]">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  glassCardTouchable: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: '#0c1017',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  glassCardGradient: {
    padding: 16,
    borderRadius: 24,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  specialtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    flexShrink: 0,
  },
  specialtyPillText: {
    fontSize: 10,
    fontFamily: 'PlexSans_700Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  metricBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    maxWidth: 140,
    flexShrink: 1,
    minWidth: 0,
  },
  metricBadgeText: {
    fontSize: 9.5,
    fontFamily: 'PlexMono_500Medium',
    color: '#e2e8f0',
    fontWeight: '600',
    includeFontPadding: false,
  },
  pearlIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pearlTitle: {
    color: '#ffffff',
    fontFamily: 'PlexSans_700Bold',
    fontSize: 16.5,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: 8,
    includeFontPadding: false,
  },
  ruleSummaryBox: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderLeftWidth: 3,
    marginBottom: 10,
  },
  ruleSummaryText: {
    color: '#cbd5e1',
    fontFamily: 'PlexSans_400Regular',
    fontSize: 12,
    lineHeight: 16.5,
    includeFontPadding: false,
  },
  ruleHighlight: {
    fontFamily: 'PlexSans_700Bold',
    fontWeight: '700',
    includeFontPadding: false,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  citationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  citationText: {
    fontSize: 10,
    fontFamily: 'PlexMono_500Medium',
    color: '#94a3b8',
    flex: 1,
    flexShrink: 1,
    includeFontPadding: false,
  },
  tapDetailsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    flexShrink: 0,
  },
  tapDetailsText: {
    fontSize: 10.5,
    fontFamily: 'PlexSans_700Bold',
    fontWeight: '700',
    includeFontPadding: false,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalBackdropDismiss: {
    flex: 1,
  },
  modalSheetContainer: {
    backgroundColor: '#0a0f14',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
  },
  modalPullHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalSpecialtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalSpecialtyText: {
    fontSize: 11.5,
    fontFamily: 'PlexSans_700Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#ffffff',
    fontFamily: 'PlexSans_700Bold',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    marginBottom: 10,
    includeFontPadding: false,
  },
  modalMetricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  modalMetricText: {
    fontSize: 12,
    fontFamily: 'PlexMono_500Medium',
    fontWeight: '600',
    includeFontPadding: false,
  },
  modalSectionCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 6,
  },
  modalSectionTitle: {
    fontSize: 12.5,
    fontFamily: 'PlexSans_700Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  modalSectionBody: {
    color: '#e2e8f0',
    fontFamily: 'PlexSans_400Regular',
    fontSize: 13.5,
    lineHeight: 20,
    includeFontPadding: false,
  },
  modalCitationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  modalCitationText: {
    color: '#94a3b8',
    fontFamily: 'PlexMono_500Medium',
    fontSize: 11,
    flex: 1,
    includeFontPadding: false,
  },
  modalConsultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  modalConsultBtnText: {
    color: '#010101',
    fontFamily: 'PlexSans_700Bold',
    fontSize: 13.5,
    fontWeight: '700',
    includeFontPadding: false,
  },
});
