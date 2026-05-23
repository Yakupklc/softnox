"use client";
import { ReactNode } from "react";
import { useIsMobile, useIsTablet } from "@/lib/hooks/useMediaQuery";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  mobileLabel?: string;
  render: (row: T) => ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
  hideOn?: "mobile" | "tablet" | "none";
  hideOnMobileCard?: boolean;
  primary?: boolean;
  status?: boolean;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  selectedKey?: string;
  ariaLabel?: string;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  loading,
  empty,
  onRowClick,
  selectedKey,
  ariaLabel,
}: DataTableProps<T>) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (loading) {
    return (
      <div className="ui-table-wrap" aria-busy="true">
        <div style={{ padding: "var(--space-4)" }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ marginBottom: 12 }}>
              <Skeleton height={20} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return <>{empty ?? <EmptyState title="Kayıt bulunamadı" />}</>;
  }

  if (isMobile) {
    const primaryCol = columns.find(c => c.primary) ?? columns[0];
    const statusCol = columns.find(c => c.status);
    const metaCols = columns.filter(c => c !== primaryCol && c !== statusCol && !c.hideOnMobileCard);

    return (
      <ul className="ui-cardlist" aria-label={ariaLabel}>
        {rows.map(row => (
          <li
            key={rowKey(row)}
            className="ui-cardlist__item"
            onClick={() => onRowClick?.(row)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRowClick?.(row); } }}
            tabIndex={0}
            role="button"
            aria-selected={selectedKey === rowKey(row) || undefined}
          >
            <div className="ui-cardlist__head">
              <div className="ui-cardlist__title">{primaryCol.render(row)}</div>
              {statusCol && <div>{statusCol.render(row)}</div>}
            </div>
            <div className="ui-cardlist__meta">
              {metaCols.map(col => (
                <div key={col.key} className="ui-cardlist__meta-row">
                  <span className="ui-cardlist__meta-label">{col.mobileLabel ?? col.header}</span>
                  <span>{col.render(row)}</span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  const visibleCols = columns.filter(c => {
    if (isTablet && c.hideOn === "tablet") return false;
    if (c.hideOn === "mobile" && (isMobile || isTablet)) return false;
    return true;
  });

  return (
    <div className="ui-table-wrap" role="region" aria-label={ariaLabel}>
      <table className="ui-table">
        <thead>
          <tr>
            {visibleCols.map(col => (
              <th
                key={col.key}
                style={{
                  width: col.width,
                  textAlign: col.align ?? "left",
                }}
                scope="col"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(e) => { if (e.key === "Enter") onRowClick?.(row); }}
              tabIndex={0}
              aria-selected={selectedKey === rowKey(row) || undefined}
            >
              {visibleCols.map(col => (
                <td
                  key={col.key}
                  style={{ textAlign: col.align ?? "left" }}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
