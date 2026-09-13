import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import {
  SpecialtyData,
  SpecialtyCategory,
  TopicItem,
  TopicSearchResult,
  SPECIALTY_KNOWLEDGE,
  getSpecialtyKnowledge,
  getCategoryKnowledge,
  getTopicKnowledge,
  synthesizeFallbackTopic,
} from '../constants/SpecialtyData';
import { Colors } from '../constants/Colors';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.6:3001';

const ALL_SPECIALTY_IDS = Object.keys(SPECIALTY_KNOWLEDGE);

function buildLocalSearchIndex(): TopicSearchResult[] {
  const index: TopicSearchResult[] = [];
  for (const specId of ALL_SPECIALTY_IDS) {
    const spec = SPECIALTY_KNOWLEDGE[specId];
    if (!spec) continue;
    for (const cat of spec.categories || []) {
      for (const topic of cat.topics || []) {
        index.push({
          ...topic,
          specialtyId: spec.id,
          specialtyName: spec.name,
          specialtyScientificName: spec.scientificName,
          specialtyColor: spec.color,
          specialtyIcon: spec.icon,
          categoryId: cat.id,
          categoryTitle: cat.title,
        });
      }
    }
  }
  return index;
}

const LOCAL_SEARCH_INDEX = buildLocalSearchIndex();

function scoreResult(q: string, r: TopicSearchResult): number {
  const title = r.title.toLowerCase();
  const subtitle = r.subtitle.toLowerCase();
  const type = (r.type || '').toLowerCase();
  const cat = (r.categoryTitle || '').toLowerCase();
  const spec = (r.specialtyScientificName || '').toLowerCase();
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  if (subtitle.includes(q) || cat.includes(q) || type.includes(q) || spec.includes(q)) return 30;
  return 10;
}

// In-memory caching for instant fast loading
const specialtyMemoryCache = new Map<string, SpecialtyData>();
const categoryMemoryCache = new Map<string, SpecialtyCategory>();

export const dbService = {
  /**
   * Clears memory cache and disk cache for a specialty or all specialties
   */
  invalidateCache(specialtyId?: string) {
    if (specialtyId) {
      specialtyMemoryCache.delete(specialtyId);
      AsyncStorage.removeItem(`@med_arena_spec_${specialtyId}`).catch(() => {});
      for (const key of categoryMemoryCache.keys()) {
        if (key.startsWith(`${specialtyId}:`)) {
          categoryMemoryCache.delete(key);
        }
      }
    } else {
      specialtyMemoryCache.clear();
      categoryMemoryCache.clear();
    }
  },

  /**
   * Synchronously peek at memory cache if already loaded
   */
  getCachedSpecialty(specialtyId: string): SpecialtyData | null {
    return specialtyMemoryCache.get(specialtyId) || null;
  },

  async getSpecialty(specialtyId: string, forceRefresh = false): Promise<SpecialtyData> {
    if (!forceRefresh && specialtyMemoryCache.has(specialtyId)) {
      return specialtyMemoryCache.get(specialtyId)!;
    }

    // Check persistent AsyncStorage cache on cold start
    if (!forceRefresh) {
      try {
        const stored = await AsyncStorage.getItem(`@med_arena_spec_${specialtyId}`);
        if (stored) {
          const parsed = JSON.parse(stored) as SpecialtyData;
          if (parsed && parsed.categories && parsed.categories.length > 0) {
            // Re-attach illustration require reference
            const local = getSpecialtyKnowledge(specialtyId);
            parsed.illustration = local?.illustration || null;
            specialtyMemoryCache.set(specialtyId, parsed);
            parsed.categories.forEach((cat) => {
              categoryMemoryCache.set(`${specialtyId}:${cat.id}`, cat);
            });
            return parsed;
          }
        }
      } catch (e) {
        console.warn(`[dbService] AsyncStorage read failed for ${specialtyId}:`, e);
      }
    }

    const localSpec = getSpecialtyKnowledge(specialtyId);

    try {
      // 15-second timeout for mobile networks
      const remoteFetch = async (): Promise<SpecialtyData | null> => {
        const { data: specialty, error: specError } = await supabase
          .from('specialties')
          .select('*')
          .eq('id', specialtyId)
          .single();

        if (specError || !specialty) {
          console.warn(`[dbService] Specialty not found in DB for ${specialtyId}:`, specError?.message);
          return null;
        }

        // Fetch categories with lite topics (omit heavy clinical_content for 10x speed boost)
        const { data: categories, error: catError } = await supabase
          .from('categories')
          .select(`
            *,
            topics(id, title, subtitle, type, ai_scope_description)
          `)
          .eq('specialty_id', specialtyId);

        if (catError || !categories || categories.length === 0) {
          console.warn(`[dbService] Categories fetch failed for ${specialtyId}:`, catError?.message);
          return null;
        }

        // Map categories and merge remote + local topics
        const mappedCategories = categories.map((cat: any) => {
          const localCat = localSpec?.categories?.find((c) => c.id === cat.id);
          const remoteTopics: TopicItem[] = (cat.topics || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            subtitle: t.subtitle,
            type: t.type,
            aiScopeDescription: t.ai_scope_description,
          }));

          const topicMap = new Map<string, TopicItem>();
          // Add local curated topics first (which have local clinical content)
          localCat?.topics?.forEach((t) => topicMap.set(t.id, t));
          // Overwrite or add remote topics
          remoteTopics.forEach((t) => {
            const existing = topicMap.get(t.id);
            topicMap.set(t.id, {
              ...t,
              clinicalContent: existing?.clinicalContent,
            });
          });

          const mappedCat: SpecialtyCategory = {
            id: cat.id,
            title: cat.title || localCat?.title || '',
            description: cat.description || localCat?.description || '',
            icon: (cat.icon as any) || localCat?.icon || 'book',
            topics: Array.from(topicMap.values()),
          };

          categoryMemoryCache.set(`${specialtyId}:${cat.id}`, mappedCat);
          return mappedCat;
        });

        // Also ensure any categories in localSpec that aren't in Supabase are included
        if (localSpec?.categories) {
          for (const lCat of localSpec.categories) {
            if (!mappedCategories.some((mc: SpecialtyCategory) => mc.id === lCat.id)) {
              mappedCategories.push(lCat);
            }
          }
        }

        const result: SpecialtyData = {
          id: specialty.id,
          name: specialty.name || localSpec?.name || '',
          scientificName: specialty.scientific_name || localSpec?.scientificName || '',
          icon: (specialty.icon as any) || localSpec?.icon || 'medical',
          color: localSpec?.color || specialty.color || Colors.main,
          generalScope: specialty.general_scope || localSpec?.generalScope || '',
          illustration: localSpec?.illustration || null,
          categories: mappedCategories,
        };

        // Cache ONLY successful remote data
        specialtyMemoryCache.set(specialtyId, result);
        AsyncStorage.setItem(`@med_arena_spec_${specialtyId}`, JSON.stringify(result)).catch(() => {});
        return result;
      };

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 15000)
      );

      const resolved = await Promise.race([remoteFetch(), timeoutPromise]);
      if (resolved && resolved.categories && resolved.categories.length > 0) {
        return resolved;
      }

      // If remote timed out or failed, try disk cache before falling back to static constants
      try {
        const stored = await AsyncStorage.getItem(`@med_arena_spec_${specialtyId}`);
        if (stored) {
          const parsed = JSON.parse(stored) as SpecialtyData;
          if (parsed && parsed.categories && parsed.categories.length > 0) {
            const local = getSpecialtyKnowledge(specialtyId);
            parsed.illustration = local?.illustration || null;
            specialtyMemoryCache.set(specialtyId, parsed);
            return parsed;
          }
        }
      } catch {}

      // Return local fallback WITHOUT poisoning specialtyMemoryCache
      return localSpec;
    } catch (e) {
      console.warn(`[dbService] getSpecialty error for ${specialtyId}:`, e);
      return localSpec;
    }
  },

  async getCategory(specialtyId: string, categoryId: string, forceRefresh = false): Promise<SpecialtyCategory | null> {
    const cacheKey = `${specialtyId}:${categoryId}`;
    if (!forceRefresh && categoryMemoryCache.has(cacheKey)) {
      return categoryMemoryCache.get(cacheKey)!;
    }

    // Reuse parent specialty from memory cache if already available
    const cachedSpec = specialtyMemoryCache.get(specialtyId);
    if (cachedSpec) {
      const catInSpec = cachedSpec.categories?.find((c) => c.id === categoryId);
      if (catInSpec && catInSpec.topics && catInSpec.topics.length > 0) {
        categoryMemoryCache.set(cacheKey, catInSpec);
        return catInSpec;
      }
    }

    const localCat = getCategoryKnowledge(specialtyId, categoryId);

    try {
      const remoteFetch = async (): Promise<SpecialtyCategory | null> => {
        const { data: cat, error } = await supabase
          .from('categories')
          .select(`
            *,
            topics(id, title, subtitle, type, ai_scope_description)
          `)
          .eq('id', categoryId)
          .eq('specialty_id', specialtyId)
          .single();

        if (error || !cat) {
          return null;
        }

        const remoteTopics: TopicItem[] = (cat.topics || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          subtitle: t.subtitle,
          type: t.type,
          aiScopeDescription: t.ai_scope_description,
        }));

        const topicMap = new Map<string, TopicItem>();
        localCat?.topics?.forEach((t) => topicMap.set(t.id, t));
        remoteTopics.forEach((t) => {
          const existing = topicMap.get(t.id);
          topicMap.set(t.id, {
            ...t,
            clinicalContent: existing?.clinicalContent,
          });
        });

        const result: SpecialtyCategory = {
          id: cat.id,
          title: cat.title || localCat?.title || '',
          description: cat.description || localCat?.description || '',
          icon: (cat.icon as any) || localCat?.icon || 'book',
          topics: Array.from(topicMap.values()),
        };

        categoryMemoryCache.set(cacheKey, result);
        return result;
      };

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 15000)
      );

      const resolved = await Promise.race([remoteFetch(), timeoutPromise]);
      if (resolved) {
        return resolved;
      }
      return localCat;
    } catch (e) {
      console.warn(`[dbService] getCategory error for ${cacheKey}:`, e);
      return localCat;
    }
  },

  async getTopic(specialtyId: string, topicId: string): Promise<TopicItem> {
    const { topic: localTopic } = getTopicKnowledge(specialtyId, topicId);

    try {
      const remoteFetch = async (): Promise<TopicItem> => {
        const { data: topic, error } = await supabase
          .from('topics')
          .select('*')
          .eq('id', topicId)
          .eq('specialty_id', specialtyId)
          .single();

        if (error || !topic) {
          return localTopic;
        }

        return {
          id: topic.id,
          title: topic.title || localTopic?.title || '',
          subtitle: topic.subtitle || localTopic?.subtitle || '',
          type: topic.type || localTopic?.type || '',
          aiScopeDescription: topic.ai_scope_description || localTopic?.aiScopeDescription || '',
          clinicalContent: topic.clinical_content || localTopic?.clinicalContent || [],
        };
      };

      const timeoutPromise = new Promise<TopicItem>((resolve) =>
        setTimeout(() => resolve(localTopic), 10000)
      );

      return await Promise.race([remoteFetch(), timeoutPromise]);
    } catch {
      return localTopic;
    }
  },

  async searchSpecialtyTopics(specialtyId: string, queryText: string): Promise<TopicItem[]> {
    const q = queryText.toLowerCase().trim();
    if (!q) return [];

    const spec = specialtyMemoryCache.get(specialtyId) || getSpecialtyKnowledge(specialtyId);
    const localTopics = (spec?.categories || [])
      .flatMap((c) => c.topics)
      .filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.clinicalContent?.some((s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))
      );

    try {
      const res = await fetch(`${BACKEND_URL}/api/topics/search?specialtyId=${specialtyId}&q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const json = await res.json();
        const remoteTopics: TopicItem[] = (json.topics || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          subtitle: t.subtitle,
          type: t.type,
          aiScopeDescription: t.ai_scope_description,
          clinicalContent: t.clinical_content,
        }));

        const topicMap = new Map<string, TopicItem>();
        localTopics.forEach((t) => topicMap.set(t.id, t));
        remoteTopics.forEach((t) => topicMap.set(t.id, t));
        return Array.from(topicMap.values());
      }
    } catch {
      // Return local search results on network failure
    }

    return localTopics;
  },

  async searchAllTopics(queryText: string): Promise<TopicSearchResult[]> {
    const q = queryText.toLowerCase().trim();
    if (!q) return [];

    // Local instant search across the full SPECIALTY_KNOWLEDGE index
    const localResults = LOCAL_SEARCH_INDEX.map((r) => ({ r, score: scoreResult(q, r) }))
      .filter(({ r, score }) => score > 0 && (
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        (r.type || '').toLowerCase().includes(q) ||
        (r.categoryTitle || '').toLowerCase().includes(q) ||
        (r.specialtyScientificName || '').toLowerCase().includes(q) ||
        r.clinicalContent?.some((s) =>
          s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
        )
      ))
      .sort((a, b) => b.score - a.score)
      .map(({ r }) => r);

    try {
      const res = await fetch(`${BACKEND_URL}/api/topics/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const json = await res.json();
        const remoteTopics: any[] = json.topics || [];

        // Map remote rows to TopicSearchResult, resolving specialty/category context
        const remoteResults: TopicSearchResult[] = [];
        for (const t of remoteTopics) {
          const specId = t.specialty_id as string | undefined;
          const catId = t.category_id as string | undefined;
          const spec = specId ? (specialtyMemoryCache.get(specId) || getSpecialtyKnowledge(specId)) : undefined;
          const cat = spec?.categories?.find((c) => c.id === catId);

          // Skip remote rows that duplicate an existing local hit (same topic id)
          if (localResults.some((lr) => lr.id === t.id)) continue;

          remoteResults.push({
            id: t.id,
            title: t.title,
            subtitle: t.subtitle,
            type: t.type,
            aiScopeDescription: t.ai_scope_description,
            clinicalContent: t.clinical_content,
            specialtyId: specId || '',
            specialtyName: spec?.name || '',
            specialtyScientificName: spec?.scientificName || (specId || ''),
            specialtyColor: spec?.color || '#6ec2be',
            specialtyIcon: spec?.icon || ('medical' as any),
            categoryId: catId || '',
            categoryTitle: cat?.title || '',
          });
        }

        // Merge: local (already ranked) first, then remote additions
        return [...localResults, ...remoteResults].slice(0, 60);
      }
    } catch {
      // Return local search results on network failure
    }

    return localResults;
  },

  async synthesizeTopicFromReference(specialtyId: string, categoryId: string, query: string): Promise<TopicItem | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/topics/synthesize-from-reference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialtyId, categoryId, query }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.topic) {
          return {
            id: data.topic.id,
            title: data.topic.title,
            subtitle: data.topic.subtitle,
            type: data.topic.type,
            aiScopeDescription: data.topic.ai_scope_description,
            clinicalContent: data.topic.clinical_content,
          };
        }
      }
    } catch (err) {
      console.warn('[dbService] synthesizeTopicFromReference failed:', err);
    }
    
    // Fallback synthesis on client
    return synthesizeFallbackTopic(specialtyId, query.toLowerCase().replace(/\s+/g, '_'), query);
  },

  // In-memory cache for the full pearls pool
  _pearlsCache: null as import('../constants/DailyPearlsData').ClinicalPearl[] | null,

  async _loadAllPearls(): Promise<import('../constants/DailyPearlsData').ClinicalPearl[]> {
    if (this._pearlsCache && this._pearlsCache.length > 0) {
      return this._pearlsCache;
    }

    let loadedPearls: import('../constants/DailyPearlsData').ClinicalPearl[] = [];

    // 1. Fetch live pearls from Supabase
    try {
      const { data, error } = await supabase
        .from('clinical_pearls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        loadedPearls = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          specialtyId: item.specialty_id,
          specialtyName: item.specialty_name,
          specialtyColor: item.specialty_color,
          specialtyIcon: item.specialty_icon,
          badge: item.badge || item.key_numbers || '',
          rule: item.rule || item.takeaway || item.pearl || '',
          action: item.action || '',
          pitfall: item.pitfall || '',
          citation: item.citation,
        }));
        console.log(`[dbService] Loaded ${loadedPearls.length} dynamic pearls from Supabase ✓`);
        AsyncStorage.setItem('@med_arena_dynamic_pearls', JSON.stringify(loadedPearls)).catch(() => {});
      }
    } catch (e) {
      console.warn('[dbService] Supabase pearls fetch error:', e);
    }

    // 2. Fallback to local offline cache if Supabase unreachable
    if (loadedPearls.length === 0) {
      try {
        const stored = await AsyncStorage.getItem('@med_arena_dynamic_pearls');
        if (stored) {
          loadedPearls = JSON.parse(stored);
        }
      } catch {}
    }

    // 3. If still empty (first install / cold launch with empty DB), synthesize fresh via AI
    if (loadedPearls.length === 0) {
      console.log('[dbService] Empty pearls database; synthesizing first batch via AI...');
      const fresh = await this.generateFreshClinicalPearls(undefined, 5);
      if (fresh && fresh.length > 0) {
        this._pearlsCache = fresh;
        return fresh;
      }
    }

    // 4. Absolute offline safety net: if AI fails or is offline, load from local pearlMinerService
    if (loadedPearls.length === 0) {
      try {
        const { pearlMinerService } = await import('./pearlMinerService');
        loadedPearls = pearlMinerService.getAllMinedPearls();
      } catch (e) {
        console.warn('[dbService] pearlMinerService fallback failed:', e);
      }
    }

    this._pearlsCache = loadedPearls;
    return loadedPearls;
  },

  async getDynamicSpecialties(): Promise<{ id: string; label: string; icon: string; color: string }[]> {
    const pearls = await this._loadAllPearls();
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
  },

  /**
   * Generates and persists fresh clinical pearls via AI, syncing them to Supabase
   */
  async generateFreshClinicalPearls(
    specialtyId?: string,
    count: number = 3
  ): Promise<import('../constants/DailyPearlsData').ClinicalPearl[]> {
    try {
      const { generateDynamicPearls } = await import('./aiService');
      const fresh = await generateDynamicPearls(specialtyId, count);

      if (fresh && fresh.length > 0) {
        Promise.resolve(
          supabase
            .from('clinical_pearls')
            .upsert(
              fresh.map((p) => ({
                id: p.id,
                title: p.title,
                category: p.category,
                specialty_id: p.specialtyId,
                specialty_name: p.specialtyName,
                specialty_color: p.specialtyColor,
                specialty_icon: p.specialtyIcon,
                badge: p.badge,
                rule: p.rule,
                action: p.action,
                pitfall: p.pitfall,
                citation: p.citation,
                is_active: true,
              }))
            )
        )
          .then(({ error }: any) => {
            if (!error) {
              console.log(`[dbService] Persisted ${fresh.length} dynamic pearls to Supabase ✓`);
            }
          })
          .catch((err: any) => console.warn('[dbService] Supabase pearl upsert error:', err));

        // Prepend to in-memory cache
        if (this._pearlsCache) {
          const freshIds = new Set(fresh.map((f) => f.id));
          this._pearlsCache = [...fresh, ...this._pearlsCache.filter((c) => !freshIds.has(c.id))];
        }

        return fresh;
      }
    } catch (e) {
      console.warn('[dbService] generateFreshClinicalPearls failed:', e);
    }

    // Fallback to randomized pearls from knowledge miner
    const { pearlMinerService } = await import('./pearlMinerService');
    return pearlMinerService.getMinedPearls(specialtyId, count);
  },

  async getDailyClinicalPearls(
    offset: number = 0,
    count: number = 5,
    specialtyId?: string
  ): Promise<import('../constants/DailyPearlsData').ClinicalPearl[]> {
    let pool = await this._loadAllPearls();

    if (specialtyId && specialtyId !== 'all') {
      const filtered = pool.filter(
        (p) =>
          p.specialtyId.toLowerCase() === specialtyId.toLowerCase() ||
          p.specialtyName.toLowerCase().includes(specialtyId.toLowerCase())
      );
      if (filtered.length >= count) {
        pool = filtered;
      }
    }

    const total = pool.length;
    if (total === 0) return [];

    const dateKey = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
      hash = (hash << 5) - hash + dateKey.charCodeAt(i);
      hash |= 0;
    }

    const baseIndex = Math.abs(hash + offset * 5) % total;
    const selected: import('../constants/DailyPearlsData').ClinicalPearl[] = [];
    const selectedIds = new Set<string>();

    for (let i = 0; i < total && selected.length < Math.min(count, total); i++) {
      const idx = (baseIndex + i * 3) % total;
      const item = pool[idx];
      if (!selectedIds.has(item.id)) {
        selectedIds.add(item.id);
        selected.push(item);
      }
    }

    return selected;
  },

  async getPearlsByIds(ids: string[]): Promise<import('../constants/DailyPearlsData').ClinicalPearl[]> {
    if (!ids || ids.length === 0) return [];
    const pool = await this._loadAllPearls();
    const poolMap = new Map(pool.map((p) => [p.id, p]));
    return ids.map((id) => poolMap.get(id)).filter(Boolean) as import('../constants/DailyPearlsData').ClinicalPearl[];
  },
};
