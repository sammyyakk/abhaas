"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Documented next-themes pattern: resolvedTheme is unreliable until after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === "light";

  return (
    <button
      type="button"
      aria-label="Toggle light / dark mode"
      aria-pressed={isLight}
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className={`brutal-toggle ${className}`}
      data-on={isLight}
    >
      <span className="brutal-toggle-thumb" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
