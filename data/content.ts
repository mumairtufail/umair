export const profile = {
  name: "Muhammad Umair Tufail",
  short: "Umair",
  title: "Senior Full-Stack Engineer",
  location: "Lahore, Pakistan",
  photo: "/me.jpg", // put your photo at public/me.jpg
  summary:
    "I build Laravel/PHP backends — multi-tenant SaaS, with AI layered in: RAG pipelines, vector search, and LLM-powered chat and voice. 4+ years, 50+ production platforms, working directly with founders.",
  links: [
    { label: "Email", href: "mailto:mumairtufail786@gmail.com" },
    { label: "GitHub", href: "https://github.com/mumairtufail" },
    { label: "LinkedIn", href: "https://linkedin.com/in/mumairtufail" },
  ],
  email: "mumairtufail786@gmail.com",
};

export type Role = {
  title: string;
  when: string;
  bullets: string[];
};

// One entry per company / school. Several roles at the same place (e.g. a promotion) are
// listed newest first and shown as a mini-timeline under the company.
export type Entry = {
  logo: string; // letter(s) shown when there is no image
  logoSrc?: string; // square image in public/logos/ (built by: npm run logos)
  org: string;
  place: string;
  roles: Role[];
};

export const experience: Entry[] = [
  {
    logo: "N",
    logoSrc: "/logos/navicosoft.png",
    org: "Navicosoft",
    place: "Lahore, Pakistan",
    roles: [
      {
        title: "Senior Full-Stack Developer (TALL Stack)",
        when: "Mar 2025 — Present",
        bullets: [
          "Own backend architecture and delivery for multi-tenant SaaS platforms serving thousands of concurrent tenants.",
          "Lead a team of backend engineers through architecture, code review, and mentoring — primary technical contact for stakeholders.",
          "Own delivery end to end, from sprint planning to post-release support; MySQL and API performance tuned to sub-100ms at peak.",
        ],
      },
    ],
  },
  {
    logo: "T",
    logoSrc: "/logos/techjoint.png",
    org: "Tech Joint Solutions",
    place: "Remote",
    roles: [
      {
        title: "Senior Software Engineer",
        when: "Sep 2024 — Mar 2025",
        bullets: [
          "Led backend development for SaaS and enterprise apps on Laravel, owning AWS (EC2, S3, CloudFront, Route 53) end to end.",
          "Built CI/CD pipelines that cut release cycles from hours to minutes.",
          "Ran the team's code review — no merge without an approved PR — and introduced AI-assisted development workflows.",
        ],
      },
      {
        title: "Junior Software Engineer",
        when: "Sep 2022 — Sep 2024",
        bullets: [
          "Built REST APIs, database structures, and business logic with Laravel, PHP, and Node.js.",
          "Worked directly with site managers to turn on-ground field workflows into digital tools.",
          "Optimized MySQL queries and backend logic, cutting manual reporting for field teams.",
        ],
      },
    ],
  },
];

export const education: Entry[] = [
  {
    logo: "VU",
    logoSrc: "/logos/vu.png",
    org: "Virtual University of Pakistan",
    place: "Pakistan",
    roles: [
      {
        title: "BS, Computer Science",
        when: "Latest",
        bullets: ["Bachelor's in Computer Science — the next step after the ADP."],
      },
    ],
  },
  {
    logo: "S",
    logoSrc: "/logos/superior.png",
    org: "Superior University",
    place: "Lahore, Pakistan",
    roles: [
      {
        title: "ADP, Computer Science",
        when: "Graduated",
        bullets: [
          "Foundations in software engineering, data structures, and databases — the base four years of production systems were built on.",
        ],
      },
    ],
  },
];

export const stack = [
  { title: "Core — my specialty", core: true, tags: ["PHP", "Laravel (TALL)", "MySQL", "REST APIs", "Multi-tenant", "RBAC"] },
  { title: "Frontend", tags: ["React.js", "Inertia.js", "Livewire", "Alpine.js", "Blade", "Tailwind"] },
  { title: "AI & automation", tags: ["OpenAI / Whisper", "Claude API", "Gemini", "LangChain", "RAG", "Vector DBs"] },
  { title: "Cloud & infra", tags: ["AWS (EC2, S3, CloudFront)", "cPanel / WHM", "Redis", "CI/CD", "Linux", "Git"] },
];

export type Project = {
  name: string;
  image: string; // put screenshots in /public/projects/ — a schematic is shown until the file exists
  badge: string;
  href?: string;
  desc: string;
  stack: string[];
};

export const projects: Project[] = [
  {
    name: "Lumenia CRM",
    image: "/projects/lumenia.png",
    badge: "● Live · lumeniacrm.com",
    href: "https://lumeniacrm.com",
    desc: "AI-powered lead-to-revenue CRM with paying customers — AI prospecting, Twilio dialer, auto-responders that qualify leads. Built solo.",
    stack: ["Laravel", "React", "Redis", "Twilio"],
  },
  {
    name: "Domain & Hosting Platform",
    image: "/projects/domain.png",
    badge: "Navicosoft",
    desc: "A GoDaddy competitor with direct Verisign & CentralNic integration under ICANN — plus NWHMCS and Master IDP, a multi-tenant SSO.",
    stack: ["Laravel", "Verisign", "OpenID Connect"],
  },
  {
    name: "WhatsApp Commerce Assistant",
    image: "/projects/whatsapp.png",
    badge: "In progress",
    desc: "A RAG chatbot on Gemini over a vector-indexed catalog — checks stock, places the order, invoices, and issues credentials, no human step.",
    stack: ["Gemini", "Vector DB", "Laravel"],
  },
  {
    name: "911 Limo",
    image: "/projects/911.png",
    badge: "World Cup 2026",
    desc: "Ride-sharing backend + AWS — live tracking, in-app chat, dynamic fares. Carried live production traffic during the FIFA World Cup.",
    stack: ["WebSockets", "AWS", "Geolocation"],
  },
];

// chat answers
export const chatQA = [
  { q: "What does Umair specialize in?", a: "Laravel/PHP backends — specifically multi-tenant SaaS architecture — with AI layered in: RAG pipelines, vector databases, and LLM-integrated chat and voice. He builds the whole backend and self-hosts it." },
  { q: "Most impressive project?", a: "Lumenia CRM — a live, revenue-generating SaaS he architected solo, with paying customers in multiple countries. Or the domain platform integrating directly with Verisign & CentralNic under ICANN." },
  { q: "Is he open to work?", a: "Yes — senior/lead engineering roles, plus select contract work in Laravel, multi-tenant systems, or AI integration. Best reached at mumairtufail786@gmail.com." },
  { q: "What AI has he shipped?", a: "OpenAI (incl. Whisper for voice), Claude, and Gemini — in production. A WhatsApp RAG assistant, voice navigation on a construction app, and AI auto-responders inside Lumenia CRM." },
  { q: "Where is he based?", a: "Lahore, Pakistan — and he's delivered for clients across Canada, the UAE, Qatar, and the US, working directly with founders." },
];

// terminal commands
export const terminalCommands: Record<string, string> = {
  help: `Available commands:
  whoami      who Umair is
  stack       the tech I build with
  projects    things I've shipped
  experience  where I've worked
  contact     how to reach me
  hire        (try it)
  clear       clear the screen`,
  whoami: `Muhammad Umair Tufail — Senior Full-Stack Engineer, Lahore, Pakistan
Laravel/PHP + AI-integrated backends. 4+ yrs, 50+ production platforms.`,
  stack: `core:     PHP · Laravel · MySQL · Multi-tenant · RBAC
frontend: React · Inertia · Livewire · Alpine · Tailwind
ai:       OpenAI/Whisper · Claude · Gemini · RAG · Vector DBs
cloud:    AWS · Redis · CI/CD · Linux · cPanel/WHM`,
  projects: `Lumenia CRM        live AI CRM → lumeniacrm.com
Domain Platform    direct Verisign/CentralNic, ICANN
WhatsApp Assistant RAG commerce bot on Gemini
911 Limo           ride-share backend, World Cup 2026`,
  experience: `Navicosoft   Senior Full-Stack Dev      Mar 2025 – now
Tech Joint   Senior Software Engineer   Sep 2024 – Mar 2025
Tech Joint   Junior Software Engineer   Sep 2022 – Sep 2024`,
  contact: `email:    mumairtufail786@gmail.com
github:   github.com/mumairtufail
linkedin: linkedin.com/in/mumairtufail`,
  hire: `$ sudo hire umair
[ok] great decision detected ✅
→ email mumairtufail786@gmail.com and let's build something.`,
  ls: `about.md  projects/  stack.txt  resume.pdf  secrets/ (permission denied)`,
};

// typing test — plain English sentences
export const typingSentences = [
  "The quick brown fox jumps over the lazy dog while the sun sets behind the hills.",
  "Good software is built one small step at a time, with care and a lot of coffee.",
  "She opened the window, took a deep breath, and started writing the first line.",
  "Every expert was once a beginner who simply refused to give up.",
  "The best way to learn something new is to build a small project with it.",
  "We walked to the market, bought fresh bread, and talked about our plans for the week.",
  "Clear code is like a good story: easy to follow and hard to forget.",
  "A quiet morning, a warm cup of tea, and a list of problems waiting to be solved.",
  "Practice a little every day and you will be surprised how fast you improve.",
  "The old library was full of books, dust, and the soft sound of turning pages.",
];
