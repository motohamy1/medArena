import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { KnowledgeNodeType } from '../../types/knowledgeMap';
import { getNodeVisualConfig } from '../../utils/knowledgeMap/graphConstants';
import { Colors } from '../../constants/Colors';

interface KnowledgeMapLegendProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
}

interface LegendItem {
  type: KnowledgeNodeType;
  label: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { type: 'root', label: 'Topic Core' },
  { type: 'section', label: 'Clinical Section' },
  { type: 'investigation', label: 'Workup & Diagnostic' },
  { type: 'treatment', label: 'Management & Therapy' },
  { type: 'drug', label: 'Pharmacotherapy' },
  { type: 'finding', label: 'Symptom & Sign' },
  { type: 'red-flag', label: 'Red Flag & Risk' },
];

export const KnowledgeMapLegend: React.FC<KnowledgeMapLegendProps> = ({
  isOpen,
  onClose,
  themeColor = Colors.accent,
}) => {
  if (!isOpen) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(150)}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="key-outline" size={13} color={themeColor} />
          <Text style={styles.title}>Map Legend</Text>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={16} color="#8c92a0" />
        </TouchableOpacity>
      </View>

      <View style={styles.itemsGrid}>
        {LEGEND_ITEMS.map((item) => {
          const config = getNodeVisualConfig(item.type, themeColor);
          return (
            <View key={item.type} style={styles.itemRow}>
              <View style={[styles.dot, { backgroundColor: config.iconColor }]} />
              <Text style={styles.itemLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#1a1c20',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 35,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  title: {
    fontSize: 11.5,
    fontFamily: 'PlexSans_700Bold',
    color: '#ffffff',
  },
  itemsGrid: {
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  itemLabel: {
    fontSize: 10.5,
    fontFamily: 'PlexSans_500Medium',
    color: '#ccd1dc',
  },
});
