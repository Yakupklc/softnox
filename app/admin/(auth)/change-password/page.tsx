"use client";

import { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/admin/Logo";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/useToast";

function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABEL = ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"];
const STRENGTH_COLOR = ["#6b7390", "#f87171", "#fbbf24", "#60a5fa", "#34d399"];

export default function ChangePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const score = useMemo(() => scorePassword(pw1), [pw1]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (pw1.length < 8) { setError("Şifre en az 8 karakter olmalı."); return; }
    if (pw1 !== pw2) { setError("Şifreler eşleşmiyor."); return; }
    setBusy(true);
    const { error: updErr } = await supabase.auth.updateUser({ password: pw1 });
    if (updErr) { setBusy(false); setError(updErr.message); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ must_change_password: false }).eq("id", user.id);
    }
    setBusy(false);
    toast.success("Şifre güncellendi");
    router.replace("/admin");
    router.refresh();
  }

  return (
    <>
      <div className="ui-auth-card__logo">
        <Logo size={32} />
        <div>
          <h1 className="ui-auth-card__title">Yeni Şifre Belirle</h1>
          <p className="ui-auth-card__sub">Güvenlik için yeni bir şifre belirle (en az 8 karakter)</p>
        </div>
      </div>

      <form className="ui-auth-form" onSubmit={onSubmit} noValidate>
        <PasswordInput
          label="Yeni Şifre"
          autoComplete="new-password"
          required
          value={pw1}
          onChange={e => setPw1(e.target.value)}
          helperText="En az 8 karakter; büyük/küçük harf, rakam ve sembol önerilir"
        />

        <div aria-live="polite" aria-atomic="true">
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: "var(--radius-full)",
                  background: i < score ? STRENGTH_COLOR[score] : "var(--border)",
                  transition: "background var(--dur-fast) var(--ease-out)",
                }}
              />
            ))}
          </div>
          {pw1.length > 0 && (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", marginTop: 4 }}>
              Kuvvet: <span style={{ color: STRENGTH_COLOR[score] }}>{STRENGTH_LABEL[score]}</span>
            </div>
          )}
        </div>

        <PasswordInput
          label="Yeni Şifre (Tekrar)"
          autoComplete="new-password"
          required
          value={pw2}
          onChange={e => setPw2(e.target.value)}
          errorText={pw2.length > 0 && pw1 !== pw2 ? "Şifreler eşleşmiyor" : undefined}
        />

        {error && (
          <div role="alert" style={{ color: "var(--danger)", fontSize: "var(--text-sm)", background: "var(--danger-bg)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" block loading={busy}>
          Şifreyi Güncelle
        </Button>
      </form>
    </>
  );
}
