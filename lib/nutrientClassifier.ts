import type { ZoneState, CsiBreakdown } from "./types";

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

/**
 * Mock classifier — swap for a real leaf-image model later. Same
 * fire-and-forget contract as classifyLeaf() in pestClassifier.ts.
 */
export async function classifyNutrient(image: string | Blob): Promise<NutrientResult> {
  void image;
  await new Promise((resolve) => setTimeout(resolve, 1600));
  const deficiency = NUTRIENT_LIST[Math.floor(Math.random() * NUTRIENT_LIST.length)];
  const confidence = Math.round(68 + Math.random() * 26);
  const yieldRecoveryPct = Math.round(6 + (confidence / 100) * 14);
  const waterSavingsPct = deficiency.id === "calcium" ? Math.round(8 + Math.random() * 10) : Math.round(Math.random() * 4);
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
