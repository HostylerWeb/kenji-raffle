#!/usr/bin/env python3
"""Summarise demo tenant GRA outbound queue (platform worker relay, not tenant site HTTP)."""
import json
import os
import subprocess
import sys
import urllib.request

API = os.environ.get("KENJI_API_URL", "https://api.force42.com")
DEMO_HOST = os.environ.get("DEMO_HOST", "demo.force42.com")
OPERATOR_EMAIL = os.environ.get("OPERATOR_EMAIL", "owner@demo.local")
OPERATOR_PASSWORD = os.environ.get("OPERATOR_PASSWORD", "ChangeMe123!")


def request(method, path, token=None, body=None):
    headers = {
        "x-forwarded-host": DEMO_HOST,
        "Content-Type": "application/json",
        "User-Agent": "KenjiDemoGraCheck/1.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else (b"{}" if method in ("POST",) else None)
    req = urllib.request.Request(f"{API}{path}", data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        raw = resp.read().decode()
        return json.loads(raw) if raw else {}


def main():
    if "--relay" in sys.argv:
        root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        relay = os.path.join(root, "scripts", "trigger-gra-relay.sh")
        subprocess.run(["bash", relay], check=True)
        return

    token = request(
        "POST",
        "/v1/admin/auth/login",
        body={"email": OPERATOR_EMAIL, "password": OPERATOR_PASSWORD},
    )["access_token"]

    events = request("GET", "/v1/admin/gra-events?limit=200", token)
    items = events.get("items", [])

    by_status: dict[str, list] = {}
    for ev in items:
        by_status.setdefault(ev["status"], []).append(ev)

    print("Demo GRA outbound events (queued in tenant DB, sent by platform worker):")
    for status in ("pending", "sent", "failed"):
        group = by_status.get(status, [])
        print(f"  {status}: {len(group)}")
        for ev in group[:3]:
            print(f"    - {ev['event_type']} ({ev['created_at'][:19]})")
        if len(group) > 3:
            print(f"    ... +{len(group) - 3} more")

    pending = by_status.get("pending", [])
    if pending:
        print(
            "\nIf pending stays high: run python3 scripts/configure-demo-gra.py "
            "and ensure raffle-worker is running with GRA_INGEST_URL."
        )
        print("Instant relay (demo): python3 scripts/demo-gra-check.py --relay")


if __name__ == "__main__":
    main()
