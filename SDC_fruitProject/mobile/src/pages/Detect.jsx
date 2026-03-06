import { useState, useRef, useCallback, useEffect } from 'react';
import { detectSingle, detectBatch } from '../api';
import ResultCard from '../components/ResultCard';
import Toast from '../components/Toast';
import { Upload, ImagePlus, Loader2, Images, X, Sparkles, Zap, ShieldCheck, Stethoscope, Lightbulb, RefreshCw, AlertTriangle, Wand2, Eye, EyeOff, Copy, BarChart3, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { FRUIT_OPTIONS, fruitEmoji, FRUIT_HEALTH_INFO, getRandomFacts } from '../utils/fruitConstants';
import { analyzeImageQuality, computeImageHash, hashSimilarity, enhanceImage, detectEdges } from '../utils/imageUtils';
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

  // ─── New feature state ───
  const [imageQuality, setImageQuality] = useState(null);
  const [qualityLoading, setQualityLoading] = useState(false);
  const [edgeOverlay, setEdgeOverlay] = useState(null);
  const [showEdges, setShowEdges] = useState(false);
  const [spoilageAlert, setSpoilageAlert] = useState(false);
  const [spoilageMuted, setSpoilageMuted] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);
  const [recentHashes, setRecentHashes] = useState([]);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [enhancedPreview, setEnhancedPreview] = useState(null);
  const [enhancedFile, setEnhancedFile] = useState(null);

  useEffect(() => {
    setCurrentFact(getRandomFacts(fruitType, 3));
  }, [fruitType]);

  const cycleFact = () => {
    setCurrentFact(getRandomFacts(fruitType, 3));
  };

  // ─── Analyze image on selection ───
  const analyzeSelectedImage = useCallback(async (file) => {
    setQualityLoading(true);
    setImageQuality(null);
    setEdgeOverlay(null);
    setEnhancedPreview(null);
    setEnhancedFile(null);
    setDuplicateWarning(false);
    try {
      const q = await analyzeImageQuality(file);
      setImageQuality(q);
      const hash = await computeImageHash(file);
      const isDup = recentHashes.some((h) => hashSimilarity(h, hash) > 0.85);
      if (isDup) setDuplicateWarning(true);
      setRecentHashes((prev) => [hash, ...prev.slice(0, 19)]);
      if (q.score < 60) {
        const enhanced = await enhanceImage(file);
        setEnhancedPreview(enhanced.dataUrl);
        setEnhancedFile(new File([enhanced.blob], file.name || 'enhanced.jpg', { type: 'image/jpeg' }));
      }
    } catch (e) { console.warn('Image analysis failed:', e); }
    finally { setQualityLoading(false); }
  }, [recentHashes]);

  const toggleEdgeOverlay = async () => {
    if (showEdges) { setShowEdges(false); return; }
    if (edgeOverlay) { setShowEdges(true); return; }
    if (!files[0]) return;
    try {
      const overlay = await detectEdges(files[0]);
      setEdgeOverlay(overlay);
      setShowEdges(true);
    } catch (e) { console.warn('Edge detection failed:', e); }
  };

  const applyEnhancement = () => {
    if (!enhancedFile || !enhancedPreview) return;
    setFiles([enhancedFile]);
    setPreviews([enhancedPreview]);
    setToast({ type: 'success', message: t('quality.enhanced') });
  };

  const sessionStats = {
    total: sessionResults.length,
    fresh: sessionResults.filter((r) => r.predicted_label === 'Fresh').length,
    rotten: sessionResults.filter((r) => r.predicted_label === 'Rotten').length,
    avgConf: sessionResults.length ? (sessionResults.reduce((s, r) => s + r.confidence, 0) / sessionResults.length * 100).toFixed(1) : '0.0',
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
      analyzeSelectedImage(arr[0]);
    } else {
      setFiles(arr);
      setPreviews(arr.map((f) => URL.createObjectURL(f)));
    }
    setResult(null);
    setBatchResults([]);
    setSpoilageAlert(false);
  }, [mode, t, analyzeSelectedImage]);

  const clear = () => { setFiles([]); setPreviews([]); setResult(null); setBatchResults([]); setImageQuality(null); setEdgeOverlay(null); setShowEdges(false); setEnhancedPreview(null); setEnhancedFile(null); setDuplicateWarning(false); setSpoilageAlert(false); };

  const submit = async () => {
    if (!files.length) return;
    setLoading(true);
    setSpoilageAlert(false);
    try {
      if (mode === 'single') {
        const fd = new FormData();
        fd.append('image', files[0]);
        fd.append('detection_method', 'upload');
        fd.append('fruit_type', fruitType);
        const res = await detectSingle(fd);
        setResult(res.data);
        setScanCount((c) => c + 1);
        setSessionResults((prev) => [res.data, ...prev]);
        if (res.data.predicted_label === 'Rotten' && !spoilageMuted) setSpoilageAlert(true);
        setToast({ type: 'success', message: t('detect.diagnosisComplete', { fruit: fruitName(fruitType) }) });
      } else {
        const fd = new FormData();
        files.forEach((f) => fd.append('images', f));
        fd.append('fruit_type', fruitType);
        const res = await detectBatch(fd);
        setBatchResults(res.data);
        setScanCount((c) => c + res.data.length);
        const validResults = res.data.filter((r) => !r.error);
        setSessionResults((prev) => [...validResults, ...prev]);
        if (validResults.some((r) => r.predicted_label === 'Rotten') && !spoilageMuted) setSpoilageAlert(true);
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

      {/* Fruit selector */}
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
              <div className="relative">
                <img src={previews[0]} alt="Preview" className="mx-auto max-h-56 rounded-xl object-contain" />
                {showEdges && edgeOverlay && (
                  <img src={edgeOverlay} alt="Edges" className="absolute inset-0 mx-auto max-h-56 rounded-xl object-contain pointer-events-none animate-fade-in opacity-80" />
                )}
              </div>
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

      {/* #3 Quality Badge + #5 Edge Toggle + #16 Enhance */}
      {mode === 'single' && files.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {qualityLoading && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-1.5 rounded-lg">
              <Loader2 size={12} className="animate-spin" /> {t('quality.analyzing')}
            </span>
          )}
          {imageQuality && !qualityLoading && (
            <>
              <span className={clsx(
                'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg',
                imageQuality.score >= 70 ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
                imageQuality.score >= 40 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                'bg-red-50 dark:bg-red-900/20 text-red-600'
              )}>
                {imageQuality.score >= 70 ? '✅' : '⚠️'} {t('quality.score')}: {imageQuality.score}/100
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleEdgeOverlay(); }}
                className={clsx('text-xs px-3 py-1.5 rounded-lg border transition-all active:scale-95', showEdges ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 text-cyan-600' : 'border-gray-200 dark:border-gray-700 text-gray-500')}
              >
                {showEdges ? <EyeOff size={12} className="inline mr-1" /> : <Eye size={12} className="inline mr-1" />}
                {showEdges ? t('quality.hideEdges') : t('quality.showEdges')}
              </button>
              {enhancedPreview && (
                <button
                  onClick={(e) => { e.stopPropagation(); applyEnhancement(); }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 text-purple-600 active:scale-95 transition-all"
                >
                  <Wand2 size={12} className="inline mr-1" /> {t('quality.enhanceNow')}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* #12 Duplicate Warning */}
      {duplicateWarning && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 animate-slide-up">
          <Copy size={16} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{t('duplicate.detected')}</p>
            <p className="text-xs text-amber-600/70 truncate">{t('duplicate.description')}</p>
          </div>
          <button onClick={() => setDuplicateWarning(false)} className="text-xs px-2.5 py-1 rounded-lg bg-amber-500 text-white font-semibold flex-shrink-0">
            OK
          </button>
        </div>
      )}

      {/* Submit button */}
      <button onClick={submit} disabled={!files.length || loading} className="btn-primary w-full py-3.5 text-base">
        {loading ? <Loader2 size={20} className="animate-spin" /> : <Stethoscope size={20} />}
        {loading ? t('detect.diagnosing') : `${t('detect.diagnose')} ${displayFruit}`}
      </button>

      {/* Session summary (#11) + Fun Facts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card !p-3">
          <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 flex items-center gap-1">
            <BarChart3 size={12} /> {t('session.title')}
          </p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 text-center">{sessionStats.total || scanCount}</p>
          {sessionStats.total > 0 && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-green-600">✅ {sessionStats.fresh}</span>
              <span className="text-[10px] font-bold text-red-600">❌ {sessionStats.rotten}</span>
              <span className="text-[10px] text-gray-400">{sessionStats.avgConf}%</span>
            </div>
          )}
          <p className="text-[10px] text-gray-400 text-center mt-0.5">{t('detect.examsThisSession')}</p>
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

      {/* #8 Spoilage Alert Modal */}
      {spoilageAlert && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSpoilageAlert(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-5 animate-slide-up border-2 border-red-200 dark:border-red-800" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400">{t('spoilage.alertTitle')}</h3>
              <p className="text-sm text-red-600/70 dark:text-red-400/60">{t('spoilage.alertSubtitle')}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3.5 space-y-2 mb-4">
              <p className="text-sm font-bold text-red-700 dark:text-red-400">{t('spoilage.disposalTitle')}</p>
              {['tip1', 'tip2', 'tip3', 'tip4', 'tip5'].map((key) => (
                <p key={key} className="text-sm text-red-600/80 dark:text-red-400/70 flex items-start gap-2">
                  <span className="flex-shrink-0">•</span> {t(`spoilage.${key}`)}
                </p>
              ))}
            </div>
            <button onClick={() => setSpoilageAlert(false)} className="btn-primary w-full !bg-red-500 hover:!bg-red-600">
              {t('spoilage.dismiss')}
            </button>
            <button onClick={() => { setSpoilageMuted(true); setSpoilageAlert(false); }} className="text-xs text-gray-400 text-center w-full mt-2 py-1">
              {t('spoilage.dontShowAgain')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
