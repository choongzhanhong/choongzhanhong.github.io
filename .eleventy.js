// .eleventy.js
const path = require("path")
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const pluginTOC = require('eleventy-plugin-toc')
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItFootnote = require("markdown-it-footnote");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")

module.exports = function(eleventyConfig) {
    // --- PLUGINS ---
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginSyntaxHighlight);
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPlugin(pluginTOC)
    
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
    
    // Creat collection for writing (not sure if this is necessary?)
    eleventyConfig.addCollection("writings", function(collectionApi) {
        return collectionApi.getFilteredByGlob("content/writing/**.md").sort((a, b) => {
            return b.date - a.date; // sort by date, newest first
        });
    });
    
    // Create a collection of writings grouped by year
    eleventyConfig.addCollection("writingsByYear", (collectionApi) => {
        const posts = collectionApi.getFilteredByGlob("content/writing/**/*.md");
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
    eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
        extensions: "html",
        formats: ["webp", "jpeg"],
        widths: ["auto"],
        outputDir: "./_site/img/",
        urlPath: "/img/",
        filenameFormat: function (id, src, width, format) {
            // Replace underscores in hash.
            // If name starts with underscore, GitHub Pages will 404.
            const name = id.replace(/_/g, "");
            return `${name}.${format}`;
        },
        defaultAttributes: {
            loading: "lazy",
            decoding: "async",
            sizes: "(min-width: 30em) 50vw, 100vw",
        },
    });
    
    const md = new markdownIt({
        html: true,
    })
        .use(markdownItFootnote)
        .use(markdownItAnchor, {
            permalink: markdownItAnchor.permalink.linkInsideHeader({
                symbol: "#",
                placement: "after",
                class: "header-anchor",
            }),
            level: [2, 3], // matches the h2/h3 tags used by pluginTOC below
        });
    
    // Automatically mark SVG <img> tags as eleventy:ignore before
    // the content ever reaches Eleventy's image transform plugin.
    const originalRender = md.render.bind(md);
    md.render = function (...args) {
        let html = originalRender(...args);
        return html.replace(/<img\b[^>]*>/gi, (imgTag) => {
            const isSvg = /src=["'][^"']+\.svg["']/i.test(imgTag);
            const alreadyIgnored = /eleventy:ignore/i.test(imgTag);
            if (isSvg && !alreadyIgnored) {
                return imgTag.replace(/\/?>$/, " eleventy:ignore>");
            }
            return imgTag;
        });
    };
    
    eleventyConfig.setLibrary("md", md);
    
    eleventyConfig.setLibrary(
        'md',
        markdownIt().use(markdownItAnchor)
    )
    
    eleventyConfig.addPlugin(pluginTOC, {
        tags: ['h2', 'h3'],
        wrapper: 'div'
    })
    
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
