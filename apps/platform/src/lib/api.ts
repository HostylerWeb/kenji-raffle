const API =
  process.env.NEXT_PUBLIC_PLATFORM_API_URL?.replace(/\/$/, "") ??
  "/platform-api";
const USE_COOKIES =
  process.env.NEXT_PUBLIC_PLATFORM_AUTH_COOKIES === "true";

export type PlatformUser = {
  id: string;
  email: string;
  role: "platform_admin" | "platform_support";
};

export function getToken(): string | null {
  if (USE_COOKIES || typeof window === "undefined") return null;
  return localStorage.getItem("platform_access_token");
}

export function getRefreshToken(): string | null {
  if (USE_COOKIES || typeof window === "undefined") return null;
  return localStorage.getItem("platform_refresh_token");
}

export function getPlatformUser(): PlatformUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("platform_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PlatformUser;
  } catch {
    return null;
  }
}

export function isPlatformAdmin(): boolean {
  return getPlatformUser()?.role === "platform_admin";
}

export function setAuthSession(data: {
  access_token?: string;
  refresh_token?: string;
  user: PlatformUser;
}) {
  if (!USE_COOKIES && data.access_token && data.refresh_token) {
    localStorage.setItem("platform_access_token", data.access_token);
    localStorage.setItem("platform_refresh_token", data.refresh_token);
    scheduleProactiveRefresh(data.access_token);
  }
  localStorage.setItem("platform_user", JSON.stringify(data.user));
}

export function clearToken() {
  localStorage.removeItem("platform_access_token");
  localStorage.removeItem("platform_refresh_token");
  localStorage.removeItem("platform_user");
  if (typeof window !== "undefined") {
    clearTimeout(proactiveRefreshTimer);
    proactiveRefreshTimer = undefined;
  }
}

/** Full-page redirect to login — avoids Next.js client navigation chunk errors after sign-out. */
export function redirectToLogin() {
  clearToken();
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

let refreshInFlight: Promise<boolean> | null = null;
let proactiveRefreshTimer: ReturnType<typeof setTimeout> | undefined;

function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    return payload.exp ?? null;
  } catch {
    return null;
  }
}

function scheduleProactiveRefresh(accessToken: string) {
  if (typeof window === "undefined" || USE_COOKIES) return;
  const exp = decodeJwtExp(accessToken);
  if (!exp) return;
  const msUntilRefresh = exp * 1000 - Date.now() - 2 * 60 * 1000;
  if (msUntilRefresh <= 0) return;
  clearTimeout(proactiveRefreshTimer);
  proactiveRefreshTimer = setTimeout(() => {
    void refreshAccessToken();
  }, msUntilRefresh);
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refresh = getRefreshToken();
    if (!USE_COOKIES && !refresh) return false;

    const res = await fetch(`${API}/v1/platform/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(USE_COOKIES ? {} : { refresh_token: refresh }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    setAuthSession(data);
    return true;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export async function platformFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
    credentials: "include",
  }).catch((err: unknown) => {
    const message =
      err instanceof TypeError && /fetch/i.test(err.message)
        ? "Could not reach the platform API — check your network or try again."
        : err instanceof Error
          ? err.message
          : "Network request failed";
    throw new Error(message);
  });

  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return platformFetch<T>(path, options, false);
    }
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    throw new Error("Unauthorized");
  }

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body.message === "string"
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join(", ")
          : `Request failed (${res.status})`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  if (USE_COOKIES) return Boolean(getPlatformUser());
  return Boolean(getToken() && getRefreshToken() && getPlatformUser());
}

export const platformApi = API;

/** Call once on app load to refresh tokens before they expire. */
export function bootstrapAuthSession(): void {
  if (typeof window === "undefined" || USE_COOKIES) return;
  const token = getToken();
  if (token) scheduleProactiveRefresh(token);
}
