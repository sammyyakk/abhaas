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

// Real historical mandi prices (data.gov.in / Agmarknet), gated behind an
// API key I can't register on your behalf — this activates the moment
// NEXT_PUBLIC_AGMARKNET_API_KEY is set in .env.local, no code change needed.
// Agmarknet only publishes past arrivals, not a forecast, so this only ever
// supplies the *historical* segment of the price chart; the forward-looking
// projection stays the synthetic model regardless (there's no real source
// for that part), same honesty pattern as everywhere else in the app.
const AGMARKNET_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

export interface RealMandiSeries {
  points: MarketPoint[]; // day: 0 = most recent real record, negative = past
  commodity: string;
  state: string;
}

export async function fetchRealMandiPrices(
  apiKey: string,
  commodity = "Tomato",
  state = "Assam"
): Promise<RealMandiSeries | null> {
  try {
    const params = new URLSearchParams({
      "api-key": apiKey,
      format: "json",
      limit: "100",
      "filters[commodity]": commodity,
      "filters[state]": state,
      sort: "arrival_date",
    });
    const res = await fetch(`https://api.data.gov.in/resource/${AGMARKNET_RESOURCE_ID}?${params.toString()}`);
    if (!res.ok) return null;

    const json = await res.json();
    const records: Array<{ arrival_date: string; modal_price: string }> = json.records ?? [];
    if (!records.length) return null;

    const DAY_MS = 86_400_000;
    const parsed = records
      .map((r) => {
        const [dd, mm, yyyy] = r.arrival_date.split("/").map(Number);
        // modal_price is ₹ per quintal (100 kg); the rest of the app works in ₹/kg
        return { date: new Date(yyyy, mm - 1, dd).getTime(), price: Number(r.modal_price) / 100 };
      })
      .filter((r) => Number.isFinite(r.date) && Number.isFinite(r.price) && r.price > 0)
      .sort((a, b) => a.date - b.date);
    if (!parsed.length) return null;

    const latestDate = parsed[parsed.length - 1].date;
    const points = parsed.map((r) => ({ day: Math.round((r.date - latestDate) / DAY_MS), price: r.price }));
    return { points, commodity, state };
  } catch {
    return null;
  }
}

export type HarvestAction = "delay" | "harvest_now" | "harvest_early" | "on_track";

export interface HarvestAdvisory {
  daysToRipen: number;
  atPeak: boolean;
  priceNow: number;
  priceAtRipeness: number;
  pctChange: number;
  action: HarvestAction;
  // i18n keys into lib/i18n/dictionary.ts's `harvestAdvisory.*`, resolved +
  // interpolated at render time so the same computed advisory renders in
  // whichever language is active.
  headlineKey: string;
  headlineParams?: Record<string, string | number>;
  rationaleKey: string;
  rationaleParams?: Record<string, string | number>;
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
      headlineKey: "harvestAdvisory.harvestNow.headline",
      headlineParams: { gdd: gddSum.toFixed(0) },
      rationaleKey: "harvestAdvisory.harvestNow.rationale",
    };
  }
  if (pctChange > 5) {
    return {
      ...base,
      action: "delay",
      headlineKey: "harvestAdvisory.delay.headline",
      headlineParams: { days: daysToRipen, pct: pctChange.toFixed(0) },
      rationaleKey: "harvestAdvisory.delay.rationale",
      rationaleParams: { days: daysToRipen },
    };
  }
  if (pctChange < -5) {
    return {
      ...base,
      action: "harvest_early",
      headlineKey: "harvestAdvisory.priceEarly.headline",
      headlineParams: { pct: Math.abs(pctChange).toFixed(0) },
      rationaleKey: "harvestAdvisory.priceEarly.rationale",
      rationaleParams: { days: daysToRipen },
    };
  }
  return {
    ...base,
    action: "on_track",
    headlineKey: "harvestAdvisory.onTrack.headline",
    headlineParams: { days: daysToRipen },
    rationaleKey: "harvestAdvisory.onTrack.rationale",
  };
}
