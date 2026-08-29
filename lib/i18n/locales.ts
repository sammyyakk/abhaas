export const LOCALES = [
  { code: "en", nativeName: "English" },
  { code: "hi", nativeName: "हिन्दी" },
  { code: "bn", nativeName: "বাংলা" },
  { code: "te", nativeName: "తెలుగు" },
  { code: "mr", nativeName: "मराठी" },
  { code: "ta", nativeName: "தமிழ்" },
  { code: "gu", nativeName: "ગુજરાતી" },
  { code: "ur", nativeName: "اردو" },
  { code: "kn", nativeName: "ಕನ್ನಡ" },
  { code: "or", nativeName: "ଓଡ଼ିଆ" },
  { code: "ml", nativeName: "മലയാളം" },
  { code: "pa", nativeName: "ਪੰਜਾਬੀ" },
  { code: "as", nativeName: "অসমীয়া" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";
