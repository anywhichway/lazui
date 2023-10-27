<script>
(() => {
   let src;
   try {
      src = new URL(document.location).searchParams.get("lazui");
      new URL(lazuiURL);
   } catch(e) {
      src = new URL(document.location).searchParams.has("cdn") ? "https://www.unpkg.com/@anywhichway/lazui" : "/lazui";
   }
   const attributes = {
      src,
      "data-lz:usejson":"https://esm.sh/json5",
      "autofocus":"",
      "data-lz:userouter":"https://esm.sh/hono",
      "data-lz:usehighlighter":"https://esm.sh/highlight.js",
      "data-lz:options":"{userouter:{importName:'Hono',isClass:true,allowRemote:true},usehighlighter:{style:'/styles/default.css'}}"
      },
      script = document.createElement("script");
   for(let [key,value] of Object.entries(attributes)) {
     script.setAttribute(key,value);
   }
   document.currentScript.remove();
   document.write(script.outerHTML);
})();
</script>
<title>lazui: Web UI's with less work</title>
<div style="width:500px;margin:auto" data-lz:src="./docs/header.html"></div>

<p style="width:100%;text-align:center;font-size:20px">The lazy UI framework. Get lazui ... do less ... deliver more.</p>

<p style="width:100%;text-align:center"><a href="#quick-start">Quick Start</a> or <a href="/docs/lazui.md">Dive In</a></p>

<div style="margin:auto;width:70%">

## introduction

- A JavaScript library that allows you to create interactive websites and single page apps with less work.
- Extends the attribute space of typical HTML to provide a rich set of functionality. 
- Provides the JavaScript, so you don't have to.

## all the things

<template data-lz:state="lazuiwords">
{
    type: 'WordTree',
    options:{
        maxFontSize: 20,
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
        ['lazui has benefit reduced or no JavaScript'],
        ['lazui has benefit small core(8k minimized and compressed)'],
        ['lazui has benefit incremental loading'],
        ['lazui has benefit no virtual DOM'],
        ['lazui has benefit no build process'],
        ['lazui has benefit no custom server required'],
        ['lazui has benefit choice of multiple development paradigms'],
        ['lazui has benefit Markdown friendly'],
        ['lazui features attributes for styling and accessibility'],
        ['lazui features attributes for state management'],
        ['lazui features attributes for event management'],
        ['lazui features attributes for content loading and targeting'],
        ['lazui features attributes for content control'],
        ['lazui features without JavaScript ${templates in HTML}'],
        ['lazui features without JavaScript server sent events'],
        ['lazui features without JavaScript web sockets'],
        ['lazui features without JavaScript form processing'],
        ['lazui features without JavaScript client side routing'],
        ['lazui features without JavaScript charts and gauges'],
        ['lazui features without JavaScript document table of contents'],
        ['lazui features without JavaScript remote data synchronization'],
        ['lazui features with JavaScript html template function'],
        ['lazui features with JavaScript render function'],
        ['lazui features with JavaScript custom attributes and controllers'],
        ['lazui features with JavaScript web components (custom elements)'],
        ['lazui features with JavaScript advanced configuration'],
        ['lazui features with JavaScript configurable bundling'],
        ['lazui features with JavaScript pre-built server'],
        ['lazui draws from htmx'],
        ['lazui draws from lighterHTML'],
        ['lazui draws from Knockout'],
        ['lazui draws from Turbo and Stimulus'],
        ['lazui draws from Vue'],
        ['lazui draws from Lit-Element'],
        ['lazui draws from Riot']
    ]
}
</template>
<div id="lazuiwordtree" data-lz:controller="/controllers/lz/chart.js" data-lz:usestate="lazuiwords" data-lz:options='{controller:{redirectEvents:true,packages:["wordtree"]}}'></div>
<style>
    .wordtree-leaf {
        font-style: italic;
        cursor: pointer;
    }
</style>
<script>
(() => {
    const slugs = {
        "lazy loading": "lazy-loading",
        "small core": "introduction",
        "reduced or no JavaScript": "introduction",
        "virtual DOM": "dependency-tracking",
        "choice of multiple development paradigms": "choosing-a-development-paradigm",
        "Markdown friendly": "working-with-markdown",
        "styling and accessibility": "styling-and-accessibility",
        "control": "content-control",
        "state management": "using-state",
        "event management": "handling-events",
        "loading and targeting": "loading-content",
        "${templates in HTML}":"how-to-be-lazui",
        "server sent events":"server-sent-events",
        "web sockets":"web-sockets",
        "form processing":"with-forms",
        "client side routing":"client-side-routing",
        "charts and gauges":"charts",
        "document table of contents":"document-table-of-contents",
        "remote data synchronization":"remote-data-synchronization",
        "html template function":"html",
        "render function":"render",
        "custom attributes and controllers":"creating-custom-attribute-directives",
        "web components (custom elements)":"creating-custom-elements",
        "advanced configuration":"advanced-configuration",
        "configurable bundling":"creating-a-custom-bundle",
        "pre-built server":"basic-server",
        "htmx":"htmx",
        "lighterHTML":"lighterhtml",
        "Knockout":"knockout",
        "Turbo and Stimulus":"turbo-and-stumulus",
        "Vue":"vue",
        "Lit-Element":"lit-element",
        "Riot":"riot"
    };
    const el = document.getElementById("lazuiwordtree");
    let __LABEL__ = "";
    el.addEventListener("click",(event) => {
        const {label,targets} = el.getLabel(event.target);
        if(slugs[__LABEL__]) {
            window.location.href = `/docs/lazui.md#${slugs[__LABEL__]}`;
        }
    });
    el.addEventListener("mouseenter",(event) => {
        if(event.target.classList.contains("wordtree-leaf")) {
            const {label,targets} = el.getLabel(event.target);
            __LABEL__ = label;
        } 
    });
    el.addEventListener("mouseleave",(event) => {
        if(event.target.classList.contains("wordtree-leaf")) {
            __LABEL__ = "";
        } 
    });
    el.addEventListener("ready",() => {
        for(const txt of el.querySelectorAll('[wordtreeleaf="true"]')) {
            const {label,targets} = el.getLabel(txt);
            if(slugs[label]) {
                txt.setAttribute("class","wordtree-leaf");
            }
        }
    });
})();
</script>

## quick start

```html
<script src="https://www.unpkg.com/@anywhichway/lazui"></script>
```

### for HTML

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

<script>
const {render,html} = lazui;
let count = 0;
const clicked = (event) => {
    count++;
    event.target.innerText = `Click count: ${count}`;
};
render(document.currentScript, html`<div onclick=${clicked}>Click count: ${count}</div>`,{where:"afterEnd"});
</script>

Ok, now it's time to [dive in](/docs/lazui.md)!

<div style="width:100%;text-align:center" data-lz:src="/docs/footer.html"></div>
</div>
