// Logo concept explorations → scripts/logo/concepts/  (node scripts/logo/concepts.mjs)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";
import { toD } from "./svg-path.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = path.join(here, "concepts"); // explorations only — kept out of public/
fs.mkdirSync(out, { recursive: true });

const load = (f) => {
  const b = fs.readFileSync(path.join(here, f));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const serif = load("Fraunces-SemiBold.ttf");
const mono = load("IBMPlexMono-600.ttf");
const monoMed = load("IBMPlexMono-500.ttf");

const DARK = { tile: "#0e0f0d", edge: "#2a2d27", ink: "#ecebe4", muted: "#9a9a90", gold: "#d9b26a" };
const LIGHT = { tile: "#ffffff", edge: "#e4e4e7", ink: "#18181b", muted: "#52525b", gold: "#c4973f" };

const NAME = "Umair Tufail";
const ROLE = "SOFTWARE ENGINEER";

const r1 = (n) => Math.round(n * 10) / 10;

/** Text → {d, bbox, width}. `tracking` is extra px between glyphs (for spaced caps). */
function text(font, str, size, tracking = 0) {
  if (!tracking) {
    const p = font.getPath(str, 0, 0, size);
    return { d: toD(p), bb: p.getBoundingBox(), w: font.getAdvanceWidth(str, size) };
  }
  const scale = size / font.unitsPerEm;
  let x = 0;
  const parts = [];
  for (const g of font.stringToGlyphs(str)) {
    parts.push(toD(g.getPath(x, 0, size)));
    x += g.advanceWidth * scale + tracking;
  }
  const whole = new opentype.Path();
  x = 0;
  for (const g of font.stringToGlyphs(str)) {
    whole.extend(g.getPath(x, 0, size));
    x += g.advanceWidth * scale + tracking;
  }
  return { d: parts.join(" "), bb: whole.getBoundingBox(), w: x - tracking };
}

/** Centre arbitrary content (with a known bbox) inside a size×size tile. */
function centred(size, bb, inner, dy = 0) {
  const tx = (size - (bb.x2 - bb.x1)) / 2 - bb.x1;
  const ty = (size - (bb.y2 - bb.y1)) / 2 - bb.y1 + dy;
  return `<g transform="translate(${r1(tx)} ${r1(ty)})">${inner}</g>`;
}

function tile(size, c, inner) {
  const s = size;
  return `<rect x="${s * 0.004}" y="${s * 0.004}" width="${s * 0.992}" height="${s * 0.992}" rx="${s * 0.22}" fill="${c.tile}" stroke="${c.edge}" stroke-width="${s * 0.008}"/>${inner}`;
}

// ---------------------------------------------------------------- marks (drawn in a 512 box)

const MARKS = {
  /** A — U and T share a stem: the T's gold crossbar caps the U's right arm. */
  ligature(c) {
    const sw = 58;
    const L = 0, R = 150, top = 0, bottom = 250, rad = R / 2;
    const u = `<path d="M${L} ${top} V${bottom - rad} A${rad} ${rad} 0 0 0 ${R} ${bottom - rad} V${top}" fill="none" stroke="${c.ink}" stroke-width="${sw}" stroke-linecap="butt"/>`;
    const tBar = `<path d="M${R - 88} ${top + sw / 2 - 2} H${R + 88}" stroke="${c.gold}" stroke-width="${sw}" stroke-linecap="round"/>`;
    const bb = { x1: L - sw / 2, y1: top - 2, x2: R + 88 + sw / 2, y2: bottom + sw / 2 };
    return centred(512, bb, u + tBar, 4);
  },

  /** B — a self-closing JSX tag: <ut/> with the slash in gold. */
  tag(c) {
    const size = 150;
    const pieces = [["<", c.muted], ["ut", c.ink], ["/", c.gold], [">", c.muted]];
    let x = 0;
    let svg = "";
    for (const [s, fill] of pieces) {
      const p = mono.getPath(s, x, 0, size);
      svg += `<path d="${toD(p)}" fill="${fill}"/>`;
      x += mono.getAdvanceWidth(s, size);
    }
    const all = mono.getPath("<ut/>", 0, 0, size).getBoundingBox();
    return centred(512, all, svg);
  },

  /** C — a terminal prompt: ›ut followed by a gold block cursor. */
  prompt(c) {
    const size = 190;
    const chev = mono.getPath("›", 0, 0, size);
    const cw = mono.getAdvanceWidth("›", size) * 0.8;
    const ut = mono.getPath("ut", cw, 0, size);
    const utBB = ut.getBoundingBox();
    const cur = { x: utBB.x2 + 16, w: 52, h: 18 };
    const svg =
      `<path d="${toD(chev)}" fill="${c.gold}"/>` +
      `<path d="${toD(ut)}" fill="${c.ink}"/>` +
      `<rect x="${r1(cur.x)}" y="${-cur.h}" width="${cur.w}" height="${cur.h}" rx="3" fill="${c.gold}"/>`;
    const bb = { x1: chev.getBoundingBox().x1, y1: utBB.y1, x2: cur.x + cur.w, y2: 0 };
    return centred(512, bb, svg, 6);
  },

  /** D — the current serif "u." (kept for comparison). */
  serif(c) {
    const size = 400;
    const u = serif.getPath("u", 0, 0, size);
    const bb = u.getBoundingBox();
    const dr = size * 0.085;
    const dx = bb.x2 + dr * 1.35;
    const svg = `<path d="${toD(u)}" fill="${c.ink}"/><circle cx="${r1(dx)}" cy="${r1(-dr)}" r="${r1(dr)}" fill="${c.gold}"/>`;
    return centred(512, { x1: bb.x1, y1: bb.y1, x2: dx + dr, y2: 0 }, svg, 5);
  },
};

// ---------------------------------------------------------------- outputs

const markSvg = (key, c, size = 512) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">${tile(512, c, MARKS[key](c))}</svg>\n`;

/** Mark + "Umair Tufail" over spaced "SOFTWARE ENGINEER". */
function lockupSvg(key, c) {
  const H = 160;
  const pad = 40;
  const name = text(serif, NAME, 70);
  const role = text(monoMed, ROLE, 19, 5.2);
  const x = H + 40;
  const nameBase = 84;
  const roleBase = nameBase + 46;
  const W = Math.ceil(x + Math.max(name.w, role.w) + pad);
  const mark = `<g transform="scale(${H / 512})">${tile(512, c, MARKS[key](c))}</g>`;
  const rule = `<rect x="${x}" y="${nameBase + 16}" width="28" height="3" rx="1.5" fill="${c.gold}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${mark}
  <path transform="translate(${x - name.bb.x1 * 0} ${nameBase})" d="${name.d}" fill="${c.ink}"/>
  ${rule}
  <path transform="translate(${x} ${roleBase})" d="${role.d}" fill="${c.muted}"/>
</svg>
`;
}

const labels = {
  ligature: "A · UT ligature",
  tag: "B · <ut/> tag",
  prompt: "C · terminal prompt",
  serif: "D · serif u. (current)",
};

const rows = [];
for (const key of Object.keys(MARKS)) {
  for (const [variant, c] of [["dark", DARK], ["light", LIGHT]]) {
    const lock = lockupSvg(key, c);
    fs.writeFileSync(path.join(out, `${key}-mark-${variant}.svg`), markSvg(key, c));
    fs.writeFileSync(path.join(out, `${key}-lockup-${variant}.svg`), lock);
    rows.push({ key, variant, c, lock });
  }
}

// contact sheet: each concept as a dark + light band
const bandW = 1400;
const bandH = 260;
const sheetH = bandH * rows.length;
let sheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bandW} ${sheetH}" width="${bandW}" height="${sheetH}">`;
const lbl = (s, x, y, fill) => `<path transform="translate(${x} ${y})" d="${text(monoMed, s, 16).d}" fill="${fill}"/>`;
rows.forEach(({ key, variant, c, lock }, i) => {
  const y = i * bandH;
  const w = Number(lock.match(/width="(\d+)"/)[1]);
  sheet += `<rect y="${y}" width="${bandW}" height="${bandH}" fill="${variant === "dark" ? "#0b0c0a" : "#f4f4f5"}"/>`;
  if (variant === "dark") sheet += lbl(labels[key], 40, y + 36, "#6b6c64");
  sheet += `<svg x="${(bandW - w) / 2}" y="${y + 60}" width="${w}" height="160" viewBox="0 0 ${w} 160">${lock.replace(/<\/?svg[^>]*>/g, "")}</svg>`;
  // favicon-size preview of the mark
  sheet += `<svg x="${bandW - 72}" y="${y + bandH - 56}" width="32" height="32" viewBox="0 0 512 512">${tile(512, c, MARKS[key](c))}</svg>`;
});
sheet += "</svg>";
await sharp(Buffer.from(sheet), { density: 96 }).png().toFile(path.join(out, "_sheet.png"));
console.log("wrote", path.relative(root, out));
