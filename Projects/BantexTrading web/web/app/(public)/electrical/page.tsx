import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import { catalogueProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Electrical Goods",
  description: "Electrical goods from Bantex Trading (Pvt) Ltd.",
};

// Reflect admin catalog edits without a rebuild (ISR).
export const revalidate = 60;

export default function ElectricalPage() {
  const products = catalogueProducts("electrical");

  return (
    <main id="top">
      <header className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <span>Electrical Goods</span>
          </div>
          <span className="eyebrow">Category</span>
          <h1>Electrical Goods</h1>
          <p>Practical electrical items, wholesale and retail.</p>
        </div>
      </header>

      <section className="catalogue">
        <div className="wrap">
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">Browse</span>
              <h2>Our electrical catalogue</h2>
            </div>
          </Reveal>

          <Reveal>
            <CategoryNav categorySlug="electrical" />
          </Reveal>

          {products.length > 0 ? (
            <div className="product-grid">
              {products.map((product) => (
                <Reveal key={product.id}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="catalogue-empty">
              <h3>Our electrical range is being prepared.</h3>
              <p>
                We supply practical electrical goods for everyday use, wholesale
                and retail. The full electrical catalogue will be listed here
                soon. In the meantime, reach out to place an order or ask about
                a specific item.
              </p>
              <div className="catalogue-empty-actions">
                <Link href="/contact" className="btn btn-primary">
                  Enquire about electrical goods
                </Link>
                <Link href="/stationery" className="btn btn-ghost">
                  Browse stationery
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="final-cta">
        <div className="wrap">
          <Reveal className="tag">Ready when you are</Reveal>
          <Reveal as="h2">Looking for something specific?</Reveal>
          <Reveal>
            <Link href="/contact" className="btn btn-primary">
              Contact Bantex Trading
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
