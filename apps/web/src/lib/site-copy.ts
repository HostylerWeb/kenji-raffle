import {
  resolveSiteCopy,
  resolveSiteCopyValue,
  type SiteCopyKey,
  type SiteCopyOverrides,
  type SiteCopyVars,
} from "@kenji-raffle/shared/site-copy-defaults";

export type TenantWithCopy = {
  name?: string;
  content?: {
    copy?: SiteCopyOverrides | Record<string, string>;
  };
};

export function getSiteCopyVars(
  tenant: TenantWithCopy,
  extra?: SiteCopyVars,
): SiteCopyVars {
  return {
    tenantName: tenant.name,
    ...extra,
  };
}

export function getSiteCopy(
  tenant: TenantWithCopy,
  key: SiteCopyKey,
  vars?: SiteCopyVars,
): string {
  const mergedVars = getSiteCopyVars(tenant, vars);
  return resolveSiteCopyValue(
    key,
    tenant.content?.copy ?? {},
    mergedVars,
  );
}

export function getAllSiteCopy(
  tenant: TenantWithCopy,
  vars?: SiteCopyVars,
): Record<SiteCopyKey, string> {
  return resolveSiteCopy(tenant.content?.copy ?? {}, getSiteCopyVars(tenant, vars));
}
