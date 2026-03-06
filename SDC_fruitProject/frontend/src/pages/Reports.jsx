import { useState, useEffect } from 'react';
import { getReportSummary, exportCSV } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { CardSkeleton } from '../components/Skeleton';
import Toast from '../components/Toast';
import {
  ChartTooltip, PieLabel, ChartLegend,
  CHART_COLORS, getTickStyle, getGridStyle, getCursorStyle,
} from '../components/ChartParts';
import { FRUIT_OPTIONS, UNIQUE_LABELS } from '../utils/fruitConstants';
import { Download, Filter, PieChart as PieIcon, BarChart3, FileSpreadsheet, CalendarDays, TrendingUp, Layers, Award, RefreshCw, X } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function Reports() {
  const { canExport } = useAuth();
  const [filters, setFilters] = useState({ start_date: '', end_date: '', label: '', grade: '', fruit_type: '' });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const fetch = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await getReportSummary(params);
      setSummary(res.data);
    } catch {
      setToast({ type: 'error', message: 'Failed to load report.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleExport = () => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    exportCSV(params);
    setToast({ type: 'success', message: 'CSV export started!' });
  };

  const clearFilters = () => {
    setFilters({ start_date: '', end_date: '', label: '', grade: '', fruit_type: '' });
  };

  const qualityData = summary ? Object.entries(summary.quality_distribution).map(([name, value]) => ({ name, value })) : [];
  const gradeData = summary ? Object.entries(summary.grade_distribution).map(([name, value]) => ({ name, value })) : [];

  const topQuality = qualityData.length ? qualityData.reduce((a, b) => (a.value > b.value ? a : b)) : null;
  const topGrade = gradeData.length ? gradeData.reduce((a, b) => (a.value > b.value ? a : b)) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary text-xs ${showFilters ? '!bg-primary-50 dark:!bg-primary-900/20 !border-primary-300 dark:!border-primary-700' : ''}`}
          >
            <Filter size={14} /> Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
              <X size={12} /> Clear all
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetch} className="btn-secondary text-xs">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {canExport && (
            <button onClick={handleExport} className="btn-primary text-xs">
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">
                <CalendarDays size={10} className="inline mr-1" /> Start Date
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))}
                className="input-field text-xs w-full"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">
                <CalendarDays size={10} className="inline mr-1" /> End Date
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))}
                className="input-field text-xs w-full"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">Label</label>
              <select
                value={filters.label}
                onChange={(e) => setFilters((f) => ({ ...f, label: e.target.value }))}
                className="input-field text-xs w-full"
              >
                <option value="">All Labels</option>
                {UNIQUE_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">Grade</label>
              <select
                value={filters.grade}
                onChange={(e) => setFilters((f) => ({ ...f, grade: e.target.value }))}
                className="input-field text-xs w-full"
              >
                <option value="">All Grades</option>
                {['Grade A', 'Grade B', 'Grade C', 'Reject'].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">Fruit Type</label>
              <select
                value={filters.fruit_type}
                onChange={(e) => setFilters((f) => ({ ...f, fruit_type: e.target.value }))}
                className="input-field text-xs w-full"
              >
                <option value="">All Fruits</option>
                {FRUIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.emoji} {opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-4">
            <button onClick={fetch} className="btn-primary text-xs">Apply Filters</button>
          </div>
        </div>
      )}

      {/* Summary section */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : summary ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card text-center !py-5 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-gray-900">
              <div className="w-10 h-10 mx-auto rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-2">
                <Layers size={18} className="text-primary-500" />
              </div>
              <p className="text-2xl font-bold">{summary.total_scans}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Total Exams</p>
            </div>
            <div className="card text-center !py-5 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-900">
              <div className="w-10 h-10 mx-auto rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                <TrendingUp size={18} className="text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{(summary.average_confidence * 100).toFixed(1)}%</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Avg Confidence</p>
            </div>
            <div className="card text-center !py-5 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-gray-900">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                <Award size={18} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{topQuality?.name || '—'}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Top Quality</p>
            </div>
            <div className="card text-center !py-5 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-gray-900">
              <div className="w-10 h-10 mx-auto rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                <FileSpreadsheet size={18} className="text-amber-500" />
              </div>
              <p className="text-2xl font-bold">{topGrade?.name || '—'}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Top Grade</p>
            </div>
          </div>

          {/* Quality breakdown bars */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-4">Quality Breakdown</h3>
            <div className="space-y-3">
              {qualityData.map((item, i) => {
                const max = Math.max(...qualityData.map((d) => d.value), 1);
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="w-20 text-xs font-medium text-gray-500">{item.name}</span>
                    <div className="flex-1 h-4 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(item.value / max) * 100}%`, backgroundColor: CHART_COLORS.quality[i] || '#8b5cf6' }}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-400 w-12 text-right">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <PieIcon size={16} className="text-primary-500" /> Quality Distribution
              </h3>
              {qualityData.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={qualityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={4}
                      stroke="none"
                      label={<PieLabel />}
                    >
                      {qualityData.map((entry, i) => (
                        <Cell key={i} fill={CHART_COLORS.qualityMap[entry.name] || CHART_COLORS.quality[i % 4]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip suffix=" exams" />} />
                    <Legend content={<ChartLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <PieIcon size={28} className="mb-2 opacity-30" />
                  <p className="text-xs">No data available</p>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-500" /> Grade Distribution
              </h3>
              {gradeData.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gradeData} barCategoryGap="20%">
                    <CartesianGrid {...getGridStyle()} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={getTickStyle()}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={getTickStyle()} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip suffix=" exams" />} cursor={getCursorStyle()} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={50}>
                      {gradeData.map((entry, i) => (
                        <Cell key={i} fill={CHART_COLORS.gradeMap[entry.name] || CHART_COLORS.grade[i % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <BarChart3 size={28} className="mb-2 opacity-30" />
                  <p className="text-xs">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Grade breakdown table */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-4">Grade Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {gradeData.map((g, i) => {
                const color = CHART_COLORS.gradeMap[g.name] || CHART_COLORS.grade[i % 4];
                return (
                <div key={g.name} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                  <div
                    className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <span className="text-sm font-bold" style={{ color }}>
                      {g.name.replace('Grade ', '')}
                    </span>
                  </div>
                  <p className="text-xl font-bold">{g.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {summary.total_scans > 0 ? ((g.value / summary.total_scans) * 100).toFixed(0) : 0}% of total
                  </p>
                </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
