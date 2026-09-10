import Image from "next/image";
import Link from "next/link";
import { productHref, type Product } from "@/lib/products";

export default function ProductCard({
  product,
  href = productHref(product),
}: {
  product: Product;
  href?: string;
}) {
  return (
    <Link href={href} className="product-card">
      <div className="product-media">
        <span className="product-badge">{product.badge}</span>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width:720px) 50vw, (max-width:1080px) 34vw, 33vw"
          loading="lazy"
        />
        <button
          type="button"
          className="product-quickadd"
          aria-label={`Quick view ${product.name}`}
          tabIndex={-1}
        >
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      <div className="product-info">
        <div>
          <h4>{product.name}</h4>
          <span className="cat">{product.categoryLabel}</span>
        </div>
        <span className="product-price">{product.price}</span>
      </div>
    </Link>
  );
}
