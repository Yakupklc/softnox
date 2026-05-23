"use client";
import { createContext, ReactNode, useCallback, useMemo, useRef, useState } from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastInput {
  variant?: ToastVariant;
  title?: string;
  body: ReactNode;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

export interface ToastItem extends ToastInput {
  id: string;
  leaving?: boolean;
}

interface ToastApi {
  show: (input: ToastInput) => string;
  success: (body: ReactNode, opts?: Partial<ToastInput>) => string;
  error: (body: ReactNode, opts?: Partial<ToastInput>) => string;
  info: (body: ReactNode, opts?: Partial<ToastInput>) => string;
  warning: (body: ReactNode, opts?: Partial<ToastInput>) => string;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

const Icons = {
  success: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  error:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  info:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  warning: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setItems(list => list.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => {
      setItems(list => list.filter(t => t.id !== id));
    }, 200);
  }, []);

  const show = useCallback((input: ToastInput) => {
    counter.current += 1;
    const id = `toast-${counter.current}`;
    const variant = input.variant ?? "info";
    const duration = input.duration ?? 4000;
    setItems(list => [...list, { ...input, id, variant }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api: ToastApi = useMemo(() => ({
    show,
    success: (body, opts) => show({ ...opts, body, variant: "success" }),
    error:   (body, opts) => show({ ...opts, body, variant: "error" }),
    info:    (body, opts) => show({ ...opts, body, variant: "info" }),
    warning: (body, opts) => show({ ...opts, body, variant: "warning" }),
    dismiss,
  }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="ui-toast-region" aria-live="polite" aria-atomic="false">
        {items.map(item => {
          const v = item.variant ?? "info";
          const role = v === "error" ? "alert" : "status";
          return (
            <div
              key={item.id}
              className={`ui-toast ui-toast--${v}${item.leaving ? " ui-toast--leaving" : ""}`}
              role={role}
            >
              <div className="ui-toast__icon">{Icons[v]}</div>
              <div className="ui-toast__body">
                {item.title && <div style={{ fontWeight: 500, marginBottom: 2 }}>{item.title}</div>}
                {item.body}
                {item.action && (
                  <button
                    type="button"
                    onClick={item.action.onClick}
                    style={{
                      marginTop: 6, background: "none", border: "none",
                      color: "var(--accent)", cursor: "pointer", padding: 0,
                      font: "inherit", textDecoration: "underline",
                    }}
                  >
                    {item.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                className="ui-toast__close"
                aria-label="Bildirimi kapat"
                onClick={() => dismiss(item.id)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
