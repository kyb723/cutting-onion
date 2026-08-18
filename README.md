# Cutting Onions

Website for the Hong Kong restaurant Cutting Onions — 唔好喊.

| | |
|---|---|
| [`site/`](site/) | the website. Plain HTML/CSS/JS, no build step. See [site/README.md](site/README.md) |
| [`design/`](design/) | design-canvas working files (`.dc.html` artboards + brand art) |
| [`assets/`](assets/) | source material: menu photographs, food shots, logo references |

`site/` is published to GitHub Pages automatically on every push to `main`,
by [.github/workflows/pages.yml](.github/workflows/pages.yml).

## Run locally

```bash
cd site && python3 -m http.server 8000
```

Placeholders still to fill in (address, hours, phone, Instagram, booking link)
are listed in [site/README.md](site/README.md).
