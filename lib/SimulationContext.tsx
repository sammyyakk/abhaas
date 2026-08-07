"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode, useCallback } from "react";
import { initHouseState, tick, injectFault as injectFaultFn, clearFault as clearFaultFn, runSandbox as runSandboxFn } from "./simulation";
import type { HouseState, ZoneId, FaultKind, SandboxPolicy, SandboxResult } from "./types";

const TICK_MS = 2000;

interface SimulationApi {
  state: HouseState;
  injectFault: (zoneId: ZoneId, kind: FaultKind) => void;
  clearFault: (zoneId: ZoneId) => void;
  runSandbox: (policy: SandboxPolicy) => SandboxResult;
  paused: boolean;
  setPaused: (p: boolean) => void;
}

const SimulationCtx = createContext<SimulationApi | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HouseState>(() => initHouseState());
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setState((prev) => tick(prev));
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

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
    () => ({ state, injectFault, clearFault, runSandbox, paused, setPaused }),
    [state, injectFault, clearFault, runSandbox, paused]
  );

  return <SimulationCtx.Provider value={value}>{children}</SimulationCtx.Provider>;
}

export function useSimulation() {
  const ctx = useContext(SimulationCtx);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}
