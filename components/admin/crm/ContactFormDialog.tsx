"use client";
import { useState, FormEvent, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import type { Contact, ContactFormValues } from "./types";

export interface ContactFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: ContactFormValues, id: string | null) => Promise<void>;
  initial?: Contact | null;
}

type Section = "general" | "finance" | "notes";

const CURRENCIES = ["₺", "$", "€"];
const SONUC = ["Beklemede", "Olumlu", "Olumsuz", "Devam Ediyor"];

function emptyValues(): ContactFormValues {
  return {
    sirket_adi: "",
    sahip_adi: "",
    telefon: "",
    email: "",
    website_url: "",
    google_maps_url: "",
    not_kismi: "",
    alinan_ucret: null,
    alinan_para_birimi: "₺",
    anlasilan_ucret: null,
    anlasilan_para_birimi: "₺",
    kalan_ucret: null,
    kalan_para_birimi: "₺",
    iletisim_tarihi: new Date().toISOString().slice(0, 10),
    sonuc: "Beklemede",
    yapilan_isler: "",
    sozlesme_url: "",
  };
}

export function ContactFormDialog({ open, onClose, onSave, initial }: ContactFormDialogProps) {
  const [section, setSection] = useState<Section>("general");
  const [values, setValues] = useState<ContactFormValues>(emptyValues());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSection("general");
      setError(null);
      if (initial) {
        const { id: _id, user_id: _u, created_at: _c, updated_at: _u2, ...rest } = initial;
        void _id; void _u; void _c; void _u2;
        setValues({ ...emptyValues(), ...rest });
      } else {
        setValues(emptyValues());
      }
    }
  }, [open, initial]);

  function set<K extends keyof ContactFormValues>(key: K, val: ContactFormValues[K]) {
    setValues(v => ({ ...v, [key]: val }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.sirket_adi.trim()) { setError("Şirket adı zorunlu."); setSection("general"); return; }
    setBusy(true);
    try {
      await onSave(values, initial?.id ?? null);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }

  const fieldStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" } as const;

  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : onClose}
      title={initial ? "Müşteriyi Düzenle" : "Yeni Müşteri"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Vazgeç</Button>
          <Button variant="primary" form="contact-form" type="submit" loading={busy}>
            {initial ? "Güncelle" : "Kaydet"}
          </Button>
        </>
      }
    >
      <form id="contact-form" onSubmit={onSubmit} noValidate>
        <Tabs<Section>
          value={section}
          onChange={setSection}
          items={[
            { value: "general", label: "Genel" },
            { value: "finance", label: "Mali" },
            { value: "notes",   label: "Notlar" },
          ]}
          ariaLabel="Form bölümleri"
        >
          <TabPanel value="general">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
              <div style={fieldStyle}>
                <Input label="Şirket Adı" required value={values.sirket_adi} onChange={e => set("sirket_adi", e.target.value)} />
                <Input label="Sahip / İlgili Kişi" value={values.sahip_adi ?? ""} onChange={e => set("sahip_adi", e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <Input label="Telefon" type="tel" value={values.telefon ?? ""} onChange={e => set("telefon", e.target.value)} placeholder="+90 ..." />
                <Input label="E-posta" type="email" value={values.email ?? ""} onChange={e => set("email", e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <Input label="Web Sitesi" type="url" value={values.website_url ?? ""} onChange={e => set("website_url", e.target.value)} placeholder="https://" />
                <Input label="Google Maps URL" type="url" value={values.google_maps_url ?? ""} onChange={e => set("google_maps_url", e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <Input label="İletişim Tarihi" type="date" value={values.iletisim_tarihi ?? ""} onChange={e => set("iletisim_tarihi", e.target.value)} />
                <Select label="Durum" value={values.sonuc ?? "Beklemede"} onChange={e => set("sonuc", e.target.value)}>
                  {SONUC.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="finance">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
              {(["anlasilan", "alinan", "kalan"] as const).map(field => {
                const amountKey = `${field}_ucret` as const;
                const currKey = `${field}_para_birimi` as const;
                const labels = { anlasilan: "Anlaşılan Ücret", alinan: "Alınan Ücret", kalan: "Kalan Ücret" } as const;
                return (
                  <div key={field} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-3)" }}>
                    <Input
                      label={labels[field]}
                      type="number"
                      step="0.01"
                      value={values[amountKey] == null ? "" : String(values[amountKey])}
                      onChange={e => set(amountKey, e.target.value === "" ? null : Number(e.target.value))}
                    />
                    <Select label="Para Birimi" value={values[currKey] ?? "₺"} onChange={e => set(currKey, e.target.value)}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </div>
                );
              })}
              <Input label="Sözleşme URL" type="url" value={values.sozlesme_url ?? ""} onChange={e => set("sozlesme_url", e.target.value)} placeholder="https://" />
            </div>
          </TabPanel>

          <TabPanel value="notes">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
              <Textarea label="Yapılan İşler" value={values.yapilan_isler ?? ""} onChange={e => set("yapilan_isler", e.target.value)} rows={4} />
              <Textarea label="Not" value={values.not_kismi ?? ""} onChange={e => set("not_kismi", e.target.value)} rows={6} />
            </div>
          </TabPanel>
        </Tabs>

        {error && (
          <div role="alert" style={{ marginTop: "var(--space-4)", color: "var(--danger)", fontSize: "var(--text-sm)", background: "var(--danger-bg)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            {error}
          </div>
        )}
      </form>
    </Dialog>
  );
}
