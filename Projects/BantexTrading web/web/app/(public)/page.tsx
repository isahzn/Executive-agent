import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import { allProducts } from "@/lib/products";
import { categories } from "@/lib/site";

// Admin edits to the catalog should surface on the public site without a
// rebuild, so revalidate these pages periodically (ISR).
export const revalidate = 60;

export default function HomePage() {
  // Home features the real hardcoded products (web/public/products/ photos).
  // The 3 demo products stay editable/deletable via the admin dashboard but are
  // no longer featured now that real inventory exists.
  const featured = allProducts()
    .filter((p) => !p.isSeedDemo && p.available)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 8);
  const pen = featured[0];

  return (
    <main id="top">
      {/* HERO */}
      <header className="hero wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              Wholesale &amp; retail stationery and electrical goods
            </p>
            <h1>
              Everyday essentials, <em>trusted</em>
              <br />
              and always in stock.
            </h1>
            <p className="lead">
              Bantex Trading (Pvt) Ltd supplies stationery and electrical goods
              for homes, offices, and businesses across Colombo — wholesale and
              retail.
            </p>
            <div className="hero-actions">
              <Link href="/stationery" className="btn btn-primary">
                Shop Stationery
              </Link>
              <Link href="/electrical" className="btn btn-ghost">
                Shop Electrical Goods
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <b>Wholesale</b>
                <span>&amp; Retail</span>
              </div>
              <div className="stat">
                <b>Stationery</b>
                <span>Essentials</span>
              </div>
              <div className="stat">
                <b>Electrical</b>
                <span>Goods</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="badge-dot">
              <span className="pulse" />
              Now in stock
            </div>
            <div className="plate plate-main">
              <Image
                src="https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1200&auto=format&fit=crop"
                alt="Desk arranged with stationery and everyday office essentials"
                fill
                sizes="(max-width:1080px) 100vw, 50vw"
                priority
              />
            </div>
            {pen ? (
              <div className="plate plate-float">
                <div className="plate-float-media">
                  <Image
                    src={pen.images[0]}
                    alt={pen.name}
                    fill
                    sizes="(max-width:1080px) 60vw, 30vw"
                    loading="lazy"
                  />
                </div>
                <div className="plate-float-label">
                  <b>{pen.name}</b>
                  <span>{pen.price}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* FEATURED CATEGORIES */}
      <section id="categories" className="cat-strip">
        <div className="wrap">
          <Reveal className="section-head">
            <h2>Shop by category</h2>
            <p>Stationery and electrical goods, organised the way you need them.</p>
          </Reveal>
          <div className="cat-grid">
            {categories.map((cat) => (
              <Reveal key={cat.slug}>
                <Link href={cat.href} className="cat-card">
                  <Image
                    src={
                      cat.slug === "stationery"
                        ? "https://images.unsplash.com/photo-1585336455983-2c0f38c9de3d?q=80&w=800&auto=format&fit=crop"
                        : "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?q=80&w=800&auto=format&fit=crop"
                    }
                    alt={`${cat.name} — ${cat.tagline}`}
                    fill
                    sizes="(max-width:1080px) 100vw, 50vw"
                    loading="lazy"
                  />
                  <div className="cat-label">
                    <div>
                      <b>{cat.name}</b>
                      <span>{cat.tagline}</span>
                    </div>
                    <span className="cat-arrow">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="products">
        <div className="wrap">
          <Reveal className="section-head">
            <h2>Featured products</h2>
            <p>A few of the everyday items we supply, wholesale and retail.</p>
          </Reveal>
          <div className="product-grid">
            {featured.map((product) => (
              <Reveal key={product.id}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY THIS SHOP */}
      <section id="why" className="why">
        <div className="wrap">
          <Reveal className="section-head">
            <h2>Why businesses order from us</h2>
            <p>The basics, done reliably.</p>
          </Reveal>
          <div className="why-list">
            <Reveal className="why-row">
              <h3>Wholesale &amp; retail</h3>
              <p>
                We supply both individual customers and businesses looking to
                stock up on stationery and electrical goods.
              </p>
              <div className="metric">
                <b>Both</b>
                <span>order types welcome</span>
              </div>
            </Reveal>
            <Reveal className="why-row">
              <h3>Stationery essentials</h3>
              <p>
                Everyday stationery items kept in stock for schools, offices,
                and homes.
              </p>
              <div className="metric">
                <b>Stationery</b>
                <span>always stocked</span>
              </div>
            </Reveal>
            <Reveal className="why-row">
              <h3>Electrical goods</h3>
              <p>
                Practical electrical items for everyday use, from calculators to
                chargers.
              </p>
              <div className="metric">
                <b>Electrical</b>
                <span>goods available</span>
              </div>
            </Reveal>
            <Reveal className="why-row">
              <h3>Based in Colombo</h3>
              <p>
                Located on New Moor Street, Colombo 12 — reach out any time to
                place an order.
              </p>
              <div className="metric">
                <b>Colombo 12</b>
                <span>New Moor Street</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="wrap">
          <Reveal className="tag">Ready when you are</Reveal>
          <Reveal as="h2">Get in touch to place an order.</Reveal>
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
