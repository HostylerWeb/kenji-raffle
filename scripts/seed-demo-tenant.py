#!/usr/bin/env python3
"""Seed demo tenant content for demo.force42.com."""
import json
import urllib.request

API = "https://api.force42.com"
HOST = "demo.force42.com"
OPERATOR_EMAIL = "owner@demo.local"
OPERATOR_PASSWORD = "ChangeMe123!"

LEGAL_FAQ = """How do I enter a raffle?
Browse live raffles, choose your tickets, add to cart, and complete checkout.

How are winners chosen?
Main prizes are drawn after the competition closes. Instant wins are revealed when you purchase.

What payment methods are accepted?
M-Pesa and card payments via our licensed payment gateway.

How do I claim a physical prize?
Go to My account → Prize claims and submit your shipping address."""

LEGAL_TERMS = """Terms of participation for Demo Operator raffles. You must be 18 or older and resident in Kenya. All sales are final once tickets are purchased. Prizes are as described on each raffle page."""

LEGAL_PRIVACY = """Demo Operator respects your privacy. We collect account and transaction data to operate licensed raffles and meet regulatory requirements. Contact us via the contact page for data requests."""

DEMO_RAFFLES = [
    {
        "title": "Win an iPhone 16 Pro Max",
        "slug": "iphone-16-pro-max",
        "category": "tech",
        "description": "Brand new iPhone 16 Pro Max 256GB. Cash alternative available.",
        "ticket_price": 500,
        "max_entries": 1000,
        "featured_image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
        "prize": {"name": "iPhone 16 Pro Max 256GB", "prize_type": "physical", "value_kes": 180000},
    },
    {
        "title": "Weekend Safari Getaway",
        "slug": "safari-getaway",
        "category": "experiences",
        "description": "Two nights at a luxury safari lodge for two. Includes game drives and all meals.",
        "ticket_price": 250,
        "max_entries": 500,
        "featured_image_url": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
        "prize": {"name": "Safari lodge weekend for two", "prize_type": "physical", "value_kes": 85000},
    },
    {
        "title": "KES 50,000 Cash Prize",
        "slug": "cash-50000",
        "category": "cash",
        "description": "Tax-free cash paid directly to your M-Pesa or bank account. Instant wins available.",
        "ticket_price": 100,
        "max_entries": 2000,
        "featured_image_url": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
        "prize": {"name": "KES 50,000 cash", "prize_type": "cash", "value_kes": 50000},
        "instant_win": {
            "name": "KES 500 Instant Win",
            "prize_type": "site_credit",
            "prize_value": 500,
            "win_frequency": 50,
            "total_available": 10,
        },
    },
]


def pick_slug(base_slug, items):
    if not any(r["slug"] == base_slug for r in items):
        return base_slug
    alt = f"{base_slug}-live"
    if not any(r["slug"] == alt for r in items):
        return alt
    return f"{base_slug}-live-2"


def ensure_demo_raffles(token, cat_ids, items):
    by_slug = {r["slug"]: r for r in items}
    active_slugs = {r["slug"] for r in items if r.get("status") == "active"}

    for template in DEMO_RAFFLES:
        existing = by_slug.get(template["slug"])
        if existing and existing.get("status") == "active":
            request(
                "PATCH",
                f"/v1/admin/raffles/{existing['id']}",
                token,
                {"is_featured": True},
            )
            print(f"Marked featured: {template['slug']}")
            continue

        slug = pick_slug(template["slug"], items)
        if slug in active_slugs:
            continue

        cat_id = cat_ids.get(template["category"])
        raffle = request(
            "POST",
            "/v1/admin/raffles",
            token,
            {
                "title": template["title"],
                "slug": slug,
                "description": template["description"],
                "category_id": cat_id,
                "ticket_price": template["ticket_price"],
                "max_entries": template["max_entries"],
                "min_tickets": 0,
                "is_featured": True,
                "featured_image_url": template["featured_image_url"],
                "end_date": "2026-12-31T23:59:59.000Z",
            },
        )
        request(
            "POST",
            f"/v1/admin/raffles/{raffle['id']}/prizes",
            token,
            template["prize"],
        )
        request("POST", f"/v1/admin/raffles/{raffle['id']}/tickets/generate", token)
        request(
            "PATCH",
            f"/v1/admin/raffles/{raffle['id']}/status",
            token,
            {"status": "active"},
        )
        print(f"Created active raffle: {slug}")

        iw = template.get("instant_win")
        if iw:
            try:
                request(
                    "POST",
                    f"/v1/admin/raffles/{raffle['id']}/instant-win-prizes",
                    token,
                    iw,
                )
                print(f"Added instant win to {slug}")
            except RuntimeError as e:
                print(f"Instant win skip ({slug}): {e}")


def request(method, path, token=None, body=None):
    headers = {
        "x-forwarded-host": HOST,
        "Content-Type": "application/json",
        "User-Agent": "KenjiDemoSeed/1.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else (b"{}" if method in ("POST", "PATCH", "PUT") else None)
    req = urllib.request.Request(f"{API}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        raise RuntimeError(f"{method} {path} -> {e.code}: {err}") from e


def main():
    login = request(
        "POST",
        "/v1/admin/auth/login",
        body={"email": OPERATOR_EMAIL, "password": OPERATOR_PASSWORD},
    )
    token = login["access_token"]
    print("Logged in as operator owner")

    settings = request("GET", "/v1/admin/settings", token)
    request(
        "PATCH",
        "/v1/admin/settings",
        token,
        {
            "faq_text": LEGAL_FAQ,
            "terms_text": LEGAL_TERMS,
            "privacy_text": LEGAL_PRIVACY,
        },
    )
    print("Legal copy updated")

    categories = [
        {"name": "Tech & Gadgets", "slug": "tech"},
        {"name": "Experiences", "slug": "experiences"},
        {"name": "Cash Prizes", "slug": "cash"},
    ]
    cat_ids = {}
    existing = request("GET", "/v1/admin/categories?limit=50", token)
    by_slug = {c["slug"]: c for c in existing.get("items", existing if isinstance(existing, list) else [])}

    for cat in categories:
        if cat["slug"] in by_slug:
            cat_ids[cat["slug"]] = by_slug[cat["slug"]]["id"]
            print(f"Category exists: {cat['slug']}")
        else:
            row = request("POST", "/v1/admin/categories", token, cat)
            cat_ids[cat["slug"]] = row["id"]
            print(f"Created category: {cat['slug']}")

    raffles = request("GET", "/v1/admin/raffles?limit=50", token)
    items = raffles.get("items", raffles if isinstance(raffles, list) else [])
    mapping = {
        "iphone-16-pro-max": cat_ids.get("tech"),
        "safari-getaway": cat_ids.get("experiences"),
        "cash-50000": cat_ids.get("cash"),
    }
    for r in items:
        cat_id = mapping.get(r["slug"])
        if cat_id and r.get("category_id") != cat_id:
            request("PATCH", f"/v1/admin/raffles/{r['id']}", token, {"category_id": cat_id})
            print(f"Assigned category to {r['slug']}")

    ensure_demo_raffles(token, cat_ids, items)

    # Refresh list after creates
    items = request("GET", "/v1/admin/raffles?limit=50", token).get("items", [])
    cash = next(
        (r for r in items if r["slug"] in ("cash-50000", "cash-50000-live", "cash-50000-live-2") and r.get("status") == "active"),
        None,
    )
    if cash:
        iw = request("GET", f"/v1/admin/raffles/{cash['id']}/instant-win-groups", token)
        groups = iw if isinstance(iw, list) else []
        if not groups:
            try:
                request(
                    "POST",
                    f"/v1/admin/raffles/{cash['id']}/instant-win-prizes",
                    token,
                    {
                        "name": "KES 500 Instant Win",
                        "prize_type": "site_credit",
                        "prize_value": 500,
                        "win_frequency": 50,
                        "total_available": 10,
                    },
                )
                print("Added instant-win prize to cash-50000")
            except RuntimeError as e:
                print(f"Instant win skip: {e}")

    try:
        request(
            "POST",
            "/v1/auth/register",
            body={
                "email": "player@demo.local",
                "password": "ChangeMe123!",
                "full_name": "Demo Player",
                "date_of_birth": "1995-01-15",
                "county": "Nairobi",
            },
        )
        print("Registered player@demo.local")
    except RuntimeError as e:
        if "409" in str(e) or "already" in str(e).lower():
            print("player@demo.local already exists")
        else:
            raise

    public = request("GET", "/v1/raffles")
    cats = request("GET", "/v1/categories")
    print(f"\nPublic: {len(public)} raffles, {len(cats)} categories")
    print("Test player: player@demo.local / ChangeMe123!")


if __name__ == "__main__":
    main()
