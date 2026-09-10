"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { formatPriceMinor, toMinorUnits } from "@/lib/money";
import type { CatalogCategory, Product } from "@/lib/catalog/types";

type OptionValueDraft = { id: string; value: string; priceDelta: string };
type OptionDraft = { id: string; label: string; values: OptionValueDraft[] };
type SpecDraft = { id: string; label: string; value: string };

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Props = {
  categories: CatalogCategory[];
  product?: Product;
};

export default function AdminProductForm({ categories, product }: Props) {
  const router = useRouter();
  const editing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [available, setAvailable] = useState(product?.available ?? true);
  const [sortOrder, setSortOrder] = useState(product?.sortOrder ?? 0);
  const [priceRs, setPriceRs] = useState(
    product ? String(product.unitPriceMinor / 100) : ""
  );

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [newImage, setNewImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [specs, setSpecs] = useState<SpecDraft[]>(
    (product?.specs ?? []).map(([label, value], i) => ({
      id: uid("spec") + i,
      label,
      value,
    }))
  );

  const [options, setOptions] = useState<OptionDraft[]>(
    (product?.options ?? []).map((group) => ({
      id: uid("opt"),
      label: group.label,
      values: group.values.map((v, i) => ({
        id: uid("val") + i,
        value: v.value,
        priceDelta: v.priceDeltaMinor ? String(v.priceDeltaMinor / 100) : "",
      })),
    }))
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- name → slug autofill ---
  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  // --- images ---
  function addImage() {
    const url = newImage.trim();
    if (url) setImages((prev) => [...prev, url]);
    setNewImage("");
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset the input so selecting the same file again re-triggers the change.
    e.target.value = "";
    if (!file || uploading) return;

    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (res.ok && data.ok) {
        setImages((prev) => [...prev, data.url as string]);
      } else {
        setUploadError(data.error ?? "Could not upload the image.");
      }
    } catch {
      setUploadError("Could not reach the upload server.");
    } finally {
      setUploading(false);
    }
  }
  function setImage(index: number, value: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? value : img)));
  }
  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }
  function moveImage(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  // --- specs ---
  function changeSpec(id: string, key: "label" | "value", value: string) {
    setSpecs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  }
  function removeSpec(id: string) {
    setSpecs((prev) => prev.filter((s) => s.id !== id));
  }

  // --- options ---
  function setOptionLabel(id: string, label: string) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, label } : o)));
  }
  function addOption() {
    setOptions((prev) => [
      ...prev,
      { id: uid("opt"), label: "", values: [{ id: uid("val"), value: "", priceDelta: "" }] },
    ]);
  }
  function removeOption(id: string) {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }
  function addOptionValue(optionId: string) {
    setOptions((prev) =>
      prev.map((o) =>
        o.id === optionId
          ? { ...o, values: [...o.values, { id: uid("val"), value: "", priceDelta: "" }] }
          : o
      )
    );
  }
  function changeOptionValue(
    optionId: string,
    valueId: string,
    key: "value" | "priceDelta",
    value: string
  ) {
    setOptions((prev) =>
      prev.map((o) =>
        o.id === optionId
          ? {
              ...o,
              values: o.values.map((v) =>
                v.id === valueId ? { ...v, [key]: value } : v
              ),
            }
          : o
      )
    );
  }
  function removeOptionValue(optionId: string, valueId: string) {
    setOptions((prev) =>
      prev.map((o) =>
        o.id === optionId
          ? { ...o, values: o.values.filter((v) => v.id !== valueId) }
          : o
      )
    );
  }

  function buildPayload() {
    const cleanedImages = images.map((i) => i.trim()).filter(Boolean);
    const cleanedSpecs = specs
      .filter((s) => s.label.trim() && s.value.trim())
      .map((s) => [s.label.trim(), s.value.trim()] as [string, string]);
    const cleanedOptions = options
      .filter((o) => o.label.trim())
      .map((o) => ({
        label: o.label.trim(),
        values: o.values
          .filter((v) => v.value.trim())
          .map((v) => ({
            value: v.value.trim(),
            ...(v.priceDelta.trim()
              ? { priceDeltaMinor: toMinorUnits(parseFloat(v.priceDelta)) }
              : {}),
          })),
      }));

    return {
      slug: slug.trim(),
      name: name.trim(),
      description: description.trim(),
      category,
      unitPriceMinor: toMinorUnits(parseFloat(priceRs)),
      images: cleanedImages,
      badge: badge.trim() || undefined,
      specs: cleanedSpecs,
      options: cleanedOptions.length ? cleanedOptions : undefined,
      available,
      sortOrder: Number(sortOrder),
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    if (!name.trim()) {
      setError("Product name is required.");
      setBusy(false);
      return;
    }
    if (!category) {
      setError("Select a category.");
      setBusy(false);
      return;
    }
    if (!cleanedImageCount()) {
      setError("Add at least one product image.");
      setBusy(false);
      return;
    }

    const endpoint = editing ? `/api/admin/products/${product!.id}` : "/api/admin/products";
    try {
      const res = await fetch(endpoint, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(data.error ?? "Could not save the product.");
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  function cleanedImageCount() {
    return images.map((i) => i.trim()).filter(Boolean).length;
  }

  return (
    <form className="admin-form admin-card" onSubmit={onSubmit} noValidate>
      <div className="admin-form__grid">
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="name">Name</label>
          <input
            id="name"
            className="admin-form__input"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
        </div>
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="slug">Slug</label>
          <input
            id="slug"
            className="admin-form__input"
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
          />
          <p className="admin-form__hint">URL identifier, e.g. ballpoint-pen.</p>
        </div>

        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="category">Category</label>
          <select
            id="category"
            className="admin-form__select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="price">Price (Rs.)</label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            className="admin-form__input"
            value={priceRs}
            onChange={(e) => setPriceRs(e.target.value)}
            placeholder="0.00"
            required
          />
          <p className="admin-form__hint">
            {priceRs && !Number.isNaN(parseFloat(priceRs))
              ? formatPriceMinor(toMinorUnits(parseFloat(priceRs)))
              : "Base price for this product."}
          </p>
        </div>

        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="badge">Badge</label>
          <input
            id="badge"
            className="admin-form__input"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="In Stock"
          />
        </div>
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="sortOrder">Display order</label>
          <input
            id="sortOrder"
            type="number"
            min="0"
            className="admin-form__input"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
          <p className="admin-form__hint">Lower numbers show first.</p>
        </div>

        <div className="admin-form__field admin-form__field--full">
          <label className="admin-form__label" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="admin-form__textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="admin-form__field admin-form__field--full">
          <label className="admin-form__check">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />
            Available on the site
          </label>
        </div>
      </div>

      <hr className="admin-sep" />

      <div className="admin-form__field admin-form__field--full">
        <span className="admin-form__label">Images</span>
        <p className="admin-form__hint">
          The first image is the main/cover image. Upload from your computer or
          paste an image URL, then reorder with the arrows.
        </p>

        {images.length === 0 && (
          <p className="admin-form__hint" style={{ color: "#c0392b" }}>
            No images yet — add at least one.
          </p>
        )}

        {images.map((img, i) => (
          <div key={i} className="admin-option-card">
            <div className="admin-option-card__row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" width={48} height={48} style={{ borderRadius: 8, objectFit: "cover" }} />
              <input
                className="admin-mini-input"
                value={img}
                onChange={(e) => setImage(i, e.target.value)}
                placeholder="https://…"
                aria-label={`Image ${i + 1} URL`}
              />
              <div className="admin-table__row-actions">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => moveImage(i, -1)} aria-label="Move up">
                  ↑
                </button>
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => moveImage(i, 1)} aria-label="Move down">
                  ↓
                </button>
                <button type="button" className="admin-btn admin-btn--danger" onClick={() => removeImage(i)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="admin-option-card__row">
          <input
            className="admin-mini-input"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="Paste an image URL and press Add"
          />
          <button type="button" className="admin-btn" onClick={addImage} disabled={!newImage.trim()}>
            Add
          </button>
        </div>

        <div className="admin-option-card__row">
          <input
            ref={fileInputRef}
            className="admin-mini-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={onUpload}
            disabled={uploading}
            aria-label="Upload an image from your computer"
          />
          <button
            type="button"
            className="admin-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Upload from computer"}
          </button>
        </div>
        {uploadError ? (
          <p className="admin-form__hint" style={{ color: "#c0392b" }}>
            {uploadError}
          </p>
        ) : null}
      </div>

      <hr className="admin-sep" />

      <div className="admin-form__field admin-form__field--full">
        <span className="admin-form__label">Specifications</span>
        <p className="admin-form__hint">Optional label/value rows shown on the product page.</p>

        {specs.map((s) => (
          <div key={s.id} className="admin-option-card">
            <div className="admin-option-card__row">
              <input
                className="admin-mini-input"
                value={s.label}
                onChange={(e) => changeSpec(s.id, "label", e.target.value)}
                placeholder="Label (e.g. Type)"
              />
              <input
                className="admin-mini-input"
                value={s.value}
                onChange={(e) => changeSpec(s.id, "value", e.target.value)}
                placeholder="Value (e.g. Ballpoint)"
              />
              <button type="button" className="admin-btn admin-btn--danger" onClick={() => removeSpec(s.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}

        <div>
          <button type="button" className="admin-btn" onClick={() => setSpecs((p) => [...p, { id: uid("spec"), label: "", value: "" }])}>
            Add specification
          </button>
        </div>
      </div>

      <hr className="admin-sep" />

      <div className="admin-form__field admin-form__field--full">
        <span className="admin-form__label">Options &amp; variants</span>
        <p className="admin-form__hint">
          Optional. Add option groups (e.g. Colour, Pack) and values. A value can
          add to the price for variant-specific pricing — leave blank for no
          extra charge.
        </p>

        {options.map((option) => (
          <div key={option.id} className="admin-option-card">
            <div className="admin-option-card__row">
              <input
                className="admin-mini-input"
                value={option.label}
                onChange={(e) => setOptionLabel(option.id, e.target.value)}
                placeholder="Option name (e.g. Pack)"
              />
              <button type="button" className="admin-btn admin-btn--danger" onClick={() => removeOption(option.id)}>
                Remove option
              </button>
            </div>

            {option.values.map((v, vi) => (
              <div key={v.id} className="admin-option-card__row">
                <input
                  className="admin-mini-input"
                  value={v.value}
                  onChange={(e) => changeOptionValue(option.id, v.id, "value", e.target.value)}
                  placeholder={`Value ${vi + 1}`}
                />
                <input
                  className="admin-mini-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={v.priceDelta}
                  onChange={(e) => changeOptionValue(option.id, v.id, "priceDelta", e.target.value)}
                  placeholder="Extra Rs. (e.g. 100)"
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={() => removeOptionValue(option.id, v.id)}
                  aria-label="Remove value"
                >
                  ×
                </button>
              </div>
            ))}

            <div>
              <button type="button" className="admin-btn" onClick={() => addOptionValue(option.id)}>
                Add value
              </button>
            </div>
          </div>
        ))}

        <div>
          <button type="button" className="admin-btn" onClick={addOption}>
            Add option group
          </button>
        </div>
      </div>

      {error && <div className="admin-notice admin-notice--error">{error}</div>}

      <div className="admin-form__actions">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
          {busy ? "Saving…" : editing ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          className="admin-btn"
          onClick={() => router.back()}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
