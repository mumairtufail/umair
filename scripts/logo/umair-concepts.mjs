// "umair" wordmark explorations: the i's dot is the HEAD commit of a git graph.
// A2 + icon 3 were chosen and live on in umair-mark.mjs.
//   node scripts/logo/umair-concepts.mjs  → scripts/logo/concepts/umair-*.svg + _umair-sheet.png
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

const DARK = { bg: "#0e0f0d", ink: "#ecebe4", muted: "#9a9a90", gold: "#d9b26a" };
const LIGHT = { bg: "#ffffff", ink: "#18181b", muted: "#52525b", gold: "#c4973f" };
const r1 = (n) => Math.round(n * 10) / 10;

/** Lay out "umaır" (dotless i) and measure where the real i-dot would sit. */
function word(font, size) {
  const parts = ["u", "m", "a", "ı", "r"];
  let x = 0;
  const glyphs = parts.map((ch) => {
    const p = font.getPath(ch, x, 0, size);
    const g = { ch, x, bb: p.getBoundingBox(), d: toD(p), adv: font.getAdvanceWidth(ch, size) };
    x += g.adv;
    return g;
  });
  const dotted = font.getPath("i", 0, 0, size).getBoundingBox();
  const dotless = glyphs[3].bb;
  const dotH = (dotless.y1 - dotted.y1) * 0.62;
  const head = { x: (dotless.x1 + dotless.x2) / 2, y: dotted.y1 + dotH / 2, r: dotH / 2 };
  const cx = (g) => (g.bb.x1 + g.bb.x2) / 2;
  return { glyphs, width: x, head, cx, xh: -dotless.y1 };
}

const node = (x, y, r, c, filled) =>
  filled
    ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${c.gold}"/>`
    : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${c.bg}" stroke="${c.ink}" stroke-width="${r1(r * 0.55)}"/>`;

// A · commit line over the word, a feature branch merging into HEAD (the i-dot)
function conceptA(c, size = 200) {
  const w = word(serif, size);
  const { head } = w;
  const [u, m, a] = w.glyphs;
  const sw = size * 0.035;
  const nr = head.r * 0.78;
  const by = head.y - size * 0.3; // branch lane
  const n1 = w.cx(u);
  const b1 = w.cx(m) + size * 0.05;
  const q = size * 0.12;
  const lines =
    `<path d="M${r1(u.bb.x1)} ${r1(head.y)}H${r1(head.x)}" stroke="${c.muted}" stroke-width="${r1(sw)}" stroke-linecap="round" fill="none"/>` +
    `<path d="M${r1(n1)} ${r1(head.y)}Q${r1(n1)} ${r1(by)} ${r1(n1 + q)} ${r1(by)}H${r1(head.x - q)}Q${r1(head.x)} ${r1(by)} ${r1(head.x)} ${r1(head.y)}" stroke="${c.gold}" stroke-width="${r1(sw)}" stroke-linecap="round" fill="none"/>`;
  const nodes =
    node(n1, head.y, nr, c) +
    node(w.cx(a), head.y, nr, c) +
    node(b1, by, nr, c) +
    node(head.x, head.y, head.r * 1.1, c, true);
  const letters = w.glyphs.map((g) => `<path d="${g.d}" fill="${c.ink}"/>`).join("");
  return { svg: lines + letters + nodes, top: by - nr * 2, bottom: size * 0.05, width: w.width };
}

// B · minimal: a single commit history runs into the name, HEAD = i-dot
function conceptB(c, size = 200) {
  const w = word(serif, size);
  const { head } = w;
  const [u, m, a] = w.glyphs;
  const sw = size * 0.03;
  const nr = head.r * 0.7;
  const line = `<path d="M${r1(w.cx(u))} ${r1(head.y)}H${r1(head.x)}" stroke="${c.muted}" stroke-width="${r1(sw)}" stroke-linecap="round" stroke-dasharray="0 ${r1(sw * 2.2)}" fill="none"/>`;
  const nodes =
    [u, m, a].map((g) => node(w.cx(g), head.y, nr, c)).join("") + node(head.x, head.y, head.r * 1.15, c, true);
  const letters = w.glyphs.map((g) => `<path d="${g.d}" fill="${c.ink}"/>`).join("");
  return { svg: line + letters + nodes, top: head.y - head.r * 2, bottom: size * 0.05, width: w.width };
}

// C · the "u" is drawn as a git fork/merge (two branches joined), the rest in the serif, HEAD = i-dot
function conceptC(c, size = 200) {
  const w = word(serif, size);
  const { head } = w;
  const [u] = w.glyphs;
  const sw = size * 0.075;
  const left = u.bb.x1 + sw / 2;
  const right = u.bb.x2 - sw / 2;
  const top = -w.xh + sw * 0.6;
  const rad = (right - left) / 2;
  const uPath = `<path d="M${r1(left)} ${r1(top)}V${r1(-rad - sw / 2)}A${r1(rad)} ${r1(rad)} 0 0 0 ${r1(right)} ${r1(-rad - sw / 2)}V${r1(top)}" stroke="${c.ink}" stroke-width="${r1(sw)}" fill="none"/>`;
  const nr = sw * 0.95;
  const uNodes = node(left, top - nr * 0.2, nr, c) + node(right, top - nr * 0.2, nr, c, true);
  const letters = w.glyphs
    .slice(1)
    .map((g) => `<path d="${g.d}" fill="${c.ink}"/>`)
    .join("");
  return {
    svg: uPath + letters + uNodes + node(head.x, head.y, head.r * 1.1, c, true),
    top: head.y - head.r * 2,
    bottom: size * 0.05,
    width: w.width,
  };
}

// A2 · refined A: more air between graph and letters, lighter lines, smaller commits
function conceptA2(c, size = 200, font = serif) {
  const w = word(font, size);
  const [u, m, a] = w.glyphs;
  const lift = size * 0.06; // raise the graph off the letters
  const hy = w.head.y - lift;
  const hr = w.head.r * 1.05;
  const sw = size * 0.026;
  const nr = w.head.r * 0.55;
  const by = hy - size * 0.24;
  const n1 = w.cx(u);
  const q = size * 0.1;
  const hx = w.head.x;
  const lines =
    `<path d="M${r1(u.bb.x1 + sw)} ${r1(hy)}H${r1(hx)}" stroke="${c.muted}" stroke-width="${r1(sw)}" stroke-linecap="round" fill="none"/>` +
    `<path d="M${r1(n1)} ${r1(hy)}Q${r1(n1)} ${r1(by)} ${r1(n1 + q)} ${r1(by)}H${r1(hx - q)}Q${r1(hx)} ${r1(by)} ${r1(hx)} ${r1(hy)}" stroke="${c.gold}" stroke-width="${r1(sw)}" stroke-linecap="round" fill="none"/>`;
  const nodes =
    node(n1, hy, nr, c) + node(w.cx(a), hy, nr, c) + node(w.cx(m) + size * 0.04, by, nr, c) + node(hx, hy, hr, c, true);
  // the i keeps a short stem up to its HEAD so it still reads as an "i"
  const letters = w.glyphs.map((g) => `<path d="${g.d}" fill="${c.ink}"/>`).join("");
  return { svg: lines + letters + nodes, top: by - nr * 2, bottom: size * 0.05, width: w.width };
}

// icon: the same graph alone in a tile (merge into gold HEAD)
function markIcon(c) {
  const sw = 34,
    nr = 26,
    hr = 44;
  const y = 330,
    by = 190,
    x1 = 120,
    xb = 256,
    xh = 392;
  const g =
    `<path d="M${x1 - 40} ${y}H${xh}" stroke="${c.muted}" stroke-width="${sw}" stroke-linecap="round"/>` +
    `<path d="M${x1} ${y}Q${x1} ${by} ${x1 + 90} ${by}H${xh - 90}Q${xh} ${by} ${xh} ${y}" stroke="${c.gold}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>` +
    `<circle cx="${x1}" cy="${y}" r="${nr}" fill="${c.bg}" stroke="${c.ink}" stroke-width="16"/>` +
    `<circle cx="${xb}" cy="${by}" r="${nr}" fill="${c.bg}" stroke="${c.ink}" stroke-width="16"/>` +
    `<circle cx="${xh}" cy="${y}" r="${hr}" fill="${c.gold}"/>`;
  return `<rect x="2" y="2" width="508" height="508" rx="112" fill="${c.bg}" stroke="${c === DARK ? "#2a2d27" : "#e4e4e7"}" stroke-width="4"/>${g}`;
}

// icon v2: a serif "u" under the same graph, HEAD in gold (a mini version of the wordmark)
function markIcon2(c) {
  const size = 330;
  const up = serif.getPath("u", 0, 0, size);
  const bb = up.getBoundingBox();
  const tx = 256 - (bb.x1 + bb.x2) / 2;
  const ty = 420;
  const L = bb.x1 + tx,
    R = bb.x2 + tx;
  const y = 215,
    by = 120,
    sw = 22,
    nr = 19,
    hr = 34;
  const x1 = L + 20,
    xh = R + 6,
    q = 50,
    xb = (x1 + xh) / 2;
  const g =
    `<path d="M${r1(L - 26)} ${y}H${r1(xh)}" stroke="${c.muted}" stroke-width="${sw}" stroke-linecap="round"/>` +
    `<path d="M${r1(x1)} ${y}Q${r1(x1)} ${by} ${r1(x1 + q)} ${by}H${r1(xh - q)}Q${r1(xh)} ${by} ${r1(xh)} ${y}" stroke="${c.gold}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>` +
    `<circle cx="${r1(x1)}" cy="${y}" r="${nr}" fill="${c.bg}" stroke="${c.ink}" stroke-width="11"/>` +
    `<circle cx="${r1(xb)}" cy="${by}" r="${nr}" fill="${c.bg}" stroke="${c.ink}" stroke-width="11"/>` +
    `<circle cx="${r1(xh)}" cy="${y}" r="${hr}" fill="${c.gold}"/>`;
  return (
    `<rect x="2" y="2" width="508" height="508" rx="112" fill="${c.bg}" stroke="${c === DARK ? "#2a2d27" : "#e4e4e7"}" stroke-width="4"/>` +
    `<path transform="translate(${r1(tx)} ${ty})" d="${toD(up)}" fill="${c.ink}"/>${g}`
  );
}

// icon v3: big serif "u", one commit line above it running into the gold HEAD
function markIcon3(c) {
  const size = 420;
  const up = serif.getPath("u", 0, 0, size);
  const bb = up.getBoundingBox();
  const tx = 256 - (bb.x1 + bb.x2) / 2;
  const ty = 440;
  const L = bb.x1 + tx,
    R = bb.x2 + tx;
  const y = 150,
    sw = 24,
    nr = 24,
    hr = 40;
  const x1 = L + 42,
    xh = R - 30;
  const g =
    `<path d="M${r1(L - 10)} ${y}H${r1(xh)}" stroke="${c.muted}" stroke-width="${sw}" stroke-linecap="round"/>` +
    `<circle cx="${r1(x1)}" cy="${y}" r="${nr}" fill="${c.bg}" stroke="${c.ink}" stroke-width="13"/>` +
    `<circle cx="${r1(xh)}" cy="${y}" r="${hr}" fill="${c.gold}"/>`;
  return (
    `<rect x="2" y="2" width="508" height="508" rx="112" fill="${c.bg}" stroke="${c === DARK ? "#2a2d27" : "#e4e4e7"}" stroke-width="4"/>` +
    `<path transform="translate(${r1(tx)} ${ty})" d="${toD(up)}" fill="${c.ink}"/>${g}`
  );
}

function tile(concept, c, W = 900, H = 300) {
  const { svg, top, bottom, width } = concept(c);
  const h = bottom - top;
  const s = Math.min((W * 0.6) / width, (H * 0.62) / h);
  const tx = (W - width * s) / 2;
  const ty = (H - h * s) / 2 - top * s;
  return `<rect width="${W}" height="${H}" fill="${c.bg}"/><g transform="translate(${r1(tx)} ${r1(ty)}) scale(${r1(s * 1000) / 1000})">${svg}</g>`;
}

// small preview at real nav size (28px tall) to judge legibility
function small(concept, c, W = 900, H = 80) {
  const { svg, top, bottom } = concept(c);
  const s = 30 / (bottom - top);
  return `<rect width="${W}" height="${H}" fill="${c.bg}"/><g transform="translate(40 ${r1(25 - top * s)}) scale(${r1(s * 1000) / 1000})">${svg}</g>`;
}

// A2M · A2 set in IBM Plex Mono (the site's code font) instead of Fraunces
const conceptA2M = (c, size = 200) => conceptA2(c, size, mono);

const concepts = { A: conceptA, B: conceptB, C: conceptC, A2: conceptA2, A2M: conceptA2M };
let y = 0;
let sheet = "";
for (const [name, fn] of Object.entries(concepts)) {
  for (const c of [DARK, LIGHT]) {
    const big = tile(fn, c);
    fs.writeFileSync(
      path.join(out, `umair-${name}-${c === DARK ? "dark" : "light"}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 300">${big}</svg>`,
    );
    sheet += `<g transform="translate(0 ${y})">${big}<text x="20" y="28" font-family="monospace" font-size="16" fill="${c.muted}">${name}</text></g>`;
    y += 300;
    sheet += `<g transform="translate(0 ${y})">${small(fn, c)}</g>`;
    y += 80;
  }
}
// icon attempts in order: graph only (reads as a bag), u under graph (u too small), big u + commit line (chosen)
for (const [i, make] of [markIcon, markIcon2, markIcon3].entries())
  for (const c of [DARK, LIGHT]) {
    const icon = make(c);
    fs.writeFileSync(
      path.join(out, `umair-icon${i + 1}-${c === DARK ? "dark" : "light"}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${icon}</svg>`,
    );
    sheet +=
      `<g transform="translate(0 ${y})"><rect width="900" height="200" fill="${c.bg}"/>` +
      `<g transform="translate(40 20) scale(0.3125)">${icon}</g>` +
      `<g transform="translate(260 84) scale(0.0625)">${icon}</g>` +
      `<g transform="translate(320 88) scale(0.03125)">${icon}</g></g>`;
    y += 200;
  }
const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 ${y}" width="900" height="${y}">${sheet}</svg>`;
await sharp(Buffer.from(doc)).png().toFile(path.join(out, "_umair-sheet.png"));
console.log("wrote", path.join(out, "_umair-sheet.png"));
