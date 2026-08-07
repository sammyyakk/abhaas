"use client";

import { useState } from "react";
import { SimulationProvider } from "@/lib/SimulationContext";
import { Hero } from "@/components/Hero";
import { NavTabs, TabId } from "@/components/NavTabs";
import { TwinView } from "@/components/twin/TwinView";
import { AdvisoryFeed } from "@/components/advisories/AdvisoryFeed";
import { SandboxPanel } from "@/components/sandbox/SandboxPanel";
import { WaterLedger } from "@/components/ledger/WaterLedger";
import { RiskBoard } from "@/components/risk/RiskBoard";
import { FaultFeed } from "@/components/health/FaultFeed";

const TAB_CONTENT: Record<TabId, () => React.ReactNode> = {
  twin: () => <TwinView />,
  advisories: () => <AdvisoryFeed />,
  sandbox: () => <SandboxPanel />,
  ledger: () => <WaterLedger />,
  risk: () => <RiskBoard />,
  health: () => <FaultFeed />,
};

export default function Home() {
  const [tab, setTab] = useState<TabId>("twin");

  return (
    <SimulationProvider>
      <div className="flex flex-col flex-1 min-h-screen bg-ink">
        <Hero />
        <NavTabs active={tab} onChange={setTab} />
        <main className="flex-1 mx-auto max-w-6xl w-full px-4 md:px-8 py-6 md:py-8">
          {TAB_CONTENT[tab]()}
        </main>
        <footer className="border-t-[3px] border-green-1 bg-ink px-4 md:px-8 py-4 text-center">
          <p className="text-[11px] font-mono text-paper/40">
            ABHAAS · Team Nirvaah · PS3 Smart Polyhouse Management Interface · Avinya 2026 · Prakriti ×
            Techniche · IIT Guwahati
          </p>
        </footer>
      </div>
    </SimulationProvider>
  );
}
