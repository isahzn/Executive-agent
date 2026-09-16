import { createWorker } from "tesseract.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const DIR = "processed";

async function ocrFile(file: string, worker: any): Promise<string> {
  const imagePath = path.join(DIR, file);

  // Preprocess: upscale 2x for better OCR accuracy
  const preprocessed = await sharp(imagePath)
    .resize(2160, 1606) // 2x upscale
    .sharpen()
    .png()
    .toBuffer();

  const { data } = await worker.recognize(preprocessed);
  return data.text;
}

async function main() {
  const worker = await createWorker("eng");

  const files = fs
    .readdirSync(DIR)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .filter((f) => /^IMG-\d+-WA\d+/i.test(f)); // only unnamed ones

  console.log(`Running OCR on ${files.length} images...\n`);

  for (const file of files) {
    try {
      const text = await ocrFile(file, worker);
      // Compact: strip empty lines, trim each line
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      console.log(`=== ${file} ===`);
      console.log(lines.join(" | "));
      console.log("");
    } catch (err) {
      console.log(`=== ${file} === ERROR: ${(err as Error).message}\n`);
    }
  }

  await worker.terminate();
}

main().catch(console.error);
