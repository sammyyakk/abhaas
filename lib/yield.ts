import type { ZoneState } from "./types";

// Modelled Doorenbos-Kassam / Mitscherlich-style yield-response curve —
// concave, diminishing returns. Parameters are a defensible scaffold (not a
// fitted model); every number derived from this is labelled "modelled" in
// the UI, same honesty pattern as the condensation and harvest estimates.
const Y_MAX = 4.2; // kg/plant proxy ceiling
const K = 0.12; // response steepness

export function yieldResponse(waterL: number): number {
  return Y_MAX * (1 - Math.exp(-K * Math.max(0, waterL)));
}

export function marginalYield(waterL: number): number {
  return Y_MAX * K * Math.exp(-K * Math.max(0, waterL));
}

export interface YieldEfficiency {
  waterProductivityGPerL: number;
  projectedYieldGainPct: number;
  bestMarginalZoneId: string | null;
}

/**
 * Water productivity (g proxy-yield per liter) and the projected gain of
 * the engine's actual per-zone allocation versus a naive equal split —
 * this is the same "equal marginal return beats equal split" argument the
 * water optimizer already makes, just quantified.
 */
export function computeYieldEfficiency(zones: ZoneState[]): YieldEfficiency {
  const totalWaterL = zones.reduce((s, z) => s + z.waterUsedTodayL, 0);
  const totalYield = zones.reduce((s, z) => s + yieldResponse(z.waterUsedTodayL), 0);
  const waterProductivityGPerL = totalWaterL > 0 ? (totalYield * 1000) / totalWaterL : 0;

  const equalShare = totalWaterL / Math.max(1, zones.length);
  const naiveYield = zones.reduce((s) => s + yieldResponse(equalShare), 0);
  const projectedYieldGainPct = naiveYield > 0 ? ((totalYield - naiveYield) / naiveYield) * 100 : 0;

  let bestMarginalZoneId: string | null = null;
  let bestMarginal = -Infinity;
  for (const z of zones) {
    const m = marginalYield(z.waterUsedTodayL);
    if (m > bestMarginal) {
      bestMarginal = m;
      bestMarginalZoneId = z.id;
    }
  }

  return { waterProductivityGPerL, projectedYieldGainPct, bestMarginalZoneId };
}
