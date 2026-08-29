import type { ZoneId } from "../types";

type Translate = (path: string, params?: Record<string, string | number>) => string;

// Advisory/fault/harvest templates carry raw ids (zoneId, a stage id, a pest
// id, ...) rather than pre-translated display text, so the same engine state
// renders correctly in whichever language is active. This resolves those ids
// into the active locale's display strings right before interpolation.
export function resolveParams(
  t: Translate,
  zoneId: ZoneId | null | undefined,
  raw?: Record<string, string | number>
): Record<string, string | number> {
  const params: Record<string, string | number> = { ...raw };
  if (zoneId) params.zone = t(`zone.${zoneId}.label`);
  if (params.stage != null) params.stage = t(`stage.${params.stage}`).toLowerCase();
  if (params.pest != null) params.pest = t(`pestList.${params.pest}.name`);
  if (params.factor != null) params.factor = t(`factor.${params.factor}`);
  if (params.deficiency != null) params.deficiency = t(`nutrientList.${params.deficiency}.name`);
  return params;
}
