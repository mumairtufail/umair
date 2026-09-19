"use client";
import { useState } from "react";
import Image from "next/image";
import { experience, education, type Entry } from "@/data/content";

const Bullets = ({ items }: { items: string[] }) => (
  <ul>
    {items.map((b) => (
      <li key={b}>{b}</li>
    ))}
  </ul>
);

function SingleRole({ entry }: { entry: Entry }) {
  const [role] = entry.roles;
  return (
    <div>
      <div className="when">{role.when}</div>
      <div className="role">{role.title}</div>
      <div className="org">
        {entry.org} · {entry.place}
      </div>
      <Bullets items={role.bullets} />
    </div>
  );
}

// Several roles at one company (newest first): company header + a mini-timeline of roles.
function MultiRole({ entry }: { entry: Entry }) {
  const newest = entry.roles[0];
  const oldest = entry.roles[entry.roles.length - 1];
  const span = `${oldest.when.split(" — ")[0]} — ${newest.when.split(" — ").at(-1)}`;
  return (
    <div>
      <div className="when">{span}</div>
      <div className="role">{entry.org}</div>
      <div className="org">
        {entry.place} · {entry.roles.length} roles
      </div>
      <ol className="roles">
        {entry.roles.map((r, i) => (
          <li key={r.title} className={i === 0 ? "current" : ""}>
            <div className="sub-role">
              {r.title}
              {i === 0 && <span className="promo">promoted</span>}
            </div>
            <div className="when">{r.when}</div>
            <Bullets items={r.bullets} />
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Experience() {
  const [tab, setTab] = useState<"work" | "edu">("work");
  const list = tab === "work" ? experience : education;

  return (
    <section className="block" id="experience">
      <div className="h-row" data-reveal>
        <h2>Experience</h2>
      </div>
      <div className="tabs" role="tablist" data-active={tab === "work" ? 0 : 1} data-reveal>
        <button
          role="tab"
          aria-selected={tab === "work"}
          className={`tab ${tab === "work" ? "active" : ""}`}
          onClick={() => setTab("work")}
        >
          Work
        </button>
        <button
          role="tab"
          aria-selected={tab === "edu"}
          className={`tab ${tab === "edu" ? "active" : ""}`}
          onClick={() => setTab("edu")}
        >
          Education
        </button>
      </div>
      <div className="exp" data-reveal>
        {list.map((e, i) => (
          <div className="entry" key={`${tab}-${e.org}`} style={{ "--i": i } as React.CSSProperties}>
            {e.logoSrc ? (
              <div className="logo has-img">
                <Image src={e.logoSrc} alt={`${e.org} logo`} width={96} height={96} />
              </div>
            ) : (
              <div className="logo" aria-hidden="true">
                {e.logo}
              </div>
            )}
            {e.roles.length === 1 ? <SingleRole entry={e} /> : <MultiRole entry={e} />}
          </div>
        ))}
      </div>
    </section>
  );
}
