/**
 * Image analysis utilities for FruitMD React Native.
 * RN-compatible — uses expo-image-manipulator & file info instead of Canvas.
 *
 * Features:
 *  #3  Image Quality Detection (dimension/fileSize heuristics)
 *  #12 Duplicate Image Detection (size + dimension fingerprint)
 *  #16 Auto Image Enhancement (expo-image-manipulator)
 */
import * as FileSystem from 'expo-file-system';
import { Image as RNImage } from 'react-native';

// ─── Image Quality Detection (#3) ──────────────────────────────────────────
/**
 * Analyze image quality using file-level heuristics (no Canvas in RN).
 * Checks: resolution, file size.
 * @param {{ uri: string, width?: number, height?: number, fileSize?: number }} asset
 * @returns {Promise<{score: number, width: number, height: number, fileSize: number, issues: string[]}>}
 */
export async function analyzeImageQuality(asset) {
  let { width, height, fileSize } = asset;

  // Get file info if missing
  if (!fileSize) {
    try {
      const info = await FileSystem.getInfoAsync(asset.uri, { size: true });
      fileSize = info.size || 0;
    } catch {
      fileSize = 0;
    }
  }

  // Get dimensions if missing
  if (!width || !height) {
    try {
      const dims = await new Promise((resolve, reject) => {
        RNImage.getSize(
          asset.uri,
          (w, h) => resolve({ w, h }),
          reject,
        );
      });
      width = dims.w;
      height = dims.h;
    } catch {
      width = 0;
      height = 0;
    }
  }

  const issues = [];
  const megapixels = (width * height) / 1_000_000;
  const fileSizeKB = fileSize / 1024;

  // Resolution checks
  if (width < 200 || height < 200) issues.push('lowResolution');
  if (megapixels < 0.1) issues.push('blurry'); // proxy: very small image often = blurry

  // File size checks (proxy for compression artifacts)
  if (fileSizeKB < 20) issues.push('lowContrast'); // heavily compressed → likely low quality
  if (fileSizeKB > 15_000) issues.push('tooLarge');

  // Brightness / darkness heuristic: we can't analyze pixels, but extreme file sizes hint
  // Very small file for resolution → likely dark / low contrast
  const expectedSize = megapixels * 300; // rough JPEG KB per MP
  if (fileSizeKB < expectedSize * 0.15 && fileSizeKB > 0) issues.push('tooDark');
  if (fileSizeKB > expectedSize * 3 && megapixels > 0.5) issues.push('tooBright');

  // Score: 0-100
  const resScore = Math.min(megapixels / 2, 1) * 40;           // up to 2MP = full marks
  const sizeScore = Math.min(fileSizeKB / 500, 1) * 30;        // ≥500KB = full marks
  const ratioScore = (width && height)
    ? (1 - Math.abs(width / height - 1) * 0.3) * 30            // closer to square = better for detection
    : 15;
  const penalty = issues.length * 8;
  const score = Math.max(0, Math.min(100, Math.round(resScore + sizeScore + ratioScore - penalty)));

  return { score, width, height, fileSize, issues };
}

/**
 * Return a human-readable quality label from score.
 */
export function qualityLabel(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

// ─── Duplicate Image Detection (#12) ───────────────────────────────────────
/**
 * Compute a simple fingerprint from an image asset.
 * Uses file size + dimensions as proxy (no pixel access in RN).
 * @param {{ uri: string, width?: number, height?: number, fileSize?: number }} asset
 * @returns {Promise<string>}
 */
export async function computeImageFingerprint(asset) {
  let { width, height, fileSize } = asset;
  if (!fileSize) {
    try {
      const info = await FileSystem.getInfoAsync(asset.uri, { size: true });
      fileSize = info.size || 0;
    } catch {
      fileSize = 0;
    }
  }
  if (!width || !height) {
    try {
      const dims = await new Promise((resolve, reject) => {
        RNImage.getSize(asset.uri, (w, h) => resolve({ w, h }), reject);
      });
      width = dims.w;
      height = dims.h;
    } catch {
      width = 0;
      height = 0;
    }
  }
  // Quantize values to tolerate minor re-encoding differences
  const qSize = Math.round(fileSize / 1024); // KB
  const qW = Math.round(width / 10) * 10;
  const qH = Math.round(height / 10) * 10;
  return `${qW}x${qH}_${qSize}`;
}

/**
 * Check if two fingerprints are similar enough to be duplicates.
 */
export function isDuplicate(fp1, fp2) {
  if (!fp1 || !fp2) return false;
  if (fp1 === fp2) return true;
  // Parse and compare
  const parse = (fp) => {
    const [dims, size] = fp.split('_');
    const [w, h] = dims.split('x').map(Number);
    return { w, h, size: Number(size) };
  };
  try {
    const a = parse(fp1);
    const b = parse(fp2);
    const dimMatch = Math.abs(a.w - b.w) <= 20 && Math.abs(a.h - b.h) <= 20;
    const sizeMatch = Math.abs(a.size - b.size) <= 50; // within 50KB
    return dimMatch && sizeMatch;
  } catch {
    return false;
  }
}

// ─── Auto Image Enhancement (#16) ─────────────────────────────────────────
/**
 * Enhance image using expo-image-manipulator.
 * Applies mild resize + compress for better detection quality.
 * Falls back to original if manipulator is unavailable.
 * @param {string} uri
 * @returns {Promise<string>} enhanced image URI
 */
export async function enhanceImage(uri) {
  try {
    // Dynamic import to avoid crash if not installed
    const ImageManipulator = await import('expo-image-manipulator');
    const manipulate = ImageManipulator.manipulateAsync || ImageManipulator.default?.manipulateAsync;
    if (!manipulate) return uri;

    const result = await manipulate(
      uri,
      [{ resize: { width: 1024 } }], // standardize to 1024px width
      { compress: 0.9, format: ImageManipulator.SaveFormat?.JPEG || 'jpeg' },
    );
    return result.uri;
  } catch {
    // expo-image-manipulator not available — return original
    return uri;
  }
}
