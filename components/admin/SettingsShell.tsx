"use client";
import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/Tabs";
import { useIsMobile, useIsTablet } from "@/lib/hooks/useMediaQuery";

export interface SettingsNavItem {
  href: string;
  label: string;
  icon?: ReactNode;
  visible: boolean;
}

export interface SettingsShellProps {
  items: SettingsNavItem[];
  children: ReactNode;
}

export function SettingsShell({ items, children }: SettingsShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const useTabs = isMobile || isTablet;

  const visibleItems = items.filter(i => i.visible);
  const activeHref = visibleItems.find(i => pathname.startsWith(i.href))?.href ?? visibleItems[0]?.href;

  if (useTabs) {
    return (
      <div className="ui-settings-shell">
        <div className="ui-settings-shell__nav">
          <Tabs
            value={activeHref ?? ""}
            onChange={(v) => router.push(v)}
            items={visibleItems.map(i => ({ value: i.href, label: i.label, icon: i.icon }))}
            ariaLabel="Ayar bölümleri"
          />
        </div>
        <div className="ui-settings-shell__main">{children}</div>
      </div>
    );
  }

  return (
    <div className="ui-settings-shell">
      <nav className="ui-settings-shell__nav" aria-label="Ayar bölümleri">
        <Tabs
          orientation="vertical"
          value={activeHref ?? ""}
          onChange={(v) => router.push(v)}
          items={visibleItems.map(i => ({ value: i.href, label: i.label, icon: i.icon }))}
          ariaLabel="Ayar bölümleri"
        />
      </nav>
      <div className="ui-settings-shell__main">{children}</div>
    </div>
  );
}
