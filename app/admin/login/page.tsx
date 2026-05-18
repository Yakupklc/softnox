"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const Logo = () => (
  <div className="logo">
    <svg width={28} height={28} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="lg-login" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M16 2 L29 9 L29 23 L16 30 L3 23 L3 9 Z" stroke="url(#lg-login)" strokeWidth="1.5" fill="none" />
      <path d="M11 12 Q11 10 13 10 L19 10 Q21 10 21 12 Q21 14 19 14 L13 14 Q11 14 11 16 Q11 18 13 18 L19 18 Q21 18 21 20 Q21 22 19 22 L13 22 Q11 22 11 20" stroke="url(#lg-login)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="logo-text">softnox</span>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"login" | "forgot">("login");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
      return;
    }
    // İlk girişte şifre değiştirme kontrolü
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("must_change_password")
        .eq("id", data.user.id)
        .single();
      // Profil yoksa veya must_change_password true ise şifre belirleme sayfasına yönlendir
      if (!profile || profile.must_change_password) {
        router.push("/admin/change-password");
        return;
      }
    }
    router.push("/admin/welcome");
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://softnox.com.tr/auth/reset-password",
    });
    setLoading(false);
    if (err) {
      setError("Mail gönderilemedi: " + err.message);
      return;
    }
    setResetSent(true);
  };

  return (
    <div className="admin-login">
      <div className="admin-login__grid-bg" />
      <div className="admin-login__glow-1" />
      <div className="admin-login__glow-2" />

      <div className="admin-login__card">
        <div className="admin-login__logo"><Logo /></div>
        <h1 className="admin-login__title">Yönetim Paneli</h1>
        <p className="admin-login__sub">
          {view === "login" ? "Devam etmek için giriş yapın." : "Şifre sıfırlama bağlantısı gönderilecek."}
        </p>

        {view === "login" ? (
          <form className="admin-login__form" onSubmit={handleSubmit} noValidate>
            {error && <div className="admin-login__err">{error}</div>}

            <label className="field">
              <span className="field__lbl">E-posta</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@softnox.com.tr"
                required
                autoComplete="email"
              />
            </label>

            <label className="field">
              <span className="field__lbl">Şifre</span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </label>

            <button type="submit" className="btn btn--primary admin-login__btn" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>

            <button
              type="button"
              onClick={() => { setView("forgot"); setError(""); }}
              style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.8rem", cursor: "pointer", marginTop: "0.5rem", textDecoration: "underline" }}
            >
              Şifremi unuttum
            </button>
          </form>
        ) : resetSent ? (
          <div style={{ color: "#22d3ee", textAlign: "center", padding: "1rem" }}>
            ✓ Şifre sıfırlama maili gönderildi. Gelen kutunuzu kontrol edin.
            <br />
            <button
              type="button"
              onClick={() => { setView("login"); setResetSent(false); }}
              style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.8rem", cursor: "pointer", marginTop: "1rem", textDecoration: "underline" }}
            >
              Giriş sayfasına dön
            </button>
          </div>
        ) : (
          <form className="admin-login__form" onSubmit={handleForgot} noValidate>
            {error && <div className="admin-login__err">{error}</div>}

            <label className="field">
              <span className="field__lbl">E-posta</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@softnox.com.tr"
                required
                autoComplete="email"
              />
            </label>

            <button type="submit" className="btn btn--primary admin-login__btn" disabled={loading}>
              {loading ? "Gönderiliyor..." : "Sıfırlama Maili Gönder"}
            </button>

            <button
              type="button"
              onClick={() => { setView("login"); setError(""); }}
              style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.8rem", cursor: "pointer", marginTop: "0.5rem", textDecoration: "underline" }}
            >
              Geri dön
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
