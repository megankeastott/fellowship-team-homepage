# Editing Guide — The Fellowship of the Fix

The articles on this site live in **Google Docs**. When you edit a doc, the
change shows up on the site the next time it's published (see "Publishing
changes" at the bottom). You don't need to touch any code to update content.

This guide covers the **simplified formatting** we use in the docs. It's short
on purpose — the goal is that anyone can update a page without stress.

---

## The only 3 things you really need

### 1. Heading 1 = a section
Use the **Heading 1** style (Format → Paragraph styles → Heading 1) for a big
section title. Everything below it, until the next Heading 1, belongs to that
section.

You can *optionally* add a little icon by putting one of these words in square
brackets at the end:

`candle` · `tome` · `door` · `quill` · `lantern` · `mug` · `compass` · `pipe`

> Example: `Announcements [candle]`

### 2. Heading 2 = a card
Use the **Heading 2** style for each "card" (a box of content). Everything under
it belongs to that card until the next Heading 2 (or Heading 1).

You can *optionally* set a **color** and make it **full width**:

- Colors: `shire` (green), `hearth` (gold), `evenstar` (teal), `earthen`
  (brown), `shadow` (red), `twilight` (purple)
- Width: add `full` to make the card span the whole row

> Examples:
> `City Rates [shire]`
> `Big Announcement [hearth, full]`

If you don't add anything, the card is green and half-width.

### 3. Normal writing just works
Inside a card, type normally. These all work automatically:

- **Bold** and *italic*
- Links (paste a URL or use Insert → Link)
- Bullet lists and numbered lists
- **Heading 3** for a small sub-title inside a card

That's it. If you only ever use the three things above, the page will look great.

---

## Two optional extras

If you want a little more, there are two simple "tags" you can type on their own
line:

**Callout box** — a highlighted note:

```
[callout hearth] Remember to log your hours by Friday! [/callout]
```

(Use any color word from the list above.)

**Divider line** — a horizontal rule:

```
[hr]
```

---

## Tips for stress-free editing

- Stick to the **built-in Heading styles** (Heading 1, 2, 3) rather than just
  making text big and bold. The site uses the heading style to know what's a
  section vs. a card.
- Don't worry about fonts, colors of text, or spacing in the doc — the site
  applies its own consistent styling. What you type is what matters, not how it
  looks in the doc.
- Square-bracket tags (`[shire]`, `[callout ...]`, etc.) only do something in the
  specific spots described above. Anywhere else they'll just show as text.

---

## Publishing changes

Doc edits don't hit the live site until someone **publishes** them:

1. Open the Fellowship content Apps Script project
2. Run `publishToGitHub` (select it in the function dropdown → Run)
3. That commits fresh JSON into GitHub under `src/content/docs/`
4. Netlify rebuilds (automatically if the repo is linked, otherwise trigger a deploy)

If a page says “Waiting for content publish,” the JSON for that doc hasn't been
published yet — run the step above.
