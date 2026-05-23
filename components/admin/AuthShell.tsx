import { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="ui-auth-shell">
      <main className="ui-auth-card">{children}</main>
    </div>
  );
}
