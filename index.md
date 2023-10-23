<!-- https://www.unpkg.com/@anywhichway/lazui@0.0.16-a -->
<script src='/lazui' autofocus 
    data-lz:usejson="https://esm.sh/json5"
    data-lz:usehighlighter="https://esm.sh/highlight.js"
    data-lz:userouter="https://esm.sh/hono"
    data-lz:options="{userouter:{importName:'Hono',isClass:true,allowRemote:true},usehighlighter:{style:'/styles/default.css'}}">
</script>
<title>lazui: Web UI's with less work</title>
<div style="width:100%" data-lz:src="./docs/header.html"></div>

<div style="width:100%;text-align:center;font-size:20px">The lazy UI framework. Get `lazui`, do less, deliver more.</div>

<template data-lz:state="lazuiwords">
{
    type: 'WordTree',
    options:{
        maxFontSize: 18,
        wordtree: {
            format: 'implicit',
            word: 'lazui'
        }
    },
    data: [
        ['Phrases'],
        ['lazui as in pronounced lazy'],
        ['lazui as in lazy loading'],
        ['lazui as in do less and deliver more'],
        ['lazui has benefit reduced or no javascript'],
        ['lazui has benefit small core(7k minimized and compressed)'],
        ['lazui has benefit incremental loading'],
        ['lazui has benefit no virtual dom'],
        ['lazui has benefit no build process'],
        ['lazui has benefit no custom server required'],
        ['lazui has benefit choice of multiple paradigms'],
        ['lazui has benefit Markdown friendly'],
        ['lazui features ${templates in HTML}'],
        ['lazui features attributes for styling'],
        ['lazui features attributes for layout'],
        ['lazui features attributes for state and data management'],
        ['lazui features attributes for event management'],
        ['lazui features attributes for content loading and targetting'],
        ['lazui features JavaScript free server side events'],
        ['lazui features JavaScript free web sockets'],
        ['lazui features JavaScript free form processing'],
        ['lazui features JavaScript free routing'],
        ['lazui features JavaScript free charts and gauges'],
        ['lazui features JavaScript free remote data synchronization'],
        ['lazui features JavaScript access to html template function'],
        ['lazui features JavaScript access to render function'],
        ['lazui features JavaScript access to pre-built server'],
        ['lazui draws from htmx'],
        ['lazui draws from lighterHTML'],
        ['lazui draws from Knockout'],
        ['lazui draws from Turbo'],
        ['lazui draws from Stimulus'],
        ['lazui draws from Vue'],
        ['lazui draws from Lit-Element'],
        ['lazui draws from hyperHTML'],
        ['lazui draws from Riot']
    ]
}
</template>
<div data-lz:controller="/controllers/lz/chart.js" data-lz:usestate="lazuiwords" data-lz:options='{controller:{packages:["wordtree"]}}'>

</div>

# quick start

```html
<script src="https://www.unpkg.com/@anywhichway/lazui"></script>
```

## for HTML

```html
<template id="goodbye">
    Goodbye ${userName}
</template>
<div data-lz:src="#goodbye" data-lz:state='{userName:"John"}' data-lz:on="click dispatch:load" data-lz:target="outer">
    Hello, ${userName}. The date and time is ${new Date().toLocaleTimeString()}. Click to leave.
</div>
```

<template id="goodbye">
    Goodbye ${userName}!
</template>
<div data-lz:src="#goodbye" data-lz:state='{userName:"John"}' data-lz:on="click dispatch:load" data-lz:target="outer">
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
