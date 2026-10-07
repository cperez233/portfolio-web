# Portfolio — Cristian Pérez

Personal portfolio site: full-stack engineering, workflow automation and
audiovisual production, presented for the people who hire for it rather
than for the people who build it.

Bilingual (EN / ES), dark and light themes, scroll-driven motion.

**Live:** https://www.cristianperez.me (English) · https://www.cristianperez.me/es (Spanish)

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (`@theme` tokens, no config file) |
| Motion | Framer Motion 13 · Lenis (inertial scroll) |
| 3D | three.js (GitHub board only, loaded on demand) |
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
├─ proxy.ts          sends Spanish-speaking visitors from / to /es
├─ app/
│  ├─ (en)/           root layout + page for / (English)
│  ├─ (es)/es/        root layout + page for /es (Spanish)
│  ├─ robots.ts, sitemap.ts   both URLs, with hreflang alternates
│  ├─ llms.txt/       plain-text summary for AI assistants, built from content.ts
│  ├─ api/audit/      free site check behind the #audit form (SSRF-guarded)
│  ├─ og-image.png/   route that renders the 1200x630 share card
│  ├─ global-not-found.tsx  the 404 (King Crimson erased this page)
│  └─ globals.css     design tokens (@theme) + theme overrides
├─ components/
│  ├─ root-shell.tsx  <html>/<body>, fonts, metadata per language, analytics
│  ├─ home-page.tsx   section composition, shared by both languages
│  ├─ json-ld.tsx     Person / WebSite / ProfilePage structured data
│  ├─ about.tsx       editorial blocks + highlight grid
│  ├─ mini-projects.tsx     live sites: swipe on phones, drifts on desktop
│  ├─ projects.tsx    case studies (+ testimonials.tsx at the end)
│  ├─ pricing.tsx     three plans with "from" prices + custom quote row
│  ├─ audit.tsx       free 6-point check with a WhatsApp hook
│  ├─ faq.tsx         <details> FAQ, mirrored as FAQPage in JSON-LD
│  ├─ github-arena/   GitHub contributions as a 3D manga board (three.js)
│  ├─ easter-eggs.tsx keyboard easter eggs (see below)
│  ├─ mini-stand/     the floating mini Stand companion and its lines
│  ├─ diagrams/       code-drawn architecture / pipeline / terminal panels
│  └─ ui/             primitives and the larger composed pieces
├─ data/
│  ├─ content.ts      every translatable string, EN + ES
│  ├─ diagrams.ts     diagram structure: nodes, columns, commands
│  └─ site.ts         URLs, images, proper nouns, plan prices (no translation)
└─ lib/
   ├─ language.tsx    language provider (initial language comes from the URL)
   ├─ language-detection.ts  URL per language + entry-language rules
   ├─ site-url.ts     absolute site URL for metadata, sitemap and JSON-LD
   ├─ theme.ts        theme store (+ theme-storage.ts for the key)
   ├─ smooth-scroll.ts  Lenis access for programmatic jumps
   └─ utils.ts        cn() helper
```

The split between `content.ts` and `site.ts` is deliberate: anything a
reader sees in their own language lives in the dictionary; anything that
is a proper noun, a URL or an asset path stays language-independent.
Diagrams follow the same split: `diagrams.ts` holds the structure and the
terminal commands, `content.ts` the node labels and log output.

## Languages and SEO

Each language has its own server-rendered URL: `/` is English and `/es`
is Spanish, with `hreflang` in the `<head>` and in the sitemap. Two root
layouts (route groups `(en)` and `(es)`) exist only so `<html lang>` is
correct from the server; both render `RootShell`.

The toggle is a real link to the other version. With JavaScript it swaps
the language in place (crossfade, scroll kept) and rewrites the URL with
`history.replaceState`. `proxy.ts` only runs on `/`: visitors whose
browser or country asks for Spanish, or who picked Spanish before, are
redirected to `/es`. `/es` is never redirected, so it can be indexed and
shared. Title and description per language live in `content.ts`
(`meta`).

WhatsApp clicks are sent to Vercel Analytics as `whatsapp_click` (custom
events need a Pro plan; page views work on Hobby).

## GitHub board

`lib/github-contributions.ts` reads the public contribution calendar from
github-contributions-api.jogruber.de (GitHub has no token-free endpoint)
and the home page revalidates it once a day. If the request fails, it
falls back to `data/github-snapshot.json`, so a build never breaks and the
section never renders empty. Only public contributions are counted unless
"Private contributions" is switched on in the GitHub profile settings.

The server renders a flat 53 x 7 calendar. `components/github-arena/scene.ts`
(plain three.js: two `InstancedMesh`, toon shading, inverted-hull ink
outlines, fog) is imported only when the section is 600px away, draws on
top, and the flat calendar fades out. No WebGL, no JS: the flat one stays.
The render loop stops off-screen.

## Moving around

- **Section curtain** (`ui/section-curtain.tsx`): an anchor link more than
  1.3 screens away no longer scrolls through the whole page. A gold and
  ink slab cover the screen, the jump happens behind them, and the
  "Part N · Section" title card shows before they open. Closer anchors
  still glide with Lenis, which now has `anchors: false` so it does not
  catch the click too. Skipped under reduced motion.
- **Projects** are chapters (第1話, 第2話…): one case at a time, tabs with
  arrow-key support, and the page turns toward the side you go. The
  other cases stay in the HTML, hidden, for crawlers.
- **Mini Stand** (`mini-stand/`): Paranoid Android as a pixel-art sprite
  on a small canvas, moved with spring physics. It lives on the hero
  portrait (`data-stand-home`), flies out when the hero scrolls away and
  perches on whatever is being read (`data-spot` elements). Its own
  JoJo character: it lands with a ドン, gives off ゴ while still, strikes
  poses, and its speech bubbles type themselves out. Each spot has several
  lines in `lines.ts`, shuffled and not repeated. It reacts to the page
  (theme and language switches, WhatsApp clicks, copying, coming back to
  the tab, scrolling too fast, being stared at, the forms, reaching the
  end, the easter eggs) through listeners and the `jojo:event` bus, and
  sleeps after 12 s idle. Tapping it opens a manga chat
  (`stand-chat.tsx`): who it is, facts about Cristian taken from the page,
  jan-ken (`janken.tsx`) or a borrowed Stand power (`powers.ts`):
  ZA WARUDO (inverts the page and freezes every loop), Crazy Diamond
  (cracks and repairs the element it sits on), Echoes (sticks sound
  effects on the page), Hermit Purple (reads your visit: time, parts
  read, secrets), Bites the Dust (rewinds your scroll) and King Crimson
  (skips to the next section). All visual, nothing is removed.
- **Secrets** (`lib/secrets.ts`, `components/secrets.tsx`): eleven, stored
  per visitor in localStorage, counted in the footer ("Secrets 3/11") and
  announced when found. Names show only once found.
- **3D props** (`jojo-3d/`): the Stand Arrow next to the Stand card (drag
  to spin, tap to throw it at the card) and a 3D ゴゴゴ in the contact
  section. Same toon shading and ink outlines as the GitHub board, loaded
  on demand through `use-lazy-scene.ts`.
- **Page changes between documents** (404 → home, a language link):
  cross-document View Transitions in `globals.css`, a diagonal reveal.

## Easter eggs

- Tap the hero portrait: ZA WARUDO.
- Hit columns on the GitHub board: オラ (無駄 on an empty day); six quick
  hits fire a barrage.
- Type `ora` or `muda` anywhere outside a form field.
- Konami code: sepia freeze frame with the "To Be Continued" arrow.
- Switch tabs: the title goes ゴゴゴゴ.
- The console says hi and gives the hints.

All motion-only eggs are skipped under `prefers-reduced-motion`. The
full list is deliberately not written here either.

## Prices and testimonials

Plan prices live once, in `plans` in `site.ts` (COP for `/es`, USD for
`/`). The pricing cards, FAQ answers (`{landing}`, `{web}`, `{panel}`),
JSON-LD offers and `llms.txt` all read from there.

A testimonial only renders with `approved: true` in `site.ts`, after the
client has read and accepted the exact quote in `content.ts`.

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
displays them today. The FCV shots (`fcv-*.jpg`) are not screenshots:
the real captures contained names and national ID numbers, so the three
screens are recreated in HTML with masked data and rendered at 2x with
headless Chromium. Sources in `assets-src/fcv-mockups/`.

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
