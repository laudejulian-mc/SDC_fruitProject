import { useState, useEffect, useCallback } from 'react';
import { getReportSummary, exportCSV } from '../api';
import { StatCard } from '../components/StatCard';
import { CardSkeleton } from '../components/Skeleton';
import { GradeBadge } from '../components/Badges';
import Toast from '../components/Toast';
import { FRUIT_OPTIONS } from '../utils/fruitConstants';
import { useI18n } from '../contexts/I18nContext';
import {
  BarChart3, ScanSearch, Target, Award, Download, RefreshCw,
  Filter, Stethoscope, Loader2,
} from 'lucide-react';
import clsx from 'clsx';

export default function Reports() {
  const { t, fruitName, labelName } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    start_date: '', end_date: '', predicted_label: '', grade: '', fruit_type: '',
  });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await getReportSummary(params);
      setData(res.data);
    } catch {
      setToast({ type: 'error', message: t('reports.failedToLoad') });
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExport = () => {
    exportCSV(filters);
    setToast({ type: 'success', message: t('reports.csvExportStarted') });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Stethoscope size={36} className="mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-sm">{t('reports.noData')}</p>
      </div>
    );
  }

  const qualityData = data.quality_distribution ? Object.entries(data.quality_distribution) : [];
  const gradeData = data.grade_distribution ? Object.entries(data.grade_distribution) : [];
  const totalExams = data.total_count || 0;

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{t('nav.reports')}</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={clsx('p-2 rounded-xl', showFilters ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-gray-100 dark:bg-gray-800')}>
            <Filter size={18} />
          </button>
          <button onClick={fetchReport} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleExport} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold">{t('reports.filters')}</h4>
            <button onClick={() => setFilters({ start_date: '', end_date: '', predicted_label: '', grade: '', fruit_type: '' })} className="text-xs text-gray-400">{t('reports.clearAll')}</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} className="input-field !py-2 text-sm" placeholder={t('reports.startDate')} />
            <input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} className="input-field !py-2 text-sm" placeholder={t('reports.endDate')} />
          </div>
          <select value={filters.fruit_type} onChange={(e) => setFilters({ ...filters, fruit_type: e.target.value })} className="input-field !py-2 text-sm">
            <option value="">{t('allFruits')}</option>
            {FRUIT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.emoji} {fruitName(f.value)}</option>)}
          </select>
          <button onClick={fetchReport} className="btn-primary w-full !py-2.5 text-sm">{t('reports.applyFilters')}</button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={ScanSearch} label={t('reports.totalExams')} value={totalExams} color="primary" />
        <StatCard icon={Target} label={t('reports.avgConfidence')} value={data.avg_confidence ? `${(data.avg_confidence * 100).toFixed(1)}%` : '—'} color="blue" />
        <StatCard icon={BarChart3} label={t('reports.topQuality')} value={data.top_quality || '—'} color="primary" />
        <StatCard icon={Award} label={t('reports.topGrade')} value={data.top_grade || '—'} color="yellow" />
      </div>

      {/* Quality breakdown */}
      {qualityData.length > 0 && (
        <div className="card space-y-3">
          <h4 className="text-sm font-bold">{t('reports.qualityDistribution')}</h4>
          {qualityData.map(([label, count]) => {
            const pct = totalExams > 0 ? ((count / totalExams) * 100).toFixed(0) : 0;
            return (
              <div key={label} className="flex items-center gap-3">
                <span className="text-sm w-16 font-medium">{labelName(label)}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${label === 'Fresh' ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-bold w-8 text-right">{count}</span>
                <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Grade breakdown */}
      {gradeData.length > 0 && (
        <div className="card space-y-3">
          <h4 className="text-sm font-bold">{t('reports.gradeDistribution')}</h4>
          <div className="grid grid-cols-2 gap-2">
            {gradeData.map(([grade, count]) => (
              <div key={grade} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <GradeBadge grade={grade} />
                <div className="text-right">
                  <p className="text-base font-bold">{count}</p>
                  <p className="text-[10px] text-gray-400">{totalExams > 0 ? ((count / totalExams) * 100).toFixed(0) : 0}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
