"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CatalogCategory, Product } from "@/lib/catalog/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Props = {
  categories: CatalogCategory[];
  products: Product[];
};

const EMPTY = { id: "", slug: "", name: "", tagline: "", available: true, sortOrder: 0 };

export default function CategoryManager({ categories, products }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CatalogCategory | null>(null);
  const [replaceWith, setReplaceWith] = useState("");

  function countFor(category: CatalogCategory) {
    return products.filter((p) => p.category === category.slug).length;
  }

  function startEdit(category: CatalogCategory) {
    setEditingId(category.id);
    setForm({
      id: category.id,
      slug: category.slug,
      name: category.name,
      tagline: category.tagline,
      available: category.available,
      sortOrder: category.sortOrder,
    });
    setNotice(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function submitDelete(category: CatalogCategory, replaceWithId: string) {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replaceWithId: replaceWithId || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setNotice(data.error ?? "Could not delete the category.");
      } else {
        setPendingDelete(null);
        setReplaceWith("");
        router.refresh();
      }
    } catch {
      setNotice("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice(null);

    const payload = {
      slug: form.slug,
      name: form.name,
      tagline: form.tagline,
      available: form.available,
      sortOrder: Number(form.sortOrder),
    };
    const endpoint = editingId
      ? `/api/admin/categories/${editingId}`
      : "/api/admin/categories";
    try {
      const res = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        cancelEdit();
        router.refresh();
      } else {
        setNotice(data.error ?? "Could not save the category.");
      }
    } catch {
      setNotice("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  const isEditing = editingId !== null;

  return (
    <>
      {notice && <div className="admin-notice admin-notice--error">{notice}</div>}

      <section className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-card__title">
            {isEditing ? "Edit category" : "Add a category"}
          </h2>
          {isEditing && (
            <button type="button" className="admin-btn admin-btn--ghost" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>

        <form className="admin-form" onSubmit={submit} noValidate>
          <div className="admin-form__grid">
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="cat-name">Name</label>
              <input
                id="cat-name"
                className="admin-form__input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="cat-slug">Slug</label>
              <input
                id="cat-slug"
                className="admin-form__input"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="cat-tagline">Tagline</label>
              <input
                id="cat-tagline"
                className="admin-form__input"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="Short description"
              />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="cat-sort">Display order</label>
              <input
                id="cat-sort"
                type="number"
                min="0"
                className="admin-form__input"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </div>
            <div className="admin-form__field admin-form__field--full">
              <label className="admin-form__check">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                />
                Visible on the site
              </label>
            </div>
          </div>
          <div className="admin-form__actions">
            <button type="submit" className="admin-btn admin-btn--primary" disabled={busy || !form.name.trim()}>
              {busy ? "Saving…" : isEditing ? "Save changes" : "Add category"}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-card" style={{ marginTop: "1.25rem", padding: 0, overflow: "hidden" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => {
              const count = countFor(c);
              return (
                <tr key={c.id}>
                  <td>
                    <div className="admin-table__name">{c.name}</div>
                    {c.isBuiltIn && (
                      <span className="admin-badge admin-badge--builtin">Built-in</span>
                    )}
                  </td>
                  <td>/{c.slug}</td>
                  <td>{count}</td>
                  <td>
                    <span className={`admin-badge ${c.available ? "admin-badge--live" : "admin-badge--off"}`}>
                      {c.available ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__row-actions">
                      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => startEdit(c)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        disabled={c.isBuiltIn || busy}
                        title={c.isBuiltIn ? "Built-in categories cannot be deleted." : undefined}
                        onClick={() => setPendingDelete(c)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {pendingDelete && (
        <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "rgba(11,30,61,0.35)", zIndex: 20, padding: "1rem" }}>
          <div className="admin-card" style={{ maxWidth: 440, width: "100%" }}>
            <h2 className="admin-card__title" style={{ marginBottom: "0.5rem" }}>
              Delete “{pendingDelete.name}”?
            </h2>
            {countFor(pendingDelete) > 0 ? (
              <>
                <p style={{ fontSize: "0.88rem", color: "var(--slate)", margin: "0 0 1rem" }}>
                  This category still has {countFor(pendingDelete)} product(s). Choose a
                  category to move them to before deleting.
                </p>
                <div className="admin-form__field" style={{ marginBottom: "1rem" }}>
                  <label className="admin-form__label" htmlFor="replace">Move products to</label>
                  <select
                    id="replace"
                    className="admin-form__select"
                    value={replaceWith}
                    onChange={(e) => setReplaceWith(e.target.value)}
                  >
                    <option value="">Select a category…</option>
                    {categories
                      .filter((c) => c.id !== pendingDelete.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            ) : (
              <p style={{ fontSize: "0.88rem", color: "var(--slate)", margin: "0 0 1rem" }}>
                This will permanently remove the category.
              </p>
            )}
            <div className="admin-form__actions">
              <button
                type="button"
                className="admin-btn admin-btn--danger"
                disabled={busy || (countFor(pendingDelete) > 0 && !replaceWith)}
                onClick={() => submitDelete(pendingDelete, replaceWith)}
              >
                {busy ? "Deleting…" : "Delete category"}
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={() => { setPendingDelete(null); setReplaceWith(""); }}
                disabled={busy}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
