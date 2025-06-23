---
title: "Building My Mattress"
date: "2025-06-08"
tags:
  - "eleventy"
  - "learning"
layout: "layouts/post.njk"
---

This is the very first post on my new blog! The content you're reading right now lives in a Markdown file.

Eleventy takes this content and injects it into the `{{ content | safe }}` section of the layout file I specified in the front matter.

## Front Matter is Key

The data at the top of this file, like the `title` and `tags`, is used to populate the rest of the template. For example, the list of tags at the bottom of this page is generated from the `tags` array right here in the front matter: