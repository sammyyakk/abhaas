import { ReactNode } from "react";

const ACCENTS = {
  ink: "#000000",
  green: "#67cf00",
  purple: "#b273e9",
  danger: "#ff2d2d",
} as const;

export function Panel({
  children,
  className = "",
  accent = "ink",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  accent?: keyof typeof ACCENTS;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={`bg-paper text-ink border-[3px] border-ink ${className}`}
      style={{ boxShadow: `8px 8px 0 ${ACCENTS[accent]}` }}
    >
      {children}
    </Tag>
  );
}
