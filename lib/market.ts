// Synthetic mandi (local market) price model — stands in for the Agmarknet
// API integration on the roadmap. Deterministic in `day` so the chart and
// the advisory always agree, and re-renders don't jitter.

const BASE_PRICE = 22; // ₹/kg, tomato baseline
const RIPEN_GDD = 1400; // matches the "Ripening" stage threshold in simulation.ts

export interface MarketPoint {
  day: number;
  price: number;
}

export function priceOnDay(day: number): number {
  const seasonal = 6 * Math.sin(day / 9);
  const trend = 0.12 * day;
  const microCycle = 3 * Math.sin(day / 2.3 + 1.4);
  return Math.max(6, BASE_PRICE + seasonal + trend + microCycle);
}

export function priceSeries(centerDay: number, back = 10, forward = 8): MarketPoint[] {
  const points: MarketPoint[] = [];
  const start = Math.max(0, centerDay - back);
  for (let d = start; d <= centerDay + forward; d++) {
    points.push({ day: d, price: priceOnDay(d) });
  }
  return points;
}

export type HarvestAction = "delay" | "harvest_now" | "harvest_early" | "on_track";

export interface HarvestAdvisory {
  daysToRipen: number;
  atPeak: boolean;
  priceNow: number;
  priceAtRipeness: number;
  pctChange: number;
  action: HarvestAction;
  headline: string;
  rationale: string;
}

export function computeHarvestAdvisory(gddSum: number, dayIndex: number): HarvestAdvisory {
  // Fallback (day 0-1, before enough history exists) matches the weather model's
  // mean outdoor temp (~24°C) minus the GDD base temp (10°C) — not an arbitrary guess.
  const avgDailyGdd = dayIndex > 0 ? gddSum / (dayIndex + 1) : Math.max(gddSum, 14);
  const daysToRipen = Math.max(0, Math.ceil((RIPEN_GDD - gddSum) / Math.max(avgDailyGdd, 1)));
  const atPeak = gddSum >= RIPEN_GDD;
  const priceNow = priceOnDay(dayIndex);
  const priceAtRipeness = priceOnDay(dayIndex + daysToRipen);
  const pctChange = ((priceAtRipeness - priceNow) / priceNow) * 100;

  const base = { daysToRipen, atPeak, priceNow, priceAtRipeness, pctChange };

  if (atPeak) {
    return {
      ...base,
      action: "harvest_now",
      headline: `Harvest now — fruit at peak ripeness (ΣGDD ${gddSum.toFixed(0)})`,
      rationale:
        "GDD accumulation has crossed the ripening threshold. Delaying further risks quality loss regardless of price.",
    };
  }
  if (pctChange > 5) {
    return {
      ...base,
      action: "delay",
      headline: `Delay harvest ${daysToRipen} day${daysToRipen === 1 ? "" : "s"} — mandi price projected +${pctChange.toFixed(0)}%`,
      rationale: `GDD index indicates peak ripeness in ${daysToRipen} days, and local mandi prices are trending up over that window.`,
    };
  }
  if (pctChange < -5) {
    return {
      ...base,
      action: "harvest_early",
      headline: `Price pressure ahead — down ${Math.abs(pctChange).toFixed(0)}% by the time fruit ripens`,
      rationale: `Consider weighing a slightly-under-ripe early harvest against the ${daysToRipen}-day maturity gap.`,
    };
  }
  return {
    ...base,
    action: "on_track",
    headline: `On track — harvest in ~${daysToRipen} days`,
    rationale: "Price is expected to stay roughly flat over the remaining ripening window.",
  };
}
