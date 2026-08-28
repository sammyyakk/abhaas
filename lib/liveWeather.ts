import type { Outdoor } from "./types";
import { clamp, lerp } from "./weather";

// IIT Guwahati campus coordinates — real location the "live" weather is for.
const LAT = 26.1445;
const LON = 91.7362;

export interface HourlyPoint {
  time: number; // epoch ms
  tempC: number;
  rh: number;
  solarWm2: number;
}

// Open-Meteo: free, no API key, CORS-open. Real forecast data, not a mock.
export async function fetchHourlyForecast(): Promise<HourlyPoint[]> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&hourly=temperature_2m,relative_humidity_2m,shortwave_radiation&forecast_days=7&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo request failed: ${res.status}`);
  const json = await res.json();
  const times: string[] = json.hourly.time;
  const temps: number[] = json.hourly.temperature_2m;
  const rhs: number[] = json.hourly.relative_humidity_2m;
  const solar: number[] = json.hourly.shortwave_radiation;
  return times.map((t, i) => ({
    time: new Date(t).getTime(),
    tempC: temps[i],
    rh: rhs[i],
    solarWm2: solar[i],
  }));
}

// Linear interpolation between the two bracketing hourly points. Returns null
// once `at` falls outside the fetched forecast window (or if nothing loaded
// yet) — callers must fall back to the synthetic model rather than guess.
export function interpolateOutdoor(series: HourlyPoint[], at: Date): Outdoor | null {
  const t = at.getTime();
  if (!series.length || t < series[0].time || t > series[series.length - 1].time) return null;

  let i = 0;
  while (i < series.length - 2 && series[i + 1].time < t) i++;
  const a = series[i];
  const b = series[i + 1] ?? a;
  const span = b.time - a.time || 1;
  const frac = clamp((t - a.time) / span, 0, 1);

  return {
    tempC: lerp(a.tempC, b.tempC, frac),
    rh: lerp(a.rh, b.rh, frac),
    solarWm2: lerp(a.solarWm2, b.solarWm2, frac),
  };
}
