"use client";

import { Map, Activity, Sprout, Radar, SlidersHorizontal, ShieldAlert, Wrench, RotateCcw, Bug, Layers } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const FEATURES = [
  { labelKey: "landing.featureZonedLabel", icon: Map, bodyKey: "landing.featureZonedBody" },
  { labelKey: "landing.featurePhysiologicalLabel", icon: Activity, bodyKey: "landing.featurePhysiologicalBody" },
  { labelKey: "landing.featureStageAwareLabel", icon: Sprout, bodyKey: "landing.featureStageAwareBody" },
  { labelKey: "landing.featurePredictiveLabel", icon: Radar, bodyKey: "landing.featurePredictiveBody" },
  { labelKey: "landing.featureOptimisedLabel", icon: SlidersHorizontal, bodyKey: "landing.featureOptimisedBody" },
  { labelKey: "landing.featureRiskLabel", icon: ShieldAlert, bodyKey: "landing.featureRiskBody" },
  { labelKey: "landing.featureFaultLabel", icon: Wrench, bodyKey: "landing.featureFaultBody" },
  { labelKey: "landing.featureRehearsableLabel", icon: RotateCcw, bodyKey: "landing.featureRehearsableBody" },
  { labelKey: "landing.featurePestIdLabel", icon: Bug, bodyKey: "landing.featurePestIdBody" },
];

export function FeaturesSection() {
  const { t } = useLanguage();
  return (
    <section id="features-pin" className="relative min-h-screen border-b-[6px] border-green-1 flex flex-col items-center justify-center px-5 md:px-10 py-16">
      <div className="text-center mb-10 md:mb-14">
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-green-1 inline-flex items-center gap-1.5">
          <Layers size={12} /> {t("landing.featuresEyebrow")}
        </span>
        <h2 className="mt-2 text-3xl md:text-5xl font-bold">{t("landing.featuresHeading")}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl w-full">
        {FEATURES.map((f) => (
          <div
            key={f.labelKey}
            data-card
            className="border-[3px] border-shell-invert bg-paper text-ink p-4 md:p-5"
            style={{ boxShadow: "6px 6px 0 var(--shadow-purple)", opacity: 0 }}
          >
            <f.icon className="text-purple-3 mb-2" size={26} strokeWidth={2} />
            <p className="font-bold text-sm md:text-base uppercase tracking-wide text-purple-3">{t(f.labelKey)}</p>
            <p className="text-xs md:text-sm text-ink/70 mt-2 leading-snug">{t(f.bodyKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
