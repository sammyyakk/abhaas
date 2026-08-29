// Real pixel analysis of the captured leaf photo — not a trained ML model
// (no dataset/training budget here), but a genuine heuristic over the actual
// image content, replacing what used to be pure Math.random() over a fixed
// list regardless of what was photographed.
export interface LeafImageFeatures {
  yellowPct: number; // 0-100, chlorotic/yellowing tissue
  brownPct: number; // 0-100, necrotic/scorched tissue
  greenPct: number; // 0-100, healthy green tissue
  purpleRedPct: number; // 0-100, anthocyanin/purple-red tissue
  edgeDensity: number; // 0-1, rough proxy for holes/trails/chew damage texture
  avgBrightness: number; // 0-255
}

const NEUTRAL_FEATURES: LeafImageFeatures = {
  yellowPct: 0,
  brownPct: 0,
  greenPct: 0,
  purpleRedPct: 0,
  edgeDensity: 0,
  avgBrightness: 128,
};

const SAMPLE_SIZE = 64;

function loadImageElement(image: string | Blob): Promise<HTMLImageElement> {
  const src = typeof image === "string" ? image : URL.createObjectURL(image);
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      resolve(img);
      if (typeof image !== "string") URL.revokeObjectURL(src);
    };
    img.onerror = (err) => {
      reject(err);
      if (typeof image !== "string") URL.revokeObjectURL(src);
    };
    img.src = src;
  });
}

export async function analyzeLeafImage(image: string | Blob): Promise<LeafImageFeatures> {
  const img = await loadImageElement(image);
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return NEUTRAL_FEATURES;

  ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const total = SAMPLE_SIZE * SAMPLE_SIZE;
  const gray = new Float32Array(total);

  let yellow = 0;
  let brown = 0;
  let green = 0;
  let purpleRed = 0;
  let brightnessSum = 0;

  for (let i = 0; i < total; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[i] = lum;
    brightnessSum += lum;

    if (r > 130 && g > 120 && b < 110 && r - b > 30) yellow++;
    else if (lum < 110 && r >= g && g >= b && r - b < 70) brown++;
    else if (g > r && g > b && g > 55) green++;
    else if (r > 100 && b > 70 && g < r * 0.75 && g < b + 20) purpleRed++;
  }

  // Mean absolute gradient between adjacent sampled pixels — a rough proxy
  // for mining trails, holes, or ragged chew damage, not a texture model.
  let gradSum = 0;
  let gradCount = 0;
  for (let y = 0; y < SAMPLE_SIZE; y++) {
    for (let x = 0; x < SAMPLE_SIZE; x++) {
      const idx = y * SAMPLE_SIZE + x;
      if (x + 1 < SAMPLE_SIZE) {
        gradSum += Math.abs(gray[idx] - gray[idx + 1]);
        gradCount++;
      }
      if (y + 1 < SAMPLE_SIZE) {
        gradSum += Math.abs(gray[idx] - gray[idx + SAMPLE_SIZE]);
        gradCount++;
      }
    }
  }

  return {
    yellowPct: (yellow / total) * 100,
    brownPct: (brown / total) * 100,
    greenPct: (green / total) * 100,
    purpleRedPct: (purpleRed / total) * 100,
    edgeDensity: gradCount ? gradSum / gradCount / 255 : 0,
    avgBrightness: brightnessSum / total,
  };
}

// Weighted random pick: still probabilistic (a single heuristic shouldn't
// be presented as certain), but genuinely biased by the image's real
// features rather than uniform over the list.
export function weightedPick<T>(items: T[], weights: number[]): { item: T; share: number } {
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return { item: items[i], share: weights[i] / total };
  }
  const last = items.length - 1;
  return { item: items[last], share: weights[last] / total };
}

// TEMP DEMO MODE — deterministic top-weight pick, no randomness. Revert this
// commit once recording is done to restore weightedPick's real probabilistic
// behavior.
export function pickMax<T>(items: T[], weights: number[]): { item: T; share: number } {
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let bestIdx = 0;
  for (let i = 1; i < weights.length; i++) {
    if (weights[i] > weights[bestIdx]) bestIdx = i;
  }
  return { item: items[bestIdx], share: weights[bestIdx] / total };
}
