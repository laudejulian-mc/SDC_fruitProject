import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ compact = false }) {
  const { lang, changeLang, langs } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = langs.find((l) => l.code === lang) || langs[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
        aria-label="Change language"
        title="Change language"
      >
        <Globe size={14} className="text-gray-400" />
        {!compact && <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{current.flag}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[150px] animate-slide-up">
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => { changeLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                lang === l.code ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
