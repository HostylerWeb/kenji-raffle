#!/usr/bin/env python3
"""Configure GRA sandbox credentials for any operator (by slug or operator id)."""
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
GRA_API_KEY = os.environ.get("GRA_API_KEY", "")
GRA_HMAC_SECRET = os.environ.get("GRA_HMAC_SECRET", "")


def request(method, path, host, token=None, body=None):
    headers = {
        "x-forwarded-host": host,
        "Content-Type": "application/json",
        "User-Agent": "KenjiConfigureOperatorGra/1.0",
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


def resolve_operator_id(token: str, slug: str | None, operator_id: str | None) -> dict:
    if operator_id:
        return request("GET", f"/v1/platform/operators/{operator_id}", PLATFORM_HOST, token)

    if not slug:
        raise RuntimeError("Provide --slug or --operator-id")

    operators = request("GET", "/v1/platform/operators", PLATFORM_HOST, token)
    for row in operators:
        if row.get("slug") == slug:
            return request("GET", f"/v1/platform/operators/{row['id']}", PLATFORM_HOST, token)
    raise RuntimeError(f"No operator found with slug {slug!r}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", help="Operator slug (e.g. safarijackpot)")
    parser.add_argument("--operator-id", help="Platform operator UUID")
    parser.add_argument("--gra-api-key", default=GRA_API_KEY, help="GRA operator API key")
    parser.add_argument(
        "--gra-hmac-secret",
        default=GRA_HMAC_SECRET,
        help="GRA operator HMAC secret",
    )
    parser.add_argument(
        "--skip-queue-check",
        action="store_true",
        help="Skip operator admin GRA events queue check",
    )
    args = parser.parse_args()

    if not args.gra_api_key or not args.gra_hmac_secret:
        print(
            "ERROR: Set GRA_API_KEY and GRA_HMAC_SECRET env vars or pass --gra-api-key / --gra-hmac-secret",
            file=sys.stderr,
        )
        sys.exit(1)

    platform = request(
        "POST",
        "/v1/platform/auth/login",
        PLATFORM_HOST,
        body={"email": PLATFORM_EMAIL, "password": PLATFORM_PASSWORD},
    )
    ptoken = platform["access_token"]
    print(f"Platform login OK ({PLATFORM_EMAIL})")

    operator = resolve_operator_id(ptoken, args.slug, args.operator_id)
    operator_id = operator["id"]
    slug = operator["slug"]
    print(f"Operator: {operator['name']} ({slug}) id={operator_id}")

    request(
        "PATCH",
        f"/v1/platform/operators/{operator_id}/settings",
        PLATFORM_HOST,
        ptoken,
        {
            "gra_api_key": args.gra_api_key,
            "gra_hmac_secret": args.gra_hmac_secret,
        },
    )
    print("GRA credentials saved (encrypted in platform DB)")

    test = request(
        "POST",
        f"/v1/platform/operators/{operator_id}/test-gra-connection",
        PLATFORM_HOST,
        ptoken,
    )
    print(f"Test GRA connection: {test.get('ok', test)}")

    if args.skip_queue_check:
        return

    tenant_host = next(
        (d["hostname"] for d in operator.get("domains", []) if d.get("is_primary")),
        f"{slug}.force42.com",
    )
    operator_email = os.environ.get("OPERATOR_EMAIL", f"owner@{slug}.local")
    operator_password = os.environ.get("OPERATOR_PASSWORD", "ChangeMe123!")

    try:
        otoken = request(
            "POST",
            "/v1/admin/auth/login",
            tenant_host,
            body={"email": operator_email, "password": operator_password},
        )["access_token"]
        events = request("GET", "/v1/admin/gra-events?limit=20", tenant_host, otoken)
        items = events.get("items", events if isinstance(events, list) else [])
        by_status: dict[str, int] = {}
        for ev in items:
            status = ev.get("status", "?")
            by_status[status] = by_status.get(status, 0) + 1
        print(f"GRA outbound queue on {tenant_host}: {by_status or 'empty'}")
    except RuntimeError as err:
        print(f"Note: could not check operator GRA queue ({err})")


if __name__ == "__main__":
    try:
        main()
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
