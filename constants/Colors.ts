/**
 * Medical Arena — Design Tokens
 * Single source of truth for color. Consumed by tailwind.config.js
 * and by inline styles (Reanimated, LinearGradient, StatusBar).
 *
 * React Native cannot parse oklch() at runtime, so tokens stay hex —
 * but every token is SPEC'D in OKLCH (comment). scripts/check-colors.js
 * converts back to OKLCH and fails CI if the palette drifts:
 * - neutral ramp: hue spread <= 10° (quiet-teal, H = 220)
 * - specialty scale: L = 0.700 ± 0.005, C = 0.075 (except "more")
 * - text tokens: WCAG >= 4.5:1 vs background
 * - filled accent surfaces: ink text >= 4.5:1
 *
 * System rules (from PRODUCT.md):
 * - Ink on a quiet surface: graphite neutrals carry the app.
 * - Turquoise = current state / primary action only.
 * - Gold = signal/premium marker, used sparingly, sole owner of hue ~79.
 * - Terracotta = clinical caution / warning / destructive, one job only.
 * - Specialty hues share one lightness & chroma; only hue rotates,
 *   so no specialty feels louder than another.
 * - Filled accent surfaces always use ink text, never white.
 */

export const Colors = {
  // Neutral graphite surfaces — quiet-teal ramp (H=225) on deep petrol black
  background: '#091114', // oklch(0.170 0.013 225) deep petrol, OLED-friendly
  deepTeal: '#111b1f', // oklch(0.215 0.017 225)
  tealDark: '#19262b', // oklch(0.260 0.020 225)
  tealMedium: '#243339', // oklch(0.310 0.023 225)
  surfaceHover: '#31434a', // oklch(0.370 0.026 225)

  // Core identity colors
  main: '#a9e4e8',          // Main App Color — Glacier Aqua (oklch 0.880 0.060 202)
  accent: '#a9e4e8',        // Primary highlight / brand action color
  ice: '#defff9',           // Ice Mint — gradient caps & shimmer only, never text
  teal: '#4bc0b8',          // Deep Aqua Teal (oklch 0.740 0.105 189)
  lavender: '#cbc8f5',      // Soft Lavender / Periwinkle (oklch 0.850 0.062 288)
  pink: '#f9bac9',          // Pastel Rose (oklch 0.850 0.075 3)
  lime: '#a9e4e8',          // Mapped to main for backward compatibility

  // Harmonized Gradient & Functional Aliases
  accentBright: '#a9e4e8',
  accentDeep: '#4bc0b8',
  gold: '#cbc8f5',          // Soft Lavender / Periwinkle for signal highlights & badges
  clinicalGold: '#cbc8f5',  // Soft Lavender for secondary clinical badges
  terracotta: '#f9bac9',    // Pastel Rose for alerts, pitfalls, and critical markers
  terracottaDeep: '#d76a87', // oklch(0.660 0.140 5)

  // Text & utility neutrals
  charcoal: '#3e5058', // oklch(0.420 0.026 225)
  grayDark: '#1e2b30', // oklch(0.280 0.020 225)
  grayMuted: '#889598', // oklch(0.660 0.015 215)
  graySubtle: '#78868a', // oklch(0.610 0.018 215)
  textPrimary: '#eef5f5', // oklch(0.965 0.008 195) soft near-white, low glare
  textBody: '#cfdada', // oklch(0.880 0.012 200)
  ink: '#091114', // matches background — text on filled accent surfaces

  // Medicine reference surfaces
  medicineBg: '#223036', // oklch(0.300 0.022 225)
  medicineCard: '#0c1519', // oklch(0.190 0.015 225)

  // Composer / floating islands
  islandBg: '#0e181c', // oklch(0.200 0.016 225)
  tabIslandBg: '#0b1316', // oklch(0.180 0.014 225)

  // Specialty palette — one lightness (L=0.700), one chroma (C=0.075), hue rotates.
  // Pulmonology shares the accent hue; `more` is the neutral overflow slot.
  specialty: {
    cardiology: '#c78b98',   // oklch(0.7 0.075 5)   dusty rose
    git: '#a9a069',          // oklch(0.7 0.075 100)  olive
    infectious: '#86aa7e',   // oklch(0.7 0.075 140)  sage
    neurology: '#7fa1cd',    // oklch(0.7 0.075 255)  steel periwinkle
    dermatology: '#c88e7f',  // oklch(0.7 0.075 35)   clay
    obgyn: '#b490bc',        // oklch(0.7 0.075 320)  mauve
    pulmonology: '#62adb2',  // oklch(0.7 0.075 202)  glacier aqua (accent hue)
    more: '#98a0a3',         // oklch(0.7 0.010 225)  neutral
  },
} as const;

export type SpecialtyKey = keyof typeof Colors.specialty;

