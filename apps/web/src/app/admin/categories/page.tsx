"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OperatorAdminShell } from "@/components/OperatorAdminShell";
import {
  getOperatorToken,
  operatorFetch,
  operatorUpload,
} from "@/lib/api";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
};

type Settings = {
  name: string;
  branding: { primary_color?: string };
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSort, setEditSort] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadCategories() {
    setCategories(await operatorFetch<Category[]>("/v1/admin/categories"));
  }

  useEffect(() => {
    if (!getOperatorToken()) {
      router.replace("/admin/login");
      return;
    }
    loadCategories().catch(() => router.replace("/admin/login"));
    operatorFetch<Settings>("/v1/admin/settings").then(setSettings);
  }, [router]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await operatorFetch("/v1/admin/categories", {
        method: "POST",
        body: JSON.stringify({
          name,
          sort_order: Number(sortOrder),
        }),
      });
      setName("");
      setSortOrder("0");
      await loadCategories();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function removeCategory(id: string) {
    if (!confirm("Delete this category?")) return;
    setLoading(true);
    setError("");
    try {
      await operatorFetch(`/v1/admin/categories/${id}`, { method: "DELETE" });
      await loadCategories();
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
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Sort</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>
                  {cat.image_url ? (
                    <div>
                      <img
                        src={cat.image_url}
                        alt=""
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: "cover",
                          borderRadius: 6,
                          marginBottom: 4,
                        }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        disabled={loading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadCategoryImage(cat.id, file);
                        }}
                      />
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      disabled={loading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadCategoryImage(cat.id, file);
                      }}
                    />
                  )}
                </td>
                <td>
                  {editId === cat.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ padding: 8, width: "100%" }}
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="muted">
                  {editId === cat.id ? (
                    <input
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      style={{ padding: 8, width: "100%" }}
                    />
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
                      style={{ padding: 8, width: 80 }}
                    />
                  ) : (
                    cat.sort_order
                  )}
                </td>
                <td>
                  {editId === cat.id ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="btn"
                        disabled={loading}
                        onClick={() => saveEdit(cat.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setEditId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditId(cat.id);
                          setEditName(cat.name);
                          setEditSlug(cat.slug);
                          setEditSort(String(cat.sort_order));
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={loading}
                        onClick={() => removeCategory(cat.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-panel">
        <h3 className="admin-panel__title">Add category</h3>
        <form className="form" onSubmit={onCreate}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Sort order
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn" disabled={loading}>
            Create
          </button>
        </form>
      </div>
    </OperatorAdminShell>
  );
}
