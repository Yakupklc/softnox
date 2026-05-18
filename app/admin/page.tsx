export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import AdminCRM from "@/components/admin/AdminCRM";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, title")
    .eq("id", user!.id)
    .single();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminCRM
      profile={profile ?? { full_name: "Admin", title: "Yönetici" }}
      initialContacts={contacts ?? []}
    />
  );
}
