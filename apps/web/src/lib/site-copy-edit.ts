export const SITE_EDIT_PARAM = "site_edit";

export function isSiteCopyEditUrl(params: URLSearchParams): boolean {
  return params.get(SITE_EDIT_PARAM) === "1";
}

export function buildSiteEditUrl(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  params.set(SITE_EDIT_PARAM, "1");
  const query = params.toString();
  return query ? `${pathname}?${query}` : `${pathname}?${SITE_EDIT_PARAM}=1`;
}

export function stripSiteEditParam(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  params.delete(SITE_EDIT_PARAM);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function getPublicSiteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}
