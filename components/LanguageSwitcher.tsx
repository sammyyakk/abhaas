"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LOCALES, type LocaleCode } from "@/lib/i18n/locales";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <label className="flex items-center gap-1.5 border-2 border-shell-invert/30 px-2 py-1 cursor-pointer">
      <Languages size={14} className="text-shell-invert/60 shrink-0" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as LocaleCode)}
        aria-label={t("common.changeLanguage")}
        className="bg-transparent text-[11px] font-mono uppercase tracking-wider text-shell-invert focus:outline-none cursor-pointer"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} className="bg-shell text-shell-invert">
            {l.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
