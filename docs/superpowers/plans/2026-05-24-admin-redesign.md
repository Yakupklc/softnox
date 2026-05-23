# Admin UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `/admin/*` section of Softnox CRM with a Premium / Vercel-Linear visual language, full responsive behavior, WCAG 2.1 AA accessibility, and a 3-section Settings panel — touching only presentation layer (no schema, RLS, API, or business-logic changes).

**Architecture:** Custom CSS (no Tailwind), additive design tokens layered onto existing `globals.css`, reusable primitives in `components/ui/`, Next.js App Router route groups `(auth)` and `(app)` to split shell layouts. Existing Supabase queries, API routes, RLS policies, and database schema all preserved verbatim.

**Tech Stack:** Next.js 16.2.6 (App Router, Turbopack), React 19, TypeScript, Supabase SSR/JS clients, pure CSS with custom properties, Space Grotesk + JetBrains Mono fonts.

**Spec:** [docs/superpowers/specs/2026-05-23-admin-redesign-design.md](../specs/2026-05-23-admin-redesign-design.md)

---

## File Structure

### New files

```
app/admin/
  (auth)/
    layout.tsx                    AuthShell wrapper
    login/page.tsx                moved from app/admin/login/page.tsx
    change-password/page.tsx      moved from app/admin/change-password/page.tsx
  (app)/
    layout.tsx                    AdminShell wrapper
    page.tsx                      moved from app/admin/page.tsx (CRM)
    settings/
      layout.tsx                  SettingsShell (sidebar + main)
      page.tsx                    redirect → /admin/settings/profile
      profile/page.tsx            NEW
      users/page.tsx              moved from app/admin/settings/page.tsx
      audit/page.tsx              NEW

components/ui/
  Button.tsx
  Card.tsx
  Spinner.tsx
  Badge.tsx
  Avatar.tsx
  Skeleton.tsx
  EmptyState.tsx
  Input.tsx
  PasswordInput.tsx
  Textarea.tsx
  Select.tsx
  Toast.tsx
  ToastProvider.tsx
  Dialog.tsx
  ConfirmDialog.tsx
  Tabs.tsx
  DataTable.tsx
  index.ts                        barrel export

components/admin/
  AdminShell.tsx
  AuthShell.tsx
  SettingsShell.tsx
  WelcomeToast.tsx                fired once per session on /admin mount
  crm/
    CRMDashboard.tsx
    ContactDetailSheet.tsx
    ContactFormDialog.tsx
    ContactRow.tsx                desktop table row
    ContactCard.tsx               mobile card
    StatCard.tsx
  settings/
    ProfilePanel.tsx
    UsersPanel.tsx
    AuditPanel.tsx
    UserFormDialog.tsx
    UserEditDialog.tsx

lib/hooks/
  useFocusTrap.ts
  useScrollLock.ts
  useMediaQuery.ts
  useToast.ts                     re-exports from Toast context
  useEscapeKey.ts
```

### Modified files

```
app/globals.css                   APPEND new tokens + ui.* utility classes
app/admin/layout.tsx              becomes passthrough (ToastProvider only)
proxy.ts                          redirect /admin/login authenticated → /admin (not /admin/welcome)
```

### Deleted files (Phase 7 only — DO NOT delete during earlier phases)

```
app/admin/login/page.tsx          replaced by (auth)/login/page.tsx
app/admin/change-password/page.tsx
app/admin/welcome/page.tsx        feature removed entirely
app/admin/page.tsx                replaced by (app)/page.tsx
app/admin/settings/page.tsx       replaced by (app)/settings/users/page.tsx
components/admin/AdminCRM.tsx
components/admin/AdminSettings.tsx
```

---

## Verification baseline

Throughout this plan, "browser verify X" means:

1. Dev server running on `http://localhost:3002` (or whichever port `npm run dev` picked)
2. Open Chrome DevTools, ensure Console is empty (no errors, no warnings except expected Next.js dev hints)
3. Network tab: every request returns 2xx (or 3xx for documented redirects)
4. Test at viewports: 375×667 (iPhone SE), 414×896 (iPhone 11), 768×1024 (iPad), 1024×768 (iPad landscape), 1440×900 (desktop)
5. Use existing super_admin account (created during Faz 1 onboarding) to test gated flows

**Test accounts setup (do this BEFORE Phase 3 verification):**

Open `http://localhost:3002/admin/login`. If no super_admin exists, create one via Supabase Studio (`profiles` table, set `role='super_admin'` for your auth user). Plain admin account needed for cross-account RBAC tests in Phase 6 — create a second user via the existing Users panel before starting Phase 6.

---

## Phase 1 — Foundation (zero visual regression)

Append new tokens to `globals.css`, create all `components/ui/` primitives and `lib/hooks/`. Nothing user-facing changes yet.

### Task 1.1: Append design tokens to globals.css

**Files:**
- Modify: `app/globals.css` (append at end of `:root` block; do not touch existing declarations)

- [ ] **Step 1: Open `app/globals.css` and find the closing `}` of the `:root` block.** Insert the following block immediately before that `}`:

```css
  /* === Redesign tokens (additive — existing tokens untouched) === */

  /* Color — primary state variants */
  --accent-hover: #2563eb;
  --accent-pressed: #1d4ed8;

  /* Color — semantic */
  --success: #34d399;
  --success-bg: rgba(52, 211, 153, 0.10);
  --warning: #fbbf24;
  --warning-bg: rgba(251, 191, 36, 0.10);
  --danger: #f87171;
  --danger-bg: rgba(239, 68, 68, 0.10);
  --info: #60a5fa;
  --info-bg: rgba(96, 165, 250, 0.10);

  /* Color — role badges */
  --role-super: #a78bfa;
  --role-admin: #60a5fa;

  /* Typography scale */
  --text-xs: 12px;       --lh-xs: 16px;
  --text-sm: 13px;       --lh-sm: 18px;
  --text-base: 14px;     --lh-base: 20px;
  --text-md: 15px;       --lh-md: 22px;
  --text-lg: 17px;       --lh-lg: 24px;
  --text-xl: 20px;       --lh-xl: 28px;
  --text-2xl: 24px;      --lh-2xl: 32px;
  --text-3xl: 32px;      --lh-3xl: 40px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Elevation */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.30);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.40);
  --shadow-lg: 0 12px 48px rgba(0, 0, 0, 0.50), 0 0 0 1px var(--border);
  --shadow-glow: 0 0 24px var(--accent-glow);
  --blur-sm: blur(8px);
  --blur-md: blur(16px);

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --dur-fast: 120ms;
  --dur-base: 200ms;
  --dur-slow: 320ms;

  /* Radius (extension) */
  --radius-xl: 28px;
  --radius-full: 9999px;

  /* Z-index */
  --z-base: 0;
  --z-sticky: 10;
  --z-dropdown: 20;
  --z-modal-bg: 40;
  --z-modal: 50;
  --z-toast: 60;
  --z-tooltip: 70;
```

- [ ] **Step 2: Append the reduced-motion guard at the very end of `globals.css` (after all existing rules):**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Append the focus-visible baseline rule (after the reduced-motion guard):**

```css
.ui-focus-ring:focus-visible,
.ui-btn:focus-visible,
.ui-input:focus-visible,
.ui-select:focus-visible,
.ui-textarea:focus-visible,
[role="tab"]:focus-visible,
[role="menuitem"]:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

- [ ] **Step 4: Browser verify nothing broke.** Start dev server if not running. Open `http://localhost:3002/admin/login` and `http://localhost:3002/admin` (if logged in). Pages must render identically to before — no visual changes since no rule depends on the new tokens yet. Console: 0 errors.

- [ ] **Step 5: Skip commit (user CLAUDE.md says don't commit unless asked).** Note progress and continue.

### Task 1.2: Create `lib/hooks/` utilities

**Files:**
- Create: `lib/hooks/useFocusTrap.ts`
- Create: `lib/hooks/useScrollLock.ts`
- Create: `lib/hooks/useMediaQuery.ts`
- Create: `lib/hooks/useEscapeKey.ts`

- [ ] **Step 1: Create `lib/hooks/useFocusTrap.ts`:**

```ts
"use client";
import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const root = ref.current;
    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = focusables()[0];
    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
  }, [active]);

  return ref;
}
```

- [ ] **Step 2: Create `lib/hooks/useScrollLock.ts`:**

```ts
"use client";
import { useEffect } from "react";

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const scrollY = window.scrollY;
    const prev = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
```

- [ ] **Step 3: Create `lib/hooks/useMediaQuery.ts`:**

```ts
"use client";
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const useIsTablet = () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
```

- [ ] **Step 4: Create `lib/hooks/useEscapeKey.ts`:**

```ts
"use client";
import { useEffect } from "react";

export function useEscapeKey(active: boolean, handler: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        handler();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, handler]);
}
```

- [ ] **Step 5: TypeScript check.** Run `npx tsc --noEmit` from project root. Expected: 0 errors (the new files don't reference anything missing).

### Task 1.3: Spinner primitive

**Files:**
- Create: `components/ui/Spinner.tsx`
- Modify: `app/globals.css` (append `.ui-spinner` rules)

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--accent);
  border-radius: var(--radius-full);
  animation: ui-spin 0.7s linear infinite;
}
.ui-spinner--lg { width: 24px; height: 24px; border-width: 3px; }
.ui-spinner--inverse { border-color: rgba(255,255,255,0.2); border-top-color: white; }
@keyframes ui-spin { to { transform: rotate(360deg); } }
```

- [ ] **Step 2: Create `components/ui/Spinner.tsx`:**

```tsx
import { CSSProperties } from "react";

export type SpinnerProps = {
  size?: "sm" | "lg";
  inverse?: boolean;
  style?: CSSProperties;
  label?: string;
};

export function Spinner({ size = "sm", inverse, style, label = "Yükleniyor" }: SpinnerProps) {
  const classes = ["ui-spinner"];
  if (size === "lg") classes.push("ui-spinner--lg");
  if (inverse) classes.push("ui-spinner--inverse");
  return (
    <span
      className={classes.join(" ")}
      role="status"
      aria-label={label}
      style={style}
    />
  );
}
```

### Task 1.4: Button primitive

**Files:**
- Create: `components/ui/Button.tsx`
- Modify: `app/globals.css` (append `.ui-btn` rules)

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 500;
  line-height: 1;
  padding: 0 var(--space-4);
  height: 40px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out),
              border-color var(--dur-fast) var(--ease-out),
              transform var(--dur-fast) var(--ease-out);
  white-space: nowrap;
  user-select: none;
}
.ui-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ui-btn:not(:disabled):active { transform: scale(0.97); }

.ui-btn--primary {
  background: var(--accent);
  color: white;
  box-shadow: var(--shadow-sm);
}
.ui-btn--primary:not(:disabled):hover { background: var(--accent-hover); }
.ui-btn--primary:not(:disabled):active { background: var(--accent-pressed); }

.ui-btn--secondary {
  background: var(--surface-2);
  color: var(--text);
  border-color: var(--border);
}
.ui-btn--secondary:not(:disabled):hover {
  background: var(--surface);
  border-color: var(--border-strong);
}

.ui-btn--ghost {
  background: transparent;
  color: var(--text);
}
.ui-btn--ghost:not(:disabled):hover { background: var(--surface); }

.ui-btn--danger {
  background: var(--danger-bg);
  color: var(--danger);
  border-color: rgba(239, 68, 68, 0.30);
}
.ui-btn--danger:not(:disabled):hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.50);
}

.ui-btn--sm { height: 32px; padding: 0 var(--space-3); font-size: var(--text-sm); }
.ui-btn--lg { height: 48px; padding: 0 var(--space-6); font-size: var(--text-md); }
.ui-btn--icon { width: 40px; padding: 0; }
.ui-btn--icon.ui-btn--sm { width: 32px; }
.ui-btn--block { width: 100%; }

@media (max-width: 767px) {
  .ui-btn { height: 44px; }
  .ui-btn--sm { height: 36px; }
}
```

- [ ] **Step 2: Create `components/ui/Button.tsx`:**

```tsx
"use client";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconOnly?: boolean;
  block?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    loading = false,
    iconOnly = false,
    block = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    className,
    type = "button",
    ...rest
  },
  ref
) {
  const classes = ["ui-btn", `ui-btn--${variant}`];
  if (size === "sm") classes.push("ui-btn--sm");
  if (size === "lg") classes.push("ui-btn--lg");
  if (iconOnly) classes.push("ui-btn--icon");
  if (block) classes.push("ui-btn--block");
  if (className) classes.push(className);

  return (
    <button
      ref={ref}
      type={type}
      className={classes.join(" ")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner inverse={variant === "primary"} /> : leftIcon}
      {!iconOnly && children}
      {!loading && rightIcon}
    </button>
  );
});
```

### Task 1.5: Card primitive

**Files:**
- Create: `components/ui/Card.tsx`
- Modify: `app/globals.css` (append `.ui-card` rules)

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-5);
  transition: border-color var(--dur-fast) var(--ease-out),
              background var(--dur-fast) var(--ease-out);
}
.ui-card--interactive { cursor: pointer; }
.ui-card--interactive:hover {
  background: var(--surface-2);
  border-color: var(--border-strong);
}
.ui-card--elevated {
  background: var(--surface-2);
  box-shadow: var(--shadow-md);
}
.ui-card--padless { padding: 0; }
.ui-card--lg { padding: var(--space-6); border-radius: var(--radius-lg); }
```

- [ ] **Step 2: Create `components/ui/Card.tsx`:**

```tsx
import { HTMLAttributes, forwardRef, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  elevated?: boolean;
  padless?: boolean;
  size?: "md" | "lg";
  as?: "div" | "section" | "article";
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive, elevated, padless, size = "md", as = "div", children, className, ...rest },
  ref
) {
  const classes = ["ui-card"];
  if (interactive) classes.push("ui-card--interactive");
  if (elevated) classes.push("ui-card--elevated");
  if (padless) classes.push("ui-card--padless");
  if (size === "lg") classes.push("ui-card--lg");
  if (className) classes.push(className);
  const Comp = as as "div";
  return (
    <Comp ref={ref as any} className={classes.join(" ")} {...rest}>
      {children}
    </Comp>
  );
});
```

### Task 1.6: Badge primitive

**Files:**
- Create: `components/ui/Badge.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1;
  padding: 4px var(--space-2);
  border-radius: var(--radius-full);
  white-space: nowrap;
}
.ui-badge--success { background: var(--success-bg); color: var(--success); }
.ui-badge--warning { background: var(--warning-bg); color: var(--warning); }
.ui-badge--danger  { background: var(--danger-bg);  color: var(--danger); }
.ui-badge--info    { background: var(--info-bg);    color: var(--info); }
.ui-badge--neutral { background: var(--surface-2);  color: var(--text-dim); }
.ui-badge--role-super { background: rgba(167,139,250,0.12); color: var(--role-super); }
.ui-badge--role-admin { background: rgba(96,165,250,0.12);  color: var(--role-admin); }
```

- [ ] **Step 2: Create `components/ui/Badge.tsx`:**

```tsx
import { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "success" | "warning" | "danger" | "info" | "neutral"
  | "role-super" | "role-admin";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
}

export function Badge({
  variant = "neutral",
  icon,
  children,
  className,
  "aria-label": ariaLabel,
  ...rest
}: BadgeProps) {
  const classes = ["ui-badge", `ui-badge--${variant}`];
  if (className) classes.push(className);
  return (
    <span className={classes.join(" ")} aria-label={ariaLabel} {...rest}>
      {icon}
      {children}
    </span>
  );
}

const SONUC_TO_VARIANT: Record<string, BadgeVariant> = {
  "Beklemede": "warning",
  "Olumlu": "success",
  "Olumsuz": "danger",
  "Devam Ediyor": "info",
};

export function StatusBadge({ sonuc }: { sonuc: string }) {
  const variant = SONUC_TO_VARIANT[sonuc] ?? "neutral";
  return <Badge variant={variant} aria-label={`Durum: ${sonuc}`}>{sonuc}</Badge>;
}

export function RoleBadge({ role }: { role: "admin" | "super_admin" }) {
  const variant: BadgeVariant = role === "super_admin" ? "role-super" : "role-admin";
  const label = role === "super_admin" ? "Süper Admin" : "Admin";
  return <Badge variant={variant} aria-label={`Rol: ${label}`}>{label}</Badge>;
}
```

### Task 1.7: Avatar primitive

**Files:**
- Create: `components/ui/Avatar.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-weight: 600;
  border-radius: var(--radius-full);
  color: white;
  user-select: none;
  flex-shrink: 0;
}
.ui-avatar--sm { width: 28px; height: 28px; font-size: var(--text-xs); }
.ui-avatar--md { width: 36px; height: 36px; font-size: var(--text-sm); }
.ui-avatar--lg { width: 56px; height: 56px; font-size: var(--text-lg); }
```

- [ ] **Step 2: Create `components/ui/Avatar.tsx`:**

```tsx
import { CSSProperties } from "react";

const PALETTE = [
  "#3b82f6", "#22d3ee", "#a78bfa", "#34d399",
  "#fbbf24", "#f87171", "#60a5fa", "#f472b6",
];

function hashColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
}

export function Avatar({ name, size = "md", style }: AvatarProps) {
  const bg = hashColor(name);
  const ini = initials(name);
  return (
    <span
      className={`ui-avatar ui-avatar--${size}`}
      style={{ background: bg, ...style }}
      aria-hidden="true"
    >
      {ini}
    </span>
  );
}
```

### Task 1.8: Skeleton primitive

**Files:**
- Create: `components/ui/Skeleton.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--surface) 0%,
    var(--surface-2) 50%,
    var(--surface) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: ui-shimmer 1.6s linear infinite;
}
.ui-skeleton--text { height: 0.9em; }
.ui-skeleton--circle { border-radius: var(--radius-full); }
@keyframes ui-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

- [ ] **Step 2: Create `components/ui/Skeleton.tsx`:**

```tsx
import { CSSProperties } from "react";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  text?: boolean;
  style?: CSSProperties;
}

export function Skeleton({ width, height, circle, text, style }: SkeletonProps) {
  const classes = ["ui-skeleton"];
  if (circle) classes.push("ui-skeleton--circle");
  if (text) classes.push("ui-skeleton--text");
  return (
    <span
      aria-hidden="true"
      className={classes.join(" ")}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
    />
  );
}
```

### Task 1.9: EmptyState primitive

**Files:**
- Create: `components/ui/EmptyState.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-12) var(--space-6);
  color: var(--text-dim);
  gap: var(--space-3);
}
.ui-empty__icon {
  width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-mute);
  margin-bottom: var(--space-2);
}
.ui-empty__title {
  font-size: var(--text-md);
  color: var(--text);
  font-weight: 500;
}
.ui-empty__body {
  font-size: var(--text-sm);
  color: var(--text-dim);
  max-width: 380px;
}
.ui-empty__actions { margin-top: var(--space-3); display: flex; gap: var(--space-2); }
```

- [ ] **Step 2: Create `components/ui/EmptyState.tsx`:**

```tsx
import { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  body?: ReactNode;
  actions?: ReactNode;
}

export function EmptyState({ icon, title, body, actions }: EmptyStateProps) {
  return (
    <div className="ui-empty" role="region" aria-label={title}>
      {icon && <div className="ui-empty__icon" aria-hidden="true">{icon}</div>}
      <div className="ui-empty__title">{title}</div>
      {body && <div className="ui-empty__body">{body}</div>}
      {actions && <div className="ui-empty__actions">{actions}</div>}
    </div>
  );
}
```

### Task 1.10: Form field primitives (Input, Textarea, Select)

**Files:**
- Create: `components/ui/Input.tsx`
- Create: `components/ui/Textarea.tsx`
- Create: `components/ui/Select.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}
.ui-field__label {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ui-field__required { color: var(--danger); margin-left: 2px; }
.ui-field__help { font-size: var(--text-xs); color: var(--text-mute); }
.ui-field__error {
  font-size: var(--text-xs);
  color: var(--danger);
  display: flex; align-items: center; gap: var(--space-1);
}

.ui-input,
.ui-textarea,
.ui-select {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0 var(--space-3);
  height: 40px;
  width: 100%;
  transition: border-color var(--dur-fast) var(--ease-out),
              background var(--dur-fast) var(--ease-out);
}
.ui-input::placeholder,
.ui-textarea::placeholder { color: var(--text-mute); }
.ui-input:hover,
.ui-textarea:hover,
.ui-select:hover { border-color: var(--border-strong); }
.ui-input:focus,
.ui-textarea:focus,
.ui-select:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--surface-2);
}
.ui-input:disabled,
.ui-textarea:disabled,
.ui-select:disabled { opacity: 0.6; cursor: not-allowed; }
.ui-input[aria-invalid="true"],
.ui-textarea[aria-invalid="true"],
.ui-select[aria-invalid="true"] { border-color: var(--danger); }

.ui-textarea { padding: var(--space-3); height: auto; min-height: 96px; resize: vertical; line-height: var(--lh-base); }
.ui-select {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%239aa3b8' d='M1 1l5 5 5-5'/></svg>");
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  padding-right: var(--space-8);
}

.ui-input-group { position: relative; display: flex; align-items: center; }
.ui-input-group__suffix {
  position: absolute; right: var(--space-2);
  display: flex; align-items: center;
}

@media (max-width: 767px) {
  .ui-input, .ui-select { height: 44px; }
}
```

- [ ] **Step 2: Create `components/ui/Input.tsx`:**

```tsx
"use client";
import { InputHTMLAttributes, forwardRef, ReactNode, useId } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, errorText, required, suffix, id, className, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy = [errorText ? errorId : null, helperText ? helpId : null]
    .filter(Boolean).join(" ") || undefined;

  const inputEl = (
    <input
      ref={ref}
      id={inputId}
      className={["ui-input", className].filter(Boolean).join(" ")}
      aria-invalid={errorText ? true : undefined}
      aria-describedby={describedBy}
      aria-required={required || undefined}
      required={required}
      {...rest}
    />
  );

  return (
    <div className="ui-field">
      {label && (
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
          {required && <span className="ui-field__required" aria-hidden="true">*</span>}
        </label>
      )}
      {suffix ? (
        <div className="ui-input-group">
          {inputEl}
          <span className="ui-input-group__suffix">{suffix}</span>
        </div>
      ) : (
        inputEl
      )}
      {helperText && !errorText && (
        <div id={helpId} className="ui-field__help">{helperText}</div>
      )}
      {errorText && (
        <div id={errorId} className="ui-field__error" role="alert">{errorText}</div>
      )}
    </div>
  );
});
```

- [ ] **Step 3: Create `components/ui/Textarea.tsx`:**

```tsx
"use client";
import { TextareaHTMLAttributes, forwardRef, useId } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helperText, errorText, id, required, className, ...rest },
  ref
) {
  const autoId = useId();
  const tid = id ?? autoId;
  const helpId = `${tid}-help`;
  const errorId = `${tid}-error`;
  const describedBy = [errorText ? errorId : null, helperText ? helpId : null]
    .filter(Boolean).join(" ") || undefined;
  return (
    <div className="ui-field">
      {label && (
        <label className="ui-field__label" htmlFor={tid}>
          {label}
          {required && <span className="ui-field__required" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={tid}
        className={["ui-textarea", className].filter(Boolean).join(" ")}
        aria-invalid={errorText ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        required={required}
        {...rest}
      />
      {helperText && !errorText && (
        <div id={helpId} className="ui-field__help">{helperText}</div>
      )}
      {errorText && (
        <div id={errorId} className="ui-field__error" role="alert">{errorText}</div>
      )}
    </div>
  );
});
```

- [ ] **Step 4: Create `components/ui/Select.tsx`:**

```tsx
"use client";
import { SelectHTMLAttributes, forwardRef, useId, ReactNode } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helperText, errorText, id, required, className, children, ...rest },
  ref
) {
  const autoId = useId();
  const sid = id ?? autoId;
  const helpId = `${sid}-help`;
  const errorId = `${sid}-error`;
  const describedBy = [errorText ? errorId : null, helperText ? helpId : null]
    .filter(Boolean).join(" ") || undefined;
  return (
    <div className="ui-field">
      {label && (
        <label className="ui-field__label" htmlFor={sid}>
          {label}
          {required && <span className="ui-field__required" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={sid}
        className={["ui-select", className].filter(Boolean).join(" ")}
        aria-invalid={errorText ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        required={required}
        {...rest}
      >
        {children}
      </select>
      {helperText && !errorText && (
        <div id={helpId} className="ui-field__help">{helperText}</div>
      )}
      {errorText && (
        <div id={errorId} className="ui-field__error" role="alert">{errorText}</div>
      )}
    </div>
  );
});
```

### Task 1.11: PasswordInput primitive

**Files:**
- Create: `components/ui/PasswordInput.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-password-toggle {
  background: transparent;
  border: none;
  color: var(--text-mute);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  transition: color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}
.ui-password-toggle:hover { color: var(--text); background: var(--surface); }
.ui-caps-hint {
  font-size: var(--text-xs);
  color: var(--warning);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

- [ ] **Step 2: Create `components/ui/PasswordInput.tsx`:**

```tsx
"use client";
import { InputHTMLAttributes, forwardRef, useId, useState, useEffect } from "react";

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  showCapsHint?: boolean;
  required?: boolean;
}

const EyeIcon = ({ off }: { off?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {off ? (
      <>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </>
    ) : (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { label, helperText, errorText, showCapsHint = true, required, id, className, onKeyUp, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const capsId = `${inputId}-caps`;
  const [visible, setVisible] = useState(false);
  const [caps, setCaps] = useState(false);

  const describedBy = [
    errorText ? errorId : null,
    helperText ? helpId : null,
    caps ? capsId : null,
  ].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ui-field">
      {label && (
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
          {required && <span className="ui-field__required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="ui-input-group">
        <input
          ref={ref}
          id={inputId}
          type={visible ? "text" : "password"}
          className={["ui-input", className].filter(Boolean).join(" ")}
          aria-invalid={errorText ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          required={required}
          style={{ paddingRight: 44 }}
          onKeyUp={(e) => {
            if (showCapsHint && e.getModifierState) setCaps(e.getModifierState("CapsLock"));
            onKeyUp?.(e);
          }}
          {...rest}
        />
        <span className="ui-input-group__suffix">
          <button
            type="button"
            className="ui-password-toggle"
            aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
            aria-pressed={visible}
            onClick={() => setVisible(v => !v)}
          >
            <EyeIcon off={!visible} />
          </button>
        </span>
      </div>
      {caps && (
        <div id={capsId} className="ui-caps-hint" role="status">
          ⚠ Caps Lock açık
        </div>
      )}
      {helperText && !errorText && (
        <div id={helpId} className="ui-field__help">{helperText}</div>
      )}
      {errorText && (
        <div id={errorId} className="ui-field__error" role="alert">{errorText}</div>
      )}
    </div>
  );
});
```

### Task 1.12: Toast + ToastProvider

**Files:**
- Create: `components/ui/Toast.tsx`
- Create: `components/ui/ToastProvider.tsx`
- Create: `lib/hooks/useToast.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-toast-region {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  z-index: var(--z-toast);
  pointer-events: none;
  max-width: calc(100vw - var(--space-8));
}
@media (max-width: 767px) {
  .ui-toast-region {
    top: auto;
    bottom: var(--space-4);
    left: var(--space-4);
    right: var(--space-4);
  }
}
.ui-toast {
  pointer-events: auto;
  background: var(--bg-2);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  padding: var(--space-3) var(--space-4);
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  box-shadow: var(--shadow-md);
  min-width: 280px;
  max-width: 420px;
  animation: ui-toast-in var(--dur-base) var(--ease-out);
}
.ui-toast--leaving { animation: ui-toast-out var(--dur-fast) var(--ease-in-out) forwards; }
.ui-toast__icon { flex-shrink: 0; margin-top: 2px; }
.ui-toast__body { flex: 1; font-size: var(--text-sm); color: var(--text); line-height: var(--lh-sm); }
.ui-toast__close {
  background: none; border: none; color: var(--text-mute);
  cursor: pointer; padding: 2px; border-radius: var(--radius-sm);
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
}
.ui-toast__close:hover { color: var(--text); background: var(--surface); }
.ui-toast--success { border-color: rgba(52,211,153,0.30); }
.ui-toast--success .ui-toast__icon { color: var(--success); }
.ui-toast--error   { border-color: rgba(239,68,68,0.30); }
.ui-toast--error   .ui-toast__icon { color: var(--danger); }
.ui-toast--info    .ui-toast__icon { color: var(--info); }
.ui-toast--warning { border-color: rgba(251,191,36,0.30); }
.ui-toast--warning .ui-toast__icon { color: var(--warning); }

@keyframes ui-toast-in {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ui-toast-out {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(20px); }
}
@media (max-width: 767px) {
  @keyframes ui-toast-in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
}
```

- [ ] **Step 2: Create `components/ui/ToastProvider.tsx`:**

```tsx
"use client";
import { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";

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

  const api: ToastApi = {
    show,
    success: (body, opts) => show({ ...opts, body, variant: "success" }),
    error:   (body, opts) => show({ ...opts, body, variant: "error" }),
    info:    (body, opts) => show({ ...opts, body, variant: "info" }),
    warning: (body, opts) => show({ ...opts, body, variant: "warning" }),
    dismiss,
  };

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
```

- [ ] **Step 3: Create `lib/hooks/useToast.ts`:**

```ts
"use client";
import { useContext } from "react";
import { ToastContext } from "@/components/ui/ToastProvider";

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
```

- [ ] **Step 4: Create stub `components/ui/Toast.tsx`** (re-export for convenience):

```ts
export { ToastProvider } from "./ToastProvider";
export type { ToastVariant, ToastInput } from "./ToastProvider";
```

- [ ] **Step 5: Verify `@/` path alias.** Open `tsconfig.json` and confirm `compilerOptions.paths` has `"@/*": ["./*"]`. If absent, add it. Existing imports in the repo already use this alias, so it should be present.

### Task 1.13: Dialog + ConfirmDialog

**Files:**
- Create: `components/ui/Dialog.tsx`
- Create: `components/ui/ConfirmDialog.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: var(--blur-sm);
  -webkit-backdrop-filter: var(--blur-sm);
  z-index: var(--z-modal-bg);
  animation: ui-fade-in var(--dur-base) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ui-dialog {
  position: relative;
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-modal);
  max-width: calc(100vw - var(--space-8));
  max-height: calc(100vh - var(--space-8));
  display: flex;
  flex-direction: column;
  animation: ui-dialog-in var(--dur-base) var(--ease-out);
  width: 100%;
}
.ui-dialog--sm { max-width: 420px; }
.ui-dialog--md { max-width: 560px; }
.ui-dialog--lg { max-width: 720px; }
.ui-dialog__head {
  padding: var(--space-5) var(--space-5) var(--space-3) var(--space-5);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  border-bottom: 1px solid var(--border);
}
.ui-dialog__title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text);
  margin: 0;
  letter-spacing: -0.01em;
}
.ui-dialog__desc {
  font-size: var(--text-sm);
  color: var(--text-dim);
  margin-top: var(--space-1);
}
.ui-dialog__close {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.ui-dialog__close:hover { background: var(--surface); color: var(--text); }
.ui-dialog__body {
  padding: var(--space-5);
  overflow-y: auto;
  flex: 1 1 auto;
}
.ui-dialog__foot {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

@keyframes ui-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes ui-dialog-in {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 767px) {
  .ui-dialog-overlay { align-items: flex-end; }
  .ui-dialog {
    max-width: 100%;
    width: 100%;
    max-height: 92vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    animation: ui-sheet-in var(--dur-slow) var(--ease-out);
  }
  .ui-dialog__close { width: 44px; height: 44px; }
  .ui-dialog__handle {
    width: 44px;
    height: 4px;
    background: var(--border-strong);
    border-radius: var(--radius-full);
    margin: var(--space-2) auto 0 auto;
  }
}
@keyframes ui-sheet-in {
  from { opacity: 0; transform: translateY(100%); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Create `components/ui/Dialog.tsx`:**

```tsx
"use client";
import { ReactNode, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
  initialFocus?: "first" | "none";
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  closeOnBackdrop = true,
  initialFocus = "first",
}: DialogProps) {
  const titleId = useId();
  const descId = useId();
  const containerRef = useFocusTrap<HTMLDivElement>(open && initialFocus !== "none");

  useScrollLock(open);
  useEscapeKey(open, onClose);

  useEffect(() => {
    if (!open) return;
    const onPop = () => onClose();
    window.history.pushState({ dialog: titleId }, "");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open, onClose, titleId]);

  if (typeof window === "undefined") return null;
  if (!open) return null;

  return createPortal(
    <div
      className="ui-dialog-overlay"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`ui-dialog ui-dialog--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ui-dialog__handle" aria-hidden="true" />
        <header className="ui-dialog__head">
          <div>
            <h2 id={titleId} className="ui-dialog__title">{title}</h2>
            {description && <p id={descId} className="ui-dialog__desc">{description}</p>}
          </div>
          <button
            type="button"
            className="ui-dialog__close"
            aria-label="Kapat"
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </header>
        <div className="ui-dialog__body">{children}</div>
        {footer && <footer className="ui-dialog__foot">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
```

- [ ] **Step 3: Create `components/ui/ConfirmDialog.tsx`:**

```tsx
"use client";
import { ReactNode, useState } from "react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  destructive = false,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>{cancelLabel}</Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={handleConfirm}
            loading={busy}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && (
        <div style={{ color: "var(--text-dim)", fontSize: "var(--text-sm)", lineHeight: "var(--lh-sm)" }}>
          {description}
        </div>
      )}
    </Dialog>
  );
}
```

### Task 1.14: Tabs primitive

**Files:**
- Create: `components/ui/Tabs.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-tabs {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
}
.ui-tabs::-webkit-scrollbar { display: none; }
.ui-tab {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-dim);
  background: transparent;
  border: none;
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  transition: color var(--dur-fast) var(--ease-out);
}
.ui-tab:hover { color: var(--text); }
.ui-tab[aria-selected="true"] {
  color: var(--text);
}
.ui-tab[aria-selected="true"]::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: var(--space-2);
  right: var(--space-2);
  height: 2px;
  background: var(--accent);
  border-radius: var(--radius-full);
}
.ui-tab-panel {
  outline: none;
  padding-top: var(--space-5);
}

.ui-vtabs {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
}
.ui-vtab {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-dim);
  background: transparent;
  border: none;
  padding: var(--space-3);
  text-align: left;
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  width: 100%;
}
.ui-vtab:hover { background: var(--surface); color: var(--text); }
.ui-vtab[aria-selected="true"] {
  background: var(--surface-2);
  color: var(--text);
}
.ui-vtab[aria-selected="true"]::before {
  content: "";
  width: 3px;
  height: 16px;
  background: var(--accent);
  border-radius: var(--radius-full);
  margin-right: var(--space-1);
  margin-left: calc(var(--space-3) * -1);
}
```

- [ ] **Step 2: Create `components/ui/Tabs.tsx`:**

```tsx
"use client";
import { ReactNode, KeyboardEvent, useRef, useId } from "react";

export interface TabItem<TValue extends string = string> {
  value: TValue;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<TValue extends string = string> {
  value: TValue;
  onChange: (v: TValue) => void;
  items: TabItem<TValue>[];
  orientation?: "horizontal" | "vertical";
  ariaLabel?: string;
  className?: string;
}

export function Tabs<TValue extends string = string>({
  value,
  onChange,
  items,
  orientation = "horizontal",
  ariaLabel,
  className,
}: TabsProps<TValue>) {
  const baseId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKey(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    const last = items.length - 1;
    let next = idx;
    if (orientation === "horizontal") {
      if (e.key === "ArrowRight") next = idx === last ? 0 : idx + 1;
      else if (e.key === "ArrowLeft") next = idx === 0 ? last : idx - 1;
    } else {
      if (e.key === "ArrowDown") next = idx === last ? 0 : idx + 1;
      else if (e.key === "ArrowUp") next = idx === 0 ? last : idx - 1;
    }
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next !== idx) {
      e.preventDefault();
      const target = items[next];
      if (!target.disabled) {
        refs.current[next]?.focus();
        onChange(target.value);
      }
    }
  }

  const listClass = orientation === "vertical" ? "ui-vtabs" : "ui-tabs";
  const tabClass = orientation === "vertical" ? "ui-vtab" : "ui-tab";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      className={[listClass, className].filter(Boolean).join(" ")}
    >
      {items.map((item, idx) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={el => { refs.current[idx] = el; }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${item.value}`}
            aria-selected={selected}
            aria-controls={`${baseId}-panel-${item.value}`}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            className={tabClass}
            onClick={() => !item.disabled && onChange(item.value)}
            onKeyDown={(e) => handleKey(e, idx)}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export interface TabPanelProps {
  value: string;
  activeValue: string;
  children: ReactNode;
}

export function TabPanel({ value, activeValue, children }: TabPanelProps) {
  if (value !== activeValue) return null;
  return (
    <div
      role="tabpanel"
      className="ui-tab-panel"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
```

### Task 1.15: DataTable primitive (responsive table → cards)

**Files:**
- Create: `components/ui/DataTable.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-table-wrap {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.ui-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}
.ui-table thead th {
  text-align: left;
  font-weight: 500;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-mute);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-1);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1;
}
.ui-table tbody td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border);
  color: var(--text);
  vertical-align: middle;
}
.ui-table tbody tr:last-child td { border-bottom: none; }
.ui-table tbody tr {
  transition: background var(--dur-fast) var(--ease-out);
  cursor: pointer;
}
.ui-table tbody tr:hover { background: var(--surface-2); }
.ui-table tbody tr[aria-selected="true"] { background: var(--surface-2); }

.ui-cardlist {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.ui-cardlist__item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-4);
  cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}
.ui-cardlist__item:hover {
  background: var(--surface-2);
  border-color: var(--border-strong);
}
.ui-cardlist__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}
.ui-cardlist__title { font-size: var(--text-md); font-weight: 500; color: var(--text); }
.ui-cardlist__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-dim);
}
.ui-cardlist__meta-row {
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
}
.ui-cardlist__meta-label {
  font-size: var(--text-xs);
  color: var(--text-mute);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  min-width: 80px;
}
```

- [ ] **Step 2: Create `components/ui/DataTable.tsx`:**

```tsx
"use client";
import { ReactNode } from "react";
import { useIsMobile } from "@/lib/hooks/useMediaQuery";
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
    return empty ?? <EmptyState title="Kayıt bulunamadı" />;
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

  const visibleCols = columns.filter(c => c.hideOn !== "tablet" || true);

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
```

### Task 1.16: Barrel export + verify foundation

**Files:**
- Create: `components/ui/index.ts`

- [ ] **Step 1: Create `components/ui/index.ts`:**

```ts
export { Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";
export { Card } from "./Card";
export type { CardProps } from "./Card";
export { Spinner } from "./Spinner";
export { Badge, StatusBadge, RoleBadge } from "./Badge";
export type { BadgeProps, BadgeVariant } from "./Badge";
export { Avatar } from "./Avatar";
export { Skeleton } from "./Skeleton";
export { EmptyState } from "./EmptyState";
export { Input } from "./Input";
export type { InputProps } from "./Input";
export { Textarea } from "./Textarea";
export { Select } from "./Select";
export { PasswordInput } from "./PasswordInput";
export { Dialog } from "./Dialog";
export type { DialogProps } from "./Dialog";
export { ConfirmDialog } from "./ConfirmDialog";
export { Tabs, TabPanel } from "./Tabs";
export type { TabItem, TabsProps } from "./Tabs";
export { DataTable } from "./DataTable";
export type { DataTableColumn, DataTableProps } from "./DataTable";
export { ToastProvider } from "./ToastProvider";
```

- [ ] **Step 2: TypeScript check.** Run `npx tsc --noEmit`. Expected: 0 errors. If `cannot find module '@/lib/hooks/...'` or similar appears, verify path alias in `tsconfig.json`.

- [ ] **Step 3: Browser verify foundation didn't break anything.** Start/restart dev server. Visit:
  - `http://localhost:3002/admin/login` → original login renders
  - `http://localhost:3002/admin` (logged in) → original CRM renders
  - `http://localhost:3002/admin/settings` (super_admin) → original settings renders

  Open DevTools Console for each — must be 0 errors. The new primitives are not used yet; existing pages must look identical to before.

---

## Phase 2 — Shell layouts and route group restructure

Move existing files into `(auth)` and `(app)` route groups so the topbar wraps only post-auth pages.

### Task 2.1: ToastProvider in root admin layout

**Files:**
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1: Read existing `app/admin/layout.tsx` (likely a passthrough already).** Replace with:

```tsx
import { ReactNode } from "react";
import { ToastProvider } from "@/components/ui";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
```

- [ ] **Step 2: Browser verify.** Reload all admin pages. Console: 0 errors. Pages unchanged visually.

### Task 2.2: AuthShell component

**Files:**
- Create: `components/admin/AuthShell.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-auth-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--space-6);
  background:
    radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15), transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(167, 139, 250, 0.10), transparent 50%),
    var(--bg);
  position: relative;
  overflow: hidden;
}
.ui-auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--surface-2);
  backdrop-filter: var(--blur-md);
  -webkit-backdrop-filter: var(--blur-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 1;
}
.ui-auth-card__logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}
.ui-auth-card__title {
  font-size: var(--text-2xl);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text);
  margin: 0;
}
.ui-auth-card__sub {
  color: var(--text-dim);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}
.ui-auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.ui-auth-link {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font: inherit;
  font-size: var(--text-sm);
  padding: 0;
  text-align: center;
  width: 100%;
}
.ui-auth-link:hover { color: var(--accent-hover); text-decoration: underline; }
```

- [ ] **Step 2: Create `components/admin/AuthShell.tsx`:**

```tsx
import { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="ui-auth-shell">
      <main className="ui-auth-card">{children}</main>
    </div>
  );
}
```

### Task 2.3: AdminShell component (topbar)

**Files:**
- Create: `components/admin/AdminShell.tsx`
- Create: `components/admin/Logo.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-app-shell { min-height: 100vh; background: var(--bg); }
.ui-topbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: rgba(6, 9, 18, 0.72);
  backdrop-filter: var(--blur-md);
  -webkit-backdrop-filter: var(--blur-md);
  border-bottom: 1px solid var(--border);
  height: 64px;
}
.ui-topbar__inner {
  max-width: var(--container);
  margin: 0 auto;
  height: 100%;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}
.ui-topbar__left {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}
.ui-topbar__nav {
  display: flex;
  gap: var(--space-1);
}
.ui-topbar__link {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-dim);
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  transition: color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}
.ui-topbar__link:hover { color: var(--text); background: var(--surface); }
.ui-topbar__link--active { color: var(--text); background: var(--surface-2); }
.ui-topbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.ui-user-menu {
  position: relative;
}
.ui-user-menu__trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: transparent;
  border: 1px solid transparent;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text);
  font: inherit;
}
.ui-user-menu__trigger:hover {
  background: var(--surface);
  border-color: var(--border);
}
.ui-user-menu__panel {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 200px;
  background: var(--bg-2);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: var(--space-2);
  z-index: var(--z-dropdown);
  animation: ui-fade-in var(--dur-fast) var(--ease-out);
}
.ui-user-menu__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  background: transparent;
  border: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--text);
  font: inherit;
  font-size: var(--text-sm);
  cursor: pointer;
  text-align: left;
  text-decoration: none;
}
.ui-user-menu__item:hover { background: var(--surface-2); }
.ui-user-menu__divider {
  height: 1px;
  background: var(--border);
  margin: var(--space-1) 0;
}
.ui-skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--accent);
  color: white;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  z-index: var(--z-tooltip);
}
.ui-skip-link:focus { left: var(--space-2); top: var(--space-2); }
.ui-mobile-trigger {
  display: none;
  background: transparent;
  border: 1px solid var(--border);
  width: 40px; height: 40px;
  border-radius: var(--radius-sm);
  color: var(--text);
  cursor: pointer;
  align-items: center;
  justify-content: center;
}
.ui-mobile-trigger:hover { background: var(--surface); }
.ui-mobile-drawer {
  position: fixed;
  inset: 64px 0 0 0;
  background: var(--bg-1);
  border-top: 1px solid var(--border);
  padding: var(--space-4);
  z-index: var(--z-modal);
  animation: ui-fade-in var(--dur-base) var(--ease-out);
}
.ui-mobile-drawer__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.ui-mobile-drawer__link {
  font-size: var(--text-md);
  font-weight: 500;
  color: var(--text);
  text-decoration: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
}
.ui-mobile-drawer__link:hover { background: var(--surface); }
.ui-mobile-drawer__link--active { background: var(--surface-2); }
@media (max-width: 767px) {
  .ui-topbar__inner { padding: 0 var(--space-4); }
  .ui-topbar__nav { display: none; }
  .ui-mobile-trigger { display: flex; }
}

.ui-app-main {
  max-width: var(--container);
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}
@media (max-width: 767px) {
  .ui-app-main { padding: var(--space-5) var(--space-4); }
}
```

- [ ] **Step 2: Create `components/admin/Logo.tsx`:**

```tsx
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M20 4 L34 12 L34 28 L20 36 L6 28 L6 12 Z"
        fill="url(#logo-grad)"
        opacity="0.95"
      />
      <path
        d="M14 16 L20 12 L26 16 L26 24 L20 28 L14 24 Z"
        fill="var(--bg)"
      />
    </svg>
  );
}
```

- [ ] **Step 3: Create `components/admin/AdminShell.tsx`:**

```tsx
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

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

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
          </div>
        </div>
      </header>

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

      <main id="main" className="ui-app-main">{children}</main>
    </div>
  );
}
```

### Task 2.4: Restructure /admin into route groups

**Files:**
- Create: `app/admin/(auth)/layout.tsx`
- Create: `app/admin/(app)/layout.tsx`
- **Move (cut & paste, do NOT just copy):** `app/admin/login/page.tsx` → `app/admin/(auth)/login/page.tsx`
- **Move:** `app/admin/change-password/page.tsx` → `app/admin/(auth)/change-password/page.tsx`
- **Move:** `app/admin/page.tsx` → `app/admin/(app)/page.tsx`
- **Move entire dir:** `app/admin/settings/` → `app/admin/(app)/settings/`
- **Leave alone for now:** `app/admin/welcome/page.tsx` (removed in Task 3.3)

- [ ] **Step 1: Use `mv` to move files.** Run from project root:

```bash
mkdir -p app/admin/\(auth\)/login app/admin/\(auth\)/change-password
mkdir -p app/admin/\(app\)
mv app/admin/login/page.tsx app/admin/\(auth\)/login/page.tsx
mv app/admin/change-password/page.tsx app/admin/\(auth\)/change-password/page.tsx
mv app/admin/page.tsx app/admin/\(app\)/page.tsx
mv app/admin/settings app/admin/\(app\)/settings
rmdir app/admin/login app/admin/change-password
```

- [ ] **Step 2: Create `app/admin/(auth)/layout.tsx`:**

```tsx
import { ReactNode } from "react";
import { AuthShell } from "@/components/admin/AuthShell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
```

- [ ] **Step 3: Create `app/admin/(app)/layout.tsx`:**

```tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/admin/login");

  return (
    <AdminShell
      user={{
        id: profile.id,
        full_name: profile.full_name ?? "",
        role: profile.role as "admin" | "super_admin",
        email: user.email ?? null,
      }}
    >
      {children}
    </AdminShell>
  );
}
```

- [ ] **Step 4: Confirm `lib/supabase/server.ts` exports `createServerSupabase`.** If the existing export is named differently (e.g., `createClient`), update the import in `(app)/layout.tsx` to match. Run `grep -n "export" lib/supabase/server.ts` to check.

- [ ] **Step 5: Restart dev server (Turbopack cache may not pick up route group moves automatically).** Stop the dev process (TaskStop the background bash, or Ctrl+C in terminal), then `npm run dev` again.

- [ ] **Step 6: Browser verify URLs unchanged.** Visit each:
  - `http://localhost:3002/admin/login` → renders, no topbar (AuthShell)
  - `http://localhost:3002/admin` → renders, topbar present (logged in user only)
  - `http://localhost:3002/admin/settings` → renders, topbar present
  - `http://localhost:3002/admin/change-password` → renders, no topbar

  If a 404 appears, the route group folder names are likely wrong — parentheses are part of the folder name (`(auth)`, `(app)`).

- [ ] **Step 7: Console + network check.** All 5 routes 200 OK. No JS errors in console. Topbar renders correctly on the (app) routes only.

---

## Phase 3 — Auth pages

### Task 3.1: Rewrite login page

**Files:**
- Modify: `app/admin/(auth)/login/page.tsx` (full rewrite)

- [ ] **Step 1: Read the existing file to find:**
  - Supabase client creation pattern (`createClient`)
  - Sign-in call shape (`signInWithPassword`)
  - Reset password call shape (`resetPasswordForEmail`)
  - Redirect target after success

  Run `cat app/admin/\(auth\)/login/page.tsx` (use Read tool, not bash for files) and note the import names.

- [ ] **Step 2: Replace contents with:**

```tsx
"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/admin/Logo";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

type Mode = "login" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const emailRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { emailRef.current?.focus(); }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) { setError(err.message === "Invalid login credentials" ? "E-posta veya şifre hatalı." : err.message); return; }
    const redirectTo = params.get("redirect") ?? "/admin";
    router.replace(redirectTo);
    router.refresh();
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setInfo("Şifre sıfırlama bağlantısı e-postana gönderildi.");
  }

  return (
    <>
      <div className="ui-auth-card__logo">
        <Logo size={32} />
        <div>
          <h1 className="ui-auth-card__title">{mode === "login" ? "Yönetim Paneli" : "Şifre Sıfırla"}</h1>
          <p className="ui-auth-card__sub">
            {mode === "login" ? "Devam etmek için giriş yap" : "E-posta adresini gir, bağlantı gönderelim"}
          </p>
        </div>
      </div>

      <form className="ui-auth-form" onSubmit={mode === "login" ? handleLogin : handleReset} noValidate>
        <Input
          ref={emailRef}
          label="E-posta"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ornek@firma.com"
        />
        {mode === "login" && (
          <PasswordInput
            label="Şifre"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        )}

        {error && (
          <div role="alert" style={{ color: "var(--danger)", fontSize: "var(--text-sm)", background: "var(--danger-bg)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            {error}
          </div>
        )}
        {info && (
          <div role="status" style={{ color: "var(--success)", fontSize: "var(--text-sm)", background: "var(--success-bg)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            {info}
          </div>
        )}

        <Button type="submit" variant="primary" block loading={busy}>
          {mode === "login" ? "Giriş Yap" : "Bağlantı Gönder"}
        </Button>

        <button
          type="button"
          className="ui-auth-link"
          onClick={() => { setMode(mode === "login" ? "reset" : "login"); setError(""); setInfo(""); }}
        >
          {mode === "login" ? "Şifremi unuttum" : "Girişe geri dön"}
        </button>
      </form>
    </>
  );
}
```

- [ ] **Step 3: Browser verify login.** Visit `http://localhost:3002/admin/login`:
  - Logo + "Yönetim Paneli" title renders
  - Email field auto-focused
  - Bad password attempt → red error inline (not full page)
  - Click "Şifremi unuttum" → form switches to reset mode
  - Switch back, attempt valid login → redirects to `/admin`
  - Mobile 375px viewport: card fits, no horizontal scroll
  - Console: 0 errors

### Task 3.2: Rewrite change-password page (min length 8)

**Files:**
- Modify: `app/admin/(auth)/change-password/page.tsx`

- [ ] **Step 1: Read existing file** to find Supabase calls used.

- [ ] **Step 2: Replace contents with:**

```tsx
"use client";

import { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/admin/Logo";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/hooks/useToast";

function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABEL = ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"];
const STRENGTH_COLOR = ["#6b7390", "#f87171", "#fbbf24", "#60a5fa", "#34d399"];

export default function ChangePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const score = useMemo(() => scorePassword(pw1), [pw1]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (pw1.length < 8) { setError("Şifre en az 8 karakter olmalı."); return; }
    if (pw1 !== pw2) { setError("Şifreler eşleşmiyor."); return; }
    setBusy(true);
    const { error: updErr } = await supabase.auth.updateUser({ password: pw1 });
    if (updErr) { setBusy(false); setError(updErr.message); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ must_change_password: false }).eq("id", user.id);
    }
    setBusy(false);
    toast.success("Şifre güncellendi");
    router.replace("/admin");
    router.refresh();
  }

  return (
    <>
      <div className="ui-auth-card__logo">
        <Logo size={32} />
        <div>
          <h1 className="ui-auth-card__title">Yeni Şifre Belirle</h1>
          <p className="ui-auth-card__sub">Güvenlik için yeni bir şifre belirle (en az 8 karakter)</p>
        </div>
      </div>

      <form className="ui-auth-form" onSubmit={onSubmit} noValidate>
        <PasswordInput
          label="Yeni Şifre"
          autoComplete="new-password"
          required
          value={pw1}
          onChange={e => setPw1(e.target.value)}
          helperText="En az 8 karakter; büyük/küçük harf, rakam ve sembol önerilir"
        />

        <div aria-live="polite" aria-atomic="true">
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: "var(--radius-full)",
                  background: i < score ? STRENGTH_COLOR[score] : "var(--border)",
                  transition: "background var(--dur-fast) var(--ease-out)",
                }}
              />
            ))}
          </div>
          {pw1.length > 0 && (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", marginTop: 4 }}>
              Kuvvet: <span style={{ color: STRENGTH_COLOR[score] }}>{STRENGTH_LABEL[score]}</span>
            </div>
          )}
        </div>

        <PasswordInput
          label="Yeni Şifre (Tekrar)"
          autoComplete="new-password"
          required
          value={pw2}
          onChange={e => setPw2(e.target.value)}
          errorText={pw2.length > 0 && pw1 !== pw2 ? "Şifreler eşleşmiyor" : undefined}
        />

        {error && (
          <div role="alert" style={{ color: "var(--danger)", fontSize: "var(--text-sm)", background: "var(--danger-bg)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" block loading={busy}>
          Şifreyi Güncelle
        </Button>
      </form>
    </>
  );
}
```

- [ ] **Step 3: Browser verify.** Visit `http://localhost:3002/admin/change-password` (requires being logged in with `must_change_password=true` profile; if not present, temporarily set it via Supabase Studio for testing):
  - 7-char input → submit blocked with "en az 8 karakter"
  - Mismatched fields → submit blocked
  - Valid 8+ chars, matching → success toast + redirect to /admin
  - Strength meter updates as you type
  - Console: 0 errors

### Task 3.3: Remove `/admin/welcome` and update proxy redirect

**Files:**
- Delete: `app/admin/welcome/page.tsx` (and its parent directory if it becomes empty)
- Modify: `proxy.ts`

- [ ] **Step 1: Delete welcome page.** Run:

```bash
rm -rf app/admin/welcome
```

- [ ] **Step 2: Read `proxy.ts` and locate the redirect targeting `/admin/welcome`.** The existing code likely has:

```ts
if (pathname === "/admin/login" && user) {
  return NextResponse.redirect(new URL("/admin/welcome", request.url));
}
```

- [ ] **Step 3: Edit `proxy.ts` to redirect to `/admin` instead:**

```ts
if (pathname === "/admin/login" && user) {
  return NextResponse.redirect(new URL("/admin", request.url));
}
```

- [ ] **Step 4: Browser verify.** Open a private/incognito window, visit `http://localhost:3002/admin/login`. Sign in. You should land on `/admin` directly (no welcome splash). Visit `/admin/welcome` directly → 404. Console: 0 errors.

### Task 3.4: WelcomeToast component

**Files:**
- Create: `components/admin/WelcomeToast.tsx`

- [ ] **Step 1: Create the file:**

```tsx
"use client";
import { useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";

const KEY = "softnox-welcome-toast-shown";

export function WelcomeToast({ name }: { name: string }) {
  const toast = useToast();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");
    toast.success(name ? `Hoş geldin, ${name}!` : "Hoş geldin!");
  }, [name, toast]);
  return null;
}
```

The toast fires once per browser session (cleared when browser tab closes). It will be mounted in the CRM dashboard in Task 4.1.

---

## Phase 4 — CRM Dashboard rewrite

### Task 4.1: Page header and stat cards

**Files:**
- Create: `components/admin/crm/StatCard.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}
.ui-page-head__title {
  font-size: var(--text-2xl);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text);
  margin: 0;
}
.ui-page-head__sub {
  font-size: var(--text-sm);
  color: var(--text-dim);
  margin-top: var(--space-1);
}
@media (max-width: 767px) {
  .ui-page-head { flex-direction: column; align-items: stretch; }
}

.ui-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}
@media (max-width: 1023px) {
  .ui-stat-grid { grid-template-columns: repeat(2, 1fr); }
}
.ui-stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: border-color var(--dur-fast) var(--ease-out);
}
.ui-stat:hover { border-color: var(--border-strong); }
.ui-stat__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ui-stat__label {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-mute);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.ui-stat__icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}
.ui-stat__value {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.02em;
  font-feature-settings: "tnum";
}
```

- [ ] **Step 2: Create `components/admin/crm/StatCard.tsx`:**

```tsx
import { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone: "neutral" | "success" | "warning" | "info" | "danger";
}

const TONE_BG: Record<StatCardProps["tone"], string> = {
  neutral: "var(--surface-2)",
  success: "var(--success-bg)",
  warning: "var(--warning-bg)",
  info:    "var(--info-bg)",
  danger:  "var(--danger-bg)",
};
const TONE_FG: Record<StatCardProps["tone"], string> = {
  neutral: "var(--text-dim)",
  success: "var(--success)",
  warning: "var(--warning)",
  info:    "var(--info)",
  danger:  "var(--danger)",
};

export function StatCard({ label, value, icon, tone }: StatCardProps) {
  return (
    <div className="ui-stat">
      <div className="ui-stat__head">
        <span className="ui-stat__label">{label}</span>
        <span
          className="ui-stat__icon"
          style={{ background: TONE_BG[tone], color: TONE_FG[tone] }}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <div className="ui-stat__value">{value}</div>
    </div>
  );
}
```

### Task 4.2: ContactDetailSheet component

**Files:**
- Create: `components/admin/crm/ContactDetailSheet.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-detail-section { margin-bottom: var(--space-6); }
.ui-detail-section:last-child { margin-bottom: 0; }
.ui-detail-section__head {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-mute);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--space-3);
}
.ui-detail-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  font-size: var(--text-sm);
  align-items: baseline;
}
.ui-detail-row__label {
  color: var(--text-mute);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ui-detail-row__value { color: var(--text); word-break: break-word; }
.ui-detail-link {
  color: var(--accent);
  text-decoration: none;
}
.ui-detail-link:hover { color: var(--accent-hover); text-decoration: underline; }
```

- [ ] **Step 2: Create `components/admin/crm/ContactDetailSheet.tsx`:**

```tsx
"use client";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import type { Contact } from "./types";

export interface ContactDetailSheetProps {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
  onEdit: (c: Contact) => void;
  onDelete: (c: Contact) => void;
  onHistory: (c: Contact) => void;
}

function fmtCurrency(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return "—";
  const cur = currency ?? "₺";
  return `${cur} ${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2 }).format(amount)}`;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

export function ContactDetailSheet({ contact, open, onClose, onEdit, onDelete, onHistory }: ContactDetailSheetProps) {
  if (!contact) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={contact.sirket_adi}
      description={contact.sahip_adi ?? undefined}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={() => onHistory(contact)}>Geçmiş</Button>
          <Button variant="secondary" onClick={() => onEdit(contact)}>Düzenle</Button>
          <Button variant="danger" onClick={() => onDelete(contact)}>Sil</Button>
        </>
      }
    >
      <div style={{ marginBottom: "var(--space-4)" }}>
        <StatusBadge sonuc={contact.sonuc ?? "Beklemede"} />
      </div>

      <div className="ui-detail-section">
        <div className="ui-detail-section__head">İletişim</div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Telefon</span>
          <span className="ui-detail-row__value">
            {contact.telefon ? <a className="ui-detail-link" href={`tel:${contact.telefon}`}>{contact.telefon}</a> : "—"}
          </span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">E-posta</span>
          <span className="ui-detail-row__value">
            {contact.email ? <a className="ui-detail-link" href={`mailto:${contact.email}`}>{contact.email}</a> : "—"}
          </span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Web</span>
          <span className="ui-detail-row__value">
            {contact.website_url ? <a className="ui-detail-link" href={contact.website_url} target="_blank" rel="noreferrer">{contact.website_url}</a> : "—"}
          </span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Konum</span>
          <span className="ui-detail-row__value">
            {contact.google_maps_url ? <a className="ui-detail-link" href={contact.google_maps_url} target="_blank" rel="noreferrer">Haritada Gör</a> : "—"}
          </span>
        </div>
      </div>

      <div className="ui-detail-section">
        <div className="ui-detail-section__head">Mali</div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Anlaşılan</span>
          <span className="ui-detail-row__value">{fmtCurrency(contact.anlasilan_ucret, contact.anlasilan_para_birimi)}</span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Alınan</span>
          <span className="ui-detail-row__value">{fmtCurrency(contact.alinan_ucret, contact.alinan_para_birimi)}</span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Kalan</span>
          <span className="ui-detail-row__value">{fmtCurrency(contact.kalan_ucret, contact.kalan_para_birimi)}</span>
        </div>
      </div>

      <div className="ui-detail-section">
        <div className="ui-detail-section__head">Diğer</div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">İletişim Tarihi</span>
          <span className="ui-detail-row__value">{fmtDate(contact.iletisim_tarihi)}</span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Yapılan İşler</span>
          <span className="ui-detail-row__value" style={{ whiteSpace: "pre-wrap" }}>{contact.yapilan_isler || "—"}</span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Not</span>
          <span className="ui-detail-row__value" style={{ whiteSpace: "pre-wrap" }}>{contact.not_kismi || "—"}</span>
        </div>
        <div className="ui-detail-row">
          <span className="ui-detail-row__label">Sözleşme</span>
          <span className="ui-detail-row__value">
            {contact.sozlesme_url ? <a className="ui-detail-link" href={contact.sozlesme_url} target="_blank" rel="noreferrer">Sözleşmeyi Aç</a> : "—"}
          </span>
        </div>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 3: Create the supporting types file `components/admin/crm/types.ts`:**

```ts
export interface Contact {
  id: string;
  sirket_adi: string;
  sahip_adi: string | null;
  telefon: string | null;
  email: string | null;
  website_url: string | null;
  google_maps_url: string | null;
  not_kismi: string | null;
  alinan_ucret: number | null;
  alinan_para_birimi: string | null;
  anlasilan_ucret: number | null;
  anlasilan_para_birimi: string | null;
  kalan_ucret: number | null;
  kalan_para_birimi: string | null;
  iletisim_tarihi: string | null;
  sonuc: string | null;
  yapilan_isler: string | null;
  sozlesme_url: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactLogEntry {
  id: string;
  contact_id: string;
  user_name: string | null;
  action: string;
  changes: Record<string, { from: unknown; to: unknown; label?: string }> | null;
  created_at: string;
}

export type ContactFormValues = Omit<Contact, "id" | "user_id" | "created_at" | "updated_at">;
```

### Task 4.3: ContactFormDialog (sectioned tabs)

**Files:**
- Create: `components/admin/crm/ContactFormDialog.tsx`

- [ ] **Step 1: Create the file:**

```tsx
"use client";
import { useState, FormEvent, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import type { Contact, ContactFormValues } from "./types";

export interface ContactFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: ContactFormValues, id: string | null) => Promise<void>;
  initial?: Contact | null;
}

type Section = "general" | "finance" | "notes";

const CURRENCIES = ["₺", "$", "€"];
const SONUC = ["Beklemede", "Olumlu", "Olumsuz", "Devam Ediyor"];

function emptyValues(): ContactFormValues {
  return {
    sirket_adi: "",
    sahip_adi: "",
    telefon: "",
    email: "",
    website_url: "",
    google_maps_url: "",
    not_kismi: "",
    alinan_ucret: null,
    alinan_para_birimi: "₺",
    anlasilan_ucret: null,
    anlasilan_para_birimi: "₺",
    kalan_ucret: null,
    kalan_para_birimi: "₺",
    iletisim_tarihi: new Date().toISOString().slice(0, 10),
    sonuc: "Beklemede",
    yapilan_isler: "",
    sozlesme_url: "",
  };
}

export function ContactFormDialog({ open, onClose, onSave, initial }: ContactFormDialogProps) {
  const [section, setSection] = useState<Section>("general");
  const [values, setValues] = useState<ContactFormValues>(emptyValues());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSection("general");
      setError(null);
      if (initial) {
        const { id: _id, user_id: _u, created_at: _c, updated_at: _u2, ...rest } = initial;
        setValues({ ...emptyValues(), ...rest });
      } else {
        setValues(emptyValues());
      }
    }
  }, [open, initial]);

  function set<K extends keyof ContactFormValues>(key: K, val: ContactFormValues[K]) {
    setValues(v => ({ ...v, [key]: val }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.sirket_adi.trim()) { setError("Şirket adı zorunlu."); setSection("general"); return; }
    setBusy(true);
    try {
      await onSave(values, initial?.id ?? null);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }

  const fieldStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" } as const;

  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : onClose}
      title={initial ? "Müşteriyi Düzenle" : "Yeni Müşteri"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Vazgeç</Button>
          <Button variant="primary" form="contact-form" type="submit" loading={busy}>
            {initial ? "Güncelle" : "Kaydet"}
          </Button>
        </>
      }
    >
      <Tabs<Section>
        value={section}
        onChange={setSection}
        items={[
          { value: "general", label: "Genel" },
          { value: "finance", label: "Mali" },
          { value: "notes",   label: "Notlar" },
        ]}
        ariaLabel="Form bölümleri"
      />

      <form id="contact-form" onSubmit={onSubmit} noValidate style={{ marginTop: "var(--space-4)" }}>
        <TabPanel value="general" activeValue={section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={fieldStyle}>
              <Input label="Şirket Adı" required value={values.sirket_adi} onChange={e => set("sirket_adi", e.target.value)} />
              <Input label="Sahip / İlgili Kişi" value={values.sahip_adi ?? ""} onChange={e => set("sahip_adi", e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <Input label="Telefon" type="tel" value={values.telefon ?? ""} onChange={e => set("telefon", e.target.value)} placeholder="+90 ..." />
              <Input label="E-posta" type="email" value={values.email ?? ""} onChange={e => set("email", e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <Input label="Web Sitesi" type="url" value={values.website_url ?? ""} onChange={e => set("website_url", e.target.value)} placeholder="https://" />
              <Input label="Google Maps URL" type="url" value={values.google_maps_url ?? ""} onChange={e => set("google_maps_url", e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <Input label="İletişim Tarihi" type="date" value={values.iletisim_tarihi ?? ""} onChange={e => set("iletisim_tarihi", e.target.value)} />
              <Select label="Durum" value={values.sonuc ?? "Beklemede"} onChange={e => set("sonuc", e.target.value)}>
                {SONUC.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="finance" activeValue={section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {(["anlasilan", "alinan", "kalan"] as const).map(field => {
              const amountKey = `${field}_ucret` as const;
              const currKey = `${field}_para_birimi` as const;
              const labels = { anlasilan: "Anlaşılan Ücret", alinan: "Alınan Ücret", kalan: "Kalan Ücret" } as const;
              return (
                <div key={field} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-3)" }}>
                  <Input
                    label={labels[field]}
                    type="number"
                    step="0.01"
                    value={values[amountKey] == null ? "" : String(values[amountKey])}
                    onChange={e => set(amountKey, e.target.value === "" ? null : Number(e.target.value))}
                  />
                  <Select label="Para Birimi" value={values[currKey] ?? "₺"} onChange={e => set(currKey, e.target.value)}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
              );
            })}
            <Input label="Sözleşme URL" type="url" value={values.sozlesme_url ?? ""} onChange={e => set("sozlesme_url", e.target.value)} placeholder="https://" />
          </div>
        </TabPanel>

        <TabPanel value="notes" activeValue={section}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Textarea label="Yapılan İşler" value={values.yapilan_isler ?? ""} onChange={e => set("yapilan_isler", e.target.value)} rows={4} />
            <Textarea label="Not" value={values.not_kismi ?? ""} onChange={e => set("not_kismi", e.target.value)} rows={6} />
          </div>
        </TabPanel>

        {error && (
          <div role="alert" style={{ marginTop: "var(--space-4)", color: "var(--danger)", fontSize: "var(--text-sm)", background: "var(--danger-bg)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            {error}
          </div>
        )}
      </form>
    </Dialog>
  );
}
```

### Task 4.4: CRMDashboard component

**Files:**
- Create: `components/admin/crm/CRMDashboard.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-search-bar {
  position: relative;
  margin-bottom: var(--space-4);
}
.ui-search-bar input {
  padding-left: var(--space-10);
}
.ui-search-bar__icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-mute);
  pointer-events: none;
}
```

- [ ] **Step 2: Create `components/admin/crm/CRMDashboard.tsx`:**

```tsx
"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
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
        onHistory={() => { /* History panel intentionally deferred — open existing log via separate dialog if needed */ }}
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
```

### Task 4.5: Wire `/admin` page

**Files:**
- Modify: `app/admin/(app)/page.tsx` (full rewrite)

- [ ] **Step 1: Replace contents with:**

```tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { CRMDashboard } from "@/components/admin/crm/CRMDashboard";
import type { Contact } from "@/components/admin/crm/types";

export const dynamic = "force-dynamic";

export default async function CRMPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, must_change_password")
    .eq("id", user.id)
    .single();

  if (profile?.must_change_password) redirect("/admin/change-password");

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <CRMDashboard
      initialContacts={(contacts ?? []) as Contact[]}
      userName={profile?.full_name ?? ""}
    />
  );
}
```

- [ ] **Step 2: Browser verify CRM dashboard.** Visit `http://localhost:3002/admin`:
  - Topbar with logo + CRM/Ayarlar nav + avatar
  - Welcome toast appears once (refresh — stays gone)
  - Page header, 4 stat cards (2x2 on mobile, 4x1 on desktop)
  - Search input filters in real-time
  - Click a row → detail sheet opens (bottom sheet on mobile, centered on desktop)
  - Click "+ Yeni Kayıt" → form dialog with 3 tabs (Genel/Mali/Notlar)
  - Try creating a test contact → toast appears, row shows in table
  - Edit existing → loads in form
  - Delete → confirm dialog → row removed
  - Empty search: try query "zzzz" → EmptyState renders with "Aramayı temizle"
  - 375px mobile viewport: table → cards, modal → bottom sheet
  - Console: 0 errors throughout

---

## Phase 5 — Settings rewrite

### Task 5.1: SettingsShell layout

**Files:**
- Create: `components/admin/SettingsShell.tsx`
- Create: `app/admin/(app)/settings/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-settings-shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--space-6);
  align-items: start;
}
.ui-settings-shell__nav {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  position: sticky;
  top: calc(64px + var(--space-5));
}
.ui-settings-shell__main {
  max-width: 920px;
  min-width: 0;
}
@media (max-width: 1023px) {
  .ui-settings-shell { grid-template-columns: 1fr; gap: var(--space-4); }
  .ui-settings-shell__nav {
    position: static;
    padding: 0;
    border-radius: 0;
    border: none;
    background: transparent;
    border-bottom: 1px solid var(--border);
  }
}
```

- [ ] **Step 2: Create `components/admin/SettingsShell.tsx`:**

```tsx
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
```

- [ ] **Step 3: Create `app/admin/(app)/settings/layout.tsx`:**

```tsx
import { ReactNode } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { SettingsShell } from "@/components/admin/SettingsShell";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  const isSuper = profile?.role === "super_admin";

  return (
    <SettingsShell
      items={[
        { href: "/admin/settings/profile", label: "Profil", visible: true },
        { href: "/admin/settings/users",   label: "Kullanıcılar", visible: isSuper },
        { href: "/admin/settings/audit",   label: "Aktivite Logu", visible: isSuper },
      ]}
    >
      {children}
    </SettingsShell>
  );
}
```

### Task 5.2: Settings index redirect

**Files:**
- Modify: `app/admin/(app)/settings/page.tsx` (was the old AdminSettings host — full replacement; old file content discarded)

- [ ] **Step 1: Replace contents with redirect:**

```tsx
import { redirect } from "next/navigation";

export default function SettingsIndex() {
  redirect("/admin/settings/profile");
}
```

### Task 5.3: ProfilePanel

**Files:**
- Create: `app/admin/(app)/settings/profile/page.tsx`
- Create: `components/admin/settings/ProfilePanel.tsx`

- [ ] **Step 1: Create `app/admin/(app)/settings/profile/page.tsx`:**

```tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ProfilePanel } from "@/components/admin/settings/ProfilePanel";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/admin/login");

  return (
    <ProfilePanel
      profile={{
        id: profile.id,
        email: user.email ?? "",
        full_name: profile.full_name ?? "",
        role: profile.role as "admin" | "super_admin",
      }}
    />
  );
}
```

- [ ] **Step 2: Create `components/admin/settings/ProfilePanel.tsx`:**

```tsx
"use client";
import { useState, FormEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { RoleBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/lib/hooks/useToast";
import { createClient } from "@/lib/supabase/client";

export interface ProfileShape {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "super_admin";
}

export function ProfilePanel({ profile }: { profile: ProfileShape }) {
  const supabase = createClient();
  const toast = useToast();

  const [fullName, setFullName] = useState(profile.full_name);
  const [savingName, setSavingName] = useState(false);

  const [showPw, setShowPw] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", profile.id);
    setSavingName(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profil güncellendi");
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    if (pwNew.length < 8) { toast.error("Yeni şifre en az 8 karakter olmalı"); return; }
    if (pwNew !== pwConfirm) { toast.error("Şifreler eşleşmiyor"); return; }
    setPwBusy(true);
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: profile.email, password: pwCurrent });
    if (signErr) { setPwBusy(false); toast.error("Mevcut şifre hatalı"); return; }
    const { error: updErr } = await supabase.auth.updateUser({ password: pwNew });
    setPwBusy(false);
    if (updErr) { toast.error(updErr.message); return; }
    setShowPw(false);
    setPwCurrent(""); setPwNew(""); setPwConfirm("");
    toast.success("Şifre güncellendi");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <Avatar name={profile.full_name || profile.email} size="lg" />
          <div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{profile.full_name || "İsimsiz"}</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginTop: 4 }}>{profile.email}</div>
            <div style={{ marginTop: 8 }}><RoleBadge role={profile.role} /></div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, margin: 0, marginBottom: "var(--space-4)" }}>Hesap Bilgileri</h2>
        <form onSubmit={saveName} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input label="Ad Soyad" value={fullName} onChange={e => setFullName(e.target.value)} required />
          <Input label="E-posta" value={profile.email} readOnly style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }} />
          <div>
            <Button type="submit" variant="primary" loading={savingName}>Kaydet</Button>
          </div>
        </form>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showPw ? "var(--space-4)" : 0 }}>
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 600, margin: 0 }}>Şifre</h2>
          {!showPw && <Button variant="secondary" onClick={() => setShowPw(true)}>Şifre Değiştir</Button>}
        </div>
        {showPw && (
          <form onSubmit={savePassword} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <PasswordInput label="Mevcut Şifre" autoComplete="current-password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} required />
            <PasswordInput label="Yeni Şifre" autoComplete="new-password" value={pwNew} onChange={e => setPwNew(e.target.value)} required helperText="En az 8 karakter" />
            <PasswordInput label="Yeni Şifre (Tekrar)" autoComplete="new-password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} required />
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Button type="submit" variant="primary" loading={pwBusy}>Güncelle</Button>
              <Button variant="ghost" onClick={() => { setShowPw(false); setPwCurrent(""); setPwNew(""); setPwConfirm(""); }} disabled={pwBusy}>Vazgeç</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
```

### Task 5.4: UsersPanel (super_admin only)

**Files:**
- Create: `app/admin/(app)/settings/users/page.tsx`
- Create: `components/admin/settings/UsersPanel.tsx`
- Create: `components/admin/settings/UserFormDialog.tsx`
- Create: `components/admin/settings/UserEditDialog.tsx`

- [ ] **Step 1: Create `app/admin/(app)/settings/users/page.tsx`:**

```tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { UsersPanel } from "@/components/admin/settings/UsersPanel";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") redirect("/admin/settings/profile");

  return <UsersPanel />;
}
```

- [ ] **Step 2: Create `components/admin/settings/UserFormDialog.tsx`:**

```tsx
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
```

- [ ] **Step 3: Create `components/admin/settings/UserEditDialog.tsx`:**

```tsx
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
```

- [ ] **Step 4: Create `components/admin/settings/UsersPanel.tsx`:**

```tsx
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
```

### Task 5.5: AuditPanel (super_admin only)

**Files:**
- Create: `app/admin/(app)/settings/audit/page.tsx`
- Create: `components/admin/settings/AuditPanel.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Append to `globals.css`:**

```css
.ui-audit-list { display: flex; flex-direction: column; gap: var(--space-3); }
.ui-audit-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-4);
}
.ui-audit-item__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
  font-size: var(--text-sm);
  flex-wrap: wrap;
}
.ui-audit-item__who { font-weight: 500; color: var(--text); }
.ui-audit-item__what { color: var(--text-dim); }
.ui-audit-item__when { color: var(--text-mute); font-size: var(--text-xs); font-family: var(--font-mono); }
.ui-audit-diff {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}
.ui-audit-diff__label { color: var(--text-mute); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.04em; }
.ui-audit-diff__from { color: var(--text-dim); text-decoration: line-through; }
.ui-audit-diff__arrow { color: var(--text-mute); margin: 0 var(--space-2); }
.ui-audit-diff__to { color: var(--text); }
.ui-audit-filter {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}
```

- [ ] **Step 2: Create `app/admin/(app)/settings/audit/page.tsx`:**

```tsx
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { AuditPanel } from "@/components/admin/settings/AuditPanel";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "super_admin") redirect("/admin/settings/profile");

  return <AuditPanel />;
}
```

- [ ] **Step 3: Create `components/admin/settings/AuditPanel.tsx`:**

```tsx
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
```

- [ ] **Step 4: Browser verify Settings end-to-end.**
  - As super_admin, visit `http://localhost:3002/admin/settings` → redirect to `/profile`
  - Sidebar shows 3 items (Profil, Kullanıcılar, Aktivite Logu); active item highlighted
  - Click Kullanıcılar → user table loads, can create + edit + reset + force-change
  - Click Aktivite Logu → audit feed loads, filters work, "Daha fazla göster" pagination works
  - As plain admin (sign in to a non-super_admin account), visit `/admin/settings/users` → redirects to /profile
  - Sidebar shows only "Profil" (others hidden)
  - Mobile 375px: sidebar becomes horizontal tabs; works
  - Console: 0 errors

---

## Phase 6 — QA gauntlet

### Task 6.1: Console + network sweep

- [ ] **Step 1: Open DevTools Console.** Visit each route below in order, checking for errors:
  - `/admin/login`
  - `/admin` (logged in)
  - `/admin/change-password` (with `must_change_password=true` profile)
  - `/admin/settings/profile`
  - `/admin/settings/users` (as super_admin)
  - `/admin/settings/audit` (as super_admin)
  - Each route: 0 errors required. Warnings about React DevTools or Next.js dev-only messages are OK.

- [ ] **Step 2: Network tab on each route.** Filter to "Doc + Fetch + XHR". Every request returns 2xx or expected 3xx (auth redirects). Note any 4xx or 5xx and fix.

### Task 6.2: Viewport matrix sweep

For each viewport, visit `/admin/login`, `/admin`, `/admin/settings/profile`, `/admin/settings/users`, `/admin/settings/audit`. Take a mental screenshot for each cell of the matrix.

| Viewport | Width | Height | Test |
|---|---|---|---|
| iPhone SE | 375 | 667 | drawer nav, table → cards, modal → bottom sheet, no horizontal scroll |
| iPhone 11 | 414 | 896 | same as above |
| iPad | 768 | 1024 | drawer hidden, topbar visible, settings sidebar becomes horizontal tabs |
| iPad landscape | 1024 | 768 | full topbar, settings sidebar present, table visible |
| Desktop | 1440 | 900 | full layout, container max-width 1240px |

- [ ] **Step 1: Test each cell.** In Chrome DevTools, toggle device mode and select each device. Visit each of the 5 routes per viewport. Confirm:
  - No horizontal scrollbars
  - All buttons clickable (mobile touch targets ≥ 44px)
  - Modal opens correctly (bottom sheet on mobile, centered on desktop)
  - Table converts to cards under 768px
  - Settings sidebar converts to tabs under 1024px

- [ ] **Step 2: Note and fix any layout breaks** before moving on. Common fixes: add `min-width: 0` to grid children, `word-break: break-word` to long emails, increase mobile padding.

### Task 6.3: Keyboard-only walkthrough

- [ ] **Step 1: Disconnect mouse mentally.** Use Tab, Shift+Tab, Enter, ESC, Arrow keys only.
  - Login: Tab through fields, submit with Enter
  - CRM: Tab to "+ Yeni Kayıt", Enter, fill form, navigate between tabs with Arrow keys, submit
  - Detail sheet: open via Tab + Enter on a row, ESC to close, focus returns to the row
  - Settings sidebar: Arrow keys move between sections
  - User menu (top-right avatar): activate with Enter, ESC closes, focus returns to trigger

- [ ] **Step 2: Note any focus traps that don't work or focus rings missing.** Add `outline: 2px solid var(--accent)` style if any focusable lacks visible focus.

### Task 6.4: Reduced motion check

- [ ] **Step 1: Toggle System Preferences → Accessibility → Display → Reduce Motion** (macOS) or `prefers-reduced-motion: reduce` in DevTools rendering panel.

- [ ] **Step 2: Confirm:**
  - Toast slides become fades (effectively instant)
  - Modal entrance reduces to fade
  - Skeleton shimmer pauses (animation halted)
  - Spinner still rotates (intentional — spinners are exempt as they convey progress)

### Task 6.5: Cross-account RBAC test

- [ ] **Step 1: Plain admin account.** Sign in with non-super_admin user. Verify:
  - `/admin/settings/users` → redirects to `/profile`
  - `/admin/settings/audit` → redirects to `/profile`
  - Settings sidebar shows only "Profil"
  - User menu still works, profile editable

- [ ] **Step 2: Super admin account.** Sign in. Verify all 3 settings sections accessible. CRM full access.

### Task 6.6: Raw text + legacy class sweep

- [ ] **Step 1: Grep for raw "Yükleniyor..." strings.** Run:

```bash
grep -rn "Yükleniyor" app components --include="*.tsx" --include="*.ts" 2>/dev/null
```

Expected: 0 matches in component files (Spinner uses `aria-label="Yükleniyor"` which is intended). If any raw `<div>Yükleniyor...</div>` remain in old components, replace with `<Skeleton />` or `<Spinner />`.

- [ ] **Step 2: Grep for legacy class names that should be unused after Phase 7.** Run:

```bash
grep -rn "className=\"admin-topbar\|className=\"admin-main\|className=\"crm-badge\|className=\"crm-table" app components --include="*.tsx" 2>/dev/null
```

Expected: 0 matches. Any orphan reference means a component was forgotten in the rewrite.

- [ ] **Step 3: Visual text scan.** Open each page, read every visible string aloud. No i18n keys leaking (no dotted paths like `admin.users.title`), no English mixed in unexpectedly, no empty rendered cells where data should be "—".

### Task 6.7: TypeScript + lint

- [ ] **Step 1: Run `npx tsc --noEmit`.** Expected: 0 errors.

- [ ] **Step 2: Run `npm run lint`.** Expected: 0 errors. Warnings about `react-hooks/exhaustive-deps` in AuditPanel are acceptable (intentionally disabled comment).

---

## Phase 7 — Cleanup

### Task 7.1: Remove old components

**Files:**
- Delete: `components/admin/AdminCRM.tsx`
- Delete: `components/admin/AdminSettings.tsx`

- [ ] **Step 1: Verify no remaining imports.** Run:

```bash
grep -rn "from \"@/components/admin/AdminCRM\"\|from \"@/components/admin/AdminSettings\"" app components --include="*.tsx" --include="*.ts" 2>/dev/null
```

Expected: 0 matches. If any appear, the migration missed a wiring step.

- [ ] **Step 2: Delete the files:**

```bash
rm components/admin/AdminCRM.tsx components/admin/AdminSettings.tsx
```

- [ ] **Step 3: Browser sanity check.** Visit `/admin`, `/admin/settings/profile`, `/admin/settings/users`. All render correctly. Console: 0 errors.

### Task 7.2: Remove unused CSS rules

**Files:**
- Modify: `app/globals.css` (delete legacy class blocks)

- [ ] **Step 1: Identify legacy class blocks to remove.** Search `globals.css` for these class prefixes and inspect each block:
  - `.admin-topbar`, `.admin-main`, `.admin-page-head`, `.admin-shell`
  - `.crm-badge`, `.crm-badge--Beklemede`, `.crm-badge--Olumlu`, etc.
  - `.crm-table`, `.crm-table__*`, `.crm-table-wrap`, `.crm-stats`
  - `.modal`, `.modal-overlay`, `.modal__head`, `.modal__body`, `.modal__foot`, `.modal__close`, `.modal__close--touch`
  - `.btn` (the old base button class — NOT the new `.ui-btn`)
  - `.btn--primary`, `.btn--ghost`, `.btn--sm` (old variants)
  - `.field`, `.field__lbl` (old form classes)
  - `.detail-card__*`, `.detail-link`, `.detail-row__*` (old detail-panel classes)
  - `.admin-login__err`, `.admin-login__form`
  - `.welcome-fade-in` and `@keyframes` related to the deleted welcome page

  For each block, confirm via grep that no remaining `.tsx` file references it. If 0 references, delete the CSS block.

- [ ] **Step 2: Run a class reference audit.** Run for each legacy class:

```bash
# Repeat for each class name from Step 1
grep -rn 'className="[^"]*\bcrm-badge\b[^"]*"' app components --include="*.tsx" 2>/dev/null
grep -rn 'className="[^"]*\bcrm-table\b[^"]*"' app components --include="*.tsx" 2>/dev/null
grep -rn 'className="[^"]*\bmodal\b[^"]*"' app components --include="*.tsx" 2>/dev/null
grep -rn 'className="[^"]*\badmin-topbar\b[^"]*"' app components --include="*.tsx" 2>/dev/null
# ... etc
```

Only delete a CSS block when its grep returns 0 matches.

- [ ] **Step 3: Browser smoke test.** Reload each admin route. Visual check that nothing looks broken (no missing borders, no flat backgrounds where there should be cards). Console: 0 errors.

### Task 7.3: Type check + lint + final dev-mode walkthrough

- [ ] **Step 1: `npx tsc --noEmit`** — 0 errors.
- [ ] **Step 2: `npm run lint`** — 0 errors.
- [ ] **Step 3: `npm run build`** — must succeed. This catches anything Turbopack dev mode lets slide.
- [ ] **Step 4: Final full walkthrough** at 1440×900 desktop and 375×667 iPhone SE viewport. Smile at how it looks.

---

## Self-Review Checklist (run before handoff)

1. **Spec coverage:** Every spec section maps to a task. Quick map:
   - Spec §3 IA → Tasks 2.4, 3.3, 5.1, 5.2, 5.3, 5.4, 5.5
   - Spec §4 Tokens → Task 1.1
   - Spec §5 Components → Tasks 1.2 – 1.16
   - Spec §6 Layout/Responsive → Tasks 2.2, 2.3, 4.4, 5.1; verified in 6.2
   - Spec §7 Page designs → Tasks 3.1, 3.2, 4.1–4.5, 5.3, 5.4, 5.5
   - Spec §8 A11y → Tasks 1.13 (focus trap), 1.14 (tabs keyboard), 1.10 (form a11y); verified in 6.3, 6.4, 6.5
   - Spec §9 Phases → mirrored as Phase 1–7
   - Spec §10 Risks → mitigated in 7.1, 7.2 (legacy cleanup) and 6.x (verification)
   - Spec §11 DoD → Task 6 series

2. **Placeholder scan:** No "TBD", "TODO", "implement later", or "fill in details" appear in any task step.

3. **Type consistency:** `Contact`, `ContactFormValues`, `ContactLogEntry`, `UserRow`, `UserFormValues`, `UserEditValues`, `ProfileShape`, `AdminShellProps`, `SettingsNavItem` types are declared once and reused.

4. **Method/prop names match between tasks:**
   - `Dialog` accepts `open`, `onClose`, `title`, `description`, `size`, `footer`, `children`, `closeOnBackdrop`, `initialFocus` (consistent in Tasks 1.13, 4.2, 4.3, 5.4)
   - `Button` accepts `variant`, `size`, `loading`, `block`, `leftIcon`, `iconOnly` (consistent throughout)
   - `DataTable` accepts `rows`, `columns`, `rowKey`, `onRowClick`, `selectedKey`, `loading`, `empty`, `ariaLabel` (Tasks 1.15, 4.4, 5.4)
   - `useToast()` returns `{ success, error, info, warning, show, dismiss }` (Tasks 1.12, 3.2, 3.4, 4.4, 5.3, 5.4, 5.5)
   - `useFocusTrap<T>(active)` returns `Ref<T>` (Tasks 1.2, 1.13)
   - `createServerSupabase` is the server import (verify name in Task 2.4 Step 4 before relying on it)
   - `createClient` is the browser client import (consistent in 3.1, 3.2, 5.3, 5.4 via fetch, AdminShell, etc.)

5. **Ambiguity check:** Each "browser verify" step lists exact URL, viewports, and what to look for.

---

## Execution Notes

- **Single-branch incremental.** All work on a feature branch. Browser-verify after every phase; do not advance with broken pages.
- **No commits until user explicitly asks** (per user CLAUDE.md). Mention progress in chat instead.
- **Restart dev server after route group moves** (Task 2.4) — Turbopack dev cache occasionally misses these.
- **Test accounts ready:** super_admin + plain admin must exist before Phase 6. Create plain admin via Users panel as soon as Phase 5 lands.
- **Welcome page deletion is in Task 3.3, NOT during Phase 1.** Do not delete `app/admin/welcome/` before the proxy.ts redirect change lands in the same task, or you create a 404 window.



