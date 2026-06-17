// Directory data for everything in posts/.
// Handles drafts: a post with `draft: true` in its front matter is hidden from
// the production build (no page output, excluded from all collections/feeds/tags),
// but still rendered during local `eleventy --serve`/`--watch` so you can preview it.

// ELEVENTY_RUN_MODE is "build" for production; "serve"/"watch" locally.
const isProduction = process.env.ELEVENTY_RUN_MODE === "build";

module.exports = {
  layout: "post.njk",
  tags: ["posts"],
  eleventyComputed: {
    // Don't write the post's HTML file when it's a draft (in production).
    permalink: (data) => {
      if (data.draft && isProduction) return false;
      return `/blog/${data.page.fileSlug}/`;
    },
    // Keep drafts out of the posts list, tag pages, and RSS feed (in production).
    eleventyExcludeFromCollections: (data) => {
      if (data.draft && isProduction) return true;
      return data.eleventyExcludeFromCollections || false;
    },
  },
};
