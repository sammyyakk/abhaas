import { useLanguage } from "@/lib/i18n/LanguageContext";

function fmt(n: number, digits = 1) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}`;
}

export function DeltaCard({
  label,
  delta,
  unit,
  lowerIsBetter = true,
  digits = 1,
}: {
  label: string;
  delta: number;
  unit: string;
  lowerIsBetter?: boolean;
  digits?: number;
}) {
  const { t } = useLanguage();
  const better = lowerIsBetter ? delta < -0.01 : delta > 0.01;
  const worse = lowerIsBetter ? delta > 0.01 : delta < -0.01;
  const color = better ? "#59931c" : worse ? "#ff2d2d" : "#0a0a0a";
  const arrow = delta > 0.01 ? "↑" : delta < -0.01 ? "↓" : "→";

  return (
    <div className="border-[3px] border-ink bg-paper-dim p-4 flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold" style={{ color }}>
          {arrow} {fmt(delta, digits)}
        </span>
        <span className="text-xs font-mono text-ink/50">{unit}</span>
      </div>
      <span className="text-[10px] font-mono uppercase" style={{ color }}>
        {better ? t("common.better") : worse ? t("common.worse") : t("common.unchanged")}
      </span>
    </div>
  );
}
