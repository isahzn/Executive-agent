import { createWorker } from "tesseract.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const DIR = "processed";
const OUT_FILE = "ocr-results.txt";

async function main() {
  const worker = await createWorker("eng");
  const files = fs
    .readdirSync(DIR)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .filter((f) => /^IMG-\d+-WA\d+/i.test(f))
    .sort();

  let out = `OCR results for ${files.length} images\n\n`;

  for (const file of files) {
    try {
      const imagePath = path.join(DIR, file);
      const buf = await sharp(imagePath)
        .resize(2160, 1606)
        .sharpen()
        .png()
        .toBuffer();
      const { data } = await worker.recognize(buf);
      const lines = data.text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      out += `=== ${file} ===\n${lines.join(" | ")}\n\n`;
      fs.writeFileSync(OUT_FILE, out);
      console.log(`done: ${file}`);
    } catch (err) {
      out += `=== ${file} === ERROR: ${(err as Error).message}\n\n`;
      fs.writeFileSync(OUT_FILE, out);
      console.log(`error: ${file}`);
    }
  }

  await worker.terminate();
  console.log(`\nSaved results to ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
