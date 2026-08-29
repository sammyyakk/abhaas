import type { Metadata, Viewport } from "next";
import {
  Space_Grotesk,
  Space_Mono,
  Noto_Sans_Devanagari,
  Noto_Sans_Bengali,
  Noto_Sans_Telugu,
  Noto_Sans_Tamil,
  Noto_Sans_Gujarati,
  Noto_Sans_Kannada,
  Noto_Sans_Oriya,
  Noto_Sans_Malayalam,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Arabic,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import { IntroLoader } from "@/components/intro/IntroLoader";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import "katex/dist/katex.min.css";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const mono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// System/OS fallback fonts often lack full OpenType shaping tables for
// Indic conjuncts (e.g. Tamil "ங்க"), rendering them as tofu even though the
// text itself is correct. Loading a dedicated, fully-shaped Noto Sans family
// per script guarantees every one of the 12 non-English locales renders
// correctly regardless of what's installed on the viewer's system.
const devanagari = Noto_Sans_Devanagari({ variable: "--font-devanagari", subsets: ["devanagari"], weight: ["400", "700"] });
const bengali = Noto_Sans_Bengali({ variable: "--font-bengali", subsets: ["bengali"], weight: ["400", "700"] });
const telugu = Noto_Sans_Telugu({ variable: "--font-telugu", subsets: ["telugu"], weight: ["400", "700"] });
const tamil = Noto_Sans_Tamil({ variable: "--font-tamil", subsets: ["tamil"], weight: ["400", "700"] });
const gujarati = Noto_Sans_Gujarati({ variable: "--font-gujarati", subsets: ["gujarati"], weight: ["400", "700"] });
const kannada = Noto_Sans_Kannada({ variable: "--font-kannada", subsets: ["kannada"], weight: ["400", "700"] });
const oriya = Noto_Sans_Oriya({ variable: "--font-oriya", subsets: ["oriya"], weight: ["400", "700"] });
const malayalam = Noto_Sans_Malayalam({ variable: "--font-malayalam", subsets: ["malayalam"], weight: ["400", "700"] });
const gurmukhi = Noto_Sans_Gurmukhi({ variable: "--font-gurmukhi", subsets: ["gurmukhi"], weight: ["400", "700"] });
const arabic = Noto_Sans_Arabic({ variable: "--font-arabic", subsets: ["arabic"], weight: ["400", "700"] });

const SCRIPT_FONT_VARS = [
  devanagari.variable,
  bengali.variable,
  telugu.variable,
  tamil.variable,
  gujarati.variable,
  kannada.variable,
  oriya.variable,
  malayalam.variable,
  gurmukhi.variable,
  arabic.variable,
].join(" ");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://abhaas.vercel.app";
const TITLE = "ABHAAS: Smart Polyhouse Management";
const DESCRIPTION =
  "A growth-stage-aware digital twin for smart polyhouse management. Rehearse before you act. Team Nirvaah, Avinya 2026, PS3.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · ABHAAS" },
  description: DESCRIPTION,
  manifest: "/manifest.json",
  icons: {
    icon: "/abhaas_logo.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ABHAAS",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${SCRIPT_FONT_VARS} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-shell text-shell-invert">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider>
            <IntroLoader />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
