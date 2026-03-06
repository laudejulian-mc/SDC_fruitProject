import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import clsx from 'clsx';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
};

export default function Toast({ type = 'info', message, onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(true);
  const Icon = ICONS[type];

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div
      className={clsx(
        'fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg transition-all duration-300',
        COLORS[type],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      )}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="ml-2 hover:opacity-70">
        <X size={16} />
      </button>
    </div>
  );
}
