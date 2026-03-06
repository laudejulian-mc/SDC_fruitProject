import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, BorderRadius, FontSize, Spacing } from '../theme';

const COLOR_MAP = {
  primary: (c) => ({ bg: c.primaryLight, icon: c.primary, glow: c.primary }),
  blue: (c) => ({ bg: c.blueLight, icon: c.blue, glow: c.blue }),
  yellow: (c) => ({ bg: c.yellowLight, icon: c.yellow, glow: c.yellow }),
  red: (c) => ({ bg: c.redLight, icon: c.red, glow: c.red }),
  orange: (c) => ({ bg: c.accentLight, icon: c.accent, glow: c.accent }),
  purple: (c) => ({ bg: c.purpleLight, icon: c.purple, glow: c.purple }),
  teal: (c) => ({ bg: c.tealLight, icon: c.teal, glow: c.teal }),
  pink: (c) => ({ bg: c.pinkLight, icon: c.pink, glow: c.pink }),
  indigo: (c) => ({ bg: c.indigoLight, icon: c.indigo, glow: c.indigo }),
  cyan: (c) => ({ bg: c.cyanLight, icon: c.cyan, glow: c.cyan }),
};

export function StatCard({ icon, label, value, sub, color = 'primary', iconName }) {
  const { dark } = useTheme();
  const c = useColors(dark);
  const colorSet = (COLOR_MAP[color] || COLOR_MAP.primary)(c);
  const ioName = iconName || 'stats-chart-outline';

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: c.card,
        borderColor: c.cardBorder,
        ...c.cardShadow,
      },
    ]}>
      <View style={[styles.iconBox, { backgroundColor: colorSet.bg }]}>
        <Ionicons name={ioName} size={22} color={colorSet.icon} />
        {/* Subtle glow dot */}
        <View style={[styles.glowDot, {
          backgroundColor: colorSet.glow,
          shadowColor: colorSet.glow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
        }]} />
      </View>
      <View style={styles.textBox}>
        <Text style={[styles.label, { color: c.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.value, { color: c.text }]}>{value}</Text>
        {sub ? (
          <Text style={[styles.sub, { color: c.textMuted }]} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      {/* Accent stripe */}
      <View style={[styles.accentStripe, { backgroundColor: colorSet.icon }]} />
    </View>
  );
}

export default StatCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
  textBox: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  accentStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    height: '100%',
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
});
