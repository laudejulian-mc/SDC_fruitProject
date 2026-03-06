import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDashboardStats } from '../api';
import { StatCard } from '../components/StatCard';
import { CardSkeleton } from '../components/Skeleton';
import { GradeBadge } from '../components/Badges';
import { fruitEmoji } from '../utils/fruitConstants';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, BorderRadius, FontSize, Spacing } from '../theme';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, labelName, fruitName } = useI18n();
  const { dark } = useTheme();
  const c = useColors(dark);

  /* Live clock */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  useEffect(() => {
    getDashboardStats()
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.gridHalf}>
              <CardSkeleton />
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Ionicons name="medical" size={40} color={c.textMuted} />
        <Text style={[styles.emptyText, { color: c.textMuted }]}>Failed to load clinic data.</Text>
      </View>
    );
  }

  const totalScans = stats.total_scans;
  const freshCount = stats.quality_distribution.Fresh || 0;
  const healthRate = totalScans > 0 ? ((freshCount / totalScans) * 100).toFixed(1) : 0;
  const avgConf = stats.recent_detections.length
    ? (stats.recent_detections.reduce((s, d) => s + d.confidence, 0) / stats.recent_detections.length * 100).toFixed(1)
    : 0;
  const qualityData = Object.entries(stats.quality_distribution);
  const gradeData = Object.entries(stats.grade_distribution);
  const fruitData = stats.fruit_distribution ? Object.entries(stats.fruit_distribution) : [];

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      {/* Welcome banner */}
      <View style={[styles.banner, { backgroundColor: dark ? '#0a1a12' : c.primary }]}>
        {/* Decorative orbs */}
        <View style={[styles.bannerOrb, { backgroundColor: dark ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.08)', top: -30, right: -30, width: 140, height: 140 }]} />
        <View style={[styles.bannerOrb, { backgroundColor: dark ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.05)', bottom: -20, left: -20, width: 100, height: 100 }]} />
        <Text style={[styles.bannerTitle, { color: dark ? c.primary : '#fff' }]}>
          <Ionicons name="medical" size={18} color={dark ? c.primary : '#fff'} /> {t('dashboard.clinicOverview')}
        </Text>
        <Text style={[styles.bannerSub, { color: dark ? c.textSecondary : 'rgba(255,255,255,0.7)' }]}>
          {totalScans} {t('dashboard.totalExamsPerformed')}
        </Text>
        <View style={styles.bannerPills}>
          <View style={[styles.pill, { backgroundColor: dark ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name="heart" size={12} color={dark ? c.green : '#fff'} />
            <Text style={[styles.pillText, { color: dark ? c.green : '#fff' }]}>{healthRate}% {t('dashboard.healthRate')}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: dark ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name="pulse" size={12} color={dark ? c.blue : '#fff'} />
            <Text style={[styles.pillText, { color: dark ? c.blue : '#fff' }]}>{t('dashboard.clinicActive')}</Text>
          </View>
        </View>

        {/* Time widget */}
        <View style={[styles.timeWidget, { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)' }]}>
          <Ionicons name="time-outline" size={16} color={dark ? c.primary : '#fff'} />
          <View>
            <Text style={[styles.timeText, { color: dark ? c.primary : '#fff' }]}>{timeStr}</Text>
            <Text style={[styles.dateText, { color: dark ? c.textSecondary : 'rgba(255,255,255,0.7)' }]}>{dateStr}</Text>
          </View>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.grid}>
        <View style={styles.gridHalf}>
          <StatCard iconName="search-outline" label={t('dashboard.totalExams')} value={totalScans} color="primary" />
        </View>
        <View style={styles.gridHalf}>
          <StatCard iconName="heart-outline" label={t('dashboard.healthyFruit')} value={freshCount} color="primary" />
        </View>
        <View style={styles.gridHalf}>
          <StatCard iconName="analytics-outline" label={t('dashboard.avgConfidence')} value={`${avgConf}%`} color="blue" />
        </View>
        <View style={styles.gridHalf}>
          <StatCard iconName="leaf-outline" label={t('dashboard.gradeA')} value={freshCount} color="primary" />
        </View>
      </View>

      {/* Quality breakdown */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('dashboard.healthDistribution')}</Text>
        {qualityData.map(([label, count]) => {
          const pct = totalScans > 0 ? ((count / totalScans) * 100) : 0;
          return (
            <View key={label} style={styles.barRow}>
              <Text style={[styles.barLabel, { color: c.text }]}>{labelName(label)}</Text>
              <View style={[styles.barTrack, { backgroundColor: dark ? c.cardBorderSubtle : '#f1f5f9' }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: label === 'Fresh' ? c.green : c.red,
                      width: `${pct}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barCount, { color: c.text }]}>{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Grade distribution */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('dashboard.gradeDistribution')}</Text>
        <View style={styles.gradeGrid}>
          {gradeData.map(([grade, count]) => (
            <View key={grade} style={styles.gradeItem}>
              <GradeBadge grade={grade} />
              <Text style={[styles.gradeCount, { color: c.text }]}>{count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Fruit distribution */}
      {fruitData.length > 0 && (
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>{t('dashboard.patientDistribution')}</Text>
          {fruitData.map(([name, count]) => (
            <View key={name} style={styles.fruitRow}>
              <Text style={{ fontSize: 16 }}>{fruitEmoji(name)}</Text>
              <Text style={[styles.fruitName, { color: c.text }]}>{fruitName(name)}</Text>
              <Text style={[styles.fruitCount, { color: c.text }]}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent exams */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('dashboard.recentExams')}</Text>
        {stats.recent_detections.length === 0 ? (
          <Text style={[styles.emptyText, { color: c.textMuted }]}>{t('dashboard.noExamsYet')}</Text>
        ) : (
          stats.recent_detections.slice(0, 5).map((d, i) => (
            <View
              key={i}
              style={[styles.recentRow, i < Math.min(stats.recent_detections.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: c.divider }]}
            >
              <Text style={{ fontSize: 14 }}>{fruitEmoji(d.fruit_type)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: FontSize.sm, fontWeight: '500' }, { color: c.text }]}>
                  {labelName(d.predicted_label)}
                </Text>
                <Text style={{ fontSize: FontSize.xs, color: c.textMuted }}>{d.grade}</Text>
              </View>
              <Text style={[styles.recentConf, { color: c.text }]}>
                {(d.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Quick actions */}
      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.gridHalf, styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }]}
          onPress={() => navigation.navigate('Detect')}
        >
          <View style={{ width: 36, height: 36, borderRadius: BorderRadius.md, backgroundColor: c.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="search" size={18} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '600' }, { color: c.text }]}>{t('dashboard.newDiagnosis')}</Text>
            <Text style={{ fontSize: FontSize.xs, color: c.textMuted }}>{t('nav.detect')}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.gridHalf, styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }]}
          onPress={() => navigation.navigate('History')}
        >
          <View style={{ width: 36, height: 36, borderRadius: BorderRadius.md, backgroundColor: c.blueLight, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="time" size={18} color={c.blue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '600' }, { color: c.text }]}>{t('dashboard.viewHistory')}</Text>
            <Text style={{ fontSize: FontSize.xs, color: c.textMuted }}>{t('nav.history')}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  banner: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  bannerOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  bannerTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  bannerSub: { fontSize: FontSize.xs, marginTop: 4 },
  bannerPills: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  pillText: { fontSize: FontSize.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  gridHalf: { width: '48.5%' },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  barLabel: { fontSize: FontSize.xs, fontWeight: '500', width: 56 },
  barTrack: { flex: 1, height: 6, borderRadius: BorderRadius.full, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: BorderRadius.full },
  barCount: { fontSize: FontSize.xs, fontWeight: '700', width: 32, textAlign: 'right', fontVariant: ['tabular-nums'] },
  gradeGrid: { flexDirection: 'row', gap: Spacing.xs },
  gradeItem: { alignItems: 'center', flex: 1 },
  gradeCount: { fontSize: FontSize.lg, fontWeight: '700', marginTop: 2 },
  fruitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 2 },
  fruitName: { flex: 1, fontSize: FontSize.sm, fontWeight: '500', textTransform: 'capitalize' },
  fruitCount: { fontSize: FontSize.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
  emptyText: { fontSize: FontSize.sm, textAlign: 'center', paddingVertical: Spacing.lg },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  recentConf: { fontSize: FontSize.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
  /* ── Time widget ────────────────── */
  timeWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dateText: {
    fontSize: FontSize.xs,
  },
});
