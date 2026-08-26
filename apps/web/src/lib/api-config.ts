const DEV_API_URL = "http://localhost:4002";

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/** Public raffle API base URL — never falls back to localhost on a live tenant hostname. */
export function getPublicApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) return configured;

  if (typeof window !== "undefined" && !isLocalHostname(window.location.hostname)) {
    const base = process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN ?? "force42.com";
    return `https://api.${base}`;
  }

  if (process.env.NODE_ENV === "production") {
    const base = process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN ?? "force42.com";
    return `https://api.${base}`;
  }

  return DEV_API_URL;
}

export function getTenantHost(): string {
  if (typeof window !== "undefined" && !isLocalHostname(window.location.hostname)) {
    return window.location.host;
  }
  return process.env.NEXT_PUBLIC_DEV_TENANT_HOST ?? "demo.kenji-raffle.local";
}

export function getDevTenantHost(): string {
  const dev = process.env.NEXT_PUBLIC_DEV_TENANT_HOST ?? "demo.kenji-raffle.local";
  return dev.split(":")[0];
}
