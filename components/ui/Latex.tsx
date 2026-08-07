"use client";

import { useMemo } from "react";
import katex from "katex";

export function Latex({
  math,
  display = false,
  className = "",
}: {
  math: string;
  display?: boolean;
  className?: string;
}) {
  const html = useMemo(
    () => katex.renderToString(math, { throwOnError: false, displayMode: display }),
    [math, display]
  );
  // KaTeX output is generated locally from a fixed formula string, never user input.
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
