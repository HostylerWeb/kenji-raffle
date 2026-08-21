import { Injectable } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import IORedis from "ioredis";

const REFRESH_PREFIX = "operator:refresh:";
const USER_REFRESH_PREFIX = "operator:user-refresh:";

@Injectable()
export class OperatorTokenStoreService {
  private readonly redis: IORedis;

  constructor() {
    this.redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6383", {
      maxRetriesPerRequest: null,
    });
  }

  private userKey(operatorId: string, staffId: string): string {
    return `${operatorId}:${staffId}`;
  }

  async storeRefreshToken(
    operatorId: string,
    staffId: string,
    jti: string,
    ttlSeconds: number,
  ): Promise<void> {
    const userKey = this.userKey(operatorId, staffId);
    await this.redis.set(`${REFRESH_PREFIX}${jti}`, userKey, "EX", ttlSeconds);
    await this.redis.sadd(`${USER_REFRESH_PREFIX}${userKey}`, jti);
    await this.redis.expire(`${USER_REFRESH_PREFIX}${userKey}`, ttlSeconds);
  }

  async validateRefreshToken(
    jti: string,
    operatorId: string,
    staffId: string,
  ): Promise<boolean> {
    const stored = await this.redis.get(`${REFRESH_PREFIX}${jti}`);
    return stored === this.userKey(operatorId, staffId);
  }

  async revokeRefreshToken(
    jti: string,
    operatorId: string,
    staffId: string,
  ): Promise<void> {
    const userKey = this.userKey(operatorId, staffId);
    await this.redis.del(`${REFRESH_PREFIX}${jti}`);
    await this.redis.srem(`${USER_REFRESH_PREFIX}${userKey}`, jti);
  }

  async revokeAllForUser(operatorId: string, staffId: string): Promise<number> {
    const userKey = this.userKey(operatorId, staffId);
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
