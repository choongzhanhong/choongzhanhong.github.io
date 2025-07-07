---
title: "Blog"
layout: "layouts/base.njk"
eleventyNavigation:
  key: Blog
  order: 5
permalink: "{{ page.fileSlug }}.html"
---

## Blog Archive

Soon&#8482; I shall bring my blog from substack/blogger here.

{# Loop through the array of years from our collection #}
{% for yearData in collections.postsByYear %}
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

<hr>
<h2>Browse by Tag</h2>
<div class="tag-list">
  {% for tag in collections.tagList %}{% if tag != "posts" %}
    <a href="{{ ('/tags/' + tag + '.html') | url }}" class="tag-badge">#{{ tag }}</a>{% endif %}{% endfor %}
</div>