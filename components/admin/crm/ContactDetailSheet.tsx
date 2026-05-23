"use client";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import type { Contact } from "./types";

export interface ContactDetailSheetProps {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
  onEdit: (c: Contact) => void;
  onDelete: (c: Contact) => void;
  onHistory: (c: Contact) => void;
}

function fmtCurrency(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return "—";
  const cur = currency ?? "₺";
  return `${cur} ${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2 }).format(amount)}`;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

export function ContactDetailSheet({ contact, open, onClose, onEdit, onDelete, onHistory }: ContactDetailSheetProps) {
  if (!contact) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={contact.sirket_adi}
      description={contact.sahip_adi ?? undefined}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={() => onHistory(contact)}>Geçmiş</Button>
          <Button variant="secondary" onClick={() => onEdit(contact)}>Düzenle</Button>
          <Button variant="danger" onClick={() => onDelete(contact)}>Sil</Button>
        </>
      }
    >
      <div style={{ marginBottom: "var(--space-4)" }}>
        <StatusBadge sonuc={contact.sonuc ?? "Beklemede"} />
      </div>

      <div className="ui-detail-section">
        <div className="ui-detail-section__head">İletişim</div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Telefon</span>
          <span className="ui-detail-row__value">
            {contact.telefon ? <a className="ui-detail-link" href={`tel:${contact.telefon}`}>{contact.telefon}</a> : "—"}
          </span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">E-posta</span>
          <span className="ui-detail-row__value">
            {contact.email ? <a className="ui-detail-link" href={`mailto:${contact.email}`}>{contact.email}</a> : "—"}
          </span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Web</span>
          <span className="ui-detail-row__value">
            {contact.website_url ? <a className="ui-detail-link" href={contact.website_url} target="_blank" rel="noreferrer">{contact.website_url}</a> : "—"}
          </span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Konum</span>
          <span className="ui-detail-row__value">
            {contact.google_maps_url ? <a className="ui-detail-link" href={contact.google_maps_url} target="_blank" rel="noreferrer">Haritada Gör</a> : "—"}
          </span>
        </div>
      </div>

      <div className="ui-detail-section">
        <div className="ui-detail-section__head">Mali</div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Anlaşılan</span>
          <span className="ui-detail-row__value">{fmtCurrency(contact.anlasilan_ucret, contact.anlasilan_para_birimi)}</span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Alınan</span>
          <span className="ui-detail-row__value">{fmtCurrency(contact.alinan_ucret, contact.alinan_para_birimi)}</span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Kalan</span>
          <span className="ui-detail-row__value">{fmtCurrency(contact.kalan_ucret, contact.kalan_para_birimi)}</span>
        </div>
      </div>

      <div className="ui-detail-section">
        <div className="ui-detail-section__head">Diğer</div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">İletişim Tarihi</span>
          <span className="ui-detail-row__value">{fmtDate(contact.iletisim_tarihi)}</span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Yapılan İşler</span>
          <span className="ui-detail-row__value" style={{ whiteSpace: "pre-wrap" }}>{contact.yapilan_isler || "—"}</span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Not</span>
          <span className="ui-detail-row__value" style={{ whiteSpace: "pre-wrap" }}>{contact.not_kismi || "—"}</span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Sözleşme</span>
          <span className="ui-detail-row__value">
            {contact.sozlesme_url ? <a className="ui-detail-link" href={contact.sozlesme_url} target="_blank" rel="noreferrer">Sözleşmeyi Aç</a> : "—"}
          </span>
        </div>
      </div>
    </Dialog>
  );
}
