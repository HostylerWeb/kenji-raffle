export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (isProduction()) {
    throw new Error("JWT_SECRET must be set in production");
  }
  return "dev-secret";
}

export function requireJwtRefreshSecret(): string {
  const secret =
    process.env.JWT_REFRESH_SECRET?.trim() ?? process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (isProduction()) {
    throw new Error("JWT_REFRESH_SECRET or JWT_SECRET must be set in production");
  }
  return "dev-secret";
}

export function getCartSessionSecret(): string {
  return (
    process.env.CART_SESSION_SECRET?.trim() ??
    process.env.JWT_SECRET?.trim() ??
    "dev-cart-session-secret"
  );
}

export function playerAutoVerifyEmailEnabled(): boolean {
  if (isProduction()) {
    return process.env.PLAYER_AUTO_VERIFY_EMAIL === "true";
  }
  return process.env.PLAYER_AUTO_VERIFY_EMAIL !== "false";
}

export function parseCorsOrigins(): string[] | true {
  const raw = process.env.CORS_ALLOWED_ORIGINS?.trim();
  if (raw) {
    return raw.split(",").map((o) => o.trim()).filter(Boolean);
  }
  if (isProduction()) {
    return [];
  }
  return true;
}

export function corsOriginAllowed(origin: string | undefined): boolean {
  const configured = parseCorsOrigins();
  if (configured === true) return true;
  if (!origin) return true;
  if (configured.length === 0) return false;

  let originHost: string;
  let originProtocol: string;
  try {
    const parsed = new URL(origin);
    originHost = parsed.hostname;
    originProtocol = parsed.protocol;
  } catch {
    return false;
  }

  return configured.some((allowed: string) => {
    if (allowed === origin) return true;

    const wildcardOrigin = allowed.match(/^(https?):\/\/\*\.(.+)$/);
    if (wildcardOrigin) {
      const [, scheme, baseDomain] = wildcardOrigin;
      if (originProtocol !== `${scheme}:`) return false;
      return (
        originHost.endsWith(`.${baseDomain}`) || originHost === baseDomain
      );
    }

    if (allowed.startsWith("*.")) {
      const suffix = allowed.slice(1);
      return originHost.endsWith(suffix) || originHost === allowed.slice(2);
    }

    return false;
  });
}

export function swaggerEnabled(): boolean {
  if (process.env.SWAGGER_ENABLED === "true") return true;
  if (process.env.SWAGGER_ENABLED === "false") return false;
  return !isProduction();
}

export function validateProductionSecurityConfig(): void {
  if (!isProduction()) return;

  requireJwtSecret();
  requireJwtRefreshSecret();

  if (process.env.PLAYER_AUTO_VERIFY_EMAIL === "true") {
    throw new Error(
      "PLAYER_AUTO_VERIFY_EMAIL must not be true in production",
    );
  }

  if (process.env.HARAMBE_PAYMENT_MODE !== "live") {
    throw new Error("HARAMBE_PAYMENT_MODE must be live in production");
  }

  if (process.env.GATEWAY_DEV_MOCK === "true") {
    throw new Error("GATEWAY_DEV_MOCK must not be enabled in production");
  }

  if (!process.env.CART_SESSION_SECRET?.trim()) {
    throw new Error("CART_SESSION_SECRET must be set in production");
  }

  if (!process.env.API_PUBLIC_URL?.trim()) {
    throw new Error("API_PUBLIC_URL must be set in production");
  }

  const cors = parseCorsOrigins();
  if (cors !== true && cors.length === 0) {
    throw new Error(
      "CORS_ALLOWED_ORIGINS must be set in production (comma-separated)",
    );
  }

  if (!process.env.HARAMBE_CALLBACK_SECRET?.trim()) {
    throw new Error("HARAMBE_CALLBACK_SECRET must be set in production");
  }
}
