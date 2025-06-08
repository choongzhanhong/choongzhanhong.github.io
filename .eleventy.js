// .eleventy.js
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");

module.exports = function(eleventyConfig) {
  // --- PLUGINS ---
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);

  // --- PASSTHROUGH COPY ---
  // Copy `public/` to `_site/public/`
  eleventyConfig.addPassthroughCopy("public");

  // --- FILTERS ---
  // Date formatting filter using Luxon
  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLL yyyy");
  });

  // --- COLLECTIONS ---
  // Create a collection of blog posts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/blog/*.md").sort((a, b) => {
      return b.date - a.date; // sort by date, newest first
    });
  });

  // Create a collection of posts grouped by year
  eleventyConfig.addCollection("postsByYear", (collectionApi) => {
    const posts = collectionApi.getFilteredByGlob("content/blog/*.md");
    const years = {};

    for (const post of posts) {
      const year = post.date.getFullYear();
      if (!years[year]) {
        years[year] = [];
      }
      years[year].push(post);
    }

    // Return an array of objects, e.g. [{ year: 2025, posts: [...] }]
    // Sort years in descending order
    return Object.keys(years)
      .sort((a, b) => b - a)
      .map((year) => ({
        year: year,
        posts: years[year].sort((a, b) => b.date - a.date), // sort posts in each year
      }));
  });

  // --- BASE CONFIGURATION ---
  return {
    dir: {
      input: "content",       // Source files
      includes: "../_includes", // Reusable components
      data: "../_data",       // Global data
      output: "_site"          // Build output
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
