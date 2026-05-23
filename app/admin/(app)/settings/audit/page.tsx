import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuditPanel } from "@/components/admin/settings/AuditPanel";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "super_admin") redirect("/admin/settings/profile");

  return <AuditPanel />;
}
