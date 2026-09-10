import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import { catalogueProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Stationery",
  description: "Stationery essentials from Bantex Trading (Pvt) Ltd.",
};

// Reflect admin catalog edits without a rebuild (ISR).
export const revalidate = 60;

export default function StationeryPage() {
  const products = catalogueProducts("stationery");

  return (
    <main id="top">
      <header className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <span>Stationery</span>
          </div>
          <span className="eyebrow">Category</span>
          <h1>Stationery</h1>
          <p>Everyday stationery essentials, wholesale and retail.</p>
        </div>
      </header>

      <section className="catalogue">
        <div className="wrap">
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">Browse</span>
              <h2>Our stationery catalogue</h2>
            </div>
          </Reveal>

          <Reveal>
            <CategoryNav categorySlug="stationery" />
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
              <h3>Our stationery range is being prepared.</h3>
              <p>
                We supply everyday stationery essentials wholesale and retail. The
                full stationery catalogue will be listed here soon. In the meantime,
                reach out to place an order or ask about a specific item.
              </p>
              <div className="catalogue-empty-actions">
                <Link href="/contact" className="btn btn-primary">
                  Enquire about stationery
                </Link>
                <Link href="/electrical" className="btn btn-ghost">
                  Browse electrical goods
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
