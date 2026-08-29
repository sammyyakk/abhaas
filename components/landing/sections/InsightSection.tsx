"use client";

import { Thermometer, Droplets, X, ArrowDown, Sigma, Wind, CloudDrizzle, GitBranch, Lightbulb } from "lucide-react";
import { Latex } from "@/components/ui/Latex";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function InsightSection() {
  const { t } = useLanguage();
  return (
    <section id="insight-pin" className="relative min-h-screen bg-ink text-paper overflow-hidden border-b-[6px] border-purple-1">
      <div className="absolute top-20 md:top-24 left-0 right-0 text-center px-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-purple-2 inline-flex items-center gap-1.5">
          <Lightbulb size={12} /> {t("landing.insightEyebrow")}
        </span>
        <h2 className="mt-2 text-3xl md:text-5xl font-bold px-6">{t("landing.insightHeading")}</h2>
      </div>

      <div className="relative h-screen flex items-center justify-center px-5 md:px-10">
        {/* Step 1 */}
        <div data-step className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-6" style={{ opacity: 0 }}>
          <p className="font-mono text-base md:text-lg text-paper/60 uppercase tracking-widest">{t("landing.insightStep1")}</p>
          <div className="flex items-center gap-6 md:gap-12 flex-wrap justify-center">
            <div className="border-[3px] border-paper bg-ink px-8 py-10 md:px-10 md:py-12 text-center w-52 md:w-60">
              <Thermometer className="mx-auto mb-2" size={32} strokeWidth={2.2} />
              <p className="text-xs font-mono text-paper/50 uppercase">{t("landing.insightSensor")}</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{t("landing.insightTemp")}</p>
              <ArrowDown className="mx-auto mt-4" size={24} />
              <p className="mt-4 border-2 border-danger text-danger px-3 py-1.5 text-sm font-bold uppercase flex items-center justify-center gap-2">
                <Wind size={16} /> {t("landing.insightVent")}
              </p>
            </div>
            <X className="text-danger" size={40} strokeWidth={3} />
            <div className="border-[3px] border-paper bg-ink px-8 py-10 md:px-10 md:py-12 text-center w-52 md:w-60">
              <Droplets className="mx-auto mb-2" size={32} strokeWidth={2.2} />
              <p className="text-xs font-mono text-paper/50 uppercase">{t("landing.insightSensor")}</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{t("landing.insightHumidity")}</p>
              <ArrowDown className="mx-auto mt-4" size={24} />
              <p className="mt-4 border-2 border-danger text-danger px-3 py-1.5 text-sm font-bold uppercase flex items-center justify-center gap-2">
                <CloudDrizzle size={16} /> {t("landing.insightMist")}
              </p>
            </div>
          </div>
          <p className="font-mono text-sm md:text-base text-danger max-w-xl text-center">{t("landing.insightStep1Body")}</p>
        </div>

        {/* Step 2 */}
        <div data-step className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6" style={{ opacity: 0 }}>
          <p className="font-mono text-base md:text-lg text-paper/60 uppercase tracking-widest flex items-center gap-2">
            <Sigma size={20} /> {t("landing.insightStep2")}
          </p>
          <div className="border-[3px] border-green-1 bg-ink px-8 md:px-14 py-8 md:py-10 text-center">
            <p className="text-xs font-mono text-paper/50 uppercase mb-4 tracking-widest">{t("landing.insightVpdLabel")}</p>
            <Latex display className="text-green-1" math={"e_s(T) = 0.6108 \\cdot \\exp\\!\\left(\\dfrac{17.27\\,T}{T + 237.3}\\right)"} />
            <Latex display className="text-green-1 block mt-3" math={"VPD = e_s(T) - e_s(T) \\cdot \\dfrac{RH}{100}"} />
          </div>
          <p className="font-mono text-sm md:text-base text-paper/70 max-w-xl text-center">{t("landing.insightStep2Body")}</p>
        </div>

        {/* Step 3 */}
        <div data-step className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-6" style={{ opacity: 0 }}>
          <p className="font-mono text-base md:text-lg text-paper/60 uppercase tracking-widest flex items-center gap-2">
            <GitBranch size={20} /> {t("landing.insightStep3")}
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="border-[3px] border-purple-1 text-purple-1 px-10 py-5 font-bold text-xl md:text-2xl">VPD</div>
            <ArrowDown size={28} />
            <div className="flex gap-6 md:gap-8 flex-wrap justify-center">
              <div className="border-2 border-green-1 text-green-1 px-5 py-3 text-sm md:text-base font-bold uppercase flex items-center gap-2">
                <Wind size={18} /> {t("landing.insightBelowBand")}
              </div>
              <div className="border-2 border-purple-2 text-purple-2 px-5 py-3 text-sm md:text-base font-bold uppercase flex items-center gap-2">
                <CloudDrizzle size={18} /> {t("landing.insightAboveBand")}
              </div>
            </div>
          </div>
          <p className="font-mono text-sm md:text-base text-paper/70 max-w-xl text-center">{t("landing.insightStep3Body")}</p>
        </div>
      </div>
    </section>
  );
}
