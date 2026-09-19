// Company / university logos → square app-icon style PNGs in public/logos/
//   npm run logos
// Each source is cropped to its symbol, trimmed, and centred on a square tile in the brand's own
// background colour. Tweak a logo by editing its entry below and re-running.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const srcDir = path.join(root, "public/logos_uni_work");
const outDir = path.join(root, "public/logos");
const SIZE = 192; // px — crisp at up to 64px CSS on 3x screens

/**
 * slug    → output file name (public/logos/<slug>.png)
 * src     → file in public/logos_uni_work
 * crop    → region of the source (px) that holds the symbol; omit to use the whole image
 * bg      → tile colour; "auto" samples the crop's top-left pixel
 * pad     → empty space around the symbol, as a fraction of the tile (0.1 = 10% each side)
 * trim    → how different a pixel must be from the background to count as logo (0–255)
 */
const LOGOS = [
  { slug: "navicosoft", src: "navicosoftlogo.jfif", crop: { left: 58, top: 190, width: 69, height: 40 }, bg: "auto", pad: 0.2, trim: 60 },
  { slug: "techjoint", src: "techjoint solutions.png", crop: { left: 190, top: 95, width: 190, height: 190 }, bg: "#ffffff", pad: 0.16, trim: 40 },
  { slug: "vu", src: "vu_logo.png", crop: { left: 6, top: 62, width: 308, height: 162 }, bg: "#2157a1", pad: 0.14, trim: 48 },
  { slug: "superior", src: "superior.png", crop: { left: 110, top: 12, width: 220, height: 215 }, bg: "#ffffff", pad: 0.12, trim: 40 },
];

fs.mkdirSync(outDir, { recursive: true });

const hex = ([r, g, b]) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

async function build({ slug, src, crop, bg, pad, trim }) {
  // flatten transparency onto white, then cut out the symbol region
  let img = sharp(path.join(srcDir, src)).flatten({ background: "#ffffff" });
  if (crop) img = img.extract(crop);
  const cut = await img.png().toBuffer();

  if (bg === "auto") {
    const { data } = await sharp(cut).extract({ left: 1, top: 1, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
    bg = hex([data[0], data[1], data[2]]);
  }

  // trim to the symbol's bounding box, then fit it inside the padded tile
  const symbol = await sharp(cut).trim({ background: bg, threshold: trim }).png().toBuffer();
  const inner = Math.round(SIZE * (1 - pad * 2));
  const fitted = await sharp(symbol).resize(inner, inner, { fit: "contain", background: bg, kernel: "lanczos3" }).png().toBuffer();
  const edge = (SIZE - inner) / 2;
  const tile = await sharp(fitted)
    .extend({ top: Math.floor(edge), bottom: Math.ceil(edge), left: Math.floor(edge), right: Math.ceil(edge), background: bg })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, `${slug}.png`));

  console.log(`   public/logos/${slug}.png  ${tile.width}×${tile.height}  bg ${bg}`);
}

for (const logo of LOGOS) await build(logo);

// the one non-PNG source, converted as-is so every original is a PNG too
await sharp(path.join(srcDir, "navicosoftlogo.jfif")).png().toFile(path.join(srcDir, "navicosoft.png"));
console.log("   public/logos_uni_work/navicosoft.png  (converted from .jfif)");
