"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronDown, Maximize2, RotateCcw, X } from "lucide-react";
import type { Project } from "@/data/content";

export type CardData = Project & { hasImage: boolean };

// Schematic "app window" drawn until a screenshot exists in /public/projects/.
function Schematic({ seed }: { seed: number }) {
  const bars = [0.8, 0.55, 0.7, 0.4].map((w, i) => ((w + seed * 0.13 * (i + 1)) % 0.5) + 0.35);
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="24" y="22" width="272" height="148" rx="10" fill="var(--bg-elev)" stroke="var(--line)" />
      <rect x="24" y="22" width="272" height="20" rx="10" fill="var(--bg)" />
      <circle cx="38" cy="32" r="3" fill="var(--faint)" />
      <circle cx="48" cy="32" r="3" fill="var(--faint)" />
      <circle cx="58" cy="32" r="3" fill="var(--faint)" />
      <rect x="36" y="54" width="60" height="104" rx="6" fill="var(--bg-soft)" />
      {bars.map((w, i) => (
        <rect
          key={i}
          x="108"
          y={58 + i * 24}
          width={176 * w}
          height="12"
          rx="4"
          fill={i === 0 ? "var(--accent)" : "var(--line)"}
          opacity={i === 0 ? 0.7 : 1}
        />
      ))}
    </svg>
  );
}

// Tech used on the project, as small keyword tags.
function StackTags({ stack }: { stack?: string[] }) {
  if (!stack?.length) return null;
  return (
    <div className="tags">
      {stack.map((s) => (
        <span key={s} className="tag">
          {s}
        </span>
      ))}
    </div>
  );
}

function VisitButton({ href, primary }: { href: string; primary?: boolean }) {
  return (
    <a className={`btn ${primary ? "primary" : ""}`} href={href} target="_blank" rel="noopener noreferrer">
      Visit website <ArrowUpRight size={14} />
    </a>
  );
}

function FlipCard({ p, i, onZoom }: { p: CardData; i: number; onZoom: (p: CardData) => void }) {
  const [flipped, setFlipped] = useState(false);
  const backRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLButtonElement>(null);

  const flip = (to: boolean) => {
    setFlipped(to);
    // move focus to the face that just turned toward the viewer
    requestAnimationFrame(() => (to ? backRef.current?.focus() : frontRef.current?.focus()));
  };

  return (
    <article
      // flip state lives in a data attribute: RevealObserver adds `.in` to this element's classList,
      // and a React-managed className would wipe it on re-render
      className="flip"
      data-flipped={flipped}
      data-reveal
      style={{ "--d": `${(i % 3) * 90}ms` } as React.CSSProperties}
    >
      <div className="flip-inner">
        {/* front: screenshot + name */}
        <div className="flip-face flip-front" inert={flipped}>
          {/* one full-card button, laid over the content (a <button> can't hold headings) */}
          <button
            ref={frontRef}
            className="flip-cover"
            onClick={() => flip(true)}
            aria-label={`${p.name}: show details`}
          />
          <div className="flip-thumb">
            {p.hasImage && p.image ? (
              <Image src={p.image} alt="" fill sizes="(max-width: 480px) 100vw, (max-width: 760px) 50vw, 250px" />
            ) : (
              <Schematic seed={i} />
            )}
          </div>
          <div className="flip-body">
            <span className="flip-label">{p.label}</span>
            <h3>{p.name}</h3>
            <p>{p.tagline}</p>
            <StackTags stack={p.stack} />
            <div className="flip-front-foot">
              {/* sits above the full-card flip button, so it opens the site instead of flipping */}
              {p.href && <VisitButton href={p.href} />}
              <span className="flip-hint" aria-hidden="true">
                details <RotateCcw size={12} />
              </span>
            </div>
          </div>
        </div>

        {/* back: details */}
        <div
          ref={backRef}
          className="flip-face flip-back"
          inert={!flipped}
          tabIndex={-1}
          aria-label={`${p.name} details`}
        >
          <div className="flip-back-head">
            <span className="flip-label">{p.label}</span>
            <button className="flip-close" onClick={() => flip(false)} aria-label="Flip back">
              <RotateCcw size={14} />
            </button>
          </div>
          <h3>{p.name}</h3>
          <p className="flip-desc">{p.desc}</p>
          <StackTags stack={p.stack} />
          <div className="flip-actions">
            {p.href && <VisitButton href={p.href} primary />}
            {p.hasImage && (
              <button className="btn" onClick={() => onZoom(p)}>
                Screenshot <Maximize2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ProjectCards({ items }: { items: CardData[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState<CardData | null>(null);
  const [showAll, setShowAll] = useState(false);
  const featured = items.filter((p) => p.featured);
  const more = items.filter((p) => !p.featured);

  const toggleMore = () => {
    // collapsing from deep in the list: bring the section back into view
    if (showAll) document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setShowAll(!showAll);
  };

  const zoom = (p: CardData) => {
    setZoomed(p);
    dialog.current?.showModal();
  };

  return (
    <>
      <div className="flip-grid featured">
        {featured.map((p, i) => (
          <FlipCard key={p.name} p={p} i={i} onZoom={zoom} />
        ))}
      </div>

      {more.length > 0 && (
        <>
          {/* always mounted (just hidden) so RevealObserver sees these cards and animates them in when shown */}
          <div className="flip-grid more" id="more-projects" hidden={!showAll}>
            {more.map((p, i) => (
              <FlipCard key={p.name} p={p} i={i} onZoom={zoom} />
            ))}
          </div>
          <div className="more-row">
            <button className="btn more-btn" onClick={toggleMore} aria-expanded={showAll} aria-controls="more-projects">
              {showAll ? "Show fewer" : `View more projects · ${more.length}`}
              <ChevronDown size={15} className={showAll ? "up" : ""} />
            </button>
          </div>
        </>
      )}

      <dialog
        ref={dialog}
        className="lightbox"
        onClose={() => setZoomed(null)}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        aria-label={zoomed ? `${zoomed.name} screenshot` : "Screenshot"}
      >
        {zoomed?.image && (
          <figure>
            <Image
              src={zoomed.image}
              alt={`${zoomed.name} screenshot`}
              width={1128}
              height={630}
              sizes="min(1128px, 92vw)"
            />
            <figcaption>
              <strong>{zoomed.name}</strong>
              <span>{zoomed.label}</span>
            </figcaption>
          </figure>
        )}
        <button className="icon-btn lightbox-close" onClick={() => dialog.current?.close()} aria-label="Close">
          <X size={16} />
        </button>
      </dialog>
    </>
  );
}
