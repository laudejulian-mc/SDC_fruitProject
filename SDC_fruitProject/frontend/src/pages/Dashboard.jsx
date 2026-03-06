import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../api';
import { StatCard } from '../components/StatCard';
import { CardSkeleton } from '../components/Skeleton';
import { LabelBadge, GradeBadge } from '../components/Badges';
import {
  ChartTooltip, PieLabel, ChartLegend,
  CHART_COLORS, getTickStyle, getGridStyle, getCursorStyle,
} from '../components/ChartParts';
import { fruitEmoji } from '../utils/fruitConstants';
import { useI18n } from '../contexts/I18nContext';
import {
  BarChart3, ScanSearch, TrendingUp, Stethoscope, Clock, Zap, Target, Award,
  Upload, Video, Camera, ArrowUpRight, ArrowDownRight, Layers, ShieldCheck,
  CheckCircle2, XCircle, AlertTriangle, Leaf, HeartPulse, Cherry, Activity,
  MessageSquareText, FileBarChart, History as HistoryIcon, Gauge, Trophy,
  ArrowRight, Flame, ThermometerSun, Timer, ShieldAlert, BarChart2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar, Legend,
} from 'recharts';

const METHOD_ICONS = { upload: Upload, batch: Layers, live: Video, capture: Camera };
const LABEL_ICONS = { Fresh: CheckCircle2, Bruised: AlertTriangle, Rot: XCircle, Scab: ShieldAlert, 'Black Spot': AlertTriangle, Rotten: XCircle, Overripe: AlertTriangle, Unripe: AlertTriangle, Mold: XCircle, 'Sun Burn': AlertTriangle };
const LABEL_COLORS_MAP = { Fresh: 'text-green-500', Bruised: 'text-amber-500', Rot: 'text-red-500', Scab: 'text-orange-500', 'Black Spot': 'text-purple-500', Rotten: 'text-red-600', Overripe: 'text-yellow-500', Unripe: 'text-lime-500', Mold: 'text-teal-500', 'Sun Burn': 'text-rose-500' };

/* ── Freshness Index Ring ─────────────────────────────── */
function FreshnessRing({ value, size = 96, t = (k) => k }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 70 ? '#22c55e' : value >= 40 ? '#f59e0b' : '#ef4444';
  const label = value >= 70 ? t('dashboard.excellent') : value >= 40 ? t('dashboard.fair') : t('dashboard.poor');
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="8" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</span>
    </div>
  );
}

/* ── Activity Mini-bars ───────────────────────────────── */
function QualityMiniBars({ data }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-[3px] h-10">
      {data.slice(-14).map((d, i) => (
        <div key={i} className="group relative flex-1 min-w-[4px]">
          <div className="w-full rounded-sm transition-all duration-300 hover:opacity-80" style={{ height: `${Math.max((d.count / max) * 100, 8)}%`, backgroundColor: CHART_COLORS.trend, opacity: 0.4 + (i / 14) * 0.6 }} />
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block">
            <span className="text-[9px] bg-gray-900 dark:bg-gray-700 text-white px-1.5 py-0.5 rounded whitespace-nowrap">{d.count}</span>
          </div>
        </div>
      ))}
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Stethoscope size={48} className="text-gray-300 dark:text-gray-600" />
        <p className="text-gray-400">Failed to load clinic data.</p>
      </div>
    );
  }

  const qualityData = Object.entries(stats.quality_distribution).map(([name, value]) => ({ name, value }));
  const gradeData = Object.entries(stats.grade_distribution).map(([name, value]) => ({ name, value }));
  const dailyData = stats.daily_counts || [];
  const methodData = Object.entries(stats.method_distribution).map(([name, value]) => ({ name, value }));
  const fruitData = stats.fruit_distribution
    ? Object.entries(stats.fruit_distribution).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, emoji: fruitEmoji(name) }))
    : [];

  const totalScans = stats.total_scans;
  const freshCount = stats.quality_distribution.Fresh || 0;
  const rottenCount = (stats.quality_distribution.Rotten || 0) + (stats.quality_distribution.Rot || 0);
  const gradeACount = stats.grade_distribution['Grade A'] || 0;

  const avgConf = stats.recent_detections.length
    ? (stats.recent_detections.reduce((s, d) => s + d.confidence, 0) / stats.recent_detections.length * 100).toFixed(1)
    : 0;

  const healthRate = totalScans > 0 ? ((freshCount / totalScans) * 100).toFixed(1) : 0;
  const rejectCount = stats.grade_distribution['Reject'] || 0;
  const rejectRate = totalScans > 0 ? ((rejectCount / totalScans) * 100).toFixed(1) : 0;
  const avgSpeed = stats.recent_detections.length
    ? (stats.recent_detections.reduce((s, d) => s + (d.processing_time || 0), 0) / stats.recent_detections.length).toFixed(2)
    : '—';

  // Radial data for health score
  const radialData = [
    { name: 'Health', value: parseFloat(healthRate), fill: '#22c55e' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="card bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-600 dark:from-primary-700 dark:via-primary-600 dark:to-emerald-700 text-white !border-0 relative overflow-hidden" style={{ backgroundSize: '200% 200%', animation: 'gradientX 15s ease infinite' }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -mr-10 -mt-10 blur-2xl animate-float" />
        <div className="absolute bottom-0 left-1/2 w-64 h-32 rounded-full bg-white/5 blur-3xl animate-float-slow" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Stethoscope size={22} /> {t('dashboard.clinicOverview')}
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {totalScans} {t('dashboard.totalExamsPerformed')} • {Object.keys(stats.method_distribution).length} {t('dashboard.diagnosticMethods')}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl">
              <HeartPulse size={16} />
              <span className="text-sm font-medium">{healthRate}% {t('dashboard.healthRate')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-2 rounded-xl">
              <Activity size={16} />
              <span className="text-sm font-medium">{t('dashboard.clinicActive')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary stat cards - row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ScanSearch} label={t('dashboard.totalExams')} value={totalScans} color="primary" sub={t('dashboard.allTimeDiagnoses')} />
        <StatCard icon={HeartPulse} label={t('dashboard.healthyFruit')} value={freshCount} color="primary" sub={`${healthRate}% ${t('dashboard.healthRateLabel')}`} />
        <StatCard icon={Target} label={t('dashboard.avgConfidence')} value={`${avgConf}%`} color="blue" sub={t('dashboard.diagnosticAccuracy')} />
        <StatCard icon={Award} label={t('dashboard.gradeA')} value={gradeACount} color="yellow" sub={t('dashboard.premiumQuality')} />
      </div>

      {/* Secondary stat cards - row 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(stats.quality_distribution).map(([label, count]) => {
          const pct = totalScans > 0 ? ((count / totalScans) * 100).toFixed(0) : 0;
          const Icon = LABEL_ICONS[label] || AlertTriangle;
          const barColor = label === 'Fresh' ? 'bg-green-500' : label === 'Bruised' ? 'bg-amber-500' : label === 'Rot' ? 'bg-red-500' : label === 'Scab' ? 'bg-orange-500' : label === 'Black Spot' ? 'bg-purple-500' : label === 'Rotten' ? 'bg-red-600' : label === 'Overripe' ? 'bg-yellow-500' : label === 'Unripe' ? 'bg-lime-500' : label === 'Mold' ? 'bg-teal-500' : label === 'Sun Burn' ? 'bg-rose-500' : 'bg-gray-500';
          return (
            <div key={label} className="card animate-slide-up space-y-2">
              <div className="flex items-center justify-between">
                <Icon size={18} className={LABEL_COLORS_MAP[label] || 'text-gray-400'} />
                <span className="text-xs font-medium text-gray-400">{pct}%</span>
              </div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight Widgets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex flex-col items-center justify-center text-center animate-slide-up">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
            <Leaf size={14} className="text-green-500" /> {t('dashboard.freshnessIndex')}
          </h4>
          <FreshnessRing value={Math.round(parseFloat(healthRate))} t={t} />
        </div>
        <div className="card animate-slide-up">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
            <Timer size={14} className="text-blue-500" /> {t('dashboard.avgDetectionSpeed')}
          </h4>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{avgSpeed}<span className="text-sm font-normal text-gray-400 ml-1">{t('dashboard.sec')}</span></p>
          <p className="text-xs text-gray-400 mt-2">{t('dashboard.perExam')}</p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-full font-medium ${parseFloat(avgSpeed) < 1 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
              {parseFloat(avgSpeed) < 1 ? t('dashboard.fast') : t('dashboard.normal')}
            </span>
          </div>
        </div>
        <div className="card animate-slide-up">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-red-500" /> {t('dashboard.rejectRate')}
          </h4>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{rejectRate}<span className="text-sm font-normal text-gray-400 ml-1">%</span></p>
          <p className="text-xs text-gray-400 mt-2">{rejectCount} / {totalScans} {t('dashboard.rejected')}</p>
          <div className="mt-3 w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-red-500 transition-all duration-700" style={{ width: `${rejectRate}%` }} />
          </div>
        </div>
        <div className="card animate-slide-up">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
            <BarChart2 size={14} className="text-teal-500" /> {t('dashboard.recentActivity')}
          </h4>
          {dailyData.length > 0 ? (
            <>
              <QualityMiniBars data={dailyData} />
              <p className="text-xs text-gray-400 mt-2">{t('dashboard.lastDays').replace('{n}', Math.min(dailyData.length, 14))}</p>
            </>
          ) : <p className="text-xs text-gray-400">No activity data</p>}
        </div>
      </div>

      {/* Fruit Distribution */}
      {fruitData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Cherry size={16} className="text-pink-500" /> {t('dashboard.patientDistribution')}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fruitData} layout="vertical">
                <CartesianGrid {...getGridStyle()} vertical={false} />
                <XAxis type="number" tick={getTickStyle()} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={getTickStyle(12)} width={60} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip suffix=" exams" />} cursor={getCursorStyle()} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={32}>
                  {fruitData.map((entry, i) => (
                    <Cell key={i} fill={CHART_COLORS.fruit[entry.name.toLowerCase()] || '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Stethoscope size={16} className="text-primary-500" /> {t('dashboard.clinicHealthScore')}
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" barSize={16} data={radialData} startAngle={180} endAngle={0}>
                  <RadialBar background dataKey="value" cornerRadius={10} />
                  <Tooltip content={<ChartTooltip suffix="%" />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center -mt-8">
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{healthRate}%</p>
              <p className="text-sm text-gray-400 mt-1">{t('dashboard.overallHealthScore')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts - row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality pie */}
        <div className="card">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <HeartPulse size={16} className="text-primary-500" /> {t('dashboard.healthDistribution')}
          </h3>
          {qualityData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={qualityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} stroke="none"
                  label={<PieLabel />}>
                  {qualityData.map((entry, i) => <Cell key={i} fill={CHART_COLORS.qualityMap[entry.name] || CHART_COLORS.quality[i % 4]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend content={<ChartLegend />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-20">No data yet</p>}
        </div>

        {/* Grade bar */}
        <div className="card">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Award size={16} className="text-yellow-500" /> {t('dashboard.gradeDistribution')}
          </h3>
          {gradeData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={gradeData} barCategoryGap="20%">
                <CartesianGrid {...getGridStyle()} vertical={false} />
                <XAxis dataKey="name" tick={getTickStyle()} axisLine={false} tickLine={false} />
                <YAxis tick={getTickStyle()} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={getCursorStyle()} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  {gradeData.map((entry, i) => <Cell key={i} fill={CHART_COLORS.gradeMap[entry.name] || CHART_COLORS.grade[i % 4]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-20">No data yet</p>}
        </div>

        {/* Method breakdown */}
        <div className="card">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Layers size={16} className="text-blue-500" /> {t('dashboard.diagnosticMethodsChart')}
          </h3>
          {methodData.length ? (
            <div className="space-y-4 pt-2">
              {methodData.map(({ name, value }) => {
                const Icon = METHOD_ICONS[name] || ScanSearch;
                const pct = totalScans > 0 ? ((value / totalScans) * 100).toFixed(0) : 0;
                return (
                  <div key={name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-gray-400" />
                        <span className="text-sm capitalize font-medium">{name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{value} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-20">No data yet</p>}
        </div>
      </div>

      {/* Daily trend */}
      {dailyData.length > 0 && (
        <div className="card">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-500" /> {t('dashboard.examTrend')}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.trend} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.trend} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...getGridStyle()} vertical={false} />
              <XAxis dataKey="date" tick={getTickStyle(10)} axisLine={false} tickLine={false} />
              <YAxis tick={getTickStyle()} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip suffix=" scans" />} cursor={{ stroke: CHART_COLORS.trend, strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="count" stroke={CHART_COLORS.trend} strokeWidth={2.5}
                fillOpacity={1} fill="url(#colorCount)" dot={false}
                activeDot={{ r: 5, fill: CHART_COLORS.trend, stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent activity */}
      <div className="card">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" /> {t('dashboard.recentExams')}
        </h3>
        {stats.recent_detections.length ? (
          <div className="space-y-3">
            {stats.recent_detections.map((d) => {
              const MIcon = METHOD_ICONS[d.detection_method] || ScanSearch;
              return (
                <div key={d.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                  {d.image_url ? (
                    <img src={d.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Stethoscope size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <LabelBadge label={d.predicted_label} />
                      <GradeBadge grade={d.grade} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                      <MIcon size={12} />
                      {d.detection_method} • {(d.confidence * 100).toFixed(1)}% • {d.processing_time}s
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(d.timestamp).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <ScanSearch size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400">{t('dashboard.noExamsYet')}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Zap size={16} className="text-amber-500" /> {t('dashboard.quickActions')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t('dashboard.newDiagnosis'), icon: Stethoscope, color: 'primary', path: '/detect' },
            { label: t('nav.liveScan'), icon: Video, color: 'blue', path: '/live' },
            { label: t('dashboard.viewHistory'), icon: HistoryIcon, color: 'emerald', path: '/history' },
            { label: t('nav.aiDoctor'), icon: MessageSquareText, color: 'purple', path: '/chatbot' },
          ].map(({ label, icon: Icon, color, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-${color}-300 dark:hover:border-${color}-700 hover:bg-${color}-50/50 dark:hover:bg-${color}-900/10 transition-all`}
            >
              <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon size={18} className={`text-${color}-500`} />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fruit Comparison + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fruit Comparison Table */}
        {fruitData.length > 0 && (
          <div className="card">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <ThermometerSun size={16} className="text-orange-500" /> {t('dashboard.fruitComparison')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left pb-3 text-xs font-medium text-gray-400">{t('dashboard.fruit')}</th>
                    <th className="text-center pb-3 text-xs font-medium text-gray-400">{t('dashboard.count')}</th>
                    <th className="text-center pb-3 text-xs font-medium text-gray-400">{t('dashboard.share')}</th>
                    <th className="text-right pb-3 text-xs font-medium text-gray-400">{t('dashboard.bar')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {fruitData.map((f) => {
                    const pct = totalScans > 0 ? ((f.value / totalScans) * 100).toFixed(1) : 0;
                    return (
                      <tr key={f.name} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                        <td className="py-3 text-sm font-medium flex items-center gap-2">
                          <span className="text-lg">{f.emoji}</span> {f.name}
                        </td>
                        <td className="py-3 text-center text-sm font-bold">{f.value}</td>
                        <td className="py-3 text-center text-xs text-gray-500">{pct}%</td>
                        <td className="py-3">
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundColor: CHART_COLORS.fruit[f.name.toLowerCase()] || '#8884d8' }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Performers */}
        <div className="card">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" /> {t('dashboard.topDiagnoses')}
          </h3>
          {stats.recent_detections.length > 0 ? (
            <div className="space-y-3">
              {[...stats.recent_detections]
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 5)
                .map((d, i) => (
                  <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                      i === 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-600' :
                      i === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{fruitEmoji(d.fruit_type)}</span>
                        <LabelBadge label={d.predicted_label} />
                        <GradeBadge grade={d.grade} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {(d.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Trophy size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('dashboard.runDiagnoses')}</p>
            </div>
          )}
        </div>
      </div>

      {/* System Info Bar */}
      <div className="card !py-3">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> {t('systemOnline')}
            </span>
            <span>{t('model')}</span>
            <span>{t('db')}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{totalScans} {t('records')}</span>
            <span>{fruitData.length} {t('fruitTypes')}</span>
            <span>{Object.keys(stats.method_distribution).length} {t('methods')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
