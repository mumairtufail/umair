"use client";
import { useState } from "react";
import { ArrowUpRight, Check, Copy, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { profile } from "@/data/content";

type Item = {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  copy?: string; // shown on the copy button; omitted = no copy button
  external?: boolean;
};

const items: Item[] = [
  {
    icon: <Mail size={16} />,
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    copy: profile.email,
  },
  {
    icon: <Phone size={16} />,
    label: "Phone",
    value: profile.phone,
    href: `tel:${profile.phoneHref}`,
    copy: profile.phoneHref,
  },
  {
    icon: <MessageCircle size={16} />,
    label: "WhatsApp",
    value: "Message me",
    href: `https://wa.me/${profile.phoneHref.replace("+", "")}`,
    external: true,
  },
  {
    icon: <MapPin size={16} />,
    label: "Based in",
    value: profile.location,
    href: "https://maps.google.com/?q=Lahore,Pakistan",
    external: true,
  },
];

// lucide dropped brand icons, so these use the same arrow as the hero buttons
const socials = [
  { label: "GitHub", href: "https://github.com/mumairtufail" },
  { label: "LinkedIn", href: "https://linkedin.com/in/mumairtufail" },
];

export default function Contact() {
  const [copied, setCopied] = useState("");

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      /* clipboard blocked (http, old browser): the link still works */
    }
  };

  return (
    <section className="block" id="contact">
      <div className="h-row" data-reveal>
        <h2>Contact</h2>
        <span className="hint">open to senior &amp; lead roles</span>
      </div>
      <div className="contact-grid">
        {items.map((it, i) => (
          <div key={it.label} className="contact-card" data-reveal style={{ "--d": `${(i % 2) * 80}ms` } as React.CSSProperties}>
            <a
              className="contact-main"
              href={it.href}
              {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <span className="contact-icon">{it.icon}</span>
              <span className="contact-text">
                <span className="contact-label">{it.label}</span>
                <span className="contact-value">{it.value}</span>
              </span>
              {it.external && <ArrowUpRight size={14} className="contact-go" />}
            </a>
            {it.copy && (
              <button
                className="contact-copy"
                onClick={() => copy(it.copy!)}
                aria-label={`Copy ${it.label.toLowerCase()}`}
              >
                {copied === it.copy ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="contact-foot" data-reveal>
        <a className="btn primary" href={`mailto:${profile.email}`}>
          Email me <ArrowUpRight size={14} />
        </a>
        {socials.map((s) => (
          <a key={s.label} className="btn" href={s.href} target="_blank" rel="noopener noreferrer">
            {s.label} <ArrowUpRight size={14} />
          </a>
        ))}
      </div>
    </section>
  );
}
