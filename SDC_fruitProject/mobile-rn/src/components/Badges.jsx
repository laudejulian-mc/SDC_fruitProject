import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, BorderRadius, FontSize, Spacing } from '../theme';

const LABEL_COLORS = {
  Fresh:    { bg: '#dcfce7', darkBg: 'rgba(34,197,94,0.18)',  text: '#166534', darkText: '#4ade80', icon: '✅' },
  Rotten:   { bg: '#fef2f2', darkBg: 'rgba(239,68,68,0.18)',  text: '#991b1b', darkText: '#f87171', icon: '❌' },
};

const GRADE_COLORS = {
  Fresh:  { bg: '#d1fae5', darkBg: 'rgba(16,185,129,0.18)', text: '#047857', darkText: '#34d399', accent: '#10b981' },
  Rotten: { bg: '#fef2f2', darkBg: 'rgba(239,68,68,0.18)', text: '#991b1b', darkText: '#f87171', accent: '#ef4444' },
};

export function LabelBadge({ label }) {
  const { dark } = useTheme();
  const colors = LABEL_COLORS[label] || { bg: '#f3f4f6', darkBg: '#374151', text: '#4b5563', darkText: '#9ca3af' };

  return (
    <View style={[styles.badge, {
      backgroundColor: dark ? colors.darkBg : colors.bg,
      borderWidth: 1,
      borderColor: dark ? `${colors.darkText}22` : `${colors.text}15`,
    }]}>
      {colors.icon && <Text style={styles.badgeIcon}>{colors.icon}</Text>}
      <Text style={[styles.badgeText, { color: dark ? colors.darkText : colors.text }]}>
        {label}
      </Text>
    </View>
  );
}

export function GradeBadge({ grade }) {
  const { dark } = useTheme();
  const colors = GRADE_COLORS[grade] || { bg: '#f3f4f6', darkBg: '#374151', text: '#4b5563', darkText: '#9ca3af', accent: '#9ca3af' };

  return (
    <View style={[styles.gradeBadge, {
      backgroundColor: dark ? colors.darkBg : colors.bg,
      borderWidth: 1,
      borderColor: dark ? `${colors.darkText}22` : `${colors.text}15`,
    }]}>
      <View style={[styles.gradeDot, { backgroundColor: colors.accent }]} />
      <Text style={[styles.badgeText, { color: dark ? colors.darkText : colors.text }]}>
        {grade}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.full,
  },
  badgeIcon: {
    fontSize: 10,
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.full,
  },
  gradeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
