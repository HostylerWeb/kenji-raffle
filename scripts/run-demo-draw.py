#!/usr/bin/env python3
"""Run a manual draw on the demo tenant for public /winners content."""
import json
import urllib.request

API = "https://api.force42.com"
HOST = "demo.force42.com"
OPERATOR_EMAIL = "owner@demo.local"
OPERATOR_PASSWORD = "ChangeMe123!"


def request(method, path, token=None, body=None):
    headers = {
        "x-forwarded-host": HOST,
        "Content-Type": "application/json",
        "User-Agent": "KenjiDemoDraw/1.0",
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

    winners = request("GET", "/v1/winners")
    if winners:
        print(f"Winners already public ({len(winners)} rows) — skipping draw")
        return

    raffles = request("GET", "/v1/admin/raffles?limit=50", token)
    items = raffles.get("items", [])

    candidates = [
        r
        for r in items
        if r.get("status") in ("active", "to_be_drawn")
        and (r.get("tickets_sold") or 0) > 0
        and (r.get("tickets_sold") or 0) >= (r.get("min_tickets") or 0)
    ]
    candidates.sort(key=lambda r: r.get("tickets_sold") or 0, reverse=True)

    if not candidates:
        print("No raffle with enough sold tickets for a draw.")
        print("Complete a mock purchase on demo first, then re-run this script.")
        return

    target = candidates[0]
    print(f"Drawing {target['slug']} ({target.get('tickets_sold')} tickets sold)...")

    try:
        result = request("POST", f"/v1/admin/raffles/{target['id']}/draw", token)
        print(f"Draw complete: {json.dumps(result, indent=2)[:500]}")
    except RuntimeError as e:
        if "already drawn" in str(e).lower():
            print("Raffle already drawn")
        else:
            raise

    public = request("GET", "/v1/winners")
    print(f"Public winners now: {len(public)}")


if __name__ == "__main__":
    main()
