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

// GET: kullanıcı listesi
export async function GET() {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const admin = adminClient();
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // profil bilgileriyle birleştir
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, role");

  const users = data.users.map(u => {
    const p = profiles?.find(p => p.id === u.id);
    return {
      id: u.id,
      email: u.email,
      full_name: p?.full_name ?? "",
      role: p?.role ?? "admin",
      created_at: u.created_at,
    };
  });

  return NextResponse.json({ users });
}

// POST: yeni kullanıcı ekle
export async function POST(req: NextRequest) {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { email, password, full_name, role } = await req.json();
  if (!email || !password || !full_name) {
    return NextResponse.json({ error: "Tüm alanlar zorunlu" }, { status: 400 });
  }

  const admin = adminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // profil oluştur
  const supabase = await createClient();
  await supabase.from("profiles").upsert({
    id: data.user.id,
    full_name,
    role: role ?? "admin",
  });

  return NextResponse.json({ success: true, user: data.user });
}
