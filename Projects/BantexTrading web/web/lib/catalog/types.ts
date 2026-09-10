// Managed catalog data model — the single source of truth for products and
// categories shown on the public site and edited in the admin dashboard.
//
// Products, categories, options and variant pricing all live in one normalized
// record set. There is deliberately no separate "admin product" vs "frontend
// product": the store below is authoritative, and lib/products.ts re-exports
// read helpers over it.

// A single selectable option value. `priceDeltaMinor` is an optional per-value
// price adjustment in minor units (e.g. "Pack of 10" costs an extra Rs. 100),
// so a product can carry variant-specific pricing without forcing every value
// to define one.
export interface OptionValue {
  value: string;
  priceDeltaMinor?: number;
}

// A configurable option group (Colour, Size, Model, Pack, …). The set is fully
// data-driven per product — never hard-coded to one option type.
export interface ProductOption {
  label: string;
  values: OptionValue[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  // Category slug ("stationery", "electrical", or a later-added slug).
  category: string;
  // Denormalized category display name, kept so client components can render
  // the label without a category lookup. Re-derived on every save.
  categoryLabel: string;
  // Authoritative base price in the store's smallest currency unit (LKR cents).
  // The server reads this to recompute totals at checkout — never the browser.
  unitPriceMinor: number;
  // Display string ("Rs. 60") kept for compatibility with existing components;
  // derived from unitPriceMinor on save.
  price: string;
  // Ordered image list; images[0] is the main/cover image.
  images: string[];
  // Short availability label shown on cards (e.g. "In Stock").
  badge: string;
  // Key/value spec rows shown on the product detail page.
  specs: [string, string][];
  options?: ProductOption[];
  available: boolean;
  sortOrder: number;
  // Seed/demo marker. Seed products exist for the Phase 1 home page and are
  // excluded from catalogue listings until replaced with real inventory; they
  // are editable/deletable via the admin dashboard.
  isSeedDemo?: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  available: boolean;
  sortOrder: number;
  // Built-in categories ("stationery", "electrical") map to fixed public routes
  // (/stationery, /electrical). Later-added categories render through the
  // generic /category/[slug] route instead.
  isBuiltIn?: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CatalogData {
  products: Product[];
  categories: CatalogCategory[];
}

// Canonical, deterministic key for a set of option selections, matching the
// cart's variantKey. Used for price lookups.
export function optionKey(options: { label: string; value: string }[]): string {
  return options.map((o) => `${o.label}=${o.value}`).join("|");
}

// Effective price for a set of selected options: base price plus the sum of any
// per-option value price deltas. Falls back to the base price when the product
// has no option pricing. Pure (no Node deps) so it is safe in client components.
export function priceForVariant(
  product: Pick<Product, "unitPriceMinor" | "options">,
  selections: { label: string; value: string }[]
): number {
  if (!product.options || product.options.length === 0) {
    return product.unitPriceMinor;
  }
  const byLabel = new Map(product.options.map((o) => [o.label, o]));
  let price = product.unitPriceMinor;
  for (const sel of selections) {
    const group = byLabel.get(sel.label);
    const value = group?.values.find((v) => v.value === sel.value);
    if (value?.priceDeltaMinor) {
      price += value.priceDeltaMinor;
    }
  }
  return price;
}
