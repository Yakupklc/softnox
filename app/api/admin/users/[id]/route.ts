import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

async function isSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, supabase };
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { ok: data?.role === "super_admin", supabase };
}

// PATCH: kullanıcı bilgilerini güncelle
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { ok, supabase } = await isSuperAdmin();
  if (!ok) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { id } = await params;
  const { full_name, role } = await req.json();

  const { error } = await supabase.from("profiles").upsert({
    id,
    full_name,
    role,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
