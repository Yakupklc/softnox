"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Profile { full_name: string; role: string; }
interface User {
  id: string; email: string; full_name: string;
  role: string; created_at: string;
}

const Logo = () => (
  <div className="logo">
    <svg width={24} height={24} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="lg-settings" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="#22d3ee" /><stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M16 2 L29 9 L29 23 L16 30 L3 23 L3 9 Z" stroke="url(#lg-settings)" strokeWidth="1.5" fill="none" />
      <path d="M11 12 Q11 10 13 10 L19 10 Q21 10 21 12 Q21 14 19 14 L13 14 Q11 14 11 16 Q11 18 13 18 L19 18 Q21 18 21 20 Q21 22 19 22 L13 22 Q11 22 11 20" stroke="url(#lg-settings)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="logo-text">softnox</span>
  </div>
);

export default function AdminSettings({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();
  const initials = profile.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Yeni kullanıcı formu
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", role: "admin" });
  const [saving, setSaving] = useState(false);

  // Düzenleme modalı
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", role: "admin" });
  const [editSaving, setEditSaving] = useState(false);

  const flash = (type: "ok" | "err", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => { setUsers(d.users ?? []); setLoading(false); });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { flash("err", data.error); return; }
    flash("ok", `${form.full_name} başarıyla eklendi.`);
    setShowForm(false);
    setForm({ email: "", full_name: "", role: "admin" });
    // listeyi yenile
    fetch("/api/admin/users").then(r => r.json()).then(d => setUsers(d.users ?? []));
  };

  const openEdit = (u: User) => { setEditUser(u); setEditForm({ full_name: u.full_name, role: u.role }); };
  const closeEdit = () => setEditUser(null);

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditSaving(true);
    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    setEditSaving(false);
    if (!res.ok) { flash("err", data.error); return; }
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...editForm } : u));
    flash("ok", "Kullanıcı güncellendi.");
    closeEdit();
  };

  const handleSendInitialLink = async (user: User) => {
    if (!confirm(`${user.email} kullanıcısı bir sonraki girişinde şifre belirleme ekranı görsün mü?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}/force-change`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) flash("err", data.error ?? "Hata oluştu.");
    else flash("ok", `${user.email} kullanıcısı bir sonraki girişinde şifresini belirleyecek.`);
  };

  const handleResetPassword = async (user: User) => {
    if (!confirm(`${user.email} adresine şifre sıfırlama maili gönderilsin mi?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}/reset-password`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) flash("err", data.error);
    else flash("ok", `${user.email} adresine mail gönderildi.`);
  };

  const roleLabel = (r: string) => r === "super_admin" ? "Süper Admin" : "Admin";
  const roleBadge = (r: string) => r === "super_admin"
    ? { background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }
    : { background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" };

  return (
    <div className="admin-shell">
      {/* Topbar */}
      <div className="admin-topbar">
        <Logo />
        <div style={{ height: 24, width: 1, background: "var(--border)", margin: "0 4px" }} />
        <span style={{ fontSize: 12, color: "var(--text-mute)", fontFamily: "var(--font-mono)" }}>Ayarlar</span>
        <div className="admin-topbar__right">
          <button
            onClick={() => router.push("/admin")}
            style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-mute)", borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer" }}
          >
            ← CRM'e Dön
          </button>
          <div className="admin-topbar__user">
            <div className="admin-topbar__avatar">{initials}</div>
            <div className="admin-topbar__info">
              <span className="admin-topbar__name">{profile.full_name}</span>
              <span className="admin-topbar__role">{profile.role === "super_admin" ? "Süper Admin" : "Admin"}</span>
            </div>
          </div>
          <button className="admin-topbar__logout" onClick={handleLogout}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Çıkış
          </button>
        </div>
      </div>

      <main className="admin-main">
        {/* Flash */}
        {msg && (
          <div style={{
            padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13,
            background: msg.type === "ok" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
            color: msg.type === "ok" ? "#34d399" : "#f87171",
            border: `1px solid ${msg.type === "ok" ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}>
            {msg.type === "ok" ? "✓ " : "✕ "}{msg.text}
          </div>
        )}

        <div className="admin-page-head">
          <div>
            <h1 className="admin-page-title">Kullanıcı Yönetimi</h1>
            <p className="admin-page-sub">Admin kullanıcıları görüntüleyin, ekleyin ve şifre sıfırlayın</p>
          </div>
          <button className="btn btn--primary btn--sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? "İptal" : "+ Yeni Kullanıcı"}
          </button>
        </div>

        {/* Yeni kullanıcı formu */}
        {showForm && (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
            padding: 24, marginBottom: 24,
          }}>
            <h3 style={{ marginBottom: 16, fontSize: 14, color: "var(--text)" }}>Yeni Kullanıcı Ekle</h3>
            <form onSubmit={handleAddUser}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <label className="field">
                  <span className="field__lbl">Ad Soyad</span>
                  <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required placeholder="Ad Soyad" />
                </label>
                <label className="field">
                  <span className="field__lbl">E-posta</span>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="kullanici@softnox.com.tr" />
                </label>
                <label className="field">
                  <span className="field__lbl">Rol</span>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Süper Admin</option>
                  </select>
                </label>
              </div>
              <div style={{ padding: "8px 12px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 6, fontSize: 12, color: "#fbbf24", marginBottom: 8 }}>
                ⚠ Kullanıcı varsayılan şifre <strong>softnox</strong> ile oluşturulur. İlk girişte yeni şifre belirleme ekranı açılır.
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowForm(false)}>İptal</button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
                  {saving ? "Ekleniyor..." : "Kullanıcı Ekle"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Kullanıcı tablosu */}
        <div className="crm-table-wrap">
          <div className="crm-table-scroll">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>E-posta</th>
                  <th>Rol</th>
                  <th>Kayıt Tarihi</th>
                  <th>İşlemler</th>

                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-mute)", padding: 32 }}>Yükleniyor...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-mute)", padding: 32 }}>Kullanıcı bulunamadı.</td></tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.full_name || "—"}</strong></td>
                    <td className="mono dim">{u.email}</td>
                    <td>
                      <span style={{ ...roleBadge(u.role), padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="mono dim">{new Date(u.created_at).toLocaleDateString("tr-TR")}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleResetPassword(u)}
                          style={{
                            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
                            color: "#60a5fa", borderRadius: 6, padding: "4px 10px", fontSize: 11,
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          🔑 Şifre Sıfırla
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          style={{
                            background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.3)",
                            color: "#94a3b8", borderRadius: 6, padding: "4px 10px", fontSize: 11,
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          ✏ Düzenle
                        </button>
                        <button
                          onClick={() => handleSendInitialLink(u)}
                          style={{
                            background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)",
                            color: "#fbbf24", borderRadius: 6, padding: "4px 10px", fontSize: 11,
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          ✉ İlk Giriş Linki
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Düzenleme Modalı */}
      {editUser && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeEdit(); }}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal__head">
              <h2 className="modal__title">Kullanıcıyı Düzenle</h2>
              <button className="modal__close" onClick={closeEdit}>✕</button>
            </div>
            <form onSubmit={handleEditSave}>
              <div className="modal__body">
                <div style={{ marginBottom: 12, fontSize: 12, color: "var(--text-mute)", fontFamily: "var(--font-mono)" }}>
                  {editUser.email}
                </div>
                <label className="field">
                  <span className="field__lbl">Ad Soyad</span>
                  <input
                    value={editForm.full_name}
                    onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                    required
                    placeholder="Ad Soyad"
                    autoFocus
                  />
                </label>
                <label className="field" style={{ marginTop: 12 }}>
                  <span className="field__lbl">Rol</span>
                  <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Süper Admin</option>
                  </select>
                </label>
              </div>
              <div className="modal__foot">
                <button type="button" className="btn btn--ghost btn--sm" onClick={closeEdit}>İptal</button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={editSaving}>
                  {editSaving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
