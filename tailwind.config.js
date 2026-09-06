const { Colors } = require("./constants/Colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Neutral graphite surfaces — even perceptual lightness ramp
        background: Colors.background,
        "deep-teal": Colors.deepTeal,
        "teal-dark": Colors.tealDark,
        "teal-medium": Colors.tealMedium,
        "surface-hover": Colors.surfaceHover,
        // Signature 4-Color Palette (User Palette)
        main: Colors.main, // #a9e4e8 (Glacier Aqua)
        primary: Colors.main, // #a9e4e8
        accent: Colors.accent, // #a9e4e8
        ice: Colors.ice, // #defff9 (Ice Mint — gradient caps only)
        turquoise: Colors.teal, // #4bc0b8 (Deep Aqua Teal)
        teal: Colors.teal, // #6dc2bd
        lime: Colors.main, // #defff9 (Mapped to Main #defff9)
        lavender: Colors.lavender, // #dbd4fd (Soft Lavender)
        pink: Colors.pink, // #ffc3dd (Pastel Rose Pink)
        "accent-bright": Colors.accentBright,
        "accent-deep": Colors.accentDeep,
        // Functional tokens
        gold: Colors.gold, // #dbd4fd
        terracotta: Colors.terracotta, // #ffc3dd
        "terracotta-deep": Colors.terracottaDeep,
        // Neutral tones
        charcoal: Colors.charcoal,
        ink: Colors.ink,
        "gray-dark": Colors.grayDark,
        "gray-muted": Colors.grayMuted,
        "gray-subtle": Colors.graySubtle,
        // Medicine card
        "medicine-bg": Colors.medicineBg,
        "medicine-card": Colors.medicineCard,
        // Floating islands (composer, tab bar)
        island: Colors.islandBg,
      },
      fontFamily: {
        sans: ["PlexSans_400Regular"],
        "sans-medium": ["PlexSans_500Medium"],
        "sans-semibold": ["PlexSans_600SemiBold"],
        "sans-bold": ["PlexSans_700Bold"],
        mono: ["PlexMono_400Regular"],
        "mono-medium": ["PlexMono_500Medium"],
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(75, 192, 184, 0.28)",
        "glow-gold": "0 0 20px rgba(210, 182, 137, 0.3)",
        "bubble": "0 4px 12px rgba(0, 0, 0, 0.4)",
        "card": "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
