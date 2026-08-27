#!/usr/bin/env python3
"""Optional starter content for a newly provisioned operator (not tied to demo)."""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

API = os.environ.get("KENJI_API_URL", "https://api.force42.com")
PLATFORM_HOST = os.environ.get("PLATFORM_HOST", "platform.force42.com")
PLATFORM_EMAIL = os.environ.get("PLATFORM_EMAIL", "admin@platform.local")
PLATFORM_PASSWORD = os.environ.get("PLATFORM_PASSWORD", "ChangeMe123!")
OPERATOR_PASSWORD = os.environ.get("OPERATOR_PASSWORD", "ChangeMe123!")


def request(method, path, host, token=None, body=None):
    headers = {
        "x-forwarded-host": host,
        "Content-Type": "application/json",
        "User-Agent": "KenjiSeedOperatorStarter/1.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = (
        json.dumps(body).encode()
        if body is not None
        else (b"{}" if method in ("POST", "PATCH", "PUT") else None)
    )
    req = urllib.request.Request(f"{API}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        raise RuntimeError(f"{method} {path} -> {e.code}: {err}") from e


def resolve_operator(token: str, slug: str) -> tuple[str, str]:
    operators = request("GET", "/v1/platform/operators", PLATFORM_HOST, token)
    for row in operators:
        if row.get("slug") == slug:
            detail = request(
                "GET",
                f"/v1/platform/operators/{row['id']}",
                PLATFORM_HOST,
                token,
            )
            hostname = next(
                (d["hostname"] for d in detail.get("domains", []) if d.get("is_primary")),
                f"{slug}.force42.com",
            )
            return row["id"], hostname
    raise RuntimeError(f"No operator found with slug {slug!r}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", required=True)
    parser.add_argument(
        "--minimal",
        action="store_true",
        help="Only patch legal/footer text (no sample raffle)",
    )
    args = parser.parse_args()

    platform = request(
        "POST",
        "/v1/platform/auth/login",
        PLATFORM_HOST,
        body={"email": PLATFORM_EMAIL, "password": PLATFORM_PASSWORD},
    )
    ptoken = platform["access_token"]
    _, tenant_host = resolve_operator(ptoken, args.slug)

    otoken = request(
        "POST",
        "/v1/admin/auth/login",
        tenant_host,
        body={"email": f"owner@{args.slug}.local", "password": OPERATOR_PASSWORD},
    )["access_token"]

    request(
        "PATCH",
        "/v1/admin/settings",
        tenant_host,
        otoken,
        {
            "faq_text": "Welcome to our raffle site. Good luck!",
            "terms_text": "Standard terms apply. 18+ only.",
            "privacy_text": "We respect your privacy.",
        },
    )
    print(f"Patched legal/footer text on {tenant_host}")

    if args.minimal:
        return

    raffle = request(
        "POST",
        "/v1/admin/raffles",
        tenant_host,
        otoken,
        {
            "title": "Launch raffle",
            "slug": "launch-raffle",
            "description": "Starter raffle — edit or replace in admin.",
            "ticket_price": 100,
            "total_tickets": 500,
            "status": "draft",
        },
    )
    print(f"Created draft raffle: {raffle.get('id', raffle)}")


if __name__ == "__main__":
    try:
        main()
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
