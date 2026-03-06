import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { fetchReportSummary, exportReport } from '../api';
import StatCard from '../components/StatCard';
import { fruitEmoji } from '../utils/fruitConstants';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, Spacing, FontSize, BorderRadius } from '../theme';

const PERIOD_OPTIONS = [
  { key: 'today', icon: 'today' },
  { key: '7days', icon: 'calendar' },
  { key: '30days', icon: 'calendar-outline' },
  { key: 'all', icon: 'infinite' },
];

export default function ReportsScreen() {
  const { t, fruitName, labelName } = useI18n();
  const { dark } = useTheme();
  const c = useColors(dark);

  const [period, setPeriod] = useState('7days');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchReportSummary({ period });
        setSummary(res.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [period]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await exportReport({ period, format });
      // Save to file and share
      const filename = `fruit_report_${period}.${format}`;
      const fileUri = FileSystem.documentDirectory + filename;
      if (format === 'csv') {
        await FileSystem.writeAsStringAsync(fileUri, res.data);
      } else {
        const base64 = btoa(
          new Uint8Array(res.data).reduce((d, b) => d + String.fromCharCode(b), '')
        );
        await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
      }
      await Sharing.shareAsync(fileUri);
    } catch {
      Alert.alert('Error', t('reports.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const s = summary || {};

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      {/* Period selector */}
      <View style={styles.periodRow}>
        {PERIOD_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.periodChip,
              { backgroundColor: period === opt.key ? c.primary : c.inputBg },
            ]}
            onPress={() => setPeriod(opt.key)}
          >
            <Ionicons name={opt.icon} size={14} color={period === opt.key ? '#fff' : c.textMuted} />
            <Text style={[styles.periodText, { color: period === opt.key ? '#fff' : c.textSecondary }]}>
              {t(`reports.${opt.key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard icon="scan" color="#3b82f6" label={t('reports.totalExams')} value={s.total_exams ?? 0} dark={dark} />
        <StatCard icon="checkmark-circle" color="#22c55e" label={t('reports.freshRate')} value={`${(s.fresh_rate ?? 0).toFixed(1)}%`} dark={dark} />
        <StatCard icon="alert-circle" color="#ef4444" label={t('reports.rottenRate')} value={`${(s.rotten_rate ?? 0).toFixed(1)}%`} dark={dark} />
        <StatCard icon="analytics" color="#8b5cf6" label={t('reports.avgConfidence')} value={`${(s.avg_confidence ?? 0).toFixed(1)}%`} dark={dark} />
      </View>

      {/* Quality distribution */}
      {s.quality_distribution && (
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>{t('reports.qualityDistribution')}</Text>
          {Object.entries(s.quality_distribution).map(([label, count]) => {
            const total = Object.values(s.quality_distribution).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? (count / total) * 100 : 0;
            const barColor = label === 'Fresh' ? c.green : c.red;
            return (
              <View key={label} style={styles.distRow}>
                <View style={styles.distLabelRow}>
                  <Text style={[styles.distLabel, { color: c.text }]}>{labelName(label)}</Text>
                  <Text style={[styles.distCount, { color: c.textMuted }]}>{count}</Text>
                </View>
                <View style={[styles.bar, { backgroundColor: c.cardBorderSubtle }]}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Grade distribution */}
      {s.grade_distribution && (
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>{t('reports.gradeDistribution')}</Text>
          {Object.entries(s.grade_distribution).map(([grade, count]) => {
            const total = Object.values(s.grade_distribution).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? (count / total) * 100 : 0;
            const gradeColors = { 'A+': '#22c55e', A: '#4ade80', B: '#facc15', C: '#f59e0b', D: '#ef4444', F: '#dc2626' };
            return (
              <View key={grade} style={styles.distRow}>
                <View style={styles.distLabelRow}>
                  <View style={[styles.gradeDot, { backgroundColor: gradeColors[grade] || '#6b7280' }]} />
                  <Text style={[styles.distLabel, { color: c.text }]}>{grade}</Text>
                  <Text style={[styles.distCount, { color: c.textMuted }]}>{count}</Text>
                </View>
                <View style={[styles.bar, { backgroundColor: c.cardBorderSubtle }]}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: gradeColors[grade] || '#6b7280' }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Fruit breakdown */}
      {s.fruit_distribution && (
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>{t('reports.fruitBreakdown')}</Text>
          {Object.entries(s.fruit_distribution).map(([fruit, count]) => (
            <View key={fruit} style={styles.fruitRow}>
              <Text style={{ fontSize: 18 }}>{fruitEmoji(fruit)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fruitLabel, { color: c.text }]}>{fruitName(fruit)}</Text>
              </View>
              <Text style={[styles.fruitCount, { color: c.textSecondary }]}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Export */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('reports.exportData')}</Text>
        <View style={styles.exportRow}>
          <TouchableOpacity
            style={[styles.exportBtn, { backgroundColor: c.green }]}
            onPress={() => handleExport('csv')}
            disabled={exporting}
          >
            <Ionicons name="document-text" size={16} color="#fff" />
            <Text style={styles.exportText}>CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportBtn, { backgroundColor: c.blue }]}
            onPress={() => handleExport('pdf')}
            disabled={exporting}
          >
            <Ionicons name="download" size={16} color="#fff" />
            <Text style={styles.exportText}>PDF</Text>
          </TouchableOpacity>
        </View>
        {exporting && <ActivityIndicator style={{ marginTop: 8 }} color={c.primary} />}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  periodRow: { flexDirection: 'row', gap: Spacing.sm },
  periodChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full,
  },
  periodText: { fontSize: FontSize.xs, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700' },
  distRow: { gap: 4 },
  distLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  distLabel: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  distCount: { fontSize: FontSize.xs },
  bar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  gradeDot: { width: 8, height: 8, borderRadius: 4 },
  fruitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  fruitLabel: { fontSize: FontSize.sm, fontWeight: '600' },
  fruitCount: { fontSize: FontSize.sm, fontWeight: '700' },
  exportRow: { flexDirection: 'row', gap: Spacing.sm },
  exportBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: BorderRadius.md,
  },
  exportText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
});
