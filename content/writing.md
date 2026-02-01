---
title: "Writing"
layout: "layouts/base.njk"
eleventyNavigation:
  key: Writing
  order: 6
permalink: "{{ page.fileSlug }}.html"
---

## Writing

{# Loop through the array of years from our collection #}
{% for yearData in collections.writingsByYear %}
  <h2 id="y{{ yearData.year }}">{{ yearData.year }}</h2>
  <ul class="blogList">
    {# Loop through the posts for the current year #}
    {% for post in yearData.posts %}
      <li class>
        <time datetime="{{ post.date | readableDate('yyyy-LL-dd') }}">
          [{{ post.date | readableDate('dd LLL') }}]
        </time>
        <a href="{{ post.url }}">
          {{ post.data.title }}</a>
      </li>
    {% endfor %}
  </ul>
{% endfor %}
