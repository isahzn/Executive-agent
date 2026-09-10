// Default catalog used to seed the on-disk store on first run.
//
// REAL PRODUCTS — hardcoded from the owner's own product photos
// (web/public/products/, committed to the repo). Every product below was
// reviewed from its photo and the packaging text (OCR), so names, brands and
// pack sizes reflect the actual stock. Descriptions are written from the
// packaging only — no invented capabilities.
//
// PRICES ARE PLACEHOLDERS: the product photos carry no prices and the owner
// has not confirmed any prices yet. Every price below is a temporary
// placeholder to be replaced with confirmed prices (via the admin dashboard
// or a new commit). Same documented exception as the 3 demo products.
//
// The 3 original demo products (pen/calculator/charger) are kept at the end
// and remain replaceable via the admin dashboard.
import type { CatalogData, CatalogCategory, Product } from "./types";

const now = "2026-01-01T00:00:00.000Z";

function seedProduct(
  input: Omit<Product, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  }
): Product {
  return {
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    ...input,
  };
}

function seedCategory(
  input: Omit<CatalogCategory, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  }
): CatalogCategory {
  return {
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    ...input,
  };
}

export const seedCategories: CatalogCategory[] = [
  seedCategory({
    id: "cat-stationery",
    slug: "stationery",
    name: "Stationery",
    tagline: "Everyday essentials for school, home & office",
    available: true,
    sortOrder: 0,
    isBuiltIn: true,
  }),
  seedCategory({
    id: "cat-electrical",
    slug: "electrical",
    name: "Electrical Goods",
    tagline: "Calculators, chargers & more",
    available: true,
    sortOrder: 1,
    isBuiltIn: true,
  }),
];

// Photo path helper. Photos live in web/public/products/ (committed), one file
// per product; duplicate packaging shots become a second gallery image.
const p = (file: string) => `/products/${file}.jpg`;

export const seedProducts: Product[] = [
  // --- Real Bantex products (photos in web/public/products/) ---------------
  seedProduct({
    id: "2b-eraser",
    slug: "2b-eraser",
    name: "2B Eraser",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 6000,
    price: "Rs. 60", // placeholder price
    images: [p("2b-eraser")],
    description:
      "Soft 2B eraser for clean pencil corrections at school and office. Part of the Al-Mohandis ED-50 range supplied as a 30-piece box — ideal for classrooms, exam packs and bulk stationery orders.",
    specs: [
      ["Type", "2B Pencil Eraser"],
      ["Brand", "Al-Mohandis"],
      ["Model", "ED-50"],
      ["Pack", "30 pcs per box"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 0,
  }),
  seedProduct({
    id: "a4-dividers",
    slug: "a4-dividers",
    name: "A4 Dividers",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 35000,
    price: "Rs. 350", // placeholder price
    images: [p("a4-dividers")],
    description:
      "A4 divider set with 31 numbered, colour-coded tabs — a tab for every day of the month. Keeps files, binders and office filing organised at a glance.",
    specs: [
      ["Format", "A4"],
      ["Tabs", "31 numbered tabs"],
      ["Tab Colour", "Colour-coded"],
      ["Type", "Binder dividers"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 1,
  }),
  seedProduct({
    id: "a6-note-book",
    slug: "a6-note-book",
    name: "A6 Note Book",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 20000,
    price: "Rs. 200", // placeholder price
    images: [p("a6-note-book")],
    description:
      "Compact A6 note book built with quality paper and a durable cover for long-lasting performance — an everyday pocket notebook for notes, lists and reminders. Supplied in assorted cover designs.",
    specs: [
      ["Size", "A6"],
      ["Cover", "Durable printed cover"],
      ["Paper", "Quality paper"],
      ["Cover Design", "Assorted"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 2,
  }),
  seedProduct({
    id: "animal-sharpeners",
    slug: "animal-sharpeners",
    name: "Animal Sharpeners",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 15000,
    price: "Rs. 150", // placeholder price
    images: [p("animal-sharpeners")],
    description:
      "Novelty animal pencil sharpeners in a 50-piece display container — a colourful counter-top display for shops and a favourite with younger students.",
    specs: [
      ["Type", "Pencil sharpeners"],
      ["Design", "Animal designs"],
      ["Pack", "50 pcs per display"],
      ["Display Container", "Included"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 3,
  }),
  seedProduct({
    id: "black-clips",
    slug: "black-clips",
    name: "Black Clips",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 12000,
    price: "Rs. 120", // placeholder price
    images: [p("black-clips")],
    description:
      "Black binder clips from DLOffice, supplied in a clear retail container — tidy clips for keeping documents bundled and desks organised.",
    specs: [
      ["Colour", "Black"],
      ["Brand", "DLOffice"],
      ["Container", "Clear retail container"],
      ["Pack", "Retail pack"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 4,
  }),
  seedProduct({
    id: "blades",
    slug: "blades",
    name: "Blades",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 25000,
    price: "Rs. 250", // placeholder price
    images: [p("blades")],
    description:
      "0.5 mm OZS-101 snap-off blades in a 10 × 10 box pack — replacement blades for utility and craft knives, sold as a trade box.",
    specs: [
      ["Model", "OZS-101"],
      ["Thickness", "0.5 mm"],
      ["Pack", "10 pcs × 10 boxes"],
      ["Type", "Snap-off blades"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 5,
  }),
  seedProduct({
    id: "cd-dvd-marker",
    slug: "cd-dvd-marker",
    name: "CD DVD Marker",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 8000,
    price: "Rs. 80", // placeholder price
    images: [p("cd-dvd-marker")],
    description:
      "Cello G-107A marker made for writing on CDs and DVDs. A school-and-home essential for labelling discs cleanly, from the Cello range.",
    specs: [
      ["Use", "CD / DVD disc surfaces"],
      ["Brand", "Cello"],
      ["Model", "G-107A"],
      ["Range", "School and home"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 6,
  }),
  seedProduct({
    id: "coloured-craft-sticks",
    slug: "coloured-craft-sticks",
    name: "Coloured Craft Sticks",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 20000,
    price: "Rs. 200", // placeholder price
    images: [p("coloured-craft-sticks")],
    description:
      "Coloured craft sticks supplied together in a pack — the classic art-and-craft staple for school projects, models and weekend crafts, in a mix of colours.",
    specs: [
      ["Type", "Craft sticks"],
      ["Colour", "Coloured mix"],
      ["Use", "Art & craft"],
      ["Pack", "Supplied as a pack"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 7,
  }),
  seedProduct({
    id: "correction-pen",
    slug: "correction-pen",
    name: "Correction Pen",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 12000,
    price: "Rs. 120", // placeholder price
    images: [p("correction-pen"), p("correction-pen-2")],
    description:
      "7 ml correction pen for small, precise written fixes — a fine tip that reaches tight spots on the page. Also supplied in boxed display packs for shops.",
    specs: [
      ["Capacity", "7 ml"],
      ["Type", "Correction pen"],
      ["Use", "Precise corrections"],
      ["Also supplied as", "Boxed display pack"],
    ],
    badge: "In Stock",
    options: [
      {
        label: "Pack",
        values: [
          { value: "Single" },
          { value: "Boxed Display", priceDeltaMinor: 96000 },
        ],
      },
    ],
    available: true,
    sortOrder: 8,
  }),
  seedProduct({
    id: "craft-sticks",
    slug: "craft-sticks",
    name: "Craft Sticks",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 18000,
    price: "Rs. 180", // placeholder price
    images: [p("craft-sticks")],
    description:
      "Natural-colour craft sticks supplied together in a pack — plain wooden sticks for gluing, building and painting in art and craft work.",
    specs: [
      ["Type", "Craft sticks"],
      ["Colour", "Natural wood"],
      ["Use", "Art & craft"],
      ["Pack", "Supplied as a pack"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 9,
  }),
  seedProduct({
    id: "dice",
    slug: "dice",
    name: "Dice",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 10000,
    price: "Rs. 100", // placeholder price
    images: [p("dice")],
    description:
      "Assorted-colour dice in a clear display container — handy for classroom games, dice-based maths practice and board-game replacements, sold as a counter display.",
    specs: [
      ["Colour", "Assorted colours"],
      ["Display", "Clear display container"],
      ["Use", "Games & classroom activities"],
      ["Pack", "Display pack"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 10,
  }),
  seedProduct({
    id: "display-books",
    slug: "display-books",
    name: "Display Books",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 25000,
    price: "Rs. 250", // placeholder price
    images: [p("display-books")],
    description:
      "Display books with clear covers in a bound format — file and carry documents a pocket at a time, at school, in the office or on site visits. Assorted blue and grey covers.",
    specs: [
      ["Type", "Display book"],
      ["Cover", "Clear cover"],
      ["Format", "Bound format"],
      ["Colours", "Assorted blue & grey"],
    ],
    badge: "In Stock",
    options: [
      {
        label: "Colour",
        values: [{ value: "Blue" }, { value: "Grey" }],
      },
    ],
    available: true,
    sortOrder: 11,
  }),
  seedProduct({
    id: "erasers",
    slug: "erasers",
    name: "Erasers",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 5000,
    price: "Rs. 50", // placeholder price
    images: [p("erasers")],
    description:
      "Smooth, reliable Vneeds erasers designed for clean, effortless corrections without damaging the paper — a 40-piece box for classrooms and office stations.",
    specs: [
      ["Brand", "Vneeds"],
      ["Pack", "40 pcs per box"],
      ["Erasing", "Clean & smooth"],
      ["Suitable for", "School & office"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 12,
  }),
  seedProduct({
    id: "frozen-stickers",
    slug: "frozen-stickers",
    name: "Frozen Stickers",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 8000,
    price: "Rs. 80", // placeholder price
    images: [p("frozen-stickers")],
    description:
      "Frozen character stickers on a printed sheet — a favourite reward and craft sticker for kids' activities, parties and school work.",
    specs: [
      ["Type", "Sticker sheet"],
      ["Artwork", "Frozen characters"],
      ["Use", "Rewards & crafts"],
      ["Format", "Printed sheet"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 13,
  }),
  seedProduct({
    id: "gxin-highlighter",
    slug: "gxin-highlighter",
    name: "GXIN Highlighter",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 12000,
    price: "Rs. 120", // placeholder price
    images: [p("gxin-highlighter")],
    description:
      "Fluorescent GXIN highlighters supplied in a 12-piece pack — bright, vivid ink for marking notes, documents and textbooks. Pick a single colour or stock the full set.",
    specs: [
      ["Brand", "GXIN"],
      ["Type", "Fluorescent highlighter"],
      ["Pack", "12 pcs per pack"],
      ["Ink", "Fluorescent"],
    ],
    badge: "In Stock",
    options: [
      {
        label: "Colour",
        values: [
          { value: "Yellow" },
          { value: "Pink" },
          { value: "Blue" },
          { value: "Green" },
          { value: "Orange" },
        ],
      },
    ],
    available: true,
    sortOrder: 14,
  }),
  seedProduct({
    id: "green-tape",
    slug: "green-tape",
    name: "Green Tape",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 30000,
    price: "Rs. 300", // placeholder price
    images: [p("green-tape")],
    description:
      "Green tape rolls supplied together in a stacked multi-roll pack — practical for packing, labelling and colour-coding around the workplace.",
    specs: [
      ["Colour", "Green"],
      ["Pack", "Multi-roll stacked pack"],
      ["Format", "Rolls"],
      ["Use", "Packing & labelling"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 15,
  }),
  seedProduct({
    id: "hair-grips",
    slug: "hair-grips",
    name: "Hair Grips",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 10000,
    price: "Rs. 100", // placeholder price
    images: [p("hair-grips")],
    description:
      "Black hair grips in a compact boxed pack — a steady seller for general stores and pharmacies alongside the stationery range.",
    specs: [
      ["Colour", "Black"],
      ["Quality", "Best quality"],
      ["Pack", "Boxed pack"],
      ["Type", "Hair grips"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 16,
  }),
  seedProduct({
    id: "hair-pins",
    slug: "hair-pins",
    name: "Hair Pins",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 9000,
    price: "Rs. 90", // placeholder price
    images: [p("hair-pins")],
    description:
      "SUN brand hair pins in a compact retail pack — another counter-top essential that moves alongside general stationery stock.",
    specs: [
      ["Brand", "SUN"],
      ["Pack", "Packed set"],
      ["Format", "Compact retail pack"],
      ["Type", "Hair pins"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 17,
  }),
  seedProduct({
    id: "hello-kitty-diary",
    slug: "hello-kitty-diary",
    name: "Hello Kitty Diary",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 35000,
    price: "Rs. 350", // placeholder price
    images: [p("hello-kitty-diary")],
    description:
      "Hello Kitty diary with a decorative printed character cover — a gift-friendly diary that always catches the eye on a shop shelf.",
    specs: [
      ["Type", "Diary"],
      ["Character", "Hello Kitty"],
      ["Cover", "Decorative printed cover"],
      ["Suitable for", "Kids & gifting"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 18,
  }),
  seedProduct({
    id: "laminating-film",
    slug: "laminating-film",
    name: "Laminating Film",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 35000,
    price: "Rs. 350", // placeholder price
    images: [p("laminating-film")],
    description:
      "Laminating film supplied as a separate pack-size variant — loading film for laminating machines to protect documents, certificates and notices.",
    specs: [
      ["Type", "Laminating film"],
      ["Pack", "Pack-size variant"],
      ["Use", "Document protection"],
      ["Format", "Film"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 19,
  }),
  seedProduct({
    id: "liquid-glue",
    slug: "liquid-glue",
    name: "Liquid Glue",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 10000,
    price: "Rs. 100", // placeholder price
    images: [p("liquid-glue")],
    description:
      "Office Series liquid glue for paper and cardboard — a reliable everyday adhesive for school work, office paperwork and craft projects.",
    specs: [
      ["Brand", "Office Series"],
      ["Type", "Liquid glue"],
      ["Use", "Paper & cardboard"],
      ["Suitable for", "School & office"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 20,
  }),
  seedProduct({
    id: "macaroon-scissors",
    slug: "macaroon-scissors",
    name: "Macaroon Scissors",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 25000,
    price: "Rs. 250", // placeholder price
    images: [p("macaroon-scissors")],
    description:
      "Assorted-colour Macaroon scissors from the Windmill range — small, safe scissors for kids aged 3+, sold singly or as a 24-piece counter display.",
    specs: [
      ["Brand", "Windmill"],
      ["Type", "Kids' scissors"],
      ["Colours", "Assorted"],
      ["Age", "Kids 3+"],
    ],
    badge: "In Stock",
    options: [
      {
        label: "Pack",
        values: [
          { value: "Single" },
          { value: "24-PCS Display", priceDeltaMinor: 455000 },
        ],
      },
    ],
    available: true,
    sortOrder: 21,
  }),
  seedProduct({
    id: "math-set",
    slug: "math-set",
    name: "Math Set",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 25000,
    price: "Rs. 250", // placeholder price
    images: [p("math-set")],
    description:
      "Nine-piece MAP math set with two metal compasses in a boxed set — the full geometry kit for school maths from lower grades through O/Ls.",
    specs: [
      ["Brand", "MAP"],
      ["Pieces", "9-piece set"],
      ["Compasses", "2 metal compasses"],
      ["Pack", "Boxed set"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 22,
  }),
  seedProduct({
    id: "metal-clips",
    slug: "metal-clips",
    name: "Metal Clips",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 14000,
    price: "Rs. 140", // placeholder price
    images: [p("metal-clips")],
    description:
      "DLOffice metal binder clips in a clear retail container — strong everyday clips for bundling papers and keeping files together.",
    specs: [
      ["Brand", "DLOffice"],
      ["Material", "Metal"],
      ["Container", "Clear retail container"],
      ["Pack", "Retail pack"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 23,
  }),
  seedProduct({
    id: "modelling-clay",
    slug: "modelling-clay",
    name: "Modelling Clay",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 25000,
    price: "Rs. 250", // placeholder price
    images: [p("modelling-clay")],
    description:
      "Coloured modelling clay supplied together as a set — multiple colours in one pack for school art rooms, craft hours and rainy-day making.",
    specs: [
      ["Type", "Modelling clay"],
      ["Colours", "Coloured set"],
      ["Pack", "Packed product"],
      ["Suitable for", "Art & craft"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 24,
  }),
  seedProduct({
    id: "no10-stapler",
    slug: "no10-stapler",
    name: "No.10 Stapler",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 35000,
    price: "Rs. 350", // placeholder price
    images: [p("no10-stapler")],
    description:
      "VneedsOFFICE No.10 stapler in a practical boxed pack — the small desk stapler every counter and pencil case ends up needing.",
    specs: [
      ["Brand", "VneedsOFFICE"],
      ["Model", "No.10"],
      ["Pack", "Boxed pack"],
      ["Staples", "No.10 staples"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 25,
  }),
  seedProduct({
    id: "no10-staples",
    slug: "no10-staples",
    name: "No.10 Staples",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 12000,
    price: "Rs. 120", // placeholder price
    images: [p("no10-staples")],
    description:
      "Great Wall No.10 staples in a 10 × 1000-piece box pack — a long-running supply of refills for No.10 staplers.",
    specs: [
      ["Brand", "Great Wall"],
      ["Model", "No.10"],
      ["Pack", "10 × 1000 pcs"],
      ["Type", "Staple refills"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 26,
  }),
  seedProduct({
    id: "note-book",
    slug: "note-book",
    name: "Note Book",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 18000,
    price: "Rs. 180", // placeholder price
    images: [p("note-book")],
    description:
      "Note book with a colourful printed cover design — a cheerful everyday notebook for school notes, journals and lists.",
    specs: [
      ["Type", "Note book"],
      ["Cover", "Colourful printed cover"],
      ["Suitable for", "School & everyday use"],
      ["Format", "Bound"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 27,
  }),
  seedProduct({
    id: "oil-pastels",
    slug: "oil-pastels",
    name: "Oil Pastels",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 25000,
    price: "Rs. 250", // placeholder price
    images: [p("oil-pastels")],
    description:
      "Vneeds oil pastels in a 12-colour boxed set — smooth, blendable pastels for art class, with the non-toxic reassurance parents look for.",
    specs: [
      ["Brand", "Vneeds"],
      ["Colours", "12 colours"],
      ["Pack", "Boxed set"],
      ["Safety", "Non-toxic"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 28,
  }),
  seedProduct({
    id: "puncher",
    slug: "puncher",
    name: "Puncher",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 30000,
    price: "Rs. 300", // placeholder price
    images: [p("puncher"), p("puncher-2")],
    description:
      "Compact, reliable 2-hole puncher from DLOffice for quick, clean and effortless everyday use — comfortable handling with a high sheet capacity.",
    specs: [
      ["Brand", "DLOffice"],
      ["Type", "2-hole puncher"],
      ["Capacity", "High sheet capacity"],
      ["Handling", "Comfortable grip"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 29,
  }),
  seedProduct({
    id: "smart-clay",
    slug: "smart-clay",
    name: "Smart Clay",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 20000,
    price: "Rs. 200", // placeholder price
    images: [p("smart-clay")],
    description:
      "Vneeds Smart Clay for colourful art and craft use — a soft, easy-to-shape clay in a colour pack, ready for school projects and model making.",
    specs: [
      ["Brand", "Vneeds"],
      ["Type", "Smart clay"],
      ["Use", "Art & craft"],
      ["Pack", "Colour pack"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 30,
  }),
  seedProduct({
    id: "snow-spray",
    slug: "snow-spray",
    name: "Snow Spray",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 45000,
    price: "Rs. 450", // placeholder price
    images: [p("snow-spray")],
    description:
      "Easy-to-use snow spray that creates a fun winter atmosphere — perfect for festive decorations and celebrations, with 24 cans in a box.",
    specs: [
      ["Type", "Snow spray"],
      ["Pack", "24 pcs per box"],
      ["Effect", "Festive snow effect"],
      ["Use", "Decorations, parties & events"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 31,
  }),
  seedProduct({
    id: "sticky-notes",
    slug: "sticky-notes",
    name: "Sticky Notes",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 10000,
    price: "Rs. 100", // placeholder price
    images: [p("sticky-notes")],
    description:
      "Colour sticky notes in compact 3 × 3 inch (76 × 76 mm) square pads — the everyday note, flag and reminder pad for desks and offices.",
    specs: [
      ["Size", "3 × 3 in (76 × 76 mm)"],
      ["Type", "Sticky notes"],
      ["Colour", "Coloured pads"],
      ["Format", "Square pads"],
    ],
    badge: "In Stock",
    options: [
      {
        label: "Colour",
        values: [
          { value: "Assorted" },
          { value: "Yellow" },
          { value: "Pink" },
          { value: "Green" },
          { value: "Blue" },
        ],
      },
    ],
    available: true,
    sortOrder: 32,
  }),
  seedProduct({
    id: "super-glue",
    slug: "super-glue",
    name: "Super Glue",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 8000,
    price: "Rs. 80", // placeholder price
    images: [p("super-glue")],
    description:
      "Super glue tubes supplied in a display pack — the strong, fast-bonding repair essential every home, office and tool drawer keeps reaching for.",
    specs: [
      ["Type", "Super glue"],
      ["Pack", "Packed tubes"],
      ["Display", "Display pack"],
      ["Bond", "Strong & fast"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 33,
  }),
  seedProduct({
    id: "tape",
    slug: "tape",
    name: "Tape",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 8000,
    price: "Rs. 80", // placeholder price
    images: [p("tape")],
    description:
      "Bright yellow tape in a compact single roll — a handy roll for labelling, marking and quick fixes around the home or workplace.",
    specs: [
      ["Colour", "Yellow"],
      ["Pack", "Single roll"],
      ["Format", "Roll"],
      ["Note", "Bright colour"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 34,
  }),
  seedProduct({
    id: "thermal-cup",
    slug: "thermal-cup",
    name: "Thermal Cup",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 165000,
    price: "Rs. 1,650", // placeholder price
    images: [p("thermal-cup")],
    description:
      "800 ml double-layer insulated thermal cup in stainless steel (SUS 316) — keeps drinks hot or cold through the workday, with a fashionable finish.",
    specs: [
      ["Capacity", "800 ml"],
      ["Material", "Stainless steel (SUS 316)"],
      ["Insulation", "Double layer"],
      ["Style", "Fashion finish"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 35,
  }),
  seedProduct({
    id: "transparent-clips",
    slug: "transparent-clips",
    name: "Transparent Clips",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 13000,
    price: "Rs. 130", // placeholder price
    images: [p("transparent-clips")],
    description:
      "Colour-transparent clips in an assorted pack — see-through clips that hold papers securely without hiding what's underneath.",
    specs: [
      ["Type", "Transparent clips"],
      ["Colour", "Assorted"],
      ["Pack", "Packed product"],
      ["Feature", "Mixed colours"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 36,
  }),
  seedProduct({
    id: "water-color",
    slug: "water-color",
    name: "Water Color",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 15000,
    price: "Rs. 150", // placeholder price
    images: [p("water-color")],
    description:
      "Vneeds water colours in an eight-colour palette (V0306) — the classic starter paint set for school art lessons and home crafts.",
    specs: [
      ["Brand", "Vneeds"],
      ["Colours", "8 colours"],
      ["Model", "V0306"],
      ["Type", "Water colour palette"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 37,
  }),

  // --- Demo products (documented exception; replaceable via /admin) --------
  seedProduct({
    id: "pen",
    slug: "pen",
    name: "Ballpoint Pen",
    category: "stationery",
    categoryLabel: "Stationery",
    unitPriceMinor: 6000,
    price: "Rs. 60",
    images: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?q=80&w=800&auto=format&fit=crop",
    ],
    description:
      "A smooth-writing ballpoint pen built for daily use — at home, at school, or at the office. Simple, dependable, and always within reach.",
    specs: [
      ["Type", "Ballpoint Pen"],
      ["Category", "Stationery"],
      ["Ink Colour", "Blue / Black"],
      ["Availability", "In Stock"],
    ],
    badge: "In Stock",
    options: [
      { label: "Ink Colour", values: [{ value: "Blue" }, { value: "Black" }] },
      {
        label: "Pack",
        values: [{ value: "Single" }, { value: "Pack of 10", priceDeltaMinor: 54000 }],
      },
    ],
    available: true,
    sortOrder: 100,
    isSeedDemo: true,
  }),
  seedProduct({
    id: "calculator",
    slug: "calculator",
    name: "Calculator",
    category: "electrical",
    categoryLabel: "Electrical Goods",
    unitPriceMinor: 85000,
    price: "Rs. 850",
    images: [
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop",
    ],
    description:
      "A straightforward calculator suited for everyday office, retail, and home use. Clear display, responsive keys, and a compact footprint for any desk.",
    specs: [
      ["Type", "Desktop Calculator"],
      ["Category", "Electrical Goods"],
      ["Power", "Battery / Solar"],
      ["Availability", "In Stock"],
    ],
    badge: "In Stock",
    options: [
      {
        label: "Type",
        values: [
          { value: "Basic" },
          { value: "Scientific", priceDeltaMinor: 30000 },
        ],
      },
    ],
    available: true,
    sortOrder: 101,
    isSeedDemo: true,
  }),
  seedProduct({
    id: "charger",
    slug: "charger",
    name: "Charger",
    category: "electrical",
    categoryLabel: "Electrical Goods",
    unitPriceMinor: 95000,
    price: "Rs. 950",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583863788176-1c8c534d1c53?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591290619762-c05674c1fda9?q=80&w=800&auto=format&fit=crop",
    ],
    description:
      "A practical charger for everyday devices. Compact, reliable, and built for regular use at home or on the go.",
    specs: [
      ["Type", "Charger"],
      ["Category", "Electrical Goods"],
      ["Cable", "Included"],
      ["Availability", "In Stock"],
    ],
    badge: "In Stock",
    available: true,
    sortOrder: 102,
    isSeedDemo: true,
  }),
];

export const seedCatalog: CatalogData = {
  products: seedProducts,
  categories: seedCategories,
};
