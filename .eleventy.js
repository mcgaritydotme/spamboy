const markdownItFootnote = require("markdown-it-footnote");
const { execSync } = require("child_process");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function toDate(d) {
  if (!d || d === "now") return new Date();
  const x = d instanceof Date ? d : new Date(d);
  return isNaN(x.getTime()) ? new Date() : x;
}

module.exports = function (eleventyConfig) {
  // ----- Passthrough assets -----
  eleventyConfig.addPassthroughCopy({ "public/css": "css" });
  eleventyConfig.addPassthroughCopy({ "public/js": "js" });
  eleventyConfig.addPassthroughCopy({ "public/img": "img" });

  // Custom domain marker — remove this line (and the CNAME file) if you're
  // serving from a github.io address instead of a custom domain.
  eleventyConfig.addPassthroughCopy("CNAME");

  // ----- Drafts (global) -----
  // Any file with `draft: true` in its front matter — posts, or root pages
  // like now.md / projects.md — is dropped from the production build entirely:
  // no page output, and excluded from every collection, feed, and tag list.
  // Drafts still render during local `eleventy --serve` so you can preview them.
  // ELEVENTY_RUN_MODE is "build" for production; "serve"/"watch" locally.
  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false; // discard this file from the build
    }
  });

  // ----- Markdown: footnotes -----
  // Adds standard footnote syntax:  a claim[^1]   …   [^1]: the note.
  // Auto-numbered and back-linked; styled by the .footnotes rules in the CSS.
  eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(markdownItFootnote));

  // ----- Markdown: image figures -----
  // Lets authors write plain Markdown images and get the full framed,
  // click-to-enlarge figure treatment — no HTML required:
  //   ![alt text](/img/x.jpg "Optional caption")
  // A standalone image (its own paragraph) becomes:
  //   <figure class="sb-figure"><div class="sb-img-wrap"><img …></div>
  //     <figcaption>Optional caption</figcaption></figure>
  // The image title (the "…" part) becomes the visible caption; alt stays
  // on the <img> for accessibility. Images used inline in a sentence are
  // left untouched. .sb-img-wrap is what the lightbox script hooks into.
  eleventyConfig.addTransform("imageFigures", function (content) {
    const out = this.page && this.page.outputPath;
    if (!out || !out.endsWith(".html")) return content;
    return content.replace(
      /<p>(<img\b[^>]*>)<\/p>/g,
      function (_whole, imgTag) {
        const titleMatch = imgTag.match(/\stitle="([^"]*)"/);
        const caption = titleMatch ? titleMatch[1] : "";
        const img = imgTag.replace(/\stitle="[^"]*"/, "");
        return (
          '<figure class="sb-figure">\n' +
          '  <div class="sb-img-wrap">' + img + "</div>" +
          (caption ? "\n  <figcaption>" + caption + "</figcaption>" : "") +
          "\n</figure>"
        );
      }
    );
  });

  // ----- Collections -----
  // Newest-first posts collection.
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("posts/*.md")
      .sort((a, b) => toDate(b.date) - toDate(a.date));
  });

  // Tag list with post counts (excludes reserved tags).
  eleventyConfig.addCollection("tagList", function (collectionApi) {
    const reserved = new Set(["all", "posts", "nav", "post"]);
    const counts = {};
    collectionApi.getFilteredByGlob("posts/*.md").forEach((item) => {
      (item.data.tags || []).forEach((tag) => {
        if (reserved.has(tag)) return;
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.keys(counts)
      .sort((a, b) => a.localeCompare(b))
      .map((tag) => ({ tag, count: counts[tag] }));
  });

  // ----- Date filters -----
  eleventyConfig.addFilter("dateDisplay", function (d) {
    const x = toDate(d);
    return `${MONTHS[x.getUTCMonth()]} ${x.getUTCDate()}, ${x.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("dateISO", function (d) {
    return toDate(d).toISOString();
  });
  eleventyConfig.addFilter("dateYear", function (d) {
    return toDate(d).getUTCFullYear();
  });
  // RFC-822 / RFC-1123 date for the RSS feed (Date.toUTCString gives this format).
  eleventyConfig.addFilter("dateRfc822", function (d) {
    return toDate(d).toUTCString();
  });
  // Last Git commit date for a source file — use in templates as:
  //   {{ page.inputPath | gitDate }}
  // Falls back to "recently" if git is unavailable or the file is untracked.
  eleventyConfig.addFilter("gitDate", function (filePath) {
    try {
      const raw = execSync(`git log -1 --format=%cI -- "${filePath}"`).toString().trim();
      if (!raw) return "recently";
      return new Date(raw).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });
    } catch (e) {
      return "recently";
    }
  });

  // ----- Slug helper (Eleventy ships `slugify`; alias for clarity) -----
  eleventyConfig.addFilter("tagSlug", function (s) {
    return String(s).toLowerCase().trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  });

  // First non-reserved tag (used for the single pill on the home entry list).
  eleventyConfig.addFilter("primaryTag", function (tags) {
    if (!Array.isArray(tags)) return null;
    const reserved = new Set(["all", "posts", "nav", "post"]);
    return tags.find((t) => !reserved.has(t)) || null;
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md"]
  };
};