import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dbService } from '../../../../services/dbService';
import {
  SpecialtyData,
  SpecialtyCategory,
  getSpecialtyKnowledge,
  getCategoryKnowledge,
} from '../../../../constants/SpecialtyData';
import { Colors } from '../../../../constants/Colors';

export default function CategoryPage() {
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();

  const specId = id || 'heart';
  const catId = categoryId || 'emergencies';

  const initialSpecialty = useMemo(() => {
    const cached = dbService.getCachedSpecialty(specId);
    return cached || getSpecialtyKnowledge(specId);
  }, [specId]);

  const initialCategory = useMemo(() => {
    return initialSpecialty?.categories?.find((c) => c.id === catId) || getCategoryKnowledge(specId, catId);
  }, [initialSpecialty, specId, catId]);

  const [specialty, setSpecialty] = useState<SpecialtyData>(initialSpecialty);
  const [category, setCategory] = useState<SpecialtyCategory | null>(initialCategory);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (forceRefresh = false) => {
    try {
      const remoteSpec = await dbService.getSpecialty(specId, forceRefresh);
      if (remoteSpec) {
        setSpecialty(remoteSpec);
        const catInSpec = remoteSpec.categories?.find((c) => c.id === catId);
        if (catInSpec && catInSpec.topics && catInSpec.topics.length > 0) {
          setCategory(catInSpec);
          return;
        }
      }
      const remoteCat = await dbService.getCategory(specId, catId, forceRefresh);
      if (remoteCat) setCategory(remoteCat);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const cached = dbService.getCachedSpecialty(specId);
    setSpecialty(cached || getSpecialtyKnowledge(specId));
    setCategory(cached?.categories?.find((c) => c.id === catId) || getCategoryKnowledge(specId, catId));
    loadData(false);
  }, [specId, catId]);

  const onRefresh = () => {
    setIsRefreshing(true);
    dbService.invalidateCache(specId);
    loadData(true);
  };

  const topicsList = category?.topics || [];

  // Filter chips
  const filterChips = useMemo(() => {
    const types = new Set(topicsList.map((t) => t.type).filter(Boolean));
    return ['all', ...Array.from(types)];
  }, [topicsList]);

  // Filtered topics based on search text and chip
  const filteredTopics = useMemo(() => {
    return topicsList.filter((t) => {
      const matchesSearch =
        !searchText.trim() ||
        t.title.toLowerCase().includes(searchText.toLowerCase()) ||
        t.subtitle.toLowerCase().includes(searchText.toLowerCase());

      const matchesChip = selectedFilter === 'all' || t.type === selectedFilter;

      return matchesSearch && matchesChip;
    });
  }, [topicsList, searchText, selectedFilter]);

  const handleTopicPress = (topicId: string) => {
    if (specialty) {
      router.push(`/specialty/${specialty.id}/${topicId}` as any);
    }
  };

  const handleAskAI = () => {
    if (specialty && category) {
      router.push({
        pathname: `/specialty/${specialty.id}/general` as any,
        params: { categoryContext: category.id, query: searchText }
      });
    }
  };

  const handleSynthesizeOnDemand = async () => {
    if (!searchText.trim() || !specialty || !category) return;
    setIsSynthesizing(true);
    try {
      const compiled = await dbService.synthesizeTopicFromReference(
        specialty.id,
        category.id,
        searchText.trim()
      );
      if (compiled && compiled.id) {
        setCategory((prev) => prev ? {
          ...prev,
          topics: [compiled, ...(prev.topics || [])]
        } : prev);
        router.push(`/specialty/${specialty.id}/${compiled.id}` as any);
      } else {
        Alert.alert(
          'Reference Synthesis',
          `Could not compile a verified guide for "${searchText}". Consulting specialty AI assistant instead.`,
          [{ text: 'OK', onPress: handleAskAI }]
        );
      }
    } catch {
      handleAskAI();
    } finally {
      setIsSynthesizing(false);
    }
  };

  const displayCategory = category || initialCategory;
  if (!displayCategory) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={Colors.main} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-white/5 bg-background z-20">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 active:opacity-60">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1 ml-2 min-w-0">
          <Text className="text-white text-lg font-sans-bold" numberOfLines={1} ellipsizeMode="tail" style={{ includeFontPadding: false }}>{displayCategory.title}</Text>
          <Text className="text-xs font-sans-semibold uppercase tracking-wider" numberOfLines={1} style={{ color: specialty.color, includeFontPadding: false }}>
            {specialty.scientificName} • {topicsList.length} Verified Protocols
          </Text>
        </View>
        <View 
          className="w-9 h-9 rounded-full items-center justify-center border border-white/10 flex-shrink-0"
          style={{ backgroundColor: `${specialty.color}20` }}
        >
          <Ionicons name={displayCategory.icon} size={18} color={specialty.color} />
        </View>
      </View>

      {/* Live Search Bar */}
      <View className="px-5 pt-3 pb-2 bg-background">
        <View className="bg-[#121719] rounded-2xl flex-row items-center px-4 py-2.5 border border-white/10">
          <Ionicons name="search" size={18} color={specialty.color} />
          <TextInput
            className="flex-1 text-white ml-2.5 font-sans-medium text-sm"
            placeholder={`Filter ${displayCategory.title.toLowerCase()} topics...`}
            placeholderTextColor={Colors.grayMuted}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} className="p-1">
              <Ionicons name="close-circle" size={16} color={Colors.grayMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        {filterChips.length > 2 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2.5 py-1" contentContainerStyle={{ gap: 6 }}>
            {filterChips.map((chip) => {
              const isSelected = selectedFilter === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  onPress={() => setSelectedFilter(chip)}
                  className="px-3 py-1 rounded-full border flex-shrink-0"
                  style={{
                    backgroundColor: isSelected ? `${specialty.color}25` : '#121719',
                    borderColor: isSelected ? specialty.color : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text
                    className="text-[11px] font-sans-bold capitalize"
                    style={{ color: isSelected ? specialty.color : '#9e9e9e', includeFontPadding: false }}
                  >
                    {chip === 'all' ? 'All Types' : chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
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
        <View className="px-5 py-4 pb-28">
          <Text className="text-gray-400 text-xs mb-4 leading-4 px-1">
            {displayCategory.description}
          </Text>

          {filteredTopics.length === 0 ? (
            <View className="items-center justify-center py-10 px-4 bg-[#121719] rounded-3xl border border-white/5 mt-2">
               <Ionicons name="document-text-outline" size={44} color={specialty.color} />
               <Text className="text-white font-sans-bold text-base mt-3 text-center">
                 {searchText.trim() ? `No topic matching "${searchText}"` : 'No curated topics in this filter'}
               </Text>
               <Text className="text-gray-400 text-xs text-center mt-1 mb-5 leading-4 max-w-xs">
                 {searchText.trim() 
                   ? 'Synthesize a peer-reviewed clinical guide from verified medical textbooks and guidelines on-demand.'
                   : 'Consult the specialist AI assistant for reference-grounded guidance.'}
               </Text>

               {searchText.trim().length > 0 ? (
                 <TouchableOpacity
                   onPress={handleSynthesizeOnDemand}
                   disabled={isSynthesizing}
                   activeOpacity={0.85}
                   style={[styles.primaryActionBtn, { backgroundColor: specialty.color }]}
                 >
                   {isSynthesizing ? (
                     <ActivityIndicator size="small" color={Colors.ink} />
                   ) : (
                     <Ionicons name="sparkles" size={16} color={Colors.ink} />
                   )}
                   <Text style={styles.primaryActionBtnText}>
                     {isSynthesizing ? 'Compiling from References...' : `Synthesize Guide for "${searchText}"`}
                   </Text>
                 </TouchableOpacity>
               ) : (
                 <TouchableOpacity
                   onPress={handleAskAI}
                   activeOpacity={0.85}
                   style={[styles.primaryActionBtn, { backgroundColor: specialty.color }]}
                 >
                   <Ionicons name="chatbubbles" size={16} color={Colors.ink} />
                   <Text style={styles.primaryActionBtnText}>Ask Category Specialist AI</Text>
                 </TouchableOpacity>
               )}
            </View>
          ) : (
            <View className="flex flex-col gap-3">
              {filteredTopics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  onPress={() => handleTopicPress(topic.id)}
                  activeOpacity={0.8}
                  style={[styles.topicCardTouchable, { borderColor: `${specialty.color}40` }]}
                >
                  <LinearGradient
                    colors={[`${specialty.color}22`, `${specialty.color}08`, '#0d1316']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.topicCardGradient}
                  >
                    <View className="flex-1 mr-3 min-w-0" style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                      <View 
                        style={[
                          styles.topicTypeBadge,
                          {
                            backgroundColor: `${specialty.color}20`,
                            borderColor: `${specialty.color}45`,
                          }
                        ]}
                      >
                        <Text 
                          style={[styles.topicTypeText, { color: specialty.color }]}
                          numberOfLines={1}
                        >
                          {topic.type}
                        </Text>
                      </View>
                      <Text style={styles.topicTitle} numberOfLines={1} ellipsizeMode="tail">{topic.title}</Text>
                      <Text style={styles.topicSubtitle} numberOfLines={2} ellipsizeMode="tail">{topic.subtitle}</Text>
                    </View>
                    <View 
                      style={[
                        styles.topicArrowBadge,
                        {
                          backgroundColor: `${specialty.color}18`,
                          borderColor: `${specialty.color}40`,
                        }
                      ]}
                    >
                      <Ionicons name="chevron-forward" size={16} color={specialty.color} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Ask AI Button */}
      <View style={styles.floatingContainer} pointerEvents="box-none">
        <TouchableOpacity 
          onPress={handleAskAI}
          activeOpacity={0.85}
          style={styles.floatingTouchable}
        >
          <LinearGradient
            colors={[`${specialty.color}`, `${specialty.color}e6`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.floatingGradient}
          >
            <View style={styles.floatingIconBadge}>
              <Ionicons name="chatbubbles" size={16} color={Colors.ink} />
            </View>
            <Text style={styles.floatingText} numberOfLines={1}>
              Ask AI about {displayCategory.title}
            </Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.ink} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  primaryActionBtnText: {
    color: '#010101',
    fontFamily: 'PlexSans_700Bold',
    fontSize: 12.5,
    fontWeight: '700',
  },
  topicCardTouchable: {
    borderRadius: 18,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  topicCardGradient: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  topicTypeText: {
    fontSize: 9.5,
    fontFamily: 'PlexSans_700Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  topicTitle: {
    color: '#ffffff',
    fontFamily: 'PlexSans_700Bold',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
    includeFontPadding: false,
  },
  topicSubtitle: {
    color: '#cbd5e1',
    fontFamily: 'PlexSans_400Regular',
    fontSize: 11.5,
    lineHeight: 16,
    includeFontPadding: false,
  },
  topicArrowBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  floatingTouchable: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  floatingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
  floatingIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingText: {
    color: '#010101',
    fontFamily: 'PlexSans_700Bold',
    fontSize: 13.5,
    fontWeight: '700',
    includeFontPadding: false,
  },
});
