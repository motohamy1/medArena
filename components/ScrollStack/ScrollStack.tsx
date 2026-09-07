import React, { Children, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { createScrollStackStyles } from './scrollStack.styles';
import ScrollStackItem from './ScrollStackItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SPRING_CONFIG = {
  damping: 24,
  stiffness: 220,
  mass: 0.8,
};

interface ScrollStackProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  itemScale?: number;
  itemStackDistance?: number;
  baseScale?: number;
  rotationAmount?: number;
  onCardChange?: (index: number) => void;
  onStackComplete?: () => void;
}

export const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  style,
  itemScale = 0.04,
  itemStackDistance = 12,
  baseScale = 0.90,
  rotationAmount = 10,
  onCardChange,
  onStackComplete,
}) => {
  const styles = createScrollStackStyles();
  const cardArray = Children.toArray(children);
  const totalCards = cardArray.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [measuredCardHeight, setMeasuredCardHeight] = useState<number | null>(null);

  // Single continuous float value representing the scroll position
  const progress = useSharedValue(0);
  const startProgress = useSharedValue(0);

  if (totalCards === 0) {
    return null;
  }

  const handleIndexChange = useCallback(
    (newIndex: number) => {
      setActiveIndex(newIndex);
      onCardChange?.(newIndex);
      if (newIndex === totalCards - 1) {
        onStackComplete?.();
      }
    },
    [onCardChange, onStackComplete, totalCards]
  );

  const goToCard = useCallback(
    (targetIndex: number) => {
      if (totalCards <= 1) return;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}

      const currentNorm = ((Math.round(progress.value) % totalCards) + totalCards) % totalCards;
      let diff = targetIndex - currentNorm;
      if (diff > totalCards / 2) diff -= totalCards;
      if (diff < -totalCards / 2) diff += totalCards;

      const newTarget = Math.round(progress.value) + diff;

      progress.value = withSpring(newTarget, SPRING_CONFIG, (finished) => {
        if (finished) {
          const normalized = ((newTarget % totalCards) + totalCards) % totalCards;
          runOnJS(handleIndexChange)(normalized);
        }
      });
    },
    [totalCards, progress, handleIndexChange]
  );

  const handleCardLayout = useCallback(
    (idx: number, e: LayoutChangeEvent) => {
      const height = e.nativeEvent.layout.height;
      if (height > 0) {
        setMeasuredCardHeight((prev) => {
          if (!prev || Math.abs(prev - height) > 4) {
            return height;
          }
          return prev;
        });
      }
    },
    []
  );

  const panGesture = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onStart(() => {
      startProgress.value = progress.value;
    })
    .onUpdate((e) => {
      // Direct 1:1 real-time drag tracking
      progress.value = startProgress.value - e.translationX / SCREEN_WIDTH;
    })
    .onEnd((e) => {
      const dragDistance = e.translationX;
      const velocity = e.velocityX;

      let target = Math.round(progress.value);

      // Flick or drag distance threshold (15% of screen width)
      if (Math.abs(velocity) > 350) {
        target =
          velocity < 0
            ? Math.floor(startProgress.value) + 1
            : Math.ceil(startProgress.value) - 1;
      } else if (Math.abs(dragDistance) > SCREEN_WIDTH * 0.15) {
        target =
          dragDistance < 0
            ? Math.floor(startProgress.value) + 1
            : Math.ceil(startProgress.value) - 1;
      } else {
        target = Math.round(startProgress.value);
      }

      progress.value = withSpring(target, SPRING_CONFIG, (finished) => {
        if (finished) {
          const normalized = ((target % totalCards) + totalCards) % totalCards;
          runOnJS(handleIndexChange)(normalized);
        }
      });
    });

  // Dynamic height calculation matching exact measured card height + background layer offset
  const stackHeightStyle = measuredCardHeight
    ? { height: measuredCardHeight + itemStackDistance * 1.8 }
    : { minHeight: 410 };

  return (
    <View style={[styles.container, style]}>
      {/* Gesture-Driven Stack with React Bits Physics */}
      <GestureDetector gesture={panGesture}>
        <View style={[styles.stackContainer, stackHeightStyle]}>
          {cardArray.map((child, idx) => (
            <ScrollStackItem
              key={idx}
              index={idx}
              totalCards={totalCards}
              progress={progress}
              itemScale={itemScale}
              itemStackDistance={itemStackDistance}
              baseScale={baseScale}
              rotationAmount={rotationAmount}
              onSelect={() => goToCard(idx)}
              onLayout={(e) => handleCardLayout(idx, e)}
            >
              {child}
            </ScrollStackItem>
          ))}
        </View>
      </GestureDetector>

      {/* Snug Pagination Controls (< 50% gap from before) */}
      {totalCards > 1 && (
        <View style={styles.paginationRow}>
          <TouchableOpacity
            onPress={() => goToCard(activeIndex - 1)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.6}
            style={styles.navArrow}
          >
            <Ionicons name="chevron-back" size={16} color={Colors.grayMuted} />
          </TouchableOpacity>

          {cardArray.map((_, dotIdx) => {
            const isActive = dotIdx === activeIndex;
            return (
              <TouchableOpacity
                key={dotIdx}
                onPress={() => goToCard(dotIdx)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                style={[styles.paginationDot, isActive && styles.paginationDotActive]}
              />
            );
          })}

          <TouchableOpacity
            onPress={() => goToCard(activeIndex + 1)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.6}
            style={styles.navArrow}
          >
            <Ionicons name="chevron-forward" size={16} color={Colors.grayMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ScrollStack;
