#!/usr/bin/env python3
"""Poll platform API until operator and tenant database are active."""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

API = os.environ.get("KENJI_API_URL", "https://api.force42.com")
PLATFORM_HOST = os.environ.get("PLATFORM_HOST", "platform.force42.com")
PLATFORM_EMAIL = os.environ.get("PLATFORM_EMAIL", "admin@platform.local")
PLATFORM_PASSWORD = os.environ.get("PLATFORM_PASSWORD", "ChangeMe123!")


def request(method, path, host, token=None, body=None):
    headers = {
        "x-forwarded-host": host,
        "Content-Type": "application/json",
        "User-Agent": "KenjiWaitForProvision/1.0",
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


def resolve_operator_id(token: str, slug: str | None, operator_id: str | None) -> str:
    if operator_id:
        return operator_id
    if not slug:
        raise RuntimeError("Provide --slug or --operator-id")
    operators = request("GET", "/v1/platform/operators", PLATFORM_HOST, token)
    for row in operators:
        if row.get("slug") == slug:
            return row["id"]
    raise RuntimeError(f"No operator found with slug {slug!r}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug")
    parser.add_argument("--operator-id")
    parser.add_argument("--timeout", type=int, default=600, help="Max wait seconds")
    parser.add_argument("--interval", type=int, default=5, help="Poll interval seconds")
    args = parser.parse_args()

    platform = request(
        "POST",
        "/v1/platform/auth/login",
        PLATFORM_HOST,
        body={"email": PLATFORM_EMAIL, "password": PLATFORM_PASSWORD},
    )
    token = platform["access_token"]
    operator_id = resolve_operator_id(token, args.slug, args.operator_id)

    deadline = time.time() + args.timeout
    last_status = ""

    while time.time() < deadline:
        operator = request(
            "GET",
            f"/v1/platform/operators/{operator_id}",
            PLATFORM_HOST,
            token,
        )
        op_status = operator.get("status", "?")
        db_status = (operator.get("tenant_database") or {}).get("status", "pending")
        last_status = f"operator={op_status} tenant_db={db_status}"

        if op_status == "active" and db_status == "active":
            primary = next(
                (d["hostname"] for d in operator.get("domains", []) if d.get("is_primary")),
                f"{operator.get('slug')}.force42.com",
            )
            print(json.dumps({"ok": True, "operator_id": operator_id, "hostname": primary}))
            return

        if db_status == "failed":
            err = (operator.get("tenant_database") or {}).get("provision_error")
            raise RuntimeError(f"Tenant provisioning failed: {err or 'unknown error'}")

        print(f"Waiting… {last_status}", flush=True)
        time.sleep(args.interval)

    raise RuntimeError(f"Timed out after {args.timeout}s ({last_status})")


if __name__ == "__main__":
    try:
        main()
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
