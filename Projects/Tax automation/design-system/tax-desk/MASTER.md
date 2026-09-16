# Tax Desk — Design System (MASTER)

Generated from the ui-ux-pro-max design-intelligence workflow and the
frontend-design distinctiveness pass. Implemented in `app/globals.css`.

## Subject & audience

A deterministic tax calculation tool for Sri Lanka (individual, business, VAT,
withholding). Audience: people who need a correct number they can defend to
the IRD. The design is grounded in the subject's world: official blue, plain
forms, tabular figures — the vernacular of gazettes, bank statements and IRD
e-services, not of marketing sites.

## Rejected directions (AI-design tells)

The previous system used warm cream paper (#f6f5f2), a serif display face with
a gold "seal" accent, ALL-CAPS eyebrow labels, middle-dot meta strings and a
stamped brand mark — a near-exact checklist of current AI-design clichés. The
skill's calibration list flags exactly this cluster. Do not reintroduce:

- Warm cream backgrounds with serif display + gold/clay accents
- ALL-CAPS tracked labels above headings or table headers
- Meta strings joined with middle dots ("A · B · C")
- "Label — fragment" em-dash taglines; "→" appended to links
- One border-radius on every element regardless of hierarchy

## Color

| Token | Hex | Role |
|---|---|---|
| `canvas` | `#f2f4f6` | page background — cool, flat, unremarkable |
| `surface` | `#ffffff` | cards, panels, forms |
| `surface-dim` | `#f7f8fa` | sidebar on mobile? no — recessed areas: table headers, hover fills |
| `ink` | `#1e3a5f` | primary text — deep official blue, not black |
| `ink-soft` | `#46617f` | secondary text |
| `ink-faint` | `#6d8199` | tertiary / muted |
| `line` | `#d8dfe6` | borders, dividers |
| `line-strong` | `#bfcad6` | emphasized rules, hover borders |
| `navy` | `#185a9d` | primary actions, brand, active nav, links |
| `navy-soft` | `#11497f` | hover / pressed |
| `navy-tint` | `#e7eff7` | selected tints, info fills |
| `accent` | `#116149` | money-positive / confirm only |
| `accent-soft` | `#e3f0ea` | positive tint |
| `warn` | `#8a5200` | caution, amounts payable |
| `warn-soft` | `#f7efdf` | warning tint |
| `danger` | `#a92e24` | errors, negative |
| `danger-soft` | `#f8e9e7` | negative tint |

Semantic rules: blue is structure and action; green appears only on
money-positive figures; amber on amounts payable; red on errors. No
decorative color exists in the system.

## Type

Two families, both sans:

- **Headings**: `Lexend` — designed for reading fluency; page titles, card
  titles. Weights 600.
- **Body and figures**: `IBM Plex Sans` — drawn for data at small sizes;
  labels, body, tables, and all money figures (tabular numerals).

Rule: no serif anywhere. Figures are large (text-3xl) but stay in Plex with
`tabular-nums` — precision is the brand, so numbers keep their working clothes.
Labels are sentence case. Line lengths under ~80 characters (max-w-5xl main
column).

## Layout

- Sidebar shell (desktop 240px, white surface with hairline), top tab bar
  (mobile). Content column `max-w-5xl`.
- Dashboard: main column (recent calculations, start here) with a right rail
  (active rule set, verification status) — work on the left, fine print on
  the right.
- History tables: outer hairline + header underline only; totals get a
  double-weight top rule (`border-t-2`), no zebra striping, no fills.

## Components

- **Card**: `rounded-lg` page-level panels, hairline border, single flat
  shadow `0 1px 2px rgba(30,58,95,0.06)`. Header keeps bottom rule.
- **Radius hierarchy**: `rounded-lg` containers → `rounded-md` controls and
  nav items → `rounded-sm` chips. Never one radius for everything.
- **Badge**: `rounded-sm`, tones neutral/positive/negative/warn/info/brand.
  Info is navy tint (no purple).
- **Button primary**: `bg-navy`, `rounded-md`, cursor-pointer.
- **Field/Select**: `rounded-md`, focus border `navy` (matches global focus
  outline).
- **Brand mark**: navy rounded-md square with white Sinhala glyphs බදු
  ("tax") next to the wordmark — the one deliberate flourish; no invented
  logo imagery.
- **Tables**: sentence-case headers in `text-xs font-semibold text-ink-soft`;
  total rows use `border-t-2 border-line-strong font-semibold` with no fill.

## What does NOT change

- Routes, page composition, component props, data flow, calculation logic
- History/upload functionality
- Reduced-motion handling, focus-visible outline, 44px touch targets

## Principle

Official blue, plain sans at every size, rules only where they carry meaning.
The goal is a document you could print and hand to an assessor — not a
dashboard, not a brochure.
