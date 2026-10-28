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
│  ├─ mini-projects.tsx     live sites: a drifting strip you can drag and fling
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
  perches on whatever is being read (`data-spot` elements). It does not
  move on rails: every trip gets its own spring (quick, lazy, bouncy or
  not) and a curve to a random side, it lands on a different point of
  each ledge, floats to either side when no ledge is in view, and while
  perched it hops, takes a few steps or turns around now and then. Its own
  JoJo character: it lands with a ドン, gives off ゴ while still, strikes
  poses, and its speech bubbles type themselves out. Each spot has several
  lines in `lines.ts`, shuffled and not repeated. It greets by time of
  day and counts visits; while perched it does little bits on its own
  (pose, twirl, shadow-boxing, yawning, looking around) and thinks out
  loud when it has been quiet for a while. Shouts get a gold bubble,
  sleep a thought bubble. It can be grabbed and thrown: it flies, bounces
  off the edges and ends up dizzy, leaving afterimages when it moves
  fast; it stretches a little in flight and squashes when it lands. Its
  eyes follow the mouse sideways and up or down. It reacts to the page
  (theme and language switches, WhatsApp clicks or hovering on it,
  copying, coming back to the tab, scrolling too fast, being stared at,
  changing project chapter, opening a FAQ or a service, looking at a plan,
  reading a review, swiping a case's screenshots, flinging the sites
  strip, opening a live site or GitHub, typing in a form, sending it,
  reaching the end, the easter eggs) and to you: rub it with the mouse
  and it blushes and lets out hearts, a right click embarrasses it, and
  it notices the mouse leaving the window, the connection dropping or
  coming back, a long text selection and printing. All of it goes
  through listeners and the `jojo:event` bus, and it sleeps after 12 s
  idle. Tapping it opens a manga chat (`stand-chat.tsx`): who it is,
  facts about Cristian taken from the page, JoJo trivia, a guided jump
  to a section (through the section curtain), jan-ken (`janken.tsx`) or
  a borrowed Stand power (`powers.ts`, helpers in `power-kit.ts`), several
  with variants picked so they don't repeat: ZA WARUDO (a real time stop,
  see below), Star Platinum (ORA rush onto a card, Star Finger, or The
  World with punches that land when time resumes), Crazy Diamond
  (shatters every piece on screen, sampled on a grid so boxes break too,
  then repairs them one by one), Gold Experience (a golden burst of life, then a garden, a swaying tree growing
  from the bottom, a card turning into a frog, butterflies, or a title
  turning into a snake), Echoes (ACT 1 sounds that shake what they touch,
  ACT 2 stickers you tap, ACT 3 FREEZE), Soft & Wet (bubbles that steal a
  title's colour or a whole image until you pop them), Hermit Purple
  (thorny vines and a developing spirit photo with your visit), Made in
  Heaven (animations up to 14x, day and night flashing, then the universe
  starts resetting to the old burgundy site until the Stand stops it),
  Bites the Dust (Killer Queen into an eye, カチッ, explosion, the page
  rewinding in jolts with every loop running backwards, and a déjà vu)
  and King Crimson. All visual, nothing is removed, one at a time.
  Every random line comes from `pick.ts`: none of the last 3 picks of a
  list comes back until a fourth one has been said.
- **Time stop** (`lib/time-stop.ts`): the portrait tap and ZA WARUDO
  freeze the page for real: scroll, wheel, touch, keys and clicks are
  blocked, CSS and Web Animations pause, videos pause and the 3D scenes
  stop. The Stand freezes too (as seen from outside in the series). When
  the portrait stopped time it comes back sweating ("I couldn't
  move…!"). When it cast ZA WARUDO itself, its bubble goes away for the
  stop and on resume it is already
  somewhere else on screen in a JoJo pose, laughing, its silhouette
  fades where it was, and it gloats about the section (or about you
  trying to move).
- **Expressions** (`mini-stand/sprite.ts`): a frame is a body and a face
  that combine freely. Bodies: idle, punch, five JoJo poses (fist by the
  visor, both fists up, pointing, arms wide, fist overhead) and two
  punches toward the viewer for the rush. Faces: open (looking sideways
  and up or down), blink, happy, smug, angry, sweating, starry-eyed, sad,
  dizzy, shock, laughing (> <), heart eyes, wink and blush. Plus manga
  marks over its head (!?, ＃, ♪, …), picked per reaction, per jan-ken
  round and after each power (King Crimson even skips its flight: it is
  just there).
- **Secrets** (`lib/secrets.ts`, `components/secrets.tsx`): eleven, stored
  per visitor in localStorage, counted in the footer ("Secrets 3/11") and
  announced when found. Names show only once found.
- **3D props** (`jojo-3d/`): the Stand Arrow next to the Stand card (drag
  to spin, tap to throw it at the card) and a 3D ゴゴゴ in the contact
  section. Same toon shading and ink outlines as the GitHub board, loaded
  on demand through `use-lazy-scene.ts`.
- **Hero entrance** (`ui/portfolio-hero.tsx`, timings in `ENTRY`): CSS
  from first paint. Speed lines converge, the name slams in letter by
  letter and gets its hard shadow, the portrait is pasted on with a
  shake and a ドン, then a giant Paranoid Android (`ui/hero-stand.tsx`,
  the mini Stand's own pixel map drawn as SVG; the server sends only the
  entrance frame and the rest are built in the browser the first time
  they are needed) rises beside it, stays
  big for its whole power, and only then shrinks into the exact spot and size of the mini Stand (same frame, a
  one-frame cut, no fade). The mini Stand is hidden from the first paint
  by `ui/stand-manifest-gate.tsx` (a server-rendered script that sets
  `html.stand-manifest`); it used to be set after hydration and left a
  fading ghost. While the Stand is big, one of two things happens, and
  they alternate on every load (remembered in `localStorage`, force one
  with `?intro=diamond` or `?intro=world`):
  - **Crazy Diamond** (`ui/hero-crack.ts`): the Stand breaks the fourth
    wall. A ドラララ rush at the screen itself: every fist (pixel art,
    seen from the front) leaves its chest and grows toward the viewer
    until it hits the glass, squashes against it and pulls back. Each
    hit leaves a star of cracks where it landed and dents the page
    behind. While it punches the Stand alternates fists, grows extra
    flickering arms from the speed and lunges with every hit. The
    ドラァ! finisher goes to the middle of the screen: a white flash, a
    150 ms hit-stop, a web of cracks across the whole screen (also
    through each letter), the letters thrown back and shards of glass
    falling. The Stand notices ("Oops… your screen") and Crazy Diamond
    fixes it: the shards fly back up, every crack closes toward its fist
    and the letters return. Only `clip-path` and transforms animate.
  - **ZA WARUDO**: the Stand shouts ザ・ワールド and stops time for real
    (`lib/time-stop.ts`, the mini Stand's own power with its sphere).
    While time is stopped nothing visible happens: it freezes with
    everything else and doesn't even breathe. When time resumes it is
    suddenly on the other side of the portrait (or higher up when there
    is no room), facing it in a JoJo pose (a random one of five, tilted
    like a manga panel), with its grey silhouette fading where it was.
    Then it tells a two-part joke about stopping time just to pose and
    laughs at it (フハハハ, WRYYY).
  - Either way, after the handover the mini Stand closes with a line
    about what just happened and, a few seconds later, greets you
    (`jojo:intro` events, handled in `mini-stand/mini-stand.tsx`; lines
    in `lines.ts` under `intro`).

  With a mouse the layers move with the pointer; on scroll the two name
  lines split apart. The mini Stand greets by the visitor's hour in seven
  bands (night owl, early, morning, midday, afternoon, evening, late).
- **Sound** (`lib/sfx.ts`): off by default, synthesized with Web Audio
  (no files). Turn it on from the Stand's chat ("Turn sound on"); it is
  remembered. Browsers only let audio start after a first tap, so a first
  visit's entrance may be silent; the portrait's ZA WARUDO and the powers
  sound whenever it is on.
- **Language switch** (`ui/language-curtain.tsx`, driven by
  `lib/language.tsx`): a gold disc with an ink edge grows from the
  pressed EN/ES button, names the destination language, the page text
  swaps while covered and the disc shrinks back into the button. Timers,
  a lock against double clicks, focus stays on the button and the new
  language is announced in a polite live region.
- **Theme switch** (`lib/theme.ts`): a same-document View Transition
  reveals the new theme from the button as a screentone wave (dots that
  grow and merge, masks in `globals.css`). Without View Transitions it
  is the plain switch.
- **Page changes between documents** (404 → home, a language link):
  cross-document View Transitions in `globals.css`, a diagonal reveal.
- All of the above skip under `prefers-reduced-motion`: the hero rests
  in its final state, language and theme change instantly.

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

`public/projects/` holds the case-study screenshots. Tostrivia's are real
captures of the running app (desktop 1600x1000, phone 780x1688). The FCV
ones are not captures: the real screens contained names, national ID
numbers and internal inventory, so they are recreated in HTML (the FCV
records ones with masked data and rendered at 2x with headless Chromium;
the assets app with its real CSS and demo data; the wiki with the theme's
palette and generic content). Sources in `assets-src/`, which is not
versioned.

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
