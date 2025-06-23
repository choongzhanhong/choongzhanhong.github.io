// .eleventy.js
const path = require("path")
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const Image = require("@11ty/eleventy-img");
const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // --- PLUGINS ---
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);

  // --- PASSTHROUGH COPY ---
  // Copy contents of public into their own directories
  eleventyConfig.addPassthroughCopy({"public/css" : "css"});
  eleventyConfig.addPassthroughCopy({"public/images" : "images"}); // should be removed soon
  eleventyConfig.addPassthroughCopy({"public/files" : "files"});
  
  // for blog post images
  eleventyConfig.addPassthroughCopy("content/**/*.jpg");
  eleventyConfig.addPassthroughCopy("content/**/*.png");
  eleventyConfig.addPassthroughCopy("content/**/*.gif");

  // --- FILTERS ---
  // Date formatting filter using Luxon
  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLL yyyy");
  });

  // --- COLLECTIONS ---
  // Create a collection of blog posts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/blog/**.md").sort((a, b) => {
      return b.date - a.date; // sort by date, newest first
    });
  });

  // Create a collection of posts grouped by year
  eleventyConfig.addCollection("postsByYear", (collectionApi) => {
    const posts = collectionApi.getFilteredByGlob("content/blog/**/*.md");
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

  // --- MARKDOWN-IT IMAGE PROCESSING ---
  // Customize Markdown-it to process images with eleventy-img
  const md = new markdownIt({
    html: true,
  });

  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const src = token.attrGet("src");
    const alt = token.content;

    // Resolve the image path relative to the post
    const fullSrcPath = path.join(path.dirname(env.page.inputPath), src);
    
    // Run the image through Eleventy Image asynchronously
    (async () => {
      await Image(fullSrcPath, {
        widths: [600, 900, 1200],
        formats: ["avif", "webp", "jpeg"],
        outputDir: "./_site/img/",
        urlPath: "/img/",
      });
    })();
    
    // Generate the HTML for the <picture> element
    const metadata = Image.statsSync(fullSrcPath, {
        widths: [600, 900, 1200],
        formats: ["avif", "webp", "jpeg"],
        outputDir: "./_site/img/",
        urlPath: "/img/",
      });

    const imageAttributes = {
      alt,
      sizes: "(min-width: 30em) 50vw, 100vw",
      loading: "lazy",
      decoding: "async",
    };

    return Image.generateHTML(metadata, imageAttributes);
  };

  eleventyConfig.setLibrary("md", md);
  
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
