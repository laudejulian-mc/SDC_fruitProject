import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { Globe, Check } from 'lucide-react';

export default function LanguageSwitcher() {
  const { lang, changeLang, langs } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const current = langs.find((l) => l.code === lang) || langs[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 p-2 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
        aria-label="Change language"
      >
        <span className="text-lg">{current.flag}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} onTouchStart={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-[70] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[160px] animate-slide-up">
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={(e) => { e.stopPropagation(); changeLang(l.code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors active:bg-gray-100 dark:active:bg-gray-800 ${
                  lang === l.code ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span className="flex-1 text-left">{l.label}</span>
                {lang === l.code && <Check size={14} className="text-primary-500" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
