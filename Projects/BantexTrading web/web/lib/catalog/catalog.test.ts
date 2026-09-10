import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import * as validate from "./validate";
import * as types from "./types";

// The store resolves its data file from CATALOG_DATA_FILE at module load, so we
// point it at a throwaway temp file before importing store (below). Real data is
// never read or mutated.
const dir = mkdtempSync(path.join(tmpdir(), "bantex-catalog-"));
let store: typeof import("./store");

beforeAll(async () => {
  process.env.CATALOG_DATA_FILE = path.join(dir, "catalog.json");
  store = await import("./store");
});

afterAll(() => {
  delete process.env.CATALOG_DATA_FILE;
  rmSync(dir, { recursive: true, force: true });
});

// Reset to the seed catalogue before each test by removing the data file; the
// store reseeds from lib/catalog/seed.ts on its next read.
beforeEach(() => {
  rmSync(path.join(dir, "catalog.json"), { force: true });
});

function validProduct(overrides: Record<string, unknown> = {}) {
  return {
    slug: "test-product",
    name: "Test Product",
    description: "A product for tests.",
    category: "stationery",
    unitPriceMinor: 5000,
    images: ["https://images.unsplash.com/photo-1"],
    badge: "In Stock",
    specs: [["Type", "Pen"]],
    options: [],
    available: true,
    sortOrder: 0,
    ...overrides,
  };
}

describe("catalog data layer", () => {
  describe("validation", () => {
    it("accepts a fully-valid product", () => {
      expect(() =>
        validate.validateProductInput(validProduct() as never, store.getCatalog())
      ).not.toThrow();
    });

    it("rejects a duplicate slug", () => {
      expect(() =>
        validate.validateProductInput({ ...validProduct({ slug: "pen" }) } as never, store.getCatalog())
      ).toThrow(validate.CatalogValidationError);
    });

    it("rejects an unknown category", () => {
      expect(() =>
        validate.validateProductInput(
          { ...validProduct({ category: "nope" }) } as never,
          store.getCatalog()
        )
      ).toThrow(/category/i);
    });

    it("rejects a product with no images", () => {
      expect(() =>
        validate.validateProductInput({ ...validProduct({ images: [] }) } as never, store.getCatalog())
      ).toThrow(/image/i);
    });

    it("rejects a product with an empty name", () => {
      expect(() =>
        validate.validateProductInput({ ...validProduct({ name: "  " }) } as never, store.getCatalog())
      ).toThrow(/name/i);
    });

    it("rejects duplicate option labels and values", () => {
      expect(() =>
        validate.validateProductInput(
          {
            ...validProduct({
              options: [
                { label: "Pack", values: [{ value: "Single" }, { value: "Pack" }] },
                { label: "pack", values: [{ value: "Other" }] },
              ],
            }),
          } as never,
          store.getCatalog()
        )
      ).toThrow(/more than once/);
    });

    it("rejects a category with a duplicate name", () => {
      expect(() =>
        validate.validateCategoryInput(
          { name: "stationery", slug: "stationery-2" } as never,
          store.getCatalog()
        )
      ).toThrow(/already exists/);
    });
  });

  describe("priceForVariant", () => {
    const base = { unitPriceMinor: 10000, options: [] };
    const withOptions = {
      unitPriceMinor: 10000,
      options: [{ label: "Pack", values: [{ value: "Single" }, { value: "Pack", priceDeltaMinor: 54000 }] }],
    };

    it("returns the base price when there are no options", () => {
      expect(types.priceForVariant(base as never, [])).toBe(10000);
    });

    it("adds the per-option delta for a selected variant", () => {
      expect(types.priceForVariant(withOptions as never, [{ label: "Pack", value: "Pack" }])).toBe(64000);
    });

    it("returns the base price when a selection has no delta", () => {
      expect(types.priceForVariant(withOptions as never, [{ label: "Pack", value: "Single" }])).toBe(10000);
    });

    it("builds a deterministic option key", () => {
      expect(types.optionKey([{ label: "Pack", value: "Single" }])).toBe(
        types.optionKey([{ label: "Pack", value: "Single" }])
      );
    });
  });

  describe("store: product CRUD", () => {
    it("creates, reads, updates and deletes a product", () => {
      const product = store.createProduct(validProduct() as never);
      expect(product.id).toBeTruthy();
      expect(product.categoryLabel).toBe("Stationery");
      expect(product.price).toBe("Rs. 50");

      expect(store.productById(product.id)?.name).toBe("Test Product");
      expect(store.productBySlug("test-product")?.id).toBe(product.id);

      const updated = store.updateProduct(product.id, {
        ...validProduct({ name: "Renamed", unitPriceMinor: 9000 }),
      } as never);
      expect(updated.name).toBe("Renamed");
      expect(updated.price).toBe("Rs. 90");

      store.deleteProduct(product.id);
      expect(store.productById(product.id)).toBeUndefined();
    });

    it("persists to disk so a fresh read sees the change", () => {
      const product = store.createProduct(validProduct({ slug: "persist-me" }) as never);
      const reloaded = store.getCatalog().products.find((p) => p.id === product.id);
      expect(reloaded?.slug).toBe("persist-me");
    });
  });

  describe("store: category CRUD and delete protection", () => {
    it("creates and deletes an empty category", () => {
      const cat = store.createCategory({ name: "Furniture", slug: "furniture" } as never);
      expect(cat.slug).toBe("furniture");

      expect(() => store.deleteCategory(cat.id)).not.toThrow();
      expect(store.getCatalog().categories.find((c) => c.id === cat.id)).toBeUndefined();
    });

    it("refuses to delete a category that still has products", () => {
      const cat = store.createCategory({ name: "Gadgets", slug: "gadgets" } as never);
      store.createProduct(validProduct({ slug: "gadget", category: "gadgets" }) as never);

      expect(() => store.deleteCategory(cat.id)).toThrow(/still has/);
    });

    it("reassigns products when a replacement category is supplied", () => {
      const cat = store.createCategory({ name: "Gadgets", slug: "gadgets" } as never);
      const replacement = store.getCatalog().categories.find((c) => c.slug === "electrical");
      store.createProduct(validProduct({ slug: "gadget", category: "gadgets" }) as never);

      expect(() => store.deleteCategory(cat.id, replacement!.id)).not.toThrow();
      const moved = store.getCatalog().products.find((p) => p.slug === "gadget");
      expect(moved?.category).toBe("electrical");
      expect(moved?.categoryLabel).toBe("Electrical Goods");
    });

    it("updates a category in place", () => {
      const cat = store.createCategory({ name: "Furniture", slug: "furniture" } as never);
      const updated = store.updateCategory(cat.id, { name: "Homeware", slug: "homeware" } as never);
      expect(updated.name).toBe("Homeware");
      expect(updated.slug).toBe("homeware");
    });
  });

  it("seeds with the built-in catalogue on first read", () => {
    const data = store.getCatalog();
    expect(data.categories.map((c) => c.slug)).toContain("stationery");
    expect(data.products.map((p) => p.slug)).toContain("pen");
  });
});
