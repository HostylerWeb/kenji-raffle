# Kenji Raffle API — Security Audit Report

**Date:** 2026-08-25  
**Last updated:** 2026-08-25 (remediation applied)  
**Target:** `https://api.force42.com` (tenant: `demo.force42.com`)  
**Scope:** Player, cart, checkout, payments, account/KYC, media, auth, operator admin  
**Method:** OWASP API Security Top 10 (2023) checklist, static code review, live black-box testing with `curl`

---

## Remediation status (2026-08-25)

All findings below have been addressed in code. **Production VPS still requires env updates** before go-live:

| Finding | Fix |
|---------|-----|
| C-1 Mock payment | `completeMockPayment` returns 404 unless `HARAMBE_PAYMENT_MODE=mock` |
| C-2 KYC public media | KYC stored under `tenants/{id}/kyc/`; served only via authenticated `/v1/account/kyc/document` and `/v1/admin/players/:id/kyc/document` |
| C-3 CORS | Allowlist via `CORS_ALLOWED_ORIGINS`; no origin reflection in production |
| H-1 Webhook secrets | HMAC-SHA256 over raw body + `X-Gateway-Timestamp` replay window (5 min) in production |
| H-2 Swagger | Disabled when `NODE_ENV=production` unless `SWAGGER_ENABLED=true` |
| H-3 JWT fallback | Boot fails in production if `JWT_SECRET` missing; no `"dev-secret"` in prod |
| H-4 Auto-verify email | Boot fails if `PLAYER_AUTO_VERIFY_EMAIL=true` in production |
| H-5 KYC URL SSRF | Removed public URL submit; upload-only flow |
| H-6 API_PUBLIC_URL | Validated required in production boot |
| M-1 Security headers | `@fastify/helmet` enabled |
| M-2 Auth rate limits | `AuthRateLimitGuard` — 20 req/min on login/register/forgot-password |
| M-3 Cart session | HMAC-signed `x-cart-session` IDs |
| M-4 Invalid Bearer | Optional-auth routes return 401 when Bearer present but invalid |

**VPS checklist:** Set `NODE_ENV=production`, `API_PUBLIC_URL`, `CORS_ALLOWED_ORIGINS`, `HARAMBE_PAYMENT_MODE=live`, `PLAYER_AUTO_VERIFY_EMAIL=false`, `CART_SESSION_SECRET`, strong JWT secrets, then `pm2 restart raffle-api`.

---

## Re-test results (2026-08-25, post-remediation)

### Automated tests (local patched code) — latest run 2026-08-25

| Test suite | Result |
|------------|--------|
| API build | **Pass** |
| `scripts/security-retest.sh` (CORS allowlist env) | **8 pass, 0 fail** |
| Production boot validation | **Pass** — blocks missing secrets / auto-verify / mock mode |
| CORS allowlist | **Pass** — blocks evil origin, allows `demo.force42.com` |
| Live payment mode | **Pass** — mock endpoint 404; HMAC valid/invalid webhooks |
| Helmet security headers | **Pass** |
| Tenant + operator isolation | **Pass** |
| Playwright E2E (`demo.force42.com`) | **12/12 pass** |

### Production VPS (`api.force42.com`) — **fixes NOT deployed yet**

| Check | Prod status | Expected after deploy |
|-------|-------------|------------------------|
| CORS evil origin | Still reflects (vulnerable) | Blocked |
| Swagger `/docs` | Public 200 | 404 |
| Security headers | Missing | Present |
| Invalid Bearer on cart | 200 (guest fallback) | 401 |
| KYC URL POST | Already 404 | 404 |

**Action required:** Deploy patched code + production `.env` to VPS, then re-run `scripts/security-retest.sh` against `https://api.force42.com`.

### Known residual risk (low)

- **Legacy KYC files** uploaded before the `kyc/` prefix may still be reachable at `/v1/media/files/{operatorId}/{uuid}` if the URL was leaked. New uploads use protected paths only. Migrate old `kyc_document_url` values to `tenants/{id}/kyc/` prefix or delete legacy files.

---

## Executive summary

The API is **not 100% secure**. Core authorization controls (order IDOR, cross-tenant JWT binding, refresh-token rotation) are implemented well, but several **architecture and configuration issues** would be critical in a real-money production deployment.

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 3     | Requires remediation before go-live |
| High     | 6     | Fix before production |
| Medium   | 5     | Plan fixes |
| Low      | 4     | Hardening |
| Passed   | 18+   | Controls working as intended |

**Demo environment note:** `HARAMBE_PAYMENT_MODE=mock` and `PLAYER_AUTO_VERIFY_EMAIL=true` are appropriate for demos but must never ship to production as-is.

---

## Methodology

1. **Static analysis** — guards, JWT strategies, payment callbacks, media storage, CORS, validation pipes  
2. **Live testing** — unauthenticated and authenticated requests against production API with `x-forwarded-host: demo.force42.com`  
3. **Attack scenarios attempted:**
   - IDOR (orders, prize claims, checkout resume, mock payment on others’ orders)
   - Payment webhook forgery / replay
   - JWT tampering (`alg: none`, cross-tenant token reuse)
   - Auth brute force / enumeration
   - Cart session hijacking
   - KYC document exposure / SSRF
   - Media path traversal
   - CORS origin reflection
   - Mass assignment / privilege escalation
   - SQL injection in path parameters
   - Rate-limit bypass

---

## Critical findings

### C-1 — Mock payment completes real orders without money (demo config)

**Risk:** Any logged-in user can mark their own pending order as paid via API when `HARAMBE_PAYMENT_MODE=mock` (the default).

**PoC (live, confirmed):**
```bash
# As player@demo.local with a pending order
curl -X POST https://api.force42.com/v1/payments/harambe/complete \
  -H "Authorization: Bearer <access_token>" \
  -H "x-forwarded-host: demo.force42.com" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"<your-pending-order-uuid>"}'
# → order status becomes "completed", tickets issued
```

**Code:** `checkout.service.ts` — `completeMockPayment()` only checks `order.user_id === player.id` and `payment.gateway_mode === "mock"`.

**Mitigation:**
- Production **must** set `HARAMBE_PAYMENT_MODE=live`
- Disable or guard `POST /v1/payments/harambe/complete` in production (404 or IP allowlist)
- Never default payment mode to `mock` in production builds

**IDOR retest:** Attacker completing *another* user’s order → **404 Order not found** ✓

---

### C-2 — KYC / uploaded files served on unauthenticated media route

**Risk:** Identity documents uploaded via `POST /v1/account/kyc/upload` are stored under `tenants/{operatorId}/{uuid}` and served by a **public** endpoint with no auth.

**Code:**
```typescript
// media.controller.ts
@PublicRoute()
@Get("files/:operatorId/:name")
async serveFile(...) { ... }
```

**PoC:** Upload returned URL pattern:
```
/v1/media/files/27734cf6-257f-46fd-88b7-2f2d70ae732c/<uuid>.png
```
Unauthenticated `GET` on production returned 404 in this test (likely storage/`API_PUBLIC_URL` misconfiguration — see H-6), but the **code path is public**; any file that exists on disk/S3 is world-readable if the UUID is known or leaked.

**Mitigation:**
- Serve KYC via authenticated route or signed short-lived URLs (S3 presigned)
- Separate bucket/prefix with no public read
- Never return KYC URLs in public JSON; operator admin should fetch via protected proxy

---

### C-3 — Permissive CORS with credentials

**Risk:** Any website can make credentialed cross-origin requests if a victim has cookies/tokens and visits a malicious page.

**PoC (live, confirmed):**
```bash
curl -I -X OPTIONS https://api.force42.com/v1/me \
  -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization" \
  -H "x-forwarded-host: demo.force42.com"
# access-control-allow-origin: https://evil.com
# access-control-allow-credentials: true
```

**Code:** `main.ts` — `origin: true, credentials: true`

**Mitigation:** Allowlist tenant front-end origins only (`demo.force42.com`, operator domains). Do not reflect arbitrary origins when credentials are enabled.

---

## High findings

### H-1 — Payment webhooks use static shared-secret equality (no HMAC / replay protection)

**Endpoints:** `POST /v1/payments/gateway/callback`, `/v1/payments/harambe/callback`, `/v1/payments/cashflows/callback`

**Code:** `verifyGatewayCallbackSignature()` — plain `signature === secret`

**Risk:** Secret leakage (logs, dev mock HTML, Swagger, insider) allows forging payment completion for any order UUID. No timestamp/nonce → replay possible if an old request is captured.

**Mitigation:** HMAC-SHA256 over canonical body + timestamp; reject stale timestamps; rotate secrets; use mTLS or IP allowlist for gateway callbacks.

---

### H-2 — Public Swagger at `/docs` and `/docs-json`

**PoC:** `GET https://api.force42.com/docs` → HTTP 200

**Risk:** Full attack surface map (auth, admin, payment callbacks, MFA routes).

**Mitigation:** Disable in production or protect with auth / network ACL.

---

### H-3 — JWT secret falls back to `"dev-secret"`

**Code:** `player-jwt.strategy.ts`, `operator-jwt.strategy.ts`, `platform-jwt.strategy.ts`:
```typescript
secretOrKey: process.env.JWT_SECRET ?? "dev-secret"
```

**Risk:** If `JWT_SECRET` is unset in production, tokens are forgeable.

**Mitigation:** Fail fast on boot if secret missing in production; remove default.

---

### H-4 — `PLAYER_AUTO_VERIFY_EMAIL=true` bypasses purchase gate

**PoC:** New registrations return `"email_verified": true` immediately.

**Code:** `player-auth.service.ts` + `checkout-policy.service.ts` requires `email_verified_at` for checkout.

**Risk:** Disposable emails can purchase without verification if this env var is set in production.

**Mitigation:** `PLAYER_AUTO_VERIFY_EMAIL=false` in production; enforce verify before checkout.

---

### H-5 — KYC accepts arbitrary external URLs (SSRF / phishing storage)

**PoC (live, confirmed):**
```bash
curl -X POST https://api.force42.com/v1/account/kyc \
  -H "Authorization: Bearer <token>" \
  -H "x-forwarded-host: demo.force42.com" \
  -H "Content-Type: application/json" \
  -d '{"document_url":"http://169.254.169.254/latest/meta-data/"}'
# → accepted, kyc_status: pending
```

**Risk:** No URL allowlist; internal/metadata URLs stored; if staff tooling ever fetches URLs server-side → SSRF.

**Mitigation:** Only accept URLs from your own upload flow; validate host against allowlist; block private IP ranges.

---

### H-6 — `API_PUBLIC_URL` misconfigured (localhost in KYC responses)

**PoC:** Upload response contained `http://localhost:4002/v1/media/files/...`

**Risk:** Broken KYC workflow, operators may expose wrong links; indicates production env not hardened.

**Mitigation:** Set `API_PUBLIC_URL=https://api.force42.com` on VPS.

---

## Medium findings

### M-1 — No security headers

**PoC:** No `Strict-Transport-Security`, `X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options` on API responses.

**Mitigation:** Add `@fastify/helmet` or equivalent.

---

### M-2 — Rate limiting is in-memory only; auth endpoints not specially protected

**Code:** `tenant-rate-limit.guard.ts` — 300 req/min/IP per operator, in-process Map.

**PoC:** 350 sequential requests to `/v1/cart/count` — all 200 (under limit; no auth lockout).

**Risk:** Distributed brute force on login/password reset; limits reset on process restart / not shared across PM2 instances.

**Mitigation:** Redis-backed rate limits; stricter limits on `/v1/auth/login`, `/v1/auth/forgot-password`, admin login; account lockout or CAPTCHA after N failures.

---

### M-3 — Guest cart session IDOR (if `x-cart-session` leaks)

**PoC:** Fixed session header accepted; guest can set predictable session IDs.

**Risk:** If session ID is exposed (logs, referrer, XSS on another site), attacker can read/modify guest cart before login merge.

**Mitigation:** HttpOnly cookie for cart session; rotate on login; sign session IDs.

---

### M-4 — Invalid Bearer token silently ignored on optional-auth routes

**Code:** `optional-player.guard.ts` — invalid JWT → treated as guest.

**Risk:** Low; clients may think they’re authenticated when they’re not.

---

### M-5 — Operator player list exposes `kyc_document_url`

**Expected for admin**, but combined with C-2 URLs are sensitive. Ensure admin routes require strong auth + audit logging.

---

## Low findings

| ID | Issue | Notes |
|----|-------|-------|
| L-1 | Dev mock gateway embeds callback secret in HTML when `GATEWAY_DEV_MOCK=true` | Disabled on prod (404) ✓ |
| L-2 | Cashflows callback uses same plain-secret pattern as Harambe | Same as H-1 |
| L-3 | `x-operator-slug` header bypass in non-production `NODE_ENV` | Blocked on prod ✓ |
| L-4 | Login timing ~100ms difference exists but same error message | Minor enumeration hardening |

---

## Controls verified (passed)

| Test | Result |
|------|--------|
| Order detail IDOR (another user’s UUID) | 404 ✓ |
| Mock payment on another user’s order | 404 ✓ |
| Checkout resume another user’s pending order | 404 ✓ |
| Prize claim PATCH IDOR | 404 ✓ |
| Cross-tenant JWT (`PlayerTenantGuard`) | 403/401 ✓ |
| Operator JWT on player `/v1/me` | 401 ✓ |
| JWT `alg: none` | 401 ✓ |
| Refresh token reuse after rotation | Revoked ✓ |
| Underage registration (DOB 2015) | 400 ✓ |
| Mass assignment on register (`role: admin`) | Ignored ✓ |
| Profile PATCH mass assignment (`site_credit_balance`) | Ignored ✓ |
| Login / forgot-password user enumeration | Same generic response ✓ |
| Negative / invalid cart quantities | 400 ✓ |
| Media path traversal (`..`) | 404 ✓ |
| Live gateway callback when mock mode | `{ ok: false, reason: "live_mode_disabled" }` ✓ |
| Dev mock gateway on production | 404 ✓ |
| Invalid tenant hostname | 404 ✓ |
| Admin dashboard without auth | 401 ✓ |
| Platform operators without auth | 401 ✓ |
| SQL injection in raffle slug | Connection error / no crash ✓ |

---

## Production go-live checklist

- [ ] `HARAMBE_PAYMENT_MODE=live`
- [ ] `PLAYER_AUTO_VERIFY_EMAIL=false`
- [ ] Strong unique `JWT_SECRET` and `JWT_REFRESH_SECRET` (no defaults)
- [ ] `API_PUBLIC_URL=https://api.force42.com`
- [ ] CORS allowlist per tenant domain
- [ ] Disable or protect `/docs`
- [ ] HMAC-signed payment webhooks + replay protection
- [ ] Authenticated or presigned KYC media access
- [ ] Helmet / security headers
- [ ] Redis rate limits + auth endpoint throttling
- [ ] `GATEWAY_DEV_MOCK=false`
- [ ] KYC URL validation (own uploads only)

---

## References

- [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- [OWASP CORS misconfiguration](https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny)
- [JWT best practices (RFC 8725)](https://www.rfc-editor.org/rfc/rfc8725.html)

---

*Report generated from automated and manual testing. Re-test after remediation.*
