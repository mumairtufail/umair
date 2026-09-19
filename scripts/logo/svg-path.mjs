// opentype.js's Path#toPathData() can emit "NaN" for some coordinates, so serialise commands ourselves.
const n = (v) => String(Math.round(v * 100) / 100);

export function toD(path) {
  return path.commands
    .map((c) => {
      if (c.type === "M" || c.type === "L") return `${c.type}${n(c.x)} ${n(c.y)}`;
      if (c.type === "Q") return `Q${[c.x1, c.y1, c.x, c.y].map(n).join(" ")}`;
      if (c.type === "C") return `C${[c.x1, c.y1, c.x2, c.y2, c.x, c.y].map(n).join(" ")}`;
      return "Z";
    })
    .join("");
}
