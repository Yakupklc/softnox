import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CRMDashboard } from "@/components/admin/crm/CRMDashboard";
import type { Contact } from "@/components/admin/crm/types";

export const dynamic = "force-dynamic";

export default async function CRMPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, must_change_password")
    .eq("id", user.id)
    .single();

  if (profile?.must_change_password) redirect("/admin/change-password");

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <CRMDashboard
      initialContacts={(contacts ?? []) as Contact[]}
      userName={profile?.full_name ?? ""}
    />
  );
}
