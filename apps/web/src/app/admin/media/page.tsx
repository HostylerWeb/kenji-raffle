"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch } from "@/lib/api";

type MediaItem = {
  id: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

type MediaListResponse = {
  items: MediaItem[];
  total: number;
  page: number;
  limit: number;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002";

export default function AdminMediaPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [data, setData] = useState<MediaListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "24");
    setData(await operatorFetch<MediaListResponse>(`/v1/admin/media?${params.toString()}`));
  }, [page]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    load();
  }, [router, load]);

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
      setPage(1);
      await load();
      toast("Image uploaded");
    } catch {
      toast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    await operatorFetch(`/v1/admin/media/${id}`, { method: "DELETE" });
    await load();
    toast("File deleted");
  }

  const items = data?.items ?? [];

  return (
    <OperatorAdminShell title="Media library" description="Uploads used on raffles and branding.">
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Upload</h3>
            <p className="admin-panel__subtitle">
              JPG, PNG, WebP or GIF — up to 10 MB each. {data?.total ?? 0} file{(data?.total ?? 0) === 1 ? "" : "s"} total.
            </p>
          </div>
        </div>
        <div className="admin-panel__body" style={{ paddingTop: 0 }}>
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
          <label
            className="admin-file-upload"
            onClick={() => !uploading && fileRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <span className="admin-file-upload__label">
              {uploading ? "Uploading…" : "Click to upload image"}
            </span>
            <span className="admin-file-upload__hint">Or drag a file here — one at a time</span>
          </label>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="admin-panel">
          <AdminEmptyState
            title="No media yet"
            description="Upload images for raffles, categories, and branding."
            action={
              <button type="button" className="btn" disabled={uploading} onClick={() => fileRef.current?.click()}>
                Upload first image
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div className="admin-media-grid">
            {items.map((m) => (
              <div key={m.id} className="admin-media-card">
                <img src={m.url} alt="" className="admin-media-card__img" />
                <div className="admin-media-card__meta">
                  {(m.size_bytes / 1024).toFixed(0)} KB · {new Date(m.created_at).toLocaleDateString()}
                </div>
                <div className="admin-media-card__actions">
                  <AdminConfirm
                    title="Delete this file?"
                    body="It will be removed from the media library. Pages already using this URL may show a broken image."
                    confirmLabel="Delete"
                    danger
                    onConfirm={() => remove(m.id)}
                  >
                    {(open) => (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={open}>
                        Delete
                      </button>
                    )}
                  </AdminConfirm>
                </div>
              </div>
            ))}
          </div>
          {data && <AdminPagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}
        </>
      )}
    </OperatorAdminShell>
  );
}
