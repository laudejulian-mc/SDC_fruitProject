/**
 * Shared Recharts components with proper dark-mode support,
 * optimized fonts, and fruit-themed color palette.
 */

// ─── Color Palette (works in both light & dark) ─────────────────────
export const CHART_COLORS = {
  // Quality labels
  quality: ['#22c55e', '#ef4444'],
  qualityMap: {
    Fresh: '#22c55e',
    Rotten: '#ef4444',
  },
  // Grades
  grade: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],    // A, B, C, Reject
  gradeMap: {
    'Grade A': '#10b981',
    'Grade B': '#3b82f6',
    'Grade C': '#f59e0b',
    'Reject': '#ef4444',
  },
  // Fruits
  fruit: { apple: '#f87171', orange: '#fb923c', mango: '#fbbf24', grapes: '#a78bfa', banana: '#fde047' },
  // Accent series for generic charts
  series: ['#6366f1', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'],
  // Area/line
  trend: '#14b8a6',
  trendGradientStart: 'rgba(20, 184, 166, 0.35)',
  trendGradientEnd: 'rgba(20, 184, 166, 0)',
};

// ─── Dark-mode aware tick/axis style ─────────────────────────────────
const isDark = () => document.documentElement.classList.contains('dark');

export const getTickStyle = (size = 11) => ({
  fontSize: size,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontWeight: 500,
  fill: isDark() ? '#9ca3af' : '#6b7280',     // gray-400 / gray-500
});

export const getAxisLineStyle = () => ({
  stroke: isDark() ? '#374151' : '#e5e7eb',    // gray-700 / gray-200
});

export const getGridStyle = () => ({
  stroke: isDark() ? '#1f2937' : '#f3f4f6',    // gray-800 / gray-100
  strokeDasharray: '4 4',
});

export const getCursorStyle = () => ({
  fill: isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
});

// ─── Custom Tooltip ──────────────────────────────────────────────────
export function ChartTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl border text-xs backdrop-blur-xl"
      style={{
        background: isDark()
          ? 'rgba(17, 24, 39, 0.92)'    // gray-900
          : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark()
          ? 'rgba(55, 65, 81, 0.6)'     // gray-700
          : 'rgba(229, 231, 235, 0.8)', // gray-200
      }}
    >
      {label && (
        <p
          className="font-semibold mb-1.5 pb-1.5 border-b"
          style={{
            color: isDark() ? '#e5e7eb' : '#1f2937',
            borderColor: isDark() ? 'rgba(55,65,81,0.4)' : 'rgba(229,231,235,0.6)',
            fontSize: 12,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: p.color || p.payload?.fill || p.fill }}
          />
          <span style={{ color: isDark() ? '#d1d5db' : '#374151', fontWeight: 500 }}>
            {p.name || payload[0]?.name}
          </span>
          <span
            className="ml-auto font-bold tabular-nums"
            style={{ color: isDark() ? '#f3f4f6' : '#111827' }}
          >
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Custom Pie Label ────────────────────────────────────────────────
export function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 22;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const dark = isDark();

  if (percent < 0.05) return null; // Skip tiny slices

  return (
    <text
      x={x}
      y={y}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{
        fontSize: 11,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 600,
        fill: dark ? '#d1d5db' : '#374151',
      }}
    >
      {name} {(percent * 100).toFixed(0)}%
    </text>
  );
}

// ─── Custom Legend ────────────────────────────────────────────────────
export function ChartLegend({ payload }) {
  if (!payload?.length) return null;
  const dark = isDark();
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-3">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 500,
              color: dark ? '#9ca3af' : '#6b7280',
            }}
          >
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
