const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002";

export async function getTenantContext(host: string) {
  const res = await fetch(`${API}/v1/tenant/context`, {
    headers: { "x-forwarded-host": host },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function publicFetch<T>(
  path: string,
  host: string,
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "x-forwarded-host": host },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function getRequestHost(
  headerStore: { get(name: string): string | null },
): string {
  const devTenant =
    process.env.NEXT_PUBLIC_DEV_TENANT_HOST ?? "demo.kenji-raffle.local";
  const raw =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    devTenant;
  const host = raw.split(":")[0];
  if (host === "localhost" || host === "127.0.0.1") {
    return devTenant.split(":")[0];
  }
  return host;
}
