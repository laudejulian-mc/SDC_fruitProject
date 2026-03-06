import { useState, useEffect, useRef } from 'react';
import { MousePointer2, X, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

const CURSORS = [
  { emoji: '🍎', label: 'Apple', css: 'apple' },
  { emoji: '🥭', label: 'Mango', css: 'mango' },
  { emoji: '🍇', label: 'Grapes', css: 'grapes' },
  { emoji: '🍌', label: 'Banana', css: 'banana' },
  { emoji: '🍓', label: 'Strawberry', css: 'strawberry' },
  { emoji: '🍑', label: 'Peach', css: 'peach' },
  { emoji: '🍒', label: 'Cherry', css: 'cherry' },
  { emoji: '🩺', label: 'Stethoscope', css: 'stethoscope' },
  { emoji: '💊', label: 'Pill', css: 'pill' },
  { emoji: '🔬', label: 'Microscope', css: 'microscope' },
  { emoji: '🧪', label: 'Test Tube', css: 'test-tube' },
  { emoji: '✨', label: 'Sparkle', css: 'sparkle' },
];

function emojiToCursor(emoji, size = 32) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.font = `${size - 4}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2 + 2);
  return canvas.toDataURL('image/png');
}

export default function CursorPicker() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const panelRef = useRef(null);

  const setCursor = (cursor) => {
    if (active?.emoji === cursor.emoji) {
      // deselect → restore default
      document.body.style.cursor = '';
      setActive(null);
      localStorage.removeItem('fruitmD-cursor');
      return;
    }
    const url = emojiToCursor(cursor.emoji);
    document.body.style.cursor = `url(${url}) 16 16, auto`;
    setActive(cursor);
    localStorage.setItem('fruitmD-cursor', JSON.stringify(cursor));
  };

  const resetCursor = () => {
    document.body.style.cursor = '';
    setActive(null);
    localStorage.removeItem('fruitmD-cursor');
  };

  // Restore cursor from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fruitmD-cursor'));
      if (saved?.emoji) {
        const url = emojiToCursor(saved.emoji);
        document.body.style.cursor = `url(${url}) 16 16, auto`;
        setActive(saved);
      }
    } catch {}
    return () => { document.body.style.cursor = ''; };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Panel */}
      {open && (
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/10 border border-gray-200/60 dark:border-gray-700/60 p-4 w-72 animate-scale-in origin-bottom-right">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <MousePointer2 size={12} /> Choose Cursor
            </h4>
            {active && (
              <button
                onClick={resetCursor}
                className="text-[10px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <X size={10} /> Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {CURSORS.map((c) => (
              <button
                key={c.css}
                onClick={() => setCursor(c)}
                className={clsx(
                  'relative flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all duration-200 group',
                  active?.emoji === c.emoji
                    ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-400 dark:ring-primary-600 scale-105'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
                )}
                title={c.label}
              >
                <span className="text-2xl transition-transform group-hover:scale-110 group-active:scale-90">
                  {c.emoji}
                </span>
                <span className="text-[8px] text-gray-400 dark:text-gray-500 font-medium leading-tight truncate w-full text-center">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[9px] text-gray-400 text-center mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
            Click to select • Click again to deselect
          </p>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'group w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl',
          open
            ? 'bg-primary-600 text-white rotate-0 shadow-primary-600/30'
            : active
              ? 'bg-white dark:bg-gray-800 ring-2 ring-primary-400/50 hover:ring-primary-500'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
        )}
        title={open ? 'Close cursor picker' : 'Change cursor'}
        aria-label="Cursor picker"
      >
        {open ? (
          <ChevronUp size={20} className="text-white" />
        ) : active ? (
          <span className="text-xl group-hover:scale-110 transition-transform">{active.emoji}</span>
        ) : (
          <MousePointer2 size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-primary-500 transition-colors" />
        )}
      </button>
    </div>
  );
}
