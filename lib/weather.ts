import { Outdoor } from "./types";

// Synthetic diurnal weather driver — stands in for the "weather API" boundary
// condition. dayFraction: 0 = midnight, 0.5 = noon.
export function outdoorAt(dayFraction: number): Outdoor {
  const solarAngle = Math.sin((dayFraction - 0.25) * Math.PI * 2);
  const solarWm2 = Math.max(0, solarAngle) * 780;

  // temp peaks mid-afternoon (~0.6), troughs before dawn (~0.9)
  const tempWave = Math.sin((dayFraction - 0.3) * Math.PI * 2);
  const tempC = 24 + tempWave * 7;

  // humidity anti-correlated with temp, higher overnight
  const rh = clamp(58 - tempWave * 20, 28, 92);

  return { tempC, rh, solarWm2 };
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
