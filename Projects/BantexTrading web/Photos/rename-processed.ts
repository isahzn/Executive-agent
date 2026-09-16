import fs from "fs";
import path from "path";

const DIR = "processed";
const LOG_FILE = "rename-log.txt";

// Product names identified via OCR of each image
const NAME_MAP: Record<string, string> = {
  "IMG-20260909-WA0005.jpg": "Snow Spray",
  "IMG-20260909-WA0006.jpg": "A6 Note Book",
  "IMG-20260909-WA0007.jpg": "Puncher",
  "IMG-20260909-WA0008.jpg": "2B Eraser", // Al-Mohandis ED-50 (collides with existing -> auto "-2")
  "IMG-20260909-WA0009.jpg": "No.10 Stapler",
  "IMG-20260909-WA0010.jpg": "Modelling Clay",
  "IMG-20260909-WA0011.jpg": "Liquid Glue",
  "IMG-20260909-WA0012.jpg": "Macaroon Scissors",
  "IMG-20260909-WA0013.jpg": "Animal Sharpners",
  "IMG-20260909-WA0014.jpg": "Hello Kitty Diary",
  "IMG-20260909-WA0015.jpg": "Thermal Cup", // collides with existing -> auto "-2"
  "IMG-20260909-WA0016.jpg": "Hair Grips",
  "IMG-20260909-WA0017.jpg": "Note Book",
  "IMG-20260909-WA0018.jpg": "Display Books",
  "IMG-20260909-WA0019.jpg": "Correction Pen",
  "IMG-20260909-WA0020.jpg": "Black Clips",
  "IMG-20260909-WA0021.jpg": "Green Tape",
  "IMG-20260909-WA0022.jpg": "Water Color",
  "IMG-20260909-WA0023.jpg": "Craft Sticks",
  "IMG-20260909-WA0024.jpg": "Metal Clips",
  "IMG-20260909-WA0025.jpg": "Correction Pen", // duplicate product -> auto "-2"
  "IMG-20260909-WA0026.jpg": "A4 Dividers",
  "IMG-20260909-WA0027.jpg": "Puncher", // duplicate product -> auto "-2"
  "IMG-20260909-WA0028.jpg": "Erasers",
  "IMG-20260909-WA0029.jpg": "Coloured Craft Sticks",
  "IMG-20260909-WA0030.jpg": "Dice",
  "IMG-20260909-WA0031.jpg": "Tape",
  "IMG-20260909-WA0032.jpg": "GXIN Highlighter",
  "IMG-20260909-WA0033.jpg": "Transparent Clips",
  "IMG-20260909-WA0034.jpg": "No.10 Staples",
  "IMG-20260909-WA0035.jpg": "Super Glue",
  "IMG-20260909-WA0036.jpg": "Sticky Notes",
  "IMG-20260909-WA0037.jpg": "CD DVD Marker",
  "IMG-20260909-WA0038.jpg": "Hair Pins",
  "IMG-20260909-WA0039.jpg": "Laminating Film",
  "IMG-20260909-WA0040.jpg": "Blades",
  "IMG-20260909-WA0041.jpg": "Smart Clay",
  "IMG-20260909-WA0042.jpg": "Math Set",
  "IMG-20260909-WA0043.jpg": "Frozen Stickers",
  "IMG-20260909-WA0044.jpg": "Oil Pastels",
};

function sanitize(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, " ") // strip Windows-unsafe chars
    .replace(/\s+/g, " ")
    .trim();
}

function main() {
  const existing = new Set(
    fs.readdirSync(DIR).map((f) => f.toLowerCase())
  );

  const log: string[] = [];
  let renamed = 0;
  let failed = 0;

  for (const [src, productName] of Object.entries(NAME_MAP)) {
    const srcPath = path.join(DIR, src);
    if (!fs.existsSync(srcPath)) {
      log(`SKIP (missing): ${src}`);
      failed++;
      continue;
    }

    const ext = path.extname(src);
    const base = sanitize(productName);

    // Collision-safe unique name
    let candidate = `${base}${ext}`;
    let counter = 2;
    while (existing.has(candidate.toLowerCase())) {
      candidate = `${base} ${counter}${ext}`;
      counter++;
    }

    const destPath = path.join(DIR, candidate);
    try {
      fs.renameSync(srcPath, destPath);
      existing.add(candidate.toLowerCase());
      console.log(`✅ ${src} → ${candidate}`);
      log.push(`${src} → ${candidate}`);
      renamed++;
    } catch (err) {
      console.log(`❌ ${src}: ${(err as Error).message}`);
      failed++;
    }
  }

  fs.writeFileSync(LOG_FILE, log.join("\n") + "\n");
  console.log(`\nRenamed: ${renamed}, Failed: ${failed}`);
  console.log(`Mapping saved to ${LOG_FILE}`);
}

main();
