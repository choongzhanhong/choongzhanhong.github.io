// .eleventy.js
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const Image = require("@11ty/eleventy-img");

// Usage example:
// {% image "public/images/mountain.jpg", "A beautiful mountain landscape.", "(min-width: 30em) 50vw, 100vw" %}
async function imageShortcode(src, alt, sizes) {
  // The 'metadata' object contains all the generated image data
  let metadata = await Image(src, {
    // We'll generate images in these widths
    widths: [300, 600, 900],
    // The formats we want to output
    formats: ["avif", "webp", "jpeg"],
    // The directory where the optimized images will be saved
    outputDir: "./_site/img/",
    // The URL path to be used in the 'src' attribute
    urlPath: "/img/",
  });

  // Define the attributes for the <img> element
  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  // The 'generateHTML' function returns the complete <picture> element
  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function(eleventyConfig) {
  // --- PLUGINS ---
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);
  
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addWatchTarget("public/images/");

  // --- PASSTHROUGH COPY ---
  // Copy contents of public into their own directories
  eleventyConfig.addPassthroughCopy({"public/css" : "css"});
  eleventyConfig.addPassthroughCopy({"public/images" : "images"});
  eleventyConfig.addPassthroughCopy({"public/files" : "files"});

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
