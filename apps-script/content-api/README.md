# Fellowship Content Publisher (Apps Script)

Because Varsity Workspace only allows **Anyone in Varsity Tutors** for web apps,
Netlify cannot call an Apps Script `/exec` URL anonymously.

Instead, this script **pushes** parsed doc JSON into the GitHub repo. Netlify
then builds from those files — no anonymous Google access needed.

```
You click “Publish site content” (or a timer runs)
  → Apps Script (as you) opens company docs + parses them
  → commits JSON files to GitHub under src/content/docs/
  → Netlify rebuilds from git (if the repo is linked)
```

## One-time setup

### 1. Paste the script

1. [script.google.com](https://script.google.com) → **New project** (or reuse the one you already made)
2. Replace `Code.gs` with [`Code.gs`](./Code.gs) from this folder
3. Confirm the `DOC_IDS` map matches your docs (already filled from the site)

### 2. GitHub token for the script

1. Create a classic PAT at https://github.com/settings/tokens  
   Scope: **`repo`** (needs write access to `megankeastott/fellowship-team-homepage`)
2. In Apps Script: **Project Settings** (gear) → **Script properties** → **Add**:

| Property | Value |
|----------|--------|
| `GITHUB_TOKEN` | the PAT |
| `GITHUB_OWNER` | `megankeastott` |
| `GITHUB_REPO` | `fellowship-team-homepage` |
| `GITHUB_BRANCH` | `main` |

### 3. Authorize DocumentApp + UrlFetch

Run `publishToGitHub` once from the editor (**Run** ▶). Google will ask you to
authorize Google Docs access and external requests — approve both.

### 4. Add the menu (optional but nice)

Reload the script editor, or run `onOpen` once. When you open the **bound**
project… actually this is a standalone project. Use:

- Editor: select `publishToGitHub` → **Run**, or  
- Deploy a thin web app only for *you* (Anyone in Varsity) that triggers publish — optional.

Simplest: pin the Apps Script project and run `publishToGitHub` whenever content changes.

You can also add a **Time-driven trigger** (clock) → `publishToGitHub` → hourly/daily
so the site refreshes without manual runs.

## After you publish

You should see a GitHub commit like `content: publish Google Docs to site`.
If Netlify is linked to the repo, a deploy starts automatically. If not, trigger
a deploy manually — the build will pick up the JSON under `src/content/docs/`.

## Smoke test

After a successful run, open the repo and check files like:

- `src/content/docs/announcements.json`
- `src/content/docs/documentation.json`

Each should have a `sections` array.
