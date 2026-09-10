import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import { catalogueProducts, categoryBySlug } from "@/lib/products";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

// Generic catalogue route for any enabled, managed category. Built-in categories
// keep their own /stationery & /electrical routes; this route handles categories
// the owner adds later via the admin dashboard.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  return {
    title: category?.name ?? "Category",
    description: category?.tagline ?? `Browse ${category?.name ?? "this category"}.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category || !category.available) notFound();
  const products = catalogueProducts(slug);

  return (
    <main id="top">
      <header className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <span>{category.name}</span>
          </div>
          <span className="eyebrow">Category</span>
          <h1>{category.name}</h1>
          <p>{category.tagline}</p>
        </div>
      </header>

      <section className="catalogue">
        <div className="wrap">
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">Browse</span>
              <h2>Our {category.name.toLowerCase()} catalogue</h2>
            </div>
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
              <h3>This range is being prepared.</h3>
              <p>
                We supply {category.name.toLowerCase()} wholesale and retail. The
                catalogue will be listed here soon. In the meantime, reach out to
                place an order or ask about a specific item.
              </p>
              <div className="catalogue-empty-actions">
                <Link href="/contact" className="btn btn-primary">
                  Enquire about {category.name.toLowerCase()}
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
