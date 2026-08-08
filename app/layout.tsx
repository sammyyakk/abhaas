import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { IntroLoader } from "@/components/intro/IntroLoader";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://abhaas.vercel.app";
const TITLE = "ABHAAS: Smart Polyhouse Management";
const DESCRIPTION =
  "A growth-stage-aware digital twin for smart polyhouse management. Rehearse before you act. Team Nirvaah, Avinya 2026, PS3.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · ABHAAS" },
  description: DESCRIPTION,
  icons: { icon: "/abhaas_logo.png" },
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-shell text-shell-invert">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <IntroLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
