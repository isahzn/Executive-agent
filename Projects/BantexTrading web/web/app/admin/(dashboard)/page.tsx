import Link from "next/link";
import { getCatalog } from "@/lib/catalog/store";
import { orders } from "@/lib/orders";

export default function AdminOverviewPage() {
  const { products, categories } = getCatalog();
  const available = products.filter((p) => p.available);
  const hidden = products.filter((p) => !p.available);
  const seedDemos = products.filter((p) => p.isSeedDemo);
  const liveCategories = categories.filter((c) => c.available);
  const allOrders = orders.list();
  const newOrders = allOrders.filter((o) => o.orderStatus === "new").length;
  const awaitingPayment = allOrders.filter((o) => o.paymentStatus === "pending").length;

  return (
    <>
      <div className="admin-pagehead">
        <div>
          <h1 className="admin-pagehead__title">Overview</h1>
          <p className="admin-pagehead__sub">
            A snapshot of the catalogue. Changes here are live on the site.
          </p>
        </div>
        <div className="admin-pagehead__actions">
          <Link href="/admin/products" className="admin-btn">
            Products
          </Link>
          <Link href="/admin/products/new" className="admin-btn admin-btn--primary">
            New product
          </Link>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <p className="admin-stat__label">Products</p>
          <p className="admin-stat__value">{products.length}</p>
          <p className="admin-stat__hint">{available.length} live · {hidden.length} hidden</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Categories</p>
          <p className="admin-stat__value">{categories.length}</p>
          <p className="admin-stat__hint">{liveCategories.length} live on the site</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Live products</p>
          <p className="admin-stat__value">{available.length}</p>
          <p className="admin-stat__hint">Visible to customers</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat__label">Demo products</p>
          <p className="admin-stat__value">{seedDemos.length}</p>
          <p className="admin-stat__hint">Shown on the home page</p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <p className="admin-stat__label">Orders</p>
          <p className="admin-stat__value">{allOrders.length}</p>
          <p className="admin-stat__hint">{newOrders} new · {awaitingPayment} awaiting payment</p>
        </div>
      </div>

      <section className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Quick actions</h2>
        </div>
        <div style={{ display: "grid", gap: "0.6rem" }}>
          <Link href="/admin/products/new" className="admin-btn admin-btn--primary">
            Add a product
          </Link>
          <Link href="/admin/categories" className="admin-btn">
            Manage categories
          </Link>
          <Link href="/admin/products" className="admin-btn">
            Review all products
          </Link>
        </div>
      </section>
    </>
  );
}
