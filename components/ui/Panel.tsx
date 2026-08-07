import { ReactNode } from "react";

const ACCENT_VARS = {
  ink: "var(--shadow-ink)",
  green: "var(--shadow-green)",
  purple: "var(--shadow-purple)",
  danger: "var(--shadow-danger)",
} as const;

export function Panel({
  children,
  className = "",
  accent = "ink",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  accent?: keyof typeof ACCENT_VARS;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={`bg-paper text-ink border-[3px] border-ink ${className}`}
      style={{ boxShadow: `8px 8px 0 ${ACCENT_VARS[accent]}` }}
    >
      {children}
    </Tag>
  );
}
