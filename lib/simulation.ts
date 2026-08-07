import { outdoorAt, clamp, lerp } from "./weather";
import type {
  ZoneId,
  ZoneState,
  HouseState,
  Advisory,
  AdvisoryKind,
  AdvisorySeverity,
  FaultFlag,
  FaultKind,
  SandboxPolicy,
  SandboxResult,
  Outdoor,
} from "./types";

export const DT_MINUTES = 20; // simulated minutes advanced per engine tick
export const BASE_BUDGET_L = 100;

const STAGES = [
  { name: "Seedling", gdd: 0, day: [0.5, 1.0], night: [0.35, 0.55] },
  { name: "Vegetative", gdd: 250, day: [0.8, 1.1], night: [0.4, 0.6] },
  { name: "Flowering / fruit set", gdd: 600, day: [0.8, 1.2], night: [0.5, 0.7] },
  { name: "Fruit development", gdd: 950, day: [1.0, 1.4], night: [0.6, 0.8] },
  { name: "Ripening", gdd: 1400, day: [1.0, 1.5], night: [0.6, 0.9] },
] as const;

export function stageForGdd(gdd: number) {
  let s: (typeof STAGES)[number] = STAGES[0];
  for (const st of STAGES) if (gdd >= st.gdd) s = st;
  return s;
}

// --- Physiology formulas -------------------------------------------------

export function satVaporPressure(tC: number) {
  return 0.6108 * Math.exp((17.27 * tC) / (tC + 237.3));
}

export function vpd(tC: number, rh: number) {
  return satVaporPressure(tC) * (1 - rh / 100);
}

export function dewPointC(tC: number, rh: number) {
  const alpha = Math.log(Math.max(rh, 1) / 100) + (17.27 * tC) / (tC + 237.3);
  return (237.3 * alpha) / (17.27 - alpha);
}

// --- Zone profiles ---------------------------------------------------------

const ZONE_PROFILES: Record<
  ZoneId,
  { label: string; sublabel: string; tempOffset: number; rhOffset: number; coolingStrength: number }
> = {
  vent: { label: "Zone 1", sublabel: "Vent line", tempOffset: -1.4, rhOffset: -7, coolingStrength: 9.5 },
  centre: { label: "Zone 2", sublabel: "Centre", tempOffset: 0.6, rhOffset: 3, coolingStrength: 7.5 },
  far: { label: "Zone 3", sublabel: "Far end", tempOffset: 2.1, rhOffset: 8, coolingStrength: 6.0 },
};

function initZone(id: ZoneId): ZoneState {
  const p = ZONE_PROFILES[id];
  const airTemp = 24 + p.tempOffset;
  const rh = 62 + p.rhOffset;
  return {
    id,
    label: p.label,
    sublabel: p.sublabel,
    airTemp,
    rh,
    soilMoisture: 0.27,
    leafTemp: airTemp - 2,
    vpdAir: vpd(airTemp, rh),
    vpdLeaf: vpd(airTemp - 2, rh),
    dewPoint: dewPointC(airTemp, rh),
    ks: 1,
    cwsi: 0,
    ventPct: 25,
    shadePct: 0,
    misting: false,
    csi: 10,
    csiBreakdown: { vpd: 0, cwsi: 0, soil: 0, disease: 0, pest: 0, dli: 0 },
    dsv: 0,
    pestDD: 0,
    leafWetHoursToday: 0,
    waterUsedTodayL: 0,
    ventIntegral: 0,
    faultActive: null,
    faultSince: null,
    sensorOffset: 0,
  };
}

export function initHouseState(): HouseState {
  const zones = (["vent", "centre", "far"] as ZoneId[]).map(initZone);
  const dayFraction = 0.35;
  return {
    simMinutes: dayFraction * 1440,
    dayIndex: 0,
    dayFraction,
    gddSum: 0,
    stage: STAGES[0].name,
    outdoor: outdoorAt(dayFraction),
    zones,
    advisories: [],
    faults: [],
    waterLedger: { budgetL: BASE_BUDGET_L, usedL: 0, recoveredL: 0, allocation: { vent: 0, centre: 0, far: 0 } },
    contradictoryCommands: 0,
    interventionsToday: 0,
    ticks: 0,
  };
}

// --- Core per-zone step -----------------------------------------------------

interface StepCtx {
  irrigMultiplier: number;
  ventSuppressed: boolean;
  shadeShiftHrs: number;
  waterRemainingL: number; // mutated externally via return
}

const THETA_FC = 0.35;
const THETA_WP = 0.15;
const RAW_THRESHOLD = 0.27;

function stepZone(
  zone: ZoneState,
  outdoor: Outdoor,
  shiftedOutdoor: Outdoor,
  band: readonly [number, number],
  dtMinutes: number,
  ctx: StepCtx
): { zone: ZoneState; litersUsed: number; contradiction: boolean } {
  const p = ZONE_PROFILES[zone.id];
  const dtFrac = dtMinutes / 60; // hours per tick, used as a lerp rate

  // --- thermal / moisture drift toward a target driven by outdoor + actuators
  const solarGain = (shiftedOutdoor.solarWm2 / 780) * 5.0;
  const shadeAttenuation = 1 - (zone.shadePct / 100) * 0.75;
  const ventCooling = (zone.ventPct / 100) * p.coolingStrength;
  const targetTemp = outdoor.tempC + p.tempOffset + solarGain * shadeAttenuation - ventCooling;
  const airTemp = lerp(zone.airTemp, targetTemp, clamp(dtFrac * 0.9, 0, 0.9));

  const mistBoost = zone.misting ? 22 : 0;
  const ventDrying = (zone.ventPct / 100) * 16;
  const targetRh = clamp(outdoor.rh + p.rhOffset + mistBoost - ventDrying, 22, 96);
  const rh = clamp(lerp(zone.rh, targetRh, clamp(dtFrac * 0.9, 0, 0.9)), 22, 96);

  const dewPoint = dewPointC(airTemp, rh);
  const vpdAir = vpd(airTemp, rh);

  // soil water balance
  const stomatalOpen = clamp(1 - Math.max(0, vpdAir - 1.5) / 1.3, 0.15, 1);
  const transpirationRate = 0.006 * zone.ks * (0.4 + vpdAir) * stomatalOpen;
  let soilMoisture = clamp(zone.soilMoisture - transpirationRate * dtFrac, THETA_WP, THETA_FC);

  let litersUsed = 0;
  const deficit = Math.max(0, RAW_THRESHOLD - soilMoisture);
  const actuatorFaulted = zone.faultActive === "actuator";
  if (deficit > 0.005 && ctx.waterRemainingL > 0.2 && !actuatorFaulted) {
    const wanted = clamp(deficit * 30, 0, 3) * ctx.irrigMultiplier;
    litersUsed = Math.min(wanted, ctx.waterRemainingL);
    soilMoisture = clamp(soilMoisture + litersUsed * 0.006, THETA_WP, THETA_FC);
  }

  const ks =
    soilMoisture >= RAW_THRESHOLD
      ? 1
      : clamp((soilMoisture - THETA_WP) / (RAW_THRESHOLD - THETA_WP), 0.05, 1);

  const maxLeafOffset = 4;
  const deltaT = maxLeafOffset * ks * stomatalOpen;
  const leafTemp = airTemp - deltaT;
  const ea = satVaporPressure(airTemp) * (rh / 100);
  const vpdLeaf = satVaporPressure(leafTemp) - ea;
  const cwsi = clamp(0.6 * (1 - ks) + 0.4 * clamp((vpdLeaf - band[1]) / 1.0, 0, 1), 0, 1);

  // --- unified VPD controller (single control variable => no contradictions)
  const targetVpd = (band[0] + band[1]) / 2;
  const error = targetVpd - vpdLeaf; // >0: too low (humid) -> vent/dehumidify. <0: too high -> mist/shade
  const deadband = 0.06;
  const Kp = 42;
  const Ki = 3;
  let ventIntegral = zone.ventIntegral;
  if (Math.abs(error) < deadband * 3) ventIntegral = clamp(ventIntegral + error * dtFrac, -1.2, 1.2);
  else ventIntegral *= 0.9; // anti-windup: bleed off when saturated

  let ventPct = zone.ventPct;
  let shadePct = zone.shadePct;
  let misting = false;

  if (error > deadband) {
    const raw = Kp * error + Ki * ventIntegral;
    ventPct = clamp(30 + raw, 0, 100);
    shadePct = clamp(zone.shadePct * 0.7, 0, 100);
  } else if (error < -deadband) {
    const raw = Kp * -error + Ki * -ventIntegral;
    ventPct = clamp(18 - raw * 0.3, 0, 100);
    shadePct = clamp(15 + Math.abs(error) * 32 + (shiftedOutdoor.solarWm2 / 780) * 12, 0, 100);
    misting = error < -0.18;
  } else {
    ventPct = lerp(zone.ventPct, 28, 0.3);
    shadePct = lerp(zone.shadePct, 0, 0.3);
  }

  if (ctx.ventSuppressed) ventPct *= 0.35;

  // structural guarantee: never both mist AND vent-to-dehumidify at once
  const contradiction = misting && ventPct > 55;

  // --- risk accumulators
  const leafWet = rh > 90 || airTemp <= dewPoint + 1.2;
  const dsvRate = leafWet ? 0.22 * (airTemp > 15 && airTemp < 30 ? 1 : 0.5) : 0;
  const dsv = zone.dsv + dsvRate * dtFrac;
  const leafWetHoursToday = zone.leafWetHoursToday + (leafWet ? dtMinutes / 60 : 0);

  // high leaf VPD accelerates pest life-cycle (spider mites in particular) —
  // the twin's own VPD state doubling as a pest-risk multiplier, not a new sensor.
  const pestBase = 12;
  const vpdPestMultiplier = vpdLeaf > 1.2 ? 1.4 : 1;
  const pestDD = zone.pestDD + Math.max(0, outdoor.tempC - pestBase) * (dtMinutes / 1440) * 1.3 * vpdPestMultiplier;

  // --- crop stress index (weights fixed heuristic, breakdown always shown)
  const vpdDevNorm = clamp(Math.abs(vpdLeaf - targetVpd) / 1.0, 0, 1) * 100;
  const cwsiNorm = cwsi * 100;
  const soilDepletionNorm = clamp((RAW_THRESHOLD - soilMoisture) / (RAW_THRESHOLD - THETA_WP), 0, 1) * 100;
  const diseaseNorm = clamp(dsv / 20, 0, 1) * 100;
  const pestNorm = clamp(pestDD / 150, 0, 1) * 100;
  const dliNorm = clamp((780 - shiftedOutdoor.solarWm2) / 780, 0, 1) * 40;

  const csi = clamp(
    0.3 * vpdDevNorm + 0.2 * cwsiNorm + 0.2 * soilDepletionNorm + 0.15 * diseaseNorm + 0.1 * pestNorm + 0.05 * dliNorm,
    0,
    100
  );

  // --- fault distortion of *displayed* sensor values (twin state above stays true)
  let displayAirTemp = airTemp;
  let displayRh = rh;
  let displaySoilMoisture = soilMoisture;
  let sensorOffset = zone.sensorOffset;

  if (zone.faultActive === "stuck") {
    displayAirTemp = zone.airTemp; // frozen at last displayed value
    displayRh = zone.rh;
    displaySoilMoisture = zone.soilMoisture;
  } else if (zone.faultActive === "drift") {
    sensorOffset = zone.sensorOffset + 0.06;
    displayAirTemp = airTemp + sensorOffset;
  }

  const newZone: ZoneState = {
    ...zone,
    airTemp: displayAirTemp,
    rh: displayRh,
    soilMoisture: displaySoilMoisture,
    leafTemp,
    vpdAir,
    vpdLeaf,
    dewPoint,
    ks,
    cwsi,
    ventPct,
    shadePct,
    misting,
    csi,
    csiBreakdown: {
      vpd: vpdDevNorm,
      cwsi: cwsiNorm,
      soil: soilDepletionNorm,
      disease: diseaseNorm,
      pest: pestNorm,
      dli: dliNorm,
    },
    dsv,
    pestDD,
    leafWetHoursToday,
    waterUsedTodayL: zone.waterUsedTodayL + litersUsed,
    ventIntegral,
    sensorOffset,
  };

  return { zone: newZone, litersUsed, contradiction };
}

// --- Advisories -------------------------------------------------------------

function clockLabel(dayFraction: number, addMinutes = 0) {
  const total = Math.round(dayFraction * 1440 + addMinutes) % 1440;
  const h = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

let advisoryCounter = 0;
let faultCounter = 0;

function makeAdvisory(
  zoneId: ZoneId | null,
  kind: AdvisoryKind,
  severity: AdvisorySeverity,
  headline: string,
  rationale: string,
  timestamp: number,
  quantity?: { value: number; unit: string }
): Advisory {
  advisoryCounter += 1;
  return { id: `adv-${advisoryCounter}`, zoneId, kind, severity, headline, rationale, timestamp, quantity };
}

function recentlyAdvised(advisories: Advisory[], zoneId: ZoneId, kind: AdvisoryKind, now: number, cooldown: number) {
  return advisories.some((a) => a.zoneId === zoneId && a.kind === kind && now - a.timestamp < cooldown);
}

// --- Top-level tick -----------------------------------------------------------

export function tick(state: HouseState, policy?: SandboxPolicy, elapsedMinutes = 0): HouseState {
  const simMinutes = state.simMinutes + DT_MINUTES;
  const dayFraction = (simMinutes % 1440) / 1440;
  const dayIndex = Math.floor(simMinutes / 1440);
  const outdoor = outdoorAt(dayFraction);

  const ventSuppressed = !!policy && elapsedMinutes < policy.ventDelayHrs * 60;
  const shadeShiftHrs = policy?.shadeShiftHrs ?? 0;
  const shiftedFraction = ((dayFraction * 24 + shadeShiftHrs) / 24 + 1) % 1;
  const shiftedOutdoor = outdoorAt(shiftedFraction);
  const irrigMultiplier = 1 + (policy?.irrigationDeltaPct ?? 0) / 100;

  const gddSum = state.gddSum + Math.max(0, outdoor.tempC - 10) * (DT_MINUTES / 1440);
  const stage = stageForGdd(gddSum);
  const isDay = outdoor.solarWm2 > 5;
  const band = (isDay ? stage.day : stage.night) as unknown as readonly [number, number];

  let waterRemainingL = Math.max(0, state.waterLedger.budgetL - state.waterLedger.usedL);
  const allocation: Record<ZoneId, number> = { ...state.waterLedger.allocation };
  let usedThisTick = 0;
  let contradictoryCommands = state.contradictoryCommands;

  const newAdvisories: Advisory[] = [];
  const newFaults: FaultFlag[] = [];

  const zones = state.zones.map((zone) => {
    const ctx: StepCtx = { irrigMultiplier, ventSuppressed, shadeShiftHrs, waterRemainingL };
    const { zone: stepped, litersUsed, contradiction } = stepZone(zone, outdoor, shiftedOutdoor, band, DT_MINUTES, ctx);
    waterRemainingL = Math.max(0, waterRemainingL - litersUsed);
    usedThisTick += litersUsed;
    allocation[zone.id] = (allocation[zone.id] ?? 0) + litersUsed;
    if (contradiction) contradictoryCommands += 1;

    // --- advisory generation (cooldown-gated so the feed doesn't spam every tick)
    const cooldown = 180; // sim-minutes
    if (
      RAW_THRESHOLD - stepped.soilMoisture > 0.02 &&
      !recentlyAdvised(state.advisories, zone.id, "irrigate", simMinutes, cooldown)
    ) {
      const liters = Math.round((RAW_THRESHOLD - stepped.soilMoisture) * 250 * 10) / 10;
      newAdvisories.push(
        makeAdvisory(
          zone.id,
          "irrigate",
          "action",
          `${stepped.label}: irrigate ${liters} L before ${clockLabel(dayFraction, 120)}`,
          `Soil moisture depleted below the readily-available-water threshold; ${liters} L closes the deficit.`,
          simMinutes,
          { value: liters, unit: "L" }
        )
      );
    }
    const err = (band[0] + band[1]) / 2 - stepped.vpdLeaf;
    if (err > 0.2 && !recentlyAdvised(state.advisories, zone.id, "vent", simMinutes, cooldown)) {
      newAdvisories.push(
        makeAdvisory(
          zone.id,
          "vent",
          "info",
          `${stepped.label}: increase ventilation, VPD low (fungal risk)`,
          `Leaf VPD ${stepped.vpdLeaf.toFixed(2)} kPa is below the ${stage.name.toLowerCase()} band; low transpiration raises fungal risk.`,
          simMinutes
        )
      );
    } else if (err < -0.2 && !recentlyAdvised(state.advisories, zone.id, "mist", simMinutes, cooldown)) {
      newAdvisories.push(
        makeAdvisory(
          zone.id,
          "mist",
          "action",
          `${stepped.label}: mist 4 min, VPD high despite soil moisture`,
          `Leaf VPD ${stepped.vpdLeaf.toFixed(2)} kPa exceeds band; stomatal closure risk even though soil water is adequate.`,
          simMinutes
        )
      );
    }
    if (stepped.dsv >= 15 && !recentlyAdvised(state.advisories, zone.id, "scout", simMinutes, 720)) {
      newAdvisories.push(
        makeAdvisory(
          zone.id,
          "scout",
          "urgent",
          `${stepped.label}: scout for disease, DSV ${stepped.dsv.toFixed(0)} crossed threshold`,
          `Cumulative Disease Severity Value crossed 15; flagged for scouting, not automatic spraying.`,
          simMinutes
        )
      );
    }

    // --- fault detection: residual grows the longer a fault sits untouched
    if (stepped.faultActive && stepped.faultSince != null) {
      const dwell = simMinutes - stepped.faultSince;
      const already = state.faults.some((f) => f.zoneId === zone.id && f.kind === stepped.faultActive);
      if (dwell >= DT_MINUTES && !already) {
        faultCounter += 1;
        const kind = stepped.faultActive;
        const messages: Record<FaultKind, { message: string; detail: string }> = {
          stuck: {
            message: `${stepped.label}: sensor stuck`,
            detail: "Rolling variance ≈ 0 while the twin predicts change. Classified as a sensor fault, not an agronomic event.",
          },
          drift: {
            message: `${stepped.label}: sensor drifting`,
            detail: "Residual (sensor − twin prediction) has exceeded ±3σ and is still growing.",
          },
          actuator: {
            message: `${stepped.label}: irrigation actuator not responding`,
            detail: "Irrigation was commanded but soil moisture is not rising as the twin predicts. Possible blocked line or valve fault.",
          },
        };
        newFaults.push({ id: `fault-${faultCounter}`, zoneId: zone.id, kind, ...messages[kind], timestamp: simMinutes });
      }
    }

    return stepped;
  });

  // --- day rollover: reset usage, credit passive condensation to tomorrow
  let waterLedger = state.waterLedger;
  if (dayIndex !== state.dayIndex) {
    const avgDew = zones.reduce((s, z) => s + z.dewPoint, 0) / zones.length;
    const recoveredL = clamp(2.5 + (avgDew - 10) * 0.35, 0, 7);
    waterLedger = {
      budgetL: BASE_BUDGET_L + recoveredL,
      usedL: 0,
      recoveredL,
      allocation: { vent: 0, centre: 0, far: 0 },
    };
    zones.forEach((z) => {
      z.waterUsedTodayL = 0;
      z.leafWetHoursToday = 0;
    });

    if (dayIndex > 0 && dayIndex % 5 === 0) {
      newAdvisories.push(
        makeAdvisory(
          null,
          "maintenance",
          "info",
          "Check internal gutter slope, passive recovery due for inspection",
          "Algae growth or a blocked gutter silently kills passive condensation recovery. Five-day inspection cadence.",
          simMinutes
        )
      );
    }
  } else {
    waterLedger = { ...waterLedger, usedL: waterLedger.usedL + usedThisTick, allocation };
  }

  const advisories = [...newAdvisories, ...state.advisories].slice(0, 10);
  const faults = [...newFaults, ...state.faults].slice(0, 12);
  const interventionsToday =
    dayIndex !== state.dayIndex ? newAdvisories.length : state.interventionsToday + newAdvisories.length;

  return {
    simMinutes,
    dayIndex,
    dayFraction,
    gddSum,
    stage: stage.name,
    outdoor,
    zones,
    advisories,
    faults,
    waterLedger,
    contradictoryCommands,
    interventionsToday,
    ticks: state.ticks + 1,
  };
}

// --- Fault injection / clearing ------------------------------------------------

export function injectFault(state: HouseState, zoneId: ZoneId, kind: FaultKind): HouseState {
  return {
    ...state,
    zones: state.zones.map((z) =>
      z.id === zoneId ? { ...z, faultActive: kind, faultSince: state.simMinutes, sensorOffset: 0 } : z
    ),
  };
}

export function clearFault(state: HouseState, zoneId: ZoneId): HouseState {
  return {
    ...state,
    zones: state.zones.map((z) =>
      z.id === zoneId ? { ...z, faultActive: null, faultSince: null, sensorOffset: 0 } : z
    ),
    faults: state.faults.filter((f) => f.zoneId !== zoneId),
  };
}

// --- Sandbox: fork current state, fast-forward under a policy -------------------

export function runSandbox(state: HouseState, policy: SandboxPolicy, hoursForward = 24): SandboxResult {
  const steps = Math.round((hoursForward * 60) / DT_MINUTES);

  function fastForward(withPolicy: SandboxPolicy | undefined) {
    let s: HouseState = { ...state, advisories: [], faults: [] };
    let csiSum = 0;
    const waterStart = s.waterLedger.usedL;
    let maxDsv = 0;
    let dliSum = 0;
    for (let i = 0; i < steps; i++) {
      s = tick(s, withPolicy, i * DT_MINUTES);
      csiSum += s.zones.reduce((sum, z) => sum + z.csi, 0) / s.zones.length;
      maxDsv = Math.max(maxDsv, ...s.zones.map((z) => z.dsv));
      dliSum += s.outdoor.solarWm2 * 2.02 * DT_MINUTES * 60 / 1_000_000;
    }
    const waterL = s.waterLedger.usedL - waterStart + s.zones.reduce((sum, z) => sum + z.waterUsedTodayL, 0);
    return { csi: csiSum / steps, waterL: Math.max(0, waterL), dsv: maxDsv, dli: dliSum };
  }

  const baseline = fastForward(undefined);
  const withChange = fastForward(policy);

  return {
    baseline,
    withChange,
    delta: {
      csi: withChange.csi - baseline.csi,
      waterL: withChange.waterL - baseline.waterL,
      dsv: withChange.dsv - baseline.dsv,
      dli: withChange.dli - baseline.dli,
    },
  };
}
