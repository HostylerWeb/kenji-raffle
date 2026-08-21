const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002";
const SESSION_KEY = "cart_session_id";
const REFRESH_KEY = "player_refresh_token";

export function getTenantHost(): string {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return window.location.host;
  }
  return process.env.NEXT_PUBLIC_DEV_TENANT_HOST ?? "demo.kenji-raffle.local";
}

function createCartSessionId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function getCartSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = createCartSessionId();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getPlayerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("player_access_token");
}

export function getPlayerRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setPlayerToken(token: string) {
  localStorage.setItem("player_access_token", token);
}

export function setPlayerSession(accessToken: string, refreshToken?: string) {
  setPlayerToken(accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export function clearPlayerSession() {
  const refresh = localStorage.getItem(REFRESH_KEY);
  const token = localStorage.getItem("player_access_token");
  localStorage.removeItem("player_access_token");
  localStorage.removeItem(REFRESH_KEY);

  if (refresh && token) {
    void fetch(`${API}/v1/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-forwarded-host": getTenantHost(),
      },
      body: JSON.stringify({ refresh_token: refresh }),
    }).catch(() => undefined);
  }
}

export function signOutPlayer() {
  clearPlayerSession();
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

async function refreshPlayerToken(): Promise<boolean> {
  const refresh = getPlayerRefreshToken();
  if (!refresh) return false;

  const res = await fetch(`${API}/v1/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-host": getTenantHost(),
    },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!res.ok) return false;

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
  };
  setPlayerSession(data.access_token, data.refresh_token);
  return true;
}

export async function playerFetch<T>(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<T> {
  const token = getPlayerToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("x-forwarded-host", getTenantHost());
  headers.set("x-cart-session", getCartSessionId());
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 401 && !retried && (await refreshPlayerToken())) {
    return playerFetch<T>(path, options, true);
  }

  if (res.status === 401) {
    clearPlayerSession();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body.message === "string" ? body.message : `Request failed (${res.status})`,
    );
  }
  return res.json() as Promise<T>;
}

export const playerApi = API;

export async function playerUpload(
  path: string,
  file: File,
): Promise<{ url: string; kyc_status?: string; kyc_document_url?: string }> {
  const token = getPlayerToken();
  const form = new FormData();
  form.append("file", file);

  const headers = new Headers();
  headers.set("x-forwarded-host", getTenantHost());
  headers.set("x-cart-session", getCartSessionId());
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body.message === "string" ? body.message : "Upload failed",
    );
  }

  return res.json();
}
