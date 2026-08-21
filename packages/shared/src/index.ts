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

export { encryptSecret, decryptSecret, requireEnv, slugifyDatabaseName } from "./crypto";
export { slugify } from "./slug";
export { fisherYatesShuffle, pickRandomItems } from "./random";
export {
  GRA_STAKE_BANDS,
  emptyGraStakeBandDistribution,
  graStakeBandForAmount,
  buildGraIngestRequest,
  postGraIngestRequest,
  testGraIngestConnection,
  processGraOutboundForOperator,
  processGraOutboundForAllTenants,
} from "./gra-outbound";
export type { GraStakeBand, GraIngestBuildResult } from "./gra-outbound";
