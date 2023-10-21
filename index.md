<script src='./lazui.js' autofocus 
    data-lz:usejson="https://esm.sh/json5" 
    data-lz:userouter="/hono/hono.js" 
    data-lz:options="{userouter:{importName:'Hono',isClass:true,allowRemote:true}}">
</script>
<title>lazui: Web UI's with less work</title>
<div data-lz:src="./docs/header.html"></div>

Short for &quot;lazy UI&quot;. Single page apps and lazy loading sites with minimal JavaScript or client build processes.

`lazui` is pronounced &quot;lazy&quot;, as in &quot;Lazy loading &period;&period;&period;&quot; or &quot;Get lazui &period;&period;&period; do less
&period;&period;&period; deliver more!&quot;

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
<template id="goodbye">
    Goodbye ${userName}
</template>
<div data-lz:src="#goodbye" data-lz:state='{"userName":"John"}' data-lz:on="click dispatch:load" data-lz:target="outer">
    Hello, ${userName}. The date and time is ${new Date().toLocaleTimeString()}. Click to leave.
</div>
```

<template id="goodbye">
    Goodbye ${userName}!
</template>
<div data-lz:src="#goodbye" data-lz:state='{"userName":"John"}' data-lz:on="click dispatch:load" data-lz:target="outer">
    Hello, ${userName}. The date and time is ${new Date().toLocaleTimeString()}. Click to leave.
</div>

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

<script>
const {render,html} = lazui;
let count = 0;
const clicked = (event) => {
    count++;
    event.target.innerText = `Click count: ${count}`;
};
render(document.currentScript, html`<div onclick=${clicked}>Click count: ${count}</div>`,{where:"afterEnd"});
</script>


# all the things

- String literal templates directly in HTML, e.g. `<div>\${new Date()}</div>`
- Extensive target options
    - `beforebegin`, `afterBegin`, `beforeEnd`, `afterEnd`, `inner`,
      `outer`, `firstChild`, `lastChild`, `_body`, `_top`
    - CSS targets for multiple location updates
- Works well with [Markdown](./lazui.md/#working-with-markdown)
- As few or as many dynamically loaded attribute directives as you wish
    - pre-built directives:
        - `lz:state`, `lz:usestate` for [state](docs/lazui.md#using-state),
        - `lz:src` and `lz:mode` for [loading content](./lazui#loading-content), including [single page components](./lazui#single-page-components).
        - `lz:url` for use with [client side routing](./lazui#client-side-routing),
        - `lz:on` for [handling events](./lazui#handling-events),
        - `lz:foreach`, `lz:if`, `lz:show`, `lz:showsource` for [content control](./lazui#content-control),
        - `lz:dataset` for element [dataset management](./lazui#dataset-management),
        - `lz:style`, `lz:aria` for [styling and accessibility](./lazui#styling-and-accessibility),
        - `lz:tagname` for [custom elements](./lazui#creating-custom-elements),
        - `lz:usejson` for [configuring the JSON parser](./lazui#configuring-the-json-parser),
        - `lz:controller` for loading a custom controller
    - custom directives, e.g. [lz:mycustomdirective](./lazui#creating-custom-attribute-directives)
- As few or as many dynamically loaded controllers as you wish
    - [pre-built controllers](pre-built-controllers)
        - [router](./lazui#treating-elements-as-files)
        - [form](./lazui#form), [input](./lazui#input), [select](./lazui#select), [textarea](./lazui#textarea) for form processing
        - [chart](./lazui#charts) for pie charts, guages, etc.
        - [ws](./lazui#web-sockets), [sse](./lazui#server-sent-events), [pubsub](./lazui#pubsub) for websockets, server sent events, and pubsub
    - [custom controllers](./lazui#defining-custom-controllers)
- `html` template literal and `render` functions for string interpolation and rendering
    - [html](./lazui#html) template literals can return raw HTML or a document fragment
    - Powerful [render](./lazui#render) function
        - accepts a `where` argument to specify where to render the content
        - a `state` argument to specify the state to use
        - accepts interpolations, DOM nodes, and strings as content
- [Chose an attribute name space]() with or without the `data-` prefix, e.g. `data-lz:src`, `lz:src`, or even `myname:src`.
- No virtual DOM. The dependency tracker targets just those nodes that need updates.
- A [basic server](docs/lazui.md#basic-server) with markdown processing, automatic minification, server side events and web sockets already implemented.