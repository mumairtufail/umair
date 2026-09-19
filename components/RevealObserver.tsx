"use client";
import { useEffect } from "react";

// Adds `.in` to each [data-reveal] element the first time it scrolls into view; the CSS does the animating.
// Elements start hidden only when <html> has the `reveal` class (set in layout.tsx before paint).
// Elements mounted later (e.g. switching tabs re-creates a panel) are picked up by a MutationObserver,
// otherwise they would stay hidden forever.
export default function RevealObserver() {
  useEffect(() => {
    const animate = document.documentElement.classList.contains("reveal") && "IntersectionObserver" in window;

    const io = animate
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              entry.target.classList.add("in");
              io!.unobserve(entry.target);
            }
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
        )
      : null;

    const track = (el: Element) => {
      if (el.classList.contains("in")) return;
      if (io) io.observe(el);
      else el.classList.add("in");
    };
    const scan = (root: ParentNode) => {
      if (root instanceof Element && root.matches("[data-reveal]")) track(root);
      root.querySelectorAll("[data-reveal]").forEach(track);
    };

    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && scan(n));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, []);

  return null;
}
