"use client";

import { buildGoogleFontsUrl } from "@kenji-raffle/shared/google-fonts-catalog";
import type { SiteThemeFonts } from "@kenji-raffle/shared/site-theme";
import { DEFAULT_SITE_FONTS } from "@kenji-raffle/shared/site-theme";

type SiteFontsProps = {
  fonts?: SiteThemeFonts | null;
};

export function SiteFonts({ fonts }: SiteFontsProps) {
  const resolved = fonts ?? DEFAULT_SITE_FONTS;
  const families = [
    resolved.body,
    resolved.heading,
    resolved.nav,
    resolved.button,
    resolved.link,
  ];
  const href = buildGoogleFontsUrl(families);
  if (!href) return null;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={href} />
    </>
  );
}
