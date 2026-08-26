"use client";

import { useEffect, useState, type ReactNode } from "react";

export function AdminConfirm({
  title,
  body,
  details,
  confirmLabel = "Confirm",
  danger,
  promptLabel,
  confirmExact,
  confirmDisabled,
  blockReason,
  onConfirm,
  children,
}: {
  title: string;
  body: string;
  details?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  promptLabel?: string;
  confirmExact?: string;
  confirmDisabled?: boolean;
  blockReason?: string;
  onConfirm: (promptValue?: string) => void | Promise<void>;
  children: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const exact = confirmExact ?? "CONFIRM";
  const promptMismatch =
    Boolean(promptLabel) && value.trim() !== exact && value.trim().length > 0;
  const promptMissing = Boolean(promptLabel) && value.trim() !== exact;
  const actionDisabled = busy || Boolean(confirmDisabled) || promptMissing;

  function openModal() {
    setError("");
    setValue("");
    setOpen(true);
  }

  async function confirm() {
    if (confirmDisabled) {
      setError(blockReason ?? "Complete all required fields before continuing.");
      return;
    }
    if (promptLabel && value.trim() !== exact) {
      setError(`Type ${exact} exactly to continue.`);
      return;
    }

    setBusy(true);
    setError("");
    try {
      await onConfirm(promptLabel ? value : undefined);
      setOpen(false);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {children(openModal)}
      {open && (
        <div className="admin-modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3 id="admin-confirm-title">{title}</h3>
            </div>
            <div className="admin-modal__body">
              <p>{body}</p>
              {details ? <div className="admin-confirm-summary">{details}</div> : null}
              {confirmDisabled && blockReason ? (
                <p className="admin-error" role="alert">
                  {blockReason}
                </p>
              ) : null}
              {promptLabel ? (
                <label>
                  {promptLabel}
                  <input
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      if (error) setError("");
                    }}
                    autoFocus
                  />
                </label>
              ) : null}
              {promptMismatch && !error ? (
                <p className="admin-error" role="alert">
                  Type {exact} exactly to continue.
                </p>
              ) : null}
              {error ? (
                <p className="admin-error" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
            <div className="admin-modal__actions">
              <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </button>
              <button
                type="button"
                className={danger ? "btn btn-danger" : "btn"}
                disabled={actionDisabled}
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
