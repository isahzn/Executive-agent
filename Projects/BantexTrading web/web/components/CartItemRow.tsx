"use client";

import Image from "next/image";
import Link from "next/link";
import { lineSubtotal, useCart, type CartLine } from "@/lib/cart";
import { formatPriceMinor } from "@/lib/money";
import QuantitySelector from "./QuantitySelector";

export default function CartItemRow({ line }: { line: CartLine }) {
  const { updateQuantity, removeItem } = useCart();
  const href = `/${line.category}/${line.slug}`;

  return (
    <li className="cart-item">
      <Link href={href} className="cart-item-media">
        <Image src={line.image} alt={line.name} fill sizes="(max-width:720px) 120px, 140px" />
      </Link>

      <div className="cart-item-info">
        <Link href={href} className="cart-item-name">
          {line.name}
        </Link>
        {line.options.length > 0 ? (
          <div className="cart-item-options">
            {line.options.map((opt) => (
              <span key={opt.label}>
                {opt.label}: {opt.value}
              </span>
            ))}
          </div>
        ) : null}
        <span className="cart-item-unit">{formatPriceMinor(line.unitPriceMinor)} each</span>
      </div>

      <div className="cart-item-qty">
        <QuantitySelector value={line.quantity} onChange={(q) => updateQuantity(line.key, q)} />
      </div>

      <div className="cart-item-subtotal">{formatPriceMinor(lineSubtotal(line))}</div>

      <button
        type="button"
        className="cart-item-remove"
        onClick={() => removeItem(line.key)}
        aria-label={`Remove ${line.name} from cart`}
      >
        Remove
      </button>
    </li>
  );
}
