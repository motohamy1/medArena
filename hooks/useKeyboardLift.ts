import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Dimensions,
  Keyboard,
  LayoutChangeEvent,
  Platform,
} from 'react-native';

/**
 * Tracks keyboard presence and returns the *remaining* lift the UI must apply
 * manually on top of the current window.
 *
 * The lift is the real overlap between the bottom of the measured container
 * (via onLayout — works under Android edge-to-edge where `Dimensions` can be
 * stale) and the reported top of the keyboard (`endCoordinates.screenY`):
 *
 *   - iOS (keyboard overlays the app):   lift = full keyboard height
 *   - Android `adjustResize` in effect:  lift = 0 (the surface already ends at
 *     the keyboard top — adding the keyboard height again would fling the
 *     input bar to the top of the screen)
 *
 * Spread `containerProps` onto the screen's root View so the hook can observe
 * how the OS resizes the surface.
 */
export function useKeyboardLift() {
  const liftAnim = useMemo(() => new RNAnimated.Value(0), []);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [manualLift, setManualLift] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const containerHeight = useRef(Dimensions.get('window').height);
  const lastKeyboardY = useRef<number | null>(null);
  const visibleRef = useRef(false);

  const applyLift = useCallback(
    (value: number, duration: number) => {
      setManualLift(value);
      RNAnimated.timing(liftAnim, {
        toValue: value,
        duration,
        useNativeDriver: false,
      }).start();
    },
    [liftAnim]
  );

  const recompute = useCallback(() => {
    if (!visibleRef.current || lastKeyboardY.current == null) return;
    const overlap = Math.max(0, containerHeight.current - lastKeyboardY.current);
    applyLift(overlap, 100);
  }, [applyLift]);

  const onContainerLayout = useCallback(
    (e: LayoutChangeEvent) => {
      containerHeight.current = e.nativeEvent.layout.height;
      // Android resizes the surface for the IME *after* keyboardDidShow;
      // re-clamp the lift so we never double-compensate.
      recompute();
    },
    [recompute]
  );

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const kb = e.endCoordinates?.height ?? 0;
      const keyboardY =
        e.endCoordinates?.screenY ??
        containerHeight.current - kb;
      const wasVisible = visibleRef.current;
      visibleRef.current = true;
      lastKeyboardY.current = keyboardY;
      setIsKeyboardVisible(true);
      setKeyboardHeight(kb);
      const overlap = Math.max(0, containerHeight.current - keyboardY);
      applyLift(
        overlap,
        wasVisible ? 100 : Platform.OS === 'ios' ? 250 : 80
      );
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      visibleRef.current = false;
      lastKeyboardY.current = null;
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
      applyLift(0, Platform.OS === 'ios' ? 200 : 80);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [applyLift]);

  return {
    keyboardHeight,
    manualLift,
    liftAnim,
    isKeyboardVisible,
    containerProps: { onLayout: onContainerLayout },
  };
}
