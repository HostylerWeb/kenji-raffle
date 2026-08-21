import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import type { TenantContext } from "@kenji-raffle/shared";

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = Number(process.env.TENANT_RATE_LIMIT_PER_MINUTE ?? 300);

@Injectable()
export class TenantRateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const url = String(req.url ?? "").split("?")[0];

    if (
      url.startsWith("/health") ||
      url.startsWith("/docs") ||
      url.startsWith("/v1/platform")
    ) {
      return true;
    }

    const tenant = req.tenantContext as TenantContext | undefined;
    if (!tenant?.operatorId) {
      return true;
    }

    const ip = req.ip ?? req.socket?.remoteAddress ?? "unknown";
    const key = `${tenant.operatorId}:${ip}`;
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now > entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }

    entry.count += 1;
    if (entry.count > MAX_REQUESTS) {
      throw new HttpException(
        "Too many requests. Try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
