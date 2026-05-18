import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function adminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function isSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "super_admin";
}

// POST: şifre sıfırlama maili gönder
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { id } = await params;
  const admin = adminClient();

  // kullanıcının emailini al
  const { data: userData, error: userErr } = await admin.auth.admin.getUserById(id);
  if (userErr || !userData.user.email) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const { error } = await admin.auth.resetPasswordForEmail(userData.user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://softnox.com.tr"}/auth/reset-password`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
