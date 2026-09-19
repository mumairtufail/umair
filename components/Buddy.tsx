"use client";
import { useEffect, useRef } from "react";

/*
 * Buddy: a shy little guy who lives on the page.
 *
 *   ENTER    page load: peeks up from the bottom edge, looks around, pops up, says "hi!"
 *   FOLLOW   cursor moving (not at him): trails it at FOLLOW_DISTANCE, bouncing, eyes on it
 *   WATCH    cursor still < BORED_MS: stands and watches it
 *   BORED    cursor still ≥ BORED_MS: sways, looks around, whistles
 *   SLEEP    cursor still ≥ SLEEP_MS: squashes down, eyes shut, zzz; waking up startles him
 *   FLEE     cursor heads at him within THREAT_RADIUS (or gets within PANIC_RADIUS):
 *            "!" + scared face, runs to the nearest hiding spot away from the cursor
 *   HIDE     tucked behind the spot's top edge, eyes peeking and tracking the cursor
 *            · cursor still ≥ PERCH_MS → climbs up and whistles
 *            · cursor moves away for COME_OUT_MS → comes out and follows again
 *            · cursor comes at him again, or the spot scrolls away → flees to a new spot
 *
 * Hiding spots are cards, buttons, tags and headings (behind the letters), plus the bottom edge
 * of the screen as a fallback that always exists.
 *
 * Performance: one loop that runs per-frame only while something is moving, and drops to a
 * 5 Hz check when settled (idle animations are pure CSS). Styles/classes are written only when
 * they change, React never re-renders, and the DOM is scanned for spots only at the moment he flees.
 * Disabled on touch devices and with prefers-reduced-motion.
 */

const SIZE = 56;
const FOLLOW_DISTANCE = 90;
const THREAT_RADIUS = 220;
const PANIC_RADIUS = 55;
const AIM_THRESHOLD = 0.55; // cos of the angle between cursor velocity and the direction to him (~57°)
const BORED_MS = 1500;
const PERCH_MS = 2500;
const SLEEP_MS = 20000;
const COME_OUT_MS = 1000;
const STARTLE_MS = 700;
const HIDE_SINK = 24; // px tucked behind the edge while hiding: eyes still peek out
const RUN_SPEED = 12;
const WALK_SPEED = 7;
const NAV_HEIGHT = 100; // never hide under the sticky nav
const SLOW_TICK_MS = 200;

const HIDE_SELECTOR = "h1, h2, .btn, .tag, .project, .stack-group, .exp, .tt, .term, .photo, .tabs";
const TEXT_SELECTOR = "h1, h2";

type Box = { left: number; right: number; line: number };
type Spot = { el: Element | null; offsetX: number }; // el null = bottom edge of the screen
type Mode = "enter" | "follow" | "flee" | "hide";

function boxFor(el: Element | null): Box {
  if (!el) return { left: 0, right: window.innerWidth, line: window.innerHeight };
  if (el.matches(TEXT_SELECTOR)) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const r = range.getBoundingClientRect();
    return { left: r.left, right: r.right, line: r.top + r.height * 0.2 }; // roughly the cap height
  }
  const r = el.getBoundingClientRect();
  return { left: r.left, right: r.right, line: r.top };
}

const usable = (b: Box) => b.right - b.left >= SIZE + 10 && b.line >= NAV_HEIGHT && b.line <= window.innerHeight;
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export default function Buddy() {
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!rootRef.current || !flipRef.current || !pupilsRef.current) return;
    // narrowed consts so the hoisted helpers below see non-null elements
    const root: HTMLDivElement = rootRef.current;
    const flip: HTMLDivElement = flipRef.current;
    const pupils: SVGGElement = pupilsRef.current;
    if (matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;

    // --- state ---
    let mode: Mode = "enter";
    let x = 32;
    let y = window.innerHeight - SIZE;
    let sink = SIZE + 2; // starts fully below the bottom edge
    let facing = 1;
    let spot: Spot | null = null;
    let hiddenAt = 0;
    let scaredUntil = 0;
    let bornAt = -1;
    let wasAsleep = false;

    // --- cursor ---
    let mx = 0;
    let my = 0;
    let cvx = 0; // smoothed velocity, px/ms
    let cvy = 0;
    let lastMove = performance.now(); // page load counts as activity, so he doesn't nap right after entering
    let hasCursor = false;
    let lastScroll = -Infinity;

    // --- loop scheduling ---
    let raf = 0;
    let timer = 0;

    // --- write-only-on-change style cache ---
    const written: Record<string, string> = {};
    const setStyle = (el: HTMLElement | SVGElement, key: string, prop: "transform" | "clipPath", value: string) => {
      if (written[key] === value) return;
      written[key] = value;
      el.style[prop] = value;
    };
    const classes = new Set<string>();
    const setClass = (name: string, on: boolean) => {
      if (on === classes.has(name)) return;
      if (on) classes.add(name);
      else classes.delete(name);
      root.classList.toggle(name, on);
    };

    function findSpot(exclude: Element | null): Spot {
      const floor: Spot = { el: null, offsetX: mx < window.innerWidth / 2 ? window.innerWidth - SIZE - 100 : 24 };
      let best = floor;
      let bestScore = Math.hypot(floor.offsetX + SIZE / 2 - (x + SIZE / 2), window.innerHeight - (y + SIZE)) + 250; // floor is a last resort
      for (const el of document.querySelectorAll(HIDE_SELECTOR)) {
        if (el === exclude || el.closest(".chat")) continue;
        const b = boxFor(el);
        if (!usable(b)) continue;
        const width = b.right - b.left;
        const off = mx < (b.left + b.right) / 2 ? width - SIZE - 6 : 6; // the end farther from the cursor
        const sx = b.left + off + SIZE / 2;
        const dCursor = Math.hypot(sx - mx, b.line - my);
        if (dCursor < THREAT_RADIUS) continue;
        const score = Math.hypot(sx - (x + SIZE / 2), b.line - (y + SIZE)) - dCursor * 0.3;
        if (score < bestScore) {
          bestScore = score;
          best = { el, offsetX: off };
        }
      }
      return best;
    }

    function flee(now: number, exclude: Element | null) {
      spot = findSpot(exclude);
      mode = "flee";
      scaredUntil = now + STARTLE_MS;
    }

    function tick(now: number) {
      if (bornAt < 0) bornAt = now;
      const stillFor = now - lastMove;
      const moving = stillFor < 120;
      let sinkTarget = 0;
      let running = false;
      let looking = false;
      let greeting = false;

      // where the cursor is relative to his visible part
      const dx = mx - (x + SIZE / 2);
      const dy = my - (y + (SIZE - sink) / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const speed = moving ? Math.hypot(cvx, cvy) : 0;
      const aim = speed > 0.2 ? -(cvx * dx + cvy * dy) / (speed * dist) : -1; // 1 = heading straight at him
      const threatened = hasCursor && moving && dist < THREAT_RADIUS && (aim > AIM_THRESHOLD || dist < PANIC_RADIUS);

      if (mode === "enter") {
        const t = now - bornAt;
        sinkTarget = t < 400 ? SIZE + 2 : t < 2000 ? HIDE_SINK : 0;
        looking = t > 900 && t < 2000;
        greeting = t > 2200;
        x = 32;
        y = window.innerHeight - SIZE + sink;
        if (t > 3900) mode = "follow";
      } else {
        const asleep = stillFor >= SLEEP_MS;
        if (wasAsleep && !asleep) scaredUntil = now + STARTLE_MS; // woken up
        wasAsleep = asleep;

        if (mode === "hide" && spot && !usable(boxFor(spot.el))) flee(now, spot.el); // spot scrolled away

        if (mode === "follow") {
          if (threatened) {
            flee(now, null);
          } else if (moving && dist > FOLLOW_DISTANCE) {
            const step = Math.min((dist - FOLLOW_DISTANCE) * 0.07, WALK_SPEED);
            x += (dx / dist) * step;
            y += (dy / dist) * step;
            running = step > 0.4;
            if (running) facing = dx < 0 ? -1 : 1;
          }
        } else if (mode === "hide" && spot) {
          if (threatened) {
            flee(now, spot.el);
          } else if (moving && aim < 0 && dist > THREAT_RADIUS * 0.75 && now - hiddenAt > COME_OUT_MS) {
            mode = "follow"; // coast is clear
          } else {
            sinkTarget = stillFor >= PERCH_MS ? 0 : HIDE_SINK;
            const b = boxFor(spot.el);
            x = b.left + spot.offsetX;
            y = b.line - SIZE + sink;
          }
        }

        if (mode === "flee" && spot) {
          const b = boxFor(spot.el);
          if (spot.el && !usable(b)) {
            spot = findSpot(spot.el);
          } else {
            const tx = b.left + spot.offsetX;
            const ty = b.line - SIZE;
            const ddx = tx - x;
            const ddy = ty - y;
            const d = Math.hypot(ddx, ddy);
            if (d < 2) {
              x = tx;
              y = ty;
              mode = "hide";
              hiddenAt = now;
              sinkTarget = HIDE_SINK;
            } else {
              const step = Math.min(d, RUN_SPEED);
              x += (ddx / d) * step;
              y += (ddy / d) * step;
              if (Math.abs(ddx) > 1) facing = ddx < 0 ? -1 : 1;
              running = true;
            }
          }
        }

        x = clamp(x, 4, window.innerWidth - SIZE - 4);
        if (mode !== "hide") y = clamp(y, NAV_HEIGHT - SIZE, window.innerHeight - SIZE);
      }

      // sink eases toward its target; popping out is faster than ducking
      const sinkDelta = sinkTarget - sink;
      sink = Math.abs(sinkDelta) < 0.3 ? sinkTarget : sink + sinkDelta * (sinkDelta > 0 ? 0.25 : 0.3);

      const scared = mode === "flee" || now < scaredUntil;
      const settled = mode !== "enter" && !running && !scared && sink < 2;
      const sleeping = settled && stillFor >= SLEEP_MS;
      const bored = settled && !sleeping && stillFor >= BORED_MS;

      setClass("is-walking", running);
      setClass("is-scared", scared);
      setClass("is-bored", bored);
      setClass("is-sleeping", sleeping);
      setClass("is-looking", looking);
      setClass("is-greeting", greeting);

      if (!bored && !sleeping && !looking && hasCursor) {
        if (!running && Math.abs(dx) > 6) facing = dx < 0 ? -1 : 1;
        const k = (Math.min(dist, 120) / 120) * 3;
        setStyle(
          pupils,
          "pupils",
          "transform",
          `translate(${((dx / dist) * k * facing).toFixed(2)}px, ${((dy / dist) * k).toFixed(2)}px)`,
        );
      } else {
        setStyle(pupils, "pupils", "transform", "");
      }

      setStyle(root, "root", "transform", `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`);
      // everything below the hiding edge is clipped away, so he looks tucked behind it
      setStyle(root, "clip", "clipPath", sink > 0.5 ? `inset(-60px -60px ${sink.toFixed(1)}px -60px)` : "none");
      setStyle(flip, "flip", "transform", `scaleX(${facing})`);

      // full frame rate only while something is moving; otherwise a cheap slow check
      const active =
        mode === "enter" || mode === "flee" || running || moving || sink !== sinkTarget || now - lastScroll < 200;
      if (active) raf = requestAnimationFrame(tick);
      else
        timer = window.setTimeout(() => {
          timer = 0;
          tick(performance.now());
        }, SLOW_TICK_MS);
    }

    // wake the loop to full speed if it's in slow mode
    function wake() {
      if (timer) {
        clearTimeout(timer);
        timer = 0;
        raf = requestAnimationFrame(tick);
      }
    }

    const onMove = (e: MouseEvent) => {
      const t = performance.now();
      const dt = t - lastMove;
      if (hasCursor && dt > 0 && dt < 100) {
        cvx = cvx * 0.6 + ((e.clientX - mx) / dt) * 0.4;
        cvy = cvy * 0.6 + ((e.clientY - my) / dt) * 0.4;
      } else {
        cvx = cvy = 0;
      }
      mx = e.clientX;
      my = e.clientY;
      lastMove = t;
      hasCursor = true;
      wake();
    };
    const onScroll = () => {
      lastScroll = performance.now();
      wake();
    };

    root.classList.add("is-ready");
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="buddy" ref={rootRef} aria-hidden="true">
      <div className="buddy-flip" ref={flipRef}>
        <svg viewBox="0 0 64 64" width={SIZE} height={SIZE}>
          <g className="buddy-bob">
            <ellipse className="foot foot-l" cx="24" cy="57" rx="7" ry="4" />
            <ellipse className="foot foot-r" cx="40" cy="57" rx="7" ry="4" />
            <path className="buddy-body" d="M32 8C48 8 56 20 56 34S46 56 32 56 8 48 8 34 16 8 32 8Z" />
            <path className="buddy-tuft" d="M32 9Q29 2 36 1" />
            <circle className="eye" cx="24" cy="28" r="6.5" />
            <circle className="eye" cx="40" cy="28" r="6.5" />
            <g className="pupils" ref={pupilsRef}>
              <circle cx="24" cy="28" r="2.8" />
              <circle cx="40" cy="28" r="2.8" />
            </g>
            <path className="eyes-shut" d="M18.5 28q5.5 4 11 0M34.5 28q5.5 4 11 0" />
            <circle className="cheek" cx="17" cy="38" r="3" />
            <circle className="cheek" cx="47" cy="38" r="3" />
            <path className="mouth mouth-smile" d="M28 40Q32 44 36 40" />
            <circle className="mouth mouth-whistle" cx="36" cy="42" r="2.4" />
            <ellipse className="mouth mouth-scared" cx="32" cy="43" rx="3.2" ry="4" />
          </g>
        </svg>
      </div>
      <span className="buddy-alert">!</span>
      <span className="buddy-bubble">hi! 👋</span>
      <div className="buddy-float notes">
        <span>♪</span>
        <span>♫</span>
        <span>♪</span>
      </div>
      <div className="buddy-float zzz">
        <span>z</span>
        <span>z</span>
        <span>Z</span>
      </div>
    </div>
  );
}
