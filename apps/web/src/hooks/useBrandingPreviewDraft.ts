"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BRANDING_DRAFT_STORAGE_KEY,
  type BrandingDraft,
} from "@kenji-raffle/shared/site-theme";
import { isBrandingPreviewUrl, readBrandingDraft } from "@/lib/branding-preview";

export function useBrandingPreviewDraft(): BrandingDraft | null {
  const searchParams = useSearchParams();
  const previewActive = isBrandingPreviewUrl(searchParams);
  const [draft, setDraft] = useState<BrandingDraft | null>(null);

  useEffect(() => {
    if (!previewActive) {
      setDraft(null);
      return;
    }

    setDraft(readBrandingDraft());

    function onStorage(event: StorageEvent) {
      if (event.key === BRANDING_DRAFT_STORAGE_KEY) {
        setDraft(readBrandingDraft());
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [previewActive]);

  return previewActive ? draft : null;
}
