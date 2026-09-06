import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type DimensionValue,
} from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';
import { Colors } from '../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const ORBIT_SIZE = Math.min(SCREEN_WIDTH * 0.78, 300);
export const CENTER_SIZE = ORBIT_SIZE * 0.42;
export const BUTTON_SIZE = ORBIT_SIZE * 0.19;

export type OrbitVariant = 'medical' | 'surgical';

export type OrbitSpecialtyNode = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  scientificName?: string;
  description?: string;
};

// 8 standard node positions (0° at top, progressing clockwise by 45°)
export const ORBIT_NODE_POSITIONS: { top: DimensionValue; left: DimensionValue; angleDeg: number }[] = [
  { top: '0%', left: '50%', angleDeg: 0 },       // 0° (North / Top)
  { top: '14.6%', left: '82%', angleDeg: 45 },   // 45° (North-East)
  { top: '50%', left: '95%', angleDeg: 90 },     // 90° (East / Right)
  { top: '85.4%', left: '82%', angleDeg: 135 },  // 135° (South-East)
  { top: '100%', left: '50%', angleDeg: 180 },   // 180° (South / Bottom)
  { top: '85.4%', left: '18%', angleDeg: 225 },  // 225° (South-West)
  { top: '50%', left: '5%', angleDeg: 270 },     // 270° (West / Left)
  { top: '14.6%', left: '18%', angleDeg: 315 },  // 315° (North-West)
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. ORBIT RINGS (BACKGROUND GEOMETRY)
// Medical: Smooth, unbroken, fluid, clinical circular orbits
// Surgical: Double-ring, segmented arcs, precision calibrated ticks, reticle crosshairs
// ─────────────────────────────────────────────────────────────────────────────
interface OrbitRingsProps {
  size?: number;
  variant: OrbitVariant;
}

export const OrbitRings: React.FC<OrbitRingsProps> = ({
  size = ORBIT_SIZE,
  variant,
}) => {
  const center = size / 2;
  const outerRadius = size * 0.49;
  const innerRadius = size * 0.34;
  const hubRadius = size * 0.21;

  if (variant === 'medical') {
    return (
      <Svg
        width={size}
        height={size}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {/* Soft continuous outer glow ring */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke="#a9e4e8"
          strokeWidth={1}
          strokeOpacity={0.06}
          fill="none"
        />

        {/* Clean, continuous outer ring — fluid, clinical, connected */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={1.2}
          fill="none"
        />

        {/* Inner concentric ring — smooth subtle dash */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth={1}
          strokeDasharray="3 5"
          fill="none"
        />
      </Svg>
    );
  }

  // ─── SURGICAL VARIANT: Precision Double-Ring, Segmented Outer Ring & Calibrated Ticks ───
  // Generate 32 radial tick marks around the perimeter (every 11.25°)
  const ticks = [];
  const tickCount = 32;
  for (let i = 0; i < tickCount; i++) {
    const deg = (i * 360) / tickCount;
    const rad = (deg * Math.PI) / 180;
    const isCardinal = deg % 90 === 0;
    const isNodeAxis = deg % 45 === 0;
    const isMajor = deg % 22.5 === 0;

    let tickLength = 2.5;
    let strokeColor = 'rgba(255, 255, 255, 0.12)';
    let strokeWidth = 0.7;

    if (isCardinal) {
      tickLength = 7.5;
      strokeColor = 'rgba(255, 255, 255, 0.45)';
      strokeWidth = 1.4;
    } else if (isNodeAxis) {
      tickLength = 5.5;
      strokeColor = 'rgba(109, 194, 189, 0.6)';
      strokeWidth = 1.2;
    } else if (isMajor) {
      tickLength = 3.5;
      strokeColor = 'rgba(255, 255, 255, 0.22)';
      strokeWidth = 0.9;
    }

    const rStart = outerRadius - tickLength / 2;
    const rEnd = outerRadius + tickLength / 2;

    const x1 = center + rStart * Math.cos(rad);
    const y1 = center + rStart * Math.sin(rad);
    const x2 = center + rEnd * Math.cos(rad);
    const y2 = center + rEnd * Math.sin(rad);

    ticks.push(
      <Line
        key={`tick-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <Svg
      width={size}
      height={size}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {/* 1. Precision secondary outer ring (technical double-ring construction) */}
      <Circle
        cx={center}
        cy={center}
        r={outerRadius + 4}
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth={0.75}
        strokeDasharray="2 4"
        fill="none"
      />

      {/* 2. Main outer segmented ring with controlled precision breaks */}
      <Circle
        cx={center}
        cy={center}
        r={outerRadius}
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth={1.4}
        strokeDasharray="18 8"
        fill="none"
      />

      {/* 3. Subtle teal precision accent segments along the orbit */}
      <Circle
        cx={center}
        cy={center}
        r={outerRadius}
        stroke="#4bc0b8"
        strokeWidth={1.4}
        strokeDasharray="6 20"
        strokeOpacity={0.45}
        fill="none"
      />

      {/* 4. Calibrated radial precision ticks */}
      <G>{ticks}</G>

      {/* 5. Inner technical guide ring */}
      <Circle
        cx={center}
        cy={center}
        r={innerRadius}
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth={1}
        strokeDasharray="4 4"
        fill="none"
      />

      {/* 6. Hub clearance technical circle */}
      <Circle
        cx={center}
        cy={center}
        r={hubRadius + 6}
        stroke="rgba(109, 194, 189, 0.22)"
        strokeWidth={0.8}
        strokeDasharray="2 5"
        fill="none"
      />

      {/* 7. Cardinal reticle crosshairs pointing outward from the hub boundary */}
      {/* Top Crosshair */}
      <Line
        x1={center}
        y1={center - hubRadius - 2}
        x2={center}
        y2={center - innerRadius + 2}
        stroke="rgba(109, 194, 189, 0.35)"
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      {/* Bottom Crosshair */}
      <Line
        x1={center}
        y1={center + hubRadius + 2}
        x2={center}
        y2={center + innerRadius - 2}
        stroke="rgba(109, 194, 189, 0.35)"
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      {/* Left Crosshair */}
      <Line
        x1={center - hubRadius - 2}
        y1={center}
        x2={center - innerRadius + 2}
        y2={center}
        stroke="rgba(109, 194, 189, 0.35)"
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      {/* Right Crosshair */}
      <Line
        x1={center + hubRadius + 2}
        y1={center}
        x2={center + innerRadius - 2}
        y2={center}
        stroke="rgba(109, 194, 189, 0.35)"
        strokeWidth={1}
        strokeDasharray="2 3"
      />
    </Svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ORBIT NODE (INDIVIDUAL SPECIALTY BUTTON)
// Medical: Smooth circular border, soft glow, fluid clinical typography
// Surgical: Calibrated technical frame, precision micro-ticks, crisp operative definition
// ─────────────────────────────────────────────────────────────────────────────
interface OrbitNodeProps {
  specialty: OrbitSpecialtyNode;
  size?: number;
  top: DimensionValue;
  left: DimensionValue;
  variant: OrbitVariant;
  onPress: () => void;
}

export const OrbitNode: React.FC<OrbitNodeProps> = ({
  specialty,
  size = BUTTON_SIZE,
  top,
  left,
  variant,
  onPress,
}) => {
  if (variant === 'medical') {
    return (
      <View
        className="absolute items-center justify-start"
        style={{ top, left, marginTop: -size / 2, width: 120, marginLeft: -60 }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={onPress}
          className="items-center justify-center"
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          activeOpacity={0.75}
        >
          {/* Smooth circular clinical node */}
          <View
            className="border items-center justify-center rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: '#080c0e',
              borderColor: `${specialty.color}45`,
              shadowColor: specialty.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
              elevation: 7,
            }}
          >
            <Ionicons name={specialty.icon} size={19} color={specialty.color} />
          </View>
          <Text
            className="text-[10.5px] font-sans-medium text-gray-200 mt-1.5 text-center leading-tight max-w-[105px]"
            numberOfLines={2}
            allowFontScaling={false}
            style={{ textAlign: 'center', includeFontPadding: false }}
          >
            {specialty.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── SURGICAL VARIANT: Precision Reticle Frame & Operative Micro-Ticks ───
  return (
    <View
      className="absolute items-center justify-start"
      style={{ top, left, marginTop: -size / 2, width: 120, marginLeft: -60 }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        onPress={onPress}
        className="items-center justify-center"
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        activeOpacity={0.75}
      >
        {/* Surgical Precision Frame with micro-ticks and higher structural definition */}
        <View className="relative items-center justify-center">
          {/* Outer subtle alignment guide ring */}
          <View
            className="absolute rounded-full border border-white/10"
            style={{
              width: size + 6,
              height: size + 6,
              borderStyle: 'dashed',
            }}
          />

          {/* Precision Cardinal Micro-Ticks around node */}
          <View className="absolute -top-1 w-1.5 h-[1.5px] bg-white/40 rounded-full" />
          <View className="absolute -bottom-1 w-1.5 h-[1.5px] bg-white/40 rounded-full" />
          <View className="absolute -left-1 h-1.5 w-[1.5px] bg-white/40 rounded-full" />
          <View className="absolute -right-1 h-1.5 w-[1.5px] bg-white/40 rounded-full" />

          {/* Node Core: Deep obsidian surface with crisp specialty border */}
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: '#060a0c',
              borderWidth: 1.5,
              borderColor: `${specialty.color}65`,
              shadowColor: specialty.color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 9,
              elevation: 8,
            }}
          >
            <Ionicons name={specialty.icon} size={19} color={specialty.color} />
          </View>
        </View>

        {/* Structured typography */}
        <Text
          className="text-[10.5px] font-sans-semibold text-gray-200 mt-1.5 text-center leading-tight max-w-[105px] tracking-tight"
          numberOfLines={2}
          allowFontScaling={false}
          style={{ textAlign: 'center', includeFontPadding: false }}
        >
          {specialty.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. ORBIT CENTER HUB
// Medical AI: Dominant Primary focal point in Electric Lime / Mint (#a9e4e8)
// Surgical AI: Sleek technical obsidian surface with precision dual-ring teal border
// ─────────────────────────────────────────────────────────────────────────────
interface OrbitCenterHubProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: OrbitVariant;
  size?: number;
  isPrimaryHub?: boolean;
  onPress: () => void;
}

export const OrbitCenterHub: React.FC<OrbitCenterHubProps> = ({
  title,
  subtitle,
  icon,
  variant,
  size = CENTER_SIZE,
  isPrimaryHub = false,
  onPress,
}) => {
  if (variant === 'medical') {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full items-center justify-center border-4 border-[#010101] z-10 px-2 text-center"
        style={{
          width: size,
          height: size,
          backgroundColor: Colors.main,
          shadowColor: Colors.main,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
        }}
        activeOpacity={0.85}
      >
        <Ionicons name={icon} size={isPrimaryHub ? 26 : 24} color="#010101" />
        <Text
          className="text-[11.5px] font-sans-bold text-[#010101] text-center mt-1 leading-tight max-w-[85px]"
          allowFontScaling={false}
          style={{ textAlign: 'center', includeFontPadding: false }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="text-[9.5px] text-[#010101]/80 font-sans-bold text-center leading-tight mt-0.5"
            allowFontScaling={false}
            style={{ textAlign: 'center', includeFontPadding: false }}
          >
            {subtitle}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  // ─── SURGICAL CENTER HUB: Technical Obsidian & Precision Reticle ───
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full items-center justify-center z-10 text-center"
      style={{
        width: size,
        height: size,
        shadowColor: '#4bc0b8',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 7,
      }}
      activeOpacity={0.85}
    >
      {/* Outer Technical Dashed Ring */}
      <View
        className="absolute rounded-full border border-[#4bc0b8]/40"
        style={{
          width: size + 6,
          height: size + 6,
          borderStyle: 'dashed',
        }}
      />

      {/* 4 Precision Cardinal Reticle Ticks on Hub */}
      <View className="absolute -top-1 w-2 h-[1.5px] bg-[#4bc0b8] rounded-full" />
      <View className="absolute -bottom-1 w-2 h-[1.5px] bg-[#4bc0b8] rounded-full" />
      <View className="absolute -left-1 h-2 w-[1.5px] bg-[#4bc0b8] rounded-full" />
      <View className="absolute -right-1 h-2 w-[1.5px] bg-[#4bc0b8] rounded-full" />

      {/* Hub Core: Obsidian base with crisp surgical teal border */}
      <View
        className="w-full h-full rounded-full items-center justify-center px-2 bg-[#080e11] border-2 border-[#4bc0b8]/80"
      >
        <Ionicons name={icon} size={24} color="#4bc0b8" />
        <Text
          className="text-[11.5px] font-sans-bold text-white text-center mt-1 leading-tight max-w-[85px]"
          allowFontScaling={false}
          style={{ textAlign: 'center', includeFontPadding: false }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="text-[9.5px] text-[#4bc0b8] font-mono font-bold uppercase tracking-wider text-center leading-tight mt-0.5"
            allowFontScaling={false}
            style={{ textAlign: 'center', includeFontPadding: false }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. ORBIT SECTION LABEL / HEADER
// Lightweight visual identifier establishing Medical vs Surgical domain
// Small, compact, aligned with existing typography, visually secondary
// ─────────────────────────────────────────────────────────────────────────────
interface OrbitSectionLabelProps {
  variant: OrbitVariant;
  badgeLabel?: string;
  badgeSubtitle?: string;
  title?: string;
  description?: string;
  isCompactBadgeOnly?: boolean;
}

export const OrbitSectionLabel: React.FC<OrbitSectionLabelProps> = ({
  variant,
  badgeLabel,
  badgeSubtitle,
  title,
  description,
  isCompactBadgeOnly = false,
}) => {
  const isMedical = variant === 'medical';
  const defaultBadgeLabel = isMedical ? 'MEDICAL' : 'SURGICAL';
  const defaultBadgeSubtitle = isMedical ? 'Clinical specialties' : 'Operative specialties';
  const iconName: keyof typeof Ionicons.glyphMap = isMedical ? 'medical' : 'cut';
  const accentColor = isMedical ? '#a9e4e8' : '#4bc0b8';

  if (isCompactBadgeOnly) {
    return (
      <View className="items-center mb-3">
        <View
          className="flex-row items-center gap-1.5 px-3 py-1 rounded-full border"
          style={{
            backgroundColor: `${accentColor}12`,
            borderColor: `${accentColor}30`,
          }}
        >
          <Ionicons name={iconName} size={12} color={accentColor} />
          <Text
            className="text-[10px] font-mono font-bold uppercase tracking-widest"
            style={{ color: accentColor }}
          >
            {badgeLabel || defaultBadgeLabel}
          </Text>
          <View className="w-1 h-1 rounded-full bg-white/20" />
          <Text className="text-[10px] font-sans-medium text-gray-400">
            {badgeSubtitle || defaultBadgeSubtitle}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="items-center mb-6">
      {/* Lightweight Eyebrow Badge */}
      <View
        className="flex-row items-center gap-1.5 mb-2 px-3 py-1 rounded-full border"
        style={{
          backgroundColor: `${accentColor}12`,
          borderColor: `${accentColor}30`,
        }}
      >
        <Ionicons name={iconName} size={12} color={accentColor} />
        <Text
          className="text-[10px] font-mono font-bold uppercase tracking-widest"
          style={{ color: accentColor }}
        >
          {badgeLabel || defaultBadgeLabel}
        </Text>
        <View className="w-1 h-1 rounded-full bg-white/20" />
        <Text className="text-[10px] font-sans-medium text-gray-400">
          {badgeSubtitle || defaultBadgeSubtitle}
        </Text>
      </View>

      {title ? (
        <Text className="text-[19px] font-sans-bold text-white text-center">
          {title}
        </Text>
      ) : null}

      {description ? (
        <Text className="text-[12px] font-sans text-gray-400 text-center mt-1 max-w-[280px]">
          {description}
        </Text>
      ) : null}
    </View>
  );
};
