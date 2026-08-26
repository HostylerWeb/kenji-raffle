import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_AUTH_REQUESTS = Number(process.env.AUTH_RATE_LIMIT_PER_MINUTE ?? 20);

const AUTH_PATHS = new Set([
  "/v1/auth/login",
  "/v1/auth/register",
  "/v1/auth/forgot-password",
  "/v1/auth/reset-password",
  "/v1/admin/auth/login",
  "/v1/admin/auth/forgot-password",
  "/v1/admin/auth/reset-password",
]);

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const url = String(req.url ?? "").split("?")[0];

    if (!AUTH_PATHS.has(url)) {
      return true;
    }

    const ip = req.ip ?? req.socket?.remoteAddress ?? "unknown";
    const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "");
    const key = `${url}:${host}:${ip}`;
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now > entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }

    entry.count += 1;
    if (entry.count > MAX_AUTH_REQUESTS) {
      throw new HttpException(
        "Too many authentication attempts. Try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
