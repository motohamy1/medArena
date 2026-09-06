import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Modal,
  StatusBar,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router, useNavigation, useScrollToTop } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ClinicalPearl } from '../../constants/DailyPearlsData';
import { dbService } from '../../services/dbService';
import { ScrollStack } from '../../components/ScrollStack/ScrollStack';
import { MedicalUpdatesCarousel } from '../../components/MedicalUpdatesCarousel';

const STORAGE_DATE_KEY = '@med_arena_pearls_date';
const STORAGE_REGEN_KEY = '@med_arena_pearls_regen_count';
const STORAGE_OFFSET_KEY = '@med_arena_pearls_offset';
const STORAGE_BOOKMARKS_KEY = '@med_arena_saved_pearls_list';
// Stores full pearl objects so saved panel works offline and across DB/local sources
const STORAGE_SAVED_OBJECTS_KEY = '@med_arena_saved_pearls_objects';
const MAX_FREE_REGENS = 3;

export default function PearlsTab() {
  const [pearls, setPearls] = useState<ClinicalPearl[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  // Full objects of saved pearls — works with both Supabase and static-fallback IDs
  const [savedPearlObjects, setSavedPearlObjects] = useState<ClinicalPearl[]>([]);
  const [savedFilter, setSavedFilter] = useState<string>('All');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [regensRemaining, setRegensRemaining] = useState(MAX_FREE_REGENS);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPearl, setSelectedPearl] = useState<ClinicalPearl | null>(null);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  useScrollToTop(scrollViewRef);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
    return unsubscribe;
  }, [navigation]);

  // Load daily pearls and saved bookmarks
  useEffect(() => {
    async function loadData() {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const storedDate = await AsyncStorage.getItem(STORAGE_DATE_KEY);
        const storedRegen = await AsyncStorage.getItem(STORAGE_REGEN_KEY);
        const storedOffset = await AsyncStorage.getItem(STORAGE_OFFSET_KEY);
        const storedBookmarks = await AsyncStorage.getItem(STORAGE_BOOKMARKS_KEY);

        if (storedBookmarks) {
          try {
            setBookmarkedIds(JSON.parse(storedBookmarks));
          } catch {}
        }

        // Load full saved pearl objects for the Saved Pearls Deck section
        const storedObjects = await AsyncStorage.getItem(STORAGE_SAVED_OBJECTS_KEY);
        if (storedObjects) {
          try {
            setSavedPearlObjects(JSON.parse(storedObjects));
          } catch {}
        }

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

    loadData();
  }, []);

  const toggleBookmark = async (pearlId: string, pearlData?: ClinicalPearl) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const isBookmarked = bookmarkedIds.includes(pearlId);
    const updatedIds = isBookmarked
      ? bookmarkedIds.filter((id) => id !== pearlId)
      : [...bookmarkedIds, pearlId];

    // Also maintain the full objects list
    let updatedObjects: ClinicalPearl[];
    if (isBookmarked) {
      updatedObjects = savedPearlObjects.filter((p) => p.id !== pearlId);
    } else if (pearlData) {
      updatedObjects = [...savedPearlObjects, pearlData];
    } else {
      updatedObjects = savedPearlObjects;
    }

    setBookmarkedIds(updatedIds);
    setSavedPearlObjects(updatedObjects);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(updatedIds)),
      AsyncStorage.setItem(STORAGE_SAVED_OBJECTS_KEY, JSON.stringify(updatedObjects)),
    ]);
  };

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

      const targetSpec = specialtyFilter !== 'all' ? specialtyFilter : undefined;
      const freshPearls = await dbService.generateFreshClinicalPearls(targetSpec, 5);
      if (freshPearls && freshPearls.length > 0) {
        setPearls(freshPearls);
      } else {
        const newPearls = await dbService.getDailyClinicalPearls(nextOffset, 5, targetSpec);
        setPearls(newPearls);
      }
    } catch {
      const fallback = await dbService.getDailyClinicalPearls(nextOffset, 5, specialtyFilter);
      setPearls(fallback);
    } finally {
      setLoading(false);
    }
  }, [offset, regensRemaining, spinAnim, specialtyFilter]);

  const handleSelectSpecialty = async (specId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSpecialtyFilter(specId);
    setLoading(true);
    try {
      const data = await dbService.getDailyClinicalPearls(offset, 5, specId);
      setPearls(data);
    } finally {
      setLoading(false);
    }
  };

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

  // Dynamically derived specialties from whatever pearls exist in the database/pool
  const dynamicSpecialtyChips = useMemo(() => {
    const map = new Map<string, { id: string; label: string; icon: string; color: string }>();
    map.set('all', { id: 'all', label: 'All Specialties', icon: 'apps', color: Colors.main });

    for (const p of pearls) {
      if (p.specialtyId && !map.has(p.specialtyId)) {
        map.set(p.specialtyId, {
          id: p.specialtyId,
          label: p.specialtyName || p.specialtyId,
          icon: p.specialtyIcon || 'medkit',
          color: p.specialtyColor || Colors.main,
        });
      }
    }
    return Array.from(map.values());
  }, [pearls]);

  // Saved pearls from AsyncStorage — full objects, not resolved from static pool
  const savedPearlsList = savedPearlObjects;

  // Available categories for bookmarks filter
  const availableCategories = [
    'All',
    ...Array.from(new Set(savedPearlsList.map((p) => p.category))),
  ];

  // Filtered bookmarks list
  const filteredSavedPearls =
    savedFilter === 'All'
      ? savedPearlsList
      : savedPearlsList.filter((p) => p.category === savedFilter);

  // Date formatting for subtitle
  const today = new Date();
  const currentDateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'android' ? 10 : 6,
          paddingBottom: 120,
        }}
      >
        {/* Header Row */}
        <View className="px-5 pt-2 pb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-[23px] font-sans-bold text-white">
              Pearls & Updates
            </Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              <View className="w-2 h-2 rounded-full bg-main" />
              <Text className="text-[11.5px] font-mono text-gray-400">
                {currentDateFormatted} • High-Yield Briefs
              </Text>
            </View>
          </View>

          {/* Shuffle Action */}
          <TouchableOpacity
            onPress={handleRegenerate}
            activeOpacity={0.75}
            className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.06] border border-white/10"
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
              className="text-[11.5px] font-sans-semibold"
              style={{ color: regensRemaining > 0 ? Colors.main : Colors.gold, includeFontPadding: false }}
            >
              {regensRemaining > 0 ? `Shuffle (${regensRemaining})` : 'Upgrade'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Specialty Filter Pills (derived dynamically from database & live pool) */}
        {dynamicSpecialtyChips.length > 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-5 mb-4"
            contentContainerStyle={{ gap: 8, paddingRight: 20 }}
          >
            {dynamicSpecialtyChips.map((cat) => {
              const isSelected = specialtyFilter === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => handleSelectSpecialty(cat.id)}
                  activeOpacity={0.75}
                  className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                    isSelected
                      ? 'bg-main/20 border-main'
                      : 'bg-white/[0.04] border-white/10'
                  }`}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={12}
                    color={isSelected ? Colors.main : '#9CA3AF'}
                  />
                  <Text
                    className={`text-[12px] ${
                      isSelected
                        ? 'font-sans-bold text-main'
                        : 'font-sans-medium text-gray-400'
                    }`}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Section 1: Solid Glassmorphism Swipe Stack Deck */}
        <View className="px-5 mb-2">
          {loading ? (
            <View className="py-24 items-center justify-center">
              <ActivityIndicator size="small" color={Colors.main} />
              <Text className="text-gray-400 text-[12px] font-sans-medium mt-3">
                Loading today's clinical pearls deck...
              </Text>
            </View>
          ) : (
            <ScrollStack>
              {pearls.map((item) => {
                const isBookmarked = bookmarkedIds.includes(item.id);
                return (
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
                      {/* Top Header: Specialty Chip + Badge + Bookmark */}
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
                              <Text
                                style={styles.metricBadgeText}
                                numberOfLines={1}
                              >
                                {item.badge}
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleBookmark(item.id, item);
                          }}
                          activeOpacity={0.7}
                          style={styles.bookmarkButton}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                            size={15}
                            color={isBookmarked ? Colors.gold : '#9ca3af'}
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Catchy Pearl Title */}
                      <Text style={styles.pearlTitle} numberOfLines={2}>
                        {item.title}
                      </Text>

                      {/* Key Rule / Summary Box */}
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

                      {/* Card Footer: Citation & View Protocol CTA */}
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
                );
              })}
            </ScrollStack>
          )}
        </View>

        <View className="h-px bg-white/[0.08] mx-5 my-3.5" />

        {/* Section 2: Medical Updates Carousel */}
        <View className="mb-2">
          <MedicalUpdatesCarousel />
        </View>

        <View className="h-px bg-white/[0.08] mx-5 my-3.5" />

        {/* Section 3: Bookmarks & Saved Decks */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-3.5">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-xl bg-lavender/15 border border-lavender/30 items-center justify-center">
                <Ionicons name="bookmark" size={15} color={Colors.lavender} />
              </View>
              <View>
                <Text className="text-[16.5px] font-sans-bold text-white">
                  Saved Pearls Deck
                </Text>
                <Text className="text-[11px] font-sans-medium text-gray-400">
                  Personal High-Yield Study Collection
                </Text>
              </View>
            </View>

            <View className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
              <Text className="text-[10.5px] font-mono text-lavender font-semibold">
                {savedPearlsList.length} Saved
              </Text>
            </View>
          </View>

          {/* Filter Pills */}
          {savedPearlsList.length > 0 && availableCategories.length > 2 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              contentContainerStyle={{ gap: 8 }}
            >
              {availableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSavedFilter(cat)}
                  className={`px-3 py-1.5 rounded-full border ${
                    savedFilter === cat
                      ? 'bg-lavender/25 border-lavender'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-sans-semibold ${
                      savedFilter === cat ? 'text-lavender' : 'text-gray-400'
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Bookmarked Cards List */}
          {filteredSavedPearls.length === 0 ? (
            <View className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 items-center justify-center">
              <Ionicons name="bookmark-outline" size={26} color={Colors.grayMuted} />
              <Text className="text-white font-sans-bold text-[14px] mt-2 mb-1">
                {savedPearlsList.length === 0
                  ? 'No Saved Pearls Yet'
                  : 'No Pearls in this category'}
              </Text>
              <Text className="text-gray-400 font-sans text-[12px] text-center max-w-[260px] leading-4.5">
                {savedPearlsList.length === 0
                  ? 'Tap the bookmark icon on any pearl card above to save it for rapid clinical review.'
                  : 'Select another filter or save more pearls from the daily deck.'}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {filteredSavedPearls.map((savedItem) => (
                <TouchableOpacity
                  key={savedItem.id}
                  activeOpacity={0.85}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    setSelectedPearl(savedItem);
                  }}
                  className="p-4 rounded-2xl bg-[#0c1017] border border-white/10"
                >
                  <View className="flex-row items-center justify-between mb-2 gap-2">
                    <View
                      className="px-2.5 py-0.5 rounded-md border flex-shrink-0"
                      style={{
                        backgroundColor: `${savedItem.specialtyColor}15`,
                        borderColor: `${savedItem.specialtyColor}35`,
                      }}
                    >
                      <Text
                        className="text-[10px] font-sans-bold uppercase"
                        style={{ color: savedItem.specialtyColor, includeFontPadding: false }}
                      >
                        {savedItem.specialtyName}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleBookmark(savedItem.id);
                      }}
                      className="p-1 flex-shrink-0"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="bookmark" size={16} color={Colors.gold} />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-white font-sans-bold text-[15px] mb-1.5" style={{ includeFontPadding: false }}>
                    {savedItem.title}
                  </Text>

                  <Text
                    className="text-gray-300 font-sans text-[12px] leading-4.5 mb-3"
                    numberOfLines={2}
                    style={{ includeFontPadding: false }}
                  >
                    {savedItem.rule}
                  </Text>

                  <View className="flex-row items-center justify-between pt-2 border-t border-white/5 gap-2">
                    <Text
                      className="text-[10px] font-mono text-gray-400 flex-1"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{ flexShrink: 1, includeFontPadding: false }}
                    >
                      {savedItem.citation}
                    </Text>
                    <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-main/15 border border-main/30 flex-shrink-0">
                      <Ionicons name="sparkles" size={10} color={Colors.main} />
                      <Text className="text-main text-[10.5px] font-sans-semibold" style={{ includeFontPadding: false }}>
                        View Details
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
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

                  <View style={styles.modalTopActions}>
                    <TouchableOpacity
                      onPress={() => toggleBookmark(selectedPearl.id, selectedPearl)}
                      activeOpacity={0.7}
                      style={styles.modalActionButton}
                    >
                      <Ionicons
                        name={
                          bookmarkedIds.includes(selectedPearl.id)
                            ? 'bookmark'
                            : 'bookmark-outline'
                        }
                        size={18}
                        color={
                          bookmarkedIds.includes(selectedPearl.id)
                            ? Colors.gold
                            : '#9ca3af'
                        }
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setSelectedPearl(null)}
                      activeOpacity={0.7}
                      style={styles.modalActionButton}
                    >
                      <Ionicons name="close" size={20} color="#cbd5e1" />
                    </TouchableOpacity>
                  </View>
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

                {/* Section 1: Core Rule */}
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

                {/* Section 2: Action Protocol */}
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

                {/* Section 3: Pitfall */}
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

                {/* Section 4: Citation */}
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
            className="w-full max-w-sm rounded-3xl bg-[#0c1017] border border-gold/30 p-6"
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

            <Text className="text-gray-400 font-sans text-[13px] text-center leading-5 mb-5">
              You've used all{' '}
              <Text className="text-white font-sans-semibold">
                3 free daily shuffles
              </Text>
              . Your free quota resets every midnight at 00:00.
            </Text>

            <View className="bg-white/[0.04] rounded-2xl p-3.5 border border-white/5 mb-5 gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.gold}
                />
                <Text className="text-gray-200 text-[12px] font-sans-medium">
                  Unlimited daily clinical shuffles
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.gold}
                />
                <Text className="text-gray-200 text-[12px] font-sans-medium">
                  Custom specialty-specific pearl filtering
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.gold}
                />
                <Text className="text-gray-200 text-[12px] font-sans-medium">
                  Unlimited saved bookmark study decks
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
    </SafeAreaView>
  );
}

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
    maxWidth: 160,
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
  bookmarkButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  // Modal Styles
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
  modalTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalActionButton: {
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
