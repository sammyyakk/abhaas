import { HouseState } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Panel } from "../ui/Panel";
import { StatTile } from "../ui/StatTile";
import { Badge } from "../ui/Badge";

export function HouseStatsRow({ state }: { state: HouseState }) {
  const { t } = useLanguage();
  const clock = (() => {
    const total = Math.round(state.dayFraction * 1440);
    const h = Math.floor(total / 60).toString().padStart(2, "0");
    const m = (total % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  })();

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatTile label={t("twin.simClock")} value={clock} sub={t("twin.day", { n: state.dayIndex + 1 })} />
      <StatTile label={t("twin.outdoorTemp")} value={state.outdoor.tempC.toFixed(1)} unit="°C" />
      <StatTile label={t("twin.outdoorRh")} value={state.outdoor.rh.toFixed(0)} unit="%" />
      <StatTile label={t("twin.growthStage")} value={t(`stage.${state.stage}`)} sub={`ΣGDD ${state.gddSum.toFixed(0)}`} />
      <StatTile
        label={t("twin.contradictoryCmds")}
        value={state.contradictoryCommands}
        color="#59931c"
        sub={t("twin.structuralGuarantee")}
      />
    </div>
  );
}

export function SensorGrid({ state }: { state: HouseState }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {state.zones.map((z) => (
        <Panel key={z.id} accent={z.faultActive ? "danger" : "ink"} className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-bold text-sm">
                {t(`zone.${z.id}.label`)} <span className="text-ink/50 font-normal">· {t(`zone.${z.id}.sublabel`)}</span>
              </h4>
            </div>
            {z.faultActive ? (
              <Badge tone="danger">{t("common.fault")}: {z.faultActive.toUpperCase()}</Badge>
            ) : (
              <Badge tone="nominal">{t("common.nominal")}</Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <StatTile label={t("twin.airTemp")} value={z.airTemp.toFixed(1)} unit="°C" />
            <StatTile label={t("twin.rh")} value={z.rh.toFixed(0)} unit="%" />
            <StatTile label={t("twin.soilTheta")} value={z.soilMoisture.toFixed(2)} unit="m³/m³" />
            <StatTile label={t("twin.leafTemp")} value={z.leafTemp.toFixed(1)} unit="°C" />
            <StatTile label={t("twin.vpdLeaf")} value={z.vpdLeaf.toFixed(2)} unit="kPa" color="#7d559c" />
            <StatTile label={t("twin.cwsi")} value={z.cwsi.toFixed(2)} color={z.cwsi > 0.5 ? "#ff2d2d" : "#59931c"} />
            <StatTile label={t("twin.vent")} value={z.ventPct.toFixed(0)} unit="%" />
            <StatTile label={t("twin.shade")} value={z.shadePct.toFixed(0)} unit="%" />
          </div>
          <div className="mt-1.5 flex gap-2 text-[11px] font-mono text-ink/60">
            <span>{t("common.waterToday")}: {z.waterUsedTodayL.toFixed(1)} L</span>
            {z.misting && <span className="text-purple-3 font-bold">· {t("common.misting").toUpperCase()}</span>}
          </div>
        </Panel>
      ))}
    </div>
  );
}
