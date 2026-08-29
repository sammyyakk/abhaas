"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { SimulationProvider } from "@/lib/SimulationContext";
import { DashboardNav } from "@/components/DashboardNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <SimulationProvider>
      <div className="flex flex-col flex-1 min-h-screen bg-shell text-shell-invert">
        <header className="border-b-[3px] border-shell-invert/10 px-4 md:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/abhaas_logo.png"
              alt="Abhaas"
              width={32}
              height={32}
              className="w-8 h-8 border-2 border-shell-invert bg-ink object-contain p-0.5"
            />
            <span className="font-wordmark text-lg">
              <span className="text-green-1">ABH</span>
              <span className="text-purple-1">AAS</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[11px] font-mono uppercase tracking-wider text-shell-invert/60 hover:text-shell-invert"
            >
              ← {t("common.home")}
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <DashboardNav />

        <main className="flex-1 mx-auto max-w-6xl w-full px-4 md:px-8 py-6 md:py-8 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t-[3px] border-green-1 bg-shell px-4 md:px-8 py-4 flex flex-col items-center gap-2 text-center">
          <span className="inline-flex items-center gap-1.5 border-2 border-shell-invert/30 text-shell-invert/50 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider">
            {t("footer.l0Driver")}
          </span>
          <p className="text-[11px] font-mono text-shell-invert/40">{t("footer.credit")}</p>
        </footer>
      </div>
    </SimulationProvider>
  );
}
