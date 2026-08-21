# Operator onboarding — who does what

Rafflex-style flow for Kenji Raffle Platform.

## Platform team (you)

**Where:** Platform console → `http://localhost:3003`

1. **Create operator in GRA first** — GRA console → Operators → register site with `external_id` (e.g. `op-001`).
2. **Create operator here** — Platform console → Operators → New (name, slug, **GRA registry ID** = GRA `external_id`).
3. **Wait for provisioning** — worker running; status **active**, DB **active**.
4. **Set GRA credentials** — platform operator detail → GRA keys (same **API key + HMAC secret** as GRA **Settings → Operator API Credentials** for that site).
5. **Test ingest** — purchase on tenant site; check GRA live feed and platform **GRA health** report. Payment ledger rows appear only when the **payment gateway** calls `POST /v1/gateway/notify` (not from raffle outbound events alone).
6. **Hand off to customer** — send:
   - Staging URL: `http://{slug}.kenji-raffle.local:3002`
   - Admin: `http://{slug}.kenji-raffle.local:3002/admin`
   - Login: `owner@{slug}.local` / `ChangeMe123!` (change after first login)
7. **Support only when needed** — suspend, reprovision, audit drill-down.

See [IMPORTANT.md](../IMPORTANT.md) for full GRA event mapping and payment-gateway vs ingest split.

You do **not** need to add their custom domain DNS for them — they do that in their admin (unless you choose to help manually).

## Customer (licensed operator)

**Where:** Their admin on staging or live domain → `/admin`

1. **Customise** — Settings (colours, support email), Raffles, Categories.
2. **Preview** — open public site from admin nav (staging URL).
3. **Domains & go live** — Admin → Domains:
   - Enter `www.theirbrand.co.ke` (or `raffles.theirbrand.co.ke`).
   - Copy DNS records shown (CNAME → `customers.kenji-raffle.co.ke` in production).
4. **At Cloudflare** (recommended):
   - Move domain to Cloudflare nameservers if needed ([Rafflex guide](https://docs.rafflex.io/getting-started/add-your-domain-to-rafflex.md)).
   - DNS → add **CNAME** for `www` → platform edge hostname.
   - Remove conflicting **A records** on apex `@`.
   - Optional **TXT** for verification.
5. **Verify DNS** — back in Admin → Domains → **Verify DNS** (wait 15–30 min after DNS changes).
6. **Live** — site and admin at `https://www.theirbrand.co.ke` and `https://www.theirbrand.co.ke/admin`.

## DNS summary

| Record | Where customer sets it | Value |
|--------|------------------------|--------|
| CNAME | Cloudflare (or registrar DNS) | `www` → `CUSTOM_DOMAIN_CNAME_TARGET` |
| TXT (optional) | Same | shown in Domains page |

**Not** “platform A record on customer’s `@`” — traffic flows: customer DNS → Cloudflare → Kenji edge → app.

## Environment

Set in `.env` for production:

```
CUSTOM_DOMAIN_CNAME_TARGET=customers.kenji-raffle.co.ke
```

Dev default uses local ingress target; operators use staging subdomain until custom domain verified.
