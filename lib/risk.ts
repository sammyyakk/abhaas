import type { ZoneState } from "./types";

export const DSV_THRESHOLD = 15;
export const PEST_THRESHOLD = 150;

export function isZoneFlagged(zone: ZoneState): boolean {
  return zone.dsv >= DSV_THRESHOLD || zone.pestDD >= PEST_THRESHOLD;
}
