import { profile } from "@/data/content";

export default function Footer() {
  return (
    <footer className="footer" data-reveal>
      <span>
        © {new Date().getFullYear()} {profile.name} · {profile.location}
      </span>
      <div className="footer-links">
        {profile.links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {l.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
