import { useState, useEffect, useCallback } from 'react';
import { getRecords, deleteRecord, exportCSV } from '../api';
import { LabelBadge, GradeBadge } from '../components/Badges';
import Toast from '../components/Toast';
import { fruitEmoji, FRUIT_OPTIONS } from '../utils/fruitConstants';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Search, Trash2, Download, RefreshCw, ChevronLeft, ChevronRight,
  Stethoscope, Filter, X, Loader2, SlidersHorizontal,
} from 'lucide-react';
import clsx from 'clsx';

export default function History() {
  const { t, fruitName, labelName } = useI18n();
  const { canDelete, canExport } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [filters, setFilters] = useState({
    search: '', fruit_type: '', predicted_label: '', grade: '', detection_method: '',
  });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 15 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await getRecords(params);
      setRecords(res.data.results || res.data);
      setTotalPages(Math.ceil((res.data.count || res.data.length) / 15));
      setTotalCount(res.data.count || res.data.length);
    } catch {
      setToast({ type: 'error', message: t('history.failedToLoad') });
    } finally {
      setLoading(false);
    }
  }, [page, filters, t]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = async (id) => {
    if (!confirm(t('history.deleteConfirm'))) return;
    try {
      await deleteRecord(id);
      setToast({ type: 'success', message: t('history.recordDeleted') });
      fetchRecords();
    } catch {
      setToast({ type: 'error', message: t('history.deleteFailed') });
    }
  };

  const handleExport = () => {
    exportCSV(filters);
    setToast({ type: 'success', message: t('history.csvExportStarted') });
  };

  const clearFilters = () => {
    setFilters({ search: '', fruit_type: '', predicted_label: '', grade: '', detection_method: '' });
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{t('nav.history')}</h2>
          <p className="text-xs text-gray-400">{totalCount} {t('history.totalRecordsLabel')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={clsx('p-2 rounded-xl transition-colors', showFilters ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-gray-100 dark:bg-gray-800')}>
            <SlidersHorizontal size={18} />
          </button>
          <button onClick={fetchRecords} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 active:bg-gray-200">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          {canExport && (
            <button onClick={handleExport} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 active:bg-gray-200">
              <Download size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold flex items-center gap-1.5"><Filter size={14} /> {t('history.filters')}</h4>
            <button onClick={clearFilters} className="text-xs text-gray-400 active:text-red-500">{t('history.clearAll')}</button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
              placeholder={t('history.searchId')}
              className="input-field !pl-9 !py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={filters.fruit_type} onChange={(e) => { setFilters({ ...filters, fruit_type: e.target.value }); setPage(1); }} className="input-field !py-2 text-sm">
              <option value="">{t('allFruits')}</option>
              {FRUIT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.emoji} {fruitName(f.value)}</option>)}
            </select>
            <select value={filters.predicted_label} onChange={(e) => { setFilters({ ...filters, predicted_label: e.target.value }); setPage(1); }} className="input-field !py-2 text-sm">
              <option value="">{t('allLabels')}</option>
              <option value="Fresh">{labelName('Fresh')}</option>
              <option value="Rotten">{labelName('Rotten')}</option>
            </select>
          </div>
        </div>
      )}

      {/* Records list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary-500" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Stethoscope size={36} className="mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium">{t('history.noRecordsFound')}</p>
          <p className="text-xs mt-1">{t('history.adjustFilters')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((rec) => (
            <div key={rec.id} className="card !p-3 space-y-2" onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}>
              <div className="flex items-center gap-3">
                {rec.image_url && (
                  <img src={rec.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{fruitEmoji(rec.fruit_type)}</span>
                    <span className="text-sm font-semibold capitalize">{fruitName(rec.fruit_type)}</span>
                    <LabelBadge label={rec.predicted_label} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 tabular-nums">{(rec.confidence * 100).toFixed(1)}%</span>
                    <GradeBadge grade={rec.grade} />
                    <span className="text-xs text-gray-400">{new Date(rec.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === rec.id && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2 animate-slide-up">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-400">{t('history.recordId')}:</span> <span className="font-medium">#{rec.id}</span></div>
                    <div><span className="text-gray-400">{t('history.detectionMethod')}:</span> <span className="font-medium capitalize">{rec.detection_method}</span></div>
                    <div><span className="text-gray-400">{t('result.time')}:</span> <span className="font-medium">{rec.processing_time}s</span></div>
                    <div><span className="text-gray-400">{t('history.examinedOn')}:</span> <span className="font-medium">{new Date(rec.created_at).toLocaleString()}</span></div>
                  </div>
                  {canDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(rec.id); }}
                      className="flex items-center gap-1.5 text-xs text-red-500 active:text-red-700 py-1"
                    >
                      <Trash2 size={12} /> {t('history.delete')}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium disabled:opacity-40 active:scale-95"
          >
            <ChevronLeft size={16} /> {t('history.prev')}
          </button>
          <span className="text-xs text-gray-400">
            {t('history.page')} {page} {t('history.of')} {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium disabled:opacity-40 active:scale-95"
          >
            {t('history.next')} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
