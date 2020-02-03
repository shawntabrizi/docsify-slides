# docsify-slides

A plugin for [`docsify`](https://docsify.js.org/) that allows you to write documentation which acts like a slideshow.

## Install

Simply include the plugin with your `docsify` project:

```html
<script src="//unpkg.com/docsify-slides/dist/docsify-slides.min.js"></script>
```

> **NOTE:** This plugin works best in combination with [`docsify-pagination`](https://github.com/imyelo/docsify-pagination) plugin.
> Be sure to also enable this plugin on your docsify site for the full experience.

## What is it?

This is a simple plugin which gives you a flexible two-column layout via a custom markdown syntax.

Just add:

```html
<!-- slide:break -->
```

or

```html
<!-- slide:break-# -->
```

where `#` is the percent of the total width you want the left side of the slide to be. (i.e. `<!-- slide:break-60 -->`)

Check out the [example](https://shawntabrizi.github.io/docsify-slides).

### Features

1. Responsive two column layout for your markdown pages.
2. Reduced margins and spacing to maximize presentation real estate.
3. `docsify` sidebar is closed by default, and closed sidebar behavior is [fixed on mobile screens](https://github.com/docsifyjs/docsify/issues/442).

If you enable [`docsify-pagination`](https://github.com/imyelo/docsify-pagination):

4. Navigate between pages with `<-` and `->` keys.
5. [`docsify-pagination`](https://github.com/imyelo/docsify-pagination) acts as a sticky footer, so it is always visible on screen.
