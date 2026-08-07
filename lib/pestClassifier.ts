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

/**
 * Mock classifier — swap the body for a real ONNX / TF.js model call.
 * The image param is intentionally untyped-strict (string dataURL or Blob)
 * so either a webcam screenshot or an uploaded File can be passed through
 * without the UI layer needing to know which backend is behind this call.
 */
export async function classifyLeaf(image: string | Blob): Promise<ClassificationResult> {
  void image;
  await new Promise((resolve) => setTimeout(resolve, 1600));
  const pest = PEST_LIST[Math.floor(Math.random() * PEST_LIST.length)];
  const confidence = Math.round(72 + Math.random() * 24);
  return { pest, confidence };
}
