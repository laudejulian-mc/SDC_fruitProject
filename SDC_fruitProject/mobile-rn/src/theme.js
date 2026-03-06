/**
 * Centralized color palette and style helpers for FruitMD React Native.
 * Modern, aesthetic design system with rich light & dark palettes.
 */

export const Colors = {
  /* ─────────────── LIGHT MODE ─────────────── */
  light: {
    // Surfaces
    background: '#f0fdf4',           // soft mint tint instead of plain gray
    backgroundSecondary: '#f8fafc',   // alternate surface
    card: '#ffffff',
    cardElevated: '#ffffff',          // higher‑z cards
    cardBorder: '#e2e8f0',
    cardBorderSubtle: '#f1f5f9',      // very light separator
    glass: 'rgba(255,255,255,0.75)',  // glassmorphism overlay

    // Typography
    text: '#0f172a',                  // deeper slate for better contrast
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',

    // Brand colors
    primary: '#16a34a',
    primaryLight: '#dcfce7',
    primaryDark: '#15803d',
    primaryGradientStart: '#16a34a',
    primaryGradientEnd: '#059669',    // emerald blend

    // Accent & warm tones
    accent: '#f97316',
    accentLight: '#fff7ed',
    accentDark: '#ea580c',
    gold: '#eab308',
    goldLight: '#fef9c3',

    // Semantic
    red: '#ef4444',
    redLight: '#fef2f2',
    redDark: '#dc2626',
    green: '#22c55e',
    greenLight: '#f0fdf4',
    greenDark: '#16a34a',
    blue: '#3b82f6',
    blueLight: '#eff6ff',
    blueDark: '#2563eb',
    yellow: '#eab308',
    yellowLight: '#fefce8',
    amber: '#f59e0b',
    amberLight: '#fffbeb',
    purple: '#8b5cf6',
    purpleLight: '#f5f3ff',
    pink: '#ec4899',
    pinkLight: '#fdf2f8',
    teal: '#14b8a6',
    tealLight: '#f0fdfa',
    cyan: '#06b6d4',
    cyanLight: '#ecfeff',
    indigo: '#6366f1',
    indigoLight: '#eef2ff',

    // UI chrome
    inputBg: '#f8fafc',
    inputBorder: '#cbd5e1',
    inputFocus: 'rgba(22,163,74,0.2)',
    tabBarBg: '#ffffff',
    tabBarBorder: '#e2e8f0',
    headerBg: '#ffffff',
    divider: '#f1f5f9',

    // Interaction
    overlay: 'rgba(15,23,42,0.4)',
    ripple: 'rgba(22,163,74,0.08)',
    skeleton: '#e2e8f0',
    skeletonHighlight: '#f1f5f9',

    // Shadows
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    cardShadow: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    cardShadowElevated: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
    },

    // Status / severity
    successBg: '#f0fdf4',
    successBorder: '#bbf7d0',
    successText: '#166534',
    errorBg: '#fef2f2',
    errorBorder: '#fecaca',
    errorText: '#991b1b',
    warningBg: '#fefce8',
    warningBorder: '#fef08a',
    warningText: '#854d0e',
    infoBg: '#eff6ff',
    infoBorder: '#bfdbfe',
    infoText: '#1e40af',

    // Gradients (arrays for LinearGradient or manual use)
    gradientPrimary: ['#16a34a', '#059669'],
    gradientWarm: ['#f97316', '#ef4444'],
    gradientCool: ['#3b82f6', '#8b5cf6'],
    gradientSunset: ['#f97316', '#ec4899'],
    gradientFresh: ['#22c55e', '#14b8a6'],
    gradientGold: ['#eab308', '#f97316'],
  },

  /* ─────────────── DARK MODE ─────────────── */
  dark: {
    // Surfaces — layered depth
    background: '#030712',
    backgroundSecondary: '#0a1120',
    card: '#0f1729',              // richer navy-dark instead of plain gray
    cardElevated: '#162032',      // elevated layer
    cardBorder: '#1e293b',
    cardBorderSubtle: '#1a2538',
    glass: 'rgba(15,23,42,0.65)',

    // Typography
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    textInverse: '#0f172a',

    // Brand
    primary: '#22c55e',
    primaryLight: 'rgba(34,197,94,0.15)',
    primaryDark: '#16a34a',
    primaryGradientStart: '#22c55e',
    primaryGradientEnd: '#10b981',

    // Accent
    accent: '#fb923c',
    accentLight: 'rgba(249,115,22,0.15)',
    accentDark: '#f97316',
    gold: '#facc15',
    goldLight: 'rgba(234,179,8,0.12)',

    // Semantic
    red: '#f87171',
    redLight: 'rgba(239,68,68,0.15)',
    redDark: '#ef4444',
    green: '#4ade80',
    greenLight: 'rgba(34,197,94,0.15)',
    greenDark: '#22c55e',
    blue: '#60a5fa',
    blueLight: 'rgba(59,130,246,0.15)',
    blueDark: '#3b82f6',
    yellow: '#facc15',
    yellowLight: 'rgba(234,179,8,0.12)',
    amber: '#fbbf24',
    amberLight: 'rgba(245,158,11,0.12)',
    purple: '#a78bfa',
    purpleLight: 'rgba(139,92,246,0.15)',
    pink: '#f472b6',
    pinkLight: 'rgba(236,72,153,0.15)',
    teal: '#2dd4bf',
    tealLight: 'rgba(20,184,166,0.15)',
    cyan: '#22d3ee',
    cyanLight: 'rgba(6,182,212,0.15)',
    indigo: '#818cf8',
    indigoLight: 'rgba(99,102,241,0.15)',

    // UI chrome
    inputBg: '#162032',
    inputBorder: '#1e293b',
    inputFocus: 'rgba(34,197,94,0.25)',
    tabBarBg: '#0a0f1a',
    tabBarBorder: '#1e293b',
    headerBg: '#0f1729',
    divider: '#1e293b',

    // Interaction
    overlay: 'rgba(0,0,0,0.65)',
    ripple: 'rgba(34,197,94,0.12)',
    skeleton: '#1e293b',
    skeletonHighlight: '#334155',

    // Shadows (on dark, use colored glow)
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    cardShadow: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
    },
    cardShadowElevated: {
      shadowColor: '#22c55e',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },

    // Status
    successBg: 'rgba(34,197,94,0.1)',
    successBorder: 'rgba(34,197,94,0.25)',
    successText: '#4ade80',
    errorBg: 'rgba(239,68,68,0.1)',
    errorBorder: 'rgba(239,68,68,0.25)',
    errorText: '#f87171',
    warningBg: 'rgba(234,179,8,0.1)',
    warningBorder: 'rgba(234,179,8,0.25)',
    warningText: '#fbbf24',
    infoBg: 'rgba(59,130,246,0.1)',
    infoBorder: 'rgba(59,130,246,0.25)',
    infoText: '#60a5fa',

    // Gradients
    gradientPrimary: ['#22c55e', '#10b981'],
    gradientWarm: ['#fb923c', '#f87171'],
    gradientCool: ['#60a5fa', '#a78bfa'],
    gradientSunset: ['#fb923c', '#f472b6'],
    gradientFresh: ['#4ade80', '#2dd4bf'],
    gradientGold: ['#facc15', '#fb923c'],
  },
};

export const useColors = (dark) => (dark ? Colors.dark : Colors.light);

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

/** Shared shadow presets */
export const Shadows = {
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  }),
};
