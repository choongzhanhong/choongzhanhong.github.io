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
const markdownItLinkAttributes = require("markdown-it-link-attributes");

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
    // collections.posts, collections.travel and collections.writing are created
    // automatically from the directory data tags. Only the grouped-by-year
    // versions are needed here.

    const groupByYear = (items) => {
        const years = {};
        for (const item of items) {
            const year = item.date.getFullYear();
            (years[year] ||= []).push(item);
        }
        // [{ year: 2025, posts: [...] }], years descending, posts newest first
        return Object.keys(years)
            .sort((a, b) => b - a)
            .map((year) => ({
                year,
                posts: years[year].sort((a, b) => b.date - a.date),
            }));
    };

    eleventyConfig.addCollection("postsByYear", (api) =>
        groupByYear(api.getFilteredByTag("posts")));

    eleventyConfig.addCollection("travelByYear", (api) =>
        groupByYear(api.getFilteredByTag("travel")));

    eleventyConfig.addCollection("writingByYear", (api) =>
        groupByYear(api.getFilteredByTag("writing")));

    // Tag list across all three sections, excluding the section tags themselves
    const sectionTags = new Set(["posts", "travel", "writing"]);
    
    // All three sections merged, grouped by year
    eleventyConfig.addCollection("allByYear", (api) => {
        const all = new Set([
            ...api.getFilteredByTag("posts"),
            ...api.getFilteredByTag("travel"),
            ...api.getFilteredByTag("writing"),
        ]); // Set avoids duplicates if a post ever carries two section tags
        return groupByYear([...all]);
    });

    eleventyConfig.addCollection("tagList", (api) => {
        const tagSet = new Set();
        for (const tag of ["posts", "travel", "writing"]) {
            api.getFilteredByTag(tag).forEach((item) => {
                for (const t of [].concat(item.data.tags || [])) {
                    tagSet.add(t);
                }
            });
        }
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
                symbol: "",
                placement: "after",
                class: "header-anchor",
            }),
            level: [2, 3], // matches the h2/h3 tags used by pluginTOC below
        })
            .use(markdownItLinkAttributes, {
                // matches any URL containing "//" (external link will open in new tab)
                pattern: /\/\//,
        attrs: {
            target: "_blank",
            rel: "noopener noreferrer",
        },
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
    
    eleventyConfig.addPlugin(pluginTOC, {
        tags: ['h2', 'h3'],
        ul: true,
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
