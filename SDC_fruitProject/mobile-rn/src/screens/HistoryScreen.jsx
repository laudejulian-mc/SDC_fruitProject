import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl, Alert, TextInput, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRecords, deleteRecord } from '../api';
import { LabelBadge, GradeBadge } from '../components/Badges';
import { fruitEmoji } from '../utils/fruitConstants';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, Spacing, FontSize, BorderRadius } from '../theme';

const PAGE_SIZE = 10;
const FILTER_OPTIONS = [
  { key: 'all', icon: 'layers' },
  { key: 'Fresh', icon: 'checkmark-circle', color: '#22c55e' },
  { key: 'Rotten', icon: 'alert-circle', color: '#ef4444' },
];

export default function HistoryScreen() {
  const { t, labelName, fruitName } = useI18n();
  const { dark } = useTheme();
  const c = useColors(dark);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expanded, setExpanded] = useState(null);

  // ─── #19 Compare Mode ──────────────────────────────────
  const [compareMode, setCompareMode] = useState(false);
  const [compareItems, setCompareItems] = useState([]);
  const [compareVisible, setCompareVisible] = useState(false);

  const loadRecords = useCallback(async (pg = 1, append = false) => {
    try {
      const res = await getRecords({ page: pg, page_size: PAGE_SIZE });
      const data = res.data.results || res.data;
      if (append) {
        setRecords((prev) => [...prev, ...data]);
      } else {
        setRecords(data);
      }
      setHasMore(data.length >= PAGE_SIZE);
      setPage(pg);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const onRefresh = () => { setRefreshing(true); loadRecords(1); };
  const onEndReached = () => { if (hasMore && !loading) loadRecords(page + 1, true); };

  const handleDelete = (id) => {
    Alert.alert(t('history.deleteConfirmTitle'), t('history.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecord(id);
            setRecords((prev) => prev.filter((r) => r.id !== id));
          } catch { /* ignore */ }
        },
      },
    ]);
  };

  // ── #19 Compare helpers ─────────────────────────────────
  const toggleCompareItem = (item) => {
    setCompareItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev.filter((i) => i.id !== item.id);
      if (prev.length >= 2) {
        Alert.alert(t('compare.maxTwo'));
        return prev;
      }
      return [...prev, item];
    });
  };

  const openComparison = () => {
    if (compareItems.length === 2) setCompareVisible(true);
  };

  const filtered = records.filter((r) => {
    if (filter !== 'all' && r.predicted_label !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (r.fruit_type || '').toLowerCase().includes(s) ||
        (r.predicted_label || '').toLowerCase().includes(s)
      );
    }
    return true;
  });

  const renderItem = ({ item }) => {
    const isOpen = expanded === item.id;
    const isSelected = compareItems.find((i) => i.id === item.id);
    const imageUri = item.image?.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`;
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: c.card,
            borderColor: isSelected ? c.primary : c.cardBorder,
            borderWidth: isSelected ? 2 : 1,
            ...c.cardShadow,
          },
        ]}
        onPress={() => compareMode ? toggleCompareItem(item) : setExpanded(isOpen ? null : item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardRow}>
          {/* ── #19 Compare checkbox ──────────────────── */}
          {compareMode && (
            <View style={[styles.compareCheck, { backgroundColor: isSelected ? c.primary : c.inputBg, borderColor: isSelected ? c.primary : c.cardBorder }]}>
              {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          )}
          {item.image && (
            <Image source={{ uri: imageUri }} style={styles.thumb} />
          )}
          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.cardTopRow}>
              <Text style={{ fontSize: 16 }}>{fruitEmoji(item.fruit_type)}</Text>
              <Text style={[styles.cardFruit, { color: c.text }]}>{fruitName(item.fruit_type)}</Text>
              <LabelBadge label={item.predicted_label} dark={dark} />
            </View>
            <View style={styles.cardMeta}>
              <Text style={[styles.metaText, { color: c.textMuted }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
              <Text style={[styles.metaText, { color: c.textMuted }]}>
                {(item.confidence * 100).toFixed(1)}%
              </Text>
              {item.grade && <GradeBadge grade={item.grade} dark={dark} />}
            </View>
          </View>
          <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={c.textMuted} />
        </View>

        {isOpen && (
          <View style={[styles.expanded, { borderTopColor: c.divider }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: c.textMuted }]}>{t('history.method')}</Text>
              <Text style={[styles.detailValue, { color: c.text }]}>{item.detection_method || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: c.textMuted }]}>{t('history.confidence')}</Text>
              <View style={[styles.bar, { backgroundColor: c.cardBorderSubtle }]}>
                <View style={[styles.barFill, { width: `${(item.confidence * 100)}%`, backgroundColor: c.primary }]} />
              </View>
              <Text style={[styles.detailValue, { color: c.text }]}>{(item.confidence * 100).toFixed(1)}%</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash" size={14} color={c.red} />
              <Text style={[styles.deleteText, { color: c.red }]}>{t('history.delete')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* ── #19 Comparison Modal ──────────────────────── */}
      <Modal visible={compareVisible} transparent animationType="slide">
        <View style={styles.compareOverlay}>
          <View style={[styles.compareModal, { backgroundColor: c.card, ...c.cardShadowElevated }]}>
            <View style={styles.compareHeader}>
              <Text style={[styles.compareTitle, { color: c.text }]}>⚖️ {t('compare.title')}</Text>
              <TouchableOpacity onPress={() => setCompareVisible(false)}>
                <Ionicons name="close" size={22} color={c.textMuted} />
              </TouchableOpacity>
            </View>

            {compareItems.length === 2 && (
              <>
                {/* Side-by-side cards */}
                <View style={styles.compareCards}>
                  {compareItems.map((item, idx) => {
                    const imgUri = item.image?.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`;
                    return (
                      <View key={item.id} style={[styles.compareCard, { backgroundColor: c.backgroundSecondary, borderColor: c.cardBorder }]}>
                        <Text style={[styles.compareCardHeader, { color: c.textMuted }]}>
                          {idx === 0 ? t('compare.result1') : t('compare.result2')}
                        </Text>
                        {item.image && <Image source={{ uri: imgUri }} style={styles.compareThumb} resizeMode="cover" />}
                        <Text style={{ fontSize: 20, textAlign: 'center' }}>{fruitEmoji(item.fruit_type)}</Text>
                        <Text style={[styles.compareItemFruit, { color: c.text }]}>{fruitName(item.fruit_type)}</Text>
                        <LabelBadge label={item.predicted_label} dark={dark} />
                        <Text style={[styles.compareConf, { color: c.primary }]}>
                          {(item.confidence * 100).toFixed(1)}%
                        </Text>
                        {item.grade && <GradeBadge grade={item.grade} dark={dark} />}
                      </View>
                    );
                  })}
                </View>

                {/* VS divider */}
                <View style={styles.vsRow}>
                  <View style={[styles.vsDivider, { backgroundColor: c.cardBorder }]} />
                  <View style={[styles.vsBadge, { backgroundColor: c.primary }]}>
                    <Text style={styles.vsText}>{t('compare.vsLabel')}</Text>
                  </View>
                  <View style={[styles.vsDivider, { backgroundColor: c.cardBorder }]} />
                </View>

                {/* Quick analysis */}
                <View style={[styles.analysisBox, { backgroundColor: c.infoBg, borderColor: c.infoBorder }]}>
                  <Text style={[styles.analysisTitle, { color: c.infoText }]}>🔍 {t('compare.analysis')}</Text>
                  {compareItems[0].predicted_label === compareItems[1].predicted_label ? (
                    <Text style={[styles.analysisText, { color: c.textSecondary }]}>
                      ✅ {t('compare.sameLabel')} {labelName(compareItems[0].predicted_label)}
                    </Text>
                  ) : (
                    <Text style={[styles.analysisText, { color: c.textSecondary }]}>
                      ⚠️ {t('compare.diffLabel')}: {labelName(compareItems[0].predicted_label)} vs {labelName(compareItems[1].predicted_label)}
                    </Text>
                  )}
                  <Text style={[styles.analysisText, { color: c.textSecondary }]}>
                    📊 {t('compare.confGap')}: {Math.abs((compareItems[0].confidence - compareItems[1].confidence) * 100).toFixed(1)}%
                  </Text>
                  {compareItems[0].confidence !== compareItems[1].confidence && (
                    <Text style={[styles.analysisBetter, { color: c.green }]}>
                      🏆 {t('compare.betterResult')}: {
                        compareItems[0].confidence > compareItems[1].confidence ? t('compare.result1') : t('compare.result2')
                      }
                    </Text>
                  )}
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={() => setCompareVisible(false)}
              style={[styles.compareCloseBtn, { backgroundColor: c.primary }]}
            >
              <Text style={styles.compareCloseBtnText}>{t('compare.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Search */}
      <View style={[styles.searchBox, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
        <Ionicons name="search" size={16} color={c.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          placeholder={t('history.searchPlaceholder')}
          placeholderTextColor={c.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search !== '' && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={c.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterAndCompare}>
        <ScrollableFilters
          options={FILTER_OPTIONS}
          active={filter}
          setActive={setFilter}
          dark={dark}
          c={c}
          t={t}
        />

        {/* ── #19 Compare toggle ───────────────────────── */}
        <TouchableOpacity
          onPress={() => { setCompareMode((v) => !v); setCompareItems([]); }}
          style={[styles.compareToggle, { backgroundColor: compareMode ? c.primary : c.inputBg }]}
        >
          <Ionicons name="git-compare-outline" size={14} color={compareMode ? '#fff' : c.textMuted} />
          <Text style={[styles.compareToggleText, { color: compareMode ? '#fff' : c.textSecondary }]}>
            {compareMode ? 'Exit' : t('compare.compareBtn')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── #19 Compare action bar ─────────────────────── */}
      {compareMode && (
        <View style={[styles.compareBar, { backgroundColor: c.primaryLight }]}>
          <Text style={[styles.compareBarText, { color: c.primary }]}>
            {compareItems.length === 2
              ? t('compare.selected', { n: 2 })
              : t('compare.selectRecords', { n: 2 - compareItems.length })}
          </Text>
          {compareItems.length === 2 && (
            <TouchableOpacity onPress={openComparison} style={[styles.compareBarBtn, { backgroundColor: c.primary }]}>
              <Ionicons name="git-compare" size={14} color="#fff" />
              <Text style={styles.compareBarBtnText}>{t('compare.compareBtn')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Count */}
      <Text style={[styles.count, { color: c.textMuted }]}>
        {filtered.length} {t('history.records')}
      </Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="folder-open" size={40} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>{t('history.noRecords')}</Text>
          </View>
        }
      />
    </View>
  );
}

function ScrollableFilters({ options, active, setActive, dark, c, t }) {
  return (
    <View style={styles.filterRow}>
      {options.map((opt) => {
        const isActive = active === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: isActive ? c.primary : c.inputBg,
              },
            ]}
            onPress={() => setActive(opt.key)}
          >
            <Ionicons
              name={opt.icon}
              size={14}
              color={isActive ? '#fff' : (opt.color || c.textMuted)}
            />
            <Text style={[styles.filterText, { color: isActive ? '#fff' : c.textSecondary }]}>
              {opt.key === 'all' ? t('history.all') : opt.key}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: Spacing.lg, marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, height: 42,
  },
  searchInput: { flex: 1, fontSize: FontSize.sm },
  filterRow: {
    flexDirection: 'row', flex: 1, paddingLeft: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full,
  },
  filterText: { fontSize: FontSize.xs, fontWeight: '600' },
  count: { paddingHorizontal: Spacing.lg, fontSize: FontSize.xs, marginBottom: Spacing.sm },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  thumb: { width: 50, height: 50, borderRadius: BorderRadius.md },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardFruit: { fontSize: FontSize.sm, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: FontSize.xs },
  expanded: { borderTopWidth: 1, marginTop: Spacing.md, paddingTop: Spacing.md, gap: Spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: FontSize.xs, width: 80 },
  detailValue: { fontSize: FontSize.sm, fontWeight: '600' },
  bar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', paddingVertical: 4 },
  deleteText: { fontSize: FontSize.xs, fontWeight: '600' },
  empty: { alignItems: 'center', gap: Spacing.md, paddingVertical: 60 },
  emptyText: { fontSize: FontSize.md },

  // ── #19 Compare mode ───────────────────────────────────
  filterAndCompare: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.lg,
  },
  compareToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  compareToggleText: { fontSize: FontSize.xs, fontWeight: '600' },
  compareCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  compareBarText: { fontSize: FontSize.xs, fontWeight: '600' },
  compareBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  compareBarBtnText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600' },

  // ── #19 Comparison modal ──────────────────────────────
  compareOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  compareModal: {
    width: '100%',
    maxWidth: 420,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    gap: Spacing.md,
    maxHeight: '90%',
  },
  compareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compareTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  compareCards: { flexDirection: 'row', gap: Spacing.sm },
  compareCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  compareCardHeader: { fontSize: FontSize.xs, fontWeight: '700' },
  compareThumb: { width: 60, height: 60, borderRadius: BorderRadius.sm },
  compareItemFruit: { fontSize: FontSize.sm, fontWeight: '600' },
  compareConf: { fontSize: FontSize.lg, fontWeight: '700' },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vsDivider: { flex: 1, height: 1 },
  vsBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  vsText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700' },
  analysisBox: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 6,
  },
  analysisTitle: { fontSize: FontSize.sm, fontWeight: '700' },
  analysisText: { fontSize: FontSize.xs, lineHeight: 18 },
  analysisBetter: { fontSize: FontSize.sm, fontWeight: '700', marginTop: 4 },
  compareCloseBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  compareCloseBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
});
