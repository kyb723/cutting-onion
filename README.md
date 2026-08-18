# Cutting Onions

Website for the Hong Kong restaurant Cutting Onions — 唔好喊.
Live at **https://kyb723.github.io/cutting-onion/**

Plain HTML, CSS and JavaScript. No build step, no framework, no dependencies —
the repo root *is* the site, published straight from `main` by GitHub Pages.

```
├─ index.html          the whole page
├─ assets/css/         styling
├─ assets/js/          onion-field.js (the hero) + site.js (everything else)
├─ assets/img/         marks, food replicas, photography, icons
├─ design/             design-canvas working files (.dc.html artboards)
└─ source/             original menu photographs and logo references
```

## Run locally

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Fill these in before sharing it around

Every placeholder is in `[square brackets]`:

```bash
grep -n '\[' index.html
```

| Placeholder | What it needs |
|---|---|
| `[YOUR-DOMAIN]` | live domain, for the canonical URL and social card |
| `[Shop / Street]` `[舖號／街道]` | street address |
| `[District]` `[地區]` | district |
| `[Year]` `[年份]` | opening year |
| `[12:00–15:00]` `[18:00–23:00]` | real service hours |
| `[+852 0000 0000]` | phone number (also the `tel:` link) |
| `[HANDLE]` `[@cuttingonions]` | Instagram handle |
| `[BOOKING-LINK]` | booking URL, or a `tel:` link |
| `[Her name]` | the owner's name, English copy only |

The map is a drawn SVG placeholder — swap it for a real embed when you want.

## Editing content

**Menu items** are in `index.html` under `<section class="sec--menu">`. One item
is one `<li class="mi">`: Chinese name, then a row with the English name, an
optional `<span class="veg veg--sm">V</span>`, the dotted leader `<i></i>`, and
the price.

**Bilingual copy** ships both languages in the HTML so both get indexed:

```html
<span data-l="zh">中文</span><span data-l="en">English</span>
```

CSS hides whichever is inactive. Dish names deliberately show **both** at once,
the way the printed menu does — those carry no `data-l`. The site opens in 中文
and remembers a visitor's choice in `localStorage`.

**Photography** is two deliberate registers: dishes are 食物模型 replicas on flat
cream, the gallery is real photography as shot. Keep that split.

## The hero

`assets/js/onion-field.js` runs a small soft-body simulation on a 2D canvas —
around 74 onions (the sunglasses mark off the glassware: round, no legs, no
lettering) pulled toward the centre, burying the logo. The pointer parts them;
a stroke faster than 7px per frame becomes a blade and cuts any onion it sweeps
through into halves that show their rings. Fourteen cuts and the prompt changes
to 而家好啲未？

Drawn with canvas paths, not images, so it stays sharp at any size. Tune
`densityFor()` and `SKINS` at the top of the file; the cut threshold lives in
`site.js`.

It pauses when the hero scrolls away or the tab is hidden, and is skipped
entirely under `prefers-reduced-motion`.

## Notes

- Menu tabs are a real ARIA tablist with arrow-key, Home and End support.
- Scroll reveals only hide content once JS confirms it can bring it back, with
  a timed safety net — nothing gets stranded at `opacity: 0`.
- Below-the-fold images are lazy-loaded with width/height set, so no layout shift.
- Only external request is Google Fonts. Rammetto One stands in for the
  hand-drawn sign lettering — if the original wordmark artwork exists, use it
  for the hero and footer and the site gets noticeably sharper.
