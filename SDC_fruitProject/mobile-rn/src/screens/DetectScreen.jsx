import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert, Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { detectSingle, detectBatch } from '../api';
import ResultCard from '../components/ResultCard';
import Toast from '../components/Toast';
import { FRUIT_OPTIONS, fruitEmoji, getRandomFacts } from '../utils/fruitConstants';
import { analyzeImageQuality, qualityLabel, computeImageFingerprint, isDuplicate, enhanceImage } from '../utils/imageUtils';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { useColors, BorderRadius, FontSize, Spacing, Shadows } from '../theme';

export default function DetectScreen() {
  const { t, fruitName, labelName } = useI18n();
  const { dark } = useTheme();
  const c = useColors(dark);

  const [mode, setMode] = useState('single');
  const [fruitType, setFruitType] = useState('apple');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [toast, setToast] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [currentFact, setCurrentFact] = useState(() => getRandomFacts('apple', 3));

  // ─── #3 Image Quality Detection ─────────────────────────
  const [qualityInfo, setQualityInfo] = useState(null);
  const [qualityChecking, setQualityChecking] = useState(false);

  // ─── #8 Spoilage Alert ──────────────────────────────────
  const [spoilageVisible, setSpoilageVisible] = useState(false);
  const [spoilageResult, setSpoilageResult] = useState(null);
  const [spoilageDismissed, setSpoilageDismissed] = useState(false);

  // ─── #11 Session Summary ────────────────────────────────
  const [sessionResults, setSessionResults] = useState([]);
  const [sessionSummaryVisible, setSessionSummaryVisible] = useState(false);

  // ─── #12 Duplicate Detection ────────────────────────────
  const [recentFingerprints, setRecentFingerprints] = useState([]);

  // ─── #16 Auto Enhancement ───────────────────────────────
  const [enhancedUri, setEnhancedUri] = useState(null);
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    setCurrentFact(getRandomFacts(fruitType, 3));
  }, [fruitType]);

  // ── Run quality check when image changes ────────────────
  useEffect(() => {
    if (images.length === 1 && mode === 'single') {
      runQualityCheck(images[0]);
    } else {
      setQualityInfo(null);
      setEnhancedUri(null);
    }
  }, [images]);

  const runQualityCheck = async (asset) => {
    setQualityChecking(true);
    try {
      const info = await analyzeImageQuality(asset);
      setQualityInfo(info);
    } catch {
      setQualityInfo(null);
    }
    setQualityChecking(false);
  };

  const clear = () => {
    setImages([]);
    setResult(null);
    setBatchResults([]);
    setQualityInfo(null);
    setEnhancedUri(null);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: mode === 'batch',
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      const selected = mode === 'single' ? [pickerResult.assets[0]] : pickerResult.assets;

      // ── #12 Duplicate check for single mode ──────────────
      if (mode === 'single') {
        const fp = await computeImageFingerprint(selected[0]);
        const dup = recentFingerprints.find((rfp) => isDuplicate(fp, rfp));
        if (dup) {
          Alert.alert(
            t('duplicate.detected'),
            t('duplicate.description'),
            [
              { text: t('duplicate.chooseAnother'), style: 'cancel' },
              {
                text: t('duplicate.continueAnyway'),
                onPress: () => {
                  setImages(selected);
                  setResult(null);
                  setBatchResults([]);
                },
              },
            ],
          );
          return;
        }
      }

      if (mode === 'single') {
        setImages([pickerResult.assets[0]]);
      } else {
        setImages(pickerResult.assets);
      }
      setResult(null);
      setBatchResults([]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera.');
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
      setImages([pickerResult.assets[0]]);
      setResult(null);
      setBatchResults([]);
    }
  };

  // ── #16 Auto-enhance ────────────────────────────────────
  const handleEnhance = async () => {
    if (!images.length) return;
    setEnhancing(true);
    try {
      const uri = await enhanceImage(images[0].uri);
      setEnhancedUri(uri);
      setToast({ type: 'success', message: t('quality.enhanced') });
    } catch {
      setToast({ type: 'error', message: 'Enhancement failed' });
    }
    setEnhancing(false);
  };

  const [batchProgress, setBatchProgress] = useState('');

  const submit = async () => {
    if (!images.length) return;
    setLoading(true);
    setBatchProgress('');
    try {
      if (mode === 'single') {
        const fd = new FormData();
        const img = images[0];
        // Use enhanced URI if available (#16)
        const uri = enhancedUri || img.uri;
        fd.append('image', {
          uri,
          name: img.fileName || 'photo.jpg',
          type: img.mimeType || 'image/jpeg',
        });
        fd.append('detection_method', 'upload');
        fd.append('fruit_type', fruitType);
        const res = await detectSingle(fd);
        setResult(res.data);
        setScanCount((c) => c + 1);
        setSessionResults((prev) => [...prev, res.data]); // #11

        // ── #12 Store fingerprint ──────────────────────────
        const fp = await computeImageFingerprint(img);
        setRecentFingerprints((prev) => [fp, ...prev.slice(0, 19)]);

        // ── #8 Spoilage alert ──────────────────────────────
        if (res.data.predicted_label === 'Rotten' && !spoilageDismissed) {
          setSpoilageResult(res.data);
          setSpoilageVisible(true);
        }

        setToast({ type: 'success', message: t('detect.diagnosisComplete', { fruit: fruitName(fruitType) }) });
      } else {
        // RN FormData with repeated file keys is unreliable.
        // Send each image as an individual detect call sequentially.
        const results = [];
        for (let i = 0; i < images.length; i++) {
          setBatchProgress(`${i + 1} / ${images.length}`);
          const img = images[i];
          const fd = new FormData();
          fd.append('image', {
            uri: img.uri,
            name: img.fileName || `photo_${i}.jpg`,
            type: img.mimeType || 'image/jpeg',
          });
          fd.append('detection_method', 'batch');
          fd.append('fruit_type', fruitType);
          try {
            const res = await detectSingle(fd);
            results.push(res.data);
          } catch (e) {
            results.push({ error: e.response?.data?.error || 'Failed', filename: img.fileName || `photo_${i}.jpg` });
          }
        }
        const successful = results.filter((r) => !r.error);
        setBatchResults(successful);
        setScanCount((c) => c + successful.length);
        setSessionResults((prev) => [...prev, ...successful]); // #11

        // ── #8 Spoilage alert for batch ────────────────────
        const rottenBatch = successful.filter((r) => r.predicted_label === 'Rotten').length;
        if (rottenBatch > 0 && !spoilageDismissed) {
          setSpoilageResult({ predicted_label: 'Rotten', count: rottenBatch });
          setSpoilageVisible(true);
        }

        const failed = results.filter((r) => r.error).length;
        const msg = failed > 0
          ? `${results.length - failed}/${results.length} analyzed` 
          : t('detect.batchComplete', { n: results.length, fruit: fruitName(fruitType) });
        setToast({ type: failed > 0 ? 'warning' : 'success', message: msg });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || t('detect.diagnosisFailed') });
    } finally {
      setLoading(false);
      setBatchProgress('');
    }
  };

  // ── #11 Session summary helpers ─────────────────────────
  const freshCount = sessionResults.filter((r) => r.predicted_label === 'Fresh').length;
  const rottenCount = sessionResults.filter((r) => r.predicted_label === 'Rotten').length;
  const avgConfidence = sessionResults.length > 0
    ? (sessionResults.reduce((s, r) => s + (r.confidence || 0), 0) / sessionResults.length * 100).toFixed(1)
    : '0.0';
  const freshRate = sessionResults.length > 0
    ? ((freshCount / sessionResults.length) * 100).toFixed(0)
    : '0';

  const resetSession = () => {
    setSessionResults([]);
    setScanCount(0);
    setSpoilageDismissed(false);
  };

  const displayFruit = fruitName(fruitType);

  // ── Quality badge color ─────────────────────────────────
  const getQualityColor = (score) => {
    if (score >= 80) return c.green;
    if (score >= 60) return c.blue;
    if (score >= 40) return c.amber;
    return c.red;
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ── #8 Spoilage Alert Modal ──────────────────────── */}
      <Modal visible={spoilageVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.spoilageModal, { backgroundColor: c.card, ...c.cardShadowElevated }]}>
            <Text style={[styles.spoilageTitle, { color: c.red }]}>{t('spoilage.alertTitle')}</Text>
            <Text style={[styles.spoilageSubtitle, { color: c.textSecondary }]}>{t('spoilage.alertSubtitle')}</Text>

            <View style={[styles.spoilageTipsBox, { backgroundColor: c.errorBg, borderColor: c.errorBorder }]}>
              <Text style={[styles.spoilageTipsTitle, { color: c.errorText }]}>{t('spoilage.disposalTitle')}</Text>
              {[1, 2, 3, 4, 5].map((n) => (
                <Text key={n} style={[styles.spoilageTip, { color: c.textSecondary }]}>
                  • {t(`spoilage.tip${n}`)}
                </Text>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => { setSpoilageDismissed(true); setSpoilageVisible(false); }}
              style={styles.spoilageDontShow}
            >
              <Ionicons name="checkbox-outline" size={16} color={c.textMuted} />
              <Text style={[styles.spoilageDontShowText, { color: c.textMuted }]}>{t('spoilage.dontShowAgain')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSpoilageVisible(false)}
              style={[styles.spoilageDismissBtn, { backgroundColor: c.primary }]}
            >
              <Text style={styles.spoilageDismissText}>{t('spoilage.dismiss')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── #11 Session Summary Modal ────────────────────── */}
      <Modal visible={sessionSummaryVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.sessionModal, { backgroundColor: c.card, ...c.cardShadowElevated }]}>
            <View style={styles.sessionHeader}>
              <Text style={[styles.sessionTitle, { color: c.text }]}>📊 {t('session.title')}</Text>
              <TouchableOpacity onPress={() => setSessionSummaryVisible(false)}>
                <Ionicons name="close" size={22} color={c.textMuted} />
              </TouchableOpacity>
            </View>

            {sessionResults.length === 0 ? (
              <Text style={[styles.sessionEmpty, { color: c.textMuted }]}>{t('session.sessionEmpty')}</Text>
            ) : (
              <>
                <View style={styles.sessionGrid}>
                  <View style={[styles.sessionCard, { backgroundColor: c.primaryLight }]}>
                    <Text style={[styles.sessionCardValue, { color: c.primary }]}>{sessionResults.length}</Text>
                    <Text style={[styles.sessionCardLabel, { color: c.textSecondary }]}>{t('session.totalScans')}</Text>
                  </View>
                  <View style={[styles.sessionCard, { backgroundColor: c.greenLight }]}>
                    <Text style={[styles.sessionCardValue, { color: c.green }]}>{freshCount}</Text>
                    <Text style={[styles.sessionCardLabel, { color: c.textSecondary }]}>{t('session.freshCount')}</Text>
                  </View>
                  <View style={[styles.sessionCard, { backgroundColor: c.redLight }]}>
                    <Text style={[styles.sessionCardValue, { color: c.red }]}>{rottenCount}</Text>
                    <Text style={[styles.sessionCardLabel, { color: c.textSecondary }]}>{t('session.rottenCount')}</Text>
                  </View>
                  <View style={[styles.sessionCard, { backgroundColor: c.blueLight }]}>
                    <Text style={[styles.sessionCardValue, { color: c.blue }]}>{avgConfidence}%</Text>
                    <Text style={[styles.sessionCardLabel, { color: c.textSecondary }]}>{t('session.avgConfidence')}</Text>
                  </View>
                </View>

                {/* Freshness rate bar */}
                <View style={styles.freshRateRow}>
                  <Text style={[styles.freshRateLabel, { color: c.textSecondary }]}>{t('session.freshRate')}</Text>
                  <View style={[styles.freshRateBar, { backgroundColor: c.cardBorderSubtle }]}>
                    <View style={[styles.freshRateFill, { width: `${freshRate}%`, backgroundColor: c.green }]} />
                  </View>
                  <Text style={[styles.freshRateValue, { color: c.green }]}>{freshRate}%</Text>
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={() => { resetSession(); setSessionSummaryVisible(false); }}
              style={[styles.sessionResetBtn, { borderColor: c.red }]}
            >
              <Ionicons name="refresh" size={14} color={c.red} />
              <Text style={{ color: c.red, fontWeight: '600', fontSize: FontSize.sm }}>{t('session.reset')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Fruit selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fruitScroll}>
          {FRUIT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => { setFruitType(opt.value); clear(); }}
              style={[
                styles.fruitChip,
                {
                  backgroundColor: fruitType === opt.value
                    ? c.cardElevated
                    : c.inputBg,
                  borderColor: fruitType === opt.value ? c.primary : 'transparent',
                  borderWidth: fruitType === opt.value ? 1 : 0,
                  ...(fruitType === opt.value ? c.cardShadow : {}),
                },
              ]}
            >
              <Text style={styles.fruitChipEmoji}>{opt.emoji}</Text>
              <Text
                style={[
                  styles.fruitChipText,
                  { color: fruitType === opt.value ? c.primary : c.textSecondary },
                ]}
              >
                {fruitName(opt.value)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Mode tabs */}
        <View style={styles.modeTabs}>
          {['single', 'batch'].map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => { setMode(m); clear(); }}
              style={[
                styles.modeTab,
                {
                  backgroundColor: mode === m ? c.primary : c.inputBg,
                },
              ]}
            >
              <Ionicons
                name={m === 'single' ? 'image-outline' : 'images-outline'}
                size={16}
                color={mode === m ? '#fff' : c.textSecondary}
              />
              <Text
                style={[
                  styles.modeTabText,
                  { color: mode === m ? '#fff' : c.textSecondary },
                ]}
              >
                {m === 'single' ? t('detect.singleExam') : t('detect.batchExam')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upload area */}
        <View style={[styles.uploadArea, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
          {images.length === 0 ? (
            <View style={styles.uploadEmpty}>
              <View style={[styles.uploadIconBox, { backgroundColor: c.primaryLight }]}>
                <Ionicons name="medical" size={28} color={c.primary} />
              </View>
              <Text style={[styles.uploadTitle, { color: c.text }]}>
                {t('detect.dropImage', { fruit: displayFruit, type: mode === 'batch' ? t('detect.images') : t('detect.image') })}
              </Text>
              <Text style={[styles.uploadSub, { color: c.textMuted }]}>{t('detect.orClickBrowse')}</Text>

              <View style={styles.uploadBtns}>
                <TouchableOpacity onPress={pickImage} style={[styles.uploadBtn, { backgroundColor: c.primaryLight }]}>
                  <Ionicons name="images-outline" size={20} color={c.primary} />
                  <Text style={[styles.uploadBtnText, { color: c.primary }]}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={takePhoto} style={[styles.uploadBtn, { backgroundColor: c.primaryLight }]}>
                  <Ionicons name="camera-outline" size={20} color={c.primary} />
                  <Text style={[styles.uploadBtnText, { color: c.primary }]}>Camera</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <TouchableOpacity onPress={clear} style={styles.clearBtn}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
              {mode === 'single' ? (
                <Image source={{ uri: enhancedUri || images[0].uri }} style={styles.previewImage} resizeMode="contain" />
              ) : (
                <View style={styles.previewGrid}>
                  {images.map((img, i) => (
                    <Image key={i} source={{ uri: img.uri }} style={styles.previewThumb} resizeMode="cover" />
                  ))}
                </View>
              )}

              {/* ── #3 Quality indicator badge ───────────── */}
              {qualityInfo && mode === 'single' && (
                <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(qualityInfo.score) + '20', borderColor: getQualityColor(qualityInfo.score) }]}>
                  <Ionicons
                    name={qualityInfo.score >= 60 ? 'checkmark-circle' : 'warning'}
                    size={14}
                    color={getQualityColor(qualityInfo.score)}
                  />
                  <Text style={[styles.qualityBadgeText, { color: getQualityColor(qualityInfo.score) }]}>
                    {t(`quality.${qualityLabel(qualityInfo.score)}`)} ({qualityInfo.score}/100)
                  </Text>
                </View>
              )}
              {qualityChecking && mode === 'single' && (
                <View style={[styles.qualityBadge, { borderColor: 'transparent' }]}>
                  <ActivityIndicator size="small" color={c.textMuted} />
                  <Text style={[styles.qualityBadgeText, { color: c.textMuted }]}>{t('quality.analyzing')}</Text>
                </View>
              )}

              {/* ── #3 Quality issues list ───────────────── */}
              {qualityInfo && qualityInfo.issues.length > 0 && mode === 'single' && (
                <View style={[styles.qualityIssues, { backgroundColor: c.warningBg, borderColor: c.warningBorder }]}>
                  {qualityInfo.issues.map((issue, i) => (
                    <Text key={i} style={[styles.qualityIssueText, { color: c.warningText }]}>
                      ⚠ {t(`quality.${issue}`) || issue}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.uploadBtns}>
                <TouchableOpacity onPress={pickImage} style={[styles.uploadBtn, { backgroundColor: c.primaryLight }]}>
                  <Ionicons name="swap-horizontal" size={16} color={c.primary} />
                  <Text style={[styles.uploadBtnText, { color: c.primary }]}>Change</Text>
                </TouchableOpacity>

                {/* ── #16 Auto-enhance button ───────────── */}
                {mode === 'single' && !enhancedUri && (
                  <TouchableOpacity
                    onPress={handleEnhance}
                    disabled={enhancing}
                    style={[styles.uploadBtn, { backgroundColor: c.blueLight }]}
                  >
                    {enhancing ? (
                      <ActivityIndicator size="small" color={c.blue} />
                    ) : (
                      <Ionicons name="color-wand-outline" size={16} color={c.blue} />
                    )}
                    <Text style={[styles.uploadBtnText, { color: c.blue }]}>{t('enhance.title')}</Text>
                  </TouchableOpacity>
                )}
                {enhancedUri && (
                  <TouchableOpacity
                    onPress={() => setEnhancedUri(null)}
                    style={[styles.uploadBtn, { backgroundColor: c.amberLight }]}
                  >
                    <Ionicons name="arrow-undo" size={16} color={c.amber} />
                    <Text style={[styles.uploadBtnText, { color: c.amber }]}>{t('quality.original')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          onPress={submit}
          disabled={!images.length || loading}
          style={[styles.submitBtn, { backgroundColor: c.primary, opacity: (!images.length || loading) ? 0.5 : 1, ...Shadows.glow(c.primary) }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="medical" size={20} color="#fff" />
          )}
          <Text style={styles.submitText}>
            {loading
              ? (batchProgress ? `${t('detect.diagnosing')} ${batchProgress}` : t('detect.diagnosing'))
              : `${t('detect.diagnose')} ${displayFruit}`}
          </Text>
        </TouchableOpacity>

        {/* ── #11 Session Summary + Fun Facts ────────────── */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statBox, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}
            onPress={() => setSessionSummaryVisible(true)}
          >
            <Text style={[styles.statValue, { color: c.primary }]}>{scanCount}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>{t('detect.examsThisSession')}</Text>
            {sessionResults.length > 0 && (
              <View style={styles.miniStats}>
                <Text style={[styles.miniStat, { color: c.green }]}>✅ {freshCount}</Text>
                <Text style={[styles.miniStat, { color: c.red }]}>❌ {rottenCount}</Text>
              </View>
            )}
            <Text style={[styles.viewSummaryLink, { color: c.primary }]}>{t('session.viewSummary')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statBox, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow, flex: 1 }]}
            onPress={() => setCurrentFact(getRandomFacts(fruitType, 3))}
          >
            <Text style={[styles.factTitle, { color: c.amber }]}>💡 {t('detect.funFact')}</Text>
            <Text style={[styles.factText, { color: c.amberLight }]} numberOfLines={3}>
              {currentFact[0] && (typeof currentFact[0] === 'string' ? currentFact[0] : currentFact[0].text)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {result && <ResultCard result={result} />}
        {batchResults.length > 0 && batchResults.map((r, i) => <ResultCard key={i} result={r} />)}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  fruitScroll: { flexGrow: 0 },
  fruitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  fruitChipEmoji: { fontSize: 16 },
  fruitChipText: { fontSize: FontSize.sm, fontWeight: '600' },
  modeTabs: { flexDirection: 'row', gap: Spacing.sm },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  modeTabText: { fontSize: FontSize.sm, fontWeight: '600' },
  uploadArea: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  uploadEmpty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  uploadIconBox: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  uploadTitle: { fontSize: FontSize.md, fontWeight: '600', textAlign: 'center' },
  uploadSub: { fontSize: FontSize.xs, marginTop: 4 },
  uploadBtns: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  uploadBtnText: { fontSize: FontSize.md, fontWeight: '600' },
  clearBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: { width: '100%', height: 220, borderRadius: BorderRadius.md },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  previewThumb: { width: 100, height: 100, borderRadius: BorderRadius.md },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  submitText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  statBox: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: FontSize.xxl, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs },
  factTitle: { fontSize: FontSize.xs, fontWeight: '700', marginBottom: 4 },
  factText: { fontSize: FontSize.xs, lineHeight: 18 },

  // ── #3 Quality badge ────────────────────────────────────
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  qualityBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  qualityIssues: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 2,
  },
  qualityIssueText: { fontSize: FontSize.xs },

  // ── #8 Spoilage modal ──────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  spoilageModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  spoilageTitle: { fontSize: FontSize.xl, fontWeight: '700', textAlign: 'center' },
  spoilageSubtitle: { fontSize: FontSize.sm, textAlign: 'center' },
  spoilageTipsBox: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 6,
  },
  spoilageTipsTitle: { fontSize: FontSize.sm, fontWeight: '700', marginBottom: 4 },
  spoilageTip: { fontSize: FontSize.xs, lineHeight: 18 },
  spoilageDontShow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
  },
  spoilageDontShowText: { fontSize: FontSize.xs },
  spoilageDismissBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  spoilageDismissText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },

  // ── #11 Session summary modal ──────────────────────────
  sessionModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  sessionEmpty: { fontSize: FontSize.sm, textAlign: 'center', paddingVertical: Spacing.xxl },
  sessionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sessionCard: {
    width: '47%',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  sessionCardValue: { fontSize: FontSize.xxl, fontWeight: '700' },
  sessionCardLabel: { fontSize: FontSize.xs, marginTop: 2 },
  freshRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  freshRateLabel: { fontSize: FontSize.xs, width: 80 },
  freshRateBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  freshRateFill: { height: '100%', borderRadius: 4 },
  freshRateValue: { fontSize: FontSize.sm, fontWeight: '700', width: 40, textAlign: 'right' },
  sessionResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },

  // ── #11 Mini stats in stat box ─────────────────────────
  miniStats: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  miniStat: { fontSize: FontSize.xs, fontWeight: '600' },
  viewSummaryLink: { fontSize: FontSize.xs, marginTop: 4, fontWeight: '600' },
});
