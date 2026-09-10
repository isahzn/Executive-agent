// Single source of truth for confirmed Bantex Trading business facts.
// Only facts confirmed with the owner live here. Never add invented data here.

// Category slugs. Built-in categories are "stationery" and "electrical"; the
// admin dashboard may add more later, so this is a plain string rather than a
// closed union.
export type CategorySlug = string;

// A subcategory is data-driven so the admin system can define any stationery
// / electrical subcategories later. Empty until confirmed — never invent.
export interface Subcategory {
  slug: string;
  name: string;
}

export const site = {
  name: "Bantex Trading (Pvt) Ltd",
  legal: "Bantex Trading (Pvt) Ltd",
  businessType: "Wholesale & Retail",
  lines: ["Stationery", "Electrical Goods"] as const,
  address: {
    street: "49/12, New Moor Street",
    city: "Colombo 12",
    full: "49/12, New Moor Street, Colombo 12",
  },
  phone: [
    { label: "077 740 0401", tel: "tel:+94777400401" },
    { label: "076 986 5898", tel: "tel:+94769865898" },
  ],
  email: "bantexsupplies@gmail.com",
  // Map embed for New Moor Street, Colombo 12
  mapUrl:
    "https://www.google.com/maps?q=49/12+New+Moor+Street+Colombo+12&output=embed",
} as const;

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Stationery", href: "/stationery" },
  { label: "Electrical Goods", href: "/electrical" },
  { label: "Contact", href: "/contact" },
];

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  href: string;
  subcategories: Subcategory[];
}

export const categories: Category[] = [
  {
    slug: "stationery",
    name: "Stationery",
    tagline: "Pens & everyday essentials",
    href: "/stationery",
    subcategories: [],
  },
  {
    slug: "electrical",
    name: "Electrical Goods",
    tagline: "Calculators, chargers & more",
    href: "/electrical",
    subcategories: [],
  },
];

// Route to use when linking a product to its category (Phase 1 has no
// product detail pages yet — those arrive in Phase 4).
export function categoryHref(slug: CategorySlug): string {
  return slug === "electrical" ? "/electrical" : "/stationery";
}

export function categoryName(slug: CategorySlug): string {
  return categories.find((c) => c.slug === slug)?.name ?? "Bantex Trading";
}

export function categoryBySlug(slug: CategorySlug): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

// JSON-LD LocalBusiness schema (only confirmed facts; no opening hours).
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: site.name,
    description:
      "Wholesale and retail stationery and electrical goods based in Colombo 12.",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressCountry: "LK",
    },
    telephone: site.phone.map((p) => p.tel.replace("tel:", "+")),
    email: site.email,
  };
}
