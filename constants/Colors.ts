/**
 * Medical Arena — Design Tokens
 * Single source of truth for color. Consumed by tailwind.config.js and by
 * inline styles (Reanimated, LinearGradient, StatusBar).
 *
 * THEME: "Riso" — a near-black canvas carrying saturated block cards, with
 * hard ink outlines, ink text on every bright fill, and a handful of screens
 * that swap the canvas for sage / paper / periwinkle.
 *
 * Reading of the reference (this is the part that matters):
 *   The dark canvas is the app's CHROME. Most screens sit on near-black and
 *   float bright riso blocks on top of it. Sage, paper and periwinkle are not
 *   "the theme" — they are per-SCREEN canvases, used once or twice each. The
 *   blocks keep the same saturated color wherever they land.
 *
 * Three layers, strict downward dependency:
 *   palette   (primitive ramps — never referenced by components)
 *     └─ Colors (semantic roles — what components consume)
 *          └─ legacy aliases (old dark-theme names, re-pointed so call sites survive)
 *
 * React Native cannot parse oklch() at runtime, so tokens ship as hex — but
 * every primitive is SPEC'D in OKLCH (trailing comment). scripts/check-colors.js
 * loads this module, converts the hex back to OKLCH, and fails CI if either:
 *   - the hex no longer round-trips to its stated spec, or
 *   - a structural rule below is violated.
 *
 * System rules:
 *   1. Canvas is night. Blocks are saturated. The contrast between them is the
 *      entire design — never mute a block to "match" the canvas.
 *   2. Ink text on every bright fill (-100..-500 stops). Paper text on -700/
 *      -800 stops. That inversion is the signature; never mix them.
 *   3. -800 stops are text-on-LIGHT. Marigold has no -800: yellow is a block
 *      fill and is never a text color. Warning text uses amber instead.
 *   4. Four hue bands own the loud colors: coral 30°, marigold 88°, moss 150°,
 *      periwinkle 285°. Specialties rotate hue but must clear every band by
 *      >= 15°, so a chip can never read as an action.
 *   5. The specialty scale locks L=0.750 / C=0.125 — only hue rotates.
 *   6. Depth is a hard offset outline, not a blurred shadow.
 *   7. Tinted panels (nightPeri, nightCoral, …) are dark surfaces carrying an
 *      accent's hue cast. They stay below the blocks in chroma so a panel never
 *      competes with the block sitting on it.
 */

// ---------------------------------------------------------------------------
// PRIMITIVES
// ---------------------------------------------------------------------------
export const palette = {
  // Night — the neutral axis of the dark canvas. Higher stop = lighter.
  // Carries every surface, every hairline, and all text on dark. Neutral with
  // a whisper of cool so it reads as black, not the retired petrol-teal. H=265.
  night: {
    950: '#08090B', // oklch(0.140 0.005 265)  <- app canvas
    900: '#111316', // oklch(0.185 0.007 265)  <- sunken
    850: '#1A1C20', // oklch(0.225 0.009 265)  <- primary card
    800: '#23262B', // oklch(0.268 0.011 265)  <- cardTint / input
    700: '#30333A', // oklch(0.320 0.013 265)  <- raised / hover
    600: '#40444C', // oklch(0.385 0.015 265)  <- hairline
    500: '#535862', // oklch(0.460 0.017 265)  <- hairline strong
    400: '#818692', // oklch(0.620 0.019 265)  <- disabled text (4.7:1 even on card)
    300: '#8C92A0', // oklch(0.660 0.021 265)  <- subtle text
    200: '#ABB1BE', // oklch(0.760 0.020 265)  <- muted text
    100: '#CCD1DC', // oklch(0.860 0.016 265)  <- secondary text
    50: '#E8EBF2', // oklch(0.940 0.010 265)  <- primary text
  },

  // Ink — the blacks. Used as TEXT on bright blocks, and as the hard outline.
  ink: {
    0: '#000000', // oklch(0.000 0.000 265)  <- outlines + offset shadows
    700: '#14181A', // oklch(0.205 0.008 240)
    900: '#050708', // oklch(0.125 0.006 240)  <- text on every bright fill
  },

  // Tinted dark panels — a night surface carrying an accent's hue cast.
  // Chroma is capped well below the blocks so panels never compete with them.
  nightperi: {
    900: '#141229', // oklch(0.200 0.045 285)
    800: '#1D1C34', // oklch(0.240 0.045 285)
    700: '#27263E', // oklch(0.280 0.045 285)
  },
  nightcoral: {
    900: '#270D09', // oklch(0.200 0.045 30)
    800: '#321612', // oklch(0.240 0.045 30)
    700: '#3C201B', // oklch(0.280 0.045 30)
  },
  nightmarigold: {
    900: '#1B1508', // oklch(0.200 0.026 88)
    800: '#241F11', // oklch(0.240 0.026 88)
    700: '#2E281A', // oklch(0.280 0.026 88)
  },
  nightmoss: {
    900: '#0C1A0F', // oklch(0.200 0.030 150)
    800: '#152318', // oklch(0.240 0.030 150)
    700: '#1E2D21', // oklch(0.280 0.030 150)
  },
  nightsage: {
    900: '#0D1911', // oklch(0.200 0.024 155)
    800: '#16231A', // oklch(0.240 0.024 155)
    700: '#1F2C24', // oklch(0.280 0.024 155)
  },

  // Sage — dusty green. A per-screen canvas (Reports, Operational Timing) and a
  // quiet block fill. H=155.
  sage: {
    25: '#EBF2ED', // oklch(0.955 0.010 155)
    50: '#E0EBE3', // oklch(0.930 0.016 155)
    100: '#D2E1D6', // oklch(0.895 0.022 155)
    200: '#BFD2C4', // oklch(0.845 0.028 155)  <- sage screen canvas
    300: '#ADC3B3', // oklch(0.795 0.032 155)
    400: '#95AB9B', // oklch(0.720 0.034 155)
    500: '#7A9080', // oklch(0.630 0.034 155)
    600: '#4E6053', // oklch(0.470 0.030 155)
  },

  // Paper — warm off-white card stock. A per-screen canvas (Revenue) and the
  // brightest block. Never #FFFFFF; the riso substrate is always warm. H=95.
  paper: {
    0: '#FBFAF6', // oklch(0.985 0.006 95)
    50: '#F5F3EC', // oklch(0.965 0.010 95)
    100: '#F0EDE3', // oklch(0.945 0.014 95)
    200: '#E3E0D3', // oklch(0.905 0.018 95)
    300: '#D3CFC1', // oklch(0.855 0.020 95)
    400: '#BEBBAD', // oklch(0.790 0.020 95)
  },

  // Coral — primary action and danger. The loudest hue in the system. H=30.
  coral: {
    100: '#F9E2DE', // oklch(0.930 0.026 30)
    200: '#F3C2BA', // oklch(0.855 0.057 30)
    300: '#EB988A', // oklch(0.760 0.103 30)
    500: '#F05C4A', // oklch(0.665 0.185 30)  <- filled primary block
    700: '#A32E21', // oklch(0.480 0.155 30)
    800: '#992418', // oklch(0.450 0.155 30)  <- danger text on light
  },

  // Periwinkle — secondary accent, AI surfaces, current state. Also a per-screen
  // canvas (Categories). H=285.
  periwinkle: {
    100: '#E6E6F8', // oklch(0.930 0.025 285)
    200: '#CDCDF3', // oklch(0.860 0.052 285)
    300: '#B0AFEB', // oklch(0.775 0.086 285)
    500: '#877BF4', // oklch(0.650 0.175 285)  <- filled secondary block
    700: '#554BA5', // oklch(0.470 0.140 285)
    800: '#4F439D', // oklch(0.445 0.140 285)  <- info text on light
  },

  // Marigold — tertiary accent and premium marker. Block fill only, never text.
  // H=88.
  marigold: {
    100: '#FBEFD4', // oklch(0.955 0.038 88)
    200: '#F6DDA2', // oklch(0.905 0.081 88)
    300: '#F9CF62', // oklch(0.870 0.135 88)
    500: '#F6C53C', // oklch(0.845 0.155 88)  <- filled tertiary block
    700: '#B0890E', // oklch(0.650 0.130 88)
  },

  // Amber — the readable end of marigold. Exists only so warning copy clears AA
  // on light grounds, which yellow never can. H=70.
  amber: {
    800: '#704709', // oklch(0.435 0.090 70)
  },

  // Moss — success / normal range. Deliberately outside the accent triad. H=150.
  moss: {
    100: '#D7F0DB', // oklch(0.930 0.038 150)
    200: '#B4E2BC', // oklch(0.870 0.070 150)
    300: '#89D298', // oklch(0.800 0.110 150)
    500: '#4D9960', // oklch(0.620 0.115 150)
    700: '#2D693D', // oklch(0.470 0.095 150)
    800: '#1F5C31', // oklch(0.425 0.095 150)
  },
} as const;

// ---------------------------------------------------------------------------
// SEMANTIC ROLES
// ---------------------------------------------------------------------------
const p = palette;

const surface = {
  canvas: p.night[950], // app background
  sunken: p.night[900], // recessed well, table row, inset
  card: p.night[850], // primary content card
  cardTint: p.night[800], // secondary / elevated card
  raised: p.night[700], // popover, hover, active row
  hairline: p.night[600], // 1px divider
  hairlineStrong: p.night[500], // card border on dark
  outline: p.ink[0], // the hard 2px border + offset shadow
  block: p.night[950], // a BLACK block sitting on a colored screen canvas

  // per-screen canvases (see the reference: most screens are night; these are
  // the exceptions, used one screen each)
  screenSage: p.sage[200],
  screenPaper: p.paper[0],
  screenPeriwinkle: p.periwinkle[500],

  // tinted panels — dark surfaces with an accent hue cast
  panelInfo: p.nightperi[800],
  panelDanger: p.nightcoral[800],
  panelWarning: p.nightmarigold[800],
  panelSuccess: p.nightmoss[800],
  panelQuiet: p.nightsage[800],
};

const accent = {
  primary: p.coral[500],
  primaryDeep: p.coral[700],
  primaryTint: p.coral[100],
  primaryText: p.coral[800],
  secondary: p.periwinkle[500],
  secondaryDeep: p.periwinkle[700],
  secondaryTint: p.periwinkle[100],
  secondaryText: p.periwinkle[800],
  tertiary: p.marigold[500],
  tertiaryDeep: p.marigold[700],
  tertiaryTint: p.marigold[100],
  // no tertiaryText — see rule 3
};

// Status reads on three different grounds, so each role is split:
//   <name>        block fill / icon / emphasis
//   <name>Text    readable copy on the dark canvas  <- the common case
//   <name>Tint    a quiet wash behind copy on dark
//   <name>OnLight readable copy on a sage/paper/periwinkle screen canvas
// The -800 stops are light-ground text and must never be used on night.
const status = {
  danger: p.coral[500],
  dangerDeep: p.coral[700],
  dangerText: p.coral[300],
  dangerTint: p.nightcoral[800],
  dangerOnLight: p.coral[800],

  warning: p.marigold[500],
  warningDeep: p.marigold[700],
  warningText: p.marigold[300],
  warningTint: p.nightmarigold[800],
  warningOnLight: p.amber[800],

  success: p.moss[500],
  successDeep: p.moss[700],
  successText: p.moss[300],
  successTint: p.nightmoss[800],
  successOnLight: p.moss[800],

  info: p.periwinkle[500],
  infoDeep: p.periwinkle[700],
  infoText: p.periwinkle[300],
  infoTint: p.nightperi[800],
  infoOnLight: p.periwinkle[800],
};

const text = {
  // on the dark canvas
  primary: p.night[50],
  secondary: p.night[100],
  muted: p.night[200],
  subtle: p.night[300],
  disabled: p.night[400], // non-text / large-text only
  // on bright blocks (-100..-500) — the signature inversion
  onAccent: p.ink[900],
  // on deep blocks (-700/-800) and on the light screen canvases
  onAccentDeep: p.paper[0],
  // on a sage / paper / periwinkle screen canvas, copy is ink, not paper
  onLightCanvas: p.ink[900],
};

const specialty = {
  cardiology: '#EC8BB2', // oklch(0.750 0.125 355)
  dermatology: '#EA975C', // oklch(0.750 0.125 55)
  git: '#B3B54F', // oklch(0.750 0.125 110)
  infectious: '#47C7A2', // oklch(0.750 0.125 170)
  pulmonology: '#18C4D3', // oklch(0.750 0.125 205)
  neurology: '#5AB8F5', // oklch(0.750 0.125 240)
  obgyn: '#D193DF', // oklch(0.750 0.125 320)
  more: '#A6B1AA', // oklch(0.750 0.016 160)  neutral overflow slot
} as const;

// ---------------------------------------------------------------------------
// PUBLIC TOKENS — semantic roles plus the legacy dark-theme aliases.
//
// The legacy names are what the existing call sites and the NativeWind class
// map already speak. They are re-pointed at the new roles so the app restyles
// from this file alone. Do not add a new usage of a legacy name; prefer the
// semantic role.
//
// The legacy elevation ramp (background < deepTeal < tealDark < tealMedium <
// surfaceHover) must stay ASCENDING in lightness — that ordering is load-bearing
// for surfaces that were written against the old theme.
// ---------------------------------------------------------------------------
export const Colors = {
  // --- surfaces (legacy ramp, ascending lightness preserved) ---
  background: surface.canvas, // night-950
  deepTeal: surface.sunken, // night-900
  tealDark: surface.card, // night-850
  tealMedium: surface.cardTint, // night-800
  surfaceHover: surface.raised, // night-700

  // --- accents ---
  main: accent.primary, // coral-500 — primary action
  accent: accent.primary, // coral-500
  accentBright: accent.primary, // coral-500
  accentDeep: accent.secondary, // periwinkle-500 — current state
  teal: accent.secondary, // periwinkle-500
  turquoise: accent.secondary, // periwinkle-500
  ice: p.marigold[200], // marigold-200 — gradient caps & shimmer
  lavender: p.periwinkle[300], // periwinkle-300
  pink: p.coral[300], // coral-300
  lime: accent.primary, // coral-500 — folded into primary

  // --- signal / premium ---
  gold: accent.tertiary, // marigold-500 — sole premium marker
  clinicalGold: accent.tertiaryDeep, // marigold-700

  // --- clinical caution ---
  terracotta: p.coral[300], // reads as text, border and soft fill on night
  terracottaDeep: p.coral[500],

  // --- neutrals / text ---
  charcoal: text.subtle, // night-300
  grayDark: text.muted, // night-200
  grayMuted: text.muted, // night-200
  graySubtle: text.subtle, // night-300
  textPrimary: text.primary, // night-50
  textBody: text.secondary, // night-100
  ink: text.onAccent, // ink-900 — text on every bright fill

  // --- floating islands (dock, AI composer) ---
  islandBg: surface.cardTint, // night-800
  tabIslandBg: surface.canvas, // night-950

  // --- medicine reference cards ---
  medicineBg: surface.cardTint, // night-800
  medicineCard: surface.card, // night-850

  // --- role groups for new code ---
  surface,
  accents: accent,
  status,
  text,
  specialty,
} as const;

export type SpecialtyKey = keyof typeof Colors.specialty;
