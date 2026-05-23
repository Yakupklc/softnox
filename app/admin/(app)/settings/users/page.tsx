import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UsersPanel } from "@/components/admin/settings/UsersPanel";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") redirect("/admin/settings/profile");

  return <UsersPanel />;
}
