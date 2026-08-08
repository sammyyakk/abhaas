import { outdoorForecast } from "./weather";
import { vpd, stageForGdd } from "./simulation";

// Ambient/outdoor VPD forecast — the condition the zone controller has to
// counteract. Not a leaf-VPD prediction: leaf VPD is actively damped by
// venting/misting, which this deliberately does not simulate forward.
export interface VpdForecastPoint {
  hoursFromNow: number;
  tempC: number;
  rh: number;
  solarWm2: number;
  vpdOutdoor: number;
  bandLo: number;
  bandHi: number;
  inBand: boolean;
}

export function vpdForecastSeries(
  dayFraction: number,
  gddSum: number,
  back = 6,
  forward = 18
): VpdForecastPoint[] {
  const stage = stageForGdd(gddSum);
  const points: VpdForecastPoint[] = [];
  for (let h = -back; h <= forward; h++) {
    const { tempC, rh, solarWm2 } = outdoorForecast(dayFraction, h);
    const isDay = solarWm2 > 5;
    const [bandLo, bandHi] = isDay ? stage.day : stage.night;
    const vpdOutdoor = vpd(tempC, rh);
    points.push({
      hoursFromNow: h,
      tempC,
      rh,
      solarWm2,
      vpdOutdoor,
      bandLo,
      bandHi,
      inBand: vpdOutdoor >= bandLo && vpdOutdoor <= bandHi,
    });
  }
  return points;
}

export function findBandCrossing(
  series: VpdForecastPoint[]
): { hoursFromNow: number; direction: "above" | "below" } | null {
  const future = series.filter((p) => p.hoursFromNow >= 0);
  const crossing = future.find((p) => !p.inBand);
  if (!crossing) return null;
  return { hoursFromNow: crossing.hoursFromNow, direction: crossing.vpdOutdoor > crossing.bandHi ? "above" : "below" };
}
