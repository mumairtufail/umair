"use client";
import { useEffect } from "react";

// Adds `.in` to each [data-reveal] element the first time it scrolls into view; the CSS does the animating.
// Elements start hidden only when <html> has the `reveal` class (set in layout.tsx before paint).
export default function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!document.documentElement.classList.contains("reveal") || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
