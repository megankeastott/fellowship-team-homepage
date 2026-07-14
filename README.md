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
Google Docs (company Workspace — editors write here)
      │
      │  Apps Script publishToGitHub()  (runs as you)
      ▼
src/content/docs/*.json  in GitHub
      │
      ▼
Astro build on Netlify  ──►  static HTML
```

Workspace only allows “Anyone in Varsity” for Apps Script web apps, so Netlify
cannot pull docs anonymously. Instead Apps Script **pushes** parsed JSON into
the repo ([`apps-script/content-api/`](./apps-script/content-api/)).

- **Doc IDs**: [`src/config/docs.ts`](./src/config/docs.ts)
- **Published content**: [`src/content/docs/`](./src/content/docs/)
- **Team data**: [`src/config/team.ts`](./src/config/team.ts)
- **Site map / nav**: [`src/config/site.ts`](./src/config/site.ts)

For content editors, see [EDITING-GUIDE.md](./EDITING-GUIDE.md).
For the publish bridge, see [`apps-script/content-api/README.md`](./apps-script/content-api/README.md).

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

Doc IDs live in [`src/config/docs.ts`](./src/config/docs.ts). To refresh article
pages from the docs:

1. Follow [`apps-script/content-api/README.md`](./apps-script/content-api/README.md)
2. Run `publishToGitHub` in Apps Script
3. Netlify rebuilds from the committed JSON (or trigger a deploy)

Parser conventions: [EDITING-GUIDE.md](./EDITING-GUIDE.md).

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
