import { ReactNode } from "react";

const TONES: Record<string, string> = {
  nominal: "bg-green-1 text-ink border-ink",
  info: "bg-purple-2 text-ink border-ink",
  warn: "bg-warn text-ink border-ink",
  danger: "bg-danger text-paper border-ink",
  neutral: "bg-ink text-paper border-paper",
  paper: "bg-paper text-ink border-ink",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 border-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
