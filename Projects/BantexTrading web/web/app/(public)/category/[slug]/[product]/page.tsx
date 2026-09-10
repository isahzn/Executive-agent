import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import ProductDetail from "@/components/ProductDetail";
import { categoryBySlug, productBySlug, type Product } from "@/lib/products";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string; product: string }> };

function resolve(product: Product | undefined, slug: string) {
  return product?.category === slug && product.available;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, product } = await params;
  const p = productBySlug(product);
  return {
    title: resolve(p, slug) ? p!.name : "Category",
  };
}

export default async function CategoryProductPage({ params }: Props) {
  const { slug, product } = await params;
  const category = categoryBySlug(slug);
  const p = productBySlug(product);
  if (!category || !resolve(p, slug)) notFound();

  return (
    <main id="top">
      <div className="pdp">
        <div className="wrap">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link> /{" "}
            <Link href={`/category/${slug}`}>{category.name}</Link> /{" "}
            <span>{p!.name}</span>
          </nav>
          <ProductDetail product={p!} />
        </div>
      </div>

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
