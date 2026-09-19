// Three entirely different "umair" logo directions.
//   node scripts/logo/umair-concepts-2.mjs  → scripts/logo/concepts/_umair-sheet-2.png (+ per-concept SVGs)
//   1 · Metro lines: custom monoline lettering drawn like a git graph (commits at the stroke ends, HEAD on the i)
//   2 · Release tag: "umair" with a git release tag "v4.0" (4+ years)
//   3 · Terminal prompt: ➜ umair git:(main)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";
import { toD } from "./svg-path.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "concepts");
fs.mkdirSync(out, { recursive: true });
const load = (f) => {
  const b = fs.readFileSync(path.join(here, f));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const serif = load("Fraunces-SemiBold.ttf");
const mono = load("IBMPlexMono-600.ttf");
const monoMed = load("IBMPlexMono-500.ttf");

const DARK = { bg: "#0e0f0d", edge: "#2a2d27", ink: "#ecebe4", muted: "#9a9a90", gold: "#d9b26a" };
const LIGHT = { bg: "#ffffff", edge: "#e4e4e7", ink: "#18181b", muted: "#52525b", gold: "#c4973f" };
const r1 = (n) => Math.round(n * 10) / 10;

/** Mono runs left to right from x, baseline 0 → { svg, x } */
function runs(font, pieces, size, x = 0) {
  let svg = "";
  for (const [s, fill] of pieces) {
    svg += `<path d="${toD(font.getPath(s, x, 0, size))}" fill="${fill}"/>`;
    x += font.getAdvanceWidth(s, size);
  }
  return { svg, x };
}

// ---------- 1 · metro-line lettering ----------
const SW = 18; // stroke
const ringAt = (x, y, c, r = 13) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.bg}" stroke="${c.ink}" stroke-width="8"/>`;
function metro(c) {
  const st = (d, color = c.ink) =>
    `<path d="${d}" stroke="${color}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const gap = 40;
  let x = 0;
  let svg = "";
  // u: two branches that meet at the bottom; the left one starts from a commit
  svg += st(`M${x} -100V-45A45 45 0 0 0 ${x + 90} -45M${x + 90} -100V0`) + ringAt(x, -100, c);
  x += 90 + gap;
  // m: two arches
  svg += st(`M${x} 0V-100M${x} -62A38 38 0 0 1 ${x + 76} -62V0M${x + 76} -62A38 38 0 0 1 ${x + 152} -62V0`);
  x += 152 + gap;
  // a: bowl + stem
  svg += st(`M${x + 90} -100V0`) + st(`M${x + 90} -50A45 45 0 1 0 ${x + 90} -49.9`);
  x += 90 + gap;
  // i: stem with the gold HEAD commit as its dot
  svg += st(`M${x} -100V0`) + `<circle cx="${x}" cy="-148" r="17" fill="${c.gold}"/>`;
  x += gap;
  // r: stem, the arm is a branch (gold) ending in a commit
  svg += st(`M${x} 0V-100`) + st(`M${x} -52Q${x} -100 ${x + 50} -100H${x + 62}`, c.gold) + ringAt(x + 70, -100, c);
  x += 84;
  return { svg, top: -170, bottom: 12, left: -16, width: x + 16 };
}
function metroIcon(c) {
  const st = (d, color = c.ink) =>
    `<path d="${d}" stroke="${color}" stroke-width="44" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  return (
    st("M150 170V290A106 106 0 0 0 362 290V170") +
    st("M362 290V392") +
    `<circle cx="150" cy="170" r="34" fill="${c.bg}" stroke="${c.ink}" stroke-width="20"/>` +
    `<circle cx="362" cy="120" r="40" fill="${c.gold}"/>`
  );
}

// ---------- 2 · release tag ----------
function tagShape(x, cy, h, w, c, label, size) {
  const t = h / 2;
  const d = `M${x} ${cy}L${x + t} ${cy - t}H${x + w - 10}Q${x + w} ${cy - t} ${x + w} ${cy - t + 10}V${cy + t - 10}Q${x + w} ${cy + t} ${x + w - 10} ${cy + t}H${x + t}Z`;
  const txt = runs(monoMed, [[label, c.bg]], size, 0);
  const lw = monoMed.getAdvanceWidth(label, size);
  const tx = x + t + 8 + (w - t - 18 - lw) / 2;
  return (
    `<path d="${d}" fill="${c.gold}"/>` +
    `<circle cx="${x + t * 0.55}" cy="${cy}" r="${h * 0.09}" fill="${c.bg}"/>` +
    `<g transform="translate(${r1(tx)} ${r1(cy + size * 0.36)})">${txt.svg}</g>`
  );
}
function release(c) {
  const size = 200;
  const p = serif.getPath("umair", 0, 0, size);
  const w = serif.getAdvanceWidth("umair", size);
  const xh = -p.getBoundingBox().y1; // includes i-dot; fine for placement
  const cy = -size * 0.25;
  const svg = `<path d="${toD(p)}" fill="${c.ink}"/>` + tagShape(w + 22, cy, 64, 182, c, "v4.0", 44);
  return { svg, top: -xh - 6, bottom: 10, left: -6, width: w + 22 + 182 + 12 };
}
function releaseIcon(c) {
  const up = serif.getPath("u", 0, 0, 330);
  const bb = up.getBoundingBox();
  return (
    `<path transform="translate(${r1(256 - (bb.x1 + bb.x2) / 2)} 430)" d="${toD(up)}" fill="${c.ink}"/>` +
    tagShape(230, 120, 96, 200, c, "v4", 60)
  );
}

// ---------- 3 · terminal prompt ----------
function arrow(x, c, size) {
  // ➜ drawn as a path so it doesn't depend on font coverage
  const s = size / 100;
  const y = -size * 0.33;
  return `<path d="M${x} ${r1(y)}H${r1(x + 52 * s)}M${r1(x + 34 * s)} ${r1(y - 18 * s)}L${r1(x + 54 * s)} ${r1(y)}L${r1(x + 34 * s)} ${r1(y + 18 * s)}" stroke="${c.gold}" stroke-width="${r1(11 * s)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}
function prompt(c) {
  const size = 150;
  const a = arrow(0, c, size);
  const t = runs(mono, [["umair", c.ink]], size, 110);
  const g = runs(monoMed, [[" git:(", c.muted], ["main", c.gold], [")", c.muted]], size * 0.62, t.x + 6);
  return { svg: a + t.svg + g.svg, top: -size * 0.8, bottom: size * 0.12, left: -10, width: g.x + 10 };
}
function promptIcon(c) {
  const a = `<g transform="translate(70 330)">${arrow(0, c, 330)}</g>`;
  const u = runs(mono, [["u", c.ink]], 330, 0);
  return a + `<g transform="translate(250 360)">${u.svg}</g>`;
}

// ---------- sheet ----------
const W = 1000;
function row(fn, c, label) {
  const { svg, top, bottom, left, width } = fn(c);
  const h = bottom - top;
  const area = W - 300; // leave the right side for the icons
  const s = Math.min((area * 0.85) / width, 150 / h);
  const big = `<g transform="translate(${r1((area - width * s) / 2 - left * s + 20)} ${r1(40 + (170 - h * s) / 2 - top * s)}) scale(${r1(s * 1000) / 1000})">${svg}</g>`;
  const ns = 34 / h; // real nav height
  const nav = `<g transform="translate(40 ${r1(222 - top * ns)}) scale(${r1(ns * 1000) / 1000})">${svg}</g>`;
  return `<rect width="${W}" height="280" fill="${c.bg}"/><text x="20" y="28" font-family="monospace" font-size="15" fill="${c.muted}">${label}</text>${big}${nav}`;
}
function iconRow(fn, c) {
  const tileSvg = (inner) =>
    `<rect x="2" y="2" width="508" height="508" rx="112" fill="${c.bg}" stroke="${c.edge}" stroke-width="4"/>${inner}`;
  const t = tileSvg(fn(c));
  return `<g transform="translate(${W - 230} 60) scale(0.3125)">${t}</g><g transform="translate(${W - 60} 110) scale(0.0625)">${t}</g><g transform="translate(${W - 60} 150) scale(0.03125)">${t}</g>`;
}

const concepts = [
  ["1 · metro lines: letters drawn as a git graph", metro, metroIcon, "metro"],
  ["2 · release tag: v4.0 = 4+ years shipped", release, releaseIcon, "release"],
  ["3 · terminal prompt", prompt, promptIcon, "prompt"],
];
let y = 0;
let sheet = "";
for (const [label, fn, icon, slug] of concepts) {
  for (const c of [DARK, LIGHT]) {
    const r = row(fn, c, label) + iconRow(icon, c);
    fs.writeFileSync(
      path.join(out, `v2-${slug}-${c === DARK ? "dark" : "light"}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 280">${r}</svg>`,
    );
    sheet += `<g transform="translate(0 ${y})">${r}</g>`;
    y += 280;
  }
}
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${y}" width="${W}" height="${y}">${sheet}</svg>`))
  .png()
  .toFile(path.join(out, "_umair-sheet-2.png"));
console.log("wrote", path.join(out, "_umair-sheet-2.png"));
