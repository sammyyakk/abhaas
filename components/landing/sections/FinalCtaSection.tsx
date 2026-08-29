"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function FinalCtaSection() {
  const { t } = useLanguage();
  return (
    <section className="border-t-[6px] border-green-1 bg-ink text-paper px-5 md:px-10 py-20 md:py-28 flex flex-col items-center text-center gap-8">
      <p data-reveal className="text-2xl md:text-4xl lg:text-5xl font-bold max-w-3xl leading-tight">
        {t("landing.finalCtaHeading")}
      </p>
      <Link
        data-reveal
        href="/dashboard/twin"
        className="inline-flex items-center gap-2 bg-green-1 text-ink border-[3px] border-paper px-8 py-4 text-base font-bold uppercase tracking-widest shadow-[8px_8px_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[5px_5px_0_#000] transition-transform"
      >
        {t("landing.enterTwin")} <ArrowDown size={18} />
      </Link>
      <p data-reveal className="text-[11px] font-mono text-paper/40 mt-6">{t("footer.credit")}</p>
    </section>
  );
}
