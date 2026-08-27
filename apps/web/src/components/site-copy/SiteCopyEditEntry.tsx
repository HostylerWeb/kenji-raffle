"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildSiteEditUrl } from "@/lib/site-copy-edit";

export function SiteCopyEditEntry() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();

  function enterEditMode() {
    router.push(buildSiteEditUrl(pathname, searchParams.toString()));
  }

  return (
    <>
      <div className="site-copy-entry" role="region" aria-label="Site copy editing">
        <div className="site-copy-entry__inner site-container">
          <p className="site-copy-entry__text">
            You&apos;re logged in as an operator. Edit headlines and labels on this page.
          </p>
          <button type="button" className="site-copy-entry__btn" onClick={enterEditMode}>
            Edit this page
          </button>
        </div>
      </div>

      <button
        type="button"
        className="site-copy-entry-fab"
        aria-label="Edit this page"
        onClick={enterEditMode}
      >
        <span className="site-copy-entry-fab__icon" aria-hidden>
          ✎
        </span>
        Edit page
      </button>
    </>
  );
}
