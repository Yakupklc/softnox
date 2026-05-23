"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/lib/hooks/useToast";
import { UserFormDialog, type UserFormValues } from "./UserFormDialog";
import { UserEditDialog, type UserRow, type UserEditValues } from "./UserEditDialog";

const KeyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const PencilIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const MailIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

export function UsersPanel() {
  const toast = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [resetUser, setResetUser] = useState<UserRow | null>(null);
  const [forceUser, setForceUser] = useState<UserRow | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kullanıcılar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleCreate(v: UserFormValues) {
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
    if (!res.ok) throw new Error(await res.text());
    toast.success("Kullanıcı oluşturuldu");
    await refresh();
  }

  async function handleEdit(id: string, v: UserEditValues) {
    const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
    if (!res.ok) throw new Error(await res.text());
    toast.success("Kullanıcı güncellendi");
    await refresh();
  }

  async function handleReset(u: UserRow) {
    const res = await fetch(`/api/admin/users/${u.id}/reset-password`, { method: "POST" });
    if (!res.ok) { toast.error(await res.text()); return; }
    toast.success("Şifre sıfırlama bağlantısı gönderildi");
  }

  async function handleForce(u: UserRow) {
    const res = await fetch(`/api/admin/users/${u.id}/force-change`, { method: "POST" });
    if (!res.ok) { toast.error(await res.text()); return; }
    toast.success("Kullanıcı bir sonraki girişte yeni şifre belirleyecek");
  }

  const columns: DataTableColumn<UserRow>[] = [
    { key: "name", header: "Ad Soyad", mobileLabel: "Ad", render: r => <span style={{ fontWeight: 500 }}>{r.full_name || "—"}</span>, primary: true },
    { key: "email", header: "E-posta", mobileLabel: "E-posta", render: r => <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>{r.email}</span> },
    { key: "role", header: "Rol", render: r => <RoleBadge role={r.role} />, status: true, width: "140px" },
    { key: "actions", header: "İşlemler", mobileLabel: "Aksiyonlar", width: "200px", render: r => (
      <div style={{ display: "flex", gap: "var(--space-1)" }} onClick={e => e.stopPropagation()}>
        <Button variant="ghost" size="sm" iconOnly aria-label={`${r.full_name} için şifre sıfırla`} onClick={() => setResetUser(r)} title="Şifre Sıfırla"><KeyIcon /></Button>
        <Button variant="ghost" size="sm" iconOnly aria-label={`${r.full_name} düzenle`} onClick={() => setEditUser(r)} title="Düzenle"><PencilIcon /></Button>
        <Button variant="ghost" size="sm" iconOnly aria-label={`${r.full_name} için ilk giriş zorla`} onClick={() => setForceUser(r)} title="İlk Giriş"><MailIcon /></Button>
      </div>
    ) },
  ];

  return (
    <>
      <div className="ui-page-head">
        <div>
          <h1 className="ui-page-head__title">Kullanıcılar</h1>
          <p className="ui-page-head__sub">Admin kullanıcılarını yönet</p>
        </div>
        <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => setFormOpen(true)}>
          Yeni Kullanıcı
        </Button>
      </div>

      <DataTable<UserRow>
        rows={users}
        columns={columns}
        rowKey={r => r.id}
        loading={loading}
        ariaLabel="Kullanıcı tablosu"
        empty={
          <EmptyState
            title="Henüz kullanıcı yok"
            body="İlk admin kullanıcıyı oluştur"
            actions={<Button variant="primary" leftIcon={<PlusIcon />} onClick={() => setFormOpen(true)}>Yeni Kullanıcı</Button>}
          />
        }
      />

      <UserFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSave={handleCreate} />
      <UserEditDialog open={!!editUser} user={editUser} onClose={() => setEditUser(null)} onSave={handleEdit} />

      <ConfirmDialog
        open={!!resetUser}
        onClose={() => setResetUser(null)}
        onConfirm={async () => { if (resetUser) await handleReset(resetUser); }}
        title="Şifre sıfırlama bağlantısı gönder"
        description={resetUser ? <>{resetUser.email} adresine sıfırlama linki gönderilecek.</> : null}
        confirmLabel="Gönder"
      />

      <ConfirmDialog
        open={!!forceUser}
        onClose={() => setForceUser(null)}
        onConfirm={async () => { if (forceUser) await handleForce(forceUser); }}
        title="İlk giriş zorla"
        description={forceUser ? <>{forceUser.email} kullanıcısı bir sonraki girişte yeni şifre belirlemek zorunda kalacak.</> : null}
        confirmLabel="Onayla"
      />
    </>
  );
}
