// Generates the portfolio logo set from code — no design app.
//   npm run logo
// Glyphs (IBM Plex Mono, Fraunces) are converted to vector paths with opentype.js, SVGs are
// rendered with sharp, and favicon.ico is packed by hand (PNG-in-ICO, supported by every current browser).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";
import { toD } from "./svg-path.mjs";

const NAME = "Umair Tufail";
const ROLE = "SOFTWARE ENGINEER";

// palette — mirrors the tokens in app/globals.css
const DARK = { tile: "#0e0f0d", edge: "#2a2d27", ink: "#ecebe4", muted: "#9a9a90", gold: "#d9b26a" };
const LIGHT = { tile: "#ffffff", edge: "#e4e4e7", ink: "#18181b", muted: "#52525b", gold: "#c4973f" };

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = path.join(root, "public/logo");
fs.mkdirSync(out, { recursive: true });

const load = (f) => {
  const b = fs.readFileSync(path.join(here, f));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const serif = load("Fraunces-SemiBold.ttf");
const mono = load("IBMPlexMono-600.ttf");
const monoMed = load("IBMPlexMono-500.ttf");

const r1 = (n) => Math.round(n * 10) / 10;

/** Coloured runs of mono text laid out left to right → { svg, bb } (baseline at y=0). */
function runs(pieces, size) {
  let x = 0;
  let svg = "";
  const all = new opentype.Path();
  for (const [s, fill] of pieces) {
    const p = mono.getPath(s, x, 0, size);
    svg += `<path d="${toD(p)}" fill="${fill}"/>`;
    all.extend(p);
    x += mono.getAdvanceWidth(s, size);
  }
  return { svg, bb: all.getBoundingBox() };
}

/** Text → { d, w }. `tracking` adds px between glyphs (for spaced caps). */
function text(font, str, size, tracking = 0) {
  if (!tracking) return { d: toD(font.getPath(str, 0, 0, size)), w: font.getAdvanceWidth(str, size) };
  const scale = size / font.unitsPerEm;
  let x = 0;
  const parts = [];
  for (const g of font.stringToGlyphs(str)) {
    parts.push(toD(g.getPath(x, 0, size)));
    x += g.advanceWidth * scale + tracking;
  }
  return { d: parts.join(" "), w: x - tracking };
}

function centred(bb, inner, dy = 0) {
  const tx = (512 - (bb.x2 - bb.x1)) / 2 - bb.x1;
  const ty = (512 - (bb.y2 - bb.y1)) / 2 - bb.y1 + dy;
  return `<g transform="translate(${r1(tx)} ${r1(ty)})">${inner}</g>`;
}

const tile = (c, inner) =>
  `<rect x="2" y="2" width="508" height="508" rx="112" fill="${c.tile}" stroke="${c.edge}" stroke-width="4"/>${inner}`;

// full mark: <ut/> — brackets muted, initials ink, slash gold
const fullGlyphs = (c) => {
  const { svg, bb } = runs([["<", c.muted], ["ut", c.ink], ["/", c.gold], [">", c.muted]], 150);
  return centred(bb, svg);
};
// compact mark for tiny sizes: brackets dropped so "ut/" stays legible at 16px
const compactGlyphs = (c) => {
  const { svg, bb } = runs([["ut", c.ink], ["/", c.gold]], 230);
  return centred(bb, svg, 4);
};

const svgDoc = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>\n`;
const markSvg = (c, glyphs = fullGlyphs) => svgDoc(512, 512, tile(c, glyphs(c)));

/** Mark + name over spaced role. */
function lockupSvg(c) {
  const H = 160;
  const name = text(serif, NAME, 70);
  const role = text(monoMed, ROLE, 19, 5.2);
  const x = H + 40;
  const W = Math.ceil(x + Math.max(name.w, role.w) + 8);
  return svgDoc(
    W,
    H,
    `<g transform="scale(${H / 512})">${tile(c, fullGlyphs(c))}</g>` +
      `<path transform="translate(${x} 84)" d="${name.d}" fill="${c.ink}"/>` +
      `<rect x="${x}" y="102" width="28" height="3" rx="1.5" fill="${c.gold}"/>` +
      `<path transform="translate(${x} 132)" d="${role.d}" fill="${c.muted}"/>`,
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

const markDark = markSvg(DARK);
const markLight = markSvg(LIGHT);
const compactDark = markSvg(DARK, compactGlyphs);

// source SVGs
write(path.join(out, "mark.svg"), markDark);
write(path.join(out, "mark-light.svg"), markLight);
write(path.join(out, "mark-compact.svg"), compactDark);
write(path.join(out, "lockup.svg"), lockupSvg(DARK));
write(path.join(out, "lockup-light.svg"), lockupSvg(LIGHT));

// high-res PNGs for socials / CV / GitHub avatar
for (const size of [512, 1024]) {
  write(path.join(out, `mark-${size}.png`), await png(markDark, size));
  write(path.join(out, `mark-light-${size}.png`), await png(markLight, size));
}
for (const [name, svg] of [["lockup", lockupSvg(DARK)], ["lockup-light", lockupSvg(LIGHT)]]) {
  write(path.join(out, `${name}@2x.png`), await sharp(Buffer.from(svg), { density: 192 }).png().toBuffer());
}

// Next.js metadata files (auto-linked in <head>): compact mark in the tab, full mark on home screens
const app = path.join(root, "app");
write(path.join(app, "icon.svg"), compactDark);
write(path.join(app, "apple-icon.png"), await png(markDark, 180));
const icoSizes = [16, 32, 48];
write(path.join(app, "favicon.ico"), ico(await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(compactDark, size) })))));
