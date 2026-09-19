import { stack } from "@/data/content";

// Compact tech stack: one row per category, label on the left, keyword tags on the right.
// Shown as the "Stack" tab inside the Experience section.
export default function StackList() {
  return (
    <div className="stack-list">
      {stack.map((g, i) => (
        <div key={g.title} className={`stack-row ${g.core ? "core" : ""}`} style={{ "--i": i } as React.CSSProperties}>
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
  );
}
