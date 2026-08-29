"use client";

import { ArrowRightLeft, Activity, Droplets, ShieldAlert, Sun } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const DELTAS = [
  { labelKey: "landing.sandboxDeltaCsi", value: "−18", color: "#59931c", icon: Activity },
  { labelKey: "landing.sandboxDeltaWater", value: "−12 L", color: "#59931c", icon: Droplets },
  { labelKey: "landing.sandboxDeltaFungal", valueKey: "landing.sandboxDeltaFungalValue", color: "#ff2d2d", icon: ShieldAlert },
  { labelKey: "landing.sandboxDeltaDli", valueKey: "landing.sandboxDeltaDliValue", color: "#0a0a0a", icon: Sun },
];

export function SandboxTeaserSection() {
  const { t } = useLanguage();
  return (
    <section className="border-b-[3px] border-shell-invert/15 py-20 md:py-28 px-5 md:px-10">
      <div className="mx-auto max-w-5xl">
        <div data-reveal>
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-2 flex items-center gap-2">
            <ArrowRightLeft size={14} /> {t("landing.sandboxTeaserEyebrow")}
          </span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold max-w-2xl">{t("landing.sandboxTeaserHeading")}</h2>
          <p className="mt-4 font-mono text-sm md:text-base text-shell-invert/70 max-w-2xl">{t("landing.sandboxTeaserBody")}</p>
        </div>

        <div
          data-reveal
          className="mt-10 border-[3px] border-shell-invert bg-paper text-ink p-5 md:p-7"
          style={{ boxShadow: "10px 10px 0 var(--shadow-purple)" }}
        >
          <p className="font-mono text-xs md:text-sm text-ink/60 mb-4">{t("landing.sandboxTeaserQuote")}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DELTAS.map((c) => (
              <div key={c.labelKey} className="border-[3px] border-ink bg-paper-dim p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60 flex items-center gap-1.5">
                  <c.icon size={12} /> {t(c.labelKey)}
                </p>
                <p className="font-mono text-xl md:text-2xl font-bold mt-1" style={{ color: c.color }}>
                  {c.valueKey ? t(c.valueKey) : c.value}
                </p>
              </div>
            ))}
          </div>
          <p className="font-mono text-xs md:text-sm text-ink/60 mt-4">{t("landing.sandboxTeaserQuote2")}</p>
        </div>
      </div>
    </section>
  );
}
