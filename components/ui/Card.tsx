import { HTMLAttributes, forwardRef, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  elevated?: boolean;
  padless?: boolean;
  size?: "md" | "lg";
  as?: "div" | "section" | "article";
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive, elevated, padless, size = "md", as = "div", children, className, ...rest },
  ref
) {
  const classes = ["ui-card"];
  if (interactive) classes.push("ui-card--interactive");
  if (elevated) classes.push("ui-card--elevated");
  if (padless) classes.push("ui-card--padless");
  if (size === "lg") classes.push("ui-card--lg");
  if (className) classes.push(className);
  const Comp = as;
  return (
    <Comp ref={ref} className={classes.join(" ")} {...rest}>
      {children}
    </Comp>
  );
});
