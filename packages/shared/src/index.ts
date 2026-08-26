export type PlatformRole = "platform_admin" | "platform_support";

export type PlatformAuthUser = {
  id: string;
  email: string;
  role: PlatformRole;
};

export type PlatformLoginResponse = {
  access_token: string;
  refresh_token: string;
  user: PlatformAuthUser;
};

export type TenantContext = {
  operatorId: string;
  slug: string;
  graRegistryId: string;
  name: string;
  hostname: string;
};

export const PLATFORM_JWT_AUDIENCE = "raffle-platform-console";
export const OPERATOR_JWT_AUDIENCE = "raffle-operator-admin";
export const PLAYER_JWT_AUDIENCE = "raffle-player";

export type PlayerAuthUser = {
  id: string;
  email: string;
  operatorId: string;
};

export type PlayerLoginResponse = {
  access_token: string;
  refresh_token: string;
  user: PlayerAuthUser;
};

export type OperatorStaffRole = "owner" | "manager" | "support" | "finance";

export type OperatorAuthUser = {
  id: string;
  email: string;
  role: OperatorStaffRole;
  operatorId: string;
};

export type OperatorLoginResponse = {
  access_token: string;
  refresh_token: string;
  user: OperatorAuthUser;
};

export {
  signPlatformIntegrationBody,
  verifyPlatformIntegrationSignature,
  isGraComplianceReady,
  requestGraPlatformOperatorTeardown,
  type GraApplicationStatus,
  type GraOperatorApplicationPayload,
  type GraCredentialsCallbackPayload,
  type GraApplicationRejectedPayload,
  type GraPlatformOperatorTeardownPayload,
} from "./platform-gra-integration";
export {
  encryptSecret,
  decryptSecret,
  requireEnv,
  slugifyDatabaseName,
} from "./crypto";
export { slugify } from "./slug";
export {
  KENYA_COUNTIES,
  KENYA_REGIONS,
  KENYA_COUNTY_TO_REGION,
  getKenyaRegionForCounty,
  type KenyaCounty,
} from "./kenya-geography";
export { fisherYatesShuffle, pickRandomItems } from "./random";
export { enqueueProcessGraOutbound, PLATFORM_QUEUE_NAME } from "./gra-relay-queue";
export {
  GRA_STUCK_PENDING_HOURS,
  canRetryGraEvent,
} from "./gra-retry";
export {
  GRA_RELAY_MAX_RETRIES,
  GRA_RELAY_BACKOFF_MS,
  graRelayConfig,
  GraOperatorRateLimiter,
  getGraRelayRateLimiter,
  classifyGraHttpResponse,
  computeNextAttemptAt,
  graIdempotencyKey,
  emptyGraRelayMetrics,
  logGraRelayRun,
  mapWithConcurrency,
} from "./gra-relay";
export type {
  GraRelayConfig,
  GraIngestPostResult,
  GraRelayRunMetrics,
} from "./gra-relay";
export {
  GRA_STAKE_BANDS,
  emptyGraStakeBandDistribution,
  graStakeBandForAmount,
  buildGraIngestRequest,
  postGraIngestRequest,
  testGraIngestConnection,
  processGraOutboundForOperator,
  processGraOutboundForAllTenants,
  runGraHeartbeatForOperator,
  runGraHeartbeatForAllOperators,
  getGraQueueStatsForOperator,
} from "./gra-outbound";
export type {
  GraStakeBand,
  GraIngestBuildResult,
  GraOutboundProcessResult,
  GraOperatorQueueStats,
} from "./gra-outbound";
export {
  SITE_THEME_PRESETS,
  resolveSiteTheme,
  themeToCssVariables,
  extractThemeConfig,
  sanitizeThemeColor,
  type SiteThemeColors,
  type SiteThemePresetId,
} from "./site-theme";
