import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl, Alert, TextInput,
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
  { key: 'Overripe', icon: 'warning', color: '#f59e0b' },
  { key: 'Unripe', icon: 'leaf', color: '#3b82f6' },
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
    const imageUri = item.image?.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`;
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}
        onPress={() => setExpanded(isOpen ? null : item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardRow}>
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
      <ScrollableFilters
        options={FILTER_OPTIONS}
        active={filter}
        setActive={setFilter}
        dark={dark}
        c={c}
        t={t}
      />

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
    flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.sm,
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
});
