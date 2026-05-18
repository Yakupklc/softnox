"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase hash fragment'ı otomatik işler, session kurulur
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Hash yoksa veya hata varsa ana sayfaya yönlendir
    const hash = window.location.hash;
    if (hash.includes("error")) {
      setError("Şifre sıfırlama linki geçersiz veya süresi dolmuş. Lütfen tekrar talep edin.");
      setReady(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError("Şifre güncellenemedi: " + err.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/admin/login"), 2000);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__grid-bg" />
      <div className="admin-login__glow-1" />
      <div className="admin-login__glow-2" />

      <div className="admin-login__card">
        <div className="admin-login__logo">
          <div className="logo">
            <svg width={28} height={28} viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="lg-reset" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0" stopColor="#22d3ee" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <path d="M16 2 L29 9 L29 23 L16 30 L3 23 L3 9 Z" stroke="url(#lg-reset)" strokeWidth="1.5" fill="none" />
              <path d="M11 12 Q11 10 13 10 L19 10 Q21 10 21 12 Q21 14 19 14 L13 14 Q11 14 11 16 Q11 18 13 18 L19 18 Q21 18 21 20 Q21 22 19 22 L13 22 Q11 22 11 20" stroke="url(#lg-reset)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="logo-text">softnox</span>
          </div>
        </div>

        <h1 className="admin-login__title">Şifre Sıfırla</h1>
        <p className="admin-login__sub">Yeni şifrenizi belirleyin.</p>

        {success ? (
          <div style={{ color: "#22d3ee", textAlign: "center", padding: "1rem" }}>
            ✓ Şifreniz güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
          </div>
        ) : (
          <form className="admin-login__form" onSubmit={handleSubmit} noValidate>
            {error && <div className="admin-login__err">{error}</div>}

            <label className="field">
              <span className="field__lbl">Yeni Şifre</span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </label>

            <label className="field">
              <span className="field__lbl">Şifre Tekrar</span>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </label>

            <button
              type="submit"
              className="btn btn--primary admin-login__btn"
              disabled={loading || !!error && !password}
            >
              {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
