// Coerce an unknown request body into a typed ProductInput / CategoryInput so
// route handlers never pass unvalidated shapes into the store. The store (and
// validate.ts) re-validates everything; these coercions only normalize shapes.
import type { OptionValue } from "./types";
import type { CategoryInput, ProductInput } from "./validate";

export function toProductInput(body: unknown): ProductInput {
  const b = (body ?? {}) as Record<string, unknown>;
  return {
    slug: String(b.slug ?? ""),
    name: String(b.name ?? ""),
    description: String(b.description ?? ""),
    category: String(b.category ?? ""),
    unitPriceMinor: Number(b.unitPriceMinor),
    images: Array.isArray(b.images) ? b.images.map((i) => String(i)) : [],
    badge: b.badge == null ? undefined : String(b.badge),
    specs: Array.isArray(b.specs) ? (b.specs as [string, string][]) : [],
    options: Array.isArray(b.options)
      ? (b.options as { label: string; values: OptionValue[] }[])
      : undefined,
    available: Boolean(b.available),
    sortOrder: Number(b.sortOrder),
    isSeedDemo: b.isSeedDemo == null ? undefined : Boolean(b.isSeedDemo),
  };
}

export function toCategoryInput(body: unknown): CategoryInput {
  const b = (body ?? {}) as Record<string, unknown>;
  return {
    slug: String(b.slug ?? ""),
    name: String(b.name ?? ""),
    tagline: b.tagline == null ? undefined : String(b.tagline),
    available: b.available == null ? undefined : Boolean(b.available),
    sortOrder: b.sortOrder == null ? undefined : Number(b.sortOrder),
  };
}
