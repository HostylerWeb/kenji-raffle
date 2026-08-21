import { Injectable } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import IORedis from "ioredis";

const REFRESH_PREFIX = "player:refresh:";
const USER_REFRESH_PREFIX = "player:user-refresh:";

@Injectable()
export class PlayerTokenStoreService {
  private readonly redis: IORedis;

  constructor() {
    this.redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6383", {
      maxRetriesPerRequest: null,
    });
  }

  private userKey(operatorId: string, userId: string): string {
    return `${operatorId}:${userId}`;
  }

  async storeRefreshToken(
    operatorId: string,
    userId: string,
    jti: string,
    ttlSeconds: number,
  ): Promise<void> {
    const userKey = this.userKey(operatorId, userId);
    await this.redis.set(`${REFRESH_PREFIX}${jti}`, userKey, "EX", ttlSeconds);
    await this.redis.sadd(`${USER_REFRESH_PREFIX}${userKey}`, jti);
    await this.redis.expire(`${USER_REFRESH_PREFIX}${userKey}`, ttlSeconds);
  }

  async validateRefreshToken(
    jti: string,
    operatorId: string,
    userId: string,
  ): Promise<boolean> {
    const stored = await this.redis.get(`${REFRESH_PREFIX}${jti}`);
    return stored === this.userKey(operatorId, userId);
  }

  async revokeRefreshToken(
    jti: string,
    operatorId: string,
    userId: string,
  ): Promise<void> {
    const userKey = this.userKey(operatorId, userId);
    await this.redis.del(`${REFRESH_PREFIX}${jti}`);
    await this.redis.srem(`${USER_REFRESH_PREFIX}${userKey}`, jti);
  }

  async revokeAllForUser(operatorId: string, userId: string): Promise<number> {
    const userKey = this.userKey(operatorId, userId);
    const setKey = `${USER_REFRESH_PREFIX}${userKey}`;
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
