"use client";
import { useState, FormEvent, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface UserFormValues {
  email: string;
  full_name: string;
  role: "admin" | "super_admin";
}

export interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: UserFormValues) => Promise<void>;
}

export function UserFormDialog({ open, onClose, onSave }: UserFormDialogProps) {
  const [values, setValues] = useState<UserFormValues>({ email: "", full_name: "", role: "admin" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setValues({ email: "", full_name: "", role: "admin" }); setError(null); }
  }, [open]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSave(values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kullanıcı oluşturulamadı");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : onClose}
      title="Yeni Kullanıcı"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Vazgeç</Button>
          <Button variant="primary" form="user-form" type="submit" loading={busy}>Oluştur</Button>
        </>
      }
    >
      <div style={{
        background: "var(--warning-bg)",
        border: "1px solid rgba(251,191,36,0.30)",
        borderRadius: "var(--radius-sm)",
        padding: "var(--space-3)",
        fontSize: "var(--text-sm)",
        color: "var(--warning)",
        marginBottom: "var(--space-4)",
      }}>
        ⚠ Kullanıcı varsayılan şifre <strong>softnox</strong> ile oluşturulur. İlk girişte yeni şifre belirleme ekranı açılır.
      </div>
      <form id="user-form" onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }} noValidate>
        <Input label="Ad Soyad" required value={values.full_name} onChange={e => setValues(v => ({ ...v, full_name: e.target.value }))} />
        <Input label="E-posta" type="email" required value={values.email} onChange={e => setValues(v => ({ ...v, email: e.target.value }))} />
        <Select label="Rol" value={values.role} onChange={e => setValues(v => ({ ...v, role: e.target.value as "admin" | "super_admin" }))}>
          <option value="admin">Admin</option>
          <option value="super_admin">Süper Admin</option>
        </Select>
        {error && (
          <div role="alert" style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>{error}</div>
        )}
      </form>
    </Dialog>
  );
}
