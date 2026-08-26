# Player site — full finish plan (P1 · P2 · P3)

**Scope:** Tenant public website only (`apps/web`, routes outside `/admin`).  
**Reference UX:** `/var/www/compgo` checkout guest flow (login/register **on** checkout — **not** pay-without-account).  
**Master exclusions:** [PLAYER_SITE_UI_PLAN.md](./PLAYER_SITE_UI_PLAN.md) §3 — no skill questions, postal entry, gamification, referrals, guest pay, social OAuth, UK mechanics.

**Last updated:** 2026-08-25

---

## Product rules (non‑negotiable)

| Rule | Meaning |
|------|---------|
| **Account required to pay** | Guests may browse and add to cart. Checkout **must** end in a logged-in player account before payment. |
| **No anonymous checkout** | Do not collect email-only payment or “guest order” without `players` row. |
| **CompGo-style gate** | On `/checkout`, unauthenticated users see **cart recap + inline Login / Register** (tabs), not bare links away to `/login`. |
| **Cart merge** | Keep `cart_session_id` on login/register (already implemented). |
| **Kenya product** | KES, county, Play Safe, gateway redirect — unchanged. |

---

## Delivery overview

```text
Phase A (P1 core)     Checkout guest gate + commerce polish     ~4–5 days
Phase B (P1 pages)      Discovery, account, legal, contact        ~3–4 days
Phase C (P1 quality)    Performance, a11y, E2E                    ~2–3 days
Phase D (P2)            Demo tenant content on demo.force42.com     ~1–2 days
Phase E (P3)            Stretch polish (post-v1 ship)               ~4–6 days
```

**Ship gate after Phase A+C+D:** logged-in **and** guest-path checkout look production-ready on `demo.force42.com`.

---

# P1 — Player site UI polish

## P1-A · Checkout & commerce (highest priority)

### P1-A.1 Guest checkout gate (CompGo pattern, account required)

**Problem:** `/checkout` shows a small “log in / register” link card; left column feels empty; users leave checkout to auth.

**Target behaviour (match CompGo `showGuestAuthStep`, adapted for Kenji):**

1. Guest lands on `/checkout` with items in cart.
2. Page shows:
   - **Heading:** “Complete your purchase” / “Sign in to continue”
   - **Cart recap** (same lines as order summary: image thumb, raffle title, qty, line total)
   - **Reservation countdown** (existing `ReservationCountdown`)
   - **Tabs:** Login | Register (inline forms, not navigation away)
   - Optional link: “Continue shopping” → `/cart`
3. On successful login/register → merge cart → **same page** transitions to logged-in checkout form (coupon, site credit, “Continue to payment”).
4. If cart empty → redirect `/cart` (keep current behaviour).

**Implementation:**

| Task | Files |
|------|--------|
| New `CheckoutGuestGate.tsx` | `components/CheckoutGuestGate.tsx` |
| Extract shared login fields from `LoginClient` | `components/PlayerLoginForm.tsx` (or inline in gate) |
| Extract register fields from `RegisterClient` | `components/PlayerRegisterForm.tsx` |
| Wire gate into checkout | `app/checkout/page.tsx` |
| Tab + recap styles | `app/public.css` (`.site-checkout-guest`, `.site-checkout-tabs`) |
| Mobile: recap **above** tabs | CSS order / DOM order in `checkout/page.tsx` |

**Acceptance:**

- [ ] Guest with cart never sees empty left column
- [ ] Login/register complete without leaving `/checkout` (URL stays `/checkout`)
- [ ] After auth, coupon/site-credit form appears without full page reload (client state OK)
- [ ] `?next=/checkout` still works on standalone `/login` for deep links
- [ ] Playwright: guest with cart → sees recap + tabs → login → sees “Continue to payment”

**Do not build:** social login buttons, “checkout as guest” email field, CompGo wallet split.

---

### P1-A.2 Checkout order summary parity

| Task | Detail |
|------|--------|
| Line thumbnails | Reuse cart thumb pattern (`featured_image_url` or initial) in sidebar + guest recap |
| Typography | Match `/cart` order summary spacing |
| Loading state | Skeleton while `GET /v1/cart` pending (checkout has none today) |
| Empty cart | Redirect `/cart` before showing gate |

**Files:** `checkout/page.tsx`, `public.css`

---

### P1-A.3 Logged-in checkout & payment step

| Task | Detail |
|------|--------|
| Two-column balance | Main form + sticky summary on desktop |
| Mock payment step | Clear “test mode” labelling; primary/secondary buttons (existing) |
| Live gateway step | When `requires_external_payment`, branded CTA + operator gateway name; link to `pay.force42.com` when configured |
| Error copy | Keep `player-errors.ts` mapping for Play Safe / limits |

**Files:** `checkout/page.tsx`, optional `CheckoutPaymentStep.tsx`

---

### P1-A.4 Success / failed pages

| Task | Detail |
|------|--------|
| Success | Ticket numbers list, instant-win callout if API returns wins, links to `/account/tickets` and `/account/wins` |
| Failed | Retry → `/checkout` or `/cart`; show order id if present |

**Files:** `checkout/success/*`, `checkout/failed/*`

---

### P1-A.5 Cart page (minor)

| Task | Detail |
|------|--------|
| Guest hint | Keep “log in to complete” in summary; align wording with checkout gate |
| Proceed CTA | Disabled or tooltip when cart empty (already handled) |

**Files:** `cart/page.tsx`

---

## P1-B · Discovery & home

| # | Task | Files | Acceptance |
|---|------|-------|------------|
| B.1 | Home loading skeleton when raffles fetch slow | `page.tsx` or client wrapper | No blank flash |
| B.2 | Empty home state (no live raffles) | `page.tsx` | CTA to contact / “coming soon” |
| B.3 | Category chips link to `/raffles?category=` | `page.tsx`, `raffles/page.tsx` | Filter works |
| B.4 | Recent winners strip — hide when empty | `page.tsx` | No broken section |
| B.5 | Raffle detail skeleton | `raffles/[slug]/page.tsx` | Partial SSR + skeleton |
| B.6 | Sold-out / ended states on detail | `raffles/[slug]/page.tsx` | Disable add-to-cart clearly |
| B.7 | `generateMetadata` OG image fallback | `raffles/[slug]/page.tsx` | Valid OG when no image |

---

## P1-C · Auth pages (standalone)

Standalone `/login` and `/register` remain for nav links; checkout uses **inline** forms.

| # | Task | Files |
|---|------|-------|
| C.1 | Shared form components (used by gate + pages) | `PlayerLoginForm`, `PlayerRegisterForm` |
| C.2 | Register: terms checkbox (already required server-side) | `RegisterClient.tsx` |
| C.3 | Email verification banner on account when unverified | `account/layout.tsx` |
| C.4 | `AuthShell` hero optional tenant logo | `AuthShell.tsx`, tenant context |

---

## P1-D · Site chrome

| # | Task | Detail |
|---|------|--------|
| D.1 | Cart badge refresh | Already event-driven; verify after guest gate login |
| D.2 | Mobile bottom nav active states | `SiteMobileNav.tsx` |
| D.3 | Footer: show operator support email from tenant settings | `SiteFooter.tsx`, tenant API |
| D.4 | Header logo from operator branding | `SiteHeader` / `PublicSiteChrome` |

---

## P1-E · Legal, winners, contact

| # | Task | Detail |
|---|------|--------|
| E.1 | Contact: show `support_email` from tenant settings above form | `contact/page.tsx` |
| E.2 | FAQ / terms / privacy: empty-state when operator text blank | legal pages |
| E.3 | Winners: empty state “No winners yet” | `winners/page.tsx` |
| E.4 | Play-safe public page: link to account Play Safe | `play-safe/page.tsx` |

---

## P1-F · Performance, accessibility, tests

| # | Task | Detail |
|---|------|--------|
| F.1 | Focus management on checkout tab switch | a11y |
| F.2 | Form labels + `aria-invalid` on errors | auth + checkout |
| F.3 | Contrast check on `--tenant-accent` | manual + fix tokens |
| F.4 | Playwright: **guest checkout gate** flow | `e2e/smoke.spec.ts` |
| F.5 | Playwright: register on checkout tab → payment | `e2e/smoke.spec.ts` |
| F.6 | 375px manual checklist (all public routes) | QA doc in this file §Appendix |

**Defer within P1 (move to P3):** `next/image` migration, mini-cart dropdown.

---

# P2 — Demo tenant & content

Goal: `https://demo.force42.com` looks like a real operator site for demos and QA.

## P2.1 Platform / ops prerequisites

| Step | Action |
|------|--------|
| 1 | Platform console: operator `demo` **active**, tenant DB provisioned |
| 2 | Subdomain `demo.force42.com` verified (wildcard OK) |
| 3 | GRA credentials set for demo operator (for relay demos) |
| 4 | `.env` on VPS: `PLAYER_AUTO_VERIFY_EMAIL=true` for demo **or** document test verify flow |

## P2.2 Seed script runbook

```bash
# On VPS (or local against demo tenant)
cd /var/www/Kenji-raffle
set -a && source .env && set +a
python3 scripts/seed-demo-tenant.py          # raffles, categories, legal, player@demo.local
python3 scripts/run-demo-draw.py             # after test purchases — public winners
```

## P2.3 Content checklist

| Item | Owner | Done when |
|------|-------|-----------|
| 3+ live raffles with featured images | seed script | Home + `/raffles` populated |
| Categories assigned | seed script | Home category chips work |
| Instant-win on ≥1 raffle | seed script | Checkout success shows instant win in demo |
| FAQ, terms, privacy text | seed / operator settings | Legal pages not blank |
| Operator `primary_color` + optional logo | platform branding | Header/footer branded |
| Support email on contact + footer | operator settings | Contact page shows email |
| Test player `player@demo.local` / `ChangeMe123!` | seed | E2E + manual checkout |
| Public winners rows | draw script | `/winners` populated |

## P2.4 Demo verification script (manual)

1. Home → raffles → detail → add to cart (guest)
2. Checkout → guest gate → register or login inline → mock pay → success
3. Account → tickets, wins, orders
4. `/winners` shows draw results
5. Mobile 375px: nav, cart badge, checkout gate

---

# P3 — Stretch polish (scheduled after P1 + P2 ship)

These were “deferred” in the UI plan; implement **after** demo site is demo-ready.

## P3-A · Performance

| # | Task | Effort |
|---|------|--------|
| A.1 | Migrate raffle images to `next/image` with `sizes` | 1–2 d |
| A.2 | Font preload + reduce layout shift on hero | 0.5 d |
| A.3 | Lazy-load below-fold home sections | 0.5 d |

**Files:** `RaffleCard.tsx`, `page.tsx`, `raffles/[slug]/page.tsx`, `next.config`

---

## P3-B · Header cart UX

| # | Task | Detail |
|---|------|--------|
| B.1 | Mini-cart dropdown on desktop (item count + lines + “View cart”) | CompGo-inspired; **no** skill modal |
| B.2 | Drawer closes on navigate | polish |

**Files:** new `SiteCartDropdown.tsx`, `SiteHeader.tsx`, `public.css`

---

## P3-C · Marketing / home stretch

| # | Task | Note |
|---|------|------|
| C.1 | Hero carousel (2–3 featured raffles) | Optional; keep single-hero fallback |
| C.2 | “How it works” icon row polish | Home section |
| C.3 | Trust strip (18+, licensed operator footer text) | Home + footer |

---

## P3-D · Live payment UX (blocked on gateway)

| # | Task | Dependency |
|---|------|------------|
| D.1 | Checkout redirect copy when `HARAMBE_GATEWAY_URL` → `pay.force42.com` | `kenji-gateway` deployed |
| D.2 | Return handling polish on `/checkout/success` after gateway callback | gateway + API |
| D.3 | Remove mock payment buttons in production env | env guard |

---

## P3-E · Operator admin visual parity (optional)

| # | Task | Note |
|---|------|------|
| E.1 | Align admin login with tenant public `AuthShell` pattern | low priority |
| E.2 | Shared accent token docs | cosmetic |

**Scope:** `/admin` only if time; not required for player site ship.

---

## P3-F · Email verification UX (production)

When `PLAYER_AUTO_VERIFY_EMAIL=false`:

| # | Task |
|---|------|
| F.1 | Banner on account + checkout blocking message if API returns verify error |
| F.2 | Resend verification link on `/verify-email` wait state |

---

# Explicit exclusions (do not plan, do not build)

- Guest checkout **without** player account  
- Skill-based questions before purchase  
- Free postal entry  
- Referrals, affiliates, loyalty, cashback UI  
- Gamification (wheels, XP, badges)  
- Social login (Google / Facebook / Apple)  
- Embedded card form on raffle site (gateway only)  
- GBP / UK address autocomplete  
- Dark theme toggle  
- CompetitionGo game products (GoPop, etc.)

---

# Suggested execution order

```text
Week 1
  P1-A.1 Guest checkout gate (+ E2E)
  P1-A.2 Checkout summary + skeleton
  P2.1–P2.3 Demo seed on VPS

Week 2
  P1-A.3–A.5 Payment + success/failed
  P1-B Discovery polish
  P1-C Shared auth components
  P2.4 Demo verification

Week 3
  P1-D Chrome (logo, footer email)
  P1-E Legal/contact/winners empty states
  P1-F Accessibility + 375px QA

Later (P3)
  next/image, mini-cart, carousel, live gateway UI
```

---

# Appendix — 375px public route checklist

| Route | Check |
|-------|-------|
| `/` | Hero readable, CTAs tap |
| `/raffles` | Cards single column |
| `/raffles/[slug]` | Selector + add to cart |
| `/cart` | Summary below items |
| `/checkout` | Guest gate: recap → tabs → form |
| `/checkout/success` | |
| `/login`, `/register` | AuthShell single column |
| `/account/*` | Nav grid 2-col |
| `/winners` | Cards on mobile |
| `/faq`, `/terms`, `/privacy`, `/contact` | |
| Mobile nav + cart badge | |

---

# Related docs

| Doc | Purpose |
|-----|---------|
| [PLAYER_SITE_UI_PLAN.md](./PLAYER_SITE_UI_PLAN.md) | Original UI phases + exclusions |
| [RAFFLE_GAPS.md](./RAFFLE_GAPS.md) | Backend / gateway gaps |
| [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) | Deploy `raffle-web` after builds |
