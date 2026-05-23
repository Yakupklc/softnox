"use client";
import { useState, FormEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/lib/hooks/useToast";
import { createClient } from "@/lib/supabase/client";

export interface ProfileShape {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "super_admin";
}

export function ProfilePanel({ profile }: { profile: ProfileShape }) {
  const supabase = createClient();
  const toast = useToast();

  const [fullName, setFullName] = useState(profile.full_name);
  const [savingName, setSavingName] = useState(false);

  const [showPw, setShowPw] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", profile.id);
    setSavingName(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profil güncellendi");
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    if (pwNew.length < 8) { toast.error("Yeni şifre en az 8 karakter olmalı"); return; }
    if (pwNew !== pwConfirm) { toast.error("Şifreler eşleşmiyor"); return; }
    setPwBusy(true);
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: profile.email, password: pwCurrent });
    if (signErr) { setPwBusy(false); toast.error("Mevcut şifre hatalı"); return; }
    const { error: updErr } = await supabase.auth.updateUser({ password: pwNew });
    setPwBusy(false);
    if (updErr) { toast.error(updErr.message); return; }
    setShowPw(false);
    setPwCurrent(""); setPwNew(""); setPwConfirm("");
    toast.success("Şifre güncellendi");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <Avatar name={profile.full_name || profile.email} size="lg" />
          <div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{profile.full_name || "İsimsiz"}</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginTop: 4 }}>{profile.email}</div>
            <div style={{ marginTop: 8 }}><RoleBadge role={profile.role} /></div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, margin: 0, marginBottom: "var(--space-4)" }}>Hesap Bilgileri</h2>
        <form onSubmit={saveName} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input label="Ad Soyad" value={fullName} onChange={e => setFullName(e.target.value)} required />
          <Input label="E-posta" value={profile.email} readOnly style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }} />
          <div>
            <Button type="submit" variant="primary" loading={savingName}>Kaydet</Button>
          </div>
        </form>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showPw ? "var(--space-4)" : 0 }}>
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, margin: 0 }}>Şifre</h2>
          {!showPw && <Button variant="secondary" onClick={() => setShowPw(true)}>Şifre Değiştir</Button>}
        </div>
        {showPw && (
          <form onSubmit={savePassword} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <PasswordInput label="Mevcut Şifre" autoComplete="current-password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} required />
            <PasswordInput label="Yeni Şifre" autoComplete="new-password" value={pwNew} onChange={e => setPwNew(e.target.value)} required helperText="En az 8 karakter" />
            <PasswordInput label="Yeni Şifre (Tekrar)" autoComplete="new-password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} required />
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Button type="submit" variant="primary" loading={pwBusy}>Güncelle</Button>
              <Button variant="ghost" onClick={() => { setShowPw(false); setPwCurrent(""); setPwNew(""); setPwConfirm(""); }} disabled={pwBusy}>Vazgeç</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
