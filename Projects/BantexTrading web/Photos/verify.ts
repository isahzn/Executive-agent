import sharp from "sharp";
import fs from "fs";
import path from "path";

const DIR = "processed";

async function main() {
  const files = fs.readdirSync(DIR);
  let ok = 0;
  const bad: string[] = [];

  for (const f of files) {
    const meta = await sharp(path.join(DIR, f)).metadata();
    const dimsOk = meta.width === 1080 && meta.height === 803;
    if (dimsOk) ok++;
    else bad.push(`${f}: ${meta.width}x${meta.height}`);
    console.log(`${dimsOk ? "✅" : "❌"} ${f}: ${meta.width}x${meta.height}`);
  }

  console.log(`\n${ok}/${files.length} files at 1080x803`);
  if (bad.length) console.log("PROBLEMS:\n" + bad.join("\n"));
}

main().catch(console.error);
