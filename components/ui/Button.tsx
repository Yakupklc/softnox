"use client";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconOnly?: boolean;
  block?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    loading = false,
    iconOnly = false,
    block = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    className,
    type = "button",
    ...rest
  },
  ref
) {
  const classes = ["ui-btn", `ui-btn--${variant}`];
  if (size === "sm") classes.push("ui-btn--sm");
  if (size === "lg") classes.push("ui-btn--lg");
  if (iconOnly) classes.push("ui-btn--icon");
  if (block) classes.push("ui-btn--block");
  if (className) classes.push(className);

  return (
    <button
      ref={ref}
      type={type}
      className={classes.join(" ")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner inverse={variant === "primary"} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
