"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/admin/Logo";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

type Mode = "login" | "reset";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const emailRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { emailRef.current?.focus(); }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setBusy(false);
      setError(err.message === "Invalid login credentials" ? "E-posta veya şifre hatalı." : err.message);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("must_change_password")
        .eq("id", data.user.id)
        .single();
      if (profile?.must_change_password) {
        setBusy(false);
        router.replace("/admin/change-password");
        router.refresh();
        return;
      }
    }

    setBusy(false);
    const redirectTo = params.get("redirect") ?? "/admin";
    router.replace(redirectTo);
    router.refresh();
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setInfo("Şifre sıfırlama bağlantısı e-postana gönderildi.");
  }

  return (
    <>
      <div className="ui-auth-card__logo">
        <Logo size={32} />
        <div>
          <h1 className="ui-auth-card__title">{mode === "login" ? "Yönetim Paneli" : "Şifre Sıfırla"}</h1>
          <p className="ui-auth-card__sub">
            {mode === "login" ? "Devam etmek için giriş yap" : "E-posta adresini gir, bağlantı gönderelim"}
          </p>
        </div>
      </div>

      <form className="ui-auth-form" onSubmit={mode === "login" ? handleLogin : handleReset} noValidate>
        <Input
          ref={emailRef}
          label="E-posta"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ornek@firma.com"
        />
        {mode === "login" && (
          <PasswordInput
            label="Şifre"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        )}

        {error && (
          <div role="alert" style={{ color: "var(--danger)", fontSize: "var(--text-sm)", background: "var(--danger-bg)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            {error}
          </div>
        )}
        {info && (
          <div role="status" style={{ color: "var(--success)", fontSize: "var(--text-sm)", background: "var(--success-bg)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            {info}
          </div>
        )}

        <Button type="submit" variant="primary" block loading={busy}>
          {mode === "login" ? "Giriş Yap" : "Bağlantı Gönder"}
        </Button>

        <button
          type="button"
          className="ui-auth-link"
          onClick={() => { setMode(mode === "login" ? "reset" : "login"); setError(""); setInfo(""); }}
        >
          {mode === "login" ? "Şifremi unuttum" : "Girişe geri dön"}
        </button>
      </form>
    </>
  );
}
