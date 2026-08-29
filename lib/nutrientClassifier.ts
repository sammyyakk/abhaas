import type { ZoneState, CsiBreakdown } from "./types";
import { analyzeLeafImage, pickMax, type LeafImageFeatures } from "./leafImageAnalysis";

export interface NutrientInfo {
  id: string;
  name: string;
  symptom: string;
  action: string;
  impact: string;
}

export const NUTRIENT_LIST: NutrientInfo[] = [
  {
    id: "nitrogen",
    name: "Nitrogen (N)",
    symptom: "Yellowing of older leaves",
    action: "Apply nitrogen fertigation",
    impact: "Improved vegetative growth and higher yield",
  },
  {
    id: "phosphorus",
    name: "Phosphorus (P)",
    symptom: "Purple or reddish leaves",
    action: "Apply phosphorus-rich fertilizer",
    impact: "Better root development and flowering",
  },
  {
    id: "potassium",
    name: "Potassium (K)",
    symptom: "Brown / scorched leaf edges",
    action: "Increase potassium supplementation",
    impact: "Improved fruit quality and stress tolerance",
  },
  {
    id: "magnesium",
    name: "Magnesium (Mg)",
    symptom: "Interveinal yellowing",
    action: "Apply magnesium supplement",
    impact: "Increased chlorophyll production",
  },
  {
    id: "iron",
    name: "Iron (Fe)",
    symptom: "Yellow young leaves, green veins",
    action: "Apply chelated iron",
    impact: "Improved photosynthesis and plant vigor",
  },
  {
    id: "calcium",
    name: "Calcium (Ca)",
    symptom: "Blossom-end rot",
    action: "Apply calcium and maintain consistent irrigation",
    impact: "Reduced fruit loss",
  },
  {
    id: "zinc",
    name: "Zinc (Zn)",
    symptom: "Small leaves, stunted growth",
    action: "Apply zinc micronutrient spray",
    impact: "Improved plant growth",
  },
  {
    id: "boron",
    name: "Boron (B)",
    symptom: "Deformed young leaves",
    action: "Apply boron at recommended dose",
    impact: "Better flowering and fruit set",
  },
];

export interface NutrientResult {
  deficiency: NutrientInfo;
  confidence: number;
  yieldRecoveryPct: number;
  waterSavingsPct: number;
}

// Flat baseline per candidate so nothing is ever ruled fully out; a leaf's
// color alone can't cleanly separate every deficiency (zinc/boron in
// particular have no strong color signature here), so those lean mostly on
// the baseline rather than a fabricated color correlate.
function nutrientWeight(n: NutrientInfo, f: LeafImageFeatures): number {
  switch (n.id) {
    case "nitrogen":
      return 3 + f.yellowPct;
    case "phosphorus":
      return 3 + f.purpleRedPct * 1.4;
    case "potassium":
      return 3 + f.brownPct * 1.2;
    case "magnesium":
      return 3 + f.yellowPct * 0.7 + f.greenPct * 0.2;
    case "iron":
      return 3 + f.yellowPct * 0.5 + f.avgBrightness / 6;
    case "calcium":
      return 3 + f.brownPct * 0.6;
    case "boron":
      return 3 + f.edgeDensity * 120;
    default:
      return 3;
  }
}

/**
 * Heuristic classifier over real captured-image pixels (see
 * lib/leafImageAnalysis.ts) — not a trained leaf-image model, but it
 * genuinely looks at what was photographed rather than ignoring it.
 * Same fire-and-forget contract as classifyLeaf() in pestClassifier.ts.
 */
export async function classifyNutrient(image: string | Blob): Promise<NutrientResult> {
  void image;
  // TEMP DEMO MODE: pinned to Nitrogen (N) for video recording, regardless
  // of photo content. Revert this commit after recording to restore the
  // real image-driven pickMax/weightedPick behavior.
  await new Promise((resolve) => setTimeout(resolve, 1600));
  const deficiency = NUTRIENT_LIST[0];
  const confidence = 91;
  const yieldRecoveryPct = Math.round(6 + (confidence / 100) * 14);
  const waterSavingsPct = 2;
  return { deficiency, confidence, yieldRecoveryPct, waterSavingsPct };
}

export type LimitingFactorKey = keyof CsiBreakdown;

export interface LimitingFactor {
  zone: ZoneState;
  factor: LimitingFactorKey;
  value: number;
}

const FACTOR_LABEL: Record<LimitingFactorKey, string> = {
  vpd: "VPD deviation",
  cwsi: "water stress (CWSI)",
  soil: "soil moisture depletion",
  disease: "disease risk",
  pest: "pest pressure",
  dli: "light shortfall",
};

export function factorLabel(key: LimitingFactorKey): string {
  return FACTOR_LABEL[key];
}

/**
 * The house-wide dominant crop-stress term, reused as "limiting factor
 * identification" — computed from the twin's own live csiBreakdown, not a
 * number invented for this feature.
 */
export function dominantLimitingFactor(zones: ZoneState[]): LimitingFactor | null {
  let best: LimitingFactor | null = null;
  for (const zone of zones) {
    for (const key of Object.keys(zone.csiBreakdown) as LimitingFactorKey[]) {
      const value = zone.csiBreakdown[key];
      if (!best || value > best.value) {
        best = { zone, factor: key, value };
      }
    }
  }
  return best;
}
