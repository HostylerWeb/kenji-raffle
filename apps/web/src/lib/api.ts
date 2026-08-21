const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002";
const OPERATOR_REFRESH_KEY = "operator_refresh_token";

export type OperatorStaffRole = "owner" | "manager" | "support" | "finance";

export type OperatorSessionUser = {
  id: string;
  email: string;
  role: OperatorStaffRole;
  operatorId: string;
};

export function getOperatorToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("operator_access_token");
}

export function getOperatorUser(): OperatorSessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("operator_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OperatorSessionUser;
  } catch {
    return null;
  }
}

export function setOperatorSession(
  accessToken: string,
  user: OperatorSessionUser,
  refreshToken?: string,
) {
  localStorage.setItem("operator_access_token", accessToken);
  localStorage.setItem("operator_user", JSON.stringify(user));
  if (refreshToken) {
    localStorage.setItem(OPERATOR_REFRESH_KEY, refreshToken);
  }
}

export function clearOperatorSession() {
  const refresh = localStorage.getItem(OPERATOR_REFRESH_KEY);
  const token = localStorage.getItem("operator_access_token");
  localStorage.removeItem("operator_access_token");
  localStorage.removeItem("operator_user");
  localStorage.removeItem(OPERATOR_REFRESH_KEY);

  if (refresh && token) {
    void fetch(`${API}/v1/admin/auth/logout`, {
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

async function refreshOperatorToken(): Promise<boolean> {
  const refresh = localStorage.getItem(OPERATOR_REFRESH_KEY);
  if (!refresh) return false;

  const res = await fetch(`${API}/v1/admin/auth/refresh`, {
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
    user: OperatorSessionUser;
  };
  setOperatorSession(data.access_token, data.user, data.refresh_token);
  return true;
}

export function getTenantHost(): string {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return window.location.host;
  }
  return process.env.NEXT_PUBLIC_DEV_TENANT_HOST ?? "demo.kenji-raffle.local";
}

export async function operatorFetch<T>(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<T> {
  const token = getOperatorToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("x-forwarded-host", getTenantHost());
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 401 && !retried && (await refreshOperatorToken())) {
    return operatorFetch<T>(path, options, true);
  }

  if (res.status === 401) {
    clearOperatorSession();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body.message === "string"
        ? body.message
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const tenantApi = API;

export async function operatorUpload(
  path: string,
  file: File,
): Promise<{ url: string; storage_key: string }> {
  const token = getOperatorToken();
  const form = new FormData();
  form.append("file", file);

  const headers = new Headers();
  headers.set("x-forwarded-host", getTenantHost());
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
