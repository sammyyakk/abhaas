"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode, useCallback } from "react";
import { initHouseState, tick, injectFault as injectFaultFn, clearFault as clearFaultFn, runSandbox as runSandboxFn, DT_MINUTES } from "./simulation";
import { outdoorForecast } from "./weather";
import { fetchHourlyForecast, interpolateOutdoor, type HourlyPoint } from "./liveWeather";
import type { HouseState, ZoneId, FaultKind, SandboxPolicy, SandboxResult, Outdoor } from "./types";

const TICK_MS = 2000;
const STORAGE_KEY = "abhaas:houseState";
const ORIGIN_KEY = "abhaas:originMs";

interface SimulationApi {
  state: HouseState;
  injectFault: (zoneId: ZoneId, kind: FaultKind) => void;
  clearFault: (zoneId: ZoneId) => void;
  runSandbox: (policy: SandboxPolicy) => SandboxResult;
  paused: boolean;
  setPaused: (p: boolean) => void;
  liveWeatherActive: boolean;
  // Real hourly forecast when in range, honestly falling back to the
  // synthetic diurnal model outside the fetched window or before it loads.
  getOutdoorForecast: (hoursOffset: number) => Outdoor;
}

const SimulationCtx = createContext<SimulationApi | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HouseState>(() => initHouseState());
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  // Held in state (not refs): a value read during another component's render
  // (via getOutdoorForecast) must come from state/props, not a ref, or React
  // flags it as an unsafe render-time ref read.
  const [liveSeries, setLiveSeries] = useState<HourlyPoint[] | null>(null);
  const [originMs, setOriginMs] = useState<number | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Restore persisted state + real-time origin after mount (not in the
  // useState initializer) so server and first client render stay identical;
  // localStorage is unavailable during SSR, so reading it earlier would
  // cause a hydration mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot restore-after-mount, not a render loop
      if (raw) setState(JSON.parse(raw) as HouseState);
    } catch {
      // corrupt/unavailable storage: keep the fresh initHouseState()
    }
    try {
      const rawOrigin = localStorage.getItem(ORIGIN_KEY);
      const resolved = rawOrigin ? Number(rawOrigin) : Date.now();
      if (!rawOrigin) localStorage.setItem(ORIGIN_KEY, String(resolved));
      setOriginMs(resolved);
    } catch {
      setOriginMs(Date.now());
    }
  }, []);

  // Skip this effect's very first invocation per mount: it would otherwise
  // fire with the pre-restore fresh state and race the restore effect above,
  // overwriting genuinely saved progress with a blank slate before restore
  // has a chance to land (this races doubly in React Strict Mode's dev-only
  // double-mount, which is exactly why a state ref, not a plain boolean, is
  // used — each simulated mount gets its own fresh skip-first-write guard).
  const skippedFirstWriteRef = useRef(false);
  useEffect(() => {
    if (!skippedFirstWriteRef.current) {
      skippedFirstWriteRef.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full/unavailable: persistence is a convenience, not required
    }
  }, [state]);

  // Real forecast, no API key required (Open-Meteo). Fetched once; ticks
  // fall back to the synthetic model on failure or once simulated time runs
  // past the fetched window (the sim advances ~600x real speed).
  useEffect(() => {
    let cancelled = false;
    fetchHourlyForecast()
      .then((series) => {
        if (!cancelled) setLiveSeries(series);
      })
      .catch(() => {
        if (!cancelled) setLiveSeries(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const interpolateAt = useCallback(
    (simMinutesAt: number): Outdoor | null => {
      if (!liveSeries || originMs == null) return null;
      return interpolateOutdoor(liveSeries, new Date(originMs + simMinutesAt * 60000));
    },
    [liveSeries, originMs]
  );

  const getOutdoorForecast = useCallback(
    (hoursOffset: number): Outdoor => {
      const atSimMinutes = state.simMinutes + hoursOffset * 60;
      return interpolateAt(atSimMinutes) ?? outdoorForecast(state.dayFraction, hoursOffset);
    },
    [state.simMinutes, state.dayFraction, interpolateAt]
  );

  // Pure derivation from state, safe to compute during render.
  const liveWeatherActive = interpolateAt(state.simMinutes) != null;

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setState((prev) => {
        const nextSimMinutes = prev.simMinutes + DT_MINUTES;
        const live = interpolateAt(nextSimMinutes);
        return tick(prev, undefined, 0, live ?? undefined);
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [interpolateAt]);

  const injectFault = useCallback((zoneId: ZoneId, kind: FaultKind) => {
    setState((prev) => injectFaultFn(prev, zoneId, kind));
  }, []);

  const clearFault = useCallback((zoneId: ZoneId) => {
    setState((prev) => clearFaultFn(prev, zoneId));
  }, []);

  const runSandbox = useCallback(
    (policy: SandboxPolicy) => {
      return runSandboxFn(state, policy);
    },
    [state]
  );

  const value = useMemo(
    () => ({ state, injectFault, clearFault, runSandbox, paused, setPaused, liveWeatherActive, getOutdoorForecast }),
    [state, injectFault, clearFault, runSandbox, paused, liveWeatherActive, getOutdoorForecast]
  );

  return <SimulationCtx.Provider value={value}>{children}</SimulationCtx.Provider>;
}

export function useSimulation() {
  const ctx = useContext(SimulationCtx);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}
