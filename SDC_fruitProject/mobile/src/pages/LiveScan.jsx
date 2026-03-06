import { useState, useRef, useCallback, useEffect } from 'react';
import { detectSingle } from '../api';
import ResultCard from '../components/ResultCard';
import Toast from '../components/Toast';
import { Video, VideoOff, Camera, Loader2, Radio, Clock, Trash2, Stethoscope, Scan, Target } from 'lucide-react';
import clsx from 'clsx';
import { FRUIT_OPTIONS, fruitEmoji, LABEL_TEXT_COLORS } from '../utils/fruitConstants';
import { useI18n } from '../contexts/I18nContext';

export default function LiveScan() {
  const { t, fruitName, labelName } = useI18n();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [streaming, setStreaming] = useState(false);
  const [fruitType, setFruitType] = useState('apple');
  const [detecting, setDetecting] = useState(false);
  const [interval, setInterval_] = useState(3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [capturePreview, setCapturePreview] = useState(null);
  const [detectionLog, setDetectionLog] = useState([]);
  const [scanCount, setScanCount] = useState(0);

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch {
      setToast({ type: 'error', message: t('live.cameraAccessDenied') });
    }
  };

  const stopCam = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
    setDetecting(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const captureAndDetect = useCallback(async (method = 'live') => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve(null);
        const fd = new FormData();
        fd.append('image', blob, 'capture.jpg');
        fd.append('detection_method', method);
        fd.append('fruit_type', fruitType);
        try {
          setLoading(true);
          const res = await detectSingle(fd);
          setResult(res.data);
          setScanCount((c) => c + 1);
          setDetectionLog((log) => [
            { ...res.data, time: new Date().toLocaleTimeString() },
            ...log.slice(0, 19),
          ]);
          resolve(res.data);
        } catch {
          setToast({ type: 'error', message: t('live.detectionFailed') });
          resolve(null);
        } finally {
          setLoading(false);
        }
      }, 'image/jpeg', 0.85);
    });
  }, [fruitType, t]);

  const toggleAutoDetect = () => {
    if (detecting) {
      clearInterval(intervalRef.current);
      setDetecting(false);
    } else {
      setDetecting(true);
      captureAndDetect('live');
      intervalRef.current = window.setInterval(() => captureAndDetect('live'), interval * 1000);
    }
  };

  const manualCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCapturePreview(canvas.toDataURL('image/jpeg', 0.9));
  };

  const confirmCapture = async () => {
    setCapturePreview(null);
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const fd = new FormData();
      fd.append('image', blob, 'manual_capture.jpg');
      fd.append('detection_method', 'capture');
      fd.append('fruit_type', fruitType);
      setLoading(true);
      try {
        const res = await detectSingle(fd);
        setResult(res.data);
        setScanCount((c) => c + 1);
        setDetectionLog((log) => [{ ...res.data, time: new Date().toLocaleTimeString() }, ...log.slice(0, 19)]);
        setToast({ type: 'success', message: t('live.captureAnalyzed') });
        stopCam();
      } catch {
        setToast({ type: 'error', message: t('live.detectionFailed') });
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.85);
  };

  useEffect(() => () => stopCam(), [stopCam]);

  const labelColor = (label) => LABEL_TEXT_COLORS[label] || 'text-gray-400';

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <canvas ref={canvasRef} className="hidden" />

      {/* Fruit selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FRUIT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFruitType(opt.value)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all active:scale-95 flex-shrink-0',
              fruitType === opt.value
                ? 'bg-white dark:bg-gray-800 shadow-md text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-700'
                : 'bg-gray-100 dark:bg-gray-800/50 text-gray-500'
            )}
          >
            <span className="text-base">{opt.emoji}</span>
            <span>{fruitName(opt.value)}</span>
          </button>
        ))}
      </div>

      {/* Camera view */}
      <div className="card !p-0 overflow-hidden rounded-2xl relative">
        {streaming ? (
          <div className="relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover rounded-2xl" />
            {/* Status overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm',
                detecting ? 'bg-red-500/80 text-white' : 'bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-200'
              )}>
                {detecting ? <><Radio size={10} className="animate-pulse" /> {t('live.liveScanning')}</> : <><Video size={10} /> {t('live.cameraActive')}</>}
              </div>
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                {detecting ? <Scan size={10} className="text-green-400" /> : <Target size={10} className="text-blue-400" />}
                <span>{detecting ? t('live.scanning') : t('live.idle')}</span>
              </div>
            </div>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={28} className="animate-spin text-white" />
                  <span className="text-xs text-white font-medium">{t('live.analyzing')}</span>
                </div>
              </div>
            )}
            {/* Live result overlay */}
            {result && !loading && (
              <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md rounded-xl p-3">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{fruitEmoji(result.fruit_type)}</span>
                    <div>
                      <p className={`text-sm font-bold ${result.predicted_label === 'Fresh' ? 'text-green-400' : 'text-red-400'}`}>
                        {result.predicted_label === 'Fresh' ? '✅' : '❌'} {labelName(result.predicted_label)}
                      </p>
                      <p className="text-xs text-white/70">{result.grade}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold tabular-nums">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <VideoOff size={40} className="mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium">{t('live.cameraOff')}</p>
            <p className="text-xs mt-1">{t('live.startCameraToBegin')}</p>
          </div>
        )}
      </div>

      {/* Camera controls */}
      <div className="flex gap-2">
        <button
          onClick={streaming ? stopCam : startCam}
          className={clsx('flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-all',
            streaming ? 'bg-red-500 text-white' : 'btn-primary'
          )}
        >
          {streaming ? <><VideoOff size={16} /> {t('live.stopCamera')}</> : <><Video size={16} /> {t('live.startCamera')}</>}
        </button>
        {streaming && (
          <>
            <button
              onClick={toggleAutoDetect}
              className={clsx('py-3 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 active:scale-[0.97] transition-all',
                detecting ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
              )}
            >
              <Radio size={16} />
              {detecting ? 'Stop' : 'Auto'}
            </button>
            <button
              onClick={manualCapture}
              className="py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold flex items-center gap-2 active:scale-[0.97]"
            >
              <Camera size={16} />
            </button>
          </>
        )}
      </div>

      {/* Interval control */}
      {streaming && (
        <div className="card !p-3 flex items-center gap-3">
          <Clock size={14} className="text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{t('live.interval')}</span>
          <input
            type="range" min={1} max={10} value={interval}
            onChange={(e) => setInterval_(+e.target.value)}
            className="flex-1 h-1.5 accent-primary-500"
          />
          <span className="text-xs font-bold tabular-nums w-8 text-right">{interval}s</span>
        </div>
      )}

      {/* Capture preview modal */}
      {capturePreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setCapturePreview(null)}>
          <div className="card max-w-sm w-full space-y-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold">{t('live.reviewCapture')}</h3>
            <img src={capturePreview} alt="Capture" className="rounded-xl w-full" />
            <div className="flex gap-2">
              <button onClick={() => setCapturePreview(null)} className="btn-secondary flex-1">{t('live.retake')}</button>
              <button onClick={confirmCapture} className="btn-primary flex-1">{t('live.confirmDiagnose')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Session stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card !p-3 text-center">
          <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{scanCount}</p>
          <p className="text-[10px] text-gray-400">{t('live.examsThisSession')}</p>
        </div>
        <div className="card !p-3 text-center">
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {detectionLog.filter((e) => e.predicted_label === 'Fresh').length}
          </p>
          <p className="text-[10px] text-gray-400">{t('live.healthy')}</p>
        </div>
        <div className="card !p-3 text-center">
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {detectionLog.filter((e) => e.predicted_label === 'Rotten').length}
          </p>
          <p className="text-[10px] text-gray-400">{t('live.alerts')}</p>
        </div>
      </div>

      {/* Detection log */}
      {detectionLog.length > 0 && (
        <div className="card !p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold">{t('live.examLog')}</h4>
            <button onClick={() => setDetectionLog([])} className="text-xs text-gray-400 active:text-red-500 flex items-center gap-1">
              <Trash2 size={12} /> {t('live.clearLog')}
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {detectionLog.map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{fruitEmoji(entry.fruit_type)}</span>
                  <span className={`text-sm font-semibold ${labelColor(entry.predicted_label)}`}>
                    {labelName(entry.predicted_label)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="font-bold tabular-nums">{(entry.confidence * 100).toFixed(0)}%</span>
                  <span>{entry.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full result card */}
      {result && !streaming && (
        <div className="animate-slide-up">
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
}
