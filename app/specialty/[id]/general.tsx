import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StatusBar, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dbService } from '../../../services/dbService';
import { SpecialtyData } from '../../../constants/SpecialtyData';
import { Colors } from '../../../constants/Colors';
import TopicChat from '../../../components/TopicChat';

export default function GeneralSpecialtyChat() {
  const { id, query, categoryContext } = useLocalSearchParams<{ id: string, query?: string, categoryContext?: string }>();

  const [specialty, setSpecialty] = useState<SpecialtyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await dbService.getSpecialty(id || 'heart');
      setSpecialty(data);
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading || !specialty) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#877bf4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-white/5 bg-background z-20">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 active:opacity-60">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1 ml-2">
          <Text className="text-white text-lg font-sans-bold" numberOfLines={1}>General AI ({specialty.name})</Text>
          <Text className="text-xs font-sans-medium" style={{ color: specialty.color }}>
            {specialty.scientificName} • Specialty Scope Active
          </Text>
        </View>
        <View 
          className="w-8 h-8 rounded-full items-center justify-center border border-white/10"
          style={{ backgroundColor: `${specialty.color}20` }}
        >
          <Ionicons name="medkit" size={14} color={specialty.color} />
        </View>
      </View>

      <TopicChat 
        specialtyId={specialty.id} 
        topicId="general" 
        topicName={categoryContext ? `${categoryContext.charAt(0).toUpperCase() + categoryContext.slice(1)} AI` : `General ${specialty.scientificName}`}
        themeColor={specialty.color}
        initialQuery={query}
        categoryContext={categoryContext}
      />
    </SafeAreaView>
  );
}
