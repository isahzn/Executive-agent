import Link from "next/link";
import ProductList from "@/components/admin/ProductList";
import { getProducts } from "@/lib/catalog/store";

export const metadata = { title: "Products" };

export default function AdminProductsPage() {
  const products = getProducts();

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <h1 className="admin-pagehead__title">Products</h1>
          <p className="admin-pagehead__sub">
            Add, edit, and manage what&apos;s for sale on the site.
          </p>
        </div>
        <div className="admin-pagehead__actions">
          <Link href="/admin/products/new" className="admin-btn admin-btn--primary">
            New product
          </Link>
        </div>
      </div>

      <ProductList products={products} />
    </>
  );
}
