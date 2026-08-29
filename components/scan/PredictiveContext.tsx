import { Activity } from "lucide-react";
import type { ZoneState } from "@/lib/types";
import { StatTile } from "@/components/ui/StatTile";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Left column of the Dual Diagnostic Card, the predictive-environmental
 * half. Every number here already exists in the engine (pestDD/EDD, DSV,
 * leaf wetness, VPD, csiBreakdown risk %), this panel surfaces it
 * alongside the CV inference rather than computing anything new.
 */
export function PredictiveContext({ zone }: { zone: ZoneState }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-widest text-ink/60 flex items-center gap-2">
        <Activity size={14} /> {t("pest.predictiveContext", { zone: t(`zone.${zone.id}.label`) })}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <StatTile label={t("pest.pestEdd")} value={zone.pestDD.toFixed(0)} unit="DD" />
        <StatTile label={t("pest.diseaseDsv")} value={zone.dsv.toFixed(0)} unit="DSV" />
        <StatTile label={t("pest.leafWetness")} value={zone.leafWetHoursToday.toFixed(1)} unit={t("pest.hoursToday")} />
        <StatTile label={t("pest.leafVpd")} value={zone.vpdLeaf.toFixed(2)} unit="kPa" color="#7d559c" />
        <StatTile
          label={t("pest.pestRisk")}
          value={zone.csiBreakdown.pest.toFixed(0)}
          unit="%"
          color={zone.csiBreakdown.pest > 50 ? "#ff2d2d" : "#59931c"}
        />
        <StatTile
          label={t("pest.diseaseRisk")}
          value={zone.csiBreakdown.disease.toFixed(0)}
          unit="%"
          color={zone.csiBreakdown.disease > 50 ? "#ff2d2d" : "#59931c"}
        />
      </div>
    </div>
  );
}
