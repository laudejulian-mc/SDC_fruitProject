import clsx from 'clsx';

export function StatCard({ icon: Icon, label, value, sub, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="card animate-slide-up flex items-start gap-4">
      <div className={clsx('flex items-center justify-center w-14 h-14 rounded-xl', colors[color])}>
        <Icon size={26} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-3xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
