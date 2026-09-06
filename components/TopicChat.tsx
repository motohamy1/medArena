import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Alert,
  Animated as RNAnimated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { aiService, Citation } from "../services/aiService";
import { SPECIALTY_KNOWLEDGE, TopicItem } from "../constants/SpecialtyData";
import { Colors } from "../constants/Colors";
import FormattedClinicalText from "./FormattedClinicalText";
import { KnowledgeMap } from "./KnowledgeMap";
import { useKeyboardLift } from "../hooks/useKeyboardLift";

const EASE_HEAVY = Easing.bezier(0.32, 0.72, 0, 1);

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  citations?: Citation[];
  suggestions?: string[];
  isError?: boolean;
  failedQuery?: string;
};

type MedicalSection = {
  heading: string;
  content: string;
};

function parseMedicalSections(text: string): {
  hasSections: boolean;
  sections: MedicalSection[];
  plainText: string;
} {
  // 1. Try ##HEADING## format
  if (text.includes('##')) {
    const parts = text.split(/##(.*?)##/);
    const sections: MedicalSection[] = [];
    let plainText = parts[0]?.trim() || "";

    for (let i = 1; i < parts.length; i += 2) {
      const heading = parts[i]?.trim();
      let content = parts[i + 1] || "";
      content = content.replace(/##END##/gi, "").trim();

      if (heading && heading !== "END" && heading !== "SUGGESTIONS") {
        sections.push({ heading, content });
      }
    }

    if (sections.length > 0) {
      return { hasSections: true, sections, plainText };
    }
  }

  // 2. Try explicit markdown headings (### Heading or ## Heading)
  const mdHeadingRegex = /(?:^|\n)###?\s*([A-Za-z0-9\u0600-\u06FF\s/&,–—\(\):-]+?)\s*\n/g;
  const matches = [...text.matchAll(mdHeadingRegex)];
  if (matches.length >= 2) {
    const sections: MedicalSection[] = [];
    for (let i = 0; i < matches.length; i++) {
      const heading = matches[i][1].replace(/[*_#]/g, '').trim();
      const startIndex = matches[i].index! + matches[i][0].length;
      const endIndex = i + 1 < matches.length ? matches[i + 1].index! : text.length;
      const content = text.slice(startIndex, endIndex).trim();
      if (heading && content && heading.length <= 60) {
        sections.push({ heading, content });
      }
    }
    if (sections.length > 0) {
      return { hasSections: true, sections, plainText: "" };
    }
  }

  // If no explicit structured sections were requested/created, retain as single cohesive response
  return {
    hasSections: false,
    sections: [],
    plainText: text,
  };
}

const SECTION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "DEFINITION": "book-outline",
  "DEFINITION & OVERVIEW": "book-outline",
  "DEFINITION & CRITERIA": "book-outline",
  "DEFINITION & CLASSIFICATION": "book-outline",
  "CLINICAL ASSESSMENT": "clipboard-outline",
  "CLINICAL PICTURE": "eye-outline",
  "PRESENTATION": "eye-outline",
  "DIFFERENTIAL DIAGNOSIS": "git-branch-outline",
  "INVESTIGATIONS": "pulse-outline",
  "INVESTIGATIONS / WORKUP": "pulse-outline",
  "DIAGNOSTIC CRITERIA": "checkmark-done-circle-outline",
  "MANAGEMENT PROTOCOL": "medical-outline",
  "MANAGEMENT & PHARMACOTHERAPY": "medical-outline",
  "FIRST-LINE PHARMACOTHERAPY": "medical-outline",
  "PEDIATRIC SAFETY & CONTRAINDICATIONS": "warning-outline",
  "RECOMMENDED REGIMEN & DOSING": "flask-outline",
  "PHARMACOTHERAPY & DOSING": "flask-outline",
  "STEP-UP PROTOCOL": "trending-up-outline",
  "CLINICAL PEARLS": "sparkles-outline",
  "CLINICAL PEARLS & PITFALLS": "sparkles-outline",
  "KEY POINTS": "bulb-outline",
  "RED FLAGS / EMERGENCY": "alert-circle-outline",
  "EMERGENCY PROTOCOL & RED FLAGS": "warning-outline",
  "SURGICAL / PROCEDURAL CONSIDERATIONS": "cut-outline",
  "GREETING": "chatbubble-ellipses-outline",
};

function getSectionIcon(heading: string): keyof typeof Ionicons.glyphMap {
  const upper = heading.toUpperCase().trim();
  if (SECTION_ICONS[upper]) return SECTION_ICONS[upper];
  if (upper.includes("DOSE") || upper.includes("DOSING") || upper.includes("PHARMA") || upper.includes("DRUG") || upper.includes("جرعة") || upper.includes("علاج")) return "flask-outline";
  if (upper.includes("EMERGENCY") || upper.includes("FLAG") || upper.includes("CRITICAL") || upper.includes("طوارئ") || upper.includes("تحذير")) return "alert-circle-outline";
  if (upper.includes("DIAGNOS") || upper.includes("CRITERIA") || upper.includes("SCORE") || upper.includes("تشخيص")) return "checkmark-done-circle-outline";
  if (upper.includes("INVEST") || upper.includes("LAB") || upper.includes("WORKUP") || upper.includes("تحاليل") || upper.includes("فحوصات")) return "pulse-outline";
  if (upper.includes("PEDIATRIC") || upper.includes("CHILD") || upper.includes("أطفال")) return "happy-outline";
  if (upper.includes("PREGNAN") || upper.includes("حمل")) return "female-outline";
  return "document-text-outline";
}

// Animated Thinking Wave
const ThinkingIndicator: React.FC<{ themeColor: string }> = ({ themeColor }) => {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const wave = () =>
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: EASE_HEAVY }),
          withTiming(0.3, { duration: 400, easing: EASE_HEAVY }),
        ),
        -1,
        true,
      );

    dot1.value = wave();
    const t2 = setTimeout(() => (dot2.value = wave()), 150);
    const t3 = setTimeout(() => (dot3.value = wave()), 300);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [dot1, dot2, dot3]);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <Animated.View
      entering={FadeInDown.duration(200).easing(EASE_HEAVY)}
      className="flex-row items-center gap-3 px-4 py-3 mb-4"
    >
      <View
        className="w-7 h-7 rounded-full items-center justify-center border"
        style={{
          backgroundColor: `${themeColor}15`,
          borderColor: `${themeColor}35`,
        }}
      >
        <Ionicons name="sparkles" size={13} color={themeColor} />
      </View>
      <View className="flex-row items-center gap-1.5 bg-[#0e1416] border border-white/10 px-4 py-2.5 rounded-3xl rounded-tl-md">
        <Text className="text-gray-400 text-xs font-sans-medium mr-1">Consulting knowledge base</Text>
        <Animated.View className="w-1.5 h-1.5 rounded-full" style={[{ backgroundColor: themeColor }, s1]} />
        <Animated.View className="w-1.5 h-1.5 rounded-full" style={[{ backgroundColor: themeColor }, s2]} />
        <Animated.View className="w-1.5 h-1.5 rounded-full" style={[{ backgroundColor: themeColor }, s3]} />
      </View>
    </Animated.View>
  );
};

// AI Message Bubble with Centered Response & Map Tabs
const TopicAiMessageItem: React.FC<{
  item: Message;
  topicName: string;
  themeColor: string;
  specialty: any;
  topicData: any;
  onAskAi: (query: string) => void;
  onCopyText: (text: string) => void;
}> = ({ item, topicName, themeColor, specialty, topicData, onAskAi, onCopyText }) => {
  const [responseTab, setResponseTab] = useState<'response' | 'map'>('response');
  const { hasSections, sections, plainText } = useMemo(
    () => parseMedicalSections(item.text),
    [item.text]
  );

  const responseTopicItem = useMemo<TopicItem>(() => {
    if (sections.length > 0) {
      const firstHeading = sections[0].heading.replace(/[*_#]/g, '').trim();
      return {
        id: `ai-resp-${item.id}`,
        title: topicName || firstHeading || 'Clinical Response',
        subtitle: 'Dynamic Inquiry Map',
        type: 'AI Knowledge Graph',
        aiScopeDescription: '',
        clinicalContent: sections.map((s) => ({
          title: s.heading,
          content: s.content,
        })),
      };
    }

    if (topicData && topicData.clinicalContent && topicData.clinicalContent.length > 0) {
      return topicData;
    }

    return {
      id: `ai-resp-${item.id}`,
      title: topicName || 'Clinical Response',
      subtitle: 'Dynamic Inquiry Map',
      type: 'AI Knowledge Graph',
      aiScopeDescription: '',
      clinicalContent: [
        { title: 'Clinical Assessment', content: item.text.slice(0, 250) },
        { title: 'Key Protocol', content: item.text.slice(250, 500) || item.text },
      ],
    };
  }, [topicData, topicName, item.id, item.text, sections]);

  return (
    <Animated.View
      entering={FadeInUp.duration(250).easing(EASE_HEAVY)}
      className="mb-6 px-4 w-full"
    >
      {/* Centered Segmented Response | Map Switcher */}
      <View className="flex-row justify-center items-center mb-3">
        <View className="flex-row bg-[#151c1f] p-1 rounded-full border border-white/10 shadow-sm">
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setResponseTab('response');
            }}
            className={`px-4 py-1.5 rounded-full flex-row items-center gap-1.5 ${
              responseTab === 'response' ? 'bg-white/15' : ''
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name="document-text-outline"
              size={13}
              color={responseTab === 'response' ? themeColor : '#8e8e93'}
            />
            <Text
              className={`text-xs font-sans-semibold ${
                responseTab === 'response' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Response
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setResponseTab('map');
            }}
            className={`px-4 py-1.5 rounded-full flex-row items-center gap-1.5 ${
              responseTab === 'map' ? 'bg-white/15' : ''
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name="git-network-outline"
              size={13}
              color={responseTab === 'map' ? themeColor : '#8e8e93'}
            />
            <Text
              className={`text-xs font-sans-semibold ${
                responseTab === 'map' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content: Seamless Map Tab vs Response Tab */}
      {responseTab === 'map' ? (
        <View
          style={{
            height: 420,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#010101',
          }}
        >
          <KnowledgeMap
            topic={responseTopicItem}
            specialty={specialty}
            themeColor={themeColor}
            onAskAi={onAskAi}
          />
        </View>
      ) : (
        <>
          {/* Header Badge */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View
                className="w-6 h-6 rounded-full items-center justify-center border"
                style={{
                  backgroundColor: `${themeColor}20`,
                  borderColor: `${themeColor}40`,
                }}
              >
                <Ionicons name="sparkles" size={12} color={themeColor} />
              </View>
              <Text className="text-white text-xs font-sans-bold">{topicName} AI</Text>
              <View className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10">
                <Text className="text-[10px] font-sans-semibold" style={{ color: themeColor }}>
                  Scoped RAG
                </Text>
              </View>
            </View>
            <Text className="text-gray-500 text-[10px] font-mono">{item.timestamp}</Text>
          </View>

          {/* Structured Medical Cards or Unified Direct Answer Card */}
          {hasSections ? (
            <View className="gap-2.5">
              {plainText.length > 0 && (
                <View className="bg-[#0e1416] border border-white/10 rounded-2xl p-4">
                  <FormattedClinicalText text={plainText} />
                </View>
              )}
              {sections.map((sec, sIdx) => {
                const iconName = getSectionIcon(sec.heading);

                return (
                  <View
                    key={`topic-sec-${sIdx}`}
                    className="rounded-2xl overflow-hidden bg-[#0e1416] border"
                    style={{
                      borderColor: `${themeColor}35`,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <View
                      className="flex-row items-center gap-2 px-4 py-2.5 border-b"
                      style={{
                        backgroundColor: `${themeColor}12`,
                        borderBottomColor: `${themeColor}25` ,
                      }}
                    >
                      <Ionicons name={iconName} size={15} color={themeColor} />
                      <Text
                        className="text-xs font-sans-bold uppercase tracking-wider flex-1"
                        style={{ color: themeColor }}
                      >
                        {sec.heading}
                      </Text>
                    </View>
                    <View className="p-4">
                      <FormattedClinicalText text={sec.content} />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View
              className="rounded-2xl overflow-hidden bg-[#0e1416] border"
              style={{
                borderColor: `${themeColor}30`,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View
                className="flex-row items-center justify-between px-4 py-2 border-b"
                style={{
                  backgroundColor: `${themeColor}10`,
                  borderBottomColor: `${themeColor}20`,
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="medical" size={13} color={themeColor} />
                  <Text
                    className="text-[11px] font-sans-bold uppercase tracking-wider"
                    style={{ color: themeColor }}
                  >
                    Clinical Summary
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onCopyText(item.text)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="opacity-70 active:opacity-100"
                >
                  <Ionicons name="copy-outline" size={13} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              <View className="p-4">
                <FormattedClinicalText text={item.text} />
              </View>
            </View>
          )}

          {/* Citations Section */}
          {item.citations && item.citations.length > 0 && (
            <View className="mt-3.5 pt-3 border-t border-white/5">
              <View className="flex-row items-center gap-1.5 mb-2 ml-1">
                <Ionicons name="book-outline" size={12} color={Colors.lavender} />
                <Text className="text-gray-400 text-[10px] font-sans-bold uppercase tracking-wider">
                  Guidelines & Citations
                </Text>
              </View>
              {item.citations.map((cit) => (
                <View
                  key={cit.id}
                  className="bg-[#0e1416] border border-white/10 rounded-xl p-3 mb-2"
                >
                  <View className="flex-row items-start gap-2">
                    <View className="px-1.5 py-0.5 rounded-full bg-lavender/20 mt-0.5">
                      <Text className="text-[10px] text-lavender font-sans-bold">[{cit.id}]</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-200 text-xs font-sans-semibold leading-4 mb-0.5">
                        {cit.title}
                      </Text>
                      <Text className="text-gray-400 text-[10px] font-sans-medium">
                        {cit.journal} ({cit.year}) · {cit.author}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Follow-Up Suggestions */}
          {item.suggestions && item.suggestions.length > 0 && (
            <View className="mt-3.5 mb-1">
              <View className="flex-row items-center gap-1.5 mb-2 ml-1">
                <Ionicons name="sparkles" size={12} color={themeColor} />
                <Text className="text-gray-400 text-[10px] font-sans-bold uppercase tracking-wider">
                  Follow-Up Inquiries
                </Text>
              </View>
              <View className="gap-2">
                {item.suggestions.map((sug, sIdx) => (
                  <TouchableOpacity
                    key={`topic-sug-${sIdx}`}
                    onPress={() => onAskAi(sug)}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#0e1416] border border-white/10 active:opacity-60"
                  >
                    <Ionicons name="arrow-forward-circle" size={14} color={themeColor} />
                    <Text className="text-gray-200 text-xs font-sans-medium leading-4 flex-1">
                      {sug}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Action Island */}
          <View className="flex-row items-center gap-4 mt-3 ml-2">
            <TouchableOpacity
              onPress={() => onCopyText(item.text)}
              className="flex-row items-center gap-1.5"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="copy-outline" size={12} color="#6b7280" />
              <Text className="text-gray-500 text-[11px] font-sans-medium">Copy</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Animated.View>
  );
};

interface TopicChatProps {
  specialtyId: string;
  topicId: string;
  topicName: string;
  themeColor?: string;
  initialQuery?: string;
  categoryContext?: string;
  onClose?: () => void;
}

export default function TopicChat({
  specialtyId,
  topicId,
  topicName,
  themeColor: propThemeColor,
  initialQuery,
  categoryContext,
  onClose,
}: TopicChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const {
    keyboardHeight,
    manualLift,
    liftAnim: keyboardHeightAnim,
    containerProps,
  } = useKeyboardLift();
  const flatListRef = useRef<FlatList>(null);
  const lastSentQueryRef = useRef<string | null>(null);

  // Jump arrow scroll tracking
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const offsetY = contentOffset.y;
    const contentHeight = contentSize.height;
    const layoutHeight = layoutMeasurement.height;

    setShowScrollTop(offsetY > 240);
    const distanceFromBottom = contentHeight - offsetY - layoutHeight;
    setShowScrollBottom(distanceFromBottom > 240 && messages.length >= 2);
  };

  const scrollToTop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const scrollToBottom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const specialty = SPECIALTY_KNOWLEDGE[specialtyId] || {
    title: "Specialty",
    color: "#4bc0b8",
    categories: [],
  };

  const themeColor = propThemeColor || specialty.color || "#4bc0b8";

  // Find topic subtitle & starter prompts
  let topicData: any = null;
  for (const cat of specialty.categories || []) {
    const found = (cat.topics || []).find((t: any) => t.id === topicId);
    if (found) {
      topicData = found;
      break;
    }
  }

  const starterPrompts = [
    `What are the first-line treatment guidelines for ${topicName}?`,
    `Diagnostic criteria and required workup for ${topicName}`,
    `Dosages and contraindications in ${topicName}`,
  ];

  const handleCopyText = async (text: string) => {
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(text);
      Alert.alert("Copied", "Clinical response copied to clipboard.");
    } catch {
      Alert.alert("Copy", "Unable to copy text.");
    }
  };

  const handleTextSend = async (queryOverride?: string) => {
    const query = (queryOverride || inputText).trim();
    if (!query) return;
    if (!queryOverride) setInputText("");
    setIsTyping(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: query,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    
    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);

    try {
      const { reply, citations, suggestions } = await aiService.sendMessageByText(
        query,
        "general",
        specialtyId as any,
        topicId,
        categoryContext,
        currentHistory.map((m) => ({ text: m.text, isUser: m.isUser }))
      );

      // Check for Out-of-Scope flag from the AI
      if (reply.includes("##OUT_OF_SCOPE##")) {
        const cleanReply = reply.replace("##OUT_OF_SCOPE##", "").trim();
        Alert.alert(
          "Out of Topic Scope",
          `${cleanReply}\n\nWould you like to search in the general clinical hub?`,
          [
            { text: "Stay Here", style: "cancel" },
            {
              text: "Go to General Chat",
              onPress: () => {
                router.push({
                  pathname: "/(tabs)/ChatTab",
                  params: { query },
                });
              },
            },
          ]
        );
      } else {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: reply,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          citations,
          suggestions,
        };
        setMessages((prev) => [...prev, aiMessage]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble with the clinical AI model right now. Please try again.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
        failedQuery: query,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (initialQuery && initialQuery.trim() && initialQuery !== lastSentQueryRef.current) {
      lastSentQueryRef.current = initialQuery;
      handleTextSend(initialQuery);
    }
  }, [initialQuery]);

  const renderMessageItem = ({ item }: { item: Message }) => {
    if (item.isUser) {
      return (
        <Animated.View
          entering={FadeInDown.duration(200).easing(EASE_HEAVY)}
          className="self-end max-w-[85%] mb-4 px-4"
        >
          <View
            className="rounded-3xl rounded-tr-md px-4 py-3 border"
            style={{
              backgroundColor: `${themeColor}22`,
              borderColor: `${themeColor}45`,
            }}
          >
            <Text className="text-white text-sm font-sans-medium leading-5">{item.text}</Text>
          </View>
          <Text className="text-gray-500 text-[10px] font-mono self-end mt-1">{item.timestamp}</Text>
        </Animated.View>
      );
    }

    if (item.isError) {
      return (
        <View className="mb-4 px-4 w-full">
          <View className="bg-[#1a0e0e] border border-red-900/40 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-1.5">
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text className="text-red-400 text-xs font-sans-bold">Inquiry Failed</Text>
            </View>
            <Text className="text-gray-300 text-xs font-sans leading-5">{item.text}</Text>
            {item.failedQuery && (
              <TouchableOpacity
                onPress={() => handleTextSend(item.failedQuery)}
                className="mt-3 flex-row items-center gap-1.5 self-start px-3 py-1.5 rounded-full bg-red-950/40 border border-red-800/40"
              >
                <Ionicons name="refresh" size={12} color="#fca5a5" />
                <Text className="text-red-300 text-xs font-sans-semibold">Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return (
      <TopicAiMessageItem
        item={item}
        topicName={topicName}
        themeColor={themeColor}
        specialty={specialty}
        topicData={topicData}
        onAskAi={handleTextSend}
        onCopyText={handleCopyText}
      />
    );
  };

  return (
    <View style={{ flex: 1 }} {...containerProps}>
      <View className="flex-1 bg-background">
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={renderMessageItem}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-8 px-6">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4 border"
                style={{
                  backgroundColor: `${themeColor}15`,
                  borderColor: `${themeColor}35`,
                }}
              >
                <Ionicons name="chatbubbles" size={28} color={themeColor} />
              </View>
              <Text className="text-white text-lg font-sans-bold text-center mb-1">
                Ask {topicName} Assistant
              </Text>
              <Text className="text-gray-400 text-xs font-sans text-center leading-5 mb-6">
                Inquire on specific diagnostic criteria, pharmacological dosages, emergency protocols, or view the visual knowledge map.
              </Text>

              <View className="w-full gap-2.5">
                <Text className="text-gray-500 text-[11px] font-sans-bold uppercase tracking-wider ml-1">
                  Suggested Inquiries
                </Text>
                {starterPrompts.map((prompt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleTextSend(prompt)}
                    className="bg-[#0e1416] border border-white/10 p-3.5 rounded-2xl flex-row items-center justify-between active:opacity-70"
                  >
                    <Text className="text-gray-200 text-xs font-sans-medium flex-1 mr-2">{prompt}</Text>
                    <Ionicons name="arrow-forward" size={14} color={themeColor} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          ListFooterComponent={isTyping ? <ThinkingIndicator themeColor={themeColor} /> : null}
        />

        {/* Floating Jump to Top & Jump to Bottom Arrows */}
        <View
          style={[
            styles.jumpControlsContainer,
            {
              bottom: keyboardHeight > 0 ? manualLift + 65 : 75,
            },
          ]}
          pointerEvents="box-none"
        >
          {showScrollTop && (
            <TouchableOpacity
              onPress={scrollToTop}
              activeOpacity={0.8}
              style={[styles.jumpArrowBtn, { borderColor: `${themeColor}60` }]}
            >
              <Ionicons name="chevron-up" size={18} color={themeColor} />
            </TouchableOpacity>
          )}

          {showScrollBottom && (
            <TouchableOpacity
              onPress={scrollToBottom}
              activeOpacity={0.8}
              style={[styles.jumpArrowBtn, { borderColor: `${themeColor}60` }]}
            >
              <Ionicons name="chevron-down" size={18} color={themeColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Input Bar - lifts above keyboard using real keyboard height */}
        <RNAnimated.View
          className="px-4 pt-2.5 pb-4 border-t border-white/5 bg-background flex-row items-center gap-2"
          style={{ marginBottom: keyboardHeightAnim }}
        >
          <View
            className="flex-1 flex-row items-center bg-[#0e1416] border border-white/10 rounded-2xl px-4 py-2.5"
            style={{
              minHeight: 52,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={`Ask about ${topicName}...`}
              placeholderTextColor="#6b7280"
              className="flex-1 text-white text-[15px] font-sans py-1 leading-5"
              returnKeyType="send"
              onSubmitEditing={() => handleTextSend()}
              editable={!isTyping}
              multiline
              submitBehavior="newline"
              textAlignVertical="top"
              style={{ maxHeight: 120 }}
            />
          </View>
          <TouchableOpacity
            onPress={() => handleTextSend()}
            disabled={!inputText.trim() || isTyping}
            className="w-10 h-10 rounded-xl items-center justify-center active:opacity-75"
            style={{
              backgroundColor: inputText.trim() && !isTyping ? themeColor : "#1a2228",
              borderWidth: 1,
              borderColor: inputText.trim() && !isTyping ? `${themeColor}60` : "rgba(255, 255, 255, 0.05)",
            }}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={inputText.trim() && !isTyping ? "#010101" : "#4b5563"}
            />
          </TouchableOpacity>
        </RNAnimated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jumpControlsContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 50,
    gap: 8,
    alignItems: 'center',
  },
  jumpArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0c1619',
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
});
