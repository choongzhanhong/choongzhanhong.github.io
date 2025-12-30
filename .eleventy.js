// .eleventy.js
const path = require("path")
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const Image = require("@11ty/eleventy-img");
const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")

module.exports = function(eleventyConfig) {
  // --- PLUGINS ---
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(syntaxHighlight);

  // --- PASSTHROUGH COPY ---
  // Copy contents of public into their own directories
  eleventyConfig.addPassthroughCopy({"public/css" : "css"});
  eleventyConfig.addPassthroughCopy({"public/images" : "images"}); // should be removed soon
  eleventyConfig.addPassthroughCopy({"public/files" : "files"});
  
  // for blog post images
  eleventyConfig.addPassthroughCopy("content/**/*.jpg");
  eleventyConfig.addPassthroughCopy("content/**/*.png");
  eleventyConfig.addPassthroughCopy("content/**/*.gif");
  // vids too
  eleventyConfig.addPassthroughCopy("content/**/*.webm");
  eleventyConfig.addPassthroughCopy("content/**/*.mp4");

  // --- FILTERS ---
  // Date formatting filter using Luxon
  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLL yyyy");
  });
  
  // Formats date range given two inputs.
  eleventyConfig.addShortcode("dateRange", (startDate, endDate) => {
    const start = DateTime.fromJSDate(startDate);
    const end = DateTime.fromJSDate(endDate);
    
    // Case 1: Same day (e.g., 25 June, 20215)
    if (start.hasSame(end, 'day')) {
      return start.toFormat("dd LLL yyyy");
    }

    // Case 2: Same month and year (e.g., June 23-25, 2025)
    if (start.hasSame(end, 'month')) {
      return `${start.toFormat("dd")} – ${end.toFormat('dd LLL yyyy')}`;
    }

    // Case 3: Same year, different month (e.g., June 25 - July 5, 2025)
    if (start.hasSame(end, 'year')) {
      return `${start.toFormat('dd LLL')} – ${end.toFormat('dd LLL yyyy')}`;
    }

    // Case 4: Different years (e.g., Dec 30, 2024 - Jan 5, 2025)
    return `${start.toFormat('dd LLL yyyy')} – ${end.toFormat('dd LLL yyyy')}`;
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
  
  // tags
    eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tagSet = new Set();
    // Loop through every post in the 'posts' collection
    collectionApi.getFilteredByTag("posts").forEach(item => {
      if ("tags" in item.data) {
        // Get the tags for the current post
        let tags = item.data.tags;
        // Ensure tags are in an array
        if (typeof tags === "string") {
          tags = [tags];
        }
        // Add each tag to our set
        for (const tag of tags) {
          tagSet.add(tag);
        }
      }
    });

    // Return a sorted array of unique tags
    return [...tagSet].sort();
  });

  // --- MARKDOWN-IT IMAGE PROCESSING ---
  // Customize Markdown-it to process images with eleventy-img
  const md = new markdownIt({
    html: true,
  }).use(markdownItFootnote);

  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const src = token.attrGet("src");
    const alt = token.content;

    // Resolve the image path relative to the post
    const fullSrcPath = path.join(path.dirname(env.page.inputPath), src);
    
    // Run the image through Eleventy Image asynchronously
    (async () => {
      await Image(fullSrcPath, {
        widths: ["auto"],
        formats: ["webp", "jpeg"],
        outputDir: "./_site/img/",
        urlPath: "/img/",
		filenameFormat: function(id, src, width, format, options) {
			// Replace underscores in hash.
			// If name starts with underscore, github will 404.
			const name = id.replace(/_/g, "");
			
			return `${name}.${format}`;
		}
      });
    })();
    
    // Generate the HTML for the <picture> element
    const metadata = Image.statsSync(fullSrcPath, {
        widths: ["auto"],
        formats: ["webp", "jpeg"],
        outputDir: "./_site/img/",
        urlPath: "/img/",
		filenameFormat: function(id, src, width, format, options) {
			// Replace underscores in hash.
			// If name starts with underscore, github will 404.
			const name = id.replace(/_/g, "");
			
			return `${name}.${format}`;
		}
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
