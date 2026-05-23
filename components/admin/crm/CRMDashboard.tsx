"use client";
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/lib/hooks/useToast";
import { createClient } from "@/lib/supabase/client";
import { StatCard } from "./StatCard";
import { ContactDetailSheet } from "./ContactDetailSheet";
import { ContactFormDialog } from "./ContactFormDialog";
import { WelcomeToast } from "@/components/admin/WelcomeToast";
import type { Contact, ContactFormValues } from "./types";

const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

interface CRMDashboardProps {
  initialContacts: Contact[];
  userName: string;
}

export function CRMDashboard({ initialContacts, userName }: CRMDashboardProps) {
  const supabase = createClient();
  const toast = useToast();

  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<Contact | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Contact | null>(null);

  const stats = useMemo(() => {
    const by = (key: string) => contacts.filter(c => c.sonuc === key).length;
    return {
      total: contacts.length,
      olumlu: by("Olumlu"),
      devam: by("Devam Ediyor"),
      bekleme: by("Beklemede"),
    };
  }, [contacts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c =>
      c.sirket_adi.toLowerCase().includes(q) ||
      (c.sahip_adi?.toLowerCase().includes(q) ?? false) ||
      (c.telefon?.toLowerCase().includes(q) ?? false) ||
      (c.email?.toLowerCase().includes(q) ?? false)
    );
  }, [contacts, query]);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setContacts(data as Contact[]);
  }, [supabase]);

  async function handleSave(values: ContactFormValues, id: string | null) {
    if (id) {
      const { error } = await supabase.from("contacts").update(values).eq("id", id);
      if (error) throw new Error(error.message);
      toast.success("Müşteri güncellendi");
    } else {
      const { error } = await supabase.from("contacts").insert(values);
      if (error) throw new Error(error.message);
      toast.success("Müşteri eklendi");
    }
    await refresh();
  }

  async function handleDelete(c: Contact) {
    const prev = contacts;
    setContacts(list => list.filter(x => x.id !== c.id));
    setDetailOpen(false);
    const { error } = await supabase.from("contacts").delete().eq("id", c.id);
    if (error) {
      setContacts(prev);
      toast.error("Silinemedi: " + error.message);
    } else {
      toast.success("Silindi");
    }
  }

  const columns: DataTableColumn<Contact>[] = [
    { key: "sirket_adi", header: "Şirket", mobileLabel: "Şirket", render: r => <span style={{ fontWeight: 500 }}>{r.sirket_adi}</span>, primary: true },
    { key: "sahip", header: "Sahip", mobileLabel: "Sahip", render: r => r.sahip_adi ?? "—" },
    { key: "telefon", header: "Telefon", mobileLabel: "Telefon", render: r => r.telefon ?? "—" },
    { key: "tarih", header: "Tarih", mobileLabel: "Tarih", render: r => r.iletisim_tarihi ? new Date(r.iletisim_tarihi).toLocaleDateString("tr-TR") : "—", hideOnMobileCard: true },
    { key: "sonuc", header: "Durum", render: r => <StatusBadge sonuc={r.sonuc ?? "Beklemede"} />, status: true, width: "140px" },
  ];

  return (
    <>
      <WelcomeToast name={userName} />

      <div className="ui-page-head">
        <div>
          <h1 className="ui-page-head__title">Müşteri Listesi</h1>
          <p className="ui-page-head__sub">İletişime geçilen kişi ve firmaların takibi</p>
        </div>
        <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => { setFormInitial(null); setFormOpen(true); }}>
          Yeni Kayıt
        </Button>
      </div>

      <div className="ui-stat-grid">
        <StatCard label="Toplam Kayıt" value={stats.total} icon={<span style={{fontSize:14}}>∑</span>} tone="neutral" />
        <StatCard label="Olumlu" value={stats.olumlu} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>} tone="success" />
        <StatCard label="Devam Eden" value={stats.devam} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} tone="info" />
        <StatCard label="Beklemede" value={stats.bekleme} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>} tone="warning" />
      </div>

      <div className="ui-search-bar">
        <span className="ui-search-bar__icon"><SearchIcon /></span>
        <Input
          aria-label="Müşteri ara"
          placeholder="Şirket adı, sahip veya telefon ara…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <DataTable<Contact>
        rows={filtered}
        columns={columns}
        rowKey={r => r.id}
        ariaLabel="Müşteri tablosu"
        onRowClick={(r) => { setSelected(r); setDetailOpen(true); }}
        selectedKey={selected?.id}
        empty={
          query ? (
            <EmptyState
              title="Sonuç bulunamadı"
              body={`"${query}" aramasıyla eşleşen kayıt yok`}
              actions={<Button variant="secondary" onClick={() => setQuery("")}>Aramayı temizle</Button>}
            />
          ) : (
            <EmptyState
              title="Henüz kayıt yok"
              body="İlk müşteri kaydını oluştur, takip etmeye başla"
              actions={
                <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => { setFormInitial(null); setFormOpen(true); }}>
                  Yeni Kayıt
                </Button>
              }
            />
          )
        }
      />

      <ContactDetailSheet
        contact={selected}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={(c) => { setFormInitial(c); setFormOpen(true); setDetailOpen(false); }}
        onDelete={(c) => setConfirmDelete(c)}
        onHistory={() => { /* History view lives in /admin/settings/audit */ }}
      />

      <ContactFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initial={formInitial}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => { if (confirmDelete) await handleDelete(confirmDelete); }}
        title="Müşteriyi sil"
        description={confirmDelete ? <>“{confirmDelete.sirket_adi}” silinecek. Bu işlem geri alınamaz.</> : null}
        confirmLabel="Sil"
        destructive
      />
    </>
  );
}
