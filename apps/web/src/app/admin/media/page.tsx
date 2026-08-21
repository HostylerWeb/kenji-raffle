"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type MediaItem = {
  id: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002";

type MediaListResponse = {
  items: MediaItem[];
};

export default function AdminMediaPage() {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const data = await operatorFetch<MediaListResponse>("/v1/admin/media");
    setItems(data.items);
  }

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load();
  }, [router]);

  async function upload(file: File) {
    setUploading(true);
    try {
      const token = getOperatorToken();
      const form = new FormData();
      form.append("file", file);
      const host =
        typeof window !== "undefined" && window.location.hostname !== "localhost"
          ? window.location.host
          : process.env.NEXT_PUBLIC_DEV_TENANT_HOST ?? "demo.kenji-raffle.local";

      const res = await fetch(`${API}/v1/admin/media/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-forwarded-host": host,
        },
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      await load();
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    await operatorFetch(`/v1/admin/media/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <OperatorAdminShell title="Media library" description="Uploads used on raffles and branding.">
      <div className="admin-panel">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="btn"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Upload image"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 16,
        }}
      >
        {items.map((m) => (
          <div key={m.id} className="card" style={{ padding: 8 }}>
            <img
              src={m.url}
              alt=""
              style={{
                width: "100%",
                height: 120,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            <p className="muted" style={{ fontSize: 12, margin: "8px 0 4px" }}>
              {(m.size_bytes / 1024).toFixed(0)} KB
            </p>
            <AdminConfirm
              title="Delete this file?"
              body="It will be removed from the media library."
              confirmLabel="Delete"
              danger
              onConfirm={() => remove(m.id)}
            >
              {(open) => (
                <button type="button" className="btn btn-secondary" onClick={open}>
                  Delete
                </button>
              )}
            </AdminConfirm>
          </div>
        ))}
        {items.length === 0 && (
          <AdminEmptyState title="No media yet" description="Upload images for raffles and branding." />
        )}
      </div>
    </OperatorAdminShell>
  );
}
