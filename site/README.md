# Cutting Onions — website

A single-page site for the Hong Kong restaurant. Plain HTML, CSS and JavaScript:
no build step, no framework, no dependencies. Open `index.html` and it runs.

```
site/
├─ index.html              the whole page
├─ robots.txt
└─ assets/
   ├─ css/style.css        all styling
   ├─ js/onion-field.js    the hero's onion physics + cutting
   ├─ js/site.js           language, nav, menu tabs, reveals, ticker
   └─ img/                 marks, food replicas, photography, icons
```

## Run it locally

```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

A plain `open index.html` also works, but a server is closer to production.

## Deploy

Upload the contents of `site/` to any static host — Netlify, Vercel, Cloudflare
Pages, GitHub Pages, or ordinary shared hosting. There is nothing to build and
no server-side code.

---

## Fill these in before going live

Every placeholder is written in `[square brackets]` so you can find them all:

```bash
grep -rn '\[' index.html robots.txt
```

| Placeholder | Where | What it needs |
|---|---|---|
| `[YOUR-DOMAIN]` | `<head>`, JSON-LD, robots.txt | the live domain, for the canonical URL and social card |
| `[Shop / Street]` `[舖號／街道]` | Visit, footer, JSON-LD | street address |
| `[District]` `[地區]` | hero, Visit, footer, JSON-LD | district |
| `[Year]` `[年份]` | hero kicker | opening year |
| `[12:00–15:00]` `[18:00–23:00]` | Visit, JSON-LD | real service hours |
| `[+852 0000 0000]` | Visit (also the `tel:` link) | phone number |
| `[HANDLE]` `[@cuttingonions]` | gallery tile, footer, JSON-LD | Instagram handle |
| `[BOOKING-LINK]` | Visit button | booking system URL, or a `tel:` link |
| `[Her name]` | Story section, English copy only | the owner's name |
| `[Pin the exact spot]` | Visit | replace the drawn map with a real embed |

The map is a hand-drawn SVG placeholder. Swap it for a Google Maps embed
if you want the real thing — but note an embed loads third-party scripts.

---

## Editing content

**Menu items** live directly in `index.html` under `<section class="sec--menu">`.
One item is one `<li class="mi">`: Chinese name, then a row with the English
name, an optional `<span class="veg veg--sm">V</span>`, the dotted leader
`<i></i>`, and the price. Add `<p class="mi__d">` underneath for the
ingredient line. Prices are plain text — no formatting to keep in sync.

**Bilingual copy** uses paired elements, so both languages ship in the HTML and
are indexable:

```html
<span data-l="zh">中文</span><span data-l="en">English</span>
```

CSS hides whichever language is not active. Dish names deliberately show
**both** at once, the way the printed menu does — those carry no `data-l`.

The site opens in 中文. A visitor's choice is remembered in `localStorage`.

**Photography** is two deliberate registers:
- Dishes are **食物模型** replicas on a flat cream ground — clean and
  consistent, like a shopfront window.
- The gallery is **real photography**, as shot.

Keep that split when adding images. Each image has a `-800`/`-1280` pair for
`srcset` in both `.webp` and `.jpg`.

---

## The hero

`assets/js/onion-field.js` runs a small soft-body simulation on a 2D canvas —
around 74 onions (each one the sunglasses mark off the glassware: round, no
legs, no lettering) pulled toward the centre, burying the logo. The pointer
parts them; a stroke faster than 7px per frame becomes a blade and cuts any
onion it sweeps through into two halves that show their rings. Fourteen cuts
and the prompt changes to 而家好啲未？

It is drawn with canvas paths, not images, so it stays sharp at any size.
Tune it at the top of the file:

- `densityFor()` — how many onions, scaled to the viewport
- `SKINS` — the fill / grain / ring colours
- the `14` threshold lives in `site.js`, in the `onion:cut` handler

It pauses when the hero scrolls out of view or the tab is hidden, and is
skipped entirely under `prefers-reduced-motion`.

---

## Accessibility and performance notes

- Menu tabs are a real ARIA tablist with arrow-key, Home and End support.
- `prefers-reduced-motion` stops the field, the ticker, the reveals and
  smooth scrolling; nothing is hidden as a result.
- Scroll reveals only hide content once JavaScript has confirmed it can bring
  it back (`html.js`), with a timed safety net — content never gets stranded
  at `opacity: 0`.
- Images below the fold are lazy-loaded and carry width/height to avoid
  layout shift.
- Only external request is Google Fonts. To go fully self-hosted, download
  Rammetto One, Archivo and Noto Sans HK into `assets/fonts/` and replace the
  `<link>` with `@font-face` rules.

## Type

Display face is **Rammetto One**, standing in for the hand-drawn sign
lettering. If the original wordmark artwork exists, use it for the hero and
footer wordmark — the site will get noticeably sharper.
