"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CategorySlug } from "./site";

// A single selected option (label + chosen value) on a cart line.
export interface OptionSelection {
  label: string;
  value: string;
}

// A cart line. Denormalized enough to render the cart page without re-fetching,
// but the price is ALWAYS re-validated server-side at checkout — never trusted.
export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  category: CategorySlug;
  categoryLabel: string;
  image: string;
  unitPriceMinor: number;
  price: string;
  options: OptionSelection[];
  quantity: number;
}

// Canonical, deterministic option string for a line (order = product definition).
export function variantKey(options: OptionSelection[]): string {
  return options.map((o) => `${o.label}=${o.value}`).join("|");
}

export function lineKey(productId: string, options: OptionSelection[]): string {
  return `${productId}::${variantKey(options)}`;
}

export function lineSubtotal(line: CartLine): number {
  return line.unitPriceMinor * line.quantity;
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + lineSubtotal(line), 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

// --- Storage abstraction (localStorage encapsulated so the UI is decoupled) ---
export interface CartStorage {
  read(): CartLine[];
  write(lines: CartLine[]): void;
}

const STORAGE_KEY = "bantex-cart";

const localStorageStorage: CartStorage = {
  read() {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartLine[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  write(lines) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage can be unavailable (e.g. private mode) — the in-memory copy
      // still drives the UI, it just won't persist.
    }
  },
};

const currentStorage: CartStorage = localStorageStorage;

// Module-level store so useSyncExternalStore can drive the UI reactively.
let lines: CartLine[] = [];
const listeners = new Set<() => void>();
let hydrated = false;

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Server snapshot is always empty, so SSR/no-JS renders a stable empty cart.
// Return the SAME reference every call — a fresh [] here triggers React's
// "getServerSnapshot should be cached" warning (it would otherwise compare
// references and think the snapshot changed each render).
const EMPTY_LINES: CartLine[] = [];
function getServerSnapshot(): CartLine[] {
  return EMPTY_LINES;
}

function getSnapshot(): CartLine[] {
  // Only hydrate once, in the browser, after mount.
  if (!hydrated) {
    hydrated = true;
    lines = currentStorage.read();
  }
  return lines;
}

function commit(next: CartLine[]) {
  lines = next;
  currentStorage.write(next);
  listeners.forEach((listener) => listener());
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  total: number;
  addItem: (line: Omit<CartLine, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const storeLines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((line: Omit<CartLine, "key">) => {
    const key = lineKey(line.productId, line.options);
    const existing = lines.find((l) => l.key === key);
    const next = existing
      ? lines.map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + line.quantity } : l
        )
      : [...lines, { ...line, key }];
    commit(next);
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity < 1) {
      // Reaching zero removes the line rather than keeping a zero-qty item.
      commit(lines.filter((l) => l.key !== key));
      return;
    }
    commit(lines.map((l) => (l.key === key ? { ...l, quantity } : l)));
  }, []);

  const removeItem = useCallback((key: string) => {
    commit(lines.filter((l) => l.key !== key));
  }, []);

  const clear = useCallback(() => {
    commit([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: storeLines,
      count: cartCount(storeLines),
      total: cartTotal(storeLines),
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [storeLines, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
