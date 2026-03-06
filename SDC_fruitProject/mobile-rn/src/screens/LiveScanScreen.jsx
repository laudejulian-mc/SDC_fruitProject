import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { detectSingle } from '../api';
import ResultCard from '../components/ResultCard';
import Toast from '../components/Toast';
import { FRUIT_OPTIONS, fruitEmoji, LABEL_TEXT_COLORS } from '../utils/fruitConstants';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, BorderRadius, FontSize, Spacing } from '../theme';

export default function LiveScanScreen() {
  const { t, fruitName, labelName } = useI18n();
  const { dark } = useTheme();
  const c = useColors(dark);

  const cameraRef = useRef(null);
  const intervalRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [streaming, setStreaming] = useState(false);
  const [fruitType, setFruitType] = useState('apple');
  const [detecting, setDetecting] = useState(false);
  const [interval_, setInterval_] = useState(3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [detectionLog, setDetectionLog] = useState([]);
  const [scanCount, setScanCount] = useState(0);

  const startCam = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setToast({ type: 'error', message: t('live.cameraAccessDenied') });
        return;
      }
    }
    setStreaming(true);
  };

  const stopCam = useCallback(() => {
    setStreaming(false);
    setDetecting(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const captureAndDetect = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
      const fd = new FormData();
      fd.append('image', {
        uri: photo.uri,
        name: 'live_capture.jpg',
        type: 'image/jpeg',
      });
      fd.append('detection_method', 'live');
      fd.append('fruit_type', fruitType);
      const res = await detectSingle(fd);
      setResult(res.data);
      setScanCount((c) => c + 1);
      setDetectionLog((log) => [
        { ...res.data, time: new Date().toLocaleTimeString() },
        ...log.slice(0, 19),
      ]);
    } catch {
      setToast({ type: 'error', message: t('live.detectionFailed') });
    } finally {
      setLoading(false);
    }
  }, [fruitType, t]);

  const toggleAutoDetect = () => {
    if (detecting) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setDetecting(false);
    } else {
      setDetecting(true);
      captureAndDetect();
      intervalRef.current = setInterval(() => captureAndDetect(), interval_ * 1000);
    }
  };

  const manualCapture = async () => {
    await captureAndDetect();
    setToast({ type: 'success', message: t('live.captureAnalyzed') });
  };

  useEffect(() => () => stopCam(), [stopCam]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Fruit selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FRUIT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setFruitType(opt.value)}
              style={[
                styles.fruitChip,
                {
                  backgroundColor: fruitType === opt.value ? c.cardElevated : c.inputBg,
                  borderColor: fruitType === opt.value ? c.primary : 'transparent',
                  borderWidth: fruitType === opt.value ? 1 : 0,
                },
              ]}
            >
              <Text>{opt.emoji}</Text>
              <Text style={[styles.fruitChipText, { color: fruitType === opt.value ? c.primary : c.textSecondary }]}>
                {fruitName(opt.value)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Camera view */}
        <View style={[styles.cameraBox, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
          {streaming ? (
            <View style={styles.cameraWrapper}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
              />
              {/* Status overlay */}
              <View style={styles.cameraOverlay}>
                <View style={[styles.statusBadge, { backgroundColor: detecting ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.8)' }]}>
                  <Ionicons
                    name={detecting ? 'radio' : 'videocam'}
                    size={10}
                    color={detecting ? '#fff' : '#374151'}
                  />
                  <Text style={[styles.statusText, { color: detecting ? '#fff' : '#374151' }]}>
                    {detecting ? t('live.liveScanning') : t('live.cameraActive')}
                  </Text>
                </View>
              </View>
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator color="#fff" size="large" />
                  <Text style={styles.loadingText}>{t('live.analyzing')}</Text>
                </View>
              )}
              {/* Live result overlay */}
              {result && !loading && (
                <View style={styles.resultOverlay}>
                  <Text style={{ fontSize: 18 }}>{fruitEmoji(result.fruit_type)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resultLabel, { color: result.predicted_label === 'Fresh' ? '#4ade80' : '#f87171' }]}>
                      {result.predicted_label === 'Fresh' ? '✅' : '❌'} {labelName(result.predicted_label)}
                    </Text>
                    <Text style={styles.resultGrade}>{result.grade}</Text>
                  </View>
                  <Text style={styles.resultConf}>{(result.confidence * 100).toFixed(1)}%</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.cameraOff}>
              <Ionicons name="videocam-off" size={40} color={c.textMuted} />
              <Text style={[styles.cameraOffText, { color: c.textSecondary }]}>{t('live.cameraOff')}</Text>
              <Text style={[styles.cameraOffSub, { color: c.textMuted }]}>{t('live.startCameraToBegin')}</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={streaming ? stopCam : startCam}
            style={[styles.controlBtn, { backgroundColor: streaming ? c.red : c.primary, flex: 1 }]}
          >
            <Ionicons name={streaming ? 'videocam-off' : 'videocam'} size={16} color="#fff" />
            <Text style={styles.controlText}>{streaming ? t('live.stopCamera') : t('live.startCamera')}</Text>
          </TouchableOpacity>
          {streaming && (
            <>
              <TouchableOpacity
                onPress={toggleAutoDetect}
                style={[styles.controlBtn, { backgroundColor: detecting ? c.amber : c.green }]}
              >
                <Ionicons name="radio" size={16} color="#fff" />
                <Text style={styles.controlText}>{detecting ? 'Stop' : 'Auto'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={manualCapture} style={[styles.controlBtn, { backgroundColor: c.inputBg }]}>
                <Ionicons name="camera" size={16} color={c.text} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Session stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
            <Text style={[styles.statValue, { color: c.primary }]}>{scanCount}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>{t('live.examsThisSession')}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
            <Text style={[styles.statValue, { color: c.green }]}>
              {detectionLog.filter((e) => e.predicted_label === 'Fresh').length}
            </Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>{t('live.healthy')}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
            <Text style={[styles.statValue, { color: c.red }]}>
              {detectionLog.filter((e) => e.predicted_label !== 'Fresh').length}
            </Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>{t('live.alerts')}</Text>
          </View>
        </View>

        {/* Detection log */}
        {detectionLog.length > 0 && (
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
            <View style={styles.logHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>{t('live.examLog')}</Text>
              <TouchableOpacity onPress={() => setDetectionLog([])}>
                <Text style={{ fontSize: FontSize.xs, color: c.textMuted }}>{t('live.clearLog')}</Text>
              </TouchableOpacity>
            </View>
            {detectionLog.slice(0, 10).map((entry, i) => (
              <View key={i} style={[styles.logRow, { borderBottomColor: c.divider }]}>
                <Text>{fruitEmoji(entry.fruit_type)}</Text>
                <Text style={[styles.logLabel, { color: entry.predicted_label === 'Fresh' ? c.green : c.red }]}>
                  {labelName(entry.predicted_label)}
                </Text>
                <Text style={[styles.logConf, { color: c.text }]}>
                  {(entry.confidence * 100).toFixed(0)}%
                </Text>
                <Text style={[styles.logTime, { color: c.textMuted }]}>{entry.time}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Full result */}
        {result && !streaming && <ResultCard result={result} />}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  fruitChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md, marginRight: Spacing.sm,
  },
  fruitChipText: { fontSize: FontSize.sm, fontWeight: '600' },
  cameraBox: { borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden' },
  cameraWrapper: { aspectRatio: 4 / 3 },
  camera: { flex: 1 },
  cameraOverlay: { position: 'absolute', top: Spacing.md, left: Spacing.md, right: Spacing.md, flexDirection: 'row', justifyContent: 'space-between' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  loadingText: { color: '#fff', fontSize: FontSize.sm },
  resultOverlay: {
    position: 'absolute', bottom: Spacing.md, left: Spacing.md, right: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: BorderRadius.md, padding: Spacing.md,
  },
  resultLabel: { fontSize: FontSize.md, fontWeight: '700' },
  resultGrade: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)' },
  resultConf: { color: '#fff', fontSize: FontSize.xl, fontWeight: '700', fontVariant: ['tabular-nums'] },
  cameraOff: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  cameraOffText: { fontSize: FontSize.md, fontWeight: '500', marginTop: Spacing.md },
  cameraOffSub: { fontSize: FontSize.xs, marginTop: 4 },
  controls: { flexDirection: 'row', gap: Spacing.sm },
  controlBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md },
  controlText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statBox: { flex: 1, borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: Spacing.sm },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700' },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6, borderBottomWidth: 1 },
  logLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
  logConf: { fontSize: FontSize.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
  logTime: { fontSize: FontSize.xs },
});
