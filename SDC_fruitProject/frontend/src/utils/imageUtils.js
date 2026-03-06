/**
 * Image analysis utilities for FruitMD.
 * Provides: quality detection, duplicate hashing, auto-enhance, edge detection.
 * All operations are pure frontend using Canvas — no backend changes needed.
 */

// ─── Image Quality Detection (#3) ──────────────────────────────────────────
/**
 * Analyze image quality: blur (Laplacian variance) + brightness + contrast.
 * @param {File|Blob} file - The image file to analyze
 * @returns {Promise<{score: number, blur: number, brightness: number, contrast: number, issues: string[]}>}
 */
export async function analyzeImageQuality(file) {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const size = 256; // downsample for speed
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  // Convert to grayscale
  const gray = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  // Blur detection: Laplacian variance
  let lapSum = 0;
  let lapSumSq = 0;
  let count = 0;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const lap =
        gray[(y - 1) * size + x] +
        gray[(y + 1) * size + x] +
        gray[y * size + (x - 1)] +
        gray[y * size + (x + 1)] -
        4 * gray[y * size + x];
      lapSum += lap;
      lapSumSq += lap * lap;
      count++;
    }
  }
  const lapMean = lapSum / count;
  const lapVariance = lapSumSq / count - lapMean * lapMean;

  // Brightness: average pixel value (0-255)
  let brightnessSum = 0;
  for (let i = 0; i < gray.length; i++) brightnessSum += gray[i];
  const brightness = brightnessSum / gray.length;

  // Contrast: standard deviation of grayscale
  let contrastSum = 0;
  for (let i = 0; i < gray.length; i++) contrastSum += (gray[i] - brightness) ** 2;
  const contrast = Math.sqrt(contrastSum / gray.length);

  const issues = [];
  if (lapVariance < 100) issues.push('blurry');
  if (brightness < 50) issues.push('tooDark');
  if (brightness > 220) issues.push('tooBright');
  if (contrast < 25) issues.push('lowContrast');

  // Overall quality score 0-100
  const blurScore = Math.min(lapVariance / 500, 1) * 40;
  const brightScore = (1 - Math.abs(brightness - 128) / 128) * 30;
  const contrastScore = Math.min(contrast / 60, 1) * 30;
  const score = Math.round(blurScore + brightScore + contrastScore);

  return { score, blur: Math.round(lapVariance), brightness: Math.round(brightness), contrast: Math.round(contrast), issues };
}

// ─── Duplicate Image Detection (#12) ───────────────────────────────────────
/**
 * Compute a simple perceptual hash (aHash) of an image.
 * Returns a 64-bit hex string. Similar images produce similar hashes.
 * @param {File|Blob} file
 * @returns {Promise<string>}
 */
export async function computeImageHash(file) {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 8, 8);
  const data = ctx.getImageData(0, 0, 8, 8).data;

  // Convert to grayscale
  const gray = [];
  for (let i = 0; i < 64; i++) {
    const idx = i * 4;
    gray.push(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
  }

  // Average
  const avg = gray.reduce((s, v) => s + v, 0) / 64;

  // Build hash: each bit = pixel > average
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += gray[i] >= avg ? '1' : '0';
  }

  // Convert binary string to hex
  let hex = '';
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(hash.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

/**
 * Compare two hashes and return similarity (0-1).
 * Uses Hamming distance.
 */
export function hashSimilarity(hash1, hash2) {
  if (hash1.length !== hash2.length) return 0;
  let same = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) same++;
  }
  return same / hash1.length;
}

// ─── Auto Image Enhancement (#16) ──────────────────────────────────────────
/**
 * Auto-enhance an image: adjust brightness/contrast, slight sharpen.
 * @param {File|Blob} file
 * @param {{ brightness?: number, contrast?: number, sharpen?: boolean }} opts
 * @returns {Promise<{ dataUrl: string, blob: Blob }>}
 */
export async function enhanceImage(file, opts = {}) {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');

  // Apply brightness & contrast via CSS filter on canvas
  const brightness = opts.brightness ?? 1.1;
  const contrast = opts.contrast ?? 1.15;
  ctx.filter = `brightness(${brightness}) contrast(${contrast})`;
  ctx.drawImage(img, 0, 0);
  ctx.filter = 'none';

  // Optional sharpening via unsharp mask (convolution)
  if (opts.sharpen !== false) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const sharpened = applySharpen(imageData);
    ctx.putImageData(sharpened, 0, 0);
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  return { dataUrl, blob };
}

function applySharpen(imageData) {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data);
  // Sharpening kernel (light)
  const kernel = [0, -0.5, 0, -0.5, 3, -0.5, 0, -0.5, 0];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            val += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        output[(y * width + x) * 4 + c] = val;
      }
    }
  }
  return new ImageData(output, width, height);
}

// ─── Edge Detection / Boundary Overlay (#5) ────────────────────────────────
/**
 * Generate an edge-detection overlay (Sobel) for the image.
 * Returns a semi-transparent canvas data URL showing fruit boundaries.
 * @param {File|Blob} file
 * @returns {Promise<string>} data URL of the edge overlay
 */
export async function detectEdges(file) {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const w = Math.min(img.naturalWidth || img.width, 640);
  const h = Math.round((img.naturalHeight || img.height) * (w / (img.naturalWidth || img.width)));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;

  // Grayscale
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  // Sobel
  const edges = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx =
        -gray[(y - 1) * w + (x - 1)] + gray[(y - 1) * w + (x + 1)] +
        -2 * gray[y * w + (x - 1)] + 2 * gray[y * w + (x + 1)] +
        -gray[(y + 1) * w + (x - 1)] + gray[(y + 1) * w + (x + 1)];
      const gy =
        -gray[(y - 1) * w + (x - 1)] - 2 * gray[(y - 1) * w + x] - gray[(y - 1) * w + (x + 1)] +
        gray[(y + 1) * w + (x - 1)] + 2 * gray[(y + 1) * w + x] + gray[(y + 1) * w + (x + 1)];
      edges[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // Normalize & render edges as colored overlay
  let max = 0;
  for (let i = 0; i < edges.length; i++) if (edges[i] > max) max = edges[i];

  const outData = ctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const val = max > 0 ? edges[i] / max : 0;
    const idx = i * 4;
    if (val > 0.15) {
      // Bright cyan-green edge
      outData.data[idx] = 0;
      outData.data[idx + 1] = Math.round(255 * val);
      outData.data[idx + 2] = Math.round(200 * val);
      outData.data[idx + 3] = Math.round(200 * val);
    } else {
      outData.data[idx + 3] = 0; // transparent
    }
  }

  ctx.putImageData(outData, 0, 0);
  return canvas.toDataURL('image/png');
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    if (source instanceof Blob || source instanceof File) {
      img.src = URL.createObjectURL(source);
    } else {
      img.src = source;
    }
  });
}
