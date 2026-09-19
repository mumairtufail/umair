// The "umair" logo, drawn from code: metro-line lettering.
//
// Every letter is built from rounded monoline strokes, like a git graph / metro map:
//   u  starts from a commit (ring on its left tip)
//   i  its dot is HEAD (gold)
//   r  its arm is a feature branch (gold) ending in a commit
// Icon: the same "u" at app-icon scale, commit on the left tip, HEAD on the right.
//
// Every shape carries a role class (ink-s, gold-s, ring, head) as well as hex colours, so the site can
// recolour the inline SVG per theme with CSS (CSS beats SVG presentation attributes).
export const DARK = { bg: "#0e0f0d", edge: "#2a2d27", ink: "#ecebe4", muted: "#9a9a90", gold: "#d9b26a" };
export const LIGHT = { bg: "#ffffff", edge: "#e4e4e7", ink: "#18181b", muted: "#52525b", gold: "#c4973f" };

const SW = 18; // stroke width, in wordmark units (x-height = 100)
const GAP = 40; // space between letters

const stroke = (d, c, gold = false, extra = "") =>
  `<path class="${gold ? "gold-s" : "ink-s"}"${extra} d="${d}" stroke="${gold ? c.gold : c.ink}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
const ring = (x, y, c, r = 13, sw = 8) =>
  `<circle class="ring" cx="${x}" cy="${y}" r="${r}" fill="${c.bg}" stroke="${c.ink}" stroke-width="${sw}"/>`;
const head = (x, y, r, c) => `<circle class="head" cx="${x}" cy="${y}" r="${r}" fill="${c.gold}"/>`;

/** Wordmark → { inner, box: {x, y, w, h} } in its own units (baseline y=0, x-height 100). */
export function wordmark(c) {
  let x = 0;
  let inner = "";
  // u: two branches meeting at the bottom; the left one starts from a commit
  inner += stroke(`M${x} -100V-45A45 45 0 0 0 ${x + 90} -45M${x + 90} -100V0`, c) + ring(x, -100, c);
  x += 90 + GAP;
  // m: two arches
  inner += stroke(`M${x} 0V-100M${x} -62A38 38 0 0 1 ${x + 76} -62V0M${x + 76} -62A38 38 0 0 1 ${x + 152} -62V0`, c);
  x += 152 + GAP;
  // a: bowl + stem
  inner += stroke(`M${x + 90} -100V0`, c) + stroke(`M${x + 90} -50A45 45 0 1 0 ${x + 90} -49.9`, c);
  x += 90 + GAP;
  // i: stem, with HEAD as its dot
  inner += stroke(`M${x} -100V0`, c) + head(x, -148, 17, c);
  x += GAP;
  // r: stem; the arm is a feature branch ending in a commit
  inner +=
    stroke(`M${x} 0V-100`, c) +
    stroke(`M${x} -52Q${x} -100 ${x + 50} -100H${x + 62}`, c, true, ' pathLength="1"').replace('class="gold-s"', 'class="gold-s branch"') +
    ring(x + 70, -100, c);
  const right = x + 70 + 13 + 4;
  const left = -13 - 4;
  const top = -148 - 17;
  const bottom = SW / 2;
  const pad = 2;
  return { inner, box: { x: left - pad, y: top - pad, w: right - left + pad * 2, h: bottom - top + pad * 2 } };
}

/** Icon inner content for a 512×512 tile (tile itself not included). */
export function iconInner(c) {
  const s = (d) =>
    `<path class="ink-s" d="${d}" stroke="${c.ink}" stroke-width="44" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  return (
    s("M150 170V290A106 106 0 0 0 362 290V170") +
    s("M362 290V392") +
    ring(150, 170, c, 34, 20) +
    head(362, 120, 40, c)
  );
}

export const tile = (c) =>
  `<rect x="2" y="2" width="508" height="508" rx="112" fill="${c.bg}" stroke="${c.edge}" stroke-width="4"/>`;
