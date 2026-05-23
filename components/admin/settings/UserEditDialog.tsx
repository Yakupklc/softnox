"use client";
import { useState, FormEvent, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface UserEditValues {
  full_name: string;
  role: "admin" | "super_admin";
}

export interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "super_admin";
}

export interface UserEditDialogProps {
  open: boolean;
  user: UserRow | null;
  onClose: () => void;
  onSave: (id: string, values: UserEditValues) => Promise<void>;
}

export function UserEditDialog({ open, user, onClose, onSave }: UserEditDialogProps) {
  const [values, setValues] = useState<UserEditValues>({ full_name: "", role: "admin" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) { setValues({ full_name: user.full_name, role: user.role }); setError(null); }
  }, [open, user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null); setBusy(true);
    try {
      await onSave(user.id, values);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Güncellenemedi");
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : onClose}
      title="Kullanıcıyı Düzenle"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Vazgeç</Button>
          <Button variant="primary" form="user-edit-form" type="submit" loading={busy}>Kaydet</Button>
        </>
      }
    >
      <div style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", color: "var(--text-dim)", marginBottom: "var(--space-4)" }}>
        {user.email}
      </div>
      <form id="user-edit-form" onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }} noValidate>
        <Input label="Ad Soyad" required value={values.full_name} onChange={e => setValues(v => ({ ...v, full_name: e.target.value }))} />
        <Select label="Rol" value={values.role} onChange={e => setValues(v => ({ ...v, role: e.target.value as "admin" | "super_admin" }))}>
          <option value="admin">Admin</option>
          <option value="super_admin">Süper Admin</option>
        </Select>
        {error && <div role="alert" style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>{error}</div>}
      </form>
    </Dialog>
  );
}
