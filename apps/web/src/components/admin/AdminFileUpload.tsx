"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

export function AdminFileUpload({
  label = "Click or drag to upload",
  hint = "JPG, PNG or WebP · up to 10 MB",
  accept = DEFAULT_ACCEPT,
  maxBytes = DEFAULT_MAX_BYTES,
  uploading = false,
  onFile,
}: {
  label?: string;
  hint?: string;
  accept?: string;
  maxBytes?: number;
  uploading?: boolean;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  function validate(file: File): string | null {
    const types = accept.split(",").map((t) => t.trim());
    if (types.length && !types.some((t) => file.type === t || t === "image/*")) {
      return "File type not supported.";
    }
    if (file.size > maxBytes) {
      return `File must be under ${Math.round(maxBytes / (1024 * 1024))} MB.`;
    }
    return null;
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    onFile(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div>
      <div
        className={`admin-file-upload${dragOver ? " admin-file-upload--drag" : ""}${uploading ? " admin-file-upload--busy" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onChange}
          disabled={uploading}
          style={{ display: "none" }}
        />
        <span className="admin-file-upload__label">
          {uploading ? "Uploading…" : label}
        </span>
        {!uploading && <span className="admin-file-upload__hint">{hint}</span>}
      </div>
      {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}
