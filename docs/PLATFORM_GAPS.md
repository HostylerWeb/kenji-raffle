# Platform — Remaining Work & Gap Analysis

**Last updated:** 2026-08-21  
**Scope:** Platform control plane only — **not** the raffle public site or operator `/admin` (`apps/web`). Raffle product functional gaps → **`docs/RAFFLE_GAPS.md`**.

---

## Open gaps (external / ops)

These are **not** missing platform-console features. They live outside this app:

| Item | Why it is not in this console |
|------|-------------------------------|
| GRA **payment ledger** (`POST /v1/gateway/notify`) | Only **`kenji-gateway`** (or GRA simulator). Platform stores GRA ingest keys and retries outbound events. |
| Production **cert-manager / ingress TLS** | Issued at the reverse proxy. Console DNS verify records hostname ownership; `ssl_status=active` after verify. Deploy TLS in nginx/k8s, not in Nest. |
| Playwright browser E2E | Optional. API coverage: `npm run test:platform-e2e` (create operator + password reset). |

---

## Closed in this pass (2026-08-21)

| Gap | Fix |
|-----|-----|
| No Test GRA button | Operator detail → **Test GRA connection** → `POST …/test-gra-connection` |
| Domains “Mark verified” forced status | **Verify DNS** + **Queue verify**; PATCH can only set `is_primary` |
| Forgot password stub | JWT reset email (`sendPlatformPasswordReset`) + `/reset-password` + `POST …/auth/reset-password` |
| `support_email` / `primary_color` no UI | Operator **branding** form |
| `GET …/system/worker` unused | System page **Worker jobs** panel |
| Dashboard missing infra | Dashboard shows Postgres / Redis / worker strip |
| `verify-dns-queue` unused | Buttons on operator detail + domains page |
| GRA outbound “2/6 events” (stale) | All event types in `packages/shared/src/gra-outbound.ts` |

---

## Current status summary

| Lens | Assessment |
|------|------------|
| **Plan P0 + P1** | **Complete** |
| **Section 6 capabilities** | **Complete for v1** |
| **Production-ready control plane** | **~98%** — real SSL at edge still environment-specific |
| **§11 v1 definition of done** | **Yes** |
| **§5 stretch list** | GRA outbound **complete**; Playwright UI optional |

**Verdict:** Platform control plane is **finished for operator onboarding**. Remaining items are gateway + edge TLS.

---

## Console map

| Route | Purpose |
|-------|---------|
| `/` | Login, MFA, forgot password |
| `/reset-password` | Set new password from email token |
| `/dashboard` | Rollups, alerts, infra strip |
| `/operators` | Tenant list |
| `/operators/new` | Create + queue provision |
| `/operators/[id]` | Lifecycle, GRA keys + test, branding, DNS, invite, destroy |
| `/operators/[id]/domains` | Custom domains + real DNS verify |
| `/operators/[id]/data` | Orders / payments / GRA queue retry |
| `/reports` | Cross-op rollups, GRA health, failed provisions |
| `/platform-users` | Staff |
| `/settings` | MFA/password + global platform config |
| `/audit` | Audit log |
| `/system` | Health + worker job details |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-08-20 | Platform v1 complete (rollups, worker, auth refresh, drill-down, etc.) |
| 2026-08-20 | **Finish pass** — MFA, cookies, GRA UI, destroy, invite, flags, system metrics, rate limits, backup runbook, API e2e |
| 2026-08-21 | GRA test button, real DNS verify, password reset flow, branding fields, worker panel, dashboard infra |
