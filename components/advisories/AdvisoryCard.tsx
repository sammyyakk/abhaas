import { Advisory } from "@/lib/types";
import { Panel } from "../ui/Panel";
import { Badge } from "../ui/Badge";
import { formatClock } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { resolveParams } from "@/lib/i18n/resolveParams";

const SEVERITY_TONE = { info: "info", action: "warn", urgent: "danger" } as const;
const KIND_LABEL_KEY: Record<Advisory["kind"], string> = {
  irrigate: "advisories.kindIrrigate",
  vent: "advisories.kindVent",
  shade: "advisories.kindShade",
  mist: "advisories.kindMist",
  scout: "advisories.kindScout",
  maintenance: "advisories.kindMaintenance",
};

export function AdvisoryCard({ advisory }: { advisory: Advisory }) {
  const { t } = useLanguage();
  const headline = t(advisory.headlineKey, resolveParams(t, advisory.zoneId, advisory.headlineParams));
  const rationale = t(advisory.rationaleKey, resolveParams(t, advisory.zoneId, advisory.rationaleParams));

  return (
    <Panel accent={advisory.severity === "urgent" ? "danger" : "ink"} className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge tone={SEVERITY_TONE[advisory.severity]}>{advisory.severity}</Badge>
            <Badge tone="paper">{t(KIND_LABEL_KEY[advisory.kind])}</Badge>
            <span className="text-[10px] font-mono text-ink/40">@ {formatClock(advisory.timestamp)}</span>
          </div>
          <p className="font-bold text-sm md:text-base leading-snug">{headline}</p>
          <p className="text-xs text-ink/60 mt-1 leading-snug">{rationale}</p>
        </div>
        {advisory.quantity ? (
          <div className="shrink-0 border-[3px] border-ink bg-green-1 px-3 py-2 text-center">
            <div className="font-mono text-xl font-bold leading-none">{advisory.quantity.value}</div>
            <div className="text-[10px] font-mono">{advisory.quantity.unit}</div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
