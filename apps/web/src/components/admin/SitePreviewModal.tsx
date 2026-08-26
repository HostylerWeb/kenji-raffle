"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BRANDING_DRAFT_STORAGE_KEY,
  type BrandingDraft,
} from "@kenji-raffle/shared/site-theme";

type PreviewPage = "home" | "raffle" | "cart";

const PREVIEW_PATHS: Record<PreviewPage, string> = {
  home: "/?kenji_preview=1",
  raffle: "/raffles?kenji_preview=1",
  cart: "/cart?kenji_preview=1",
};

export function SitePreviewModal({
  open,
  onClose,
  draft,
}: {
  open: boolean;
  onClose: () => void;
  draft: BrandingDraft;
}) {
  const [page, setPage] = useState<PreviewPage>("home");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    sessionStorage.setItem(BRANDING_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setIframeKey((k) => k + 1);
  }, [open, draft]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const iframeSrc = useMemo(() => {
    if (typeof window === "undefined") return PREVIEW_PATHS.home;
    const path = PREVIEW_PATHS[page];
    return `${window.location.origin}${path}&_preview=${iframeKey}`;
  }, [page, iframeKey]);

  if (!open) return null;

  return (
    <div className="admin-preview-modal" role="dialog" aria-modal="true" aria-label="Site preview">
      <button
        type="button"
        className="admin-preview-modal__backdrop"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div className="admin-preview-modal__panel">
        <div className="admin-preview-modal__toolbar">
          <strong>Site preview</strong>
          <div className="admin-preview-modal__tabs">
            {(
              [
                ["home", "Home"],
                ["raffle", "Raffles"],
                ["cart", "Cart"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`admin-preview-modal__tab${page === id ? " admin-preview-modal__tab--active" : ""}`}
                onClick={() => setPage(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="admin-preview-modal__device">
            <button
              type="button"
              className={`admin-preview-modal__device-btn${device === "desktop" ? " admin-preview-modal__device-btn--active" : ""}`}
              onClick={() => setDevice("desktop")}
            >
              Desktop
            </button>
            <button
              type="button"
              className={`admin-preview-modal__device-btn${device === "mobile" ? " admin-preview-modal__device-btn--active" : ""}`}
              onClick={() => setDevice("mobile")}
            >
              Mobile
            </button>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
        <div
          className={`admin-preview-modal__frame-wrap admin-preview-modal__frame-wrap--${device}`}
        >
          <div className="admin-preview-modal__frame-inner">
            <iframe
              key={iframeSrc}
              src={iframeSrc}
              title="Live site preview"
              className="admin-preview-modal__iframe"
            />
          </div>
        </div>
        <p className="admin-preview-modal__hint">
          Live preview of your public site with unsaved branding. Save settings to publish.
        </p>
      </div>
    </div>
  );
}

export function SitePreviewFab({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="admin-preview-fab" onClick={onClick}>
      Preview
    </button>
  );
}
