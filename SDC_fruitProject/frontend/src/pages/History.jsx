import React, { useEffect, useState, useCallback } from 'react';
import { getRecords, deleteRecord } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { LabelBadge, GradeBadge } from '../components/Badges';
import { TableSkeleton } from '../components/Skeleton';
import Toast from '../components/Toast';
import { Trash2, ChevronLeft, ChevronRight, Filter, RefreshCw, Database, ArrowUpDown, Search, X, Download, Clock, Hash, Stethoscope, ChevronDown, FileDown, CheckSquare, Square } from 'lucide-react';
import { exportCSV } from '../api';
import { FRUIT_OPTIONS, fruitEmoji, UNIQUE_LABELS } from '../utils/fruitConstants';

export default function History() {
  const { canDelete } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({ label: '', grade: '', method: '', fruit_type: '' });
  const [sortField, setSortField] = useState('-timestamp');
  const [showFilters, setShowFilters] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [expandedId, setExpandedId] = useState(null);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, ordering: sortField };
      if (filters.label) params.label = filters.label;
      if (filters.grade) params.grade = filters.grade;
      if (filters.method) params.method = filters.method;
      if (filters.fruit_type) params.fruit_type = filters.fruit_type;
      const res = await getRecords(params);
      if (res.data.results) {
        setRecords(res.data.results);
        setTotalCount(res.data.count);
        setTotalPages(Math.ceil(res.data.count / 20));
      } else {
        const arr = Array.isArray(res.data) ? res.data : [];
        setRecords(arr);
        setTotalCount(arr.length);
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to load records.' });
    } finally {
      setLoading(false);
    }
  }, [page, sortField, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteRecord(id);
      setToast({ type: 'success', message: 'Record deleted.' });
      fetch();
    } catch {
      setToast({ type: 'error', message: 'Delete failed.' });
    }
  };

  const toggleSort = (field) => {
    setSortField((prev) => (prev === field ? `-${field}` : field));
  };

  const clearFilters = () => {
    setFilters({ label: '', grade: '', method: '', fruit_type: '' });
    setPage(1);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map((r) => r.id)));
    }
  };

  const bulkDelete = async () => {
    if (!selectedIds.size) return;
    if (!window.confirm(`Delete ${selectedIds.size} records?`)) return;
    try {
      await Promise.all([...selectedIds].map((id) => deleteRecord(id)));
      setToast({ type: 'success', message: `${selectedIds.size} records deleted.` });
      setSelectedIds(new Set());
      fetch();
    } catch {
      setToast({ type: 'error', message: 'Bulk delete failed.' });
    }
  };

  const handleExport = () => {
    const params = {};
    if (filters.label) params.label = filters.label;
    if (filters.grade) params.grade = filters.grade;
    if (filters.fruit_type) params.fruit_type = filters.fruit_type;
    exportCSV(params);
    setToast({ type: 'success', message: 'CSV export started!' });
  };

  const filteredRecords = searchId
    ? records.filter((r) => String(r.id).includes(searchId))
    : records;

  const SortIcon = ({ field }) => (
    <ArrowUpDown size={11} className={sortField === field || sortField === `-${field}` ? 'text-primary-500' : 'text-gray-300 dark:text-gray-600'} />
  );

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card !py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <Database size={16} className="text-primary-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{totalCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Records</p>
          </div>
        </div>
        <div className="card !py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Hash size={16} className="text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{records.length}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Showing</p>
          </div>
        </div>
        <div className="card !py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <Filter size={16} className="text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{activeFilterCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Active Filters</p>
          </div>
        </div>
        <div className="card !py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <Clock size={16} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{totalPages}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Pages</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card !py-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary text-xs ${showFilters ? '!bg-primary-50 dark:!bg-primary-900/20 !border-primary-300 dark:!border-primary-700' : ''}`}
        >
          <Search size={14} /> Filters
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

        {/* Search by ID */}
        <div className="relative">
          <Hash size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="Search ID…"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="input-field text-xs pl-8 w-28"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {selectedIds.size > 0 && canDelete && (
            <button onClick={bulkDelete} className="btn-secondary text-xs !border-red-200 !text-red-500 hover:!bg-red-50 dark:!border-red-800 dark:hover:!bg-red-900/20">
              <Trash2 size={14} /> Delete ({selectedIds.size})
            </button>
          )}
          <button onClick={handleExport} className="btn-secondary text-xs">
            <FileDown size={14} /> Export CSV
          </button>
          <button onClick={fetch} className="btn-secondary text-xs">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card !py-4 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-slide-up">
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">Fruit Type</label>
            <select
              value={filters.fruit_type}
              onChange={(e) => { setFilters((f) => ({ ...f, fruit_type: e.target.value })); setPage(1); }}
              className="input-field w-full text-xs"
            >
              <option value="">All Fruits</option>
              {FRUIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.emoji} {opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">Label</label>
            <select
              value={filters.label}
              onChange={(e) => { setFilters((f) => ({ ...f, label: e.target.value })); setPage(1); }}
              className="input-field w-full text-xs"
            >
              <option value="">All Labels</option>
              {UNIQUE_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">Grade</label>
            <select
              value={filters.grade}
              onChange={(e) => { setFilters((f) => ({ ...f, grade: e.target.value })); setPage(1); }}
              className="input-field w-full text-xs"
            >
              <option value="">All Grades</option>
              {['Fresh', 'Rotten'].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">Method</label>
            <select
              value={filters.method}
              onChange={(e) => { setFilters((f) => ({ ...f, method: e.target.value })); setPage(1); }}
              className="input-field w-full text-xs"
            >
              <option value="">All Methods</option>
              {['upload', 'batch', 'live', 'capture'].map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Database size={36} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No patient records found</p>
            <p className="text-xs mt-1">Try adjusting your filters or run some examinations first.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                {canDelete && (
                  <th className="pb-3 pr-2 w-8">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-primary-500 transition-colors">
                      {selectedIds.size === filteredRecords.length && filteredRecords.length > 0 ? <CheckSquare size={15} className="text-primary-500" /> : <Square size={15} />}
                    </button>
                  </th>
                )}
                <th className="pb-3 pr-2 font-medium text-gray-400 text-xs cursor-pointer select-none" onClick={() => toggleSort('id')}>
                  <span className="flex items-center gap-1">ID <SortIcon field="id" /></span>
                </th>
                <th className="pb-3 pr-2 font-medium text-gray-400 text-xs">Image</th>
                <th className="pb-3 pr-2 font-medium text-gray-400 text-xs">Fruit</th>
                <th className="pb-3 pr-2 font-medium text-gray-400 text-xs cursor-pointer select-none" onClick={() => toggleSort('predicted_label')}>
                  <span className="flex items-center gap-1">Label <SortIcon field="predicted_label" /></span>
                </th>
                <th className="pb-3 pr-2 font-medium text-gray-400 text-xs cursor-pointer select-none" onClick={() => toggleSort('confidence')}>
                  <span className="flex items-center gap-1">Confidence <SortIcon field="confidence" /></span>
                </th>
                <th className="pb-3 pr-2 font-medium text-gray-400 text-xs cursor-pointer select-none" onClick={() => toggleSort('grade')}>
                  <span className="flex items-center gap-1">Grade <SortIcon field="grade" /></span>
                </th>
                <th className="pb-3 pr-2 font-medium text-gray-400 text-xs">Method</th>
                <th className="pb-3 pr-2 font-medium text-gray-400 text-xs cursor-pointer select-none" onClick={() => toggleSort('timestamp')}>
                  <span className="flex items-center gap-1">Date <SortIcon field="timestamp" /></span>
                </th>
                {canDelete && <th className="pb-3 font-medium text-gray-400 text-xs">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {filteredRecords.map((r) => (
                <React.Fragment key={r.id}>
                  <tr
                    className={`group hover:bg-gray-50/80 dark:hover:bg-gray-900/40 transition-colors cursor-pointer ${expandedId === r.id ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    {canDelete && (
                      <td className="py-3 pr-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleSelect(r.id)} className="text-gray-400 hover:text-primary-500 transition-colors">
                          {selectedIds.has(r.id) ? <CheckSquare size={15} className="text-primary-500" /> : <Square size={15} />}
                        </button>
                      </td>
                    )}
                    <td className="py-3 pr-2">
                      <span className="text-xs font-mono text-gray-400">#{r.id}</span>
                    </td>
                    <td className="py-3 pr-2">
                      {r.image_url ? (
                        <img src={r.image_url} alt="" className="w-10 h-10 rounded-lg object-cover ring-1 ring-gray-100 dark:ring-gray-800 group-hover:ring-primary-200 dark:group-hover:ring-primary-800 transition-all" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Download size={12} className="text-gray-300" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-2">
                      <span className="inline-flex items-center gap-1 text-xs capitalize bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                        {fruitEmoji(r.fruit_type)} {r.fruit_type || 'apple'}
                      </span>
                    </td>
                    <td className="py-3 pr-2"><LabelBadge label={r.predicted_label} /></td>
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-500 transition-all"
                            style={{ width: `${(r.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{(r.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3 pr-2"><GradeBadge grade={r.grade} /></td>
                    <td className="py-3 pr-2">
                      <span className="inline-flex items-center gap-1 capitalize text-xs bg-gray-50 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-md">
                        {r.detection_method}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-xs text-gray-400">
                      {new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    {canDelete && (
                      <td className="py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                  {/* Expanded Detail Row */}
                  {expandedId === r.id && (
                    <tr className="bg-primary-50/30 dark:bg-primary-900/5">
                      <td colSpan={canDelete ? 11 : 9} className="p-4">
                        <div className="flex flex-wrap gap-6 animate-slide-up">
                          {r.image_url && (
                            <img src={r.image_url} alt="" className="w-32 h-32 rounded-xl object-cover ring-2 ring-primary-200 dark:ring-primary-800 shadow-lg" />
                          )}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3 text-xs">
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-medium">Record ID</p>
                              <p className="font-mono font-bold text-sm">#{r.id}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-medium">Fruit Type</p>
                              <p className="font-semibold capitalize">{fruitEmoji(r.fruit_type)} {r.fruit_type?.charAt(0).toUpperCase() + r.fruit_type?.slice(1)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-medium">Diagnosis</p>
                              <p className="font-semibold">{r.predicted_label}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-medium">Confidence Score</p>
                              <p className="font-bold text-primary-600">{(r.confidence * 100).toFixed(2)}%</p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-medium">Quality Grade</p>
                              <p><GradeBadge grade={r.grade} /></p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-medium">Detection Method</p>
                              <p className="capitalize font-medium">{r.detection_method}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-medium">Examined On</p>
                              <p className="font-medium">{new Date(r.timestamp).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 uppercase tracking-wider text-[10px] font-medium">Health Status</p>
                              <p className={`font-bold ${r.predicted_label === 'Fresh' ? 'text-emerald-500' : ['Rotten', 'Rot'].includes(r.predicted_label) ? 'text-red-500' : 'text-amber-500'}`}>
                                {r.predicted_label === 'Fresh' ? '✅ Healthy' : ['Rotten', 'Rot'].includes(r.predicted_label) ? '❌ Critical' : '⚠️ Needs Attention'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Page {page} of {totalPages} • {totalCount} total records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-xs"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const num = start + i;
                if (num > totalPages) return null;
                return (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      num === page
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary text-xs"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
