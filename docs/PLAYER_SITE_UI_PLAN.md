# Player site UI/UX — delivery plan

**Scope:** Tenant-facing **public website** on the operator hostname (`apps/web`, excluding `/admin`).  
**Reference only:** `/var/www/compgo` (CompetitionGo) — UX patterns to learn from, **not** a feature checklist.  
**Functional baseline:** Backend + pages are **v1 complete** per [RAFFLE_GAPS.md](./RAFFLE_GAPS.md). This document covers **presentation, UX polish, and production readiness** only.

**Last updated:** 2026-08-25

---

## 1. What we are building

Each licensed operator gets a branded consumer raffle site:

| URL area | Who | App |
|----------|-----|-----|
| `https://{operator-domain}/` | Players | `apps/web` public routes |
| `https://{operator-domain}/admin` | Operator staff | `apps/web` admin (separate plan — already polished) |

**Product:** Kenya licensed raffles — KES, GRA tax split, Play Safe, M-Pesa/card via Harambe gateway, instant wins (site credit / cash / physical).

**Not building:** A CompetitionGo clone, UK skill-competition mechanics, or new commerce features unless listed in §4.

---

## 2. Current state (honest assessment)

**As of 2026-08-25:** Public site has been redesigned on `demo.force42.com`. Design system (`public.css`), chrome, discovery, commerce, auth, and most account pages are in place. **~75% of the original UI plan is done.** What remains is functional completeness (end-to-end purchase proof, error UX, checkout summary), a few planned page gaps, demo tenant content, and ship checklist — **not** visual refinement or new features.

### Functional — done (backend + routes)

| Flow | Routes | API | UI status |
|------|--------|-----|-----------|
| Browse | `/`, `/raffles`, `/raffles/[slug]` | `GET /v1/raffles*` | **Done** — cards, filters, detail, gallery, selector |
| Cart | `/cart` | `GET/PATCH/DELETE /v1/cart*` | **Mostly done** — qty PATCH, summary; missing live TTL + line images |
| Checkout | `/checkout` | `POST /v1/checkout`, payments | **Mostly done** — mock pay works; missing cart lines on page + friendly limit errors |
| Confirmation | `/checkout/success`, `/checkout/failed` | Order fetch | **Done** |
| Auth | `/login`, `/register`, forgot/reset, verify | `/v1/auth/*` | **Mostly done** — missing register terms checkbox |
| Account | `/account/*` | `/v1/account/*` | **Mostly done** — all pages restyled; order detail needs status badges |
| Legal | `/faq`, `/terms`, `/privacy`, `/contact`, `/play-safe` | Tenant context + contact | **Done** (content depends on operator settings) |
| Winners | `/winners` | `GET /v1/winners` | **Done** — table layout; mobile cards optional later |
| Infra | API URL on production | `api-config.ts` | **Fixed** — no localhost calls from live site |

### Visual — largely done; gaps remain

| Area | Status |
|------|--------|
| Design tokens (`public.css`) | **Done** |
| Header, footer, mobile nav, toasts | **Done** |
| `RaffleCard`, countdown, progress, gallery, selector | **Done** |
| Auth split-hero (`AuthShell`) | **Done** |
| Account shell + sub-pages | **Done** (minor polish items below) |
| `next/image` on raffle images | **Not done** — still `<img>` |
| `PriceDisplay` / `PageHero` components | **Skipped** — `formatKes` inline is fine for v1 |
| Live cart reservation countdown | **Not done** — static expiry time only |
| Raffles list price sort | **Not done** |
| Raffle detail prize tabs | **Partial** — stacked sections, not tab UI |
| Playwright E2E (cart, checkout, mobile nav) | **Not done** — 3 smoke tests only |
| Accessibility pass | **Not done** |
| Demo tenant content (categories, legal, logo) | **Partial** — 3 raffles live; FAQ/terms empty |

---

## 3. Explicit exclusions — do NOT add

These are **out of product scope** per [PROJECT_PLAN_2.md](./PROJECT_PLAN_2.md) §3. Do **not** implement in frontend, backend, or operator admin — even if CompetitionGo has them.

### 3.1 Legal / UK competition mechanics (CompetitionGo-specific)

| Feature | Why excluded |
|---------|----------------|
| **Skill-based questions** (multiple-choice before purchase) | Not in Kenya product rules; no `skill_question` tables or API |
| **Free postal entry** | UK alternate entry route; not applicable |
| **“Answer the question to buy” gating** | Depends on skill questions |
| **Skill answer storage on tickets** | No schema support |

### 3.2 Gamification & engagement loops

| Feature | Why excluded |
|---------|----------------|
| XP, badges, levels | Explicitly out of scope |
| Prize wheels, spinners, scratch cards | Out of scope |
| GoPop / GoDig / GoRace / GoSpin / GoCollect | CompetitionGo game products |
| Prize boost campaigns | Not in tenant schema |
| Live-draw countdown to fixed Wed/Sun UK schedule | Kenya operators set per-raffle `end_date` only |
| Sound effects on add-to-cart | Optional polish only — **not** in v1 UI plan |

### 3.3 Growth / monetisation extras

| Feature | Why excluded |
|---------|----------------|
| Referral programme | Out of scope |
| Affiliate tracking | Out of scope |
| Loyalty / cashback schemes | Out of scope |
| Community competitions (Facebook-only entry) | Out of scope |

### 3.4 Auth & checkout model (fixed by design)

| Feature | Why excluded |
|---------|----------------|
| **Guest checkout** (pay with email only, no account) | Checkout **requires** login or register; cart merges via `cart_session_id` |
| Social login (Google, Facebook, Apple) | No OAuth providers configured |
| Multiple wallets (cash wallet + site credit + card split UI) | Kenji has **site credit** only; card/M-Pesa via gateway |

### 3.5 Geography & payments

| Feature | Why excluded |
|---------|----------------|
| GBP / multi-currency | KES only |
| UK address autocomplete (Google Places UK) | Kenya uses county + town + address line |
| Stripe-style card form on raffle site | Payment on **Harambe gateway** (`kenji-gateway`), not embedded in checkout |
| Operators self-hosting or white-label source | Managed SaaS only |

### 3.6 Marketing / third-party (optional later, not v1 UI)

| Feature | Status |
|---------|--------|
| Native app download section | Not planned |
| Trustpilot embed | Tenant-configurable later if needed |
| Klaviyo / extra pixels beyond GA4 + Meta | Use existing `AnalyticsScripts` only |
| Charity impact stats section | Not in schema |
| Hero carousel with 5+ slides | v1: single hero or one featured raffle — carousel is stretch |

### 3.7 Backend features — do NOT add for UI work

| Do not add | Reason |
|------------|--------|
| New Prisma models for excluded features above | Scope creep |
| Skill question CRUD in operator admin | No product requirement |
| Postal entry admin toggle | N/A |
| Referral codes on registration | Out of scope |

---

## 4. In scope for UI/UX work

Only **presentation and UX** of existing APIs. No new business logic unless noted.

### 4.1 Design system (`apps/web/src/app/globals.css` → `public.css`)

| Token | Default | Source |
|-------|---------|--------|
| Font | Plus Jakarta Sans | Match platform + operator admin |
| Accent | `--tenant-accent` | `tenant.branding.primary_color` (inline or CSS var on `<body>`) |
| Surfaces, borders, shadows | Shared scale | Same family as `admin.css` |
| Breakpoints | 480 / 768 / 1024 | Mobile-first |

**Do not introduce:** Tailwind or shadcn unless repo-wide decision — operator admin uses plain CSS today.

### 4.2 Site chrome

| Component | File | Requirements |
|-----------|------|----------------|
| Header | `SitePublicNav.tsx` + new `SiteHeader.tsx` | Logo, nav links, **cart badge** (count from `GET /v1/cart`), user menu, mobile drawer |
| Footer | `SiteFooter.tsx` | Columns: links, legal, social, licence text, 18+ |
| Mobile bottom nav | New `SiteMobileNav.tsx` | Home, Raffles, Cart, Account |
| Layout | `PublicSiteChrome.tsx` | Remove homepage-only header; all pages use chrome |
| Toasts | New `ToastProvider.tsx` | Add-to-cart, form errors |

### 4.3 Pages — public

| Page | File | UI deliverables |
|------|------|-----------------|
| **Home** | `app/page.tsx` | Hero, featured raffles (`RaffleCard`), categories, recent winners, how-it-works (3–4 steps), CTA |
| **Raffles list** | `app/raffles/page.tsx` | Card grid, category filter, sort (ending soon / price), empty state |
| **Raffle detail** | `app/raffles/[slug]/page.tsx` | Gallery, countdown, % sold bar, ticket presets + stepper (respect `ticket_limit_per_user`), prizes/instant-win tabs, sold-out state |
| **Cart** | `app/cart/page.tsx` | Line items with images, **qty update** (`PATCH /v1/cart/items/:id`), reservation TTL countdown, summary |
| **Checkout** | `app/checkout/page.tsx` | Two-column layout; coupon + site credit; login prompt if anonymous; M-Pesa/card redirect messaging |
| **Success** | `checkout/success/*` | Success hero, ticket list, instant-win callout, links to account |
| **Failed** | `checkout/failed/*` | Clear retry to cart/checkout |
| **Login** | `login/*` | Split-hero layout; **link to `/forgot-password`** |
| **Register** | `register/*` | Split-hero; age gate, county select; terms checkbox |
| **Account shell** | `account/layout.tsx` (new) | Sidebar desktop / tab grid mobile for all `/account/*` |
| **Account sub-pages** | `account/**/*.tsx` | Restyle tables/cards to match design system — **no new fields** |
| **Winners** | `app/winners/page.tsx` | Card or table with raffle name, prize, date |
| **Legal** | faq, terms, privacy, contact, play-safe | Readable prose layout, contact form styling |

### 4.4 Shared components (new)

| Component | Purpose |
|-----------|---------|
| `RaffleCard` | Listing card — image, price KES, countdown, progress, badges |
| `RaffleCountdown` | Client timer to `end_date` |
| `TicketSelector` | Presets + stepper; wires to `AddToCartButton` |
| `PriceDisplay` | KES formatting, discounts |
| `EmptyState` | Consistent empty lists |
| `PageHero` | Optional title band for inner pages |

### 4.5 SEO & performance

| Task | Detail |
|------|--------|
| Per-raffle metadata | `generateMetadata` on `raffles/[slug]` — title, description, OG image |
| `next/image` | Raffle images with sizes + lazy load |
| Skeleton loaders | Home grid, detail page, cart |
| `not-found` | Branded 404 for unknown slugs |

### 4.6 Explicitly NOT in this UI plan

| Item | Owner |
|------|-------|
| `kenji-gateway` production deploy | [IMPORTANT.md](../IMPORTANT.md) |
| P7 hardening (CSRF, monitoring) | PROJECT_PLAN_2 §P7 |
| Operator `/admin` redesign | Already done — touch only if broken |
| New API endpoints | Only if UI blocked (e.g. none expected) |
| Email verification gate UX | Backend exists; optional banner on account — stretch |

---

## 5. User flows (unchanged behaviour)

```
Home / Raffles list
    → Raffle detail (select qty → Add to cart)
    → Cart (edit qty, see TTL)
    → Checkout
        → If not logged in → /login?next=/checkout or /register
        → Apply coupon / site credit
        → Place order → redirect to Harambe gateway (live) or mock pay
    → /checkout/success (tickets + instant wins)
    → /account/tickets
```

**Rules (do not change in UI work):**

1. Cart works for guests; checkout requires account.
2. Play Safe active → checkout blocked (show existing API error clearly).
3. Spending limits enforced server-side — show friendly message.
4. Ticket limits include pending orders — display limit messaging on detail page.

---

## 6. Delivery phases

Execute in order. Each phase ends with deploy to `demo.force42.com` smoke test.

### Phase UI-1 — Foundation (2–3 days)

| # | Task | Files |
|---|------|-------|
| UI-1.1 | Design tokens + base styles | `globals.css` |
| UI-1.2 | `SiteHeader` + mobile drawer | `SitePublicNav.tsx`, new components |
| UI-1.3 | Cart badge (client fetch cart count) | Header |
| UI-1.4 | Footer + mobile bottom nav | `SiteFooter.tsx`, `SiteMobileNav.tsx` |
| UI-1.5 | Unify homepage into `PublicSiteChrome` | `page.tsx`, `PublicSiteChrome.tsx` |
| UI-1.6 | Toast provider | New + wire in `AddToCartButton` |
| UI-1.7 | Plus Jakarta Sans + viewport meta | `layout.tsx` |

**Exit:** Every public page shares header/footer; mobile nav works; cart count visible.

### Phase UI-2 — Discovery (2–3 days)

| # | Task | Files |
|---|------|-------|
| UI-2.1 | `RaffleCard` + `RaffleCountdown` + progress bar | `components/` |
| UI-2.2 | Homepage redesign | `app/page.tsx` |
| UI-2.3 | Raffles list grid + filters | `app/raffles/page.tsx` |
| UI-2.4 | Raffle detail — gallery, selector, tabs | `app/raffles/[slug]/page.tsx`, `TicketSelector`, `AddToCartButton` |
| UI-2.5 | `generateMetadata` + `next/image` on detail | Same |
| UI-2.6 | Skeleton loaders | Home, list, detail |

**Exit:** `demo.force42.com` browse experience feels like a real raffle site.

### Phase UI-3 — Commerce (2 days)

| # | Task | Files |
|---|------|-------|
| UI-3.1 | Cart page redesign + qty PATCH | `app/cart/page.tsx` |
| UI-3.2 | Checkout layout + payment states | `app/checkout/page.tsx` |
| UI-3.3 | Success / failed pages | `checkout/success/*`, `checkout/failed/*` |
| UI-3.4 | Reservation TTL countdown on cart | Cart page |

**Exit:** Full purchase flow visually polished on mock payment.

### Phase UI-4 — Auth & account (1–2 days)

| # | Task | Files |
|---|------|-------|
| UI-4.1 | Login / register split-hero | `login/*`, `register/*` |
| UI-4.2 | Forgot password link on login | `LoginClient.tsx` |
| UI-4.3 | Account layout shell | `account/layout.tsx` |
| UI-4.4 | Restyle account sub-pages | `account/**/*.tsx` |

**Exit:** Account area matches public site quality.

### Phase UI-5 — Polish & ship (1 day)

| # | Task |
|---|------|
| UI-5.1 | Winners + legal pages typography |
| UI-5.2 | Branded `not-found` |
| UI-5.3 | Accessibility pass (focus, labels, contrast) |
| UI-5.4 | Playwright smoke: cart badge, mobile nav |
| UI-5.5 | Deploy VPS: `npm run build -w @kenji-raffle/web` + `pm2 restart raffle-web` |

**Exit:** Production-ready public site on demo tenant.

---

## 7. CompetitionGo mapping (reference only)

| CompetitionGo pattern | Kenji v1 UI | Notes |
|----------------------|-------------|-------|
| Competition cards + quick-add | `RaffleCard` + detail CTA | No quick-add modal with skill Q |
| Skill question modal | **Excluded** | — |
| Ticket slider + presets | `TicketSelector` | Use stepper + presets |
| Cart dropdown in header | Cart badge + `/cart` | Full mini-cart dropdown = stretch |
| Guest checkout | **Excluded** | Login at checkout |
| Wallet + card split | Site credit + gateway | Single credit balance only |
| Dark theme toggle | **Excluded** v1 | Light + tenant accent |
| Instant wins ticker | Winners strip on home | Not full ticker |
| Hero carousel | Single hero or one featured | Carousel = stretch |
| Mobile bottom nav | **In scope** | |
| How it works steps | **In scope** | |
| UK postal entry link | **Excluded** | — |

---

## 8. Operator admin — out of scope for this document

Operator `/admin` is **functionally and visually complete** for v1. Do not add excluded features there either (no skill question editor, referral settings, etc.).

If admin gaps appear during UI work, log them in [RAFFLE_GAPS.md](./RAFFLE_GAPS.md) — do not expand scope silently.

**Actual admin routes** (for reference):

| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard |
| `/admin/raffles`, `/admin/raffles/new`, `/admin/raffles/[id]`, `.../tickets` | Raffle CRUD + ticket pool |
| `/admin/orders`, `/admin/orders/[id]` | Orders |
| `/admin/payments` | Payments |
| `/admin/reports` | GGR, tax, exports |
| `/admin/coupons` | Coupons |
| `/admin/players`, `/admin/players/[id]` | Players (not `/admin/users`) |
| `/admin/prize-claims`, `/admin/prize-claims/[id]` | Physical prizes |
| `/admin/withdrawals`, `/admin/withdrawals/[id]` | Cash instant-win payouts |
| `/admin/winners` | Draws / winners |
| `/admin/categories` | Categories |
| `/admin/media` | Media library |
| `/admin/domains` | Custom domains |
| `/admin/gra-events` | GRA queue retry |
| `/admin/audit` | Audit log |
| `/admin/staff` | Staff RBAC |
| `/admin/settings` | Branding (proxies platform settings) |

---

## 9. Success criteria

| Check | Target |
|-------|--------|
| Mobile usable | 375px width — nav, cards, checkout readable |
| Cart badge | Updates after add-to-cart |
| No excluded features | Zero skill/postal/referral UI or API |
| Lighthouse (informal) | No broken images; fonts preloaded |
| Demo tenant | `https://demo.force42.com` full flow with mock pay |
| Operator branding | Logo + accent from platform settings |

---

## 10. Related documents

| Doc | Purpose |
|-----|---------|
| [PROJECT_PLAN_2.md](./PROJECT_PLAN_2.md) | Master product plan + exclusions §3 |
| [RAFFLE_GAPS.md](./RAFFLE_GAPS.md) | Functional/backend gaps |
| [PLATFORM_GAPS.md](./PLATFORM_GAPS.md) | Platform console only |
| [IMPORTANT.md](../IMPORTANT.md) | Gateway + GRA open items |
| [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) | Deploy `raffle-web` |

---

## 11. Finish checklist — complete v1 before refinement

**Goal:** Ship a **fully functional** public player site on `demo.force42.com` where a new user can browse → add to cart → register/login → mock checkout → see tickets in account — with consistent UI on every route. **Refinement** (animations, carousel, mini-cart dropdown, `next/image`, dark mode) comes **after** this list is green.

**Definition of done (v1 UI):**

1. Every public route uses `site-*` design system (no legacy `.btn` / `.card` on player pages).
2. Full purchase flow works on demo tenant with mock payment (documented test account).
3. Cart badge updates; mobile bottom nav works on 375px.
4. Checkout surfaces Play Safe / spending limit / ticket cap errors in plain language.
5. Demo tenant has raffles + operator branding + at least stub legal copy.
6. Playwright smoke covers cart + checkout happy path.
7. Deployed to VPS with `NEXT_PUBLIC_API_URL` baked in (no localhost).

---

### Phase completion snapshot

| Phase | Original scope | Status | Remaining |
|-------|----------------|--------|-----------|
| **UI-1** Foundation | Chrome, tokens, toasts | ✅ **Complete** | — |
| **UI-2** Discovery | Home, list, detail, metadata | ✅ **~95%** | Price sort; optional `next/image` |
| **UI-3** Commerce | Cart, checkout, success/fail | ⚠️ **~85%** | Live TTL; checkout line items; error copy |
| **UI-4** Auth & account | Login, register, account shell | ⚠️ **~90%** | Register terms checkbox; order detail badges |
| **UI-5** Polish & ship | Legal, 404, a11y, E2E, deploy | ⚠️ **~40%** | E2E journeys, a11y pass, demo content |

---

### P0 — Must fix to be “functional” (do first)

| # | Task | Status |
|---|------|--------|
| P0.1 | Prove full mock purchase on demo | ✅ Playwright + manual on `demo.force42.com` |
| P0.2 | Checkout error messages (`player-errors.ts`) | ✅ Done |
| P0.3 | Checkout order summary | ✅ Done |
| P0.4 | Live cart reservation countdown | ✅ Done |
| P0.5 | Register terms acceptance | ✅ Done |
| P0.6 | Demo test player `player@demo.local` | ✅ Seeded |
| P0.7 | Production env / no localhost in client bundle | ✅ Done |

---

### P1 — Original plan items (finish v1 scope)

| # | Task | Status |
|---|------|--------|
| P1.1 | Raffles list price sort | ✅ Done |
| P1.2 | Cart line raffle thumbnails | ✅ Done |
| P1.3 | Order detail status badges | ✅ Done |
| P1.4 | Account wins empty states | ✅ Done |
| P1.5 | Email verification banner | ✅ Done |
| P1.6 | Raffle detail prize tabs | ✅ Done |
| P1.7 | Remove dead legacy CSS from public pages | ⚠️ Optional — admin legacy CSS remains |
| P1.8 | Winners mobile layout | ✅ Done |

---

### P2 — Demo tenant content

| # | Task | Status |
|---|------|--------|
| P2.1 | 3+ live raffles with images | ✅ Done |
| P2.2 | Categories + assign to raffles | ✅ Done |
| P2.3 | Operator branding | ⚠️ Partial — accent default; logo optional |
| P2.4 | Legal copy (FAQ, terms, privacy) | ✅ Done |
| P2.5 | Instant-win on a raffle | ✅ Done |
| P2.6 | Public winners | ✅ Run `python3 scripts/run-demo-draw.py` after purchases |

---

### P3 — Ship checklist

| # | Task | Status |
|---|------|--------|
| P3.1 | Playwright E2E (8 tests incl. mock purchase) | ✅ Done |
| P3.2 | Accessibility pass | ✅ `aria-expanded`, toast `role="status"` |
| P3.3 | 375px smoke | ⚠️ Manual pass recommended |
| P3.4 | Deploy runbook | ✅ VPS deployed (`raffle-web` + `raffle-api`) |
| P3.5 | Update RAFFLE_GAPS.md | ✅ Done |

---

### §12 — Post-audit fixes (2026-08-25)

Functional gaps found in full site audit — all addressed:

| Fix | Status |
|-----|--------|
| Claims withdrawal API path (`/withdrawal`) | ✅ Fixed |
| Checkout success without `order_id` | ✅ Error state + links |
| Home page silent API failures | ✅ Warning banner |
| Account pages missing fetch/save errors | ✅ tickets, site-credit, settings, claims, play-safe |
| Play Safe page not loading active status | ✅ Loads from `/v1/me` |
| Full mock-purchase E2E | ✅ Added to `smoke.spec.ts` |
| Demo public winners | ✅ `scripts/run-demo-draw.py` |

**Deferred (design refresh):** visual polish, `next/image`, carousel, mini-cart, operator `/admin` restyle, live `kenji-gateway`.

---

### Quick reference — every public route

| Route | UI done? | Functional gap? |
|-------|----------|-----------------|
| `/` | ✅ | API error banner if fetch fails |
| `/raffles` | ✅ | — |
| `/raffles/[slug]` | ✅ | — |
| `/cart` | ✅ | — |
| `/checkout` | ✅ | — |
| `/checkout/success` | ✅ | Guards missing `order_id` |
| `/checkout/failed` | ✅ | — |
| `/login` | ✅ | — |
| `/register` | ✅ | — |
| `/forgot-password`, `/reset-password`, `/verify-email` | ✅ | — |
| `/account/*` | ✅ | — |
| `/winners` | ✅ | Content after draw |
| `/faq`, `/terms`, `/privacy`, `/contact`, `/play-safe` | ✅ | Content from operator |
| `/not-found` | ✅ | — |

---

### P4 — Explicitly deferred (design refresh)

Visual polish, `next/image`, hero carousel, header mini-cart, dark theme, operator `/admin` restyle, live `kenji-gateway` on `pay.force42.com`.
