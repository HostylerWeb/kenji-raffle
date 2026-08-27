export const SITE_COPY_DRAFT_STORAGE_KEY = "kenji-site-copy-draft";

export type SiteCopyVars = {
  tenantName?: string;
  liveCount?: number | string;
};

export type SiteCopyMeta = {
  label: string;
  maxLength: number;
  page: string;
  element: string;
};

export const SITE_COPY_DEFAULTS = {
  "home.hero.kicker": "Licensed raffles · Kenya",
  "home.hero.headline": "Win amazing prizes from {{tenantName}}",
  "home.hero.sub":
    "Secure checkout, instant wins, and responsible play built in.",
  "home.trust.lead": "Licensed raffles · Secure payments · Instant wins",
  "home.trust.item1": "18+ only",
  "home.trust.item2": "Play responsibly",
  "home.trust.item3": "Play Safe controls",
  "home.live.title": "Live raffles",
  "home.live.lead": "{{liveCount}} competitions open — pick tickets and enter now.",
  "home.live.filters_label": "Browse by",
  "home.live.view_all_link": "View all →",
  "home.live.view_all_btn": "View all {{liveCount}} raffles",
  "home.steps.title": "How it works",
  "home.steps.1.title": "Choose a raffle",
  "home.steps.1.desc": "Browse live competitions and pick your favourites.",
  "home.steps.2.title": "Select tickets",
  "home.steps.2.desc":
    "Add tickets to your cart — reservations hold while you checkout.",
  "home.steps.3.title": "Pay securely",
  "home.steps.3.desc": "Complete payment via our licensed payment gateway.",
  "home.steps.4.title": "Win & claim",
  "home.steps.4.desc":
    "Instant wins credit immediately. Main prizes drawn after close.",
  "home.winners.title": "Recent winners",
  "home.winners.view_all": "View all →",
  "home.empty.title": "No raffles live yet",
  "home.empty.body": "Check back soon for new competitions.",
  "home.empty.cta": "Contact us",
  "nav.raffles": "Raffles",
  "nav.winners": "Winners",
  "nav.play_safe": "Play Safe",
  "nav.login": "Log in",
  "nav.register": "Register",
  "footer.explore_heading": "Explore",
  "footer.account_heading": "Account & legal",
  "footer.support_label": "Support",
  "footer.badge_18": "18+ only",
  "footer.badge_licensed": "Licensed operator",
  "footer.badge_responsible": "Play responsibly",
  "footer.age_notice": "Must be 18+ to enter",
  "raffles.page.title": "Live raffles",
  "raffles.page.lead": "Browse all competitions and enter in seconds.",
  "raffles.empty.title": "No raffles available",
  "raffles.empty.body": "Check back soon for new competitions.",
  "cart.page.title": "Your cart",
  "cart.empty.title": "Your cart is empty",
  "cart.empty.body": "Browse live raffles and add tickets to get started.",
  "cart.empty.cta": "Browse raffles",
  "cart.summary.title": "Order summary",
  "checkout.guest.title": "Complete your purchase",
  "checkout.billing.title": "Billing details",
  "checkout.order.title": "Your order",
  "checkout.secure.title": "Secure checkout",
  "auth.login.title": "Log in",
  "auth.login.lead": "Access your account to track orders and tickets.",
  "auth.register.title": "Create account",
  "auth.register.lead": "Register to save your details and checkout faster.",
  "contact.page.title": "Contact us",
  "contact.page.lead": "Questions about a raffle or your account? We're here to help.",
  "play_safe.page.title": "Play Safe",
  "play_safe.page.lead": "Tools and guidance to help you stay in control.",
} as const;

export type SiteCopyKey = keyof typeof SITE_COPY_DEFAULTS;

export type SiteCopyOverrides = Partial<Record<SiteCopyKey, string>>;

export const SITE_COPY_META: Record<SiteCopyKey, SiteCopyMeta> = {
  "home.hero.kicker": { label: "Hero kicker", maxLength: 80, page: "Home", element: "Eyebrow" },
  "home.hero.headline": { label: "Hero headline", maxLength: 120, page: "Home", element: "H1" },
  "home.hero.sub": { label: "Hero subhead", maxLength: 200, page: "Home", element: "Lead" },
  "home.trust.lead": { label: "Trust strip lead", maxLength: 120, page: "Home", element: "Text" },
  "home.trust.item1": { label: "Trust item 1", maxLength: 40, page: "Home", element: "Text" },
  "home.trust.item2": { label: "Trust item 2", maxLength: 40, page: "Home", element: "Text" },
  "home.trust.item3": { label: "Trust item 3", maxLength: 40, page: "Home", element: "Text" },
  "home.live.title": { label: "Live raffles title", maxLength: 60, page: "Home", element: "H2" },
  "home.live.lead": { label: "Live raffles lead", maxLength: 160, page: "Home", element: "Lead" },
  "home.live.filters_label": { label: "Filters label", maxLength: 40, page: "Home", element: "Label" },
  "home.live.view_all_link": { label: "View all link", maxLength: 30, page: "Home", element: "Link" },
  "home.live.view_all_btn": { label: "View all button", maxLength: 60, page: "Home", element: "Button" },
  "home.steps.title": { label: "How it works title", maxLength: 60, page: "Home", element: "H2" },
  "home.steps.1.title": { label: "Step 1 title", maxLength: 60, page: "Home", element: "H3" },
  "home.steps.1.desc": { label: "Step 1 description", maxLength: 200, page: "Home", element: "Text" },
  "home.steps.2.title": { label: "Step 2 title", maxLength: 60, page: "Home", element: "H3" },
  "home.steps.2.desc": { label: "Step 2 description", maxLength: 200, page: "Home", element: "Text" },
  "home.steps.3.title": { label: "Step 3 title", maxLength: 60, page: "Home", element: "H3" },
  "home.steps.3.desc": { label: "Step 3 description", maxLength: 200, page: "Home", element: "Text" },
  "home.steps.4.title": { label: "Step 4 title", maxLength: 60, page: "Home", element: "H3" },
  "home.steps.4.desc": { label: "Step 4 description", maxLength: 200, page: "Home", element: "Text" },
  "home.winners.title": { label: "Winners title", maxLength: 60, page: "Home", element: "H2" },
  "home.winners.view_all": { label: "Winners view all", maxLength: 30, page: "Home", element: "Link" },
  "home.empty.title": { label: "Empty state title", maxLength: 80, page: "Home", element: "H3" },
  "home.empty.body": { label: "Empty state body", maxLength: 200, page: "Home", element: "Text" },
  "home.empty.cta": { label: "Empty state CTA", maxLength: 30, page: "Home", element: "Button" },
  "nav.raffles": { label: "Nav: Raffles", maxLength: 30, page: "Global", element: "Link" },
  "nav.winners": { label: "Nav: Winners", maxLength: 30, page: "Global", element: "Link" },
  "nav.play_safe": { label: "Nav: Play Safe", maxLength: 30, page: "Global", element: "Link" },
  "nav.login": { label: "Nav: Log in", maxLength: 30, page: "Global", element: "Link" },
  "nav.register": { label: "Nav: Register", maxLength: 30, page: "Global", element: "Button" },
  "footer.explore_heading": { label: "Footer explore heading", maxLength: 40, page: "Global", element: "H3" },
  "footer.account_heading": { label: "Footer account heading", maxLength: 40, page: "Global", element: "H3" },
  "footer.support_label": { label: "Footer support label", maxLength: 30, page: "Global", element: "Label" },
  "footer.badge_18": { label: "Footer badge 18+", maxLength: 30, page: "Global", element: "Badge" },
  "footer.badge_licensed": { label: "Footer badge licensed", maxLength: 40, page: "Global", element: "Badge" },
  "footer.badge_responsible": { label: "Footer badge responsible", maxLength: 40, page: "Global", element: "Badge" },
  "footer.age_notice": { label: "Footer age notice", maxLength: 40, page: "Global", element: "Text" },
  "raffles.page.title": { label: "Raffles page title", maxLength: 60, page: "Raffles", element: "H1" },
  "raffles.page.lead": { label: "Raffles page lead", maxLength: 160, page: "Raffles", element: "Lead" },
  "raffles.empty.title": { label: "Raffles empty title", maxLength: 80, page: "Raffles", element: "H3" },
  "raffles.empty.body": { label: "Raffles empty body", maxLength: 200, page: "Raffles", element: "Text" },
  "cart.page.title": { label: "Cart page title", maxLength: 60, page: "Cart", element: "H1" },
  "cart.empty.title": { label: "Cart empty title", maxLength: 80, page: "Cart", element: "H3" },
  "cart.empty.body": { label: "Cart empty body", maxLength: 200, page: "Cart", element: "Text" },
  "cart.empty.cta": { label: "Cart empty CTA", maxLength: 30, page: "Cart", element: "Button" },
  "cart.summary.title": { label: "Cart summary title", maxLength: 60, page: "Cart", element: "H2" },
  "checkout.guest.title": { label: "Checkout guest title", maxLength: 60, page: "Checkout", element: "H2" },
  "checkout.billing.title": { label: "Checkout billing title", maxLength: 60, page: "Checkout", element: "H2" },
  "checkout.order.title": { label: "Checkout order title", maxLength: 60, page: "Checkout", element: "H2" },
  "checkout.secure.title": { label: "Checkout secure title", maxLength: 60, page: "Checkout", element: "H2" },
  "auth.login.title": { label: "Login title", maxLength: 60, page: "Auth", element: "H1" },
  "auth.login.lead": { label: "Login lead", maxLength: 200, page: "Auth", element: "Lead" },
  "auth.register.title": { label: "Register title", maxLength: 60, page: "Auth", element: "H1" },
  "auth.register.lead": { label: "Register lead", maxLength: 200, page: "Auth", element: "Lead" },
  "contact.page.title": { label: "Contact title", maxLength: 60, page: "Contact", element: "H1" },
  "contact.page.lead": { label: "Contact lead", maxLength: 200, page: "Contact", element: "Lead" },
  "play_safe.page.title": { label: "Play Safe title", maxLength: 60, page: "Play Safe", element: "H1" },
  "play_safe.page.lead": { label: "Play Safe lead", maxLength: 200, page: "Play Safe", element: "Lead" },
};

const SITE_COPY_KEYS = Object.keys(SITE_COPY_DEFAULTS) as SiteCopyKey[];

export function isSiteCopyKey(key: string): key is SiteCopyKey {
  return key in SITE_COPY_DEFAULTS;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function interpolate(template: string, vars: SiteCopyVars): string {
  return template
    .replace(/\{\{tenantName\}\}/g, vars.tenantName ?? "")
    .replace(/\{\{liveCount\}\}/g, String(vars.liveCount ?? ""));
}

export function resolveSiteCopy(
  overrides: SiteCopyOverrides | Record<string, string> | null | undefined,
  vars: SiteCopyVars = {},
): Record<SiteCopyKey, string> {
  const resolved = {} as Record<SiteCopyKey, string>;
  for (const key of SITE_COPY_KEYS) {
    const override = overrides?.[key];
    const base =
      typeof override === "string" && override.length > 0
        ? override
        : SITE_COPY_DEFAULTS[key];
    resolved[key] = interpolate(base, vars);
  }
  return resolved;
}

export function resolveSiteCopyValue(
  key: SiteCopyKey,
  overrides: SiteCopyOverrides | Record<string, string> | null | undefined,
  vars: SiteCopyVars = {},
): string {
  return resolveSiteCopy(overrides, vars)[key];
}

export function sanitizeSiteCopyValue(key: string, raw: unknown): string | null {
  if (!isSiteCopyKey(key)) {
    return null;
  }
  if (raw === null || raw === undefined) {
    return null;
  }
  if (typeof raw !== "string") {
    return null;
  }
  const cleaned = stripHtml(raw);
  if (cleaned.length === 0) {
    return null;
  }
  const maxLength = SITE_COPY_META[key].maxLength;
  return cleaned.slice(0, maxLength);
}

export function mergeSiteCopyOverrides(
  current: SiteCopyOverrides | Record<string, string> | null | undefined,
  updates: Record<string, string | null | undefined>,
): SiteCopyOverrides {
  const merged: SiteCopyOverrides = { ...(current ?? {}) };
  for (const [key, raw] of Object.entries(updates)) {
    if (!isSiteCopyKey(key)) {
      continue;
    }
    const sanitized = sanitizeSiteCopyValue(key, raw);
    if (sanitized === null) {
      delete merged[key];
    } else {
      merged[key] = sanitized;
    }
  }
  return merged;
}

export function listSiteCopyKeysForPage(page: string): SiteCopyKey[] {
  return SITE_COPY_KEYS.filter((key) => SITE_COPY_META[key].page === page);
}
