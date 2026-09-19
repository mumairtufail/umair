"use client";

import { useEffect, useRef } from "react";
import { DotPattern } from "@/components/ui/dot-pattern";

// Grid geometry — shared by the static SVG layer and the interactive canvas so they line up exactly.
const GAP = 24;
const DOT = 1; // resting radius
const RADIUS = 130; // cursor influence radius (px)
const MAX_GROW = 1.6; // extra radius at full lift
const MAX_LIFT = 5; // px the dot rises / pushes away from the cursor
const EASE = 0.14; // per-frame smoothing (lower = floatier)

type Active = { gx: number; gy: number; v: number };

/**
 * Full-page dot grid. The static layer is a plain <DotPattern>; on pointer devices a canvas on top
 * animates only the dots near the cursor (they swell, lift and warm to the accent colour, then settle).
 */
export default function DotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = { bg: "", line: "", accent: "" };
    const readColors = () => {
      const s = getComputedStyle(canvas.parentElement ?? document.documentElement);
      colors.bg = s.getPropertyValue("--bg").trim();
      colors.line = s.getPropertyValue("--line").trim();
      colors.accent = s.getPropertyValue("--accent").trim();
    };
    readColors();
    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pointer = { x: -9999, y: -9999, inside: false };
    const active = new Map<string, Active>();
    let raf = 0;

    const frame = () => {
      raf = 0;
      ctx.clearRect(0, 0, innerWidth, innerHeight);

      // wake up every dot currently inside the influence radius
      if (pointer.inside) {
        const r = Math.ceil(RADIUS / GAP);
        const cgx = Math.floor(pointer.x / GAP);
        const cgy = Math.floor(pointer.y / GAP);
        for (let gx = cgx - r; gx <= cgx + r; gx++) {
          for (let gy = cgy - r; gy <= cgy + r; gy++) {
            const key = `${gx},${gy}`;
            if (!active.has(key)) active.set(key, { gx, gy, v: 0 });
          }
        }
      }

      for (const [key, d] of active) {
        const px = d.gx * GAP + GAP / 2;
        const py = d.gy * GAP + GAP / 2;
        const dx = px - pointer.x;
        const dy = py - pointer.y;
        const dist = Math.hypot(dx, dy);
        const t = pointer.inside ? Math.max(0, 1 - dist / RADIUS) : 0;
        const target = t * t * (3 - 2 * t); // smoothstep falloff

        d.v += (target - d.v) * EASE;
        if (d.v < 0.005 && target === 0) {
          active.delete(key);
          continue;
        }

        // cover the static SVG dot so the lifted one doesn't appear doubled
        ctx.globalAlpha = 1;
        ctx.fillStyle = colors.bg;
        ctx.beginPath();
        ctx.arc(px, py, DOT + 0.75, 0, Math.PI * 2);
        ctx.fill();

        // lifted dot: rises, drifts away from the cursor, grows and picks up the accent colour
        const push = dist > 0.01 ? (d.v * MAX_LIFT * 0.6) / dist : 0;
        const x = px + dx * push;
        const y = py + dy * push - d.v * MAX_LIFT;
        ctx.fillStyle = colors.line;
        ctx.beginPath();
        ctx.arc(x, y, DOT + d.v * MAX_GROW, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = Math.min(1, d.v * 1.1);
        ctx.fillStyle = colors.accent;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (active.size) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
      kick();
    };
    const onLeave = () => {
      pointer.inside = false;
      kick();
    };
    const onResize = () => {
      resize();
      kick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="dot-bg" aria-hidden="true">
      <DotPattern
        width={GAP}
        height={GAP}
        cx={GAP / 2}
        cy={GAP / 2}
        cr={DOT}
        className="fill-[var(--line)] md:fill-[var(--line)]"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
