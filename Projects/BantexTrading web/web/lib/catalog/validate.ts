// Server-side validation for product & category mutations. Throws
// CatalogValidationError with a user-facing message; the API routes map this to
// a 400 response so malformed data never reaches the store or the public site.
import type { CatalogData, OptionValue } from "./types";

export class CatalogValidationError extends Error {}

export interface ProductInput {
  slug: string;
  name: string;
  description: string;
  category: string;
  unitPriceMinor: number;
  images: string[];
  badge?: string;
  specs?: [string, string][];
  options?: { label: string; values: OptionValue[] }[];
  available: boolean;
  sortOrder: number;
  isSeedDemo?: boolean;
}

export interface CategoryInput {
  slug: string;
  name: string;
  tagline?: string;
  available?: boolean;
  sortOrder?: number;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME = 160;
const MAX_SLUG = 120;
const MAX_DESC = 4000;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function requireString(value: unknown, label: string, max: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new CatalogValidationError(`${label} is required.`);
  }
  if (value.trim().length > max) {
    throw new CatalogValidationError(`${label} is too long.`);
  }
  return value.trim();
}

function requireSlug(value: unknown, label: string): string {
  const slug = requireString(value, label, MAX_SLUG);
  if (!SLUG_RE.test(slug)) {
    throw new CatalogValidationError(
      `${label} may only contain lowercase letters, numbers, and single hyphens.`
    );
  }
  return slug;
}

function requireInt(value: unknown, label: string, min: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min) {
    throw new CatalogValidationError(`${label} must be a valid number.`);
  }
  return value;
}

function validateOptions(
  options: unknown
): { label: string; values: OptionValue[] }[] | undefined {
  if (options === undefined || options === null) return undefined;
  if (!Array.isArray(options)) {
    throw new CatalogValidationError("Options must be a list.");
  }
  const seenLabels = new Set<string>();
  return options.map((group): { label: string; values: OptionValue[] } => {
    if (!group || typeof group !== "object" || Array.isArray(group)) {
      throw new CatalogValidationError("Each option must be an object.");
    }
    const g = group as Record<string, unknown>;
    const label = requireString(g.label, "Option name", 80);
    const labelKey = label.toLowerCase();
    if (seenLabels.has(labelKey)) {
      throw new CatalogValidationError(
        `Option "${label}" is defined more than once.`
      );
    }
    seenLabels.add(labelKey);

    if (!Array.isArray(g.values) || g.values.length === 0) {
      throw new CatalogValidationError(
        `Option "${label}" needs at least one value.`
      );
    }
    const seenValues = new Set<string>();
    const values = (g.values as unknown[]).map((v) => {
      if (!v || typeof v !== "object" || Array.isArray(v)) {
        throw new CatalogValidationError(
          `Option "${label}" has an invalid value.`
        );
      }
      const vo = v as Record<string, unknown>;
      const value = requireString(vo.value, `Option "${label}" value`, 120);
      const valueKey = value.toLowerCase();
      if (seenValues.has(valueKey)) {
        throw new CatalogValidationError(
          `Option "${label}" has a duplicate value.`
        );
      }
      seenValues.add(valueKey);
      let priceDeltaMinor: OptionValue["priceDeltaMinor"];
      if (vo.priceDeltaMinor != null) {
        priceDeltaMinor = requireInt(
          vo.priceDeltaMinor,
          `Price for "${label} – ${value}"`,
          0
        );
      }
      return { value, ...(priceDeltaMinor ? { priceDeltaMinor } : {}) };
    });
    return { label, values };
  });
}

export function validateProductInput(
  input: ProductInput,
  data: CatalogData,
  opts: { excludeId?: string } = {}
): void {
  requireString(input.name, "Product name", MAX_NAME);
  if (input.description.length > MAX_DESC) {
    throw new CatalogValidationError("Description is too long.");
  }
  const slug = requireSlug(input.slug, "Slug");

  const duplicate = data.products.find(
    (p) => p.slug === slug && p.id !== opts.excludeId
  );
  if (duplicate) {
    throw new CatalogValidationError(
      `A product with the slug "${slug}" already exists.`
    );
  }

  if (!input.category) {
    throw new CatalogValidationError("A category is required.");
  }
  if (!data.categories.some((c) => c.slug === input.category)) {
    throw new CatalogValidationError("The selected category is invalid.");
  }

  if (typeof input.unitPriceMinor !== "number" || input.unitPriceMinor < 0) {
    throw new CatalogValidationError("Price must be a valid amount.");
  }

  if (!Array.isArray(input.images) || input.images.length === 0) {
    throw new CatalogValidationError("Add at least one product image.");
  }
  for (const img of input.images) {
    if (typeof img !== "string" || img.trim().length === 0) {
      throw new CatalogValidationError("Every image URL must be a non-empty string.");
    }
    if (img.startsWith("http") && !isHttpUrl(img)) {
      throw new CatalogValidationError("One of the image URLs is invalid.");
    }
  }

  if (typeof input.available !== "boolean") {
    throw new CatalogValidationError("Availability must be set.");
  }
  requireInt(input.sortOrder, "Display order", 0);

  if (input.specs != null) {
    if (!Array.isArray(input.specs)) {
      throw new CatalogValidationError("Specifications must be a list.");
    }
    for (const spec of input.specs) {
      if (!Array.isArray(spec) || spec.length !== 2) {
        throw new CatalogValidationError("Each specification must be a label and value.");
      }
      requireString(spec[0], "Specification label", 80);
      requireString(spec[1], "Specification value", 200);
    }
  }

  validateOptions(input.options);
}

export function validateCategoryInput(
  input: CategoryInput,
  data: CatalogData,
  opts: { excludeId?: string } = {}
): void {
  const name = requireString(input.name, "Category name", MAX_NAME);
  const slug = requireSlug(input.slug, "Slug");

  const dupName = data.categories.find(
    (c) =>
      c.id !== opts.excludeId && c.name.toLowerCase() === name.toLowerCase()
  );
  if (dupName) {
    throw new CatalogValidationError("A category with that name already exists.");
  }

  const dupSlug = data.categories.find(
    (c) => c.slug === slug && c.id !== opts.excludeId
  );
  if (dupSlug) {
    throw new CatalogValidationError(`A category with the slug "${slug}" already exists.`);
  }
}
