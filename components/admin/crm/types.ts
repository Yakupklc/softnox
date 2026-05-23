export interface Contact {
  id: string;
  sirket_adi: string;
  sahip_adi: string | null;
  telefon: string | null;
  email: string | null;
  website_url: string | null;
  google_maps_url: string | null;
  not_kismi: string | null;
  alinan_ucret: number | null;
  alinan_para_birimi: string | null;
  anlasilan_ucret: number | null;
  anlasilan_para_birimi: string | null;
  kalan_ucret: number | null;
  kalan_para_birimi: string | null;
  iletisim_tarihi: string | null;
  sonuc: string | null;
  yapilan_isler: string | null;
  sozlesme_url: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactLogEntry {
  id: string;
  contact_id: string;
  user_name: string | null;
  action: string;
  changes: Record<string, { from: unknown; to: unknown; label?: string }> | null;
  created_at: string;
}

export type ContactFormValues = Omit<Contact, "id" | "user_id" | "created_at" | "updated_at">;
