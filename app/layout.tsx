import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "ABHAAS — Smart Polyhouse Management",
  description:
    "Abhaas — a digital twin for smart polyhouse management. Team Nirvaah, Avinya 2026, PS3.",
  icons: { icon: "/abhaas_logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ink text-paper">{children}</body>
    </html>
  );
}
