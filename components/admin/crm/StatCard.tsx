import { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone: "neutral" | "success" | "warning" | "info" | "danger";
}

const TONE_BG: Record<StatCardProps["tone"], string> = {
  neutral: "var(--surface-2)",
  success: "var(--success-bg)",
  warning: "var(--warning-bg)",
  info:    "var(--info-bg)",
  danger:  "var(--danger-bg)",
};
const TONE_FG: Record<StatCardProps["tone"], string> = {
  neutral: "var(--text-dim)",
  success: "var(--success)",
  warning: "var(--warning)",
  info:    "var(--info)",
  danger:  "var(--danger)",
};

export function StatCard({ label, value, icon, tone }: StatCardProps) {
  return (
    <div className="ui-stat">
      <div className="ui-stat__head">
        <span className="ui-stat__label">{label}</span>
        <span
          className="ui-stat__icon"
          style={{ background: TONE_BG[tone], color: TONE_FG[tone] }}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <div className="ui-stat__value">{value}</div>
    </div>
  );
}
