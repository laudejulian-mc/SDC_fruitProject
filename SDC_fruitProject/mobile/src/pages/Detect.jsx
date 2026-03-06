import { useState, useRef, useCallback, useEffect } from 'react';
import { detectSingle, detectBatch } from '../api';
import ResultCard from '../components/ResultCard';
import Toast from '../components/Toast';
import { Upload, ImagePlus, Loader2, Images, X, Sparkles, Zap, ShieldCheck, Stethoscope, Lightbulb, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { FRUIT_OPTIONS, fruitEmoji, FRUIT_HEALTH_INFO, getRandomFacts } from '../utils/fruitConstants';
import { useI18n } from '../contexts/I18nContext';

export default function Detect() {
  const { t, fruitName, labelName } = useI18n();
  const [mode, setMode] = useState('single');
  const [fruitType, setFruitType] = useState('apple');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [toast, setToast] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [currentFact, setCurrentFact] = useState(() => getRandomFacts('apple', 3));
  const inputRef = useRef();

  useEffect(() => {
    setCurrentFact(getRandomFacts(fruitType, 3));
  }, [fruitType]);

  const cycleFact = () => {
    setCurrentFact(getRandomFacts(fruitType, 3));
  };

  const handleFiles = useCallback((fileList) => {
    const arr = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!arr.length) {
      setToast({ type: 'warning', message: t('detect.selectValid') });
      return;
    }
    if (mode === 'single') {
      setFiles([arr[0]]);
      setPreviews([URL.createObjectURL(arr[0])]);
    } else {
      setFiles(arr);
      setPreviews(arr.map((f) => URL.createObjectURL(f)));
    }
    setResult(null);
    setBatchResults([]);
  }, [mode, t]);

  const clear = () => { setFiles([]); setPreviews([]); setResult(null); setBatchResults([]); };

  const submit = async () => {
    if (!files.length) return;
    setLoading(true);
    try {
      if (mode === 'single') {
        const fd = new FormData();
        fd.append('image', files[0]);
        fd.append('detection_method', 'upload');
        fd.append('fruit_type', fruitType);
        const res = await detectSingle(fd);
        setResult(res.data);
        setScanCount((c) => c + 1);
        setToast({ type: 'success', message: t('detect.diagnosisComplete', { fruit: fruitName(fruitType) }) });
      } else {
        const fd = new FormData();
        files.forEach((f) => fd.append('images', f));
        fd.append('fruit_type', fruitType);
        const res = await detectBatch(fd);
        setBatchResults(res.data);
        setScanCount((c) => c + res.data.length);
        setToast({ type: 'success', message: t('detect.batchComplete', { n: res.data.length, fruit: fruitName(fruitType) }) });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || t('detect.diagnosisFailed') });
    } finally {
      setLoading(false);
    }
  };

  const displayFruit = fruitName(fruitType);

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Fruit selector - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {FRUIT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setFruitType(opt.value); clear(); }}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all active:scale-95 flex-shrink-0',
              fruitType === opt.value
                ? 'bg-white dark:bg-gray-800 shadow-md text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-700'
                : 'bg-gray-100 dark:bg-gray-800/50 text-gray-500'
            )}
          >
            <span className="text-base">{opt.emoji}</span>
            {fruitName(opt.value)}
          </button>
        ))}
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode('single'); clear(); }}
          className={clsx('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]',
            mode === 'single' ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          )}
        >
          <ImagePlus size={16} /> {t('detect.singleExam')}
        </button>
        <button
          onClick={() => { setMode('batch'); clear(); }}
          className={clsx('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]',
            mode === 'batch' ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          )}
        >
          <Images size={16} /> {t('detect.batchExam')}
        </button>
      </div>

      {/* Upload area */}
      <div
        className="card border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl active:border-primary-400 transition-all"
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple={mode === 'batch'} className="hidden" onChange={(e) => handleFiles(e.target.files)} />

        {previews.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-gray-400">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-3">
              <Stethoscope size={28} className="text-primary-500" />
            </div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 text-center">
              {t('detect.dropImage', { fruit: displayFruit, type: mode === 'batch' ? t('detect.images') : t('detect.image') })}
            </p>
            <p className="text-xs mt-1 text-gray-400">{t('detect.orClickBrowse')}</p>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Zap size={12} className="text-amber-400" /> {t('detect.quickDiagnosis')}</span>
              <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-400" /> {t('detect.accurate')}</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); clear(); }} className="absolute top-1 right-1 z-10 p-1.5 rounded-lg bg-gray-900/60 text-white active:bg-red-500">
              <X size={16} />
            </button>
            {mode === 'single' ? (
              <img src={previews[0]} alt="Preview" className="mx-auto max-h-56 rounded-xl object-contain" />
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((p, i) => (
                  <img key={i} src={p} alt={`Preview ${i}`} className="aspect-square rounded-xl object-cover" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit button */}
      <button onClick={submit} disabled={!files.length || loading} className="btn-primary w-full py-3.5 text-base">
        {loading ? <Loader2 size={20} className="animate-spin" /> : <Stethoscope size={20} />}
        {loading ? t('detect.diagnosing') : `${t('detect.diagnose')} ${displayFruit}`}
      </button>

      {/* Session counter + Fun Facts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card !p-3 text-center">
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{scanCount}</p>
          <p className="text-xs text-gray-400">{t('detect.examsThisSession')}</p>
        </div>
        <div className="card !p-3 cursor-pointer active:scale-[0.97] transition-transform select-none" onClick={cycleFact}>
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center justify-between">
            <span>💡 {t('detect.funFact')}</span>
            <RefreshCw size={12} className="text-amber-400/60" />
          </p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/60 leading-relaxed line-clamp-3">
            {currentFact[0] && (typeof currentFact[0] === 'string' ? currentFact[0] : currentFact[0].text)}
          </p>
          <p className="text-[10px] text-amber-400/40 mt-1">Tap for another fact</p>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="animate-slide-up">
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-primary-500" /> {t('detect.diagnosisResult')}
          </h3>
          <ResultCard result={result} />
        </div>
      )}

      {batchResults.length > 0 && (
        <div className="space-y-3 animate-slide-up">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Sparkles size={16} className="text-primary-500" /> {t('detect.batchDiagnosis')}
          </h3>
          {batchResults.map((r, i) => (
            <ResultCard key={i} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}
