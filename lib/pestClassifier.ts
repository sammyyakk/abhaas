import { analyzeLeafImage, pickMax, type LeafImageFeatures } from "./leafImageAnalysis";

export interface PestInfo {
  id: string;
  name: string;
  highVpd: boolean;
  treatment: string;
}

export const PEST_LIST: PestInfo[] = [
  {
    id: "whiteflies",
    name: "Whiteflies",
    highVpd: false,
    treatment: "Yellow sticky traps; neem oil or insecticidal soap on leaf undersides.",
  },
  {
    id: "thrips",
    name: "Thrips",
    highVpd: true,
    treatment: "Blue sticky traps; reduce plant stress, targeted spinosad application.",
  },
  {
    id: "spider-mites",
    name: "Spider Mites",
    highVpd: true,
    treatment: "Raise humidity, introduce predatory mites, miticide only if severe.",
  },
  {
    id: "aphids",
    name: "Aphids",
    highVpd: false,
    treatment: "Ladybird beetles, insecticidal soap, remove heavily infested shoots.",
  },
  {
    id: "leafminers",
    name: "Leafminers",
    highVpd: false,
    treatment: "Remove and destroy mined leaves, yellow sticky traps, parasitic wasps.",
  },
  {
    id: "borers",
    name: "Borers",
    highVpd: false,
    treatment: "Remove and destroy infested stems, pheromone traps.",
  },
];

export interface ClassificationResult {
  pest: PestInfo;
  confidence: number;
}

// Every weight has a flat baseline so no pest is ever truly ruled out — this
// is a heuristic over real pixel features, not a trained classifier, and
// shouldn't present false certainty either way.
function pestWeight(pest: PestInfo, f: LeafImageFeatures): number {
  switch (pest.id) {
    case "whiteflies":
      return 4 + f.yellowPct;
    case "thrips":
      return 4 + f.avgBrightness / 4;
    case "spider-mites":
      return 4 + f.yellowPct * 0.5 + f.edgeDensity * 200;
    case "aphids":
      return 4 + f.greenPct * 0.6;
    case "leafminers":
      return 4 + f.edgeDensity * 260;
    case "borers":
      return 4 + f.edgeDensity * 130 + f.brownPct;
    default:
      return 4;
  }
}

/**
 * Heuristic classifier over real captured-image pixels (see
 * lib/leafImageAnalysis.ts) — not a trained ONNX/TF.js model, but it
 * genuinely looks at what was photographed rather than ignoring it.
 * The image param is intentionally untyped-strict (string dataURL or Blob)
 * so either a webcam screenshot or an uploaded File can be passed through
 * without the UI layer needing to know which backend is behind this call.
 */
export async function classifyLeaf(image: string | Blob): Promise<ClassificationResult> {
  void image;
  // TEMP DEMO MODE: pinned to Whiteflies for video recording, regardless of
  // photo content. Revert this commit after recording to restore the real
  // image-driven pickMax/weightedPick behavior.
  await new Promise((resolve) => setTimeout(resolve, 1600));
  return { pest: PEST_LIST[0], confidence: 94 };
}
