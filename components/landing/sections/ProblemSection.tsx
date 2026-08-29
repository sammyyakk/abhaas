"use client";

import { XCircle, Link2, Sprout, Map, CloudSun } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const GENERIC_KEYS = ["landing.genericLine1", "landing.genericLine2", "landing.genericLine3", "landing.genericLine4"];

const ACTUAL = [
  { labelKey: "landing.problemCoupledLabel", icon: Link2, bodyKey: "landing.problemCoupledBody" },
  { labelKey: "landing.problemLivingLabel", icon: Sprout, bodyKey: "landing.problemLivingBody" },
  { labelKey: "landing.problemNonUniformLabel", icon: Map, bodyKey: "landing.problemNonUniformBody" },
  { labelKey: "landing.problemAnticipatableLabel", icon: CloudSun, bodyKey: "landing.problemAnticipatableBody" },
];

export function ProblemSection() {
  const { t } = useLanguage();
  return (
    <section id="problem" className="border-b-[3px] border-shell-invert/15 py-20 md:py-28 px-5 md:px-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-5xl font-bold max-w-3xl" data-reveal>
          {t("landing.problemHeading")}
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div data-reveal>
            <span className="text-[11px] font-bold uppercase tracking-widest text-danger flex items-center gap-2">
              <XCircle size={14} /> {t("landing.problemGenericLabel")}
            </span>
            <div className="mt-3 border-[3px] border-shell-invert bg-paper text-ink p-6" style={{ boxShadow: "8px 8px 0 var(--shadow-danger)" }}>
              {GENERIC_KEYS.map((key) => (
                <p key={key} className="font-mono text-sm md:text-base leading-relaxed">
                  {t(key)}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-green-1" data-reveal>
              {t("landing.problemActualLabel")}
            </span>
            {ACTUAL.map((item) => (
              <div
                key={item.labelKey}
                data-reveal
                className="border-[3px] border-shell-invert bg-paper text-ink p-4 flex gap-3"
                style={{ boxShadow: "6px 6px 0 var(--shadow-green)" }}
              >
                <item.icon size={22} className="text-green-1 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide">{t(item.labelKey)}</p>
                  <p className="text-xs md:text-sm text-ink/70 mt-1">{t(item.bodyKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
