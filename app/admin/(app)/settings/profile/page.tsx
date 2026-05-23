import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfilePanel } from "@/components/admin/settings/ProfilePanel";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
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
    <ProfilePanel
      profile={{
        id: profile.id,
        email: user.email ?? "",
        full_name: profile.full_name ?? "",
        role: profile.role as "admin" | "super_admin",
      }}
    />
  );
}
