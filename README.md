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
├─ app/
│  ├─ layout.tsx      fonts, metadata, providers, floating nav
│  ├─ page.tsx        section composition only
│  └─ globals.css     design tokens (@theme) + theme overrides
├─ components/
│  ├─ about.tsx       editorial blocks + highlight grid
│  ├─ marquee-section.tsx   scroll-driven text band
│  ├─ projects.tsx    sticky stacking cards
│  └─ ui/             primitives and the larger composed pieces
├─ data/
│  ├─ content.ts      every translatable string, EN + ES
│  └─ site.ts         URLs, images, proper nouns (no translation)
└─ lib/
   ├─ language.tsx    language provider
   ├─ smooth-scroll.ts  Lenis access for programmatic jumps
   └─ utils.ts        cn() helper
```

The split between `content.ts` and `site.ts` is deliberate: anything a
reader sees in their own language lives in the dictionary; anything that
is a proper noun, a URL or an asset path stays language-independent.

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
marquee and about sections only.

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

`public/projects/` holds the screenshots the site displays. The document
extraction shots are redacted: the original captures contained real
names and national ID numbers, and the identifying columns are blurred
before publication.

The unredacted originals live in `assets-src/`, which is excluded from
both git and the Vercel deploy. They are not in this repository and
should not be added to it.

## Deploy

Vercel, from this repository. No environment variables are required.
`next.config.ts` declares the remote image hosts, so a new external
image source has to be added there before `next/image` will load it.

## Licence

Personal project. The code is here to be read; the content, images and
branding are not for reuse.
