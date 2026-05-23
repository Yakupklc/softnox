"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/hooks/useToast";

type Range = "7d" | "30d" | "all";
const PAGE_SIZE = 50;

interface AuditRow {
  id: string;
  contact_id: string;
  user_name: string | null;
  action: string;
  changes: Record<string, { from: unknown; to: unknown; label?: string }> | null;
  created_at: string;
  contacts: { sirket_adi: string } | null;
}

function fmtDate(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("tr-TR") + " · " + dt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function fmtValue(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function AuditPanel() {
  const supabase = createClient();
  const toast = useToast();
  const [range, setRange] = useState<Range>("7d");
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = useCallback(async (p: number, r: Range) => {
    setLoading(true);
    let query = supabase
      .from("contact_logs")
      .select("id, contact_id, user_name, action, changes, created_at, contacts(sirket_adi)")
      .order("created_at", { ascending: false })
      .range(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE);

    if (r !== "all") {
      const days = r === "7d" ? 7 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", since);
    }

    const { data, error } = await query;
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    const items = (data ?? []) as unknown as AuditRow[];
    setHasMore(items.length > PAGE_SIZE);
    setRows(prev => p === 0 ? items.slice(0, PAGE_SIZE) : [...prev, ...items.slice(0, PAGE_SIZE)]);
  }, [supabase, toast]);

  useEffect(() => {
    setPage(0);
    fetchPage(0, range);
  }, [range, fetchPage]);

  return (
    <>
      <div className="ui-page-head">
        <div>
          <h1 className="ui-page-head__title">Aktivite Logu</h1>
          <p className="ui-page-head__sub">Müşteri kayıtlarındaki değişiklik geçmişi</p>
        </div>
      </div>

      <div className="ui-audit-filter">
        {(["7d", "30d", "all"] as Range[]).map(r => (
          <Button
            key={r}
            variant={range === r ? "primary" : "secondary"}
            size="sm"
            onClick={() => setRange(r)}
          >
            {r === "7d" ? "Son 7 gün" : r === "30d" ? "Son 30 gün" : "Tümü"}
          </Button>
        ))}
      </div>

      {loading && rows.length === 0 ? (
        <div className="ui-audit-list">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="ui-audit-item">
              <Skeleton height={16} style={{ marginBottom: 8 }} />
              <Skeleton height={48} />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="Bu aralıkta aktivite yok" body="Filtre aralığını değiştirebilirsin" />
      ) : (
        <ul className="ui-audit-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {rows.map(row => (
            <li key={row.id} className="ui-audit-item">
              <div className="ui-audit-item__head">
                <div>
                  <span className="ui-audit-item__who">{row.user_name ?? "Sistem"}</span>
                  <span className="ui-audit-item__what"> · {row.contacts?.sirket_adi ?? "—"} · {row.action}</span>
                </div>
                <span className="ui-audit-item__when">{fmtDate(row.created_at)}</span>
              </div>
              {row.changes && Object.keys(row.changes).length > 0 && (
                <div className="ui-audit-diff">
                  {Object.entries(row.changes).map(([field, diff]) => (
                    <div key={field} style={{ display: "contents" }}>
                      <span className="ui-audit-diff__label">{diff.label ?? field}</span>
                      <span>
                        <span className="ui-audit-diff__from">{fmtValue(diff.from)}</span>
                        <span className="ui-audit-diff__arrow">→</span>
                        <span className="ui-audit-diff__to">{fmtValue(diff.to)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
          {hasMore && (
            <li>
              <Button
                variant="secondary"
                block
                loading={loading}
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchPage(next, range);
                }}
              >
                Daha fazla göster
              </Button>
            </li>
          )}
        </ul>
      )}
    </>
  );
}
