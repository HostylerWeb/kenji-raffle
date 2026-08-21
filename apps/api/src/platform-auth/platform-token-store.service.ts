import { Injectable } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import IORedis from "ioredis";

const REFRESH_PREFIX = "platform:refresh:";
const USER_REFRESH_PREFIX = "platform:user-refresh:";

@Injectable()
export class PlatformTokenStoreService {
  private readonly redis: IORedis;

  constructor() {
    this.redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6383", {
      maxRetriesPerRequest: null,
    });
  }

  async storeRefreshToken(
    userId: string,
    jti: string,
    ttlSeconds: number,
  ): Promise<void> {
    const key = `${REFRESH_PREFIX}${jti}`;
    await this.redis.set(key, userId, "EX", ttlSeconds);
    await this.redis.sadd(`${USER_REFRESH_PREFIX}${userId}`, jti);
    await this.redis.expire(`${USER_REFRESH_PREFIX}${userId}`, ttlSeconds);
  }

  async validateRefreshToken(jti: string, userId: string): Promise<boolean> {
    const stored = await this.redis.get(`${REFRESH_PREFIX}${jti}`);
    return stored === userId;
  }

  async revokeRefreshToken(jti: string, userId: string): Promise<void> {
    await this.redis.del(`${REFRESH_PREFIX}${jti}`);
    await this.redis.srem(`${USER_REFRESH_PREFIX}${userId}`, jti);
  }

  async revokeAllForUser(userId: string): Promise<number> {
    const setKey = `${USER_REFRESH_PREFIX}${userId}`;
    const jtis = await this.redis.smembers(setKey);
    if (jtis.length === 0) return 0;
    const pipeline = this.redis.pipeline();
    for (const jti of jtis) {
      pipeline.del(`${REFRESH_PREFIX}${jti}`);
    }
    pipeline.del(setKey);
    await pipeline.exec();
    return jtis.length;
  }

  createJti(): string {
    return randomBytes(16).toString("hex");
  }
}
