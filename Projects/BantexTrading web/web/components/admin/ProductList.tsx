"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatPriceMinor } from "@/lib/money";
import type { Product } from "@/lib/catalog/types";

export default function ProductList({ products }: { products: Product[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        p.categoryLabel.toLowerCase().includes(query)
    );
  }, [q, products]);

  async function toggleAvailability(product: Product) {
    if (busyId) return;
    setBusyId(product.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, available: !product.available }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error ?? "Could not update the product.");
      } else {
        router.refresh();
      }
    } catch {
      setNotice("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(product: Product) {
    if (busyId) return;
    const ok = window.confirm(
      `Delete "${product.name}"? This cannot be undone.`
    );
    if (!ok) return;
    setBusyId(product.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error ?? "Could not delete the product.");
      } else {
        router.refresh();
      }
    } catch {
      setNotice("Could not reach the server.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <input
          className="admin-form__input"
          style={{ maxWidth: 320 }}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
        />
      </div>

      {notice && <div className="admin-notice admin-notice--error">{notice}</div>}

      {filtered.length === 0 ? (
        <div className="admin-empty">
          <p className="admin-empty__title">No products match</p>
          <p className="admin-empty__text">
            {products.length === 0
              ? "Add your first product to get started."
              : "Try a different search."}
          </p>
          <Link href="/admin/products/new" className="admin-btn admin-btn--primary">
            Add a product
          </Link>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Options</th>
                <th>Availability</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt="" className="admin-table__thumb" />
                      <div>
                        <div className="admin-table__name">{p.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--slate)" }}>
                          /{p.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{p.categoryLabel}</td>
                  <td>{formatPriceMinor(p.unitPriceMinor)}</td>
                  <td>
                    {p.options && p.options.length > 0 ? (
                      <span style={{ fontSize: "0.78rem", color: "var(--slate)" }}>
                        {p.options.map((o) => o.label).join(", ")}
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.78rem", color: "var(--slate)" }}>—</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`admin-toggle ${p.available ? "is-on" : ""}`}
                      onClick={() => toggleAvailability(p)}
                      disabled={busyId !== null}
                      aria-pressed={p.available}
                    >
                      <span className="admin-toggle__track" />
                      <span>{p.available ? "Live" : "Hidden"}</span>
                    </button>
                  </td>
                  <td>
                    <div className="admin-table__row-actions">
                      <Link href={`/admin/products/${p.id}/edit`} className="admin-btn admin-btn--ghost">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        onClick={() => remove(p)}
                        disabled={busyId !== null}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
