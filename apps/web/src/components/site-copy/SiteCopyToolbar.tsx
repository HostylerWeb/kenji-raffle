"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SITE_COPY_META } from "@kenji-raffle/shared/site-copy-defaults";
import { stripSiteEditParam } from "@/lib/site-copy-edit";
import { useSiteCopyEditor } from "./SiteCopyEditorProvider";

function pageLabel(pathname: string): string {
  if (pathname === "/") return "Home";
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return "Home";
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

function pageMetaKey(pathname: string): string {
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/raffles")) return "Raffles";
  if (pathname.startsWith("/cart")) return "Cart";
  if (pathname.startsWith("/checkout")) return "Checkout";
  if (pathname === "/login" || pathname === "/register") return "Auth";
  if (pathname === "/contact") return "Contact";
  if (pathname === "/play-safe") return "Play Safe";
  return "Global";
}

export function SiteCopyToolbar() {
  const editor = useSiteCopyEditor();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const router = useRouter();

  if (!editor?.active) return null;

  const page = pageMetaKey(pathname);
  const pageKeys = Object.values(SITE_COPY_META).filter((meta) => meta.page === page);

  function exitEditMode() {
    const clean = stripSiteEditParam(pathname, searchParams.toString());
    router.replace(clean);
  }

  return (
    <div className="site-copy-toolbar" role="toolbar" aria-label="Site copy editor">
      <div className="site-copy-toolbar__inner site-container">
        <div className="site-copy-toolbar__left">
          <strong>Editing site text</strong>
          <span className="site-copy-toolbar__page">{pageLabel(pathname)}</span>
          {editor.saving && <span className="site-copy-toolbar__status">Saving…</span>}
        </div>
        <div className="site-copy-toolbar__actions">
          {pageKeys.length > 0 && (
            <button
              type="button"
              className="site-btn site-btn--ghost site-btn--sm"
              onClick={() => {
                void editor.resetPage(page);
              }}
            >
              Reset page to defaults
            </button>
          )}
          <Link href="/admin/settings" className="site-btn site-btn--ghost site-btn--sm">
            Admin settings
          </Link>
          <button
            type="button"
            className="site-btn site-btn--secondary site-btn--sm"
            onClick={exitEditMode}
          >
            Exit editing
          </button>
        </div>
      </div>
    </div>
  );
}
