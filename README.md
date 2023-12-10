# lazui

![GitHub](https://img.shields.io/github/license/anywhichway/lazui)

The lazy UI framework. Get lazui ... do less ... deliver more.

`lazui` is pronounced "lazy", as in "Lazy loading ... ".

## introduction

`lazui` is a JavaScript library that allows you to create interactive websites and single page apps with less work.

`lazui` extends the attribute space of typical HTML to provide a rich set of functionality. It provides the JavaScript, so
you don't have to.

`lazui` gives you access to the best ideas from [htmx](https://htmx.org/), [lighterHTML](https://github.com/WebReflection/lighterhtml),  [Knockout](https://knockoutjs.com/), [Turbo](https://turbo.hotwired.dev/) and [Stimulus](https://stimulus.hotwired.dev/) and [Vue](https://vuejs.org/)

`lazui` has a small core (less than 8K) and incremental loading of just the parts you use. Or, you can [create a custom bundle](./lazui.md/#creating-a-custom-bundle) for one time loading.

## motivation

There are great features in the above libraries, you should not have to choose just one approach.

## features

Here is a short list of features, visit [lazui.org](https://lazui.org) for a graph of features and benefits.

### without writing JavaScript

- attributes for state management
- attributes for event management
- attributes for content loading and targeting
- JavaScript ${templates in HTML}
- server sent events
- web sockets
- form processing
- client side routing
- charts and gauges
- remote data synchronization

### with writing JavaScript

- html template function'
- render function
- custom attributes and controllers
- web components (custom elements)
- an exensible basic web server with support for MArkdown processing, server sent events, web sockets, and remote data synchronization

## quick start

### for HTML

```html
<template id="goodbye">
    Goodbye ${userName}
</template>
<div data-lz:src="#goodbye" data-lz:state='{userName:"John"}' data-lz:trigger="click dispatch:load" data-lz:target="outer">
    Hello, ${userName}. The date and time is ${new Date().toLocaleTimeString()}. Click to leave.
</div>
```

```html
<template data-lz:state="person">
{
    name: "Mary",
    age: 21,
    married: false
}
</template>
<form data-lz:usestate="person" data-lz:controller="/controllers/lz/form.js">
    <input data-lz:bind="name" type="text" placeholder="name">
    <input data-lz:bind="age" type="number" placeholder="age">
    <input data-lz:bind="married" type="checkbox"> Married
</form>
<div data-lz:usestate="person">${name}'s age is ${age}${married ? " and married" :""}.</div>
```

### for JavaScript

```javascript
<script>
const {render,html} = lazui;
let count = 0;
const clicked = (event) => {
    count++;
    event.target.innerText = `Click count: ${count}`;
};
render(document.currentScript,
    html`<div onclick=${clicked}>Click count: ${count}</div>`,
    {where:"afterEnd"});
</script>
```

Ok, now it's time to [dive in](https://lazui.org/docs/lazui.md)!

## Change History (Reverse Chronological Order)

2023-12-09 v0.0.63-a fixed issue with delete property on state proxy not returning true

2023-12-09 v0.0.62-a fixed issue with setState not having default 3rd argument,  fixed issue with state updating on nested objects when oldValue was undefined

2023-12-07 v0.0.61-a completed upgrade to separate flexrouter package

2023-11-16 v0.0.60a corrected flexrouter path in defaults.

2023-11-16 v0.0.59a final changes to support `ws` in place of `websockets`.

2023-11-16 v0.0.52-58a production router port and host management.

2023-11-16 v0.0.51a switched to using `flexrouter`. documentation forthcoming.

2023-11-04 v0.0.50a final attempt to fix websocket CSP issue before CSPs are removed

2023-11-04 v0.0.49a another attempt to fix websocket CSP issue

2023-11-04 v0.0.48a attempt to fix websocket CSP issue

2023-11-04 v0.0.47a added search capability to TOC

2023-11-02 v0.0.46a removed `lz:showsource` in favor of `examplify`, added reltive pathing to embedded routes, enhanced docs

2023-11-01 v0.0.45a added `lz:usedefaults` option, optimized initial load, enhanced docs

2023-11-01 v0.0.44a fixed issue with setting state properties that use dot notation, enhanced docs

2023-10-31 v0.0.43a removed remote data sync for now, changed remote state to use router, added state lifecycle events,
enhanced docs

2023-10-31 v0.0.42a enhanced docs, fixed issue related to styles not being applied for documents loaded via `lz:src`

2023-10-31 v0.0.41a updated version of examplify, changed `lz:on` to `lz:trigger, fixed issues with multi-target updates, enhanced docs

2023-10-30 v0.0.40a updated version of examplify

2023-10-30 v0.0.39a fixed router issue dependency on examplify when deployed

2023-10-30 v0.0.38a fixed issue backtick substitution and highlightjs, documented examplify

2023-10-29 v0.0.37a fixed issue with handler loading for routes

2023-10-29 v0.0.36a added use of examplify

2023-10-29 v0.0.35a trying out lazui protocol idea

2023-10-29 v0.0.34a added client side markdown support

2023-10-29 v0.0.32a-33a performance optimizations

2023-10-28 v0.0.31a another index.md bug fix post speed improvements

2023-10-28 v0.0.30a fixed example bug on index.md

2023-10-28 v0.0.29a page load speed improvements

2023-10-28 v0.0.28a documentation updates, fixed issues that appeared when minification was turned on

2023-10-28 v0.0.27a documentation updates, fixed issue with sourcing state remotely, fixed issue with template hooks

2023-10-28 v0.0.26a documentation updates, client side routing refinements, fixed toc nesting issue, added custom element
git-issue-ref.

2023-10-27 v0.0.25a documentation updates, client side routing refinements, form binding refinements

2023-10-26 v0.0.23a documentation updates, client side routing refinements, form binding refinements

2023-10-26 v0.0.22a documentation updates, form handling refinements, client side routing refinements

2023-10-25 v0.0.21a documentation updates, form handling refinements, rendering refinements

2023-10-25 v0.0.20a documentation updates, refinement to TOC handling

2023-10-25 v0.0.19a documentation updates, refinement to data sync

2023-10-24 v0.0.18a documentation updates, refinement to WordChart processing

2023-10-23 v0.0.17-a server data sync, content updates

2023-10-22 v0.0.16-a size optimizations

2023-10-21 v0.0.11-a thru v0.0.15-a Getting `sse`, `pubsub`, `ws` working with CDN load

2023-10-21 v0.0.10-a Added `lz:usehighlighter` directive.

2023-10-21 v0.0.5-9-a Enabling CDN loading

2023-10-21 v0.0.4-a Path correction for CDN loading

2023-10-21 v0.0.3-a Adding ability to load/run from CDN

2023-10-21 v0.0.2-a Documentation updates, optimizations, server bug fixes

2023-10-19 v0.0.1-a Initial Release.



