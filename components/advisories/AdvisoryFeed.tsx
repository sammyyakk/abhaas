"use client";

import { Bell } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { AdvisoryCard } from "./AdvisoryCard";
import { Panel } from "../ui/Panel";

export function AdvisoryFeed() {
  const { state } = useSimulation();
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell size={22} /> {t("advisories.title")}
        </h2>
        <p className="text-sm text-shell-invert/60 font-mono mt-1">{t("advisories.subtitle")}</p>
      </div>
      {state.advisories.length === 0 ? (
        <Panel className="p-6 text-center">
          <p className="font-mono text-sm text-ink/60">{t("advisories.noActive")}</p>
        </Panel>
      ) : (
        <div className="flex flex-col gap-3">
          {state.advisories.map((a) => (
            <AdvisoryCard key={a.id} advisory={a} />
          ))}
        </div>
      )}
    </div>
  );
}
