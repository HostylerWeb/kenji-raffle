#!/usr/bin/env python3
"""Configure GRA sandbox credentials for the demo operator on platform.force42.com."""
import json
import os
import sys
import urllib.request

API = os.environ.get("KENJI_API_URL", "https://api.force42.com")
PLATFORM_HOST = os.environ.get("PLATFORM_HOST", "platform.force42.com")
DEMO_HOST = os.environ.get("DEMO_HOST", "demo.force42.com")
PLATFORM_EMAIL = os.environ.get("PLATFORM_EMAIL", "admin@platform.local")
PLATFORM_PASSWORD = os.environ.get("PLATFORM_PASSWORD", "ChangeMe123!")
OPERATOR_EMAIL = os.environ.get("OPERATOR_EMAIL", "owner@demo.local")
OPERATOR_PASSWORD = os.environ.get("OPERATOR_PASSWORD", "ChangeMe123!")

# GRA seed credentials for registry external_id op-001 (see kenji-government docs)
GRA_API_KEY = os.environ.get("GRA_API_KEY", "gra_sandbox_op001_devkey0001")
GRA_HMAC_SECRET = os.environ.get("GRA_HMAC_SECRET", "sandbox_hmac_op001_secret_32chars_min")
DEMO_OPERATOR_ID = os.environ.get("DEMO_OPERATOR_ID", "27734cf6-257f-46fd-88b7-2f2d70ae732c")


def request(method, path, host, token=None, body=None):
    headers = {
        "x-forwarded-host": host,
        "Content-Type": "application/json",
        "User-Agent": "KenjiConfigureDemoGra/1.0",
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
    platform = request(
        "POST",
        "/v1/platform/auth/login",
        PLATFORM_HOST,
        body={"email": PLATFORM_EMAIL, "password": PLATFORM_PASSWORD},
    )
    ptoken = platform["access_token"]
    print(f"Platform login OK ({PLATFORM_EMAIL})")

    request(
        "PATCH",
        f"/v1/platform/operators/{DEMO_OPERATOR_ID}/settings",
        PLATFORM_HOST,
        ptoken,
        {
            "gra_api_key": GRA_API_KEY,
            "gra_hmac_secret": GRA_HMAC_SECRET,
        },
    )
    print("GRA credentials saved for demo operator (encrypted in platform DB)")

    test = request(
        "POST",
        f"/v1/platform/operators/{DEMO_OPERATOR_ID}/test-gra-connection",
        PLATFORM_HOST,
        ptoken,
    )
    print(f"Test GRA connection: {test.get('ok', test)}")

    otoken = request(
        "POST",
        "/v1/admin/auth/login",
        DEMO_HOST,
        body={"email": OPERATOR_EMAIL, "password": OPERATOR_PASSWORD},
    )["access_token"]

    events = request("GET", "/v1/admin/gra-events?limit=100", DEMO_HOST, otoken)
    items = events.get("items", events if isinstance(events, list) else [])
    by_status: dict[str, int] = {}
    for ev in items:
        by_status[ev.get("status", "?")] = by_status.get(ev.get("status", "?"), 0) + 1
    print(f"GRA outbound queue: {by_status or 'empty'}")
    print(
        "\nThe Kenji Raffle *worker* (not demo.force42.com) relays queued events to "
        "ingest.force42.com within ~5 minutes."
    )
    print("Check operator /admin/gra-events — rows should move pending → sent.")
    print(
        "Payment *ledger* in GRA still requires gateway notify — see docs/DEMO_GRA.md"
    )


if __name__ == "__main__":
    try:
        main()
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
