"use client";
import { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "./Logo";
import { createClient } from "@/lib/supabase/client";

export interface AdminShellProps {
  user: { id: string; full_name: string; role: "admin" | "super_admin"; email: string | null };
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: "/admin", label: "CRM", match: (p: string) => p === "/admin" },
  { href: "/admin/settings", label: "Ayarlar", match: (p: string) => p.startsWith("/admin/settings") },
];

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    function onClick(e: MouseEvent) {
      if (!drawerRef.current?.contains(e.target as Node)) setDrawerOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [drawerOpen]);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <div className="ui-app-shell">
      <a href="#main" className="ui-skip-link">İçeriğe atla</a>
      <header className="ui-topbar">
        <div className="ui-topbar__inner">
          <div className="ui-topbar__left">
            <Link href="/admin" aria-label="Ana sayfa" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--text)" }}>
              <Logo />
              <span style={{ fontWeight: 600, letterSpacing: "-0.01em" }}>softnox</span>
            </Link>
            <nav className="ui-topbar__nav" aria-label="Ana navigasyon">
              {NAV_ITEMS.map(item => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={"ui-topbar__link" + (active ? " ui-topbar__link--active" : "")}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="ui-topbar__right">
            <div className="ui-user-menu" ref={menuRef}>
              <button
                type="button"
                className="ui-user-menu__trigger"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(v => !v)}
              >
                <Avatar name={user.full_name || "?"} size="sm" />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{user.full_name}</span>
              </button>
              {menuOpen && (
                <div className="ui-user-menu__panel" role="menu">
                  <Link href="/admin/settings/profile" className="ui-user-menu__item" role="menuitem">
                    Profil
                  </Link>
                  <div className="ui-user-menu__divider" />
                  <button type="button" className="ui-user-menu__item" role="menuitem" onClick={handleLogout}>
                    Çıkış
                  </button>
                </div>
              )}
            </div>
            <div ref={drawerRef} style={{ position: "relative" }}>
              <button
                type="button"
                className="ui-mobile-trigger"
                aria-label={drawerOpen ? "Menüyü kapat" : "Menüyü aç"}
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(v => !v)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {drawerOpen
                    ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                    : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
                </svg>
              </button>
              {drawerOpen && (
                <div className="ui-mobile-drawer">
                  <nav className="ui-mobile-drawer__nav" aria-label="Ana navigasyon">
                    {NAV_ITEMS.map(item => {
                      const active = item.match(pathname);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={"ui-mobile-drawer__link" + (active ? " ui-mobile-drawer__link--active" : "")}
                          aria-current={active ? "page" : undefined}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="ui-app-main">{children}</main>
    </div>
  );
}
