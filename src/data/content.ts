/**
 * Todo el texto visible del sitio, en los dos idiomas.
 *
 * Lo que NO vive aqui: URLs, imagenes y nombres de tecnologias. Los
 * nombres propios (Laravel, Docker, n8n) no se traducen, asi que se
 * quedan en site.ts junto al resto de datos independientes del idioma.
 */

import type { DiagramId } from "./diagrams";
import type { PlanKey } from "./site";

/** Comprobaciones de la revision gratuita (ver app/api/audit). */
export type AuditCheckId = "https" | "mobile" | "meta" | "schema" | "preview" | "indexable";

export type Language = "en" | "es";

/** Textos de un diagrama tecnico (la estructura vive en diagrams.ts). */
export interface DiagramCopy {
  /** Insignia de estado de la barra de la ventana. */
  status: string;
  /** Por clave de nodo. */
  nodes?: Record<string, { title: string; detail?: string }>;
  /** Etiqueta de cada tramo entre columnas, en orden. */
  links?: string[];
  /** Salida del terminal, en el orden de las lineas `output`. */
  log?: string[];
}

export interface Dictionary {
  /**
   * Title y description de la version de este idioma. Los usa el
   * servidor (metadata de cada layout) y el toggle, que al cambiar de
   * idioma sin recargar actualiza tambien document.title.
   */
  meta: {
    title: string;
    description: string;
    ogLocale: string;
    /** Cargo en el JSON-LD de esta version. */
    jobTitle: string;
  };
  nav: { about: string; services: string; projects: string; pricing: string; contact: string };
  hero: {
    tagline: string;
    description: string;
    badgeAvailability: string;
    badgeLocation: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollLabel: string;
    /** Enlaces directos bajo los CTA. */
    links: { github: string; cv: string; email: string };
  };
  about: {
    eyebrow: string;
    title: string;
    /**
     * Cada bloque lleva sus rasgos debajo. Antes iban en una lista suelta
     * al final de la seccion y no se sabia a que texto respondian.
     */
    blocks: Array<{
      title: string;
      body: string;
      traits: Array<{ label: string; detail: string }>;
    }>;
    /**
     * Datos de la columna lateral. Solo el texto: los valores salen de
     * datos reales (about.tsx), no se escriben a mano.
     */
    facts: {
      sites: string;
      audience: string;
      languages: string;
      /** Enlace del dato de sitios a la seccion de trabajo reciente. */
      sitesLink: string;
    };
  };
  services: {
    eyebrow: string;
    title: string;
    /** Un bloque por servicio, en el orden de `menuItems`. */
    items: Array<{ name: string; tag: string; description: string }>;
  };
  projects: {
    eyebrow: string;
    title: string;
    /** Una linea bajo el titulo: que va a encontrar quien lee. */
    intro: string;
    labels: { problem: string; solution: string; result: string };
    /** Enlaces del pie de cada caso. */
    liveCta: string;
    repoCta: string;
    /** CTA a WhatsApp del caso: pedir algo parecido. */
    askCta: string;
    /** Enlace al resto de sitios (#sites). `{n}` es el numero de sitios. */
    moreSites: string;
    /** Pie de la seccion con el proyecto tecnico que no va como caso. */
    moreWork: { lead: string; name: string; detail: string };
    /** Por caso, en el orden de `cases` (site.ts). */
    items: Array<{
      client: string;
      category: string;
      title: string;
      problem: string;
      solution: string;
      result: string;
      /** Texto bajo la cifra, en casos con `stat`. */
      statLabel?: string;
      /** Texto alternativo de cada captura, en el orden de las capturas. */
      shotAlts: string[];
    }>;
  };
  footer: {
    eyebrow: string;
    headline: string;
    /** Linea de disponibilidad en clave comercial. */
    availability: string;
    cta: string;
    groups: { navigation: string; social: string; contact: string };
    links: {
      home: string;
      about: string;
      services: string;
      projects: string;
      pricing: string;
      faq: string;
      email: string;
    };
    rights: string;
  };
  languageToggle: { label: string };
  /** Mensaje que se abre ya escrito en WhatsApp. */
  whatsappMessage: string;
  diagrams: Record<DiagramId, DiagramCopy>;
  testimonials: {
    title: string;
    /** Frase de cada cliente, por `key` de testimonials (site.ts). */
    quotes: Record<string, string>;
  };
  pricing: {
    eyebrow: string;
    title: string;
    intro: string;
    /** "Desde", delante del precio. */
    from: string;
    featured: string;
    /** Linea que abre la lista de un plan que incluye al anterior. */
    includesPrevious: string;
    cta: string;
    /** `{plan}` es el nombre del plan. */
    whatsappMessage: string;
    /** Por `key` de plans (site.ts). */
    plans: Record<
      PlanKey,
      {
        name: string;
        /** Nombre corto para el selector de planes en celular. */
        short: string;
        summary: string;
        time: string;
        features: string[];
      }
    >;
    custom: { name: string; summary: string; cta: string; whatsappMessage: string };
    /** Kit de marca. `{price}` solo, `{bundle}` sumado a un plan. */
    brand: { name: string; summary: string; cta: string; whatsappMessage: string };
    /** Notas al pie. `{price}` es el precio de la revision completa. */
    /**
     * Lo que paga el cliente directamente, cada ano, fuera del precio del
     * proyecto. Las cuentas quedan a su nombre y con su tarjeta: si el
     * sitio crece y el proveedor cobra mas por uso, esa factura no cae
     * sobre quien lo construyo.
     */
    extras: {
      title: string;
      intro: string;
      items: Array<{ label: string; value: string }>;
    };
    /** Garantias y referidos: tres lineas cortas bajo los planes. */
    offers: Array<{ title: string; body: string }>;
    auditNote: string;
    auditLink: string;
    currencyNote: string;
  };
  audit: {
    eyebrow: string;
    title: string;
    intro: string;
    label: string;
    placeholder: string;
    submit: string;
    loading: string;
    errors: { invalid: string; unreachable: string; rateLimited: string; generic: string };
    /** `{n}` y `{total}`. */
    score: string;
    checks: Record<AuditCheckId, { label: string; pass: string; fail: string }>;
    hookTitle: string;
    hookBody: string;
    cta: string;
    /** `{url}`, `{n}` y `{total}`. */
    whatsappMessage: string;
    again: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    /** Tarjeta junto a las preguntas: escribir si la duda no esta. */
    ask: { title: string; body: string; cta: string; whatsappMessage: string };
    /**
     * Las respuestas pueden llevar {landing}, {web}, {panel}: se
     * sustituyen por los precios de site.ts, para que no se desfasen.
     */
    items: Array<{ question: string; answer: string }>;
  };
  miniProjects: {
    eyebrow: string;
    title: string;
    hint: string;
    /** Aviso para lector de pantalla en los enlaces externos. */
    newTab: string;
    /** Inicio del alt de cada captura: "<imageAlt> <nombre del sitio>". */
    imageAlt: string;
    /** Una linea por sitio, en el orden de `miniProjects`. */
    items: string[];
  };
}

const en: Dictionary = {
  meta: {
    title: "Cristian Pérez | Full-Stack Developer & Automation, Colombia",
    description:
      "Freelance full-stack developer in Bucaramanga, Colombia. Web apps, workflow automation and AI document extraction for small teams, plus video that sells them.",
    ogLocale: "en_US",
    jobTitle: "Full-Stack Developer",
  },
  nav: {
    about: "About",
    services: "Services",
    projects: "Projects",
    pricing: "Pricing",
    contact: "Contact",
  },
  hero: {
    tagline: "Websites and software that run your business, and video that sells it.",
    description:
      "I design, build and explain the systems small teams depend on. Without the jargon.",
    badgeAvailability: "Open to new projects",
    badgeLocation: "Bucaramanga, Colombia · remote",
    ctaPrimary: "Let's Talk on WhatsApp",
    ctaSecondary: "Explore Projects & Work",
    scrollLabel: "Scroll to about",
    links: { github: "GitHub", cv: "Download CV", email: "Email" },
  },
  about: {
    eyebrow: "Who's behind it",
    title: "About me",
    blocks: [
      {
        title: "Engineering & security",
        body: "I build complete systems, start to finish, with whatever technology the problem needs. I come from cybersecurity, so the first thing I check is where your data goes.",
        traits: [
          { label: "Right tool per problem", detail: "not per habit" },
          { label: "Security first", detail: "your data, protected from day one" },
        ],
      },
      {
        title: "Brand & content",
        body: "A website works better when the brand behind it is clear. I help you with your logo, colours and short videos for social media, the same way I built an audience of 32K+ on TikTok.",
        traits: [
          { label: "Visual identity", detail: "logo, colours, fonts" },
          { label: "Content for social media", detail: "scripts and editing that hold attention" },
        ],
      },
    ],
    facts: {
      sites: "websites live for businesses in Colombia",
      audience: "followers built with my own content",
      languages: "I work in Spanish and English",
      sitesLink: "See them",
    },
  },
  services: {
    eyebrow: "What I build",
    title: "Services",
    items: [
      {
        name: "Websites & custom software",
        tag: "Next.js / React / Laravel / PostgreSQL",
        description: "Your website, your online store or the system your team works with, built from scratch.",
      },
      {
        name: "Found on Google and AI",
        tag: "Local SEO / Google Maps / ChatGPT",
        description: "You show up when people search Google or Maps, and when they ask ChatGPT.",
      },
      {
        name: "Automation & AI for documents",
        tag: "n8n / Python / OCR / AI",
        description: "Repetitive tasks that run on their own, and paperwork turned into data you find in seconds.",
      },
      {
        name: "Review & advisory",
        tag: "Website / Sales / Security",
        description: "I review your website, how you sell online and where your data sits, and tell you what to fix first.",
      },
      {
        name: "Brand & video for social media",
        tag: "Logo / Visual identity / Short video",
        description: "Logo, colours and short videos so your brand looks the same on your website and on social media.",
      },
    ],
  },
  projects: {
    eyebrow: "Real cases",
    title: "Projects",
    intro: "What each business needed, what I built, and what changed.",
    labels: { problem: "The problem", solution: "What I built", result: "Result" },
    liveCta: "Visit the site",
    repoCta: "Code on GitHub",
    askCta: "I want something like this",
    moreSites: "Plus {n} websites live for businesses",
    moreWork: {
      lead: "More on GitHub:",
      name: "PairSync",
      detail: "pair programming platform with an AI tutor",
    },
    items: [
      {
        client: "Fundación Cardiovascular de Colombia (FCV)",
        category: "Document AI · cybersecurity team",
        title: "The FCV's paper records, searchable in seconds",
        problem:
          "The FCV had hundreds of scanned records. Finding a single one meant opening PDFs one by one.",
        solution:
          "A system that reads the scans with AI, pulls out name, ID number and site, and builds a search tool. Doubtful reads get flagged for a person to check.",
        result: "What used to mean opening PDFs one by one is now typing an ID number.",
        statLabel: "records searchable by ID, name or site",
        shotAlts: [
          "The FCV record search tool",
          "Pipeline processing the scans",
          "Record index, doubtful reads flagged for review",
        ],
      },
      {
        client: "criscx1905",
        category: "Content & video",
        title: "Video that explains and sells",
        problem:
          "A good product loses sales when nobody understands in thirty seconds why they need it.",
        solution:
          "I write, record, edit and stream everything myself on TikTok, Instagram and Twitch.",
        result:
          "Over 2M organic impressions. The same skill goes into demos and videos for clients.",
        statLabel: "followers built with my own content",
        shotAlts: [
          "TikTok profile with 32K+ followers",
          "Editing in After Effects",
          "Multistream setup in OBS",
        ],
      },
    ],
  },
  footer: {
    eyebrow: "Contact",
    headline: "Tell me what your business needs.",
    availability:
      "A website, a system that saves your team hours, or a video that explains your product. I reply on WhatsApp.",
    cta: "Message me on WhatsApp",
    groups: {
      navigation: "Navigation",
      social: "Social",
      contact: "Contact",
    },
    links: {
      home: "Home",
      about: "About",
      services: "Services",
      projects: "Projects",
      pricing: "Pricing",
      faq: "FAQ",
      email: "Email",
    },
    rights: "All rights reserved.",
  },
  languageToggle: { label: "Change language" },
  whatsappMessage:
    "Hi Cristian, I saw your portfolio and I would like to talk about a project.",
  diagrams: {
    "svc-fullstack": {
      status: "200 OK",
      nodes: {
        ui: { title: "Interface", detail: "React · Next.js" },
        api: { title: "API", detail: "Laravel · Python" },
        database: { title: "Database", detail: "PostgreSQL" },
      },
    },
    "svc-seo": {
      status: "indexed",
      nodes: {
        site: { title: "Your site", detail: "Fast · clean HTML" },
        schema: { title: "Schema", detail: "JSON-LD · llms.txt" },
        google: { title: "Google", detail: "Search · Maps" },
        ai: { title: "AI answers", detail: "ChatGPT · Perplexity" },
      },
    },
    "svc-automation": {
      status: "synced",
      nodes: {
        webhook: { title: "Webhook", detail: "Event in" },
        n8n: { title: "n8n", detail: "Workflow" },
        python: { title: "Python", detail: "Transform" },
        apis: { title: "APIs", detail: "CRM · Sheets · email" },
      },
    },
    "svc-docai": {
      status: "extracting",
      nodes: {
        scans: { title: "PDFs & scans", detail: "Paper, forms" },
        ocr: { title: "OCR", detail: "Azure Doc Intelligence" },
        llm: { title: "LLM", detail: "Structures & validates" },
        search: { title: "Search", detail: "Seconds, not hours" },
      },
    },
    "svc-audit": {
      status: "2 findings",
      log: [
        "Funnel mapped from first click to paid invoice",
        "Leads lost between the web form and the CRM",
        "Customer data shared in a public spreadsheet",
        "Report ready · fixes ranked by revenue and risk",
      ],
    },
    "svc-media": {
      status: "rendering",
      nodes: {
        script: { title: "Script", detail: "Hook in 3 s" },
        record: { title: "Record", detail: "Multicam · OBS" },
        edit: { title: "Edit", detail: "High-retention pacing" },
        publish: { title: "Publish", detail: "Vertical + widescreen" },
      },
    },
  },
  testimonials: {
    title: "What clients say",
    quotes: {
      "hotel-logistico":
        "Since we launched the website, bookings come straight to our WhatsApp. Really good work.",
      msq: "We don't have to explain prices over the phone anymore. Clients already know which truck they want.",
      m10drinks:
        "People order from the website at any hour. Cristian was quick and always on top of things.",
    },
  },
  pricing: {
    eyebrow: "Plans",
    title: "Pricing",
    intro: "Starting prices for each type of project. The final price is agreed in writing before work begins.",
    from: "From",
    featured: "Most chosen",
    includesPrevious: "Everything in the previous plan, plus:",
    cta: "I want this one",
    whatsappMessage: "Hi Cristian, I saw your pricing and I'm interested in the {plan} plan.",
    plans: {
      landing: {
        name: "Landing page",
        short: "Landing",
        summary: "A clean, fast page that presents your business and brings in messages.",
        time: "Ready in 1 week",
        features: [
          "Custom design, made for phones first",
          "WhatsApp button and contact form",
          "Live on your domain and on Google",
        ],
      },
      web: {
        name: "Website + Google & AI",
        short: "Web + AI",
        summary: "For people to find you when they search, not only when you share the link.",
        time: "2 to 3 weeks",
        features: [
          "Up to 5 sections or pages",
          "Local SEO and Google Maps profile",
          "Ready to be quoted by ChatGPT and Google AI",
        ],
      },
      panel: {
        name: "Website with admin panel",
        short: "With panel",
        summary: "Change prices, photos and products yourself, whenever you want.",
        time: "3 to 5 weeks",
        features: [
          "Your own panel to edit prices and photos",
          "Catalogue, bookings or quote form",
          "I show you how to use it",
        ],
      },
    },
    custom: {
      name: "App or custom system",
      summary: "Automations, internal systems, AI that reads your documents. I understand the problem first and give you a fixed price.",
      cta: "Ask for a quote",
      whatsappMessage: "Hi Cristian, I'd like a quote for an app or custom system.",
    },
    brand: {
      name: "Brand kit",
      summary: "Logo, colours, fonts and templates for your social media. From {price}, or {bundle} added to any plan. Social videos are quoted by volume.",
      cta: "I want my brand",
      whatsappMessage: "Hi Cristian, I'm interested in the brand kit.",
    },
    extras: {
      title: "Paid separately, by you",
      intro: "They go in your name and on your card, paid directly to the provider. I help you set them up and leave usage alerts on.",
      items: [
        { label: "Domain (yourbusiness.com)", value: "about US$15–30 a year" },
        { label: "Hosting for a landing page", value: "from US$0 to about US$25 a year" },
        { label: "Hosting with admin panel and database", value: "about US$5–25 a month, depending on traffic" },
        { label: "Support after the first 30 days", value: "quoted separately" },
      ],
    },
    offers: [
      { title: "Changes until you approve", body: "We adjust the design until you're happy, before anything goes live." },
      { title: "30 days of free support", body: "If something breaks in the first month after launch, I fix it at no cost." },
      { title: "10% for referrals", body: "Send me a business that hires me and get 10% off your next project or change." },
    ],
    auditNote: "Already have a website? Full review for {price}, deducted if we then build yours together.",
    auditLink: "Or try the free basic check",
    currencyNote: "Prices in US dollars. For businesses in Colombia I quote in pesos.",
  },
  audit: {
    eyebrow: "Free check",
    title: "Is your website ready for Google and AI?",
    intro: "Paste your address and see in seconds the basics many sites miss.",
    label: "Your website address",
    placeholder: "yourbusiness.com",
    submit: "Check for free",
    loading: "Checking your site…",
    errors: {
      invalid: "That doesn't look like a website address. Try something like yourbusiness.com",
      unreachable: "I couldn't open that site. Check the address and try again.",
      rateLimited: "Too many checks in a row. Try again in a few minutes.",
      generic: "Something went wrong. Try again in a moment.",
    },
    score: "{n} of {total} basics in order",
    checks: {
      https: { label: "Secure connection", pass: "Opens with HTTPS, no warning", fail: "Browsers may mark it as not secure" },
      mobile: { label: "Made for phones", pass: "Adapts to the screen", fail: "It may look tiny on a phone" },
      meta: { label: "Title and description", pass: "Google knows what to show", fail: "Google has to guess what to show" },
      schema: { label: "Data for Google and AI", pass: "Has structured data", fail: "No structured data for Google or AI" },
      preview: { label: "Preview on WhatsApp", pass: "Shows an image when shared", fail: "Shared as a bare link, no image" },
      indexable: { label: "Visible on Google", pass: "Google is allowed to list it", fail: "It is asking Google not to list it" },
    },
    hookTitle: "This is only the surface.",
    hookBody: "Real speed on phones, how you rank against your competition and what AI says about you: I review it and send it to you for free over WhatsApp.",
    cta: "Get the full review",
    whatsappMessage: "Hi Cristian, I checked {url} on your site and it scored {n}/{total}. Can you send me the full review?",
    again: "Check another site",
  },
  faq: {
    eyebrow: "Questions",
    title: "Frequently asked",
    ask: {
      title: "Question not here?",
      body: "Ask me on WhatsApp. I usually reply the same day.",
      cta: "Ask on WhatsApp",
      whatsappMessage: "Hi Cristian, I have a question before starting a project.",
    },
    items: [
      {
        question: "How much does a website cost?",
        answer: "From {landing} for a landing page, {web} with SEO for Google and AI, and {panel} with an admin panel. Apps and custom systems are quoted separately. The final price is agreed before I start.",
      },
      {
        question: "How long does it take?",
        answer: "A landing page, about 1 week. A full website, 2 to 3 weeks; with an admin panel, 3 to 5. It goes faster if you already have your photos and texts.",
      },
      {
        question: "What do I need to get started?",
        answer: "Your logo, photos of your business and an idea of what you sell. If you don't have texts, we write them together.",
      },
      {
        question: "What does showing up on ChatGPT or Google AI mean?",
        answer: "More and more people ask ChatGPT, Perplexity or Google things like \"where can I find X in my city?\". I prepare your site with structured data and clear answers so AI understands it and can recommend you. Nobody can guarantee first place, but it can be ready.",
      },
      {
        question: "Are the domain and hosting included?",
        answer: "No, and that's on purpose. They are paid yearly (or monthly, for sites with a database) directly to the provider, in your name and on your card, so the website is yours and you don't depend on me to keep it online. I help you pick and set them up. If your site grows a lot, the provider may charge more for usage; I leave alerts on so it never takes you by surprise.",
      },
      {
        question: "Do you work with clients outside Colombia?",
        answer: "Yes. I'm based in Bucaramanga and work with businesses across Colombia and abroad, in Spanish or English, over WhatsApp and video calls. For clients abroad I quote in US dollars.",
      },
    ],
  },
  miniProjects: {
    eyebrow: "Recent work",
    title: "Websites already live",
    hint: "Tap any of them to visit it.",
    newTab: "(opens in a new tab)",
    imageAlt: "Website built for",
    items: [
      "Truck rental · monthly quotes in Barrancabermeja",
      "Hotel in Santa Marta · bookings over WhatsApp",
      "Footwear factory · wholesale catalogue",
      "Baby store · nationwide delivery",
      "Online shoe store",
      "Dog grooming · appointments over WhatsApp",
      "Liquor store · 24/7 delivery in Floridablanca",
    ],
  },
};

const es: Dictionary = {
  meta: {
    title: "Páginas web y software en Bucaramanga | Cristian Pérez",
    description:
      "Desarrollo páginas web, software a la medida y automatizaciones para negocios en Bucaramanga y toda Colombia. Mira sitios ya publicados y cotiza por WhatsApp.",
    ogLocale: "es_CO",
    jobTitle: "Desarrollador web full-stack",
  },
  nav: {
    about: "Sobre mí",
    services: "Servicios",
    projects: "Proyectos",
    pricing: "Precios",
    contact: "Contacto",
  },
  hero: {
    tagline: "Páginas web y software que hacen funcionar tu negocio, y video que lo vende.",
    description:
      "Diseño, construyo y explico los sistemas de los que depende un equipo pequeño. Sin jerga.",
    badgeAvailability: "Disponible para proyectos nuevos",
    badgeLocation: "Bucaramanga, Colombia · remoto",
    ctaPrimary: "Hablemos por WhatsApp",
    ctaSecondary: "Ver proyectos y trabajo",
    scrollLabel: "Ir a sobre mí",
    links: { github: "GitHub", cv: "Descargar CV", email: "Correo" },
  },
  about: {
    eyebrow: "Quién hay detrás",
    title: "Sobre mí",
    blocks: [
      {
        title: "Ingeniería y seguridad",
        body: "Construyo sistemas completos, de principio a fin, con la tecnología que pide cada problema. Vengo de ciberseguridad: lo primero que reviso es por dónde pasan tus datos.",
        traits: [
          { label: "La herramienta que pide el problema", detail: "no la costumbre" },
          { label: "Seguridad primero", detail: "tus datos protegidos desde el día uno" },
        ],
      },
      {
        title: "Marca y contenido",
        body: "Una página funciona mejor cuando la marca detrás está clara. Te ayudo con el logo, los colores y videos cortos para redes, igual que construí una audiencia de 32K+ en TikTok.",
        traits: [
          { label: "Identidad visual", detail: "logo, colores, tipografías" },
          { label: "Contenido para redes", detail: "guiones y edición que retienen" },
        ],
      },
    ],
    facts: {
      sites: "páginas web en línea para negocios en Colombia",
      audience: "seguidores construidos con contenido propio",
      languages: "trabajo en español e inglés",
      sitesLink: "Verlas",
    },
  },
  services: {
    eyebrow: "Lo que hago",
    title: "Servicios",
    items: [
      {
        name: "Páginas web y software a medida",
        tag: "Next.js / React / Laravel / PostgreSQL",
        description: "Tu página, tu tienda en línea o el sistema con el que trabaja tu equipo, hecho desde cero.",
      },
      {
        name: "Que te encuentren en Google y en la IA",
        tag: "SEO local / Google Maps / ChatGPT",
        description: "Apareces cuando te buscan en Google o en Maps, y cuando le preguntan a ChatGPT.",
      },
      {
        name: "Automatización e IA para documentos",
        tag: "n8n / Python / OCR / IA",
        description: "Tareas repetitivas que se hacen solas, y papeles que se vuelven datos que encuentras en segundos.",
      },
      {
        name: "Revisión y asesoría",
        tag: "Página web / Ventas / Seguridad",
        description: "Reviso tu página, cómo vendes por internet y dónde están tus datos, y te digo qué arreglar primero.",
      },
      {
        name: "Marca y video para redes",
        tag: "Logo / Identidad visual / Video corto",
        description: "Logo, colores y videos cortos para que tu marca se vea igual en tu página y en redes.",
      },
    ],
  },
  projects: {
    eyebrow: "Casos reales",
    title: "Proyectos",
    intro: "Qué necesitaba cada negocio, qué construí y qué cambió.",
    labels: { problem: "El problema", solution: "Lo que hice", result: "Resultado" },
    liveCta: "Ver la página",
    repoCta: "Código en GitHub",
    askCta: "Quiero algo así",
    moreSites: "Y {n} páginas web en línea para negocios",
    moreWork: {
      lead: "Más en GitHub:",
      name: "PairSync",
      detail: "plataforma de programación en pareja con tutor de IA",
    },
    items: [
      {
        client: "Fundación Cardiovascular de Colombia (FCV)",
        category: "IA documental · equipo de ciberseguridad",
        title: "Las actas de la FCV, encontradas en segundos",
        problem:
          "La FCV tenía cientos de actas escaneadas. Encontrar una sola era abrir PDFs uno por uno.",
        solution:
          "Un sistema que lee los escaneos con IA, saca nombre, cédula y sede, y arma un buscador. Las lecturas dudosas se marcan para que una persona las revise.",
        result: "Lo que antes era abrir PDFs uno por uno ahora es escribir una cédula.",
        statLabel: "actas que se encuentran por cédula, nombre o sede",
        shotAlts: [
          "Buscador de actas de la FCV",
          "Pipeline procesando los escaneos",
          "Índice de actas, con lecturas dudosas marcadas",
        ],
      },
      {
        client: "criscx1905",
        category: "Contenido y video",
        title: "Video que explica y vende",
        problem:
          "Un buen producto pierde ventas cuando nadie entiende en treinta segundos por qué lo necesita.",
        solution:
          "Escribo, grabo, edito y transmito todo yo, en TikTok, Instagram y Twitch.",
        result:
          "Más de 2M de impresiones orgánicas. Lo mismo aplico a demos y videos para clientes.",
        statLabel: "seguidores construidos con contenido propio",
        shotAlts: [
          "Perfil de TikTok con 32K+ seguidores",
          "Edición en After Effects",
          "Montaje multistream en OBS",
        ],
      },
    ],
  },
  footer: {
    eyebrow: "Contacto",
    headline: "Cuéntame qué necesita tu negocio.",
    availability:
      "Una página web, un sistema que le ahorre horas a tu equipo o un video que explique tu producto. Respondo por WhatsApp.",
    cta: "Escríbeme por WhatsApp",
    groups: {
      navigation: "Navegación",
      social: "Redes",
      contact: "Contacto",
    },
    links: {
      home: "Inicio",
      about: "Sobre mí",
      services: "Servicios",
      projects: "Proyectos",
      pricing: "Precios",
      faq: "Preguntas frecuentes",
      email: "Correo",
    },
    rights: "Todos los derechos reservados.",
  },
  languageToggle: { label: "Cambiar idioma" },
  whatsappMessage:
    "Hola Cristian, vi tu portafolio y me gustaría hablar de un proyecto.",
  diagrams: {
    "svc-fullstack": {
      status: "200 OK",
      nodes: {
        ui: { title: "Interfaz", detail: "React · Next.js" },
        api: { title: "API", detail: "Laravel · Python" },
        database: { title: "Base de datos", detail: "PostgreSQL" },
      },
    },
    "svc-seo": {
      status: "indexado",
      nodes: {
        site: { title: "Tu sitio", detail: "Rápido · HTML limpio" },
        schema: { title: "Schema", detail: "JSON-LD · llms.txt" },
        google: { title: "Google", detail: "Búsqueda · Maps" },
        ai: { title: "Respuestas IA", detail: "ChatGPT · Perplexity" },
      },
    },
    "svc-automation": {
      status: "sincronizado",
      nodes: {
        webhook: { title: "Webhook", detail: "Entra un evento" },
        n8n: { title: "n8n", detail: "Flujo" },
        python: { title: "Python", detail: "Transforma" },
        apis: { title: "APIs", detail: "CRM · Sheets · correo" },
      },
    },
    "svc-docai": {
      status: "extrayendo",
      nodes: {
        scans: { title: "PDFs y escaneos", detail: "Papel, formularios" },
        ocr: { title: "OCR", detail: "Azure Doc Intelligence" },
        llm: { title: "LLM", detail: "Estructura y valida" },
        search: { title: "Búsqueda", detail: "Segundos, no horas" },
      },
    },
    "svc-audit": {
      status: "2 hallazgos",
      log: [
        "Embudo trazado del primer clic a la factura pagada",
        "Leads perdidos entre el formulario web y el CRM",
        "Datos de clientes en una hoja de cálculo pública",
        "Informe listo · arreglos ordenados por ingresos y riesgo",
      ],
    },
    "svc-media": {
      status: "renderizando",
      nodes: {
        script: { title: "Guion", detail: "Gancho en 3 s" },
        record: { title: "Grabación", detail: "Multicámara · OBS" },
        edit: { title: "Edición", detail: "Ritmo de alta retención" },
        publish: { title: "Publicación", detail: "Vertical + horizontal" },
      },
    },
  },
  testimonials: {
    title: "Lo que dicen los clientes",
    quotes: {
      "hotel-logistico":
        "Desde que tenemos la página, las reservas nos llegan directo al WhatsApp. Muy buen trabajo.",
      msq: "Ya no tenemos que explicar precios por teléfono, los clientes llegan sabiendo qué camioneta quieren.",
      m10drinks:
        "La gente pide por la página a cualquier hora. Cristian fue rápido y siempre estuvo pendiente.",
    },
  },
  pricing: {
    eyebrow: "Planes",
    title: "Precios",
    intro: "Valores de referencia para cada tipo de proyecto. El precio final se acuerda por escrito antes de empezar.",
    from: "Desde",
    featured: "El más elegido",
    includesPrevious: "Todo lo del plan anterior, más:",
    cta: "Quiero este",
    whatsappMessage: "Hola Cristian, vi tus precios y me interesa el plan {plan}.",
    plans: {
      landing: {
        name: "Página de presentación",
        short: "Presentación",
        summary: "Una página bonita y rápida que presenta tu negocio y te trae mensajes.",
        time: "Lista en 1 semana",
        features: [
          "Diseño a tu medida, pensado para celular",
          "Botón de WhatsApp y formulario",
          "Publicada en tu dominio y visible en Google",
        ],
      },
      web: {
        name: "Web + Google e IA",
        short: "Web + IA",
        summary: "Para que te encuentren cuando buscan, no solo cuando compartes el link.",
        time: "2 a 3 semanas",
        features: [
          "Hasta 5 secciones o páginas",
          "SEO local y perfil en Google Maps",
          "Lista para que ChatGPT y la IA de Google te citen",
        ],
      },
      panel: {
        name: "Web con panel de administración",
        short: "Con panel",
        summary: "Cambias precios, fotos y productos tú mismo, cuando quieras.",
        time: "3 a 5 semanas",
        features: [
          "Tu propio panel para editar precios y fotos",
          "Catálogo, reservas o cotizador",
          "Te enseño a usarlo",
        ],
      },
    },
    custom: {
      name: "App o sistema a medida",
      summary: "Automatizaciones, sistemas internos, IA que lee tus documentos. Primero entiendo el problema y te doy un precio cerrado.",
      cta: "Cotizar",
      whatsappMessage: "Hola Cristian, quiero cotizar una app o un sistema a medida.",
    },
    brand: {
      name: "Kit de marca",
      summary: "Logo, colores, tipografías y plantillas para tus redes. Desde {price}, o {bundle} si lo sumas a cualquier plan. Los videos para redes se cotizan según cantidad.",
      cta: "Quiero mi marca",
      whatsappMessage: "Hola Cristian, me interesa el kit de marca.",
    },
    extras: {
      title: "Lo que pagas aparte",
      intro: "Van a tu nombre y con tu tarjeta, directo al proveedor. Te ayudo a crearlos y dejo alertas de consumo activas.",
      items: [
        { label: "Dominio (tunegocio.com)", value: "aprox. $60.000 – $120.000 al año" },
        { label: "Hosting de una página de presentación", value: "desde $0 hasta aprox. $100.000 al año" },
        { label: "Hosting con panel y base de datos", value: "aprox. $20.000 – $100.000 al mes, según visitas" },
        { label: "Soporte después de los primeros 30 días", value: "se cotiza aparte" },
      ],
    },
    offers: [
      { title: "Cambios hasta que apruebes", body: "Ajustamos el diseño hasta que te guste, antes de publicar nada." },
      { title: "30 días de soporte gratis", body: "Si algo falla el primer mes después de publicar, lo arreglo sin costo." },
      { title: "10% por referidos", body: "Si me recomiendas un negocio y me contrata, tienes 10% de descuento en tu próximo proyecto o cambio." },
    ],
    auditNote: "¿Ya tienes página? Revisión completa por {price}, y te la descuento si después hacemos la tuya.",
    auditLink: "O prueba la revisión básica gratis",
    currencyNote: "Precios en pesos colombianos. Para proyectos fuera de Colombia cotizo en dólares.",
  },
  audit: {
    eyebrow: "Revisión gratis",
    title: "¿Tu página está lista para Google y la IA?",
    intro: "Pega la dirección y mira en segundos lo básico que a muchas páginas les falta.",
    label: "Dirección de tu página",
    placeholder: "tunegocio.com",
    submit: "Revisar gratis",
    loading: "Revisando tu página…",
    errors: {
      invalid: "Eso no parece la dirección de una página. Prueba algo como tunegocio.com",
      unreachable: "No pude abrir esa página. Revisa la dirección e inténtalo otra vez.",
      rateLimited: "Demasiadas revisiones seguidas. Inténtalo en unos minutos.",
      generic: "Algo falló. Inténtalo de nuevo en un momento.",
    },
    score: "{n} de {total} puntos básicos en orden",
    checks: {
      https: { label: "Conexión segura", pass: "Abre con HTTPS, sin avisos", fail: "El navegador puede marcarla como no segura" },
      mobile: { label: "Hecha para celular", pass: "Se adapta a la pantalla", fail: "Puede verse diminuta en el celular" },
      meta: { label: "Título y descripción", pass: "Google sabe qué mostrar", fail: "Google tiene que adivinar qué mostrar" },
      schema: { label: "Datos para Google y la IA", pass: "Tiene datos estructurados", fail: "Sin datos estructurados para Google ni la IA" },
      preview: { label: "Vista previa en WhatsApp", pass: "Sale con imagen al compartirla", fail: "Se comparte como link suelto, sin imagen" },
      indexable: { label: "Visible en Google", pass: "Google puede mostrarla", fail: "Le está pidiendo a Google que no la muestre" },
    },
    hookTitle: "Esto es solo la superficie.",
    hookBody: "La velocidad real en celular, cómo quedas frente a tu competencia y qué dice la IA de ti: lo reviso y te lo mando gratis por WhatsApp.",
    cta: "Quiero la revisión completa",
    whatsappMessage: "Hola Cristian, revisé {url} en tu página y salió {n}/{total}. ¿Me mandas la revisión completa?",
    again: "Revisar otra página",
  },
  faq: {
    eyebrow: "Dudas",
    title: "Preguntas frecuentes",
    ask: {
      title: "¿No está tu pregunta?",
      body: "Escríbeme por WhatsApp. Suelo responder el mismo día.",
      cta: "Preguntar por WhatsApp",
      whatsappMessage: "Hola Cristian, tengo una duda antes de empezar un proyecto.",
    },
    items: [
      {
        question: "¿Cuánto cuesta una página web?",
        answer: "Desde {landing} una página de presentación, {web} con SEO para Google y la IA, y {panel} con panel de administración. Las apps y sistemas a medida se cotizan aparte. El valor final lo acordamos antes de empezar.",
      },
      {
        question: "¿Cuánto se demora?",
        answer: "Una página de presentación, alrededor de 1 semana. Una web completa, 2 a 3 semanas; con panel, 3 a 5. Va más rápido si ya tienes fotos y textos.",
      },
      {
        question: "¿Qué necesito para empezar?",
        answer: "Tu logo, fotos de tu negocio y una idea de lo que vendes. Si no tienes textos, los escribimos juntos.",
      },
      {
        question: "¿Qué es aparecer en ChatGPT o en la IA de Google?",
        answer: "Cada vez más gente le pregunta a ChatGPT, Perplexity o a Google cosas como \"¿dónde encuentro X en mi ciudad?\". Preparo tu página con datos estructurados y respuestas claras para que la IA la entienda y pueda recomendarte. Nadie puede garantizar el primer lugar, pero sí dejarla lista.",
      },
      {
        question: "¿El dominio y el hosting están incluidos?",
        answer: "No, y es a propósito. Se pagan cada año (o cada mes, en webs con base de datos) directo al proveedor, a tu nombre y con tu tarjeta: así la página es tuya y no dependes de mí para mantenerla en línea. Yo te ayudo a elegirlos y configurarlos. Si tu página crece mucho, el proveedor puede cobrar más por uso; dejo alertas activas para que nunca te tome por sorpresa.",
      },
      {
        question: "¿Trabajas fuera de Bucaramanga o de Colombia?",
        answer: "Sí. Estoy en Bucaramanga y trabajo con negocios de toda Colombia y de otros países, en español o en inglés, por WhatsApp y videollamada. Afuera de Colombia cotizo en dólares.",
      },
    ],
  },
  miniProjects: {
    eyebrow: "Trabajo reciente",
    title: "Páginas web ya publicadas",
    hint: "Toca cualquiera para visitarla.",
    newTab: "(se abre en otra pestaña)",
    imageAlt: "Página web de",
    items: [
      "Renta de camionetas · cotización mensual en Barrancabermeja",
      "Hotel en Santa Marta · reservas por WhatsApp",
      "Fábrica de calzado · catálogo mayorista",
      "Tienda de bebés · envíos a todo el país",
      "Tienda online de calzado",
      "Peluquería canina · citas por WhatsApp",
      "Licorera · domicilio 24/7 en Floridablanca",
    ],
  },
};

export const dictionaries: Record<Language, Dictionary> = { en, es };
