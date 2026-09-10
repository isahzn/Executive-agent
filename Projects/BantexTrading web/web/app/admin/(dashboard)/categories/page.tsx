import type { Metadata } from "next";
import CategoryManager from "@/components/admin/CategoryManager";
import { getCategories, getProducts } from "@/lib/catalog/store";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  const categories = getCategories();
  const products = getProducts();

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <h1 className="admin-pagehead__title">Categories</h1>
          <p className="admin-pagehead__sub">
            Organise products into sections. New categories appear at{" "}
            <code>/category/&#123;slug&#125;</code>.
          </p>
        </div>
      </div>

      <CategoryManager categories={categories} products={products} />
    </>
  );
}
