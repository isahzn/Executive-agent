"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { priceForVariant } from "@/lib/catalog/types";
import { formatPriceMinor } from "@/lib/money";
import type { Product } from "@/lib/products";
import ProductOptions from "./ProductOptions";
import QuantitySelector from "./QuantitySelector";

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const options = product.options ?? [];
  const gallery = product.images;

  const [active, setActive] = useState(0);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [attempted, setAttempted] = useState(false);
  const [added, setAdded] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const missing = options.filter((group) => !selection[group.label]).map((g) => g.label);

  const allSelected = options.every((group) => selection[group.label]);
  const selectedOptions = options.map((group) => ({
    label: group.label,
    value: selection[group.label],
  }));
  const shownPrice = allSelected
    ? formatPriceMinor(priceForVariant(product, selectedOptions))
    : product.price;

  const buildSelection = () => selectedOptions.filter((s) => s.value);

  const cartItemBuilder = () => ({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    categoryLabel: product.categoryLabel,
    image: product.images[0],
    unitPriceMinor: priceForVariant(product, buildSelection()),
    price: shownPrice,
    options: buildSelection(),
    quantity,
  });

  // Add to Cart: add the configured item and confirm.
  const handleAdd = () => {
    if (!allSelected) {
      setAttempted(true);
      setAdded(false);
      optionsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addItem(cartItemBuilder());
    setAttempted(false);
    setAdded(true);
  };

  // Order Now: add the item then go straight to checkout (Phase 6).
  const handleOrderNow = () => {
    if (!allSelected) {
      setAttempted(true);
      setAdded(false);
      optionsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addItem(cartItemBuilder());
    router.push("/checkout");
  };

  const selectOption = (label: string, value: string) =>
    setSelection((s) => ({ ...s, [label]: value }));

  return (
    <div className="pdp-grid">
      <div className="pdp-gallery">
        <div className="pdp-gallery-main">
          <Image
            src={gallery[active]}
            alt={product.name}
            fill
            sizes="(max-width:1080px) 100vw, 50vw"
            priority
          />
        </div>
        {gallery.length > 1 ? (
          <div className="pdp-thumbs">
            {gallery.map((src, i) => (
              <button
                key={i}
                type="button"
                className={`pdp-thumb${i === active ? " active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width:720px) 33vw, 80px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="pdp-info">
        <span className="pdp-cat">{product.categoryLabel}</span>
        <h1 className="pdp-title">{product.name}</h1>
        <div className="pdp-price">{shownPrice}</div>
        <p className="pdp-desc">{product.description}</p>

        <div ref={optionsRef} className="pdp-options-wrap">
          <ProductOptions
            options={options}
            selection={selection}
            onSelect={selectOption}
            attempted={attempted}
            missing={missing}
          />
        </div>

        <div className="pdp-actions">
          <QuantitySelector value={quantity} onChange={setQuantity} />
        </div>

        {/* Status line. Always occupy one text row so showing/clearing a message
            never shifts the page — on a phone a ~35px jump after the first tap
            moves the buttons out from under the user's finger and taps land on
            the wrong element (reads as "buttons stopped working"). */}
        <p
          className={`pdp-msg pdp-msg-slot${
            attempted && missing.length > 0
              ? " pdp-msg-warn"
              : added
                ? " pdp-msg-ok"
                : ""
          }`}
          aria-live="polite"
        >
          {attempted && missing.length > 0
            ? `Please choose ${missing.join(" and ")} before continuing.`
            : added
              ? "Added to your cart."
              : "\u00A0"}
        </p>

        <div className="pdp-actions">
          <button type="button" className="btn btn-primary" onClick={handleAdd}>
            Add to Cart
          </button>
          <button type="button" className="btn btn-ghost" onClick={handleOrderNow}>
            Order Now
          </button>
        </div>

        {product.specs.length > 0 ? (
          <div className="pdp-info-block">
            <h5>Details</h5>
            <div className="pdp-specs">
              {product.specs.map(([key, value]) => (
                <div key={key} className="pdp-spec-row">
                  <span>{key}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
