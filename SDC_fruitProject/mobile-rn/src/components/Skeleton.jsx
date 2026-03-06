import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, BorderRadius, Spacing } from '../theme';

export function Skeleton({ width, height = 24, style }) {
  const { dark } = useTheme();
  const c = useColors(dark);
  return (
    <View
      style={[
        styles.skeleton,
        { backgroundColor: c.skeleton || c.inputBg, width, height },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  const { dark } = useTheme();
  const c = useColors(dark);
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
      <Skeleton width={40} height={40} style={{ borderRadius: BorderRadius.md }} />
      <Skeleton width={80} height={16} style={{ marginTop: Spacing.sm }} />
      <Skeleton width={56} height={24} style={{ marginTop: Spacing.xs }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: BorderRadius.sm,
    opacity: 0.6,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
});
