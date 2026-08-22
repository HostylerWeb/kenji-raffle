"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import { AdminConfirm } from "@/components/admin/AdminConfirm";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminToast } from "@/components/admin/AdminToast";
import { getOperatorToken, operatorFetch, operatorUpload } from "@/lib/api";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
};

type CategoriesResponse = {
  items: Category[];
  total: number;
  page: number;
  limit: number;
};

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

export default function CategoriesPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [data, setData] = useState<CategoriesResponse | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSort, setEditSort] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "25");
    if (search) params.set("search", search);
    setData(await operatorFetch<CategoriesResponse>(`/v1/admin/categories?${params.toString()}`));
  }, [page, search]);

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    loadCategories().catch(() => router.replace("/admin/login"));
    operatorFetch<Settings>("/v1/admin/settings").then(setSettings);
  }, [router, loadCategories]);

  const categories = data?.items ?? [];

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await operatorFetch("/v1/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name, sort_order: Number(sortOrder) }),
      });
      setName("");
      setSortOrder("0");
      setPage(1);
      await loadCategories();
      toast("Category created");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveEdit(id: string) {
    setLoading(true);
    setError("");
    try {
      await operatorFetch(`/v1/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          sort_order: Number(editSort),
        }),
      });
      setEditId(null);
      await loadCategories();
      toast("Category updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function uploadCategoryImage(id: string, file: File) {
    setLoading(true);
    setError("");
    try {
      const uploaded = await operatorUpload("/v1/admin/media/upload", file);
      await operatorFetch(`/v1/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ image_url: uploaded.url }),
      });
      await loadCategories();
      toast("Image uploaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function removeCategory(id: string) {
    setLoading(true);
    setError("");
    try {
      await operatorFetch(`/v1/admin/categories/${id}`, { method: "DELETE" });
      await loadCategories();
      toast("Category deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OperatorAdminShell
      title="Categories"
      description="Public catalogue grouping for raffles."
      branding={{
        name: settings?.name,
        primary_color: settings?.branding?.primary_color,
      }}
    >
      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">All categories</h3>
            <p className="admin-panel__subtitle">{data?.total ?? 0} categor{(data?.total ?? 0) === 1 ? "y" : "ies"} total</p>
          </div>
        </div>
        <AdminFilters
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="Search name or slug…"
          hasActive={Boolean(search)}
          onClear={() => { setSearch(""); setPage(1); }}
        >
          <button type="button" className="btn btn-secondary" onClick={() => loadCategories()}>
            Search
          </button>
        </AdminFilters>
        <AdminTable
          columns={["Image", "Name", "Slug", "Sort", ""]}
          isEmpty={categories.length === 0}
          emptyTitle="No categories"
          emptyDescription="Add your first category below."
        >
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>
                {cat.image_url ? (
                  <img src={cat.image_url} alt="" className="admin-thumb" />
                ) : (
                  <span className="muted">No image</span>
                )}
                <label className="admin-file-upload" style={{ padding: "10px 12px", marginTop: 8 }}>
                  <span className="admin-file-upload__label" style={{ fontSize: 12 }}>
                    {cat.image_url ? "Replace" : "Upload"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={loading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadCategoryImage(cat.id, file);
                    }}
                  />
                </label>
              </td>
              <td>
                {editId === cat.id ? (
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                ) : (
                  <strong>{cat.name}</strong>
                )}
              </td>
              <td className="muted">
                {editId === cat.id ? (
                  <input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
                ) : (
                  cat.slug
                )}
              </td>
              <td>
                {editId === cat.id ? (
                  <input
                    type="number"
                    value={editSort}
                    onChange={(e) => setEditSort(e.target.value)}
                    style={{ width: 80 }}
                  />
                ) : (
                  cat.sort_order
                )}
              </td>
              <td>
                <div className="admin-row-actions">
                  {editId === cat.id ? (
                    <>
                      <button type="button" className="btn btn-sm" disabled={loading} onClick={() => saveEdit(cat.id)}>
                        Save
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setEditId(cat.id);
                          setEditName(cat.name);
                          setEditSlug(cat.slug);
                          setEditSort(String(cat.sort_order));
                        }}
                      >
                        Edit
                      </button>
                      <AdminConfirm
                        title="Delete category?"
                        body="Raffles in this category will become uncategorised."
                        confirmLabel="Delete"
                        danger
                        onConfirm={() => removeCategory(cat.id)}
                      >
                        {(open) => (
                          <button type="button" className="btn btn-secondary btn-sm" disabled={loading} onClick={open}>
                            Delete
                          </button>
                        )}
                      </AdminConfirm>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        {data && <AdminPagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Add category</h3>
            <p className="admin-panel__subtitle">Slug is generated from the name automatically.</p>
          </div>
        </div>
        <form className="admin-form-grid" onSubmit={onCreate} style={{ paddingBottom: 22 }}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Cars & Bikes" />
          </label>
          <label>
            Sort order
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            <span className="field-hint">Lower numbers appear first.</span>
          </label>
          {error && <p className="error admin-form-grid__full">{error}</p>}
          <div className="admin-form-grid__full admin-form-actions" style={{ padding: 0 }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Creating…" : "Create category"}
            </button>
          </div>
        </form>
      </div>
    </OperatorAdminShell>
  );
}
