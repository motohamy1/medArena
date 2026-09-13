import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  StyleSheet,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001';

type TopicQueueItem = {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  error?: string | null;
  durationMs?: number;
  processedAt?: string | null;
};

type MissionLogEntry = {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'step';
  message: string;
  topicTitle?: string | null;
};

type MissionStatus = {
  jobId: string | null;
  specialtyId: string | null;
  specialtyName: string;
  status: 'idle' | 'brainstorming' | 'running' | 'paused' | 'stopped' | 'completed' | 'failed';
  activeCategory?: string;
  currentTopic: {
    id: string;
    title: string;
    category: string;
    categoryId: string;
    step: string;
    startedAt: number;
  } | null;
  progressPercent: number;
  stats: {
    total: number;
    completed: number;
    in_progress: number;
    pending: number;
    failed: number;
    skipped: number;
  };
  queue: TopicQueueItem[];
  logs: MissionLogEntry[];
};

type Proposal = {
  id: string;
  topic_name: string;
  content: any;
  source: string;
  reference: string;
  trigger_query?: string;
  created_at: string;
};

const SPECIALTIES = [
  { id: 'pulmonology', name: 'Pulmonology', icon: 'fitness-outline', color: '#4bc0b8' },
  { id: 'heart', name: 'Cardiology', icon: 'heart-outline', color: '#f9bac9' },
  { id: 'git', name: 'Gastroenterology', icon: 'restaurant-outline', color: '#a9e4e8' },
  { id: 'neuro', name: 'Neurology', icon: 'git-network-outline', color: '#cbc8f5' },
  { id: 'nephrology', name: 'Nephrology', icon: 'water-outline', color: '#a9e4e8' },
  { id: 'endocrinology', name: 'Endocrinology', icon: 'speedometer-outline', color: '#f9bac9' },
  { id: 'critical_care', name: 'Critical Care / ICU', icon: 'medkit-outline', color: '#4bc0b8' },
  { id: 'pediatrics', name: 'Pediatrics', icon: 'happy-outline', color: '#a9e4e8' },
  { id: 'hematology_oncology', name: 'Heme-Onc', icon: 'shield-outline', color: '#cbc8f5' },
  { id: 'rheumatology', name: 'Rheumatology', icon: 'body-outline', color: '#f9bac9' },
  { id: 'psychiatry', name: 'Psychiatry', icon: 'sparkles-outline', color: '#4bc0b8' },
  { id: 'ophthalmology', name: 'Ophthalmology', icon: 'eye-outline', color: '#cbc8f5' },
  { id: 'dermatology', name: 'Dermatology', icon: 'bandage-outline', color: '#f9bac9' },
  { id: 'surgical_suite', name: 'Surgical Suite', icon: 'cut-outline', color: '#4bc0b8' },
];

export default function ReviewQueue() {
  const [activeTab, setActiveTab] = useState<'mission' | 'proposals'>('mission');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('pulmonology');
  
  // Mission Control State
  const [missionState, setMissionState] = useState<MissionStatus>({
    jobId: null,
    specialtyId: null,
    specialtyName: '',
    status: 'idle',
    currentTopic: null,
    progressPercent: 0,
    stats: { total: 0, completed: 0, in_progress: 0, pending: 0, failed: 0, skipped: 0 },
    queue: [],
    logs: []
  });

  // UI Filters & Modals
  const [queueFilter, setQueueFilter] = useState<'all' | 'in_progress' | 'pending' | 'completed' | 'skipped_failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('clinical_topics');
  const [showTerminal, setShowTerminal] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Proposals & Reviews
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  // Safe Navigation Back
  const handleGoBack = useCallback(() => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile');
      }
    } catch (_) {
      try {
        router.replace('/(tabs)/profile');
      } catch (__) {}
    }
  }, []);

  // Fetch Mission Status from API
  const fetchMissionStatus = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/expansion/status`);
      if (res.ok && isMountedRef.current) {
        const data = await res.json();
        if (data && data.stats) {
          setMissionState(data);
          if (data.specialtyId) {
            setSelectedSpecialty(prev => prev || data.specialtyId);
          }
        }
      }
    } catch (_) {}
  }, []);

  // Fetch Proposals Queue
  const fetchProposals = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/queue`);
      if (res.ok && isMountedRef.current) {
        const data = await res.json();
        setProposals(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Fetch proposals error:', err);
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchMissionStatus();
    fetchProposals();

    // Polling timer (every 2s) for live updates
    const timer = setInterval(() => {
      if (isMountedRef.current) {
        fetchMissionStatus();
      }
    }, 2000);

    return () => {
      isMountedRef.current = false;
      clearInterval(timer);
    };
  }, [fetchMissionStatus, fetchProposals]);

  // Control Actions
  const handleStartExpansion = async (specialtyIdToRun = selectedSpecialty) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/expansion/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialtyId: specialtyIdToRun })
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Expansion Notice', data.error || 'Failed to start expansion.');
      } else if (data.state && isMountedRef.current) {
        setMissionState(data.state);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Connection failed.');
    } finally {
      if (isMountedRef.current) setIsActionLoading(false);
    }
  };

  const handlePauseExpansion = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/expansion/pause`, { method: 'POST' });
      const data = await res.json();
      if (data.state && isMountedRef.current) setMissionState(data.state);
    } catch (_) {}
    if (isMountedRef.current) setIsActionLoading(false);
  };

  const handleResumeExpansion = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/expansion/resume`, { method: 'POST' });
      const data = await res.json();
      if (data.state && isMountedRef.current) setMissionState(data.state);
    } catch (_) {}
    if (isMountedRef.current) setIsActionLoading(false);
  };

  const handleStopExpansion = () => {
    Alert.alert(
      'Stop Expansion Mission?',
      'Are you sure you want to stop the autonomous research mission? Completed topics will remain saved in the database.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Mission',
          style: 'destructive',
          onPress: async () => {
            setIsActionLoading(true);
            try {
              const res = await fetch(`${BACKEND_URL}/api/admin/scientist/expansion/stop`, { method: 'POST' });
              const data = await res.json();
              if (data.state && isMountedRef.current) setMissionState(data.state);
            } catch (_) {}
            if (isMountedRef.current) setIsActionLoading(false);
          }
        }
      ]
    );
  };

  const handleSkipTopic = async (topicId?: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/expansion/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      });
      const data = await res.json();
      if (data.state && isMountedRef.current) setMissionState(data.state);
    } catch (_) {}
  };

  const handleRetryTopic = async (topicId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/expansion/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      });
      const data = await res.json();
      if (data.state && isMountedRef.current) setMissionState(data.state);
    } catch (_) {}
  };

  const handleRemoveTopic = async (topicId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/expansion/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      });
      const data = await res.json();
      if (data.state && isMountedRef.current) setMissionState(data.state);
    } catch (_) {}
  };

  const handleAddCustomTopic = async () => {
    if (!newTopicTitle.trim()) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/expansion/add-topic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTopicTitle.trim(),
          categoryId: newTopicCategory,
          categoryTitle: newTopicCategory === 'emergencies' ? 'Emergencies' : 'Clinical Topics'
        })
      });
      const data = await res.json();
      if (data.state && isMountedRef.current) setMissionState(data.state);
      setNewTopicTitle('');
      setShowAddModal(false);
    } catch (_) {}
  };

  // Proposal Approvals
  const handleApproveProposal = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/approve/${id}`, { method: 'POST' });
      if (res.ok) {
        Alert.alert('Success', 'Knowledge update approved and saved.');
        if (isMountedRef.current) {
          setProposals(prev => prev.filter(p => p.id !== id));
        }
      }
    } catch (_) {
      Alert.alert('Error', 'Failed to approve update.');
    } finally {
      if (isMountedRef.current) setProcessingId(null);
    }
  };

  const handleRejectProposal = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/scientist/reject/${id}`, { method: 'POST' });
      if (res.ok && isMountedRef.current) {
        setProposals(prev => prev.filter(p => p.id !== id));
      }
    } catch (_) {
      Alert.alert('Error', 'Failed to reject update.');
    } finally {
      if (isMountedRef.current) setProcessingId(null);
    }
  };

  // Filtered Queue
  const filteredQueue = (missionState.queue || []).filter(item => {
    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (queueFilter === 'all') return true;
    if (queueFilter === 'in_progress') return item.status === 'in_progress';
    if (queueFilter === 'pending') return item.status === 'pending';
    if (queueFilter === 'completed') return item.status === 'completed';
    if (queueFilter === 'skipped_failed') return item.status === 'skipped' || item.status === 'failed';
    return true;
  });

  const isRunning = missionState.status === 'running' || missionState.status === 'brainstorming';
  const isPaused = missionState.status === 'paused';

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'running': return '#10b981'; // emerald
      case 'brainstorming': return Colors.accent; // cyan/mint
      case 'paused': return '#f59e0b'; // amber
      case 'stopped': return '#ef4444'; // red
      case 'completed': return '#10b981';
      default: return '#6b7280'; // gray
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Top Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10 bg-deep-teal">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleGoBack} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-sans-bold text-white">AI Knowledge Ingestion</Text>
            <Text className="text-[10px] text-gray-muted">Autonomous Mission Control & Live Tracking</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-surface-hover rounded-xl p-1 border border-white/10">
          <TouchableOpacity
            onPress={() => setActiveTab('mission')}
            className={`px-3 py-1.5 rounded-lg ${activeTab === 'mission' ? 'bg-teal/20 border border-teal/30' : ''}`}
          >
            <Text className={`text-xs font-sans-bold ${activeTab === 'mission' ? 'text-teal' : 'text-gray-muted'}`}>
              Mission Hub
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('proposals')}
            className={`px-3 py-1.5 rounded-lg ${activeTab === 'proposals' ? 'bg-teal/20 border border-teal/30' : ''}`}
          >
            <Text className={`text-xs font-sans-bold ${activeTab === 'proposals' ? 'text-teal' : 'text-gray-muted'}`}>
              Reviews ({proposals.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchMissionStatus();
              fetchProposals();
            }}
            tintColor="#a9e4e8"
          />
        }
      >
        {activeTab === 'mission' ? (
          <View className="p-4 gap-4">
            {/* Specialty Selection Scroll */}
            <View>
              <Text className="text-[11px] font-sans-bold text-gray-muted uppercase tracking-wider mb-2">
                Target Specialty
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {SPECIALTIES.map(spec => {
                  const isSelected = selectedSpecialty === spec.id;
                  const isCurrentActive = missionState.specialtyId === spec.id && isRunning;
                  return (
                    <TouchableOpacity
                      key={spec.id}
                      onPress={() => setSelectedSpecialty(spec.id)}
                      className={`px-3.5 py-2.5 rounded-xl border flex-row items-center gap-2 ${
                        isSelected
                          ? 'bg-teal/20 border-teal shadow-md'
                          : 'bg-teal-medium/80 border-white/10'
                      }`}
                    >
                      <Ionicons
                        name={spec.icon as any}
                        size={16}
                        color={isSelected ? Colors.accent : spec.color}
                      />
                      <Text
                        className={`text-xs font-sans-bold ${
                          isSelected ? 'text-white' : 'text-gray-300'
                        }`}
                      >
                        {spec.name}
                      </Text>
                      {isCurrentActive && (
                        <View className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Mission Control Command Center Card */}
            <View className="bg-teal-medium rounded-2xl p-4 border border-white/10 shadow-lg">
              {/* Mission State Header */}
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-1 mr-2">
                  <Text className="text-white font-sans-bold text-base" numberOfLines={1}>
                    {missionState.specialtyName || SPECIALTIES.find(s => s.id === selectedSpecialty)?.name || 'Specialty Ingestion'}
                  </Text>
                  <Text className="text-[11px] text-gray-muted">
                    {isRunning
                      ? `Active category: ${missionState.activeCategory || 'Brainstorming'}`
                      : isPaused
                      ? 'Mission execution paused'
                      : missionState.status === 'completed'
                      ? 'All queued topics processed'
                      : 'Ready to launch autonomous research'}
                  </Text>
                </View>

                {/* Live Status Badge */}
                <View
                  className="px-2.5 py-1 rounded-full border flex-row items-center gap-1.5"
                  style={{
                    backgroundColor: `${getStatusColor(missionState.status)}20`,
                    borderColor: `${getStatusColor(missionState.status)}50`
                  }}
                >
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getStatusColor(missionState.status) }}
                  />
                  <Text
                    className="text-[10px] font-sans-bold uppercase"
                    style={{ color: getStatusColor(missionState.status) }}
                  >
                    {missionState.status}
                  </Text>
                </View>
              </View>

              {/* Action Buttons Toolbar */}
              <View className="flex-row flex-wrap gap-2 pt-2 border-t border-white/10">
                {!isRunning && !isPaused ? (
                  <TouchableOpacity
                    onPress={() => handleStartExpansion()}
                    disabled={isActionLoading}
                    className="flex-1 bg-teal h-11 rounded-xl flex-row items-center justify-center gap-2 shadow-lg"
                  >
                    <Ionicons name="play" size={18} color={Colors.ink} />
                    <Text className="text-ink font-sans-bold text-xs">
                      {missionState.status === 'completed' ? 'Restart Expansion' : 'Launch Deep Ingestion'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    {isPaused ? (
                      <TouchableOpacity
                        onPress={handleResumeExpansion}
                        disabled={isActionLoading}
                        className="flex-1 bg-emerald-500 h-11 rounded-xl flex-row items-center justify-center gap-2"
                      >
                        <Ionicons name="play" size={18} color="#fff" />
                        <Text className="text-white font-sans-bold text-xs">Resume</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={handlePauseExpansion}
                        disabled={isActionLoading}
                        className="flex-1 bg-amber-500/20 border border-amber-500/40 h-11 rounded-xl flex-row items-center justify-center gap-2"
                      >
                        <Ionicons name="pause" size={18} color="#f59e0b" />
                        <Text className="text-amber-400 font-sans-bold text-xs">Pause</Text>
                      </TouchableOpacity>
                    )}

                    {missionState.currentTopic && (
                      <TouchableOpacity
                        onPress={() => handleSkipTopic()}
                        disabled={isActionLoading}
                        className="px-3.5 h-11 bg-white/10 border border-white/20 rounded-xl flex-row items-center justify-center gap-1.5"
                      >
                        <Ionicons name="play-forward" size={16} color="#fff" />
                        <Text className="text-white font-sans-bold text-xs">Skip Current</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={handleStopExpansion}
                      disabled={isActionLoading}
                      className="px-3.5 h-11 bg-red-500/20 border border-red-500/40 rounded-xl flex-row items-center justify-center gap-1.5"
                    >
                      <Ionicons name="stop" size={16} color="#ef4444" />
                      <Text className="text-red-400 font-sans-bold text-xs">Stop</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  onPress={() => setShowAddModal(true)}
                  className="px-3.5 h-11 bg-surface-hover border border-white/15 rounded-xl flex-row items-center justify-center gap-1.5"
                >
                  <Ionicons name="add" size={18} color={Colors.accent} />
                  <Text className="text-teal font-sans-bold text-xs">Add Topic</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress Bar & KPI Metrics */}
            <View className="bg-teal-medium/60 rounded-2xl p-4 border border-white/10">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-sans-bold text-gray-300">Overall Progress</Text>
                <Text className="text-xs font-sans-bold text-teal">
                  {missionState.progressPercent}% ({missionState.stats.completed}/{missionState.stats.total})
                </Text>
              </View>

              {/* Progress Bar */}
              <View className="h-2.5 bg-black/50 rounded-full overflow-hidden mb-4 border border-white/5">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${missionState.progressPercent}%`,
                    backgroundColor: Colors.accent
                  }}
                />
              </View>

              {/* 4 Stat Cards */}
              <View className="flex-row gap-2">
                <View className="flex-1 bg-background/50 p-2.5 rounded-xl border border-white/5 items-center">
                  <Text className="text-base font-sans-bold text-white">{missionState.stats.total}</Text>
                  <Text className="text-[9px] text-gray-muted uppercase font-sans-bold">Total</Text>
                </View>
                <View className="flex-1 bg-background/50 p-2.5 rounded-xl border border-emerald-500/20 items-center">
                  <Text className="text-base font-sans-bold text-emerald-400">{missionState.stats.completed}</Text>
                  <Text className="text-[9px] text-emerald-400 uppercase font-sans-bold">Done</Text>
                </View>
                <View className="flex-1 bg-background/50 p-2.5 rounded-xl border border-amber-500/20 items-center">
                  <Text className="text-base font-sans-bold text-amber-400">{missionState.stats.pending}</Text>
                  <Text className="text-[9px] text-amber-400 uppercase font-sans-bold">Pending</Text>
                </View>
                <View className="flex-1 bg-background/50 p-2.5 rounded-xl border border-red-500/20 items-center">
                  <Text className="text-base font-sans-bold text-red-400">
                    {missionState.stats.failed + missionState.stats.skipped}
                  </Text>
                  <Text className="text-[9px] text-red-400 uppercase font-sans-bold">Skip/Fail</Text>
                </View>
              </View>
            </View>

            {/* Active Topic Stage Radar */}
            {missionState.currentTopic && (
              <View className="bg-teal/10 border border-teal/30 rounded-2xl p-4 shadow-lg">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color={Colors.accent} />
                    <Text className="text-[10px] text-teal uppercase font-sans-bold tracking-wider">
                      Currently Researching
                    </Text>
                  </View>
                  <Text className="text-[10px] text-gray-muted">
                    {missionState.currentTopic.category}
                  </Text>
                </View>

                <Text className="text-white font-sans-bold text-base mb-2">
                  {missionState.currentTopic.title}
                </Text>

                {/* Step Sub-card */}
                <View className="bg-background/80 px-3 py-2 rounded-xl border border-white/10 flex-row items-center gap-2">
                  <Ionicons name="sparkles" size={14} color={Colors.accent} />
                  <Text className="text-xs text-gray-200 flex-1 font-sans-medium">
                    {missionState.currentTopic.step}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleSkipTopic(missionState.currentTopic?.id)}
                    className="bg-white/10 px-2 py-1 rounded-md"
                  >
                    <Text className="text-[10px] text-amber-400 font-sans-bold">Skip</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Interactive Topic Queue Section */}
            <View className="bg-teal-medium rounded-2xl p-4 border border-white/10">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm font-sans-bold text-white">
                  Topic Ingestion Queue ({filteredQueue.length})
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAddModal(true)}
                  className="flex-row items-center gap-1"
                >
                  <Ionicons name="add-circle-outline" size={16} color={Colors.accent} />
                  <Text className="text-xs text-teal font-sans-bold">Add Custom</Text>
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View className="bg-background/60 rounded-xl px-3 py-2 flex-row items-center gap-2 border border-white/10 mb-3">
                <Ionicons name="search" size={16} color="#7b8188" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Filter topics in queue..."
                  placeholderTextColor="#7b8188"
                  className="flex-1 text-white text-xs"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color="#7b8188" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }} className="mb-3">
                {[
                  { id: 'all', label: `All (${missionState.stats.total})` },
                  { id: 'in_progress', label: `Active (${missionState.stats.in_progress})` },
                  { id: 'pending', label: `Pending (${missionState.stats.pending})` },
                  { id: 'completed', label: `Done (${missionState.stats.completed})` },
                  { id: 'skipped_failed', label: `Skip/Fail (${missionState.stats.skipped + missionState.stats.failed})` }
                ].map(tab => (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setQueueFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg border ${
                      queueFilter === tab.id
                        ? 'bg-teal/20 border-teal'
                        : 'bg-background/40 border-white/5'
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-sans-bold ${
                        queueFilter === tab.id ? 'text-teal' : 'text-gray-400'
                      }`}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Queue Items List */}
              {filteredQueue.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="file-tray-outline" size={32} color="#7b8188" />
                  <Text className="text-xs text-gray-muted mt-2">No topics found in this view.</Text>
                </View>
              ) : (
                <View className="gap-2">
                  {filteredQueue.slice(0, 40).map((item, index) => {
                    const isItemActive = item.status === 'in_progress';
                    const isItemDone = item.status === 'completed';
                    const isItemFailed = item.status === 'failed';
                    const isItemSkipped = item.status === 'skipped';
                    const isItemPending = item.status === 'pending';

                    return (
                      <View
                        key={item.id || index}
                        className={`p-3 rounded-xl border flex-row items-center justify-between ${
                          isItemActive
                            ? 'bg-teal/15 border-teal/40'
                            : isItemDone
                            ? 'bg-emerald-950/20 border-emerald-500/20'
                            : isItemFailed
                            ? 'bg-red-950/20 border-red-500/20'
                            : isItemSkipped
                            ? 'bg-amber-950/20 border-amber-500/20'
                            : 'bg-background/40 border-white/5'
                        }`}
                      >
                        {/* Topic Info */}
                        <View className="flex-1 mr-3">
                          <View className="flex-row items-center gap-2 mb-1">
                            <Text
                              className={`text-xs font-sans-bold ${
                                isItemDone
                                  ? 'text-gray-300'
                                  : isItemActive
                                  ? 'text-teal'
                                  : 'text-white'
                              }`}
                              numberOfLines={2}
                            >
                              {item.title}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <Text className="text-[10px] text-gray-muted bg-white/5 px-1.5 py-0.5 rounded">
                              {item.category}
                            </Text>
                            {item.durationMs && (
                              <Text className="text-[9px] text-emerald-400 font-sans-bold">
                                {Math.round(item.durationMs / 1000)}s
                              </Text>
                            )}
                            {item.error && (
                              <Text className="text-[9px] text-red-400" numberOfLines={1}>
                                {item.error}
                              </Text>
                            )}
                          </View>
                        </View>

                        {/* Status / Quick Actions */}
                        <View className="flex-row items-center gap-1.5">
                          {isItemActive && (
                            <ActivityIndicator size="small" color={Colors.accent} />
                          )}

                          {isItemDone && (
                            <View className="bg-emerald-500/20 p-1.5 rounded-lg">
                              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                            </View>
                          )}

                          {isItemPending && (
                            <>
                              <TouchableOpacity
                                onPress={() => handleSkipTopic(item.id)}
                                className="bg-white/10 px-2 py-1 rounded-md"
                              >
                                <Text className="text-[10px] text-gray-300 font-sans-bold">Skip</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => handleRemoveTopic(item.id)}
                                className="p-1 rounded-md"
                              >
                                <Ionicons name="trash-outline" size={14} color="#7b8188" />
                              </TouchableOpacity>
                            </>
                          )}

                          {(isItemFailed || isItemSkipped) && (
                            <TouchableOpacity
                              onPress={() => handleRetryTopic(item.id)}
                              className="bg-teal/20 px-2 py-1 rounded-md flex-row items-center gap-1 border border-teal/30"
                            >
                              <Ionicons name="refresh" size={12} color={Colors.accent} />
                              <Text className="text-[10px] text-teal font-sans-bold">Retry</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
                  {filteredQueue.length > 40 && (
                    <Text className="text-[11px] text-center text-gray-muted py-2">
                      + {filteredQueue.length - 40} more topics in queue
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Live Activity Terminal */}
            <View className="bg-black/90 rounded-2xl p-4 border border-white/15">
              <TouchableOpacity
                onPress={() => setShowTerminal(!showTerminal)}
                className="flex-row justify-between items-center"
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="terminal-outline" size={16} color={Colors.accent} />
                  <Text className="text-xs font-sans-bold text-white">Mission Activity Terminal</Text>
                </View>
                <Ionicons
                  name={showTerminal ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#7b8188"
                />
              </TouchableOpacity>

              {showTerminal && (
                <View className="mt-3 bg-teal-dark p-3 rounded-xl border border-white/5 max-h-48">
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                    {missionState.logs && missionState.logs.length > 0 ? (
                      missionState.logs.map(log => {
                        let logColor = '#e5e7eb';
                        if (log.type === 'success') logColor = '#34d399';
                        if (log.type === 'warn') logColor = '#fbbf24';
                        if (log.type === 'error') logColor = '#f87171';
                        if (log.type === 'step') logColor = '#67e8f9';

                        return (
                          <View key={log.id} className="flex-row items-start mb-1 gap-2">
                            <Text className="text-[9px] text-gray-500 font-mono">[{log.timestamp}]</Text>
                            <Text
                              className="text-[10px] font-mono flex-1 leading-relaxed"
                              style={{ color: logColor }}
                            >
                              {log.message}
                            </Text>
                          </View>
                        );
                      })
                    ) : (
                      <Text className="text-[10px] text-gray-500 font-mono italic">
                        Terminal ready. Awaiting mission events...
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        ) : (
          /* Knowledge Review Queue (Proposals Tab) */
          <View className="p-4 gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sans-bold text-gray-muted uppercase tracking-widest">
                Pending Scientific Proposals ({proposals.length})
              </Text>
            </View>

            {proposals.length === 0 ? (
              <View className="items-center py-20">
                <Ionicons name="checkmark-circle-outline" size={64} color={Colors.teal} />
                <Text className="text-gray-muted mt-4 font-sans-medium">
                  Review queue is clean. All proposed topics approved.
                </Text>
              </View>
            ) : (
              proposals.map(proposal => (
                <View key={proposal.id} className="bg-teal-medium rounded-2xl p-4 border border-white/5">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-2">
                      <Text className="text-base font-sans-bold text-white">{proposal.topic_name}</Text>
                      <Text className="text-[11px] text-teal uppercase tracking-wider mt-0.5">
                        Source: {proposal.source}
                      </Text>
                    </View>
                    <View className="bg-teal/20 px-2 py-1 rounded-md">
                      <Text className="text-[10px] text-teal font-sans-bold">PENDING</Text>
                    </View>
                  </View>

                  {proposal.trigger_query && (
                    <View className="bg-background/50 p-2 rounded-lg mb-3 border border-white/5">
                      <Text className="text-[9px] text-gray-muted uppercase font-sans-bold mb-0.5">
                        Trigger Question
                      </Text>
                      <Text className="text-xs text-white italic">&quot;{proposal.trigger_query}&quot;</Text>
                    </View>
                  )}

                  <View className="mb-4">
                    <Text className="text-[10px] text-gray-muted uppercase font-sans-bold mb-2">
                      Synthesized Protocol Excerpt
                    </Text>
                    {proposal.content && Array.isArray(proposal.content) ? (
                      proposal.content.slice(0, 2).map((section: any, idx: number) => (
                        <View key={idx} className="mb-2">
                          <Text className="text-xs font-sans-bold text-teal">{section.title}</Text>
                          <Text className="text-[11px] text-gray-300" numberOfLines={2}>
                            {section.content}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-xs text-gray-300">
                        {typeof proposal.content === 'string'
                          ? proposal.content.substring(0, 120)
                          : JSON.stringify(proposal.content).substring(0, 120)}
                        ...
                      </Text>
                    )}
                  </View>

                  <View className="border-t border-white/5 pt-3 flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => handleApproveProposal(proposal.id)}
                      disabled={!!processingId}
                      className="flex-1 bg-teal h-10 rounded-xl items-center justify-center flex-row shadow-lg"
                    >
                      {processingId === proposal.id ? (
                        <ActivityIndicator size="small" color={Colors.ink} />
                      ) : (
                        <>
                          <Ionicons name="cloud-upload-outline" size={16} color={Colors.ink} />
                          <Text className="text-ink font-sans-bold text-xs ml-2">Approve & Ingest</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleRejectProposal(proposal.id)}
                      disabled={!!processingId}
                      className="w-11 h-10 bg-red-500/20 rounded-xl items-center justify-center border border-red-500/30"
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Custom Topic Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-black/80 justify-center px-4">
          <View className="bg-teal-medium rounded-2xl p-5 border border-white/20">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base font-sans-bold text-white">Add Custom Topic to Queue</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-gray-300 mb-1 font-sans-medium">Topic Title / Clinical Entity</Text>
            <TextInput
              value={newTopicTitle}
              onChangeText={setNewTopicTitle}
              placeholder="e.g. Acute Severe Asthma Exacerbation"
              placeholderTextColor="#7b8188"
              className="bg-background/80 border border-white/10 rounded-xl p-3 text-white text-xs mb-4"
            />

            <Text className="text-xs text-gray-300 mb-2 font-sans-medium">Category</Text>
            <View className="flex-row gap-2 mb-5">
              {[
                { id: 'emergencies', label: 'Emergencies' },
                { id: 'clinical_topics', label: 'Clinical Topics' },
                { id: 'tools', label: 'Tools' },
                { id: 'research', label: 'Research' }
              ].map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setNewTopicCategory(cat.id)}
                  className={`flex-1 py-2 rounded-lg items-center border ${
                    newTopicCategory === cat.id
                      ? 'bg-teal/20 border-teal'
                      : 'bg-background/50 border-white/10'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-sans-bold ${
                      newTopicCategory === cat.id ? 'text-teal' : 'text-gray-400'
                    }`}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                className="flex-1 bg-surface-hover h-11 rounded-xl items-center justify-center border border-white/10"
              >
                <Text className="text-gray-300 font-sans-bold text-xs">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddCustomTopic}
                className="flex-1 bg-teal h-11 rounded-xl items-center justify-center shadow-lg"
              >
                <Text className="text-ink font-sans-bold text-xs">Insert into Queue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#010101',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
