import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 120;

@Injectable()
export class PlatformRateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const url = String(req.url ?? "");
    if (!url.startsWith("/v1/platform")) {
      return true;
    }
    const ip = req.ip ?? req.socket?.remoteAddress ?? "unknown";
    const now = Date.now();
    const entry = buckets.get(ip);

    if (!entry || now > entry.resetAt) {
      buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
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
