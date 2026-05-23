import { CSSProperties } from "react";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  text?: boolean;
  style?: CSSProperties;
}

export function Skeleton({ width, height, circle, text, style }: SkeletonProps) {
  const classes = ["ui-skeleton"];
  if (circle) classes.push("ui-skeleton--circle");
  if (text) classes.push("ui-skeleton--text");
  return (
    <span
      aria-hidden="true"
      className={classes.join(" ")}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
    />
  );
}
