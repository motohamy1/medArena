const { Colors, palette } = require("./constants/Colors");

// -----------------------------------------------------------------------------
// Riso theme — Tailwind bridge.
//
// Two jobs, in this order:
//
//  1. Publish the semantic roles from constants/Colors.ts as utility names, so
//     `bg-canvas`, `text-primary`, `border-outline` etc. are available to new
//     code.
//
//  2. OVERRIDE the default Tailwind scales (gray/slate/red/amber/emerald/blue…)
//     rather than extend them. ~250 existing class strings still speak in
//     default-scale names (`text-gray-400` alone appears 55 times). Left
//     untouched those resolve to Tailwind's stock slate/red/emerald and would
//     leak the retired palette straight through the new theme. Remapping the
//     scales retargets every one of them from this file alone.
//
// The neutral override is a SHIFT, not a copy: `night` is a conventional ramp
// (50 lightest → 950 darkest) but Tailwind's gray scale is used asymmetrically
// on a dark theme — see the note above grayScale.
//
// The accent scales are a different shape. On a dark canvas the useful range is
// compressed — pale tints and the block itself read almost the same, while the
// bottom of the scale is where a tinted *panel* lives. So 50-300 are the bright
// stops, 400-800 collapse onto the block and its deep variant, and 900-950 map
// to the hue-cast dark panel rather than to a muddy near-black that would be
// indistinguishable from the canvas.
// -----------------------------------------------------------------------------

// The neutral override is NOT a straight copy of `night`. It cannot be: Tailwind
// ships `text-gray-400` as *secondary copy* and `bg-gray-900` as a *surface*, so
// the low numbers have to be text-capable (>= 4.5:1 on the canvas) and only the
// high numbers are allowed to go dark. Mapping `night` straight in put
// gray-500 at 2.79:1 — invisible copy. This shift keeps the two roles apart:
//   50-500  -> the light stops, all text-safe on night
//   600-950 -> the dark stops, for surfaces and hairlines
const grayScale = {
  50: palette.night[50],
  100: palette.night[50],
  200: palette.night[100],
  300: palette.night[200],
  400: palette.night[300],
  500: palette.night[400],
  600: palette.night[500],
  700: palette.night[600],
  800: palette.night[700],
  900: palette.night[800],
  950: palette.night[900],
};

// tint[900] is the dark hue-cast panel for this family, e.g. palette.nightcoral
const accentScale = (fam, tint) => ({
  50: fam[100],
  100: fam[100],
  200: fam[200],
  300: fam[300],
  400: fam[500],
  500: fam[500],
  600: fam[500],
  700: fam[700],
  800: fam[700],
  900: tint[900],
  950: tint[900],
});

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      // Setting `theme.colors` (not `theme.extend.colors`) REPLACES Tailwind's
      // default palette, so the two stock neutrals must be republished by hand.
      // Without these, `text-white` (89 uses) generates no style at all and the
      // Text inherits React Native's default black — invisible on this canvas.
      white: "#FFFFFF",
      black: "#000000",

      // --- surfaces ---
      canvas: Colors.surface.canvas,
      sunken: Colors.surface.sunken,
      card: Colors.surface.card,
      "card-tint": Colors.surface.cardTint,
      raised: Colors.surface.raised,
      hairline: Colors.surface.hairline,
      "hairline-strong": Colors.surface.hairlineStrong,
      outline: Colors.surface.outline,
      block: Colors.surface.block,
      "panel-info": Colors.surface.panelInfo,
      "panel-danger": Colors.surface.panelDanger,
      "panel-warning": Colors.surface.panelWarning,
      "panel-success": Colors.surface.panelSuccess,
      "panel-quiet": Colors.surface.panelQuiet,

      // --- per-screen canvases (the reference swaps these in, rarely) ---
      "screen-sage": Colors.surface.screenSage,
      "screen-paper": Colors.surface.screenPaper,
      "screen-periwinkle": Colors.surface.screenPeriwinkle,

      // --- accent blocks ---
      primary: Colors.accents.primary,
      "primary-deep": Colors.accents.primaryDeep,
      "primary-tint": Colors.accents.primaryTint,
      "primary-text": Colors.accents.primaryText,
      secondary: Colors.accents.secondary,
      "secondary-deep": Colors.accents.secondaryDeep,
      "secondary-tint": Colors.accents.secondaryTint,
      "secondary-text": Colors.accents.secondaryText,
      tertiary: Colors.accents.tertiary,
      "tertiary-deep": Colors.accents.tertiaryDeep,
      "tertiary-tint": Colors.accents.tertiaryTint,

      // --- status ---
      danger: Colors.status.danger,
      "danger-deep": Colors.status.dangerDeep,
      "danger-text": Colors.status.dangerText,
      "danger-tint": Colors.status.dangerTint,
      "danger-on-light": Colors.status.dangerOnLight,
      warning: Colors.status.warning,
      "warning-deep": Colors.status.warningDeep,
      "warning-text": Colors.status.warningText,
      "warning-tint": Colors.status.warningTint,
      "warning-on-light": Colors.status.warningOnLight,
      success: Colors.status.success,
      "success-deep": Colors.status.successDeep,
      "success-text": Colors.status.successText,
      "success-tint": Colors.status.successTint,
      "success-on-light": Colors.status.successOnLight,
      info: Colors.status.info,
      "info-deep": Colors.status.infoDeep,
      "info-text": Colors.status.infoText,
      "info-tint": Colors.status.infoTint,
      "info-on-light": Colors.status.infoOnLight,

      // --- text ---
      "text-primary": Colors.text.primary,
      "text-secondary": Colors.text.secondary,
      "text-muted": Colors.text.muted,
      "text-subtle": Colors.text.subtle,
      "text-disabled": Colors.text.disabled,
      "text-on-accent": Colors.text.onAccent,
      "text-on-accent-deep": Colors.text.onAccentDeep,
      "text-on-light": Colors.text.onLightCanvas,

      // --- raw families, for charts and one-off fills ---
      sage: palette.sage,
      paper: palette.paper,
      night: palette.night,
      coral: palette.coral,
      periwinkle: palette.periwinkle,
      marigold: palette.marigold,
      moss: palette.moss,
      specialty: Colors.specialty,

      // --- legacy dark-theme names, re-pointed so existing classes restyle ---
      background: Colors.background,
      "deep-teal": Colors.deepTeal,
      "teal-dark": Colors.tealDark,
      "teal-medium": Colors.tealMedium,
      "surface-hover": Colors.surfaceHover,
      main: Colors.main,
      accent: Colors.accents.primary,
      "accent-bright": Colors.accentBright,
      "accent-deep": Colors.accentDeep,
      ice: Colors.ice,
      turquoise: Colors.turquoise,
      // `teal` MUST stay published: 59 call sites speak it (bg-teal, text-teal,
      // border-teal). Dropping it does not fall back to anything — the class
      // simply stops generating, so a `bg-teal` button renders with no fill at
      // all and any ink text on it lands straight on the canvas. That is how
      // the "invisible dark text" regression happened.
      teal: Colors.teal,
      lime: Colors.lime,
      lavender: Colors.lavender,
      pink: Colors.pink,
      gold: Colors.gold,
      terracotta: Colors.terracotta,
      "terracotta-deep": Colors.terracottaDeep,
      charcoal: Colors.charcoal,
      ink: Colors.ink,
      "gray-dark": Colors.grayDark,
      "gray-muted": Colors.grayMuted,
      "gray-subtle": Colors.graySubtle,
      "medicine-bg": Colors.medicineBg,
      "medicine-card": Colors.medicineCard,
      island: Colors.islandBg,

      // --- default-scale overrides (see header note) ---
      gray: grayScale,
      slate: grayScale,
      zinc: grayScale,
      neutral: grayScale,
      stone: grayScale,
      red: accentScale(palette.coral, palette.nightcoral),
      rose: accentScale(palette.coral, palette.nightcoral),
      orange: accentScale(palette.coral, palette.nightcoral),
      amber: accentScale(palette.marigold, palette.nightmarigold),
      yellow: accentScale(palette.marigold, palette.nightmarigold),
      green: accentScale(palette.moss, palette.nightmoss),
      emerald: accentScale(palette.moss, palette.nightmoss),
      cyan: accentScale(palette.periwinkle, palette.nightperi),
      sky: accentScale(palette.periwinkle, palette.nightperi),
      blue: accentScale(palette.periwinkle, palette.nightperi),
      violet: accentScale(palette.periwinkle, palette.nightperi),
      purple: accentScale(palette.periwinkle, palette.nightperi),
      fuchsia: accentScale(palette.periwinkle, palette.nightperi),
      indigo: accentScale(palette.periwinkle, palette.nightperi),
      // `teal` is claimed by the legacy alias above (periwinkle-500), so the
      // default teal scale is deliberately not overridden.
    },
    extend: {
      fontFamily: {
        // Anton is the display face: heavy, uppercase, tight. Everything in
        // this theme that shouts is Anton + uppercase.
        display: ["Anton_400Regular"],
        sans: ["PlexSans_400Regular"],
        "sans-medium": ["PlexSans_500Medium"],
        "sans-semibold": ["PlexSans_600SemiBold"],
        "sans-bold": ["PlexSans_700Bold"],
        mono: ["PlexMono_400Regular"],
        "mono-medium": ["PlexMono_500Medium"],
      },
      // Depth is a hard offset plate, never a blurred drop. On the dark canvas
      // a black plate is invisible, so separation there comes from the surface
      // ramp plus `edge` (a hairline ring). The black plate is for blocks
      // landing on a sage / paper / periwinkle screen canvas — the Categories
      // and Revenue screens in the reference.
      boxShadow: {
        hard: "4px 4px 0 0 #000000",
        "hard-sm": "2px 2px 0 0 #000000",
        "hard-lg": "6px 6px 0 0 #000000",
        plate: "8px 8px 0 0 #000000",
        bubble: "0 2px 0 0 #000000",
        edge: "0 0 0 1px #40444C",
        "edge-strong": "0 0 0 2px #535862",
      },
      borderRadius: {
        card: "20px",
        tile: "14px",
      },
      borderWidth: {
        hair: "1px",
        outline: "2px",
        heavy: "3px",
      },
    },
  },
  plugins: [],
};
