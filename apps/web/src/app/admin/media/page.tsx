"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFileUpload } from "@/components/admin/AdminFileUpload";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getPublicApiUrl, getTenantHost } from "@/lib/api-config";
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

export default function AdminMediaPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [data, setData] = useState<MediaListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

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
      const host = getTenantHost();

      const res = await fetch(`${getPublicApiUrl()}/v1/admin/media/upload`, {
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
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (m) => m.url.toLowerCase().includes(q) || m.mime_type.toLowerCase().includes(q),
    );
  }, [items, search]);

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
          <AdminFileUpload
            label="Click to upload image"
            hint="Or drag a file here — one at a time"
            uploading={uploading}
            onFile={upload}
          />
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Library</h3>
            <p className="admin-panel__subtitle">
              {filteredItems.length} file{filteredItems.length === 1 ? "" : "s"}
              {search ? " matching filter" : " on this page"}
            </p>
          </div>
        </div>
        <AdminFilters
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search URL or MIME type…"
          hasActive={Boolean(search)}
          onClear={() => setSearch("")}
        />
        {items.length === 0 ? (
          <AdminEmptyState
            title="No media yet"
            description="Upload images for raffles, categories, and branding."
            action={
              <AdminFileUpload
                label="Upload first image"
                hint="JPG, PNG, WebP or GIF"
                uploading={uploading}
                onFile={upload}
              />
            }
          />
        ) : filteredItems.length === 0 ? (
          <AdminEmptyState
            title="No matches"
            description="Try a different search term."
            action={
              <button type="button" className="btn btn-secondary" onClick={() => setSearch("")}>
                Clear search
              </button>
            }
          />
        ) : (
          <>
            <div className="admin-media-grid">
              {filteredItems.map((m) => (
                <div key={m.id} className="admin-media-card">
                  <img src={m.url} alt="" className="admin-media-card__img" />
                  <div className="admin-media-card__meta">
                    {m.mime_type} · {(m.size_bytes / 1024).toFixed(0)} KB · {new Date(m.created_at).toLocaleDateString()}
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
      </div>
    </OperatorAdminShell>
  );
}
