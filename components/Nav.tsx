"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import Logo from "@/components/Logo";

const SECTIONS = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "play", label: "Play" },
  { id: "contact", label: "Contact" },
];

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

function applyTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

// The theme lives on <html data-theme> (restored before paint by layout.tsx); CSS shows the matching icon.
// Where supported, the new theme spreads out in a circle from the toggle button.
function toggleTheme(e: React.MouseEvent<HTMLButtonElement>) {
  const doc = document as ViewTransitionDoc;
  if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return applyTheme();
  const r = e.currentTarget.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  doc.startViewTransition(applyTheme).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 550, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}

export default function Nav() {
  const [active, setActive] = useState("");

  // highlight the section currently in the middle of the screen
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#top" className="brand" aria-label="Umair Tufail, back to top">
          <Logo />
        </a>
        <div className="nav-links">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={active === s.id ? "active" : ""}>
              {s.label}
            </a>
          ))}
          <button className="icon-btn theme-toggle" onClick={toggleTheme} aria-label="Toggle light/dark theme">
            <Sun size={16} className="icon-sun" />
            <Moon size={16} className="icon-moon" />
          </button>
        </div>
      </div>
    </nav>
  );
}
