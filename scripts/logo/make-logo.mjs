// Generates the portfolio logo set from code (no design app).
//   npm run logo
// The design lives in ./umair-mark.mjs. This script writes:
//   public/logo/        wordmark + icon SVGs and PNGs (dark and light) for socials, CV, GitHub avatar
//   app/                icon.svg, apple-icon.png, favicon.ico (Next.js links these in <head>)
//   components/logo-svg.ts   the wordmark for the nav, recoloured per theme by CSS
// SVGs are rendered with sharp, and favicon.ico is packed by hand (PNG-in-ICO).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";
import { toD } from "./svg-path.mjs";
import { DARK, LIGHT, iconInner, tile, wordmark } from "./umair-mark.mjs";

const ROLE = "SOFTWARE ENGINEER";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = path.join(root, "public/logo");
fs.mkdirSync(out, { recursive: true });

const b = fs.readFileSync(path.join(here, "IBMPlexMono-500.ttf"));
const monoMed = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));

/** Spaced caps → { d, w }. */
function spaced(str, size, tracking) {
  const scale = size / monoMed.unitsPerEm;
  let x = 0;
  const parts = [];
  for (const g of monoMed.stringToGlyphs(str)) {
    parts.push(toD(g.getPath(x, 0, size)));
    x += g.advanceWidth * scale + tracking;
  }
  return { d: parts.join(" "), w: x - tracking };
}

const svgDoc = (vb, w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}">${inner}</svg>\n`;

const iconSvg = (c) => svgDoc("0 0 512 512", 512, 512, tile(c) + iconInner(c));

/** Wordmark on its own (transparent background). */
function wordmarkSvg(c, height = 160) {
  const { inner, box } = wordmark(c);
  const w = Math.round((box.w / box.h) * height);
  return svgDoc(`${box.x} ${box.y} ${box.w} ${box.h}`, w, height, inner);
}

/** Wordmark over the spaced role line, on a background (for socials / CV headers). */
function lockupSvg(c) {
  const { inner, box } = wordmark(c);
  const role = spaced(ROLE, 22, 6);
  const pad = 40;
  const W = Math.ceil(Math.max(box.w, role.w) + pad * 2);
  const H = Math.ceil(box.h + 70 + pad * 2);
  return svgDoc(
    `0 0 ${W} ${H}`,
    W,
    H,
    `<rect width="${W}" height="${H}" fill="${c.bg}"/>` +
      `<g transform="translate(${pad - box.x} ${pad - box.y})">${inner}</g>` +
      `<path transform="translate(${pad} ${pad + box.h + 50})" d="${role.d}" fill="${c.muted}"/>`,
  );
}

const png = (svg, size) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer();

/** Pack PNG buffers into a .ico (PNG entries). */
function ico(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  entries.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt16LE(1, o + 4); // colour planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.data)]);
}

const write = (file, data) => {
  fs.writeFileSync(file, data);
  console.log("  ", path.relative(root, file));
};

// the previous <ut/> set, no longer produced
for (const old of ["mark-compact.svg"]) fs.rmSync(path.join(out, old), { force: true });

const iconDark = iconSvg(DARK);
const iconLight = iconSvg(LIGHT);

// source SVGs
write(path.join(out, "mark.svg"), iconDark);
write(path.join(out, "mark-light.svg"), iconLight);
write(path.join(out, "wordmark.svg"), wordmarkSvg(DARK));
write(path.join(out, "wordmark-light.svg"), wordmarkSvg(LIGHT));
write(path.join(out, "lockup.svg"), lockupSvg(DARK));
write(path.join(out, "lockup-light.svg"), lockupSvg(LIGHT));

// high-res PNGs for socials / CV / GitHub avatar
for (const size of [512, 1024]) {
  write(path.join(out, `mark-${size}.png`), await png(iconDark, size));
  write(path.join(out, `mark-light-${size}.png`), await png(iconLight, size));
}
for (const [name, svg] of [["lockup", lockupSvg(DARK)], ["lockup-light", lockupSvg(LIGHT)]]) {
  write(path.join(out, `${name}@2x.png`), await sharp(Buffer.from(svg), { density: 192 }).png().toBuffer());
}

// Next.js metadata files (auto-linked in <head>)
const app = path.join(root, "app");
write(path.join(app, "icon.svg"), iconDark);
write(path.join(app, "apple-icon.png"), await png(iconDark, 180));
const icoSizes = [16, 32, 48];
write(path.join(app, "favicon.ico"), ico(await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(iconDark, size) })))));

// nav wordmark: colours come from CSS (.brand-logo rules in app/globals.css), so strip the hex fills
const { inner, box } = wordmark(DARK);
const themed = inner.replace(/ (fill|stroke)="#[0-9a-f]{6}"/gi, "");
write(
  path.join(root, "components/logo-svg.ts"),
  `// Generated by scripts/logo/make-logo.mjs (npm run logo). Do not edit by hand.\n` +
    `export const LOGO_VIEWBOX = "${box.x} ${box.y} ${box.w} ${box.h}";\n` +
    `export const LOGO_SVG = ${JSON.stringify(themed)};\n`,
);
