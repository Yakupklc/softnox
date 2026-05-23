import { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "success" | "warning" | "danger" | "info" | "neutral"
  | "role-super" | "role-admin";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
}

export function Badge({
  variant = "neutral",
  icon,
  children,
  className,
  "aria-label": ariaLabel,
  ...rest
}: BadgeProps) {
  const classes = ["ui-badge", `ui-badge--${variant}`];
  if (className) classes.push(className);
  return (
    <span className={classes.join(" ")} aria-label={ariaLabel} {...rest}>
      {icon}
      {children}
    </span>
  );
}

const SONUC_TO_VARIANT: Record<string, BadgeVariant> = {
  "Beklemede": "warning",
  "Olumlu": "success",
  "Olumsuz": "danger",
  "Devam Ediyor": "info",
};

export function StatusBadge({ sonuc }: { sonuc: string }) {
  const variant = SONUC_TO_VARIANT[sonuc] ?? "neutral";
  return <Badge variant={variant} aria-label={`Durum: ${sonuc}`}>{sonuc}</Badge>;
}

export function RoleBadge({ role }: { role: "admin" | "super_admin" }) {
  const variant: BadgeVariant = role === "super_admin" ? "role-super" : "role-admin";
  const label = role === "super_admin" ? "Süper Admin" : "Admin";
  return <Badge variant={variant} aria-label={`Rol: ${label}`}>{label}</Badge>;
}
