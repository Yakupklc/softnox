import { CSSProperties } from "react";

const PALETTE = [
  "#3b82f6", "#22d3ee", "#a78bfa", "#34d399",
  "#fbbf24", "#f87171", "#60a5fa", "#f472b6",
];

function hashColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
}

export function Avatar({ name, size = "md", style }: AvatarProps) {
  const bg = hashColor(name);
  const ini = initials(name);
  return (
    <span
      className={`ui-avatar ui-avatar--${size}`}
      style={{ background: bg, ...style }}
      aria-hidden="true"
    >
      {ini}
    </span>
  );
}
