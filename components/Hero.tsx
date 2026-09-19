import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/content";
import { publicFileExists } from "@/lib/publicFile";

export default function Hero() {
  const hasPhoto = publicFileExists(profile.photo);

  return (
    <header className="hero">
      <div>
        <h1>
          hi {profile.short.toLowerCase()} here <span className="wave">👋</span>
        </h1>
        <div className="tagline">{profile.title} · Laravel/PHP + AI</div>
        <p className="summary">{profile.summary}</p>
        <p className="meta mono">
          {profile.location}
          <span className="sep">/</span>
          UTC+5
          <span className="sep">/</span>
          <span className="open">open to senior &amp; lead roles</span>
        </p>
        <div className="links">
          {profile.links.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              className={`btn ${i === 0 ? "primary" : ""}`}
              {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {l.label} <ArrowUpRight size={14} />
            </a>
          ))}
        </div>
      </div>
      <div className="photo">
        {hasPhoto ? (
          <Image src={profile.photo} alt={profile.name} fill sizes="190px" priority />
        ) : (
          "MU"
        )}
      </div>
    </header>
  );
}
