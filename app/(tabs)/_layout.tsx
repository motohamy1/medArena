import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

export const DOCK_HEIGHT = 72;
const HORIZONTAL_MARGIN = 16;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 220,
  mass: 0.8,
};

const TAB_CONFIG = [
  { name: 'index', title: 'Med Center', activeIcon: 'grid', inactiveIcon: 'grid-outline' },
  { name: 'ChatTab', title: 'Chat', activeIcon: 'chatbubble-ellipses', inactiveIcon: 'chatbubble-ellipses-outline' },
  { name: 'pearls', title: 'Pearls', activeIcon: 'sparkles', inactiveIcon: 'sparkles-outline' },
  { name: 'profile', title: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
] as const;

function NotchedTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(
    Dimensions.get('window').width - HORIZONTAL_MARGIN * 2
  );

  const activeIndex = state.index;
  const slidingX = useSharedValue(0);
  const bubbleScale = useSharedValue(1);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const totalTabs = state.routes.length;
  const floatingBottom = insets.bottom > 0 ? insets.bottom : 10;

  const tabWidth = barWidth / totalTabs;

  useEffect(() => {
    if (barWidth > 0) {
      const targetX = activeIndex * tabWidth;
      slidingX.value = withSpring(targetX, SPRING_CONFIG);

      bubbleScale.value = withTiming(0.9, { duration: 100 }, (finished) => {
        if (finished) {
          bubbleScale.value = withSpring(1, SPRING_CONFIG);
        }
      });
    }
  }, [activeIndex, barWidth, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: slidingX.value + (tabWidth - 44) / 2 },
      { scale: bubbleScale.value },
    ],
  }));

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View
      style={[
        styles.barWrapper,
        {
          bottom: floatingBottom,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={styles.dockContainer}
        onLayout={(e) => {
          setBarWidth(e.nativeEvent.layout.width);
        }}
      >
        {/* Apple-style Liquid Glass Shell - Simplified */}
        <View style={styles.glassShell}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(0, 0, 0, 0.3)']}
            style={StyleSheet.absoluteFill}
          />
          {/* Inner Glow / Border */}
          <View style={styles.innerBorder} />
        </View>

        {/* Sliding Active Indicator (The "Liquid" part) - Sized for Icon Only */}
        <Animated.View style={[styles.activeIndicator, indicatorStyle, { width: 44, height: 44 }]}>
           <LinearGradient
            colors={[Colors.main, Colors.teal]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Tab Slots */}
        <View style={styles.tabSlotsRow}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const config = TAB_CONFIG[index] ?? {
              name: route.name,
              title: route.name,
              activeIcon: 'help',
              inactiveIcon: 'help-outline',
            };

            const onPress = () => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tabSlot}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={(isFocused ? config.activeIcon : config.inactiveIcon) as any}
                    size={22}
                    color={isFocused ? '#010101' : Colors.graySubtle}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? Colors.main : Colors.graySubtle }
                  ]}
                  numberOfLines={1}
                  allowFontScaling={false}
                >
                  {config.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <NotchedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarAllowFontScaling: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Med Center' }} />
      <Tabs.Screen name="ChatTab" options={{ title: 'Chat' }} />
      <Tabs.Screen name="pearls" options={{ title: 'Pearls' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: 'absolute',
    left: HORIZONTAL_MARGIN,
    right: HORIZONTAL_MARGIN,
    zIndex: 1000,
    height: DOCK_HEIGHT,
    backgroundColor: '#0c1214', // Solid dark background
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  dockContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 32,
  },
  glassShell: {
    ...StyleSheet.absoluteFill,
  },
  innerBorder: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 32,
    margin: 1.5,
  },
  activeIndicator: {
    position: 'absolute',
    top: 6, // Centered relative to the 44px icon container
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: Colors.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  tabSlotsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align to top to match indicator
    justifyContent: 'space-between',
    width: '100%',
    height: DOCK_HEIGHT,
  },
  tabSlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    paddingHorizontal: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
  },
  tabLabel: {
    fontSize: 10.5,
    fontFamily: 'PlexSans_600SemiBold',
    marginTop: 0,
    zIndex: 60,
    textAlign: 'center',
    width: '100%',
    includeFontPadding: false,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});