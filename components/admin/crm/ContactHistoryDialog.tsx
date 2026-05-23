"use client";
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/hooks/useToast";
import type { Contact } from "./types";

interface HistoryRow {
  id: string;
  user_name: string | null;
  action: string;
  changes: Record<string, { eski: string; yeni: string }> | null;
  created_at: string;
}

function fmtDate(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("tr-TR") + " · " + dt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function fmtValue(v: unknown): string {
  if (v == null || v === "") return "—";
  return String(v);
}

export interface ContactHistoryDialogProps {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
}

export function ContactHistoryDialog({ contact, open, onClose }: ContactHistoryDialogProps) {
  const supabase = createClient();
  const toast = useToast();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !contact) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from("contact_logs")
      .select("id, user_name, action, changes, created_at")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (cancelled) return;
        setLoading(false);
        if (error) {
          toast.error("Geçmiş yüklenemedi: " + error.message);
          return;
        }
        setRows((data ?? []) as HistoryRow[]);
      });
    return () => { cancelled = true; };
  }, [open, contact, supabase, toast]);

  if (!contact) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Geçmiş"
      description={contact.sirket_adi}
      size="md"
    >
      {loading && rows.length === 0 ? (
        <div className="ui-audit-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="ui-audit-item">
              <Skeleton height={16} style={{ marginBottom: 8 }} />
              <Skeleton height={48} />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="Henüz değişiklik yok" body="Bu kayıtta yapılan ilk değişiklik burada görünecek" />
      ) : (
        <ul className="ui-audit-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {rows.map(row => (
            <li key={row.id} className="ui-audit-item">
              <div className="ui-audit-item__head">
                <div>
                  <span className="ui-audit-item__who">{row.user_name ?? "Sistem"}</span>
                  <span className="ui-audit-item__what"> · {row.action}</span>
                </div>
                <span className="ui-audit-item__when">{fmtDate(row.created_at)}</span>
              </div>
              {row.changes && Object.keys(row.changes).length > 0 && (
                <div className="ui-audit-diff">
                  {Object.entries(row.changes).map(([label, diff]) => (
                    <div key={label} style={{ display: "contents" }}>
                      <span className="ui-audit-diff__label">{label}</span>
                      <span>
                        <span className="ui-audit-diff__from">{fmtValue(diff.eski)}</span>
                        <span className="ui-audit-diff__arrow">→</span>
                        <span className="ui-audit-diff__to">{fmtValue(diff.yeni)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
