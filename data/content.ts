export const profile = {
  name: "Muhammad Umair Tufail",
  short: "Umair",
  title: "Senior Full-Stack Engineer",
  location: "Lahore, Pakistan",
  photo: "/me.jpg", // put your photo at public/me.jpg
  summary:
    "I build Laravel/PHP backends for multi-tenant SaaS, with AI layered in: RAG pipelines, vector search, and LLM-powered chat and voice. 4+ years, 50+ production platforms, working directly with founders.",
  links: [
    { label: "Email", href: "mailto:mumairtufail786@gmail.com" },
    { label: "GitHub", href: "https://github.com/mumairtufail" },
    { label: "LinkedIn", href: "https://linkedin.com/in/mumairtufail" },
  ],
  email: "mumairtufail786@gmail.com",
  phone: "+92 335 4455494", // shown as written; phoneHref is the dialable form
  phoneHref: "+923354455494",
  resume: "/umair-tufail-resume.pdf", // downloadable CV in /public
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
    place: "Docklands, Victoria, Australia",
    roles: [
      {
        title: "Senior Backend Developer",
        when: "Mar 2025 to Jun 2026",
        bullets: [
          "Built large-scale SaaS and multi-tenant platforms in the domain and hosting ecosystem — WHMCS-style reseller and sub-reseller architectures, WHOIS domain search, ordering and billing workflows, and backend automation.",
          "Designed and maintained API-driven backend services, optimized database performance, and supported secure, scalable AWS deployments.",
          "Led a team of backend engineers through system design, code review, and mentoring, running a PR-based workflow where every change is approved before it merges.",
          "Partnered with frontend teams on mobile-responsive, analytics-enabled features, with a focus on performance, stability, and clean architecture.",
        ],
      },
    ],
  },
  {
    logo: "T",
    logoSrc: "/logos/techjoint.png",
    org: "Tech Joint Solutions",
    place: "Remote · Canada",
    roles: [
      {
        title: "Senior Software Engineer",
        when: "Sep 2024 to Mar 2025",
        bullets: [
          "Led projects from scratch to final delivery, handling client communication directly: requirements, updates, and sign-off.",
          "Managed a cross-functional team of backend, frontend, and mobile app developers plus a graphic designer.",
          "Built RESTful APIs on Laravel, optimized database performance, and owned AWS deployments (EC2, S3, CloudFront, Route 53) with CI/CD that cut releases from hours to minutes.",
          "Ran the team's code review (no merge without an approved PR) and introduced AI-assisted development workflows.",
        ],
      },
      {
        title: "Junior Software Engineer",
        when: "Sep 2022 to Sep 2024",
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
        when: "",
        bullets: [],
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
        when: "",
        bullets: [],
      },
    ],
  },
];

// Shown as compact rows: label on the left, keyword tags on the right. `core` gets the accent color.
export const stack = [
  { title: "Core", core: true, tags: ["PHP", "Laravel (TALL)", "MySQL", "REST APIs", "Multi-tenant", "RBAC"] },
  { title: "Frontend", tags: ["React", "Inertia.js", "Livewire", "Alpine.js", "Blade", "Tailwind"] },
  { title: "AI & LLMs", tags: ["OpenAI", "Whisper", "Claude", "Gemini", "LangChain", "RAG", "Qdrant", "FastAPI"] },
  {
    title: "Integrations",
    tags: ["Meta WhatsApp API", "Shopify", "Twilio", "Amadeus", "Google Places", "Verisign & CentralNic"],
  },
  { title: "Payments & finance", tags: ["Stripe", "PayPal", "QuickBooks", "Cryptomus", "Blockonomics"] },
  { title: "Auth & real-time", tags: ["SSO (OpenID Connect)", "Firebase", "Pusher", "Socket.io"] },
  { title: "Cloud & DevOps", tags: ["AWS", "Redis", "CI/CD", "Linux", "cPanel / WHM", "Git"] },
];

// Project cards flip on click: the front shows the screenshot, the back the details.
export type Project = {
  name: string;
  label: string; // small line above the name — status or sector
  tagline: string; // one line on the front of the card
  desc: string; // full description on the back
  stack?: string[]; // tech used — omit if unknown
  href?: string; // project website: shows a "Visit website" button on both faces
  image?: string; // screenshot in /public/projects/ — a schematic is drawn until the file exists
  featured?: boolean; // shown up front; everything else is behind "View more"
};

// All projects, in display order. `featured` ones show first (2×2); the rest sit behind "View more" (3-column grid).
export const projects: Project[] = [
  {
    name: "Domain & Hosting Platform",
    featured: true,
    label: "ICANN Accredited · Navicosoft",
    tagline: "A multi-tenant platform where resellers sell and manage domains across 618+ TLDs, connected directly to Verisign, CentralNic and Google.",
    desc: "Domain selling platform built for Navicosoft, an ICANN accredited registrar. Resellers register, transfer, and manage 618+ TLDs through direct registry integrations with Verisign, CentralNic, and Google, on a multi-tenant reseller architecture. It also includes AI-driven domain search, a multi-method payment stack with crypto, and Master IDP, a multi-tenant SSO unifying WHMCS, reseller, and HR platforms.",
    stack: ["Laravel", "React", "Verisign", "CentralNic", "Google Registry", "WHMCS", "OpenID Connect"],
    href: "https://resellerfrontend.navicosoft.com",
    image: "/projects/domainhosting.png",
  },
  {
    name: "DigiBot",
    featured: true,
    label: "WhatsApp RAG · Commercial",
    tagline: "An AI assistant on WhatsApp that answers customers, takes orders, updates stock and opens support tickets on its own.",
    desc: "A commercial WhatsApp RAG pipeline on the Meta WhatsApp API. It answers customer queries from a Qdrant vector index, creates support tickets automatically, books orders and decrements stock, and keeps reseller and customer pricing separate, with full analytics and reporting.",
    stack: ["Laravel (TALL)", "Meta WhatsApp API", "OpenAI", "Qdrant", "MySQL"],
    image: "/projects/whatsapp_rag.png",
  },
  {
    name: "KSA Drop",
    featured: true,
    label: "Dropshipping · UAE",
    tagline: "A CRM and Shopify app for a dropshipping company, giving each customer their own login and automating every order.",
    desc: "A CRM and Shopify app for a UAE dropshipping company. Customers get their own separate login, orders are managed in one place, and the Shopify connection automates the order workflow.",
    stack: ["Shopify app", "CRM"],
    href: "https://ksadrop.com",
    image: "/projects/ksadrop.jpg",
  },
  {
    name: "Lumenia CRM",
    featured: true,
    label: "AI CRM · SaaS",
    tagline: "An AI sales CRM that finds leads, calls them from a built-in dialer and qualifies inbound leads with automatic replies.",
    desc: "Independently architected an AI-powered CRM with paying customers across multiple countries: an AI prospecting engine, a Twilio softphone dialer with automatic call logging, and AI auto-responders that qualify inbound leads into the pipeline.",
    stack: ["React", "Laravel", "MySQL", "Redis", "Twilio"],
    href: "https://lumeniacrm.com",
    image: "/projects/lumeniacrm.jpg",
  },
  {
    name: "911 Limo",
    label: "Ride-sharing · World Cup 2026",
    tagline: "A ride-sharing platform with real-time tracking, in-app chat and fare sharing, used during the FIFA World Cup 2026.",
    desc: "Ride-sharing platform with real-time location tracking, in-app chat, and dynamic fare sharing, built on a Node.js backend with a Laravel and Blade frontend. Carried production traffic during the FIFA World Cup 2026.",
    stack: ["Node.js", "Laravel", "Blade", "MySQL", "AWS"],
    image: "/projects/911.png",
  },
  {
    name: "Air Ideal",
    label: "ERP · HVAC",
    tagline: "An ERP that runs an HVAC company's project billing, payments and document approvals in one place.",
    desc: "ERP for an HVAC company covering the project billing lifecycle, payments received, analytics, and a document approval queue with roles and permissions.",
    stack: ["Laravel", "PHP", "Blade", "MySQL"],
    image: "/projects/airideal.jpg",
  },
  {
    name: "Hot Air Balloon & Tours",
    label: "Tourism · UAE",
    tagline: "A tour booking website for a UAE company, with an admin portal to manage tours, services and bookings.",
    desc: "Website and admin portal for a UAE tour company. Services, tours, and bookings are all managed from the admin portal.",
    stack: ["Laravel", "Blade", "MySQL"],
    href: "https://balloon.lumenialab.com",
    image: "/projects/hotairballoon.jpg",
  },
  {
    name: "Medaan",
    label: "Restaurant · Canada",
    tagline: "A website for a Canadian restaurant, with a menu the owners update themselves from an admin portal.",
    desc: "Website for a Canadian food restaurant, with the full menu managed from an admin portal.",
    href: "https://medaan.ca",
    image: "/projects/medaan.jpg",
  },
  {
    name: "SA Trade Link",
    label: "Textiles · Pakistan",
    tagline: "A company website that brings a Pakistani textile business online and shows buyers what they make.",
    desc: "Website for a local textile company in Pakistan, built to grow their online presence.",
    stack: ["Bootstrap"],
    href: "https://satradelink.com",
    image: "/projects/satradelink.jpg",
  },
];

// chat answers
export const chatQA = [
  { q: "What does Umair specialize in?", a: "Laravel/PHP backends, specifically multi-tenant SaaS architecture, with AI layered in: RAG pipelines, vector databases, and LLM-integrated chat and voice. He builds the whole backend and self-hosts it." },
  { q: "Most impressive project?", a: "Lumenia CRM, a revenue-generating SaaS he architected solo, with paying customers in multiple countries. Or the domain platform integrating directly with Verisign & CentralNic under ICANN." },
  { q: "Is he open to work?", a: "Yes: senior and lead engineering roles, plus select contract work in Laravel, multi-tenant systems, or AI integration. Best reached at mumairtufail786@gmail.com." },
  { q: "What AI has he shipped?", a: "OpenAI (incl. Whisper for voice), Claude, and Gemini, all in production. DigiBot (a commercial WhatsApp RAG pipeline), voice navigation on a construction app, and AI auto-responders inside Lumenia CRM." },
  { q: "Where is he based?", a: "Lahore, Pakistan. He's delivered for clients across Canada, the UAE, Qatar, and the US, working directly with founders." },
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
  whoami: `Muhammad Umair Tufail, Senior Full-Stack Engineer, Lahore, Pakistan
Laravel/PHP + AI-integrated backends. 4+ yrs, 50+ production platforms.`,
  stack: `core:     PHP · Laravel · MySQL · Multi-tenant · RBAC
frontend: React · Inertia · Livewire · Alpine · Tailwind
ai:       OpenAI/Whisper · Claude · Gemini · RAG · Vector DBs
cloud:    AWS · Redis · CI/CD · Linux · cPanel/WHM`,
  projects: `Lumenia CRM        AI CRM → lumeniacrm.com
Domain Platform    direct Verisign/CentralNic, ICANN
DigiBot            WhatsApp RAG pipeline, Qdrant + OpenAI
911 Limo           ride-share platform, World Cup 2026`,
  experience: `Navicosoft   Senior Backend Engineer    Mar 2025 to Jun 2026
Tech Joint   Senior Software Engineer   Sep 2024 to Mar 2025
Tech Joint   Junior Software Engineer   Sep 2022 to Sep 2024`,
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
