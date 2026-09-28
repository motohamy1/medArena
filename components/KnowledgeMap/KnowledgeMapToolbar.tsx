import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';

interface KnowledgeMapToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
  onReset: () => void;
  onToggleLegend?: () => void;
  isLegendOpen?: boolean;
  themeColor?: string;
}

export const KnowledgeMapToolbar: React.FC<KnowledgeMapToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter,
  onReset,
  onToggleLegend,
  isLegendOpen = false,
  themeColor = Colors.accent,
}) => {
  const handlePress = (callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    callback();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handlePress(onZoomIn)}
        accessibilityRole="button"
        accessibilityLabel="Zoom in"
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={18} color="#ccd1dc" />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.button}
        onPress={() => handlePress(onZoomOut)}
        accessibilityRole="button"
        accessibilityLabel="Zoom out"
        activeOpacity={0.7}
      >
        <Ionicons name="remove" size={18} color="#ccd1dc" />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.button}
        onPress={() => handlePress(onCenter)}
        accessibilityRole="button"
        accessibilityLabel="Center map on root"
        activeOpacity={0.7}
      >
        <Ionicons name="locate-outline" size={16} color="#ccd1dc" />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.button}
        onPress={() => handlePress(onReset)}
        accessibilityRole="button"
        accessibilityLabel="Reset map view"
        activeOpacity={0.7}
      >
        <Ionicons name="refresh-outline" size={16} color="#ccd1dc" />
      </TouchableOpacity>

      {onToggleLegend && (
        <>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[styles.button, isLegendOpen && { backgroundColor: `${themeColor}25` }]}
            onPress={() => handlePress(onToggleLegend)}
            accessibilityRole="button"
            accessibilityLabel="Toggle map legend"
            activeOpacity={0.7}
          >
            <Ionicons
              name={isLegendOpen ? 'key' : 'key-outline'}
              size={15}
              color={isLegendOpen ? themeColor : '#8c92a0'}
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1c20',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 30,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 1,
  },
});
