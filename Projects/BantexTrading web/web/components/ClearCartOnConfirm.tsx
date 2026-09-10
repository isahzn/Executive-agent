"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart";

// Clears the customer's cart once, but only when it is actually rendered — which
// the success page does only after the server has verified the payment is paid.
// It never clears on the cancelled/failure pages (those never render it), and it
// never clears from a bare navigation to the success URL without a paid session.
export default function ClearCartOnConfirm() {
  const { clear } = useCart();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    clear();
  }, [clear]);

  return null;
}
