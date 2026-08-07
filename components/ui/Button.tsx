import { ReactNode } from "react";

const TONES: Record<string, string> = {
  ink: "bg-ink text-paper",
  green: "bg-green-1 text-ink",
  purple: "bg-purple-1 text-ink",
  danger: "bg-danger text-paper",
  paper: "bg-paper text-ink",
};

export function Button({
  children,
  onClick,
  tone = "ink",
  className = "",
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: keyof typeof TONES;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${TONES[tone]} border-[3px] border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#000] transition-transform active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
