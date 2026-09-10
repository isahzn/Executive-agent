import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import ProductDetail from "@/components/ProductDetail";
import { allProducts, productBySlug, type Product } from "@/lib/products";

export const revalidate = 60;

function isInCategory(product: Product | undefined, category: string) {
  return product?.category === category && product.available;
}

export function generateStaticParams() {
  return allProducts()
    .filter((p) => p.category === "electrical" && p.available)
    .map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  return {
    title: isInCategory(product, "electrical") ? product!.name : "Electrical Goods",
  };
}

export default async function ElectricalProductPage({ params }: Props) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!isInCategory(product, "electrical")) notFound();

  return (
    <main id="top">
      <div className="pdp">
        <div className="wrap">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link> /{" "}
            <Link href="/electrical">Electrical Goods</Link> /{" "}
            <span>{product!.name}</span>
          </nav>
          <ProductDetail product={product!} />
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
