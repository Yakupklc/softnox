import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/admin/login");

  return (
    <AdminShell
      user={{
        id: profile.id,
        full_name: profile.full_name ?? "",
        role: profile.role as "admin" | "super_admin",
        email: user.email ?? null,
      }}
    >
      {children}
    </AdminShell>
  );
}
