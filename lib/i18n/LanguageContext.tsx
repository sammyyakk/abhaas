"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from "react";
import { en } from "./dictionary";
import { hi } from "./dictionaries/hi";
import { bn } from "./dictionaries/bn";
import { te } from "./dictionaries/te";
import { mr } from "./dictionaries/mr";
import { ta } from "./dictionaries/ta";
import { gu } from "./dictionaries/gu";
import { ur } from "./dictionaries/ur";
import { kn } from "./dictionaries/kn";
import { or as orLocale } from "./dictionaries/or";
import { ml } from "./dictionaries/ml";
import { pa } from "./dictionaries/pa";
import { as as asLocale } from "./dictionaries/as";
import { DEFAULT_LOCALE, type LocaleCode } from "./locales";

const DICTIONARIES: Record<LocaleCode, typeof en> = {
  en,
  hi,
  bn,
  te,
  mr,
  ta,
  gu,
  ur,
  kn,
  or: orLocale,
  ml,
  pa,
  as: asLocale,
};

const STORAGE_KEY = "abhaas:locale";

type ParamValue = string | number;

function resolvePath(dict: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in node) return (node as Record<string, unknown>)[key];
    return undefined;
  }, dict);
}

function interpolate(template: string, params?: Record<string, ParamValue>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match));
}

interface LanguageApi {
  locale: LocaleCode;
  setLocale: (l: LocaleCode) => void;
  t: (path: string, params?: Record<string, ParamValue>) => string;
}

const LanguageCtx = createContext<LanguageApi | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);

  // Restore after mount only (not in useState initializer): localStorage is
  // unavailable during SSR, reading it earlier would cause a hydration mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot restore-after-mount, not a render loop
      if (raw && raw in DICTIONARIES) setLocaleState(raw as LocaleCode);
    } catch {
      // keep default locale
    }
  }, []);

  const setLocale = useCallback((l: LocaleCode) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // persistence is a convenience, not required
    }
  }, []);

  const t = useCallback(
    (path: string, params?: Record<string, ParamValue>) => {
      const dict = DICTIONARIES[locale] ?? en;
      const value = resolvePath(dict, path) ?? resolvePath(en, path);
      if (typeof value !== "string") return path;
      return interpolate(value, params);
    },
    [locale]
  );

  // None of the 12 non-English locales have upper/lowercase distinctions
  // (Brahmic scripts + Urdu/Arabic); applying CSS text-transform: uppercase
  // to them is not just meaningless, it makes Chromium mis-shape conjunct
  // clusters into missing-glyph tofu boxes. See globals.css's `.uppercase`
  // override, which this attribute drives.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.setAttribute("data-locale", locale);
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageCtx);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
