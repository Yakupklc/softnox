"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const QUICK_LINKS = {
  google: "https://maps.google.com/?q=Softnox",
  website: "https://softnox.com.tr",
  email: "info@softnox.com.tr",
};

function QuickLinks() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(QUICK_LINKS.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const linkStyle = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "5px 12px", borderRadius: 7,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--border)",
    color: "var(--text-dim)", fontSize: 12,
    textDecoration: "none", transition: "all 0.2s",
    fontFamily: "var(--font-mono)",
  } as React.CSSProperties;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      padding: "8px 28px",
      borderBottom: "1px solid var(--border)",
      background: "rgba(0,0,0,0.15)",
    }}>
      <a href={QUICK_LINKS.google} target="_blank" rel="noopener noreferrer" style={linkStyle}
        onMouseOver={e => (e.currentTarget.style.color = "#34d399")}
        onMouseOut={e => (e.currentTarget.style.color = "var(--text-dim)")}>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        Google Maps
      </a>

      <div style={{ width: 1, height: 16, background: "var(--border)" }} />

      <a href={QUICK_LINKS.website} target="_blank" rel="noopener noreferrer" style={linkStyle}
        onMouseOver={e => (e.currentTarget.style.color = "#60a5fa")}
        onMouseOut={e => (e.currentTarget.style.color = "var(--text-dim)")}>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/>
        </svg>
        softnox.com.tr
      </a>

      <div style={{ width: 1, height: 16, background: "var(--border)" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <a href={`mailto:${QUICK_LINKS.email}`} style={linkStyle}
          onMouseOver={e => (e.currentTarget.style.color = "#a78bfa")}
          onMouseOut={e => (e.currentTarget.style.color = "var(--text-dim)")}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>
          </svg>
          {QUICK_LINKS.email}
        </a>
        <button onClick={copy} title="Kopyala" style={{
          background: "none", border: "1px solid var(--border)",
          borderRadius: 6, padding: "4px 8px", cursor: "pointer",
          color: copied ? "#34d399" : "var(--text-mute)", fontSize: 11,
          transition: "all 0.2s", fontFamily: "var(--font-mono)",
        }}>
          {copied ? "✓" : (
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

/* ===== Types ===== */
interface Profile { full_name: string; role?: string; }
interface Contact {
  id: string;
  sirket_adi: string;
  sahip_adi: string;
  telefon?: string;
  email?: string;
  website_url?: string;
  google_maps_url?: string;
  not_kismi?: string;
  alinan_ucret?: number;
  anlasilan_ucret?: number;
  iletisim_tarihi?: string;
  sonuc?: string;
  yapilan_isler?: string;
  sozlesme_url?: string;
  created_at: string;
}
type SonucType = "Beklemede" | "Olumlu" | "Olumsuz" | "Devam Ediyor";

const EMPTY_FORM = {
  sirket_adi: "", sahip_adi: "", telefon: "+90 ", email: "",
  website_url: "", google_maps_url: "", not_kismi: "",
  alinan_ucret: "", anlasilan_ucret: "", iletisim_tarihi: new Date().toISOString().split("T")[0],
  sonuc: "Beklemede" as SonucType, yapilan_isler: "", sozlesme_url: "",
};

/* ===== Helpers ===== */
const fmt = (n?: number) => n != null ? `₺${n.toLocaleString("tr-TR")}` : "—";
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("tr-TR") : "—";

/* ===== Logo ===== */
const Logo = () => (
  <div className="logo">
    <svg width={24} height={24} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="lg-admin" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="#22d3ee" /><stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M16 2 L29 9 L29 23 L16 30 L3 23 L3 9 Z" stroke="url(#lg-admin)" strokeWidth="1.5" fill="none" />
      <path d="M11 12 Q11 10 13 10 L19 10 Q21 10 21 12 Q21 14 19 14 L13 14 Q11 14 11 16 Q11 18 13 18 L19 18 Q21 18 21 20 Q21 22 19 22 L13 22 Q11 22 11 20" stroke="url(#lg-admin)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="logo-text">softnox</span>
  </div>
);

const EditIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
function PhoneContact({ telefon }: { telefon: string }) {
  const [open, setOpen] = useState(false);
  const clean = telefon.replace(/\D/g, "");
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, color: "#fbbf24", fontSize: 12 }}>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        {telefon}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9998 }} />
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 4px", display: "flex", flexDirection: "column", gap: 4, minWidth: 140, boxShadow: "0 8px 24px #0008" }}>
            <a href={`tel:${clean}`} onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, color: "#fbbf24", fontSize: 12, textDecoration: "none", background: "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Telefon Et
            </a>
            <a href={`https://wa.me/${clean}`} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, color: "#4ade80", fontSize: 12, textDecoration: "none", background: "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
        </>
      )}
    </div>
  );
}

const PdfIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);
const PlusIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const CloseIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const LogoutIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* ===== Field ===== */
const FormField = ({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) => (
  <label className="field">
    <span className="field__lbl">{label}{optional && <em> (opsiyonel)</em>}</span>
    {children}
  </label>
);

/* ===== Contact Modal ===== */
function ContactModal({
  contact,
  onClose,
  onSave,
}: {
  contact: Partial<Contact> | null;
  onClose: () => void;
  onSave: (data: any, file?: File) => Promise<void>;
}) {
  const isNew = !contact?.id;
  const [form, setForm] = useState({
    sirket_adi: contact?.sirket_adi ?? "",
    sahip_adi: contact?.sahip_adi ?? "",
    telefon: contact?.telefon || "+90 ",
    email: contact?.email ?? "",
    website_url: contact?.website_url ?? "",
    google_maps_url: contact?.google_maps_url ?? "",
    not_kismi: contact?.not_kismi ?? "",
    alinan_ucret: contact?.alinan_ucret != null ? String(contact.alinan_ucret) : "",
    anlasilan_ucret: contact?.anlasilan_ucret != null ? String(contact.anlasilan_ucret) : "",
    iletisim_tarihi: contact?.iletisim_tarihi ?? "",
    sonuc: (contact?.sonuc ?? "Beklemede") as SonucType,
    yapilan_isler: contact?.yapilan_isler ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sirket_adi.trim() || !form.sahip_adi.trim()) return;
    setSaving(true);
    await onSave({
      ...form,
      alinan_ucret: form.alinan_ucret ? parseFloat(form.alinan_ucret) : null,
      anlasilan_ucret: form.anlasilan_ucret ? parseFloat(form.anlasilan_ucret) : null,
      iletisim_tarihi: form.iletisim_tarihi || null,
    }, file ?? undefined);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal__head">
          <h2 className="modal__title">{isNew ? "Yeni Kayıt Ekle" : "Kaydı Düzenle"}</h2>
          <button className="modal__close" onClick={onClose}><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <p className="modal__section-title">Firma Bilgileri</p>
            <div className="modal__grid">
              <FormField label="Şirket Adı">
                <input value={form.sirket_adi} onChange={e => set("sirket_adi", e.target.value)} required placeholder="Örn: ABC Teknoloji A.Ş." />
              </FormField>
              <FormField label="Sahip / Yetkili">
                <input value={form.sahip_adi} onChange={e => set("sahip_adi", e.target.value)} required placeholder="Ad Soyad" />
              </FormField>
              <FormField label="Telefon" optional>
                <input value={form.telefon} onChange={e => set("telefon", e.target.value)} placeholder="+90 5__ ___ __ __" />
              </FormField>
              <FormField label="E-posta" optional>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="ornek@firma.com" />
              </FormField>
              <FormField label="İletişim Tarihi" optional>
                <input type="date" value={form.iletisim_tarihi} onChange={e => set("iletisim_tarihi", e.target.value)} />
              </FormField>
              <FormField label="Web Sitesi" optional>
                <input value={form.website_url} onChange={e => set("website_url", e.target.value)} placeholder="https://firma.com" />
              </FormField>
              <FormField label="Google Maps Linki" optional>
                <input value={form.google_maps_url} onChange={e => set("google_maps_url", e.target.value)} placeholder="https://maps.google.com/..." />
              </FormField>
            </div>

            <p className="modal__section-title">Finansal Bilgiler</p>
            <div className="modal__grid">
              <FormField label="Alınan Ücret (₺)" optional>
                <input type="number" min="0" step="0.01" value={form.alinan_ucret} onChange={e => set("alinan_ucret", e.target.value)} placeholder="0.00" />
              </FormField>
              <FormField label="Anlaşılan Ücret (₺)" optional>
                <input type="number" min="0" step="0.01" value={form.anlasilan_ucret} onChange={e => set("anlasilan_ucret", e.target.value)} placeholder="0.00" />
              </FormField>
              <FormField label="Sonuç">
                <select value={form.sonuc} onChange={e => set("sonuc", e.target.value)}>
                  <option>Beklemede</option>
                  <option>Olumlu</option>
                  <option>Olumsuz</option>
                  <option>Devam Ediyor</option>
                </select>
              </FormField>
            </div>

            <p className="modal__section-title">Notlar & İşler</p>
            <FormField label="Not" optional>
              <textarea rows={3} value={form.not_kismi} onChange={e => set("not_kismi", e.target.value)} placeholder="Genel notlar..." />
            </FormField>
            <FormField label="Yapılan İşler" optional>
              <textarea rows={3} value={form.yapilan_isler} onChange={e => set("yapilan_isler", e.target.value)} placeholder="Gerçekleştirilen işler, görüşmeler..." />
            </FormField>

            <p className="modal__section-title">Sözleşme</p>
            <div className="file-field">
              <span className="file-field__label">Sözleşme PDF{" "}<em style={{ fontSize: 11, color: "var(--text-mute)" }}>(opsiyonel)</em></span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="file-field__input"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              {contact?.sozlesme_url && !file && (
                <div className="file-field__current">
                  <PdfIcon /> Mevcut sözleşme yüklü —{" "}
                  <a href={contact.sozlesme_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-2)" }}>
                    Görüntüle
                  </a>
                </div>
              )}
              {file && <div className="file-field__current"><PdfIcon /> {file.name}</div>}
            </div>
          </div>

          <div className="modal__foot">
            <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>İptal</button>
            <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
              {saving ? "Kaydediliyor..." : isNew ? "Kayıt Ekle" : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===== Main CRM component ===== */
export default function AdminCRM({ profile, initialContacts }: { profile: Profile; initialContacts: Contact[] }) {
  const router = useRouter();
  const isSuperAdmin = profile.role === "super_admin";
  const supabase = createClient();
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; contact: Partial<Contact> | null }>({ open: false, contact: null });

  const initials = profile.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const filtered = useMemo(() =>
    contacts.filter(c =>
      c.sirket_adi.toLowerCase().includes(search.toLowerCase()) ||
      c.sahip_adi.toLowerCase().includes(search.toLowerCase()) ||
      (c.telefon ?? "").includes(search)
    ), [contacts, search]);

  const stats = useMemo(() => ({
    total: contacts.length,
    olumlu: contacts.filter(c => c.sonuc === "Olumlu").length,
    devam: contacts.filter(c => c.sonuc === "Devam Ediyor").length,
    beklemede: contacts.filter(c => c.sonuc === "Beklemede").length,
  }), [contacts]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const openNew = () => setModal({ open: true, contact: null });
  const openEdit = (c: Contact) => setModal({ open: true, contact: c });
  const closeModal = () => setModal({ open: false, contact: null });

  const handleSave = async (formData: any, file?: File) => {
    const isNew = !modal.contact?.id;
    let sozlesme_url = modal.contact?.sozlesme_url ?? null;

    if (file) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { data: up } = await supabase.storage.from("contracts").upload(path, file);
      if (up) {
        const { data: signed } = await supabase.storage.from("contracts").createSignedUrl(path, 60 * 60 * 24 * 365);
        sozlesme_url = signed?.signedUrl ?? null;
      }
    }

    const payload = {
      ...formData,
      telefon: formData.telefon?.trim() === "+90" || formData.telefon?.trim() === "+90 " ? "" : formData.telefon,
      sozlesme_url,
    };

    if (isNew) {
      const { data, error } = await supabase.from("contacts").insert(payload).select().single();
      if (!error && data) setContacts(prev => [data, ...prev]);
    } else {
      const { data, error } = await supabase.from("contacts").update(payload).eq("id", modal.contact!.id).select().single();
      if (!error && data) setContacts(prev => prev.map(c => c.id === data.id ? data : c));
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (!error) setContacts(prev => prev.filter(c => c.id !== id));
  };

  const badgeClass = (sonuc?: string) => {
    if (sonuc === "Olumlu") return "crm-badge crm-badge--Olumlu";
    if (sonuc === "Olumsuz") return "crm-badge crm-badge--Olumsuz";
    if (sonuc === "Devam Ediyor") return "crm-badge crm-badge--Devam";
    return "crm-badge crm-badge--Beklemede";
  };

  return (
    <div className="admin-shell">
      {/* Topbar */}
      <div className="admin-topbar">
        <Logo />
        <div style={{ height: 24, width: 1, background: "var(--border)", margin: "0 4px" }} />
        <span style={{ fontSize: 12, color: "var(--text-mute)", fontFamily: "var(--font-mono)" }}>CRM</span>

        <div className="admin-topbar__right">
          <div className="admin-topbar__user">
            <div className="admin-topbar__avatar">{initials}</div>
            <div className="admin-topbar__info">
              <span className="admin-topbar__name">{profile.full_name}</span>
              <span className="admin-topbar__role">{profile.role === "super_admin" ? "Süper Admin" : "Admin"}</span>
            </div>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => router.push("/admin/settings")}
              style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-mute)", borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer" }}
            >
              ⚙ Ayarlar
            </button>
          )}
          <button className="admin-topbar__logout" onClick={handleLogout}>
            <LogoutIcon /> Çıkış
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-page-head">
          <div>
            <h1 className="admin-page-title">Potansiyel Müşteriler</h1>
            <p className="admin-page-sub">İletişime geçilen kişi ve firmaların takibi</p>
          </div>
          <button className="btn btn--primary btn--sm" onClick={openNew}>
            <PlusIcon /> Yeni Kayıt
          </button>
        </div>

        {/* Stats */}
        <div className="crm-stats">
          <div className="crm-stat">
            <div className="crm-stat__label">Toplam Kayıt</div>
            <div className="crm-stat__val">{stats.total}</div>
          </div>
          <div className="crm-stat">
            <div className="crm-stat__label">Olumlu</div>
            <div className="crm-stat__val" style={{ color: "#34d399" }}>{stats.olumlu}</div>
          </div>
          <div className="crm-stat">
            <div className="crm-stat__label">Devam Eden</div>
            <div className="crm-stat__val" style={{ color: "#60a5fa" }}>{stats.devam}</div>
          </div>
          <div className="crm-stat">
            <div className="crm-stat__label">Beklemede</div>
            <div className="crm-stat__val" style={{ color: "#fbbf24" }}>{stats.beklemede}</div>
          </div>
        </div>

        {/* Table */}
        <div className="crm-table-wrap">
          <div className="crm-table-toolbar">
            <input
              className="crm-search"
              placeholder="Şirket adı, sahip veya telefon ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span style={{ fontSize: 12, color: "var(--text-mute)", whiteSpace: "nowrap" }}>
              {filtered.length} kayıt
            </span>
          </div>

          <div className="crm-table-scroll">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Şirket Adı</th>
                  <th>Sahip</th>
                  <th>İletişim</th>
                  <th>Tarih</th>
                  <th>Alınan Ücret</th>
                  <th>Anlaşılan Ücret</th>
                  <th>Sonuç</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="crm-empty">
                        <div className="crm-empty__icon">📋</div>
                        <div className="crm-empty__text">
                          {search ? "Arama sonucu bulunamadı." : "Henüz kayıt yok. Yeni kayıt ekleyin."}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.sirket_adi}</strong></td>
                    <td className="dim">{c.sahip_adi}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {c.telefon && (
                          <PhoneContact telefon={c.telefon} />
                        )}
                        {c.google_maps_url && (
                          <a href={c.google_maps_url} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#34d399", fontSize: 12, textDecoration: "none" }}>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            Google Maps
                          </a>
                        )}
                        {c.website_url && (
                          <a href={/^https?:\/\//i.test(c.website_url) ? c.website_url : `https://${c.website_url}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#60a5fa", fontSize: 12, textDecoration: "none" }}>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>
                            {c.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          </a>
                        )}
                        {c.email && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <a href={`mailto:${c.email}`}
                              style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#a78bfa", fontSize: 12, textDecoration: "none" }}>
                              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                              {c.email}
                            </a>
                            <button onClick={() => navigator.clipboard.writeText(c.email!)} title="Kopyala"
                              style={{ background: "none", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 5px", cursor: "pointer", color: "var(--text-mute)", display: "flex", alignItems: "center" }}>
                              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            </button>
                          </div>
                        )}
                        {!c.telefon && !c.google_maps_url && !c.website_url && !c.email && <span style={{ color: "var(--text-mute)" }}>—</span>}
                      </div>
                    </td>
                    <td className="mono dim">{fmtDate(c.iletisim_tarihi)}</td>
                    <td className="mono">{fmt(c.alinan_ucret)}</td>
                    <td className="mono">{fmt(c.anlasilan_ucret)}</td>
                    <td>
                      <span className={badgeClass(c.sonuc)}>{c.sonuc ?? "Beklemede"}</span>
                    </td>
                    <td>
                      <div className="crm-actions">
                        {c.sozlesme_url && (
                          <a href={c.sozlesme_url} target="_blank" rel="noopener noreferrer">
                            <button className="crm-icon-btn crm-icon-btn--pdf" title="Sözleşmeyi görüntüle">
                              <PdfIcon />
                            </button>
                          </a>
                        )}
                        <button className="crm-icon-btn" title="Düzenle" onClick={() => openEdit(c)}>
                          <EditIcon />
                        </button>
                        <button className="crm-icon-btn crm-icon-btn--danger" title="Sil" onClick={() => handleDelete(c.id)}>
                          <TrashIcon />
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

      {/* Modal */}
      {modal.open && (
        <ContactModal
          contact={modal.contact}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
