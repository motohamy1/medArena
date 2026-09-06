import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dbService } from '../../../services/dbService';
import { SpecialtyData, SPECIALTY_KNOWLEDGE, getSpecialtyKnowledge } from '../../../constants/SpecialtyData';
import { Colors } from '../../../constants/Colors';

// Category theme config matching the 4-color base palette (#a9e4e8, #4bc0b8, #cbc8f5, #f9bac9)
const getCategoryTheme = (categoryId: string, index: number) => {
  switch (categoryId) {
    case 'emergencies':
      return {
        color: '#f9bac9', // Pastel Pink / Rose
        gradient: ['#3e1628', '#240d18', '#14070e'] as const,
        border: 'rgba(249, 186, 201, 0.45)',
        iconBg: 'rgba(249, 186, 201, 0.22)',
        iconBorder: 'rgba(249, 186, 201, 0.55)',
        shadow: '#f9bac9',
        tag: 'EMERGENCY',
      };
    case 'clinical_topics':
      return {
        color: '#a9e4e8', // Luminous Mint
        gradient: ['#143836', '#0d2524', '#061716'] as const,
        border: 'rgba(169, 228, 232, 0.45)',
        iconBg: 'rgba(169, 228, 232, 0.22)',
        iconBorder: 'rgba(169, 228, 232, 0.55)',
        shadow: '#a9e4e8',
        tag: 'GUIDELINES',
      };
    case 'tools':
      return {
        color: '#4bc0b8', // Medical Jewel Teal
        gradient: ['#123635', '#0b2423', '#051615'] as const,
        border: 'rgba(109, 194, 189, 0.45)',
        iconBg: 'rgba(109, 194, 189, 0.22)',
        iconBorder: 'rgba(109, 194, 189, 0.55)',
        shadow: '#4bc0b8',
        tag: 'DIAGNOSTICS',
      };
    case 'research':
      return {
        color: '#cbc8f5', // Soft Lavender / Periwinkle
        gradient: ['#292048', '#1a1432', '#0e0b1c'] as const,
        border: 'rgba(203, 200, 245, 0.45)',
        iconBg: 'rgba(203, 200, 245, 0.22)',
        iconBorder: 'rgba(203, 200, 245, 0.55)',
        shadow: '#cbc8f5',
        tag: 'EVIDENCE',
      };
    default: {
      const palette = [
        {
          color: '#a9e4e8',
          gradient: ['#143836', '#0d2524', '#061716'] as const,
          border: 'rgba(169, 228, 232, 0.45)',
          iconBg: 'rgba(169, 228, 232, 0.22)',
          iconBorder: 'rgba(169, 228, 232, 0.55)',
          shadow: '#a9e4e8',
          tag: 'SECTION',
        },
        {
          color: '#4bc0b8',
          gradient: ['#123635', '#0b2423', '#051615'] as const,
          border: 'rgba(109, 194, 189, 0.45)',
          iconBg: 'rgba(109, 194, 189, 0.22)',
          iconBorder: 'rgba(109, 194, 189, 0.55)',
          shadow: '#4bc0b8',
          tag: 'SECTION',
        },
        {
          color: '#cbc8f5',
          gradient: ['#292048', '#1a1432', '#0e0b1c'] as const,
          border: 'rgba(203, 200, 245, 0.45)',
          iconBg: 'rgba(203, 200, 245, 0.22)',
          iconBorder: 'rgba(203, 200, 245, 0.55)',
          shadow: '#cbc8f5',
          tag: 'SECTION',
        },
        {
          color: '#f9bac9',
          gradient: ['#3e1628', '#240d18', '#14070e'] as const,
          border: 'rgba(249, 186, 201, 0.45)',
          iconBg: 'rgba(249, 186, 201, 0.22)',
          iconBorder: 'rgba(249, 186, 201, 0.55)',
          shadow: '#f9bac9',
          tag: 'SECTION',
        },
      ];
      return palette[index % palette.length];
    }
  }
};

export default function SpecialtyDashboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const specId = id || 'heart';
  const [searchText, setSearchText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  
  // Instant cached/synchronous initialization prevents any stuck/empty states
  const initialData = useMemo(() => {
    const cached = dbService.getCachedSpecialty(specId);
    return cached || getSpecialtyKnowledge(specId);
  }, [specId]);

  const [specialty, setSpecialty] = useState<SpecialtyData>(initialData);

  const loadData = async (forceRefresh = false) => {
    setIsLoadingRemote(true);
    try {
      const remote = await dbService.getSpecialty(specId, forceRefresh);
      if (remote) {
        setSpecialty(remote);
      }
    } finally {
      setIsLoadingRemote(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const cached = dbService.getCachedSpecialty(specId);
    setSpecialty(cached || getSpecialtyKnowledge(specId));
    loadData(false);
  }, [specId]);

  const onRefresh = () => {
    setIsRefreshing(true);
    dbService.invalidateCache(specId);
    loadData(true);
  };

  // All topics flattened for instant search
  const allTopics = useMemo(() => {
    if (!specialty || !specialty.categories) return [];
    return specialty.categories.flatMap((c) => 
      (c.topics || []).map((t) => ({ ...t, categoryTitle: c.title, categoryId: c.id }))
    );
  }, [specialty]);

  // Filtered topics based on search text
  const filteredTopics = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    if (!q) return [];
    return allTopics.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.subtitle.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.categoryTitle.toLowerCase().includes(q)
    );
  }, [searchText, allTopics]);

  const handleSearchSubmit = () => {
    if (searchText.trim() && specialty) {
      if (filteredTopics.length > 0) {
        // Navigate to the first matching topic if exact or close
        router.push(`/specialty/${specialty.id}/${filteredTopics[0].id}` as any);
      } else {
        router.push({
          pathname: `/specialty/${specialty.id}/general` as any,
          params: { query: searchText }
        });
      }
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    if (specialty) {
      router.push({
        pathname: `/specialty/${specialty.id}/category/${categoryId}` as any,
      });
    }
  };

  const handleTopicPress = (topicId: string) => {
    if (specialty) {
      router.push(`/specialty/${specialty.id}/${topicId}` as any);
    }
  };

  const localSpec = SPECIALTY_KNOWLEDGE[specialty.id] || specialty;
  const illustration = localSpec ? localSpec.illustration : null;
  const totalTopicsCount = allTopics.length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-white/5 bg-background z-20">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 active:opacity-60">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1 ml-3 min-w-0">
          <Text className="text-white text-xl font-sans-bold" numberOfLines={1} ellipsizeMode="tail" style={{ includeFontPadding: false }}>{specialty.scientificName}</Text>
          <Text className="text-main text-xs font-sans-semibold uppercase tracking-wider" numberOfLines={1} style={{ includeFontPadding: false }}>
            {specialty.name} Reference Hub
          </Text>
        </View>
        <View 
          className="w-10 h-10 rounded-full items-center justify-center border border-white/10 flex-shrink-0"
          style={{ backgroundColor: `${specialty.color}20` }}
        >
          <Ionicons name={specialty.icon} size={20} color={specialty.color} />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={specialty.color}
            colors={[specialty.color]}
          />
        }
      >
        {/* Dynamic Hero */}
        <View className="w-full h-52 relative bg-teal-dark">
          {illustration && (
            <Image 
              source={illustration} 
              className="w-full h-full opacity-80" 
              resizeMode="cover" 
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(1,1,1,0.5)', Colors.background]}
            style={StyleSheet.absoluteFill}
          />
          
          <View className="absolute bottom-4 left-6 right-6">
             <View className="flex-row items-center gap-2 mb-1">
               <View className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/15 flex-row items-center gap-1.5">
                 {isLoadingRemote && (
                   <ActivityIndicator size={10} color={specialty.color} />
                 )}
                 <Text className="text-[10px] text-main font-sans-bold uppercase">
                   {totalTopicsCount} Reference Protocols
                 </Text>
               </View>
             </View>
             <Text className="text-white text-2xl font-black">{specialty.scientificName} Center</Text>
             <Text className="text-gray-300 text-xs leading-4 mt-0.5" numberOfLines={2}>{specialty.generalScope}</Text>
          </View>
        </View>

        {/* Live Search Bar */}
        <View className="bg-[#121719] rounded-2xl flex-row items-center px-4 py-3 border border-white/10 mx-5 mt-4">
            <Ionicons name="search" size={20} color={specialty.color} />
            <TextInput
              className="flex-1 text-white ml-3 font-sans-medium text-sm"
              placeholder={`Search ${specialty.name} conditions, dosing, guidelines...`}
              placeholderTextColor={Colors.grayMuted}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} className="p-1 mr-1">
                <Ionicons name="close-circle" size={18} color={Colors.grayMuted} />
              </TouchableOpacity>
            )}
        </View>

        {/* Live Search Results View */}
        {searchText.trim().length > 0 ? (
          <View className="px-5 mt-4 pb-12">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-400 text-xs font-sans-bold uppercase tracking-wider">
                Search Results ({filteredTopics.length})
              </Text>
            </View>

            {filteredTopics.length > 0 ? (
              <View className="flex flex-col gap-2.5">
                {filteredTopics.map((topic, idx) => {
                  const theme = getCategoryTheme(topic.categoryId, idx);
                  return (
                    <TouchableOpacity
                      key={topic.id}
                      onPress={() => handleTopicPress(topic.id)}
                      activeOpacity={0.8}
                      className="rounded-2xl overflow-hidden border"
                      style={{ borderColor: theme.border }}
                    >
                      <LinearGradient
                        colors={theme.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-3.5 flex-row items-center justify-between"
                      >
                        <View className="flex-1 mr-2 min-w-0" style={{ minWidth: 0, flexShrink: 1 }}>
                          <View className="flex-row items-center gap-2 mb-1 min-w-0">
                            <View 
                              className="px-2 py-0.5 rounded border flex-shrink-0"
                              style={{ backgroundColor: `${theme.color}20`, borderColor: `${theme.color}45` }}
                            >
                              <Text className="text-[9px] font-sans-bold uppercase" style={{ color: theme.color, includeFontPadding: false }}>
                                {topic.type}
                              </Text>
                            </View>
                            <Text className="text-gray-400 text-[10px] flex-1" numberOfLines={1} ellipsizeMode="tail" style={{ flexShrink: 1, includeFontPadding: false }}>
                              {topic.categoryTitle}
                            </Text>
                          </View>
                          <Text className="text-white font-sans-bold text-sm mb-0.5" numberOfLines={1} ellipsizeMode="tail" style={{ includeFontPadding: false }}>
                            {topic.title}
                          </Text>
                          <Text className="text-gray-300 text-xs" numberOfLines={1} ellipsizeMode="tail" style={{ includeFontPadding: false }}>
                            {topic.subtitle}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={theme.color} style={{ flexShrink: 0 }} />
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View className="p-6 rounded-3xl bg-[#0d1214] border border-white/10 items-center">
                <Ionicons name="search" size={36} color={Colors.grayMuted} />
                <Text className="text-white font-sans-bold text-base mt-2 text-center">
                  No direct topic found for "{searchText}"
                </Text>
                <Text className="text-gray-400 text-xs text-center mt-1 mb-4 leading-4">
                  Synthesize a verified protocol from medical references or consult the specialty AI.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: `/specialty/${specialty.id}/general` as any,
                    params: { query: searchText }
                  })}
                  activeOpacity={0.8}
                  className="px-5 py-2.5 rounded-full flex-row items-center gap-2"
                  style={{ backgroundColor: specialty.color }}
                >
                  <Ionicons name="sparkles" size={16} color={Colors.ink} />
                  <Text className="text-ink font-sans-bold text-xs">Consult Reference AI</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* Standard Categories Grid with Rich Gradient Cards */
          <View className="px-5 pb-12 mt-5">
            <View className="flex-row items-center justify-between mb-3.5">
              <Text className="text-gray-400 text-xs font-sans-bold uppercase tracking-wider">
                Specialized Categories
              </Text>
              <Text className="text-gray-500 text-xs font-sans-medium">
                {specialty.categories.length} sections
              </Text>
            </View>

            <View className="flex flex-row flex-wrap justify-between gap-y-3.5">
              {specialty.categories.map((category, index) => {
                const theme = getCategoryTheme(category.id, index);

                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleCategoryPress(category.id)}
                    activeOpacity={0.82}
                    style={styles.cardTouchable}
                  >
                    <LinearGradient
                      colors={theme.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.cardGradient, { borderColor: theme.border }]}
                    >
                      {/* Top Row: Icon Badge + Forward Arrow */}
                      <View style={styles.cardHeaderRow}>
                        <View 
                          style={[
                            styles.cardIconBox,
                            {
                              backgroundColor: theme.iconBg,
                              borderColor: theme.iconBorder,
                            }
                          ]}
                        >
                          <Ionicons name={category.icon} size={22} color={theme.color} />
                        </View>

                        <View 
                          style={[
                            styles.cardArrowBtn,
                            {
                              backgroundColor: theme.iconBg,
                              borderColor: theme.iconBorder,
                            }
                          ]}
                        >
                          <Ionicons name="arrow-forward" size={13} color={theme.color} />
                        </View>
                      </View>

                      {/* Middle Body: Title & Description */}
                      <View style={styles.cardBody}>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {category.title}
                        </Text>
                        <Text style={styles.cardDesc} numberOfLines={2}>
                          {category.description}
                        </Text>
                      </View>
                      
                      {/* Bottom Row: Topic Count Pill */}
                      <View style={styles.cardFooterRow}>
                        <View style={styles.cardCountPill}>
                          <View style={[styles.cardCountDot, { backgroundColor: theme.color }]} />
                          <Text style={[styles.cardCountText, { color: theme.color }]}>
                            {category.topics?.length || 0} topics
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Ask General AI Button with Gradient Accent */}
            <TouchableOpacity 
              onPress={() => router.push(`/specialty/${specialty.id}/general` as any)}
              activeOpacity={0.85}
              style={styles.aiButtonTouchable}
            >
              <LinearGradient
                colors={[`${specialty.color}`, `${specialty.color}e6`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiButtonGradient}
              >
                <View style={styles.aiButtonIconBadge}>
                  <Ionicons name="sparkles" size={15} color={Colors.ink} />
                </View>
                <Text style={styles.aiButtonText} numberOfLines={2}>
                  Consult {specialty.scientificName} Specialist AI
                </Text>
                <View style={styles.aiButtonArrowBadge}>
                  <Ionicons name="arrow-forward" size={15} color={Colors.ink} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardTouchable: {
    width: '48.5%',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  cardGradient: {
    padding: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 4,
  },
  cardTitle: {
    color: '#ffffff',
    fontFamily: 'PlexSans_700Bold',
    fontSize: 15.5,
    lineHeight: 20,
    marginBottom: 3,
    fontWeight: '700',
  },
  cardDesc: {
    color: '#d1d5db',
    fontFamily: 'PlexSans_400Regular',
    fontSize: 11.5,
    lineHeight: 16,
  },
  cardFooterRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardCountDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardCountText: {
    fontSize: 11,
    fontFamily: 'PlexMono_500Medium',
    fontWeight: '700',
  },
  aiButtonTouchable: {
    borderRadius: 20,
    marginTop: 20,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  aiButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  aiButtonIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  aiButtonText: {
    flex: 1,
    color: '#010101',
    fontFamily: 'PlexSans_700Bold',
    fontSize: 13.5,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
  aiButtonArrowBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
