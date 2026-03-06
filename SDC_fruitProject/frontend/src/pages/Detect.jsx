import { useState, useRef, useCallback, useEffect } from 'react';
import { detectSingle, detectBatch } from '../api';
import ResultCard from '../components/ResultCard';
import Toast from '../components/Toast';
import { Upload, ImagePlus, Loader2, Images, X, Sparkles, Info, CheckCircle2, Zap, ShieldCheck, Stethoscope, Clock, RotateCcw, Camera, Lightbulb, Heart, Flame, Pill, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { FRUIT_OPTIONS, fruitEmoji, FRUIT_FUN_FACTS, FRUIT_HEALTH_INFO, getRandomFact, getRandomFacts } from '../utils/fruitConstants';
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
  const [dragActive, setDragActive] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [currentFact, setCurrentFact] = useState(() => getRandomFacts('apple', 3));
  const [factKey, setFactKey] = useState(0);
  const inputRef = useRef();

  // Rotate fun facts every 8 seconds or when fruit changes
  useEffect(() => {
    setCurrentFact(getRandomFacts(fruitType, 3));
    setFactKey((k) => k + 1);
    const interval = setInterval(() => {
      setCurrentFact(getRandomFacts(fruitType, 3));
      setFactKey((k) => k + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [fruitType]);

  const shuffleFact = () => {
    setCurrentFact(getRandomFacts(fruitType, 3));
    setFactKey((k) => k + 1);
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

  const onDrop = (e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); };

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
        setRecentScans((prev) => [{ ...res.data, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
        setToast({ type: 'success', message: t('detect.diagnosisComplete', { fruit: fruitName(fruitType) }) });
      } else {
        const fd = new FormData();
        files.forEach((f) => fd.append('images', f));
        fd.append('fruit_type', fruitType);
        const res = await detectBatch(fd);
        setBatchResults(res.data);
        setScanCount((c) => c + res.data.length);
        setRecentScans((prev) => [
          ...res.data.filter((r) => !r.error).map((r) => ({ ...r, time: new Date().toLocaleTimeString() })),
          ...prev,
        ].slice(0, 10));
        setToast({ type: 'success', message: t('detect.batchComplete', { n: res.data.length, fruit: fruitName(fruitType) }) });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || t('detect.diagnosisFailed') });
    } finally {
      setLoading(false);
    }
  };

  const info = FRUIT_HEALTH_INFO[fruitType] || FRUIT_HEALTH_INFO.apple;
  const displayFruit = fruitName(fruitType);

  return (
    <div className="max-w-7xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ─── Fruit Selector + Mode Tabs ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
          {FRUIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setFruitType(opt.value); clear(); }}
              className={clsx(
                'fruit-tab-btn flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap',
                fruitType === opt.value
                  ? 'bg-white dark:bg-gray-700 shadow-md text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-700 scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
              )}
            >
              <span className={clsx('text-lg transition-transform', fruitType === opt.value && 'animate-bounce-in')}>{opt.emoji}</span>
              <span className="hidden sm:inline">{fruitName(opt.value)}</span>
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMode('single'); clear(); }}
            className={clsx('btn-juice gap-2', mode === 'single' ? 'btn-primary' : 'btn-secondary')}
          >
            <ImagePlus size={16} /> {t('detect.singleExam')}
          </button>
          <button
            onClick={() => { setMode('batch'); clear(); }}
            className={clsx('btn-juice gap-2', mode === 'batch' ? 'btn-primary' : 'btn-secondary')}
          >
            <Images size={16} /> {t('detect.batchExam')}
          </button>
        </div>
      </div>

      {/* ─── BENTO GRID LAYOUT ─── */}
      <div className="grid grid-cols-12 gap-4 auto-rows-min">

        {/* ── Upload Zone: spans 8 cols ── */}
        <div className="col-span-12 lg:col-span-8">
          <div
            className={clsx(
              'card border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer relative group',
              dragActive
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 scale-[1.01] shadow-neon'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg',
            )}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" multiple={mode === 'batch'} className="hidden" onChange={(e) => handleFiles(e.target.files)} />

            {previews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope size={36} className="text-primary-500" />
                </div>
                <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
                  {t('detect.dropImage', { fruit: displayFruit, type: mode === 'batch' ? t('detect.images') : t('detect.image') })}
                </p>
                <p className="text-sm mt-2 text-gray-400">{t('detect.orClickBrowse')}</p>
                <div className="flex items-center gap-5 mt-6 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5"><Zap size={14} className="text-amber-400" /> {t('detect.quickDiagnosis')}</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-400" /> {t('detect.accurate')}</span>
                  <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-purple-400" /> {t('detect.aiDoctor')}</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); clear(); }} className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-gray-900/60 text-white hover:bg-red-500 transition-all hover:scale-110 active:scale-95">
                  <X size={16} />
                </button>
                {mode === 'single' ? (
                  <img src={previews[0]} alt="Preview" className="mx-auto max-h-72 rounded-xl object-contain cursor-zoom-in hover:scale-[1.02] transition-transform" onClick={(e) => { e.stopPropagation(); setZoomImage(previews[0]); }} />
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-2">
                    {previews.map((p, i) => (
                      <img key={i} src={p} alt={`Preview ${i}`} className="aspect-square rounded-xl object-cover ring-2 ring-transparent hover:ring-primary-400 transition-all cursor-zoom-in hover:scale-105" onClick={(e) => { e.stopPropagation(); setZoomImage(p); }} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button onClick={submit} disabled={!files.length || loading} className="btn-primary w-full py-4 text-lg mt-3 group">
            {loading ? <Loader2 size={22} className="animate-spin" /> : <Stethoscope size={22} className="group-hover:animate-wiggle" />}
            {loading ? t('detect.diagnosing') : files.length > 1 ? t('detect.diagnoseCount', { count: files.length, fruit: displayFruit }) : `${t('detect.diagnose')} ${displayFruit}`}
          </button>
        </div>

        {/* ── Photo Tips: 4 cols (swapped with session counter) ── */}
        <div className="col-span-6 sm:col-span-4 lg:col-span-4">
          <div className="card h-full">
            <h3 className="text-base font-bold flex items-center gap-2 mb-3">
              <Camera size={16} className="text-blue-500" /> {t('detect.photoTips')}
            </h3>
            <div className="space-y-2.5">
              {[
                { emoji: '📸', text: t('detect.tip1') },
                { emoji: fruitEmoji(fruitType), text: t('detect.tip2', { fruit: displayFruit }) },
                { emoji: '🔍', text: t('detect.tip3') },
                { emoji: '💡', text: t('detect.tip5') },
              ].map(({ emoji, text }, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="text-base flex-shrink-0">{emoji}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Fun Fact Card: spans 6 cols on mobile, 4 on lg ── */}
        <div className="col-span-6 sm:col-span-4 lg:col-span-4">
          <div className="card h-full bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-900/10 dark:to-orange-900/10 !border-amber-200/60 dark:!border-amber-800/30 relative overflow-hidden group">
            <div className="absolute -top-6 -right-6 text-6xl opacity-10 group-hover:opacity-20 transition-opacity select-none">{fruitEmoji(fruitType)}</div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" /> {t('detect.funFact')}
              </h3>
              <button onClick={(e) => { e.stopPropagation(); shuffleFact(); }} className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-500 transition-all hover:rotate-180 duration-500 active:scale-90" title="New fact">
                <RefreshCw size={15} />
              </button>
            </div>
            <div key={factKey} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed animate-fade-in space-y-2">
              {(Array.isArray(currentFact) ? currentFact : [currentFact]).map((fact, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">{fruitEmoji(fruitType)}</span>
                  <div>
                    <span>{typeof fact === 'string' ? fact : fact.text}</span>
                    {fact.source && (
                      <span className="block text-[11px] text-gray-400 dark:text-gray-500 italic mt-0.5">— {fact.source}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Nutrition Bento: spans 4 cols ── */}
        <div className="col-span-12 sm:col-span-4 lg:col-span-4">
          <div className="card h-full">
            <h3 className="text-base font-bold flex items-center gap-2 mb-3">
              <Heart size={16} className="text-pink-500" /> {fruitEmoji(fruitType)} {t('detect.fruitInfo', { fruit: displayFruit })}
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: Flame, label: t('detect.calories'), val: info.calories, color: 'text-orange-500' },
                { icon: Pill, label: t('detect.nutrients'), val: info.keyNutrients, color: 'text-blue-500' },
                { icon: Heart, label: t('detect.benefits'), val: info.benefits, color: 'text-pink-500' },
                { icon: Clock, label: t('detect.storage'), val: info.storage, color: 'text-teal-500' },
              ].map(({ icon: Icon, label, val, color }) => (
                <div key={label} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group/item">
                  <Icon size={16} className={`${color} mb-1.5 group-hover/item:scale-110 transition-transform`} />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-snug">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Diagnosis Guide Bento: spans 4 cols ── */}
        <div className="col-span-12 sm:col-span-4 lg:col-span-4">
          <div className="card h-full">
            <h3 className="text-base font-bold flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-emerald-500" /> {t('detect.diagnosisGuide')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/10 hover:scale-[1.01] transition-transform">
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 mt-0.5 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">{t('detect.freshLabel')}</p>
                  <p className="text-sm text-green-600/80 dark:text-green-400/70 mt-0.5">{info.freshTip}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 hover:scale-[1.01] transition-transform">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">{t('detect.rottenLabel')}</p>
                  <p className="text-sm text-red-600/80 dark:text-red-400/70 mt-0.5">{info.rottenSign}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Grading Scale + Photo Tips side by side: 4 cols each ── */}
        <div className="col-span-6 sm:col-span-6 lg:col-span-4">
          <div className="card h-full">
            <h3 className="text-base font-bold flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-sky-500" /> {t('detect.gradingScale')}
            </h3>
            <div className="space-y-2.5">
              {[
                { grade: 'Grade A', range: '≥ 85%', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                { grade: 'Grade B', range: '≥ 70%', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/10' },
                { grade: 'Grade C', range: '≥ 50%', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                { grade: 'Reject', range: '< 50%', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
              ].map(({ grade, range, color, bg }) => (
                <div key={grade} className={`flex items-center justify-between text-sm p-2.5 rounded-lg ${bg} hover:scale-[1.02] transition-transform`}>
                  <span className={`font-bold ${color}`}>{grade}</span>
                  <span className="text-gray-400 font-mono text-sm">{range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Session Counter (swapped with photo tips) ── */}
        <div className="col-span-6 sm:col-span-6 lg:col-span-4">
          <div className="card bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20 !border-primary-100 dark:!border-primary-800/30 text-center h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-100 dark:bg-primary-800/40 flex items-center justify-center mb-3 hover:rotate-12 transition-transform">
              <Stethoscope size={28} className="text-primary-600 dark:text-primary-400" />
            </div>
            <p className="text-5xl font-extrabold text-primary-700 dark:text-primary-400 tabular-nums">{scanCount}</p>
            <p className="text-sm text-primary-600/70 dark:text-primary-400/70 mt-1.5 font-medium">{t('detect.examsThisSession')}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-2xl animate-bounce-in">{fruitEmoji(fruitType)}</span>
              <span className="text-xs text-primary-500 font-bold uppercase tracking-wider">{displayFruit} {t('detect.mode')}</span>
            </div>
          </div>
        </div>

        {/* ── Recent Scans: spans full width ── */}
        <div className="col-span-12">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Clock size={16} className="text-blue-500" /> {t('detect.recentScans')}
              </h3>
              {recentScans.length > 0 && (
                <button onClick={() => setRecentScans([])} className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium">
                  <RotateCcw size={13} /> {t('detect.clear')}
                </button>
              )}
            </div>
            {recentScans.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">{t('detect.noScansYet')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
                {recentScans.map((s, i) => {
                  const isFresh = s.predicted_label === 'Fresh';
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm hover:shadow-md hover:scale-[1.02] transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{fruitEmoji(fruitType)}</span>
                        <span className={`font-bold ${isFresh ? 'text-green-500' : 'text-red-500'}`}>{labelName(s.predicted_label)}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono">{s.grade}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-gray-400">
                        <span className="font-mono font-bold">{(s.confidence * 100).toFixed(0)}%</span>
                        <span className="opacity-60 text-xs">{s.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Results Section: full width ── */}
        {result && (
          <div className="col-span-12 animate-slide-up">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" /> {t('detect.diagnosisResult')}
            </h3>
            <ResultCard result={result} />
          </div>
        )}

        {batchResults.length > 0 && (
          <div className="col-span-12 animate-slide-up">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" /> {t('detect.batchDiagnosis')} ({batchResults.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {batchResults.map((r, i) =>
                r.error ? (
                  <div key={i} className="card !border-red-200 dark:!border-red-800 text-red-600 text-sm flex items-center gap-2">
                    <X size={14} /> {r.filename}: {r.error}
                  </div>
                ) : (
                  <ResultCard key={r.id || i} result={r} />
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 cursor-zoom-out" onClick={() => setZoomImage(null)}>
          <div className="relative max-w-3xl max-h-[90vh] animate-scale-in">
            <button onClick={() => setZoomImage(null)} className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg text-gray-600 hover:text-red-500 hover:scale-110 active:scale-95 transition-all">
              <X size={18} />
            </button>
            <img src={zoomImage} alt="Zoomed preview" className="max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
