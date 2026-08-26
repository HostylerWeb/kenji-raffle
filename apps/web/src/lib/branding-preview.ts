import {
  BRANDING_DRAFT_STORAGE_KEY,
  extractThemeConfig,
  resolveSiteTheme,
  type BrandingDraft,
} from "@kenji-raffle/shared/site-theme";

export function readBrandingDraft(): BrandingDraft | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(BRANDING_DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BrandingDraft;
  } catch {
    return null;
  }
}

export function resolveDraftTheme(draft: BrandingDraft) {
  return resolveSiteTheme({
    themePreset: draft.themePreset,
    primaryColor: draft.primaryColor,
    themeConfig: extractThemeConfig(draft.themeColors, draft.themeFonts),
  });
}

export function isBrandingPreviewUrl(searchParams: URLSearchParams | null): boolean {
  return searchParams?.get("kenji_preview") === "1";
}
