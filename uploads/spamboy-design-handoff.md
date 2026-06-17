# Spamboy — Design Handoff
*For use as the opening prompt in a new Claude conversation to generate all Eleventy theme files.*

---

## Project overview

Build the complete Eleventy theme for **Spamboy**, a personal blog at `spamboy.com`. The design has been fully approved through interactive mockups. This document is the authoritative spec — implement it exactly as described.

---

## Technology stack

- **Static site generator:** Eleventy (11ty)
- **Templating:** Nunjucks (`.njk`)
- **Hosting:** GitHub Pages
- **No build pipeline required** — plain CSS, no Sass, no bundler

---

## Typography

All fonts loaded from Google Fonts. Add this `<link>` to the base template `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
```

| Role | Font | Notes |
|---|---|---|
| Logotype / post titles / H2 / H3 | Fraunces | Rounded vintage serif; 700 weight for headings |
| Body copy / excerpts / blockquotes | EB Garamond | Classical serif; 18px at 1.85 line-height |
| UI chrome / nav / tags / dates / tables | DM Sans | Clean sans with character; not Inter |
| Code | `ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace` | System stack |

---

## CSS custom properties

Define these on `:root` and override in `[data-theme="dark"]`. The `data-theme` attribute lives on `<html>`.

```css
:root {
  --sb-bg: #f5f5f2;
  --sb-surface: #fafaf8;
  --sb-text: #1a1917;
  --sb-muted: #706e69;
  --sb-border: rgba(30,28,25,0.1);
  --sb-divider: rgba(30,28,25,0.07);
  --sb-accent: #4a4845;
  --sb-tag-bg: #e8e7e3;
  --sb-tag-text: #3d3b38;
  --sb-link: #3d6b8f;
  --sb-link-hover: #2a4f6e;
  --sb-code-bg: #eeede9;
  --sb-serif: 'EB Garamond', Georgia, serif;
  --sb-display: 'Fraunces', Georgia, serif;
  --sb-sans: 'DM Sans', system-ui, sans-serif;
  --sb-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
}

[data-theme="dark"] {
  --sb-bg: #3e4858;
  --sb-surface: rgba(50,61,77,0.7);
  --sb-text: #f0f2f5;
  --sb-muted: #c2c8d4;
  --sb-border: rgba(200,210,225,0.14);
  --sb-divider: rgba(200,210,225,0.1);
  --sb-accent: #d0d6e0;
  --sb-tag-bg: #323d4d;
  --sb-tag-text: #c2c8d4;
  --sb-link: #7fb3d3;
  --sb-link-hover: #a8cde3;
  --sb-code-bg: #2e3a4a;
}
```

---

## Dark mode toggle

- Controlled by a user-facing button in the header
- Toggles `data-theme="dark"` on `<html>`
- Persists via `localStorage` — restore on page load with a blocking `<script>` in `<head>` (before render, to avoid flash)
- Button label: "Dark" / "Light" with a small icon

---

## Page types & file structure

```
_includes/
  base.njk          # Full HTML shell: <head>, header, footer, dark mode script
  post.njk          # Individual post layout (extends base)
  components/
    header.njk
    footer.njk

pages/
  index.njk         # Home page
  blog.njk          # Blog archive (paginated)
  tags.njk          # Tags cloud + filtered list (client-side JS)
  about.njk         # Static page (example)
  now.njk           # Static page (example)
  projects.njk      # Static page (example)

posts/
  sample-post.md    # Full markdown showcase post

_data/
  site.js           # Global site config

public/
  css/
    spamboy.css     # Complete stylesheet
  js/
    theme.js        # Dark mode toggle + localStorage persistence
    toc.js          # ToC scroll-spy (highlights active section)
    lightbox.js     # Image lightbox

.eleventy.js        # Eleventy config
```

---

## `_data/site.js`

```js
module.exports = {
  name: "Spamboy",
  url: "https://spamboy.com",
  description: "A traveller's notebook. Written off-the-cuff, about anything at all.",
  author: "McG",
  nav: [
    { label: "Blog", url: "/blog/" },
    { label: "Projects", url: "/projects/" },
    { label: "Now", url: "/now/" },
    { label: "About", url: "/about/" },
    { label: "Tags", url: "/tags/" },
  ]
};
```

---

## Header

- Height: 52px, `position: sticky; top: 0; z-index: 10`
- Background: `var(--sb-surface)`, border-bottom: `0.5px solid var(--sb-border)`
- Left: **Spamboy** wordmark in Fraunces 700, 20px, links to `/`
- Center: nav links — Blog, Projects, Now, About, Tags — in DM Sans 11.5px, uppercase, letter-spacing 0.07em, color `var(--sb-muted)`, hover to `var(--sb-text)`
- Right: dark mode toggle — border `0.5px solid var(--sb-border)`, border-radius 6px, no background
- **Mobile (< 640px):** nav links replaced by hamburger icon. Tapping opens a full-width dropdown below the header showing all nav links stacked vertically. Tapping outside or a nav link closes it.

---

## Footer

- Background: `var(--sb-surface)`, border-top: `0.5px solid var(--sb-border)`
- Single line, center-justified: `Copyright © {year} Spamboy`
- Year should be dynamic (Eleventy `now | date("yyyy")` or JS `new Date().getFullYear()`)

---

## Home page (`index.njk`)

Single centered column, max-width 640px, padding 3.5rem 2rem 4rem.

**Intro block:**
- Italic Fraunces eyebrow: *"a traveller's notebook"*
- EB Garamond body paragraph, 19px, color `var(--sb-muted)`, line-height 1.85

**Entry list:**
Aditya Induraj-style compact list. Shows the N most recent posts (suggest 8–10). No "Read more" links — title is the click target.

Each row is a CSS grid: `3rem 1fr auto` — year anchor | title + tag pill | date.
- Year shown only on first post of each year, blank for subsequent posts in same year
- Title: EB Garamond 18px
- Tag: inline pill, DM Sans 10.5px, background `var(--sb-tag-bg)`
- Date: DM Sans 13px, `var(--sb-muted)`, flush right
- Row separated by `0.5px solid var(--sb-divider)`
- Hover: title color transitions to `var(--sb-muted)`

---

## Blog archive (`blog.njk`)

Same centered column as home. Uses Eleventy pagination (`pagination` in front matter, size: 5).

**Page heading:** "Blog" in Fraunces 26px  
**Subhead:** "All entries, newest first." in EB Garamond 16px, `var(--sb-muted)`

**Post cards** (different from home — includes excerpt):
- Meta row: date · tag pills
- Title: Fraunces 20px, 700, click target, hover to `var(--sb-muted)`
- Excerpt: EB Garamond 16px, 1.75 line-height, `var(--sb-muted)`
- Separated by `0.5px solid var(--sb-divider)`

**Pagination:**
- "← Newer" and "Older →" as `<a>` tags (not `<button>`) — DM Sans 12px, uppercase, no border, no background
- "Newer" is `visibility: hidden` (not `display: none`) on page 1 to preserve layout
- "Older" is `visibility: hidden` on the last page
- No page counter displayed

---

## Individual post (`post.njk`)

**Layout:** CSS grid, `200px 1fr 80px` — ToC sidebar | article | right gutter.

**ToC sidebar (left, 200px):**
- `position: sticky; top: 52px; align-self: start`
- No label/heading — list starts immediately
- Items: DM Sans 12px, `var(--sb-muted)`, border-left 2px transparent
- Active item (scroll-spy): `var(--sb-text)`, border-left-color `var(--sb-accent)`, font-weight 500
- H3 items indented: padding-left 1.5rem, font-size 11px
- **Mobile:** sidebar hidden entirely (`display: none` below 768px)

**Article column:**
- Padding: 2.5rem 3rem 4rem
- Back link: "← All entries" — DM Sans 12px, uppercase, `var(--sb-muted)`, hover to `var(--sb-text)`
- Meta row: `{date} · {tag pills}` — date in DM Sans 12.5px
- Post title: Fraunces 30px, 700, letter-spacing -0.3px, line-height 1.2
- Body: see Markdown styles below

**Right gutter (80px):** empty, breathing room only

---

## Markdown / body styles (`.sb-body`)

All within `.sb-body`:

| Element | Style |
|---|---|
| `p` | EB Garamond 18px, line-height 1.85, margin-bottom 1.4em |
| `a` | color `var(--sb-link)`, underline 1px, offset 2px; hover `var(--sb-link-hover)` |
| `h2` | Fraunces 22px 700, margin 2em 0 0.5em |
| `h3` | Fraunces 18px 700, margin 1.6em 0 0.4em |
| `strong` | weight 600 |
| `em` | italic |
| `blockquote` | border-left 2px `var(--sb-border)`, padding-left 1.25em, italic, color `var(--sb-muted)` |
| `ul` | disc, margin-left 1.4em, gap 0.3em between items |
| `ol` | decimal, same |
| Nested lists | margin-left 1.25em |
| `code` (inline) | `var(--sb-mono)` 14px, background `var(--sb-code-bg)`, border 0.5px `var(--sb-border)`, border-radius 3px, padding 1px 5px |
| `pre` | background `var(--sb-code-bg)`, border 0.5px `var(--sb-border)`, border-radius 6px, padding 1rem 1.25rem, overflow-x auto |
| `pre code` | 13.5px, no background, no border |
| `hr` | border-top 1px solid `var(--sb-border)`, margin 2em 0 |
| `table` | DM Sans 14px; `th`: uppercase 11px, `var(--sb-muted)`, border-bottom 1px `var(--sb-border)`; `td`: border-bottom 0.5px `var(--sb-divider)` |
| `sup` | color `var(--sb-link)`, font-size 11px |
| Footnotes block | DM Sans 14px, `var(--sb-muted)`, border-top 1px `var(--sb-border)`, margin-top 2.5rem |

---

## Images in posts

```html
<figure class="sb-figure">
  <div class="sb-img-wrap">
    <img src="..." alt="...">
  </div>
  <figcaption>Caption text here</figcaption>
</figure>
```

- `.sb-img-wrap`: `overflow: hidden; border-radius: 6px; cursor: zoom-in`
- `img`: `width: 100%; display: block; transition: transform 0.3s ease`
- Hover: `transform: scale(1.025)`
- Click: opens lightbox (see below)
- `figcaption`: DM Sans 13px, italic, `var(--sb-muted)`, text-align center, margin-top 0.5rem

**Lightbox:**
- Fixed overlay, `background: rgba(0,0,0,0.78)`, z-index 100
- Centered `<img>` max 90vw / 85vh
- Close on: click outside image, Esc key, close button
- Implemented in `public/js/lightbox.js` — attach to all `.sb-img-wrap` elements on DOMContentLoaded

---

## Tags (`.sb-tag` pill)

Used in post meta rows, entry lists, and the Tags page cloud.

```css
.sb-tag {
  font-size: 10.5px;
  background: var(--sb-tag-bg);
  color: var(--sb-tag-text);
  padding: 2px 7px;
  border-radius: 4px;
  font-family: var(--sb-sans);
  font-weight: 500;
  letter-spacing: 0.03em;
  text-decoration: none;
  display: inline-block;
  transition: background 0.12s, color 0.12s;
}
.sb-tag:hover {
  background: var(--sb-accent);
  color: var(--sb-bg);
}
```

Tags always link to `/tags/{tag-slug}/`.

---

## Tags page (`tags.njk`)

**Page heading:** "Tags" in Fraunces 26px  
**Subhead:** "Everything I've written about, loosely organised. Tag size reflects post count." in EB Garamond 16px

**Tag cloud:**
- Flex wrap, gap 0.6rem
- Each tag is a pill with name + post count (count at 0.85em, 0.65 opacity)
- Size classes based on post count:
  - 10+ posts → `sz-xl` (16px)
  - 7–9 → `sz-lg` (14px)
  - 4–6 → `sz-md` (13px)
  - 2–3 → `sz-sm` (12px)
  - 1 → `sz-xs` (11px)
- Clicking a tag: selects it (fills to `var(--sb-text)` / `var(--sb-bg)`), reveals filtered entry list below
- Clicking another tag: switches selection
- No "Clear" button — clicking a selected tag deselects and hides results

**Filtered results:**
- Small caps label: `{n} entries tagged "{tag}"`
- Hairline divider
- Compact entry list (title + date, no excerpt, no year column)

This page can be built with Eleventy's collections API to generate tag data, but the filtering interaction is client-side JS — no page reload.

---

## Static pages (About, Now, Projects)

Simple layout: centered column, max-width 640px. No sidebar.

Front matter:
```yaml
---
layout: page.njk
title: About
---
```

Body content rendered as `.sb-body` markdown, same styles as post body.

---

## RSS feed

Generate via `eleventy-plugin-rss`. Include:
- All posts, newest first
- Full post content (not just excerpt)
- Linked from `<head>` as `<link rel="alternate" type="application/rss+xml">`
- Accessible at `/feed.xml`

---

## Open Graph / social meta

In `base.njk` `<head>`, include:

```html
<meta property="og:title" content="{{ title or site.name }}">
<meta property="og:description" content="{{ excerpt or site.description }}">
<meta property="og:url" content="{{ site.url }}{{ page.url }}">
<meta property="og:type" content="{{ 'article' if layout == 'post.njk' else 'website' }}">
<meta name="twitter:card" content="summary">
```

Posts should support an optional `excerpt` front matter field used for the OG description. If absent, fall back to `site.description`.

---

## `.eleventy.js` config notes

- Input: `./` (or `./src/` if preferred)
- Output: `./_site`
- Passthrough copy: `public/` → `css/`, `js/`
- Collections: `posts` (all `.md` in `posts/` folder, sorted by date descending)
- Plugins: `eleventy-plugin-rss`
- Filters needed:
  - `dateDisplay` — formats a JS Date to "June 12, 2026"
  - `dateISO` — ISO 8601 for `<time datetime="">` and RSS
  - `dateYear` — extracts the year for entry list year anchors

---

## Sample post front matter

```yaml
---
title: Presidents in Time — What I Learned Building a Portrait Grid
date: 2026-06-12
tags:
  - projects
  - tech
excerpt: I've been obsessing over this side project for months — an interactive grid plotting all 47 presidents across their lifespans. Simple to describe. Genuinely annoying to build.
layout: post.njk
---
```

---

## Responsive breakpoints

| Breakpoint | Changes |
|---|---|
| `< 768px` | Post layout collapses to single column; ToC sidebar `display: none` |
| `< 640px` | Header nav replaced by hamburger menu; content padding reduced to 1.5rem |
| `< 400px` | Post title font-size reduced to 24px |

**Hamburger menu (mobile):**
- Icon in header replaces nav links
- Tapping opens a full-width panel below the header (`position: absolute`, `background: var(--sb-surface)`, `border-bottom: 0.5px solid var(--sb-border)`)
- Nav links stacked vertically, DM Sans 14px, padding 0.75rem 1.5rem each
- Close on: tap outside, tap a link
- Dark mode toggle moves into this menu on mobile

---

## Deliverables checklist

Generate all of the following:

- [ ] `public/css/spamboy.css` — complete stylesheet
- [ ] `public/js/theme.js` — dark mode toggle + localStorage
- [ ] `public/js/toc.js` — ToC scroll-spy
- [ ] `public/js/lightbox.js` — image lightbox
- [ ] `_includes/base.njk` — HTML shell
- [ ] `_includes/post.njk` — post layout
- [ ] `_includes/page.njk` — static page layout
- [ ] `_data/site.js` — global config
- [ ] `index.njk` — home page
- [ ] `blog.njk` — blog archive with pagination
- [ ] `tags.njk` — tags page
- [ ] `feed.njk` — RSS feed
- [ ] `.eleventy.js` — Eleventy config
- [ ] `posts/markdown-showcase.md` — sample post with all markdown elements
