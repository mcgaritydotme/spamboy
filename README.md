# Spamboy

A personal blog built with [Eleventy](https://www.11ty.dev/) and deployed to GitHub Pages.

## Develop locally

```bash
npm install      # install Eleventy + RSS plugin
npm run serve    # local dev server with live reload at http://localhost:8080
npm run build    # one-off build into ./_site
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and publishes `_site/` to GitHub Pages. See the deployment notes below.

## Structure

- `_includes/` — Nunjucks layouts and partials
- `_data/site.js` — global site config (name, nav, description)
- `posts/` — Markdown blog posts
- `public/` — CSS, JS, and images (copied to the site root on build)
- `*.njk` — page templates (home, blog, tags, feed)
- `.eleventy.js` — Eleventy config (collections, filters, RSS, passthrough)

`preview.html` is a local design reference only and is **not** part of the build.
