"use client";

import { useEffect, type ReactNode } from "react";

export function AdminDrawer({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="admin-drawer-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-drawer__accent" />
        <div className="admin-drawer__header">
          <h3>{title}</h3>
          <button type="button" className="admin-drawer__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-drawer__body">{children}</div>
        {footer && <div className="admin-drawer__footer">{footer}</div>}
      </aside>
    </div>
  );
}
