export type ZoneId = "vent" | "centre" | "far";

export interface CsiBreakdown {
  vpd: number;
  cwsi: number;
  soil: number;
  disease: number;
  pest: number;
  dli: number;
}

export interface ZoneState {
  id: ZoneId;
  label: string;
  sublabel: string;
  airTemp: number;
  rh: number;
  soilMoisture: number; // theta, 0-0.5 volumetric
  leafTemp: number;
  vpdAir: number;
  vpdLeaf: number;
  dewPoint: number;
  ks: number; // soil water stress coefficient 0-1
  cwsi: number; // 0-1
  ventPct: number;
  shadePct: number;
  misting: boolean;
  csi: number; // 0-100
  csiBreakdown: CsiBreakdown;
  dsv: number; // cumulative disease severity value
  pestDD: number; // cumulative pest degree-days
  waterUsedTodayL: number;
  ventIntegral: number; // controller integral term
  faultActive: FaultKind | null;
  faultSince: number | null;
  sensorOffset: number; // synthetic fault distortion applied to displayed sensor temp
}

export type FaultKind = "stuck" | "drift" | "actuator";

export interface FaultFlag {
  id: string;
  zoneId: ZoneId;
  kind: FaultKind;
  message: string;
  detail: string;
  timestamp: number;
}

export type AdvisoryKind = "irrigate" | "vent" | "shade" | "mist" | "scout";
export type AdvisorySeverity = "info" | "action" | "urgent";

export interface Advisory {
  id: string;
  zoneId: ZoneId | null;
  kind: AdvisoryKind;
  severity: AdvisorySeverity;
  headline: string;
  rationale: string;
  timestamp: number;
  quantity?: { value: number; unit: string };
}

export interface Outdoor {
  tempC: number;
  rh: number;
  solarWm2: number;
}

export interface WaterLedger {
  budgetL: number;
  usedL: number;
  recoveredL: number;
  allocation: Record<ZoneId, number>;
}

export interface HouseState {
  simMinutes: number; // total simulated minutes elapsed
  dayIndex: number;
  dayFraction: number; // 0-1 within current day
  gddSum: number;
  stage: string;
  outdoor: Outdoor;
  zones: ZoneState[];
  advisories: Advisory[];
  faults: FaultFlag[];
  waterLedger: WaterLedger;
  contradictoryCommands: number;
  ticks: number;
}

export interface SandboxPolicy {
  irrigationDeltaPct: number; // -50..+100
  ventDelayHrs: number; // 0..4 delayed venting
  shadeShiftHrs: number; // -2..2 shade earlier/later
}

export interface SandboxResult {
  baseline: { csi: number; waterL: number; dsv: number; dli: number };
  withChange: { csi: number; waterL: number; dsv: number; dli: number };
  delta: { csi: number; waterL: number; dsv: number; dli: number };
}
