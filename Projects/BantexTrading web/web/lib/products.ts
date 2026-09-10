// Read-layer over the authoritative catalog store (lib/catalog/store.ts).
// Keeps the Product type and the helpers used across Phases 1–6 (productBySlug,
// productById, catalogueProducts, productHref) while sourcing live data from the
// managed catalog, so admin edits appear on the public site.
import {
  categoryBySlug as categoryBySlugStore,
  getCategories,
  getProducts,
  productById as productByIdStore,
  productBySlug as productBySlugStore,
} from "./catalog/store";
import type { CatalogCategory, Product } from "./catalog/types";

export type { CatalogCategory, OptionValue, Product, ProductOption } from "./catalog/types";

// Built-in categories map to fixed public routes (/stationery, /electrical).
// Any other enabled category renders through the generic /category/[slug] route.
const BUILT_IN = new Set(["stationery", "electrical"]);

// Public URL for a category by slug. Used to build product breadcrumbs / links.
export function categoryHref(slug: string): string {
  return BUILT_IN.has(slug) ? `/${slug}` : `/category/${slug}`;
}

// Public URL for a product's own detail page, based on its category.
export function productHref(product: Product): string {
  return `${categoryHref(product.category)}/${product.slug}`;
}

// All products as stored (ordered by sortOrder). Home page + admin use this.
export function allProducts(): Product[] {
  return getProducts();
}

export function productBySlug(slug: string): Product | undefined {
  return productBySlugStore(slug);
}

export function productById(id: string): Product | undefined {
  return productByIdStore(id);
}

export function categoryBySlug(slug: string): CatalogCategory | undefined {
  return categoryBySlugStore(slug);
}

export function allCategories(): CatalogCategory[] {
  return getCategories();
}

// Catalogue listings show real, available inventory only. Seed demo products are
// excluded — they exist for the Phase 1 home page and must not appear as
// catalogue stock until replaced by real Bantex products via the admin system.
export function catalogueProducts(slug: string): Product[] {
  return getProducts()
    .filter((p) => p.category === slug && p.available && !p.isSeedDemo)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
