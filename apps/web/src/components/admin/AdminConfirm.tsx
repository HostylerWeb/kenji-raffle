"use client";

import { useState, type ReactNode } from "react";

export function AdminConfirm({
  title,
  body,
  confirmLabel = "Confirm",
  danger,
  promptLabel,
  onConfirm,
  children,
}: {
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  promptLabel?: string;
  onConfirm: (promptValue?: string) => void | Promise<void>;
  children: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm(promptLabel ? value : undefined);
      setOpen(false);
      setValue("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {children(() => setOpen(true))}
      {open && (
        <div className="admin-modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="admin-confirm-title">{title}</h3>
            <p>{body}</p>
            {promptLabel ? (
              <label>
                {promptLabel}
                <input value={value} onChange={(e) => setValue(e.target.value)} />
              </label>
            ) : null}
            <div className="admin-modal__actions">
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={danger ? "btn btn-danger" : "btn"}
                disabled={busy}
                onClick={confirm}
              >
                {busy ? "Working…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
