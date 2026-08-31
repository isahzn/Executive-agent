export type NavItem = {
  href: string;
  label: string;
  /** Set when the section is planned but not yet built. */
  soon?: boolean;
};

export const NAV_SECTIONS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard" },
      { href: "/history", label: "Calculation History" },
    ],
  },
  {
    label: "Tax",
    items: [
      { href: "/tax/individual", label: "Individual Income Tax" },
      { href: "/tax/business", label: "Business Tax" },
      { href: "/tax/vat", label: "VAT" },
      { href: "/tax/withholding", label: "Withholding Tax" },
    ],
  },
  {
    label: "Workflow",
    items: [
      { href: "/documents", label: "Documents", soon: true },
      { href: "/compliance", label: "Compliance", soon: true },
      { href: "/ai-assistant", label: "Tax Assistant", soon: true },
    ],
  },
];
