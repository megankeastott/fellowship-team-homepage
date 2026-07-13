# The Fellowship of the Fix — Team Homepage

Static site for the Operations Support / Tutor Team, built with
[Astro](https://astro.build) and hosted on Netlify. Article content is pulled
from **published Google Docs at build time**, so editors keep working in Google
Docs while the live site stays fast and doesn't depend on Google at request time.

This project replaces the original Google Apps Script web app (preserved in
[`legacy/`](./legacy) for reference).

---

## How it works

```
Google Docs (editors write here)
      │  fetched + parsed at build time
      ▼
Astro build  ──►  static HTML  ──►  Netlify (hosting)
      ▲
GitHub (this repo: layout, styles, data, config)
```

- **Content** (articles): Google Docs → see [`src/config/docs.ts`](./src/config/docs.ts)
- **Layout / styling / structure**: this repo
- **Team data** (leads, LOD schedule, roster, incentives): [`src/config/team.ts`](./src/config/team.ts)
- **Site map / nav / routes**: [`src/config/site.ts`](./src/config/site.ts)

For content editors, see [EDITING-GUIDE.md](./EDITING-GUIDE.md).

---

## Project structure

```
src/
  config/
    site.ts        # routes, nav, external links
    docs.ts        # which Google Doc feeds each page   ← wire up doc IDs here
    team.ts        # leads, LOD schedule, roster, incentives, superlatives
  lib/
    googleDocs.ts  # build-time fetch + parse of published Google Docs
  layouts/
    Shell.astro    # page frame (title, nav, footer, fireflies)
  components/       # Icon, LeafDivider, Fireflies, PageHeading, DocContent
  pages/
    index.astro        # Home (Now on Duty, LOD schedule, leads, dispatches)
    [...slug].astro    # all doc pages + hub landing pages
    team-hub.astro     # Team Hub
    404.astro
  styles/            # global.css, home.css, team-hub.css
legacy/              # original Apps Script files (not deployed)
```

---

## Wiring up the Google Docs

The pages show a friendly "not wired up yet" placeholder until you add doc
sources. Open [`src/config/docs.ts`](./src/config/docs.ts) and, for each page,
set **one** of:

- `docId` — the ID from a normal doc URL
  `https://docs.google.com/document/d/`**`THIS_PART`**`/edit`
  (the doc must be shared so **Anyone with the link** can **view**), or
- `pubUrl` — the full **Publish to web** URL
  (`File → Share → Publish to web` → `https://docs.google.com/document/d/e/…/pub`)

Then rebuild. The parser understands the doc conventions described in
[EDITING-GUIDE.md](./EDITING-GUIDE.md).

---

## Local development

Requires Node 18+ (this repo was set up with Node 20/24 via `nvm`).

```bash
npm install
npm run dev       # local dev server at http://localhost:4321
npm run build     # production build to dist/
npm run preview   # preview the production build
```

> If a build ever errors on `mkdir .../Library/Preferences/astro`, that's Astro
> telemetry. It's disabled in CI via `netlify.toml`; locally you can run
> `npx astro telemetry disable` once, or prefix commands with
> `ASTRO_TELEMETRY_DISABLED=1`.

---

## Deploying to Netlify

Build settings are in [`netlify.toml`](./netlify.toml):

- Build command: `npm run build`
- Publish directory: `dist`

First-time setup:

```bash
npx netlify login
npx netlify init          # link this repo to a Netlify site
npx netlify deploy --prod # or let Git-based deploys handle it
```

Because content is fetched at build time, **re-deploy to publish doc edits**.
Set up a scheduled build or a build hook so edits go live automatically (e.g. a
daily rebuild, or a "Publish" button that hits the build hook URL).

---

## Updating team data

Edit [`src/config/team.ts`](./src/config/team.ts) and rebuild:

- `TEAM_LEADS` — leads & senior specialists (bios, medallions, links)
- `LOD_SCHEDULE` — the weekly Leader-on-Duty rotation
- `TEAM_ROSTER` — the Red Book roster on the Team Hub
- `INCENTIVES` / `SUPERLATIVES` — Dragon's Hoard & Green Dragon sections
- `EXTERNAL.bingoUrl` in `src/config/site.ts` — the Bingo link
