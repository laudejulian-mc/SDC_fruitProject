import clsx from 'clsx';

const LABEL_COLORS = {
  Fresh: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Rotten: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const GRADE_COLORS = {
  'Grade A': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  'Grade B': 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  'Grade C': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  Reject: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export function LabelBadge({ label }) {
  return (
    <span className={clsx('inline-block px-3 py-1 rounded-lg text-sm font-semibold', LABEL_COLORS[label] || 'bg-gray-100 text-gray-600')}>
      {label}
    </span>
  );
}

export function GradeBadge({ grade }) {
  return (
    <span className={clsx('inline-block px-3 py-1 rounded-lg text-sm font-semibold', GRADE_COLORS[grade] || 'bg-gray-100 text-gray-600')}>
      {grade}
    </span>
  );
}
