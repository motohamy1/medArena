import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface KnowledgeMapEmptyStateProps {
  onAskAi?: () => void;
  themeColor?: string;
}

export const KnowledgeMapEmptyState: React.FC<KnowledgeMapEmptyStateProps> = ({
  onAskAi,
  themeColor = Colors.accent,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { borderColor: `${themeColor}40`, backgroundColor: `${themeColor}12` }]}>
        <Ionicons name="git-network-outline" size={32} color={themeColor} />
      </View>

      <Text style={styles.title}>Knowledge Map</Text>
      <Text style={styles.description}>
        This topic does not have enough structured clinical content yet. Ask the AI Assistant to explore guidelines and relationships.
      </Text>

      {onAskAi && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeColor }]}
          onPress={onAskAi}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles" size={15} color="#08090b" />
          <Text style={styles.buttonText}>Ask AI</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#08090b',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'PlexSans_700Bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    fontFamily: 'PlexSans_400Regular',
    color: '#8c92a0',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 13,
    fontFamily: 'PlexSans_700Bold',
    color: '#08090b',
  },
});
