import { CSSProperties } from "react";

export type SpinnerProps = {
  size?: "sm" | "lg";
  inverse?: boolean;
  style?: CSSProperties;
  label?: string;
};

export function Spinner({ size = "sm", inverse, style, label = "Yükleniyor" }: SpinnerProps) {
  const classes = ["ui-spinner"];
  if (size === "lg") classes.push("ui-spinner--lg");
  if (inverse) classes.push("ui-spinner--inverse");
  return (
    <span
      className={classes.join(" ")}
      role="status"
      aria-label={label}
      style={style}
    />
  );
}
