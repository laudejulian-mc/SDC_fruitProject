import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { detectSingle, detectBatch } from '../api';
import ResultCard from '../components/ResultCard';
import Toast from '../components/Toast';
import { FRUIT_OPTIONS, fruitEmoji, getRandomFacts } from '../utils/fruitConstants';
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

  useEffect(() => {
    setCurrentFact(getRandomFacts(fruitType, 3));
  }, [fruitType]);

  const clear = () => {
    setImages([]);
    setResult(null);
    setBatchResults([]);
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

  const [batchProgress, setBatchProgress] = useState('');

  const submit = async () => {
    if (!images.length) return;
    setLoading(true);
    setBatchProgress('');
    try {
      if (mode === 'single') {
        const fd = new FormData();
        const img = images[0];
        fd.append('image', {
          uri: img.uri,
          name: img.fileName || 'photo.jpg',
          type: img.mimeType || 'image/jpeg',
        });
        fd.append('detection_method', 'upload');
        fd.append('fruit_type', fruitType);
        const res = await detectSingle(fd);
        setResult(res.data);
        setScanCount((c) => c + 1);
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
        setBatchResults(results.filter((r) => !r.error));
        setScanCount((c) => c + results.filter((r) => !r.error).length);
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

  const displayFruit = fruitName(fruitType);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

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
                <Image source={{ uri: images[0].uri }} style={styles.previewImage} resizeMode="contain" />
              ) : (
                <View style={styles.previewGrid}>
                  {images.map((img, i) => (
                    <Image key={i} source={{ uri: img.uri }} style={styles.previewThumb} resizeMode="cover" />
                  ))}
                </View>
              )}
              <View style={styles.uploadBtns}>
                <TouchableOpacity onPress={pickImage} style={[styles.uploadBtn, { backgroundColor: c.primaryLight }]}>
                  <Ionicons name="swap-horizontal" size={16} color={c.primary} />
                  <Text style={[styles.uploadBtnText, { color: c.primary }]}>Change</Text>
                </TouchableOpacity>
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

        {/* Session counter + Fun Facts */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: c.card, borderColor: c.cardBorder, ...c.cardShadow }]}>
            <Text style={[styles.statValue, { color: c.primary }]}>{scanCount}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>{t('detect.examsThisSession')}</Text>
          </View>
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
});
