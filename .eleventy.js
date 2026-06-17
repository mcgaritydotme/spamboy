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
