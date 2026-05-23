import { ReactNode } from "react";
import { ToastProvider } from "@/components/ui";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
