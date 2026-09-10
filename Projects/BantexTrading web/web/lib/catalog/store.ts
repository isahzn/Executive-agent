// File-backed catalog store. This is the single authoritative source for the
// products and categories shown on the public site and edited in /admin.
//
// It persists to a JSON file (web/data/catalog.json, gitignored) so changes
// survive a refresh, and is seeded from lib/catalog/seed.ts on first use so
// Phases 1–6 work out of the box. All access goes through a small synchronous
// API — swap the file layer for a real database behind the same interface in a
// later phase without touching callers.
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { formatPriceMinor } from "../money";
import { seedCatalog } from "./seed";
import type {
  CatalogCategory,
  CatalogData,
  OptionValue,
  Product,
} from "./types";
import {
  validateCategoryInput,
  validateProductInput,
  type CategoryInput,
  type ProductInput,
} from "./validate";

const DATA_DIR = path.join(process.cwd(), "data");
// Allow tests (or deployments) to point the store at a different file so they
// never read or mutate the real catalogue. Falls back to data/catalog.json.
const DATA_FILE =
  process.env.CATALOG_DATA_FILE ?? path.join(DATA_DIR, "catalog.json");

// Deduplicate the in-memory banner so we never write partial state after a
// failed mutation, and re-read the file on every access so admin edits in one
// request visible to the next (and to concurrently-running route handlers).
// Return the seed catalogue as a detached copy. Without this, mutators such as
// createCategory push onto the shared module-level seed object, so a reseed
// would carry over products/categories created in a previous run.
function freshSeed(): CatalogData {
  return structuredClone(seedCatalog);
}

function load(): CatalogData {
  try {
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw) as CatalogData;
      if (Array.isArray(parsed.products) && Array.isArray(parsed.categories)) {
        return parsed;
      }
    }
  } catch {
    // Corrupt/missing file — fall through to reseed.
  }
  const seeded = freshSeed();
  persist(seeded);
  return seeded;
}

function persist(data: CatalogData): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function newId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

// --- Public read helpers -----------------------------------------------------

export function getCatalog(): CatalogData {
  return load();
}

export function getProducts(): Product[] {
  return load().products;
}

export function getCategories(): CatalogCategory[] {
  return load().categories;
}

export function productById(id: string): Product | undefined {
  return load().products.find((p) => p.id === id);
}

export function productBySlug(slug: string): Product | undefined {
  return load().products.find((p) => p.slug === slug);
}

export function categoryBySlug(slug: string): CatalogCategory | undefined {
  return load().categories.find((c) => c.slug === slug);
}

export function categoryById(id: string): CatalogCategory | undefined {
  return load().categories.find((c) => c.id === id);
}

// --- Product mutations -------------------------------------------------------

export function createProduct(input: ProductInput): Product {
  const data = load();
  validateProductInput(input, data);
  const now = new Date().toISOString();
  const product: Product = {
    ...toStored(input, data),
    id: newId("prod"),
    createdAt: now,
    updatedAt: now,
  };
  data.products.push(product);
  persist(data);
  return product;
}

export function updateProduct(id: string, input: ProductInput): Product {
  const data = load();
  const existing = data.products.find((p) => p.id === id);
  if (!existing) {
    throw new Error("Product not found.");
  }
  validateProductInput(input, data, { excludeId: id });
  Object.assign(existing, toStored(input, data), { updatedAt: new Date().toISOString() });
  persist(data);
  return existing;
}

export function deleteProduct(id: string): void {
  const data = load();
  const index = data.products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error("Product not found.");
  }
  data.products.splice(index, 1);
  persist(data);
}

// --- Category mutations ------------------------------------------------------

export function createCategory(input: CategoryInput): CatalogCategory {
  const data = load();
  validateCategoryInput(input, data);
  const now = new Date().toISOString();
  const category: CatalogCategory = {
    id: newId("cat"),
    slug: input.slug,
    name: input.name,
    tagline: input.tagline ?? "",
    available: input.available ?? true,
    sortOrder: input.sortOrder ?? data.categories.length,
    createdAt: now,
    updatedAt: now,
  };
  data.categories.push(category);
  persist(data);
  return category;
}

export function updateCategory(
  id: string,
  input: CategoryInput
): CatalogCategory {
  const data = load();
  const existing = data.categories.find((c) => c.id === id);
  if (!existing) {
    throw new Error("Category not found.");
  }
  validateCategoryInput(input, data, { excludeId: id });
  existing.slug = input.slug;
  existing.name = input.name;
  existing.tagline = input.tagline ?? existing.tagline;
  if (typeof input.available === "boolean") {
    existing.available = input.available;
  }
  if (typeof input.sortOrder === "number") {
    existing.sortOrder = input.sortOrder;
  }
  existing.updatedAt = new Date().toISOString();
  persist(data);
  return existing;
}

// Deleting a category that still holds products is refused (delete protection):
// the caller must reassign products first. Pass `replaceWithId` to move those
// products to another category in the same operation.
export function deleteCategory(id: string, replaceWithId?: string): void {
  const data = load();
  const index = data.categories.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error("Category not found.");
  }
  const target = data.categories[index];

  const affected = data.products.filter((p) => p.category === target.slug);
  if (affected.length > 0 && !replaceWithId) {
    throw new Error(
      `This category still has ${affected.length} product${affected.length === 1 ? "" : "s"}. Reassign them before deleting.`
    );
  }

  if (replaceWithId) {
    const replacement = data.categories.find((c) => c.id === replaceWithId);
    if (!replacement) {
      throw new Error("Replacement category not found.");
    }
    for (const p of affected) {
      p.category = replacement.slug;
      p.categoryLabel = replacement.name;
      p.updatedAt = new Date().toISOString();
    }
  }

  data.categories.splice(index, 1);
  persist(data);
}

// --- Internal helpers --------------------------------------------------------

// Normalize a validated ProductInput into a fully-resolved Product (minus the
// runtime-managed id/createdAt/updatedAt fields, which the caller supplies).
function toStored(input: ProductInput, data: CatalogData) {
  const category = data.categories.find((c) => c.slug === input.category);
  const categoryLabel = category?.name ?? input.category;
  const unitPriceMinor = input.unitPriceMinor;
  return {
    slug: input.slug,
    name: input.name,
    description: input.description,
    category: input.category,
    categoryLabel,
    unitPriceMinor,
    price: formatPriceMinor(unitPriceMinor),
    images: input.images,
    badge: input.badge ?? "In Stock",
    specs: input.specs ?? [],
    options: input.options ? normalizeOptions(input.options) : undefined,
    available: input.available,
    sortOrder: input.sortOrder,
    isSeedDemo: input.isSeedDemo ?? false,
  };
}

// Normalize a raw option value list, filling missing price deltas with 0 and
// stripping empty ones so the stored record is consistent.
export function normalizeOptions(
  options: { label: string; values: OptionValue[] }[]
): Product["options"] {
  return options.map((group) => ({
    label: group.label,
    values: group.values.map((v) => ({
      value: v.value,
      ...(typeof v.priceDeltaMinor === "number" && v.priceDeltaMinor !== 0
        ? { priceDeltaMinor: v.priceDeltaMinor }
        : {}),
    })),
  }));
}
