import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/data/content";
import { publicFileExists } from "@/lib/publicFile";

// Schematic "app window" shown until a screenshot exists in /public/projects/.
function Schematic({ seed }: { seed: number }) {
  const bars = [0.8, 0.55, 0.7, 0.4].map((w, i) => ((w + seed * 0.13 * (i + 1)) % 0.5) + 0.35);
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="24" y="36" width="272" height="148" rx="10" fill="var(--bg-elev)" stroke="var(--line)" />
      <rect x="24" y="36" width="272" height="20" rx="10" fill="var(--bg)" />
      <circle cx="38" cy="46" r="3" fill="var(--faint)" />
      <circle cx="48" cy="46" r="3" fill="var(--faint)" />
      <circle cx="58" cy="46" r="3" fill="var(--faint)" />
      <rect x="36" y="68" width="60" height="104" rx="6" fill="var(--bg-soft)" />
      {bars.map((w, i) => (
        <rect
          key={i}
          x="108"
          y={72 + i * 24}
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

function Card({ p, i }: { p: Project; i: number }) {
  const hasImage = publicFileExists(p.image);
  const inner = (
    <>
      <div className="thumb">
        {hasImage ? (
          <Image src={p.image} alt={`${p.name} screenshot`} fill sizes="(max-width: 640px) 100vw, 360px" />
        ) : (
          <Schematic seed={i} />
        )}
        <span className="badge">{p.badge}</span>
      </div>
      <div className="project-body">
        <h3>
          {p.name}
          {p.href && <ArrowUpRight size={16} />}
        </h3>
        <p>{p.desc}</p>
        <div className="tags">
          {p.stack.map((s) => (
            <span key={s} className="tag">
              {s}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  // staggered scroll reveal, two cards per row
  const reveal = { "data-reveal": true, style: { "--d": `${(i % 2) * 100}ms` } as React.CSSProperties };
  return p.href ? (
    <a className="project" href={p.href} target="_blank" rel="noopener noreferrer" {...reveal}>
      {inner}
    </a>
  ) : (
    <div className="project" {...reveal}>
      {inner}
    </div>
  );
}

export default function Projects() {
  return (
    <section className="block" id="projects">
      <div className="h-row" data-reveal>
        <h2>Projects</h2>
        <span className="hint">things I&apos;ve shipped</span>
      </div>
      <div className="projects">
        {projects.map((p, i) => (
          <Card key={p.name} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}
