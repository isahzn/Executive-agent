import type { Metadata } from "next";
import AdminProductForm from "@/components/admin/AdminProductForm";
import { getCategories } from "@/lib/catalog/store";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <>
      <div className="admin-pagehead">
        <div>
          <h1 className="admin-pagehead__title">New product</h1>
          <p className="admin-pagehead__sub">
            Add a product to the catalogue. It appears on the site once marked
            live.
          </p>
        </div>
      </div>
      <AdminProductForm categories={getCategories()} />
    </>
  );
}
