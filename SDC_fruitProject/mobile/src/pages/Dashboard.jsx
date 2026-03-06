import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../api';
import { StatCard } from '../components/StatCard';
import { CardSkeleton } from '../components/Skeleton';
import { LabelBadge, GradeBadge } from '../components/Badges';
import { fruitEmoji } from '../utils/fruitConstants';
import { useI18n } from '../contexts/I18nContext';
import {
  ScanSearch, Stethoscope, Target, Award,
  HeartPulse, Activity, CheckCircle2, XCircle, AlertTriangle,
  Leaf, ArrowRight, Timer,
} from 'lucide-react';

/* Freshness Ring */
function FreshnessRing({ value, size = 80 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 70 ? '#22c55e' : value >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="7" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, labelName, fruitName } = useI18n();

  useEffect(() => {
    getDashboardStats()
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Stethoscope size={40} className="text-gray-300 dark:text-gray-600" />
        <p className="text-gray-400 text-sm">Failed to load clinic data.</p>
      </div>
    );
  }

  const totalScans = stats.total_scans;
  const freshCount = stats.quality_distribution.Fresh || 0;
  const healthRate = totalScans > 0 ? ((freshCount / totalScans) * 100).toFixed(1) : 0;
  const avgConf = stats.recent_detections.length
    ? (stats.recent_detections.reduce((s, d) => s + d.confidence, 0) / stats.recent_detections.length * 100).toFixed(1)
    : 0;
  const avgSpeed = stats.recent_detections.length
    ? (stats.recent_detections.reduce((s, d) => s + (d.processing_time || 0), 0) / stats.recent_detections.length).toFixed(2)
    : '—';

  const qualityData = Object.entries(stats.quality_distribution);
  const gradeData = Object.entries(stats.grade_distribution);
  const fruitData = stats.fruit_distribution ? Object.entries(stats.fruit_distribution) : [];

  return (
    <div className="space-y-4">
      {/* Welcome banner */}
      <div className="card bg-gradient-to-r from-primary-600 to-emerald-600 dark:from-primary-700 dark:to-emerald-700 text-white !border-0 relative overflow-hidden" style={{ backgroundSize: '200% 200%', animation: 'gradientX 15s ease infinite' }}>
        <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/10 -mr-8 -mt-8 blur-2xl animate-float" />
        <div className="relative z-10">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Stethoscope size={18} /> {t('dashboard.clinicOverview')}
          </h2>
          <p className="text-white/70 text-xs mt-1">
            {totalScans} {t('dashboard.totalExamsPerformed')}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full text-xs">
              <HeartPulse size={12} /> {healthRate}% {t('dashboard.healthRate')}
            </div>
            <div className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full text-xs">
              <Activity size={12} /> {t('dashboard.clinicActive')}
            </div>
          </div>
        </div>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={ScanSearch} label={t('dashboard.totalExams')} value={totalScans} color="primary" />
        <StatCard icon={HeartPulse} label={t('dashboard.healthyFruit')} value={freshCount} color="primary" />
        <StatCard icon={Target} label={t('dashboard.avgConfidence')} value={`${avgConf}%`} color="blue" />
        <StatCard icon={Leaf} label={t('dashboard.gradeA')} value={freshCount} color="green" />
      </div>

      {/* Freshness + Speed row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex flex-col items-center text-center !py-4">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Leaf size={12} className="text-green-500" /> {t('dashboard.freshnessIndex')}
          </h4>
          <FreshnessRing value={Math.round(parseFloat(healthRate))} />
        </div>
        <div className="card flex flex-col items-center text-center !py-4">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Timer size={12} className="text-blue-500" /> {t('dashboard.avgDetectionSpeed')}
          </h4>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avgSpeed}s</p>
          <p className="text-xs text-gray-400 mt-1">{t('dashboard.perExam')}</p>
        </div>
      </div>

      {/* Quality breakdown */}
      <div className="card space-y-3">
        <h4 className="text-sm font-bold">{t('dashboard.healthDistribution')}</h4>
        {qualityData.map(([label, count]) => {
          const pct = totalScans > 0 ? ((count / totalScans) * 100).toFixed(0) : 0;
          const barColor = label === 'Fresh' ? 'bg-green-500' : 'bg-red-500';
          return (
            <div key={label} className="flex items-center gap-3">
              <span className="text-sm w-16 font-medium">{labelName(label)}</span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-bold tabular-nums w-10 text-right">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Grade distribution */}
      <div className="card space-y-3">
        <h4 className="text-sm font-bold">{t('dashboard.gradeDistribution')}</h4>
        <div className="grid grid-cols-4 gap-2">
          {gradeData.map(([grade, count]) => (
            <div key={grade} className="text-center">
              <GradeBadge grade={grade} />
              <p className="text-lg font-bold mt-1">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fruit distribution */}
      {fruitData.length > 0 && (
        <div className="card space-y-3">
          <h4 className="text-sm font-bold">{t('dashboard.patientDistribution')}</h4>
          {fruitData.map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-base">{fruitEmoji(name)}</span>
              <span className="text-sm font-medium flex-1 capitalize">{fruitName(name)}</span>
              <span className="text-sm font-bold tabular-nums">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent exams */}
      <div className="card space-y-3">
        <h4 className="text-sm font-bold">{t('dashboard.recentExams')}</h4>
        {stats.recent_detections.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">{t('dashboard.noExamsYet')}</p>
        ) : (
          <div className="space-y-2">
            {stats.recent_detections.slice(0, 8).map((d, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{fruitEmoji(d.fruit_type)}</span>
                  <div>
                    <p className="text-sm font-medium">{labelName(d.predicted_label)}</p>
                    <p className="text-[10px] text-gray-400">{d.grade}</p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums">{(d.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/detect')} className="card !p-4 flex items-center gap-3 active:scale-[0.97] transition-all">
          <ScanSearch size={20} className="text-primary-500" />
          <div className="text-left">
            <p className="text-sm font-semibold">{t('dashboard.newDiagnosis')}</p>
            <p className="text-[10px] text-gray-400">{t('nav.detect')}</p>
          </div>
        </button>
        <button onClick={() => navigate('/history')} className="card !p-4 flex items-center gap-3 active:scale-[0.97] transition-all">
          <ArrowRight size={20} className="text-primary-500" />
          <div className="text-left">
            <p className="text-sm font-semibold">{t('dashboard.viewHistory')}</p>
            <p className="text-[10px] text-gray-400">{t('nav.history')}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
