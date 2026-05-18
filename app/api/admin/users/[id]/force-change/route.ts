import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

async function isSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, supabase };
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { ok: data?.role === "super_admin", supabase };
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { ok, supabase } = await isSuperAdmin();
  if (!ok) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { id } = await params;
  await supabase.from("profiles").update({ must_change_password: true }).eq("id", id);
  return NextResponse.json({ success: true });
}
