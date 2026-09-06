import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from "@expo-google-fonts/ibm-plex-sans";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from "@expo-google-fonts/ibm-plex-mono";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

// Catch any splash screen error in release APK
SplashScreen.preventAutoHideAsync().catch(() => {});

// ---------------------------------------------------------------------------
// ErrorBoundary — prevents white-screen-of-death on production APK
// ---------------------------------------------------------------------------
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: "#010101", justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ color: "#f9bac9", fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
            Medical Arena
          </Text>
          <Text style={{ color: "#999", fontSize: 14, textAlign: "center" }}>
            Something went wrong. Please restart the app.
          </Text>
          <Text style={{ color: "#555", fontSize: 11, textAlign: "center", marginTop: 8 }}>
            {this.state.error?.message || "Unknown error"}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlexSans_400Regular: IBMPlexSans_400Regular,
    PlexSans_500Medium: IBMPlexSans_500Medium,
    PlexSans_600SemiBold: IBMPlexSans_600SemiBold,
    PlexSans_700Bold: IBMPlexSans_700Bold,
    PlexMono_400Regular: IBMPlexMono_400Regular,
    PlexMono_500Medium: IBMPlexMono_500Medium,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1500);

    if (fontsLoaded || fontError) {
      clearTimeout(timer);
      SplashScreen.hideAsync().catch(() => {});
    }

    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#010101" }}>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#010101" },
              animation: "fade",
            }}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
