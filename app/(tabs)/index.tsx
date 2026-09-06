import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useNavigation, useScrollToTop } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { TopicSearchResult } from '../../constants/SpecialtyData';
import { dbService } from '../../services/dbService';
import { SurgicalOrbitSection } from '../../components/SurgicalOrbitSection';
import { ExpandedSurgicalOrbitSection } from '../../components/ExpandedSurgicalOrbitSection';
import { ExpandedMedicalOrbitSection } from '../../components/ExpandedMedicalOrbitSection';
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
} from '../../components/OrbitPrimitives';

// Category routes mapping
const categoryRoutes: Record<string, string> = {
  'Cardiology': '/specialty/heart',
  'GIT': '/specialty/git',
  'Infectious Disease': '/specialty/fever',
  'Neurology': '/specialty/neuro',
  'Dermatology': '/specialty/skin',
  'OB/GYN': '/specialty/gynacology',
  'Pulmonology': '/specialty/lungs',
  'Nephrology': '/specialty/nephrology',
};

// Types
type RecentInquiry = {
  id: string;
  topic: string;
  category: string;
  timestamp: string;
};

type SpecialtyCategory = OrbitSpecialtyNode;

type SearchState = {
  query: string;
  results: TopicSearchResult[];
  loading: boolean;
  searched: boolean;
};

type HomeDomainTab = 'medicine' | 'surgery';

const EMPTY_SEARCH: SearchState = { query: '', results: [], loading: false, searched: false };

// Group search results by specialty, then by category
type CategoryGroup = { categoryId: string; title: string; topics: TopicSearchResult[] };
type SpecialtyGroup = {
  specialtyId: string;
  name: string;
  scientificName: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  categories: CategoryGroup[];
  topicCount: number;
};

// Header Component
const Header = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View className="flex-row items-center justify-between px-6 pt-2 pb-1">
      <View>
        <View className="flex-row items-center gap-1.5 mb-0.5">
          <Ionicons name="medical" size={14} color={Colors.lime} />
          <Text className="text-[12.5px] text-lime font-sans-bold">{getGreeting()}</Text>
        </View>
        <Text className="text-[22px] font-sans-bold leading-tight text-white">Dr. Mahmoud</Text>
      </View>

      {/* Profile Avatar / Quick Access with Depth */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/profile')}
        className="w-10 h-10 rounded-full bg-[#0a0a0a] border border-white/10 items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.35,
          shadowRadius: 6,
          elevation: 4,
        }}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons name="person" size={17} color={Colors.lavender} />
      </TouchableOpacity>
    </View>
  );
};

// Search Bar Component
const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  loading,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) => {
  return (
    <View className="px-6 pt-1 pb-0">
      <View
        className="flex-row items-center h-14 bg-[#080808] rounded-2xl px-4 border border-white/10"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.45,
          shadowRadius: 14,
          elevation: 8,
        }}
      >
        <Ionicons name="search" size={20} color={Colors.lime} style={{ marginRight: 12 }} />
        <TextInput
          className="flex-1 text-white text-[15px] font-sans"
          placeholder="Search clinical conditions, workups..."
          placeholderTextColor={Colors.graySubtle}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 ? (
          loading ? (
            <ActivityIndicator size="small" color={Colors.lime} style={{ marginRight: 4 }} />
          ) : (
            <TouchableOpacity
              onPress={() => onChangeText('')}
              className="w-9 h-9 items-center justify-center -mr-1"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="close-circle" size={18} color={Colors.grayMuted} />
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            onPress={onSubmit}
            className="w-10 h-10 items-center justify-center rounded-xl bg-lime/20 border border-lime/40 -mr-1"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="arrow-forward" size={18} color={Colors.lime} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Primary Medical Orbit Navigation Component (Wheel 1 in Medicine tab)
const OrbitNavigation = () => {
  const categories: SpecialtyCategory[] = [
    { id: '1', name: 'Cardiology', icon: 'heart', color: Colors.specialty.cardiology },
    { id: '2', name: 'GIT', icon: 'restaurant', color: Colors.specialty.git },
    { id: '3', name: 'Infectious Disease', icon: 'thermometer', color: Colors.specialty.infectious },
    { id: '4', name: 'Neurology', icon: 'pulse', color: Colors.specialty.neurology },
    { id: '5', name: 'Dermatology', icon: 'body', color: Colors.specialty.dermatology },
    { id: '6', name: 'OB/GYN', icon: 'woman', color: Colors.specialty.obgyn },
    { id: '7', name: 'Pulmonology', icon: 'fitness', color: Colors.specialty.pulmonology },
    { id: '8', name: 'Nephrology', icon: 'water', color: Colors.specialty.more },
  ];

  const handleCategoryPress = (catName: string) => {
    const route = categoryRoutes[catName];
    if (route) {
      router.push(route as any);
    }
  };

  const handleCenterHubPress = () => {
    router.push('/(tabs)/ChatTab');
  };

  return (
    <View className="px-6 pb-8" style={{ paddingTop: 14 }}>
      {/* Header text above the first wheel in Medicine Tab */}
      <OrbitSectionLabel
        variant="medical"
        badgeLabel="MEDICAL"
        badgeSubtitle="Clinical specialties"
        title="Medical Specialties"
        description="Tap any specialty to explore categorized evidence guidelines, acute protocols & diagnostics"
      />

      <View
        className="mx-auto mb-10 relative"
        style={{ width: ORBIT_SIZE, height: ORBIT_SIZE, marginTop: BUTTON_SIZE / 2 }}
      >
        {/* Medical continuous smooth orbit rings */}
        <OrbitRings variant="medical" size={ORBIT_SIZE} />

        {/* Center hub — Primary focal point in Luminous Frosted Aqua/Lime */}
        <OrbitCenterHub
          title="Ask Medical AI"
          icon="medical"
          variant="medical"
          size={CENTER_SIZE}
          isPrimaryHub
          onPress={handleCenterHubPress}
        />

        {categories.map((category, index) => {
          const pos = ORBIT_NODE_POSITIONS[index];
          if (!pos) return null;
          return (
            <OrbitNode
              key={category.id}
              specialty={category}
              size={BUTTON_SIZE}
              top={pos.top}
              left={pos.left}
              variant="medical"
              onPress={() => handleCategoryPress(category.name)}
            />
          );
        })}
      </View>
    </View>
  );
};

// Build grouped structure: specialty -> category -> topics
function groupResults(results: TopicSearchResult[]): SpecialtyGroup[] {
  const specMap = new Map<string, SpecialtyGroup>();

  for (const r of results) {
    let spec = specMap.get(r.specialtyId);
    if (!spec) {
      spec = {
        specialtyId: r.specialtyId,
        name: r.specialtyName,
        scientificName: r.specialtyScientificName,
        color: r.specialtyColor,
        icon: r.specialtyIcon,
        categories: [],
        topicCount: 0,
      };
      specMap.set(r.specialtyId, spec);
    }

    let cat = spec.categories.find((c) => c.categoryId === r.categoryId);
    if (!cat) {
      cat = { categoryId: r.categoryId, title: r.categoryTitle, topics: [] };
      spec.categories.push(cat);
    }
    cat.topics.push(r);
    spec.topicCount += 1;
  }

  return Array.from(specMap.values());
}

// A single search result row
const ResultRow = ({ item, onOpen }: { item: TopicSearchResult; onOpen: (r: TopicSearchResult) => void }) => {
  return (
    <TouchableOpacity
      onPress={() => onOpen(item)}
      className="flex-row items-center gap-3.5 p-3.5 rounded-2xl bg-teal-medium border border-white/10 active:opacity-75"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center border flex-shrink-0"
        style={{
          backgroundColor: `${item.specialtyColor}20`,
          borderColor: `${item.specialtyColor}40`,
          shadowColor: item.specialtyColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons name={item.specialtyIcon} size={18} color={item.specialtyColor} />
      </View>
      <View className="flex-1 min-w-0" style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
        <View className="flex-row items-center gap-1.5 mb-0.5 min-w-0" style={{ minWidth: 0 }}>
          {item.type ? (
            <View
              className="px-1.5 py-0.5 rounded border flex-shrink-0"
              style={{ backgroundColor: `${item.specialtyColor}20`, borderColor: `${item.specialtyColor}40` }}
            >
              <Text className="text-[9px] font-sans-bold uppercase" style={{ color: item.specialtyColor, includeFontPadding: false }}>
                {item.type}
              </Text>
            </View>
          ) : null}
          {item.categoryTitle ? (
            <Text
              className="text-gray-400 text-[10px] font-sans-medium flex-1"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ flexShrink: 1, includeFontPadding: false }}
            >
              {item.categoryTitle}
            </Text>
          ) : null}
        </View>
        <Text
          className="text-[15px] font-sans-semibold text-white leading-tight"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ includeFontPadding: false }}
        >
          {item.title}
        </Text>
        <Text
          className="text-[12px] font-sans text-gray-muted mt-0.5"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ includeFontPadding: false }}
        >
          {item.subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={item.specialtyColor} style={{ flexShrink: 0 }} />
    </TouchableOpacity>
  );
};

// Search Results Component — grouped by specialty, then category
const SearchResults = ({
  results,
  loading,
  query,
  onOpen,
  onAskAi,
}: {
  results: TopicSearchResult[];
  loading: boolean;
  query: string;
  onOpen: (r: TopicSearchResult) => void;
  onAskAi: () => void;
}) => {
  const groups = useMemo(() => groupResults(results), [results]);

  if (loading) {
    return (
      <View className="px-6 py-10 items-center">
        <ActivityIndicator size="small" color={Colors.accent} />
        <Text className="text-gray-muted text-[13px] font-sans-medium mt-3">
          Searching clinical database...
        </Text>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View className="px-6 py-6">
        <Text className="text-[17px] font-sans-bold text-white mb-3">
          No matching topic found for &ldquo;{query}&rdquo;
        </Text>
        <View
          className="p-6 rounded-3xl bg-teal-medium border border-white/10 items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View
            className="w-14 h-14 rounded-2xl bg-deep-teal border border-turquoise/30 items-center justify-center mb-3"
            style={{
              shadowColor: Colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="sparkles" size={26} color={Colors.accent} />
          </View>
          <Text className="text-white font-sans-bold text-[17px] text-center">
            Consult Medical Arena AI
          </Text>
          <Text className="text-gray-muted text-[13px] font-sans text-center mt-1.5 mb-5 leading-5 max-w-[280px]">
            No curated offline topic matched your query. Get instant evidence-based guidance directly from the AI Clinical Advisor.
          </Text>
          <TouchableOpacity
            onPress={onAskAi}
            className="px-6 py-3 rounded-full flex-row items-center gap-2 bg-turquoise active:opacity-90"
            style={{
              shadowColor: Colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Ionicons name="chatbubbles" size={17} color={Colors.ink} />
            <Text className="text-ink font-sans-bold text-[14px]">Consult AI Advisor</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="px-6 pb-6 mt-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-muted text-[12px] font-sans-bold uppercase tracking-wider">
          Search Results
        </Text>
        <Text className="text-gray-muted text-[12px] font-sans-medium">
          {results.length} {results.length === 1 ? 'topic' : 'topics'} • {groups.length} {groups.length === 1 ? 'specialty' : 'specialties'}
        </Text>
      </View>

      <View className="h-px bg-white/10 mb-4" />

      {groups.map((spec) => (
        <View key={spec.specialtyId} className="mb-5">
          {/* Specialty header */}
          <View className="flex-row items-center gap-2 mb-3">
            <View
              className="w-7 h-7 rounded-full items-center justify-center border flex-shrink-0"
              style={{ backgroundColor: `${spec.color}20`, borderColor: `${spec.color}40` }}
            >
              <Ionicons name={spec.icon} size={14} color={spec.color} />
            </View>
            <View className="flex-1 min-w-0" style={{ minWidth: 0, flexShrink: 1 }}>
              <Text className="text-white text-[15px] font-sans-bold leading-tight" numberOfLines={1} ellipsizeMode="tail" style={{ includeFontPadding: false }}>
                {spec.scientificName}
              </Text>
              <Text className="text-gray-muted text-[11px]" numberOfLines={1} style={{ includeFontPadding: false }}>
                {spec.topicCount} {spec.topicCount === 1 ? 'topic' : 'topics'}
              </Text>
            </View>
          </View>

          {/* Category sub-groups */}
          {spec.categories.map((cat) => (
            <View key={cat.categoryId || cat.title} className="mb-3">
              {cat.title ? (
                <View className="flex-row items-center gap-1.5 mb-2 ml-0.5 min-w-0">
                  <View className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: spec.color }} />
                  <Text
                    className="text-gray-muted text-[11px] font-sans-semibold uppercase tracking-wider flex-1"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ flexShrink: 1, includeFontPadding: false }}
                  >
                    {cat.title}
                  </Text>
                </View>
              ) : null}
              <View className="flex flex-col gap-2">
                {cat.topics.map((topic) => (
                  <ResultRow key={topic.id} item={topic} onOpen={onOpen} />
                ))}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default function Index() {
  const [search, setSearch] = useState<SearchState>(EMPTY_SEARCH);
  const [activeTab, setActiveTab] = useState<HomeDomainTab>('medicine');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const gridYRef = useRef<number>(850);
  const navigation = useNavigation();

  // Scroll to top when the active tab bar icon is pressed
  useScrollToTop(scrollViewRef);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
    return unsubscribe;
  }, [navigation]);

  const runSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearch(EMPTY_SEARCH);
      return;
    }
    const currentReqId = ++reqIdRef.current;
    setSearch((s) => ({ ...s, query, loading: true }));
    try {
      const results = await dbService.searchAllTopics(trimmed);
      // Only commit if this is still the latest request (avoid race conditions)
      if (currentReqId === reqIdRef.current) {
        setSearch({ query, results, loading: false, searched: true });
      }
    } catch {
      if (currentReqId === reqIdRef.current) {
        setSearch((s) => ({ ...s, loading: false, searched: true }));
      }
    }
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearch((s) => ({ ...s, query: text }));
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (!text.trim()) {
      setSearch(EMPTY_SEARCH);
      return;
    }
    // Debounce network/local search for typing responsiveness
    debounceRef.current = setTimeout(() => {
      runSearch(text);
    }, 280);
  }, [runSearch]);

  useEffect(() => {
    const currentReqId = reqIdRef.current;
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      reqIdRef.current = currentReqId + 1;
    };
  }, []);

  const handleOpenTopic = useCallback((r: TopicSearchResult) => {
    router.push(`/specialty/${r.specialtyId}/${r.id}` as any);
  }, []);

  const handleAskAi = useCallback(() => {
    router.push({
      pathname: '/(tabs)/ChatTab',
      params: { query: search.query },
    } as any);
  }, [search.query]);

  const handleSubmit = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch(search.query);
  }, [runSearch, search.query]);

  const handleTabSwitch = useCallback((newTab: HomeDomainTab) => {
    if (newTab === activeTab) return;
    Haptics.selectionAsync();
    setActiveTab(newTab);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [activeTab]);

  const isSearching = search.query.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Top Header & Search Bar firmly anchored above the scroll content */}
      <View style={{ backgroundColor: Colors.background, zIndex: 50, elevation: 10 }}>
        <Header />
        <SearchBar
          value={search.query}
          onChangeText={handleSearchChange}
          onSubmit={handleSubmit}
          loading={search.loading}
        />

        {/* Domain Switcher Tab Bar (Medicine / Surgery) */}
        {!isSearching && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'medicine' && [
                  styles.tabButtonActive,
                  {
                    backgroundColor: `${Colors.main}18`,
                    borderColor: `${Colors.main}45`,
                  },
                ],
              ]}
              onPress={() => handleTabSwitch('medicine')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="medical"
                size={14}
                color={activeTab === 'medicine' ? Colors.main : '#8e8e93'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'medicine' && { color: Colors.main, fontWeight: '700' },
                ]}
              >
                Medicine
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'surgery' && [
                  styles.tabButtonActive,
                  {
                    backgroundColor: 'rgba(109, 194, 189, 0.16)',
                    borderColor: 'rgba(109, 194, 189, 0.45)',
                  },
                ],
              ]}
              onPress={() => handleTabSwitch('surgery')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="cut"
                size={14}
                color={activeTab === 'surgery' ? '#4bc0b8' : '#8e8e93'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'surgery' && { color: '#4bc0b8', fontWeight: '700' },
                ]}
              >
                Surgery
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-40"
        keyboardShouldPersistTaps="handled"
      >
        {isSearching ? (
          <SearchResults
            results={search.results}
            loading={search.loading}
            query={search.query.trim()}
            onOpen={handleOpenTopic}
            onAskAi={handleAskAi}
          />
        ) : activeTab === 'medicine' ? (
          <>
            {/* First Wheel: Primary Medicine with Header Text */}
            <OrbitNavigation />

            {/* Second Wheel: Expanded Medicine with NO Header Text */}
            <ExpandedMedicalOrbitSection
              hideHeader
              onLayout={(e) => {
                gridYRef.current = e.nativeEvent.layout.y;
              }}
            />
          </>
        ) : (
          <>
            {/* First Wheel: Primary Surgery with Header Text */}
            <SurgicalOrbitSection />

            {/* Second Wheel: Expanded Surgery with NO Header Text */}
            <ExpandedSurgicalOrbitSection hideHeader />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: '#121719',
    padding: 3.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'PlexSans_600SemiBold',
    color: '#8e8e93',
  },
});
