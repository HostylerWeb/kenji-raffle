import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mergeSiteCopyOverrides,
  resolveSiteCopy,
  resolveSiteCopyValue,
  sanitizeSiteCopyValue,
  SITE_COPY_DEFAULTS,
} from "../dist/index.js";

test("resolveSiteCopy interpolates tenantName and liveCount", () => {
  const resolved = resolveSiteCopy({}, { tenantName: "Demo Co", liveCount: 5 });
  assert.match(resolved["home.hero.headline"], /Demo Co/);
  assert.match(resolved["home.live.lead"], /5 competitions/);
  assert.match(resolved["home.live.view_all_btn"], /5 raffles/);
});

test("resolveSiteCopyValue uses override when set", () => {
  const value = resolveSiteCopyValue(
    "home.hero.kicker",
    { "home.hero.kicker": "Custom kicker" },
    { tenantName: "Demo" },
  );
  assert.equal(value, "Custom kicker");
});

test("sanitizeSiteCopyValue strips HTML and enforces max length", () => {
  const cleaned = sanitizeSiteCopyValue(
    "home.trust.item1",
    "<b>18+ only</b> extra text that is way too long for this field",
  );
  assert.equal(cleaned, "18+ only extra text that is way too long");
  assert.ok(cleaned.length <= 40);
});

test("sanitizeSiteCopyValue rejects unknown keys", () => {
  assert.equal(sanitizeSiteCopyValue("invalid.key", "hello"), null);
});

test("sanitizeSiteCopyValue empty string returns null", () => {
  assert.equal(sanitizeSiteCopyValue("home.empty.cta", "   "), null);
});

test("mergeSiteCopyOverrides deletes override on null", () => {
  const merged = mergeSiteCopyOverrides(
    { "home.hero.kicker": "Custom" },
    { "home.hero.kicker": null },
  );
  assert.equal(merged["home.hero.kicker"], undefined);
});

test("mergeSiteCopyOverrides ignores unknown keys", () => {
  const merged = mergeSiteCopyOverrides({}, { "bad.key": "nope" });
  assert.deepEqual(merged, {});
});

test("SITE_COPY_DEFAULTS includes phase 1 and phase 2 keys", () => {
  assert.ok(SITE_COPY_DEFAULTS["home.hero.headline"]);
  assert.ok(SITE_COPY_DEFAULTS["nav.raffles"]);
  assert.ok(SITE_COPY_DEFAULTS["checkout.secure.title"]);
});
