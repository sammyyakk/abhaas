"use client";

export type TabId = "twin" | "advisories" | "sandbox" | "ledger" | "risk" | "health";

export const TABS: { id: TabId; label: string }[] = [
  { id: "twin", label: "Twin View" },
  { id: "advisories", label: "Advisories" },
  { id: "sandbox", label: "Sandbox" },
  { id: "ledger", label: "Water Ledger" },
  { id: "risk", label: "Risk Board" },
  { id: "health", label: "Health Monitor" },
];

export function NavTabs({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <nav
      id="dashboard"
      className="sticky top-0 z-30 bg-ink border-b-[3px] border-green-1 overflow-x-auto"
    >
      <div className="flex min-w-max mx-auto max-w-6xl px-2">
        {TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`px-4 md:px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider border-r-[3px] border-ink whitespace-nowrap transition-colors ${
                isActive ? "bg-green-1 text-ink" : "bg-ink text-paper/70 hover:text-paper hover:bg-paper/10"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
