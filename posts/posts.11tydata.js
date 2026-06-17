// Directory data for everything in posts/.
// (Draft handling is global — see the "drafts" preprocessor in .eleventy.js,
// which applies to root pages like now.md / projects.md too, not just posts/.)

module.exports = {
  layout: "post.njk",
  tags: ["posts"],
  permalink: "/blog/{{ page.fileSlug }}/",
};
