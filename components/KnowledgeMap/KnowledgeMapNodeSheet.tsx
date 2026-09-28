import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { KnowledgeMapNode } from '../../types/knowledgeMap';
import { getNodeVisualConfig } from '../../utils/knowledgeMap/graphConstants';
import { Colors } from '../../constants/Colors';

interface KnowledgeMapNodeSheetProps {
  node: KnowledgeMapNode | null;
  topicName?: string;
  specialtyName?: string;
  themeColor?: string;
  onClose: () => void;
  onAskAi: (node: KnowledgeMapNode) => void;
  onFocusNode: (node: KnowledgeMapNode) => void;
  onToggleExpand?: (node: KnowledgeMapNode) => void;
  onOpenGuide?: (sourceId?: string) => void;
  isExpanded?: boolean;
}

export const KnowledgeMapNodeSheet: React.FC<KnowledgeMapNodeSheetProps> = ({
  node,
  topicName,
  specialtyName,
  themeColor = Colors.accent,
  onClose,
  onAskAi,
  onFocusNode,
  onToggleExpand,
  onOpenGuide,
  isExpanded = true,
}) => {
  if (!node) return null;

  const visualConfig = getNodeVisualConfig(node.type, themeColor);

  const handleAction = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    callback();
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(180)}
      style={styles.sheetContainer}
    >
      {/* Top Handle / Grabber */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: visualConfig.badgeBg, borderColor: `${visualConfig.iconColor}50` },
            ]}
          >
            <Ionicons name={visualConfig.iconName} size={11} color={visualConfig.iconColor} />
            <Text style={[styles.typeText, { color: visualConfig.iconColor }]}>
              {node.type.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.nodeTitle} numberOfLines={2}>
            {node.label}
          </Text>
          <Text style={styles.contextSubtext} numberOfLines={1}>
            {specialtyName ? `${specialtyName} • ` : ''}
            {topicName || 'Clinical Reference'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleAction(onClose)}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close concept details"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color="#8c92a0" />
        </TouchableOpacity>
      </View>

      {/* Summary Area */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.summaryText}>
          {node.summary || 'No additional summary is available yet.'}
        </Text>
      </ScrollView>

      {/* Action Buttons Island */}
      <View style={styles.actionsContainer}>
        {/* Primary Action: Ask AI */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: visualConfig.iconColor }]}
          onPress={() => handleAction(() => onAskAi(node))}
          accessibilityRole="button"
          accessibilityLabel={`Ask AI about ${node.label}`}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={15} color="#08090b" />
          <Text style={styles.primaryButtonText}>Ask AI about this</Text>
        </TouchableOpacity>

        {/* Secondary Actions Row */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleAction(() => onFocusNode(node))}
            accessibilityRole="button"
            accessibilityLabel="Focus on node"
            activeOpacity={0.7}
          >
            <Ionicons name="scan-outline" size={14} color="#ccd1dc" />
            <Text style={styles.secondaryButtonText}>Focus</Text>
          </TouchableOpacity>

          {node.expandable && onToggleExpand && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleAction(() => onToggleExpand(node))}
              accessibilityRole="button"
              accessibilityLabel={isExpanded ? 'Collapse branch' : 'Expand branch'}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isExpanded ? 'contract-outline' : 'expand-outline'}
                size={14}
                color="#ccd1dc"
              />
              <Text style={styles.secondaryButtonText}>
                {isExpanded ? 'Collapse' : 'Expand'}
              </Text>
            </TouchableOpacity>
          )}

          {onOpenGuide && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleAction(() => onOpenGuide(node.sourceId))}
              accessibilityRole="button"
              accessibilityLabel="Open in Clinical Guide"
              activeOpacity={0.7}
            >
              <Ionicons name="book-outline" size={14} color="#ccd1dc" />
              <Text style={styles.secondaryButtonText}>Guide</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1c20',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 40,
    maxHeight: 330,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  typeText: {
    fontSize: 9.5,
    fontFamily: 'PlexSans_700Bold',
    letterSpacing: 0.6,
  },
  nodeTitle: {
    fontSize: 17,
    fontFamily: 'PlexSans_700Bold',
    color: '#ffffff',
    lineHeight: 22,
  },
  contextSubtext: {
    fontSize: 11,
    fontFamily: 'PlexSans_500Medium',
    color: '#8c92a0',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    maxHeight: 80,
    marginVertical: 6,
  },
  scrollContent: {
    paddingVertical: 2,
  },
  summaryText: {
    fontSize: 13,
    fontFamily: 'PlexSans_400Regular',
    color: '#ccd1dc',
    lineHeight: 18,
  },
  actionsContainer: {
    marginTop: 10,
    gap: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: 14,
  },
  primaryButtonText: {
    fontSize: 13.5,
    fontFamily: 'PlexSans_700Bold',
    color: '#08090b',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryButtonText: {
    fontSize: 11.5,
    fontFamily: 'PlexSans_600SemiBold',
    color: '#ccd1dc',
  },
});
