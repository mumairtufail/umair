import { stack } from "@/data/content";

export default function Stack() {
  return (
    <section className="block" id="stack">
      <div className="h-row" data-reveal>
        <h2>Stack</h2>
        <span className="hint">what I build with</span>
      </div>
      <div className="stack-grid">
        {stack.map((g, i) => (
          <div
            key={g.title}
            className={`stack-group ${g.core ? "core" : ""}`}
            data-reveal
            style={{ "--d": `${i * 80}ms` } as React.CSSProperties}
          >
            <h3>{g.title}</h3>
            <div className="tags">
              {g.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
