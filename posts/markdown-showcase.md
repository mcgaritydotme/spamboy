---
draft: true
title: Presidents in Time — What I Learned Building a Portrait Grid
date: 2026-06-12
tags:
  - projects
  - tech
excerpt: I've been obsessing over this side project for months — an interactive grid plotting all 47 presidents across their lifespans. Simple to describe. Genuinely annoying to build.
layout: post.njk
---

I&rsquo;ve been obsessing over this side project for months &mdash; an interactive grid plotting all 47 presidents across their lifespans. Simple to describe. Genuinely annoying to build. What follows is part build log, part list of things I wish someone had told me before I started.

## The premise

The idea arrived fully formed, which is always a warning sign. I wanted a single screen where you could see *every* president at once, each as a horizontal bar running from birth to death, with their term in office marked along it. Hover a bar and the whole grid should react.

> The best visualisations answer a question you didn&rsquo;t know you had. I wanted people to notice, without being told, just how much these lives overlap.

It turns out the data is the easy part. The hard part is everything around it.

### Getting the data right

Dates are a nightmare. Some sources record only years; others give exact days. A few presidents have **contested** birth dates. I ended up normalising everything to ISO 8601 and storing a `precision` flag so the UI could render a softer edge when a date was approximate.

Here&rsquo;s the shape I settled on:

```js
const president = {
  name: "James K. Polk",
  born: "1795-11-02",
  died: "1849-06-15",
  precision: "day",      // "day" | "month" | "year"
  terms: [{ start: "1845-03-04", end: "1849-03-04" }]
};
```

A few rules I had to encode by hand:

1. Grover Cleveland counts twice but is one person.
2. Term boundaries don&rsquo;t always line up with inauguration day.
3. One president has no death date, which breaks every layout assumption you make.

### Layout maths

Each bar&rsquo;s horizontal position is just a linear map from year to pixels. The fiddly bit is the *vertical* packing &mdash; you want overlapping lives stacked so nothing collides, but you also want the order to feel intentional. I tried three approaches:

- **Chronological by birth.** Clean, but the term markers scatter.
- **Greedy interval packing.** Compact, but visually chaotic.
- **Fixed rows, one per president.** Tallest, but by far the easiest to read.

Fixed rows won. Sometimes the boring answer is the right one.

## Performance, or: stop animating everything

My first version animated all 47 bars on every hover. On a laptop it was fine. On a phone it was a slideshow. The fix was embarrassingly simple &mdash; only transition the `opacity` of *non-hovered* bars, and let the hovered one stay put.

| Approach | Frame time | Feel |
|---|---|---|
| Animate all bars | 38ms | Sluggish |
| Animate dimmed only | 9ms | Crisp |
| No animation | 4ms | Lifeless |

The middle row is the whole trick. You can read more about the reasoning in the [CSS containment spec][css-containment], which I finally understood about halfway through this project.

<figure class="sb-figure">
  <div class="sb-img-wrap">
    <img src="/img/sunset.jpg" alt="Sunset over the bay from an airport gate">
  </div>
  <figcaption>Sunset over the bay &mdash; a sample photo, supplied at 2000&times;1125. Click to enlarge.</figcaption>
</figure>

## What I&rsquo;d do differently

If I started again I&rsquo;d build the data model first and stare at it for a week before writing a single line of layout code.<sup id="ref1"><a href="#fn1">1</a></sup> Almost every painful moment traced back to a data decision I&rsquo;d made carelessly on day one.

Use `position: sticky` for the era labels. Don&rsquo;t reinvent a scroll-spy. And resist &mdash; *truly resist* &mdash; the urge to make the bars do something clever on click.

---

That&rsquo;s the project. It&rsquo;s live, it&rsquo;s fast, and I never want to look at a date-parsing function again.

[css-containment]: https://www.w3.org/TR/css-contain-1/

## Appendix — Markdown reference

A quick reference showing how every supported element renders in this theme.

### Emphasis & inline

Regular text, **bold text**, *italic text*, ***bold italic***, and `inline code`. Here is an [inline link](/feed.xml) and a superscript marker.<sup><a href="#fn1">2</a></sup>

### Blockquote

> A blockquote can hold more than one paragraph.
>
> Like this second one — still indented, still muted.

### Unordered list

- A first item
- A second item
  - A nested item
  - Another nested item
- A third item

### Ordered list

1. The first step
2. The second step
   1. A sub-step
   2. Another sub-step
3. The third step

### Code block

```js
function greet(name) {
  return `Hello, ${name}`;
}
```

### Table

| Column | Type   | Notes         |
|--------|--------|---------------|
| id     | number | primary key   |
| name   | string | required      |
| active | bool   | defaults true |

### Horizontal rule

---

That is the full set.

<div class="footnotes">
<hr>
<ol>
<li id="fn1">A week sounds excessive. It is not. <a href="#ref1">&#8617;</a></li>
</ol>
</div>
