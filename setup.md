Building the Portfolio in Next.js — Setup Guide
This walks you through turning the HTML preview into your real Next.js project (D:\clean_work\portfolio), component by component. Follow it top to bottom.

The design is one dark/light theme, Fraunces + Inter + IBM Plex Mono, with a Work/Education tab, a timeline-style experience card, a 2-column projects grid with thumbnails, an interactive terminal, and a chat widget.

0. Where you are
You already ran create-next-app and have the project at D:\clean_work\portfolio with the App Router + Tailwind. From here:

cd D:\clean_work\portfolio
npm run dev
Keep that running in one terminal. Edit files in VS Code in another.

1. Install the two extra packages
We only need one for icons (optional) — the terminal and chat are plain React, no libraries.

npm install lucide-react
(That's it. No Framer Motion needed for this design — the animations are tiny CSS ones. Add it later only if you want fancier motion.)

2. Add the fonts
Next.js loads Google Fonts natively. Open src/app/layout.tsx and set them up:

import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", weight: ["400","500","600"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-body", weight: ["400","500","600"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400","500"] });

export const metadata: Metadata = {
  title: "Umair Tufail — Senior Full-Stack Engineer",
  description: "Laravel/PHP & AI-integrated backends. 4+ years, 50+ production platforms.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
3. Drop in the design tokens (colors)
Open src/app/globals.css. Keep the Tailwind import line at the top, then paste the :root color variables and base styles from the HTML file's <style> block (everything from :root{ --bg: ... } down through the base body, .wrap, etc.). These are your design tokens — every component reads from them.

Tip: paste the whole <style> contents into globals.css to start. It all works as-is. You can split it into per-component CSS modules later if you want; for a portfolio, one global stylesheet is completely fine and simpler.

4. Component structure
Create a src/components/ folder. We'll split the page into these:

src/
  app/
    page.tsx          ← assembles everything
    layout.tsx        ← fonts + metadata (done above)
    globals.css       ← tokens + styles
  components/
    Nav.tsx           ← top nav + theme toggle
    Hero.tsx          ← hi umair here 👋 + links + photo
    Experience.tsx    ← Work/Education tabs + timeline card
    Stack.tsx         ← grouped tech tags
    Projects.tsx      ← 2-col grid with thumbnails
    Terminal.tsx      ← interactive shell
    ChatWidget.tsx    ← Umair Support chat
    Footer.tsx
  data/
    content.ts        ← all your text/data in one place
Why a data/content.ts file: keep every piece of text (jobs, projects, stack, chat answers, terminal commands) in one file, so updating your portfolio later means editing data, not JSX. This is the single most useful habit for keeping it maintainable.

5. The data file
Create src/data/content.ts:

export const experience = [
  {
    logo: "N",
    when: "Mar 2025 — Present",
    role: "Senior Full-Stack Developer (TALL Stack)",
    org: "Navicosoft · Lahore",
    bullets: [
      "Own backend architecture for multi-tenant SaaS platforms serving thousands of concurrent tenants.",
      "Lead a team of backend engineers — code review, standards, mentoring on architecture.",
      "Optimized MySQL schemas and API performance to sub-100ms under peak load.",
    ],
  },
  {
    logo: "T",
    when: "Sep 2023 — Feb 2025",
    role: "Senior Backend Developer",
    org: "Techjoint Solutions · Remote, Canada",
    bullets: [
      "Managed projects end to end for the client's founders, fully remote.",
      "Owned AWS (EC2, S3, CloudFront, Route 53); CI/CD cut releases from hours to minutes.",
    ],
  },
  {
    logo: "V",
    when: "Jan 2023 — Sep 2023",
    role: "Junior PHP Laravel Developer",
    org: "Vebtual Limited · Lahore",
    bullets: [
      "Translated field workflows into digital tools; optimized MySQL and cut manual reporting.",
    ],
  },
];

export const education = [
  {
    logo: "S",
    when: "Graduated",
    role: "ADP, Computer Science",
    org: "Superior University · Lahore, Pakistan",
    bullets: [
      "Foundations in software engineering, data structures, and databases — the base four years of production systems were built on.",
    ],
  },
];

export const stack = [
  { title: "Core — my specialty", core: true, tags: ["PHP","Laravel (TALL)","MySQL","REST APIs","Multi-tenant","RBAC"] },
  { title: "Frontend", tags: ["React.js","Inertia.js","Livewire","Alpine.js","Blade","Tailwind"] },
  { title: "AI & automation", tags: ["OpenAI / Whisper","Claude API","Gemini","LangChain","RAG","Vector DBs"] },
  { title: "Cloud & infra", tags: ["AWS (EC2, S3, CloudFront)","cPanel / WHM","Redis","CI/CD","Linux","Git"] },
];

export const projects = [
  {
    name: "Lumenia CRM",
    image: "/projects/lumenia.png",   // put screenshots in /public/projects/
    badge: "● Live · lumeniacrm.com",
    href: "https://lumeniacrm.com",
    desc: "AI-powered lead-to-revenue CRM with paying customers — AI prospecting, Twilio dialer, auto-responders that qualify leads. Built solo.",
    stack: ["Laravel","React","Redis","Twilio"],
  },
  {
    name: "Domain & Hosting Platform",
    image: "/projects/domain.png",
    badge: "Navicosoft",
    desc: "A GoDaddy competitor with direct Verisign & CentralNic integration under ICANN — plus NWHMCS and Master IDP, a multi-tenant SSO.",
    stack: ["Laravel","Verisign","OpenID Connect"],
  },
  {
    name: "WhatsApp Commerce Assistant",
    image: "/projects/whatsapp.png",
    badge: "In progress",
    desc: "A RAG chatbot on Gemini over a vector-indexed catalog — checks stock, places the order, invoices, and issues credentials, no human step.",
    stack: ["Gemini","Vector DB","Laravel"],
  },
  {
    name: "911 Limo",
    image: "/projects/911.png",
    badge: "World Cup 2026",
    desc: "Ride-sharing backend + AWS — live tracking, in-app chat, dynamic fares. Carried live production traffic during the FIFA World Cup.",
    stack: ["WebSockets","AWS","Geolocation"],
  },
];

// chat answers
export const chatQA = [
  { q: "What does Umair specialize in?", a: "Laravel/PHP backends — specifically multi-tenant SaaS architecture — with AI layered in: RAG pipelines, vector databases, and LLM-integrated chat and voice. He builds the whole backend and self-hosts it." },
  { q: "Most impressive project?", a: "Lumenia CRM — a live, revenue-generating SaaS he architected solo, with paying customers in multiple countries. Or the domain platform integrating directly with Verisign & CentralNic under ICANN." },
  { q: "Is he open to work?", a: "Yes — senior/lead engineering roles, plus select contract work in Laravel, multi-tenant systems, or AI integration. Best reached at mumairtufail786@gmail.com." },
  { q: "What AI has he shipped?", a: "OpenAI (incl. Whisper for voice), Claude, and Gemini — in production. A WhatsApp RAG assistant, voice navigation on a construction app, and AI auto-responders inside Lumenia CRM." },
  { q: "Where is he based?", a: "Lahore, Pakistan 🇵🇰 — and he's delivered for clients across Canada, the UAE, Qatar, and the US, working directly with founders." },
];
6. Porting each piece
Each component maps 1:1 to a chunk of the HTML. The pattern for all of them:

Copy the HTML markup into the component's return (...).
Change class= → className=.
Change inline style="..." strings → style={{ ... }} objects (or move to CSS).
Anything interactive (tabs, terminal, chat, theme toggle) uses React state instead of the vanilla JS.
Below are the two tricky interactive ones fully converted — the rest (Nav, Hero, Stack, Projects, Footer) are just static markup you paste and rename class→className.

Experience.tsx (tabs + timeline)
"use client";
import { useState } from "react";
import { experience, education } from "@/data/content";

export default function Experience() {
  const [tab, setTab] = useState<"work" | "edu">("work");
  const list = tab === "work" ? experience : education;
  return (
    <>
      <div className="tabs">
        <button className={`tab ${tab==="work"?"active":""}`} onClick={()=>setTab("work")}>Work</button>
        <button className={`tab ${tab==="edu"?"active":""}`} onClick={()=>setTab("edu")}>Education</button>
      </div>
      <div className="exp">
        {list.map((e,i)=>(
          <div className="entry" key={i}>
            <div className="logo">{e.logo}</div>
            <div>
              <div className="when">{e.when}</div>
              <div className="role">{e.role}</div>
              <div className="org">{e.org}</div>
              <ul>{e.bullets.map((b,j)=><li key={j}>{b}</li>)}</ul>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
Terminal.tsx (interactive shell)
"use client";
import { useState, useRef, useEffect } from "react";

type Line = { type: "out" | "cmd"; html: string };

const commands: Record<string, () => string | null> = {
  help: () => `Available commands:
  whoami      who Umair is
  stack       the tech I build with
  projects    things I've shipped
  experience  where I've worked
  contact     how to reach me
  hire        (try it)
  clear       clear the screen`,
  whoami: () => `Muhammad Umair Tufail — Senior Full-Stack Engineer, Lahore 🇵🇰
Laravel/PHP + AI-integrated backends. 4+ yrs, 50+ production platforms.`,
  stack: () => `core:     PHP · Laravel · MySQL · Multi-tenant · RBAC
frontend: React · Inertia · Livewire · Alpine · Tailwind
ai:       OpenAI/Whisper · Claude · Gemini · RAG · Vector DBs
cloud:    AWS · Redis · CI/CD · Linux · cPanel/WHM`,
  projects: () => `Lumenia CRM        live AI CRM → lumeniacrm.com
Domain Platform    direct Verisign/CentralNic, ICANN
WhatsApp Assistant RAG commerce bot on Gemini
911 Limo           ride-share backend, World Cup 2026`,
  experience: () => `Navicosoft     Senior Full-Stack Dev   Mar 2025 – now
Techjoint (CA) Senior Backend Dev      Sep 2023 – Feb 2025
Vebtual        Junior Laravel Dev      Jan 2023 – Sep 2023`,
  contact: () => `email:    mumairtufail786@gmail.com
github:   github.com/mumairtufail
linkedin: linkedin.com/in/mumairtufail`,
  hire: () => `$ sudo hire umair
[ok] great decision detected ✅
→ email mumairtufail786@gmail.com and let's build something.`,
  ls: () => `about.md  projects/  stack.txt  resume.pdf  secrets/ (permission denied)`,
  clear: () => null,
};

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { type: "out", html: "Last login: connected as guest. Type help to see what I can do." },
  ]);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight); }, [lines]);

  function run(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    const val = input.trim();
    const key = val.split(" ")[0].toLowerCase();
    const next: Line[] = [...lines, { type: "cmd", html: `guest@umair:~$ ${val}` }];
    if (val !== "") {
      if (key === "clear") { setLines([]); setInput(""); return; }
      const out = commands[key]?.() ?? `command not found: ${val}. try help`;
      if (out) next.push({ type: "out", html: out });
    }
    setLines(next);
    setInput("");
  }

  return (
    <section className="block" id="terminal">
      <div className="h-row"><h2>Poke around</h2><span className="hint">type 'help' ↵</span></div>
      <div className="term" onClick={() => inputRef.current?.focus()}>
        <div className="term-bar">
          <span className="dot r" /><span className="dot y" /><span className="dot g" />
          <span className="title">guest@umair: ~</span>
        </div>
        <div className="term-body" ref={bodyRef}>
          {lines.map((l, i) => (
            <div key={i} className={l.type === "cmd" ? "" : "out"} style={{ whiteSpace: "pre-wrap" }}>
              {l.type === "cmd" ? <><span style={{ color: "var(--term-green)" }}>guest@umair:~$</span> {l.html.replace("guest@umair:~$ ", "")}</> : l.html}
            </div>
          ))}
          <div className="term-input-line">
            <span className="prompt" style={{ color: "var(--term-green)" }}>guest@umair:~$</span>
            <input ref={inputRef} className="term-input" value={input}
              onChange={(e) => setInput(e.target.value)} onKeyDown={run}
              autoComplete="off" spellCheck={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
The Nav (theme toggle), Hero, Stack, Projects, ChatWidget follow the same conversion — paste markup, rename class, and for the theme toggle + chat use useState exactly like the tab example. If you want, I can hand you each of those five components fully written out too — just ask.

7. Assemble the page
src/app/page.tsx:

import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Stack from "@/components/Stack";
import Projects from "@/components/Projects";
import Terminal from "@/components/Terminal";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <div className="wrap" id="top">
        <Hero />
        <Experience />
        <Stack />
        <Projects />
        <Terminal />
        <Footer />
      </div>
      <ChatWidget />
    </>
  );
}
8. Your images
Make a folder public/projects/
Drop your screenshots in as lumenia.png, domain.png, etc. (match the image: paths in content.ts)
In Projects.tsx, render <img src={p.image} .../> inside the thumbnail. For projects with no screenshot, keep the schematic SVG as a fallback.
Your profile photo: put it at public/me.jpg and use it in the Hero photo card (190×228 works well).

9. Run and check
npm run dev
Open http://localhost:3000. Work through the pre-launch checklist from the build-spec doc (location visible, links work + open in new tab, responsive, no dead links).

10. Deploy (free)
When it looks right:

Push to GitHub: create a repo portfolio under your account, then
git add .
git commit -m "portfolio"
git branch -M main
git remote add origin https://github.com/mumairtufail/portfolio.git
git push -u origin main
Go to vercel.com, sign in with GitHub, "Add New Project", pick the repo, hit Deploy. Done — live in ~1 minute with a free *.vercel.app URL. Point your own domain at it later if you want.
Later upgrade: make the chat a real AI
Right now the chat uses canned answers. Once the site's live, you can wire it to a real LLM over your resume (turning the gimmick into a genuine demo of your RAG work):

Add an API route src/app/api/chat/route.ts that calls the Anthropic or OpenAI API with your resume as context.
Have ChatWidget POST the user's question to it and stream back the answer.
Keep your API key in .env.local (never commit it).
That's the one feature that would make your portfolio genuinely stand out — an AI assistant you built, answering questions about you, live. Ask me when you're ready and I'll write that route.

Quick reference — file checklist
 layout.tsx — fonts + metadata
 globals.css — tokens + styles pasted
 data/content.ts — all your content
 components/Nav.tsx (theme toggle)
 components/Hero.tsx
 components/Experience.tsx (tabs + timeline)
 components/Stack.tsx
 components/Projects.tsx (thumbnails)
 components/Terminal.tsx (interactive)
 components/ChatWidget.tsx
 components/Footer.tsx
 page.tsx — assembles all
 public/projects/* — screenshots
 public/me.jpg — your photo