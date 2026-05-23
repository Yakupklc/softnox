# Admin UI Redesign — Design Spec

**Date:** 2026-05-23
**Status:** Approved by user, ready for implementation planning
**Scope:** `/admin/*` section of Softnox CRM (5 existing pages + 2 new sub-routes)
**Risk profile:** Presentation-layer only. No schema, RLS, API route, or business-logic changes.

---

## 1. Goals

1. Modern visual treatment in a Premium / Vercel-Linear hybrid direction (high-contrast dark, glass surfaces, sharp typography, micro-interactions) — built on the existing design token system.
2. Excellent mobile responsiveness (desktop-primary, perfect mobile fallback) — current panel has only 2 media queries; we need a full breakpoint strategy.
3. WCAG 2.1 AA accessibility (focus management, ARIA, keyboard navigation, color contrast, reduced-motion support).
4. Cohesive component primitives that replace inline JSX scattered across two 900+ line components.
5. Settings section expanded from a single user-management page to a three-section panel (Profile, Users, Audit Log) with no new tables.

## 2. Non-Goals (out of scope)

- New CRM features. The user explicitly chose "saf UI/UX refresh + responsive" — no filter chips, no command palette, no dashboard analytics, no new columns.
- Public site (`SiteApp.tsx`) — untouched.
- Tailwind / shadcn migration — staying with custom CSS to avoid regression risk.
- Schema changes, new tables, new RLS policies, new API endpoints.
- i18n framework — Turkish strings stay hardcoded; the user did not request multi-language.

## 3. Information Architecture

### 3.1 Routes

| Route | Status | Purpose |
|---|---|---|
| `/admin/login` | rewritten | Email/password login with inline forgot-password |
| `/admin/change-password` | rewritten | Forced first-login password change (min length raised 6 → 8) |
| `/admin/welcome` | **removed** | Replaced by a session-scoped welcome toast on `/admin` |
| `/admin` | rewritten | CRM dashboard (stats + table + detail panel + create/edit) |
| `/admin/settings` | redirects to `/admin/settings/profile` | — |
| `/admin/settings/profile` | new | Every user edits own name + password |
| `/admin/settings/users` | rewritten | User management (super_admin only) |
| `/admin/settings/audit` | new | Activity log from `contact_logs` (super_admin only) |

### 3.2 Navigation pattern

- **AdminShell (persistent topbar)** on every admin route except auth pages:
  - Left: logo, primary nav (CRM · Settings)
  - Right: avatar dropdown (Profile, Logout)
  - Sticky, 64px tall, glass effect via `backdrop-filter`
  - Mobile (<768px): primary nav collapses into a hamburger drawer
- **SettingsShell (nested layout)** inside `/admin/settings/*`:
  - Desktop: 240px left sidebar with sub-section links
  - Mobile: horizontal scrollable segmented tabs above content
  - Super_admin gating: Users and Audit links hidden for plain admin role
- **AuthShell** for login + change-password: centered card on full-bleed background.

## 4. Design Tokens

All new tokens are **additive** — existing tokens are preserved verbatim so legacy class names continue to work during the migration.

### 4.1 Color (additions to globals.css)

```css
/* Primary state variants (new) */
--accent-hover:   #2563eb;
--accent-pressed: #1d4ed8;

/* Semantic (new) */
--success:    #34d399;   --success-bg: rgba(52,211,153,0.10);
--warning:    #fbbf24;   --warning-bg: rgba(251,191,36,0.10);
--danger:     #f87171;   --danger-bg:  rgba(239,68,68,0.10);
--info:       #60a5fa;   --info-bg:    rgba(96,165,250,0.10);

/* Role-only (new) */
--role-super: #a78bfa;   /* super_admin badge */
--role-admin: #60a5fa;   /* admin badge */
```

Existing `--accent`, `--accent-2`, `--accent-3`, `--accent-glow` preserved. Cyan and purple stay as decorative accents in auth-page gradients only — primary UI uses blue.

### 4.2 Typography scale

```css
--text-xs:   12px / 16;
--text-sm:   13px / 18;
--text-base: 14px / 20;
--text-md:   15px / 22;
--text-lg:   17px / 24;
--text-xl:   20px / 28;
--text-2xl:  24px / 32;
--text-3xl:  32px / 40;
```

Heading letter-spacing: -0.01em. Body letter-spacing default. Mono (JetBrains) reserved for emails, IDs, code.

### 4.3 Spacing scale

```css
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-5: 20px;  --space-6: 24px;
--space-8: 32px;  --space-10: 40px; --space-12: 48px;
--space-16: 64px;
```

### 4.4 Elevation

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.30);
--shadow-md:  0 4px 16px rgba(0,0,0,0.40);
--shadow-lg:  0 12px 48px rgba(0,0,0,0.50), 0 0 0 1px var(--border);
--shadow-glow: 0 0 24px var(--accent-glow);

--blur-sm: blur(8px);
--blur-md: blur(16px);
```

### 4.5 Motion

```css
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

--dur-fast: 120ms;
--dur-base: 200ms;
--dur-slow: 320ms;
```

`prefers-reduced-motion: reduce` query forces all durations to 0.01ms and pauses keyframe animations.

### 4.6 Radius and z-index

```css
--radius-sm: 8px;   /* preserved */
--radius:    14px;  /* preserved */
--radius-lg: 20px;  /* preserved */
--radius-xl: 28px;  /* new — large cards/modals */
--radius-full: 9999px; /* new — pills, avatars */

--z-base: 0;       --z-sticky: 10;
--z-dropdown: 20;  --z-modal-bg: 40;
--z-modal: 50;     --z-toast: 60;
--z-tooltip: 70;
```

## 5. Component Library

New `components/ui/` directory holds reusable primitives. Existing `components/admin/AdminCRM.tsx` and `AdminSettings.tsx` are removed at the end of Phase 7 once replacements are wired.

### 5.1 Primitives (`components/ui/`)

| File | Purpose |
|---|---|
| `Button.tsx` | Variants: primary, ghost, danger, secondary. Sizes: sm, md, lg. Loading state with Spinner |
| `Card.tsx` | Surface variants with optional padding and elevation |
| `Dialog.tsx` | Focus trap, ESC close, backdrop click, scroll lock, `aria-modal`, restore focus. Mobile = bottom sheet, desktop = centered |
| `ConfirmDialog.tsx` | Specialized Dialog for destructive confirmations |
| `Tabs.tsx` | `role="tablist/tab/tabpanel"`, arrow keys, Home/End, URL-driven for settings |
| `Input.tsx` | Label + helper + error + icon slot |
| `PasswordInput.tsx` | Eye toggle, optional Caps Lock hint |
| `Select.tsx` | Native `<select>` styled (a11y preserved) |
| `Textarea.tsx` | Auto-resize optional |
| `Badge.tsx` | Variants: success, warning, danger, info, role-super, role-admin |
| `Avatar.tsx` | Initials + deterministic color |
| `Toast.tsx` + `ToastProvider` | `useToast()` hook, stacked, auto-dismiss, swipe-to-dismiss on mobile |
| `Skeleton.tsx` | Shimmer with reduced-motion handling |
| `EmptyState.tsx` | Icon + title + body + optional CTA |
| `DataTable.tsx` | Desktop table → mobile cards via column `priority` and `mobileLabel` |
| `Spinner.tsx` | Inline + button variants |

### 5.2 Admin layout & feature components

```
components/admin/
  AdminShell.tsx              persistent topbar + main wrapper
  SettingsShell.tsx           sidebar / mobile segmented tabs
  CRMDashboard.tsx            replaces AdminCRM.tsx
  ContactDetailSheet.tsx      mobile bottom sheet / desktop side panel
  ContactFormDialog.tsx       sectioned form (Genel · Mali · Notlar)
  settings/
    ProfilePanel.tsx
    UsersPanel.tsx            replaces AdminSettings.tsx
    AuditPanel.tsx
    UserFormDialog.tsx
    UserEditDialog.tsx
```

## 6. Layout & Responsive Strategy

### 6.1 Breakpoints

```
mobile:  < 768px   drawer nav, single column, full-screen modal = bottom sheet, table → cards
tablet:  768-1023  topbar visible, some table columns hidden by priority
desktop: ≥ 1024    full layout, side panel detail, full table
wide:    ≥ 1440    --container max-width activates
```

### 6.2 CRM Dashboard responsive table

`DataTable.tsx` takes a `columns` array with optional `priority: number` and `mobileLabel: string`. Below 768px each row renders as a card: company name as title, status badge top-right, key contact as compact row, "Detayları gör" CTA.

### 6.3 Detail panel

- Mobile: bottom sheet, drag handle, `touch-action: pan-y`, drag-to-dismiss, body scroll locked
- Desktop: 480px right side panel with semi-opaque backdrop blur

### 6.4 Touch targets

All interactive elements ≥ 44×44px. Form inputs 44px mobile / 40px desktop. Modal close button enlarged to 44px.

## 7. Page Designs (summary)

### 7.1 `/admin/login`

Centered AuthShell card. Email + PasswordInput. Inline "Şifremi unuttum" toggle (existing pattern). Submit button has Spinner + "Giriş yapılıyor..." while in flight. Caps Lock hint inside PasswordInput. `aria-live="polite"` error message. Auto-focus email on mount. Gradient glow reduced from 0.35 → 0.20 alpha.

### 7.2 `/admin/change-password`

AuthShell card. Two PasswordInput fields + 4-segment strength meter. **Minimum length 6 → 8** (only affects new submissions). On success: toast "Şifre güncellendi" → redirect `/admin`.

### 7.3 `/admin` (CRM Dashboard)

- Page header: H1 "Müşteri Listesi" + subtitle + right-aligned "+ Yeni Kayıt"
- Stat cards (4): icon + big number + optional delta. Mobile = 2×2 grid, desktop = 4×1.
- DataTable with skeleton loading, two empty states (no records vs no search results — different CTAs), sticky header on scroll, status badge from semantic tokens, row hover affordance.
- ContactDetailSheet: sectioned (Genel · Mali · Notlar · Sözleşme), phone tap menu (Ara / WhatsApp) preserved.
- **ContactFormDialog: sectioned form** with Genel · Mali · Notlar tabs. Required marker `*`. Currency suffix dropdown (₺/$/€). Inline field errors. Submit shows Spinner.
- Welcome toast: `sessionStorage` flag prevents repeat firing on refresh.

### 7.4 `/admin/settings/profile`

Avatar + role badge header. Form: full_name editable + email readonly (mono). "Şifre Değiştir" expands inline: mevcut şifre + yeni + tekrar. Direct Supabase client calls — no API change. Toast feedback.

### 7.5 `/admin/settings/users` (super_admin only)

Page-level guard: non-super_admin direct URL access redirects to `/admin/settings/profile`. Page header + "+ Yeni Kullanıcı". UserFormDialog modal for create (with default-password warning banner inside the dialog). DataTable with action buttons (Reset · Edit · Force-change) — icons + tooltips. Mobile = card per user. UserEditDialog modal for edit. ConfirmDialog for destructive actions.

### 7.6 `/admin/settings/audit` (super_admin only)

Page-level guard: non-super_admin direct URL access redirects to `/admin/settings/profile`. Feed of `contact_logs` records (time-sorted cards):
```
Yakup Can KILIÇ · Acsisco · güncellendi
  telefon: +90 551 162 13 59 → +90 555 …
  sonuc:   Beklemede → Olumlu
22.05.2026 · 14:32
```
Filter: son 7 gün / 30 gün / tümü. Paginated 50/page. Direct Supabase query — no API change. Existing `changes` jsonb column already holds field-level diff.

### 7.7 Welcome toast (replaces `/admin/welcome` page)

On `/admin` first mount per session: `toast.success("Hoş geldin {ad}!")`. SessionStorage key prevents repeat on refresh. Proxy.ts updated to redirect post-login directly to `/admin` instead of `/admin/welcome`.

## 8. Accessibility & HCI

### 8.1 Keyboard

- All interactive elements tab-reachable
- Focus ring always visible: `outline: 2px solid var(--accent); outline-offset: 2px`
- Modal focus trap + ESC + initial focus + restore focus
- Tabs: arrow keys, Home/End
- DataTable row: Enter opens detail

### 8.2 ARIA

- Modal: `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`
- Toast: `role="status"` or `role="alert"`
- Loading: `aria-busy`, skeleton elements `aria-hidden`
- Status badge: `aria-label="Durum: Beklemede"`
- Icon-only buttons: `aria-label` required
- Empty state: `role="region"` + `aria-label`

### 8.3 Color contrast (verified against `--bg`)

- `--text` 14.8:1 (AAA)
- `--text-dim` 7.2:1 (AAA)
- `--text-mute` 4.6:1 (AA, non-essential only)

### 8.4 Motion

`prefers-reduced-motion: reduce` → all durations 0.01ms, keyframe animations paused, modal slide replaced with fade.

### 8.5 Form a11y

- Every input has `<label>` or `aria-label`
- Errors: `aria-invalid="true"` + `aria-describedby`
- Required: `aria-required="true"` + visual `*`

### 8.6 HCI micro-details

- Optimistic UI for delete (revert on API failure with toast)
- Confirmation only on destructive actions (delete, password reset, force-change). Save/edit have no confirmation step.
- Three-tier loading: skeleton (initial), `aria-busy` + spinner (refetch), button spinner (action in flight)
- Two empty-state variants per list: zero records vs filtered-empty (different CTAs)
- Network error toast has a "Tekrar dene" button
- Smart defaults in create form: iletişim tarihi = today, sonuç = Beklemede, currency = ₺
- Tab title pattern: "Müşteriler · Softnox"; dirty form prefixes `*`
- Browser back closes open modal (history state)
- Skip-to-content link at the start of topbar

## 9. Implementation Phases

Single branch, single session, phased work with browser verification between phases.

**Phase 1 — Foundation (risk: none)**
1. Append new tokens to `app/globals.css`
2. Create `components/ui/` and all primitives
3. Mount `<ToastProvider>` in `app/admin/layout.tsx`
4. Verify: nothing visible has changed

**Phase 2 — Shell (risk: moderate)**
5. Implement `AdminShell.tsx`
6. Restructure `app/admin/` into two Next.js route groups so the topbar wraps only post-auth pages:
   ```
   app/admin/
     layout.tsx                  → passthrough (ToastProvider + supabase context)
     (auth)/
       layout.tsx                → AuthShell (centered card, no topbar)
       login/page.tsx
       change-password/page.tsx
     (app)/
       layout.tsx                → AdminShell (topbar)
       page.tsx                  → CRM dashboard
       settings/
         layout.tsx              → SettingsShell (sidebar)
         profile/page.tsx
         users/page.tsx
         audit/page.tsx
   ```
   Route groups use parentheses so URLs are unchanged (`/admin/login`, `/admin`, `/admin/settings/profile`).
7. Verify: all /admin/* URLs resolve correctly, auth pages have no topbar, CRM + settings have topbar

**Phase 3 — Auth pages**
8. Rewrite `/admin/login`
9. Rewrite `/admin/change-password` with min-length 8
10. Remove `/admin/welcome`; update `proxy.ts` post-login redirect to `/admin`
11. Verify: full login + forced password-change flow

**Phase 4 — CRM Dashboard**
12. Write `CRMDashboard.tsx`, `ContactDetailSheet.tsx`, `ContactFormDialog.tsx`
13. Wire `app/admin/page.tsx` to the new component
14. Verify: list, detail, create, edit, delete, activity log, all responsive breakpoints

**Phase 5 — Settings**
15. `/admin/settings/page.tsx` → redirect to `/profile`
16. `app/admin/settings/layout.tsx` (SettingsShell)
17. `/profile/page.tsx` + `ProfilePanel.tsx`
18. `/users/page.tsx` + `UsersPanel.tsx`
19. `/audit/page.tsx` + `AuditPanel.tsx`
20. Verify: super_admin gating, all CRUD flows

**Phase 6 — QA gauntlet (per CLAUDE.md)**
21. Per-page browser verification: console 0 errors, network 2xx, viewports 375×667, 414×896, 768×1024, 1440×900
22. Cross-account: admin + super_admin gating
23. Keyboard-only walkthrough (mouse-free)
24. `prefers-reduced-motion: reduce` walkthrough
25. Manual text audit (no raw i18n keys, no raw "Yükleniyor..." remaining)
26. Grep for legacy class names (`.crm-`, `.admin-`, `.modal__*`) — confirm none orphaned

**Phase 7 — Cleanup**
27. Delete `components/admin/AdminCRM.tsx`, `components/admin/AdminSettings.tsx`
28. Remove unused legacy CSS rules from `app/globals.css`

## 10. Risk Register

| Risk | Mitigation |
|---|---|
| Orphaned class references after rewrite | Phase 7 grep sweep before claiming done |
| Body scroll leak with open modal on mobile | Dialog primitive enforces scroll lock; tested in Phase 6 |
| Auth redirect loop after welcome removal | Single-line proxy.ts change; tested in Phase 3 |
| RBAC bypass on new routes | Phase 5 verification covers admin vs super_admin gating end-to-end; existing super_admin checks in API routes are untouched |
| Legacy `.btn` vs new `Button` CSS collision | New primitives use scoped class names (`.ui-btn`, `.ui-card`); old `.btn` class lives until Phase 7 cleanup |
| RLS or schema change needed | None — verified during exploration; spec adds no endpoint, no table, no policy |

## 11. Verification Checklist (definition of done)

- All five admin pages render in current dev environment with zero console errors
- All API requests return 2xx (excluding intentional auth redirects)
- All five viewports tested: 375×667, 414×896, 768×1024, 1024×768, 1440×900
- Keyboard-only navigation succeeds end-to-end on every page
- Screen reader (VoiceOver on macOS) announces modal open/close, toast, table empty state correctly
- `prefers-reduced-motion: reduce` removes all animation
- super_admin and plain admin accounts produce correct gating in Users + Audit panels
- Zero raw "Yükleniyor..." strings in the codebase
- Zero references to deleted `AdminCRM` and `AdminSettings` exports
- Welcome route removed; post-login redirect tested in clean and existing-cookie scenarios
