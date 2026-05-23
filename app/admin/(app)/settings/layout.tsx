import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { SettingsShell } from "@/components/admin/SettingsShell";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  const isSuper = profile?.role === "super_admin";

  return (
    <SettingsShell
      items={[
        { href: "/admin/settings/profile", label: "Profil", visible: true },
        { href: "/admin/settings/users",   label: "Kullanıcılar", visible: isSuper },
        { href: "/admin/settings/audit",   label: "Aktivite Logu", visible: isSuper },
      ]}
    >
      {children}
    </SettingsShell>
  );
}
