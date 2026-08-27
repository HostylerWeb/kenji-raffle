"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { SITE_COPY_DEFAULTS, SITE_COPY_META, type SiteCopyKey } from "@kenji-raffle/shared/site-copy-defaults";
import { useSiteCopyEditor } from "./SiteCopyEditorProvider";

type SiteCopyInlineFieldProps = {
  copyKey: SiteCopyKey;
  as?: ElementType;
  className?: string;
  displayText: string;
};

export function SiteCopyInlineField({
  copyKey,
  as: Tag = "span",
  className,
  displayText,
}: SiteCopyInlineFieldProps) {
  const editor = useSiteCopyEditor();
  const meta = SITE_COPY_META[copyKey];
  const isEditing = editor?.editingKey === copyKey;
  const [draft, setDraft] = useState("");
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openEditor = useCallback(() => {
    if (!editor?.active) return;
    const raw = editor.getRawOverride(copyKey);
    const defaultTemplate = SITE_COPY_DEFAULTS[copyKey];
    setDraft(raw ?? defaultTemplate);
    editor.setEditingKey(copyKey);
  }, [copyKey, editor]);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [isEditing]);

  const closeEditor = useCallback(() => {
    editor?.setEditingKey(null);
  }, [editor]);

  const commitSave = useCallback(async () => {
    if (!editor) return;
    const trimmed = draft.trim();
    if (!trimmed) {
      await editor.resetKey(copyKey);
    } else {
      await editor.saveKey(copyKey, trimmed);
    }
    closeEditor();
  }, [copyKey, draft, editor, closeEditor]);

  const handleActivate = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      openEditor();
    },
    [openEditor],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void commitSave();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeEditor();
    }
  };

  const saving = editor?.saving === copyKey;

  const popover =
    isEditing && mounted
      ? createPortal(
          <>
            <button
              type="button"
              className="site-copy-edit-scrim"
              aria-label="Close editor"
              onMouseDown={(event) => event.preventDefault()}
              onClick={closeEditor}
            />
            <div
              className="site-copy-edit-popover"
              role="dialog"
              aria-label={meta.label}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <label className="site-copy-edit-popover__label">{meta.label}</label>
              <textarea
                ref={textareaRef}
                className="site-copy-edit-popover__input"
                value={draft}
                maxLength={meta.maxLength}
                rows={Math.min(6, Math.max(2, Math.ceil(meta.maxLength / 60)))}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={() => {
                  void commitSave();
                }}
                onKeyDown={onKeyDown}
              />
              <div className="site-copy-edit-popover__meta">
                <span>
                  {draft.length}/{meta.maxLength}
                </span>
                <span className="site-copy-edit-popover__hint">
                  Ctrl+Enter to save · Esc to cancel
                </span>
              </div>
              <div className="site-copy-edit-popover__actions">
                <button
                  type="button"
                  className="site-btn site-btn--ghost site-btn--sm"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    void editor?.resetKey(copyKey).then(closeEditor);
                  }}
                >
                  Reset to default
                </button>
                <button
                  type="button"
                  className="site-btn site-btn--primary site-btn--sm"
                  disabled={saving}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    void commitSave();
                  }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <Tag
        className={`${className ?? ""}${isEditing ? " is-editing" : ""}`.trim()}
        data-copy-key={copyKey}
        onMouseDown={handleActivate}
        onClick={handleActivate}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            openEditor();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Edit ${meta.label}`}
      >
        {displayText}
      </Tag>
      {popover}
    </>
  );
}
