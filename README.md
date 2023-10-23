# lazui

![GitHub](https://img.shields.io/github/license/anywhichway/lazui)


Single page apps and lazy loading sites with minimal JavaScript or client build processes.

`lazui` is pronounced "lazy", as in "Lazy loading ... " or "Get lazui ... do less ... deliver more!"

# introduction

`lazui` gives you access to the best ideas from [htmx](https://htmx.org/), [lighterHTML](https://github.com/WebReflection/lighterhtml),  [Knockout](https://knockoutjs.com/), [Turbo](https://turbo.hotwired.dev/) and [Stimulus](https://stimulus.hotwired.dev/) and [Vue](https://vuejs.org/)

`lazui` has a small core (less than 7K) and incremental loading of just the parts you use. Or, you can [create a custom bundle](./lazui.md/#creating-a-custom-bundle) for one time loading.

# motivation

There are great features in the above libraries, you should not have to choose just one approach.

- Why shouldn't you be able to choose the simplest way to implement a feature?
- Why should content only be sourced from URLs?
- Why shouldn't templating be directly available in HTML?
- Why should you have to write a bunch of client side JavaScript to use WebSockets or Server Sent Events?
- Why should you be limited to the attribute directives that come with a library?
- Why should `<a>` and `<form>` elements be the only ones that can make requests?
- Why should you only be able to target the entire page (`_top`) or use another tab (`_blank`), or be limited to one target?
- Why should you have to implement a server from scratch?

# quick start

```html
<script src="./lazui.js"></script>
```

## for HTML

```html
<template id="#goodbye">
    Goodbye ${userName}
</template>
<div data-lz:src="#goodbye" data-lz:state='{"userName":"John"}' data-lz:on="click dispatch:load" data-lz:target="outer">
    Hello, ${userName}. The date and time is ${new Date().toLocaleTimeString()}
</div>
```

See the main site for a live example: [https://lazui.org](https://lazui.org)

## for JavaScript

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

See the main site for a live example: [https://lazui.org](https://lazui.org)

# all the things

- String literal templates directly in HTML, e.g. `<div>\${new Date()}</div>`
- Extensive target options
    - `beforebegin`, `afterBegin`, `beforeEnd`, `afterEnd`, `inner`,
      `outer`, `firstChild`, `lastChild`, `_body`, `_top`
    - CSS targets for multiple location updates
- Works well with [Markdown](https://lazui.org/docs/lazui.md/#working-with-markdown)
- As few or as many dynamically loaded attribute directives as you wish
    - pre-built directives:
        - `lz:state`, `lz:usestate` for [state](https://lazui.org/docs/lazui.md#using-state),
        - `lz:src` and `lz:mode` for [loading content](https://lazui.org/docs/lazui.md#loading-content), including [single page components](https://lazui.org/docs/lazui.md#single-page-components).
        - `lz:url` for use with [client side routing](https://lazui.org/docs/lazui.md#client-side-routing),
        - `lz:on` for [handling events](https://lazui.org/docs/lazui.md#handling-events),
        - `lz:foreach`, `lz:if`, `lz:show`, `lz:showsource` for [content control](https://lazui.org/docs/lazui.md#content-control),
        - `lz:dataset` for element [dataset management](https://lazui.org/docs/lazui.md#dataset-management),
        - `lz:style`, `lz:aria` for [styling and accessibility](https://lazui.org/docs/lazui.md#styling-and-accessibility),
        - `lz:tagname` for [custom elements](https://lazui.org/docs/lazui.md#creating-custom-elements),
        - `lz:usejson` for [configuring the JSON parser](https://lazui.org/docs/lazui.md#configuring-the-json-parser),
        - `lz:controller` for loading a custom controller
    - custom directives, e.g. [lz:mycustomdirective](https://lazui.org/docs/lazui.md#creating-custom-attribute-directives)
- As few or as many dynamically loaded controllers as you wish
    - [pre-built controllers](pre-built-controllers)
        - [router](https://lazui.org/docs/lazui.md#treating-elements-as-files)
        - [form](https://lazui.org/docs/lazui.md#form), [input](https://lazui.org/docs/lazui.md#input), [select](https://lazui.org/docs/lazui.md#select), [textarea](https://lazui.org/docs/lazui.md#textarea) for form processing
        - [chart](https://lazui.org/docs/lazui.md#charts) for pie charts, guages, etc.
        - [ws](https://lazui.org/docs/lazui.md#web-sockets), [sse](https://lazui.org/docs/lazui.md#server-sent-events), [pubsub](https://lazui.org/docs/lazui.md#pubsub) for websockets, server sent events, and pubsub
    - [custom controllers](https://lazui.org/docs/lazui.md#defining-custom-controllers)
- `html` template literal and `render` functions for string interpolation and rendering
    - [html](https://lazui.org/docs/lazui.md#html) template literals can return raw HTML or a document fragment
    - Powerful [render](https://lazui.org/docs/lazui.md#render) function
        - accepts a `where` argument to specify where to render the content
        - a `state` argument to specify the state to use
        - accepts interpolations, DOM nodes, and strings as content
- [Chose an attribute name space]() with or without the `data-` prefix, e.g. `data-lz:src`, `lz:src`, or even `myname:src`.
- No virtual DOM. The dependency tracker targets just those nodes that need updates.
- A [basic server](https://lazui.org/docs/lazui.md#basic-server) with markdown processing, automatic minification, server side events and web sockets already implemented.


## Change History (Reverse Chronological Order)

2023-10-23 v0.0.17-a server data sync, content updates

2023-10-22 v0.0.16-a size optimizations

2023-10-21 v0.0.11-a thru v0.0.15-a Getting `sse`, `pubsub`, `ws` working with CDN load

2023-10-21 v0.0.10-a Added `lz:usehighlighter` directive.

2023-10-21 v0.0.5-9-a Enabling CDN loading

2023-10-21 v0.0.4-a Path correction for CDN loading

2023-10-21 v0.0.3-a Adding ability to load/run from CDN

2023-10-21 v0.0.2-a Documentation updates, optimizations, server bug fixes

2023-10-19 v0.0.1-a Initial Release.



