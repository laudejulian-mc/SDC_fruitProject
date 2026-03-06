import { useState, useRef, useCallback, useEffect } from 'react';
import { detectSingle } from '../api';
import ResultCard from '../components/ResultCard';
import Toast from '../components/Toast';
import { Video, VideoOff, Camera, Loader2, Settings2, Radio, CircleDot, Clock, Activity, Trash2, Eye, Stethoscope, Download, Volume2, VolumeX, SlidersHorizontal, BarChart3, Zap, Shield, Scan, Timer, Target, Sun, SunDim, Moon } from 'lucide-react';
import clsx from 'clsx';
import { FRUIT_OPTIONS, fruitEmoji, LABEL_TEXT_COLORS, LABEL_BG_COLORS } from '../utils/fruitConstants';

export default function LiveScan() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const lightingRef = useRef(null);

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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // #13 Lighting Guide state
  const [showLightingGuide, setShowLightingGuide] = useState(true);
  const [lightingScore, setLightingScore] = useState(null); // 0-100
  const [lightingUniformity, setLightingUniformity] = useState(null);

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch {
      setToast({ type: 'error', message: 'Camera access denied.' });
    }
  };

  // #13 Lighting analyzer — reads a small canvas sample every ~500ms
  const analyzeLighting = useCallback(() => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const video = videoRef.current;
    if (video.videoWidth === 0) return;
    const c = document.createElement('canvas');
    const sz = 64; // sample at low res for speed
    c.width = sz;
    c.height = sz;
    const ctx = c.getContext('2d');
    ctx.drawImage(video, 0, 0, sz, sz);
    const { data } = ctx.getImageData(0, 0, sz, sz);
    let sum = 0;
    const vals = [];
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += lum;
      vals.push(lum);
    }
    const avg = sum / vals.length;
    // Standard deviation for uniformity
    const variance = vals.reduce((s, v) => s + (v - avg) ** 2, 0) / vals.length;
    const stdDev = Math.sqrt(variance);
    const uniformity = Math.max(0, Math.min(100, 100 - stdDev));
    // Score: penalize too dark (<80) and too bright (>200), reward mid-range
    let score;
    if (avg < 40) score = Math.round(avg / 40 * 30);
    else if (avg < 80) score = Math.round(30 + (avg - 40) / 40 * 30);
    else if (avg <= 200) score = Math.round(60 + (1 - Math.abs(avg - 140) / 60) * 40);
    else score = Math.round(Math.max(20, 80 - (avg - 200) / 55 * 60));
    setLightingScore(Math.min(100, Math.max(0, score)));
    setLightingUniformity(Math.round(uniformity));
  }, []);

  useEffect(() => {
    if (!streaming || !showLightingGuide) { lightingRef.current && clearInterval(lightingRef.current); return; }
    lightingRef.current = window.setInterval(analyzeLighting, 600);
    return () => clearInterval(lightingRef.current);
  }, [streaming, showLightingGuide, analyzeLighting]);

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
          // Play sound on detection
          if (res.data.predicted_label === 'Rotten') {
            playBeep('alert');
          } else {
            playBeep('success');
          }
          setDetectionLog((log) => [
            { ...res.data, time: new Date().toLocaleTimeString() },
            ...log.slice(0, 19),
          ]);
          resolve(res.data);
        } catch (err) {
          setToast({ type: 'error', message: 'Detection failed.' });
          resolve(null);
        } finally {
          setLoading(false);
        }
      }, 'image/jpeg', 0.85);
    });
  }, []);

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
        setDetectionLog((log) => [
          { ...res.data, time: new Date().toLocaleTimeString() },
          ...log.slice(0, 19),
        ]);
        setToast({ type: 'success', message: 'Capture analyzed!' });
        // Stop camera after successful capture diagnosis
        stopCam();
      } catch {
        setToast({ type: 'error', message: 'Detection failed.' });
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg', 0.85);
  };

  useEffect(() => () => stopCam(), [stopCam]);

  const playBeep = useCallback((type = 'success') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = type === 'success' ? 880 : 440;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }, [soundEnabled]);

  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    // Overlay result if present
    if (result) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px system-ui';
      ctx.fillText(`${result.predicted_label} — ${(result.confidence * 100).toFixed(1)}% — ${result.grade}`, 16, canvas.height - 22);
    }
    const link = document.createElement('a');
    link.download = `fruitmD-scan-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setToast({ type: 'success', message: 'Screenshot saved!' });
  };

  // Session stats derived from log
  const sessionStats = {
    avgConfidence: detectionLog.length ? (detectionLog.reduce((s, e) => s + e.confidence, 0) / detectionLog.length * 100).toFixed(1) : '0.0',
    freshCount: detectionLog.filter((e) => e.predicted_label === 'Fresh').length,
    alertCount: detectionLog.filter((e) => e.predicted_label === 'Rotten').length,
  };

  const labelColor = (label) => LABEL_TEXT_COLORS[label] || 'text-gray-400';

  const labelBg = (label) => LABEL_BG_COLORS[label] || 'bg-gray-400';

  return (
    <div className="max-w-6xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main camera area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Controls bar */}
          <div className="card flex flex-wrap items-center gap-3">
            {/* Fruit type selector */}
            <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {FRUIT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFruitType(opt.value)}
                  className={clsx(
                    'px-2.5 py-1.5 rounded-md text-sm transition-all',
                    fruitType === opt.value
                      ? 'bg-white dark:bg-gray-700 shadow-sm ring-1 ring-primary-200 dark:ring-primary-700'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                  aria-label={`Select ${opt.value}`}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {!streaming ? (
              <button onClick={startCam} className="btn-primary">
                <Video size={16} /> Start Camera
              </button>
            ) : (
              <button onClick={stopCam} className="btn-danger">
                <VideoOff size={16} /> Stop Camera
              </button>
            )}

            {streaming && (
              <>
                <button
                  onClick={toggleAutoDetect}
                  className={clsx(
                    'btn-secondary transition-all',
                    detecting && '!bg-yellow-500 !text-white shadow-md shadow-yellow-500/20'
                  )}
                >
                  <Radio size={16} className={detecting ? 'animate-pulse' : ''} />
                  {detecting ? 'Stop Auto-Detect' : 'Start Auto-Detect'}
                </button>
                <button onClick={manualCapture} className="btn-secondary">
                  <Camera size={16} /> Capture
                </button>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={takeScreenshot}
                    className="btn-secondary"
                    title="Save screenshot"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={clsx('btn-secondary', !soundEnabled && 'opacity-50')}
                    title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                  >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={clsx('btn-secondary', showSettings && '!bg-primary-50 dark:!bg-primary-900/20 !border-primary-300')}
                    title="Settings"
                  >
                    <SlidersHorizontal size={16} />
                  </button>
                  <button
                    onClick={() => setShowLightingGuide(!showLightingGuide)}
                    className={clsx('btn-secondary', showLightingGuide && '!bg-amber-50 dark:!bg-amber-900/20 !border-amber-300')}
                    title="Toggle Lighting Guide"
                  >
                    <Sun size={16} />
                  </button>
                  <Settings2 size={14} className="text-gray-400" />
                  <label className="text-xs text-gray-500">Interval</label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval_(+e.target.value)}
                    className="input-field w-20 text-xs"
                  >
                    {[1, 2, 3, 5, 10].map((v) => (
                      <option key={v} value={v}>{v}s</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="card !py-3 space-y-3 animate-slide-up">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={12} /> Scan Settings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Confidence Alert Threshold: <span className="font-bold text-primary-600">{confidenceThreshold}%</span></label>
                  <input
                    type="range"
                    min="0"
                    max="95"
                    step="5"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(+e.target.value)}
                    className="w-full accent-primary-500 h-1.5"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0% (all)</span>
                    <span>95% (strict)</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Only highlight results above this confidence</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Quick Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Relaxed', val: 0, icon: '😌' },
                      { label: 'Normal', val: 50, icon: '👍' },
                      { label: 'Strict', val: 75, icon: '🔬' },
                      { label: 'Ultra', val: 90, icon: '🎯' },
                    ].map((p) => (
                      <button
                        key={p.val}
                        onClick={() => setConfidenceThreshold(p.val)}
                        className={clsx(
                          'text-xs px-2.5 py-1.5 rounded-lg border transition-all',
                          confidenceThreshold === p.val
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-600'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-200'
                        )}
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video panel */}
          <div className={clsx(
            'relative overflow-hidden rounded-2xl bg-gray-950 aspect-video max-h-[480px] shadow-xl',
            detecting && 'ring-4 ring-primary-500/50',
          )}>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Status badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {streaming && (
                <span className="flex items-center gap-1.5 text-xs bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full font-medium">
                  {detecting ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      LIVE SCANNING
                    </>
                  ) : (
                    <>
                      <Video size={12} />
                      CAMERA ACTIVE
                    </>
                  )}
                </span>
              )}
            </div>

            {/* #13 Lighting Guide Overlay */}
            {streaming && showLightingGuide && lightingScore !== null && (
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                <div className={clsx(
                  'flex items-center gap-1.5 text-xs font-bold backdrop-blur-md px-3 py-1.5 rounded-full',
                  lightingScore >= 70 ? 'bg-green-500/70 text-white' :
                  lightingScore >= 40 ? 'bg-amber-500/70 text-white' :
                  'bg-red-500/70 text-white'
                )}>
                  {lightingScore >= 70 ? <Sun size={12} /> : lightingScore >= 40 ? <SunDim size={12} /> : <Moon size={12} />}
                  {lightingScore >= 70 ? 'Good Light' : lightingScore >= 40 ? 'Low Light' : 'Too Dark'}
                  <span className="ml-1 opacity-80">{lightingScore}%</span>
                </div>
                {lightingUniformity !== null && lightingUniformity < 60 && (
                  <span className="text-[10px] bg-yellow-500/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
                    ⚠ Uneven lighting
                  </span>
                )}
                {lightingScore < 40 && (
                  <span className="text-[10px] bg-black/50 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
                    💡 Move to brighter area
                  </span>
                )}
              </div>
            )}

            {/* Overlay result */}
            {detecting && result && (
              <div className={clsx(
                'absolute bottom-4 left-4 right-4 backdrop-blur-xl text-white px-5 py-3 rounded-xl animate-fade-in flex items-center justify-between',
                result.confidence * 100 >= confidenceThreshold ? 'bg-black/60' : 'bg-black/40 opacity-60'
              )}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${labelBg(result.predicted_label)}`} />
                  <span className="font-bold">{result.predicted_label}</span>
                  {result.confidence * 100 < confidenceThreshold && (
                    <span className="text-xs bg-yellow-500/30 text-yellow-200 px-2 py-0.5 rounded">Below Threshold</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-primary-400 font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{result.grade}</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={36} className="text-white animate-spin" />
                  <span className="text-xs text-white/70">Analyzing…</span>
                </div>
              </div>
            )}

            {!streaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-4 bg-gradient-to-b from-gray-900 to-gray-950">
                <div className="w-20 h-20 rounded-2xl bg-gray-800/80 flex items-center justify-center ring-1 ring-gray-700/50">
                  <Stethoscope size={32} className="text-gray-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-300">Camera Off</p>
                  <p className="text-xs text-gray-500 mt-1">Start the camera to begin fruit examination</p>
                </div>
              </div>
            )}
          </div>

          {/* Result card */}
          {result && !detecting && (
            <div className="animate-slide-up">
              <ResultCard result={result} showImage={false} />
            </div>
          )}
        </div>

        {/* Right sidebar — stats & log */}
        <div className="space-y-5">
          {/* Status indicators */}
          <div className="card grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-1.5 py-3">
              <div className={clsx(
                'w-11 h-11 rounded-xl flex items-center justify-center transition-all',
                streaming ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-200 dark:ring-green-800/40' : 'bg-gray-100 dark:bg-gray-800'
              )}>
                {streaming ? <Video size={18} className="text-green-500" /> : <VideoOff size={18} className="text-gray-400" />}
              </div>
              <p className="text-xs font-medium text-gray-500">{streaming ? 'Camera On' : 'Camera Off'}</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 py-3">
              <div className={clsx(
                'w-11 h-11 rounded-xl flex items-center justify-center transition-all',
                detecting ? 'bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-200 dark:ring-amber-800/40' : 'bg-gray-100 dark:bg-gray-800'
              )}>
                {detecting ? <Scan size={18} className="text-amber-500 animate-pulse" /> : <Target size={18} className="text-gray-400" />}
              </div>
              <p className="text-xs font-medium text-gray-500">{detecting ? 'Scanning' : 'Ready'}</p>
            </div>
          </div>

          {/* Session counter */}
          <div className="card bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 !border-primary-100 dark:!border-primary-800/30 text-center py-6">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary-100 dark:bg-primary-800/40 flex items-center justify-center mb-2">
              <Stethoscope size={22} className="text-primary-500" />
            </div>
            <p className="text-4xl font-extrabold text-primary-700 dark:text-primary-400 tabular-nums">{scanCount}</p>
            <p className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-1.5 font-medium">Examinations this session</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-lg">{fruitEmoji(fruitType)}</span>
              <span className="text-xs text-primary-500 font-bold uppercase tracking-wider">{fruitType} mode</span>
            </div>
          </div>

          {/* Session Performance */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 size={14} className="text-indigo-500" /> Session Performance
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-primary-50 dark:bg-primary-900/10 rounded-xl p-3 text-center">
                <Zap size={14} className="mx-auto text-primary-500 mb-1.5" />
                <p className="text-sm font-bold">{sessionStats.avgConfidence}%</p>
                <p className="text-xs text-gray-400 mt-0.5">Avg Conf.</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 text-center">
                <Shield size={14} className="mx-auto text-green-500 mb-1.5" />
                <p className="text-sm font-bold text-green-600">{sessionStats.freshCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Healthy</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 text-center">
                <Activity size={14} className="mx-auto text-red-500 mb-1.5" />
                <p className="text-sm font-bold text-red-600">{sessionStats.alertCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Alerts</p>
              </div>
            </div>
            {confidenceThreshold > 0 && (
              <p className="text-xs text-gray-400 text-center border-t border-gray-100 dark:border-gray-800 pt-2">
                🎯 Threshold: <span className="font-bold text-primary-500">{confidenceThreshold}%</span>
              </p>
            )}
          </div>

          {/* Detection log */}
          <div className="card space-y-3 max-h-[400px] overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Clock size={14} className="text-blue-500" /> Examination Log
              </h3>
              {detectionLog.length > 0 && (
                <button
                  onClick={() => setDetectionLog([])}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}
            </div>

            {detectionLog.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Eye size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No detections yet</p>
                <p className="text-xs mt-1">Start scanning to see results here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {detectionLog.map((entry, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'flex items-center justify-between p-2.5 rounded-lg text-xs transition-all',
                      i === 0
                        ? 'bg-primary-50 dark:bg-primary-900/10 ring-1 ring-primary-200 dark:ring-primary-800/30'
                        : 'bg-gray-50 dark:bg-gray-800/50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${labelBg(entry.predicted_label)}`} />
                      <span className={`font-medium ${labelColor(entry.predicted_label)}`}>
                        {entry.predicted_label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="font-mono">{(entry.confidence * 100).toFixed(0)}%</span>
                      <span className="opacity-60">{entry.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Capture preview modal */}
      {capturePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="card max-w-md w-full space-y-4 animate-scale-in">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Camera size={18} className="text-primary-500" /> Review Capture
            </h3>
            <img src={capturePreview} alt="Captured" className="rounded-xl w-full shadow-lg" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCapturePreview(null)} className="btn-secondary">Retake</button>
              <button onClick={confirmCapture} className="btn-primary">
                <Stethoscope size={14} /> Confirm & Diagnose
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
