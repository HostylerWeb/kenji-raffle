"use client";

import Link from "next/link";
import { SiteCopyToolbar } from "./SiteCopyToolbar";

export default function SiteCopyEditorShell() {
  return (
    <>
      <div className="site-copy-edit-banner" role="status">
        Edit mode — click any outlined text on this page. Saves when you click away or press Ctrl+Enter.
      </div>
      <SiteCopyToolbar />
    </>
  );
}

export function SiteCopyLoginBanner() {
  return (
    <div className="site-copy-edit-banner site-copy-edit-banner--warn" role="alert">
      Log in to the operator admin to edit site text.{" "}
      <Link href="/admin/login">Go to admin login</Link>
    </div>
  );
}
