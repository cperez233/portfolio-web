# Portfolio — Cristian Pérez

Personal portfolio site: full-stack engineering, workflow automation and
audiovisual production, presented for the people who hire for it rather
than for the people who build it.

Bilingual (EN / ES), dark and light themes, scroll-driven motion.

**Live:** https://portafolio-seven-zeta-27.vercel.app

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (`@theme` tokens, no config file) |
| Motion | Framer Motion 13 · Lenis (inertial scroll) |
| Icons | lucide-react |
| Fonts | Geist + Fira Code, self-hosted via `next/font` |
| OG image | `next/og` (`ImageResponse`), generated at build time |

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000

```bash
npm run build   # production build
npm run lint    # eslint
```

## Structure

```
src/
├─ proxy.ts          detects the entry language into a cookie
├─ app/
│  ├─ layout.tsx      fonts, metadata (SEO + Open Graph), providers, nav
│  ├─ page.tsx        section composition only
│  ├─ og-image.png/   route that renders the 1200x630 share card
│  └─ globals.css     design tokens (@theme) + theme overrides
├─ components/
│  ├─ about.tsx       editorial blocks + highlight grid
│  ├─ mini-projects.tsx     live sites: swipe on phones, drifts on desktop
│  ├─ projects.tsx    sticky stacking case-study cards
│  ├─ diagrams/       code-drawn architecture / pipeline / terminal panels
│  └─ ui/             primitives and the larger composed pieces
├─ data/
│  ├─ content.ts      every translatable string, EN + ES
│  ├─ diagrams.ts     diagram structure: nodes, columns, commands
│  └─ site.ts         URLs, images, proper nouns (no translation)
└─ lib/
   ├─ language.tsx    language provider
   ├─ language-detection.ts  entry-language rules, shared with proxy.ts
   ├─ theme.ts        theme store (+ theme-storage.ts for the key)
   ├─ smooth-scroll.ts  Lenis access for programmatic jumps
   └─ utils.ts        cn() helper
```

The split between `content.ts` and `site.ts` is deliberate: anything a
reader sees in their own language lives in the dictionary; anything that
is a proper noun, a URL or an asset path stays language-independent.
Diagrams follow the same split: `diagrams.ts` holds the structure and the
terminal commands, `content.ts` the node labels and log output.

## Theming

Colour, type and spacing are CSS custom properties declared in
`globals.css` under `@theme`. Light is the default set; `html.dark`
redefines the same variables.

Because Tailwind v4 compiles utilities to `var(--color-*)`, redefining a
variable repaints the whole site — there is not a single `dark:` prefix
in the components.

## Notes worth knowing before editing

A few decisions here are load-bearing and easy to undo by accident.

**Do not wrap a sticky section in a transform.** A transform makes an
element the containing block for its descendants, which breaks
`position: sticky` inside it. The services scroller and the project
cards both rely on sticky, so `SectionTransition` is applied to the
mini-projects and about sections only.

**Programmatic scrolling must go through Lenis.** Lenis rewrites the
scroll position every frame, so a plain `window.scrollTo` is reverted on
the next one. Use `smoothScrollTo()` from `lib/smooth-scroll.ts`. Anchor
links work because Lenis is initialised with `anchors: true`.

**The hero name is a solid colour, not a gradient.** Each letter carries
an inline `filter` for the blur reveal, and a filter creates a stacking
context that breaks `background-clip: text`. Gradients also do not
interpolate, so the name would jump between themes while everything else
crossfades.

**Accent has two tokens.** `--color-accent` is a fill colour, for
buttons and borders, written on with `--color-on-accent`.
`--color-accent-ink` is the accent used as text; on the dark background
the deep wine measures 1.83:1, so text uses a lighter tint instead.

## Assets

There is no stock photography. Services and the PairSync / document
extraction projects are illustrated with diagrams drawn in code
(`components/diagrams/`), styled as an editor window that follows the
theme through the `tech-*` tokens in `globals.css`.

`public/projects/` holds screenshots; only the content-creation project
displays them today. The document extraction shots are redacted: the
original captures contained real names and national ID numbers, and the
identifying columns are blurred before publication.

`public/sites/` holds the mini-project screenshots: one 16:10 JPEG per
published site, captured at 1440x900 and resized to 1200x750.

The hero links a CV from `public/cv-cristian-perez.pdf`. The link only
renders when that file exists at build time, so it never points at a 404.

The unredacted originals live in `assets-src/`, which is excluded from
both git and the Vercel deploy. They are not in this repository and
should not be added to it.

## Deploy

Vercel, from this repository. No environment variables need to be set:
`metadataBase` reads `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel injects
at build time, so the share card resolves to the production domain.

No remote image hosts are declared in `next.config.ts`; a new external
image source has to be added there before `next/image` will load it.

## Licence

Personal project. The code is here to be read; the content, images and
branding are not for reuse.
