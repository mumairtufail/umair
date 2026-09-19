// Generates the portfolio logo set from code (no design app).
//   npm run logo
// The design lives in ./umair-mark.mjs. This script writes:
//   public/logo/dark/   logo.svg + logo.png for DARK backgrounds (light text)
//   public/logo/light/  logo.svg + logo.png for LIGHT backgrounds (dark text)
//                       the wordmark with SOFTWARE ENGINEER spread to span it edge to edge
//   public/logo/umair-logo.zip   both folders, for sharing
//   app/                icon.svg, apple-icon.png, favicon.ico (Next.js links these in <head>)
//   components/logo-svg.ts   the wordmark for the nav, recoloured per theme by CSS
// SVGs are rendered with sharp, and favicon.ico is packed by hand (PNG-in-ICO).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
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

/** Caps laid out with extra space between glyphs → { d, ink } (ink = bounding box of the drawn letters). */
function spaced(str, size, tracking) {
  const scale = size / monoMed.unitsPerEm;
  let x = 0;
  const parts = [];
  const all = new opentype.Path();
  for (const g of monoMed.stringToGlyphs(str)) {
    const p = g.getPath(x, 0, size);
    parts.push(toD(p));
    all.extend(p);
    x += g.advanceWidth * scale + tracking;
  }
  return { d: parts.join(" "), ink: all.getBoundingBox() };
}

/** Same, with the spacing solved so the letters' ink spans exactly `width`. */
function justified(str, size, width) {
  const tight = spaced(str, size, 0);
  const gaps = [...str].length - 1;
  const tracking = (width - (tight.ink.x2 - tight.ink.x1)) / gaps;
  return spaced(str, size, tracking);
}

/** Left/right edges of the wordmark's actual ink (in its own units), measured from a render. */
async function wordmarkInk(c) {
  const { inner, box } = wordmark(c);
  const k = 8; // render scale
  const svg = svgDoc(`${box.x} ${box.y} ${box.w} ${box.h}`, Math.round(box.w * k), Math.round(box.h * k), inner);
  const { info } = await sharp(Buffer.from(svg)).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const left = -info.trimOffsetLeft / k;
  return { x1: box.x + left, x2: box.x + left + info.width / k };
}

const svgDoc = (vb, w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}">${inner}</svg>\n`;

const iconSvg = (c) => svgDoc("0 0 512 512", 512, 512, tile(c) + iconInner(c));

/** Wordmark over SOFTWARE ENGINEER, the role spread to run from the left edge of the u to the right edge of the r. */
async function lockupSvg(c) {
  const { inner, box } = wordmark(c);
  const ink = await wordmarkInk(c);
  const role = justified(ROLE, 22, ink.x2 - ink.x1);
  const pad = 40;
  const W = Math.ceil(box.w + pad * 2);
  const H = Math.ceil(box.h + 70 + pad * 2);
  const roleX = pad + (ink.x1 - box.x) - role.ink.x1; // line the role's ink up with the wordmark's ink
  return svgDoc(
    `0 0 ${W} ${H}`,
    W,
    H,
    `<rect width="${W}" height="${H}" fill="${c.bg}"/>` +
      `<g transform="translate(${pad - box.x} ${pad - box.y})">${inner}</g>` +
      `<path transform="translate(${roleX.toFixed(2)} ${pad + box.h + 50})" d="${role.d}" fill="${c.muted}"/>`,
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

// one logo, two versions: public/logo/{dark,light}/logo.{svg,png}; anything else in public/logo is removed
fs.rmSync(out, { recursive: true, force: true });
for (const [name, c] of [["dark", DARK], ["light", LIGHT]]) {
  const dir = path.join(out, name);
  fs.mkdirSync(dir, { recursive: true });
  const logo = await lockupSvg(c);
  write(path.join(dir, "logo.svg"), logo);
  write(path.join(dir, "logo.png"), await sharp(Buffer.from(logo), { density: 288 }).png().toBuffer());
}
// bsdtar (built into Windows 10+ and macOS) writes a real zip with standard forward-slash paths.
// On Windows call it by full path: Git Bash's GNU tar would otherwise win and write a tar file.
const bsdtar = process.platform === "win32" ? path.join(process.env.SystemRoot ?? "C:\Windows", "System32", "tar.exe") : "tar";
execFileSync(bsdtar, ["-a", "-c", "-f", "umair-logo.zip", "dark", "light"], { cwd: out });
console.log("  ", path.relative(root, path.join(out, "umair-logo.zip")));

const iconDark = iconSvg(DARK);

// Next.js metadata files (auto-linked in <head>)
const app = path.join(root, "app");
write(path.join(app, "icon.svg"), iconDark);
write(path.join(app, "apple-icon.png"), await png(iconDark, 180));
const icoSizes = [16, 32, 48];
write(path.join(app, "favicon.ico"), ico(await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(iconDark, size) })))));

// nav logo: wordmark + SOFTWARE ENGINEER, colours from CSS (.brand-logo rules in app/globals.css), so strip the hex fills.
// The role is set larger than in the downloadable logo so it stays readable at nav size (~9px), still spanning u → r.
const NAV_ROLE_SIZE = 56; // wordmark units (x-height = 100)
const NAV_ROLE_GAP = 44; // space between the wordmark and the role's cap line
const { inner, box } = wordmark(DARK);
const navInk = await wordmarkInk(DARK);
const navRole = justified(ROLE, NAV_ROLE_SIZE, navInk.x2 - navInk.x1);
const roleBaseline = box.y + box.h + NAV_ROLE_GAP - navRole.ink.y1; // ink.y1 is negative (cap height above baseline)
const roleX = navInk.x1 - navRole.ink.x1;
const navH = roleBaseline + navRole.ink.y2 - box.y + 2;
const themed =
  inner.replace(/ (fill|stroke)="#[0-9a-f]{6}"/gi, "") +
  `<path class="role" transform="translate(${roleX.toFixed(2)} ${roleBaseline.toFixed(2)})" d="${navRole.d}"/>`;
write(
  path.join(root, "components/logo-svg.ts"),
  `// Generated by scripts/logo/make-logo.mjs (npm run logo). Do not edit by hand.
` +
    `export const LOGO_VIEWBOX = "${box.x} ${box.y} ${box.w} ${Math.ceil(navH)}";
` +
    `export const LOGO_SVG = ${JSON.stringify(themed)};
`,
);
