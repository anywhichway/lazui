<script src="https://www.unpkg.com/@anywhichway/lazui" data-lz:usedefaults></script>
<script>
document.addEventListener("lz:loaded", async (lazui) => {
   const issues = await fetch("https://api.github.com/repos/anywhichway/lazui/issues").then(r => r.json());
   issues.filter((issue) => issue.assignee).forEach((issue) => {
      const parts = issue.body ? issue.body.split(" ") : [],
         ids = parts.filter((item) => item.startsWith("#"));
      ids.forEach((id) => {
         const el = document.getElementById(id.slice(1));
         if(el) {
            const ref = document.createElement("git-issue-ref");
            ref.setAttribute("src",`/anywhichway/lazui/${issue.number}`);
            el.after(ref);
         }
      });
   });
});
</script>


<title>lazui Documentation</title>
<style>
   .issue {
      margin-left: 20px;
      margin-bottom: 10px;
      color: rgba(255,0,0,0.85);
   }
   .issue::before {
      content: "Issue: ";
   }
</style>
<a href="../index.md">lazui</a>
<template data-lz:src="lz://components/git-issue-ref.html" data-lz:tagname="git-issue-ref"></template>
<template data-lz:src="lz://components/toc.html" data-lz:tagname="lz-toc"></template>
<lz-toc></lz-toc>

## Introduction

`lazui` is a JavaScript library that allows you to create interactive websites and single page apps with less work.

It extends the attribute space of typical HTML to provide a rich set of functionality. 

It provides the JavaScript, so you don't have to.

`lazui` draws its inspiration from the varied capabilities of [htmx](https://htmx.org/), [lighterHTML](https://github.com/WebReflection/lighterhtml),
[Turbo](https://turbo.hotwired.dev/), [Stimulus](https://stimulus.hotwired.dev/),
[Vue](https://vuejs.org/), and [Lit](https://lit.dev). It also provides a number of features not found in these libraries.

The first major release of `lazui` is feature complete; however it needs more testing, optimization, improved documentation, 
and some functionality to round out the automatic form generation. In this case, don't be lazy ... join us and help out 
by [creating issues on GitHub](https://www.github.com/anywhichway/lazui/issues).

## Documentation Conventions

It is possible to completely modify the `lazui` namespace. Throughout the documentation, references
to attribute directives will take the form `lz:<directive>` and sample code will use the standards compliant form
`data-lz:<directive>`, but they could just as well be `data-myapp:<directive>` or even `myapp:<directive>`.

Attribute Directive
: A custom attribute that is used to make relatively minor modifications to the behavior of an element. For instance,
`lz:src` is an attribute directive that loads content into an element. Elements can have multiple attribute directives.

In some cases, the documentation will use `TypeScript` notation to make APIs clear, however, `lazui` is not written in
`TypeScript`.

Most of the JSON in this document is in [JSON5](https://json5.org/) format. This makes JSON easier to write and less error
prone. See [Relaxed JSON Parser](#relaxed-json-parser) for more information. Unless you configure your version of `lazui` 
to use JSON5, you will need to modify the JSON in the examples to be valid JSON.

Any time you see a CDN URL for `lazui` you could use just `/lazui` if you are running the [basic lazui server](#basic-server).

If there are known issues, the document will describe the issue and provide a link to the details on GitHub.

If you view the documentation from a locally installed `lazui` [server](#basic-server), it has realtime integration with 
GitHub. Any issues that have been logged and assigned where an anchor id in this document is referenced in the issue description 
will be highlighted in the document along with a link back to the issue on GitHub. This is accomplished with the `lazui` 
component `git-issue-ref`. See [Single Page Components](#single-page-components)

## Installation

### CDN

Unless you need your own attribute directives, you can use the CDN version of `lazui`. Place the following script tag 
in the head of your HTML:

```html
<script src='https://www.unpkg.com/@anywhichway/lazui' autofocus></script>
```

`lazui` has a core size of less that 8K minimized and Brotli compressed and can be used without a build process, but
[enhanced with one](#creating-a-custom-bundle).


Unless you are willing to [write your own JavaScript](#using-javascript), you should always provide the `autofocus` attribute. It 
tells `lazui` to process all the custom attribute directives and template substitutions in the document.

### Local

You can also install `lazui` from `npm`:

```bash
npm install @anywhichway/lazui
```

Then run:

```bash
npm run serve
```

Access `lazui` and this documentation at `http://localhost:3000/`.

See [Basic Server](#basic-server) for more information on the `lazui` server you can customize.

[https://lazui.org](https://lazui.org) uses this basic server and is hosted on [Render](https://render.com/).

## How To Be Lazui

You can put template literals directly in your HTML. Here is the first simple example:

```html
<html>
    <head><script src="https://www.unpkg.com/@anywhichway/lazui" autofocus></head>
    <body>
        Hello, the date and time is ${new Date().toLocaleTimeString()}
    </body>
</html>
```

The above will render as:

<div>Hello, the date and time is ${new Date().toLocaleTimeString()}</div>

### Working With Markdown

You can even include template literals in your Markdown.

```markdown
Hello, the date and time is ${new Date().toLocaleTimeString()}
```

renders as:

<template data-lz:url:get="./working-with-markdown.md" data-lz:mode="document">
Hello, the date and time is ${new Date().toLocaleTimeString()}
</template>
<div data-lz:src="./working-with-markdown.md" data-lz:mode="open"></div>


### Additional Options

You can also configure `lazui` to:
- use a [relaxed JSON parser](#relaxed-json-parser),
- highlight code [highlighter](#code-highlighting),
- handle [client side routes](#client-side-routing) with optional Markdown transformation.

```html
<script src="https://www.unpkg.com/@anywhichway/"
      autofocus
      data-lz:usejson="https://esm.sh/json5"
      data-lz:usehighlighter="https://esm.sh/highlight.js"
      data-lz:userouter="https://esm.sh/hono"
      data-lz:options="{
         userouter: {
            importName:'Hono',
            isClass:true,
            allowRemote:true,
            markdownProcessor: {
               src:'https://esm.sh/markdown-it',
               call:'render',
               isClass:true,
               options: {
                  html:true,
                  linkify:true
               }
            }
         },
         usehighlighter:{
            style:'/styles/default.css'
         }
      }">
</script>
```

A bit overwhelming? Use this shorthand:

```html
<script src="https://www.unpkg.com/@anywhichway/lazui" data-lz:usedefaults></script>
```

### Choose Your Development Paradigm

Although `lazui` can be used as a powerful JavaScript rendering engine, it really shines at reducing the amount of
JavaScript required to create an interactive website or single page app. This shininess is provided through a set of
attribute directives and JavaScript controller files.

If you are a fan of `Turbo` or `htmx`, you probably want to write less JavaScript. Since writing HTML is easier than
JavaScript, the documentation uses the `lazui` (lazy) approach and covers the use of directives and controllers before
the more [JavaScript focused](#using-javascript) [html](#html) and [render](#render) functions.

## Leveraging Attribute Directives

Attribute directives take the form `<namespace>:<directive>=<value>`. The default `lazui` namespace is `lz`.

Attribute directives are each stored in their own JavaScript file using the name of the directive as the file name. 
By convention, the files are in a directory called `directives` with subdirectories for each namespace. 
Hence, `lz:src` should be in `/directives/lz/src.js`.

If this convention is followed, `lazui` will lazy load only those directives that are used. If you want to preload
directives or use a different naming/filesystem convention, you can [load the directives directly using JavaScript](#loading-attribute-directives).

Attribute directives can be provided configuration values with another directive called `lz:options`. The value of
`lz:options` is a JSON object. The `lz:options` directive can be placed on any element and will apply to all directives.
The configuration data for a specific directive is provided through a key of the same name as the directive. For instance,

```html
<div data-lz:controller="/controllers/lz/chart.js" 
     data-lz:options="{controller:{type:'BarChart'}}" 
     data-lz:usestate="pizza">
</div>
```

### Relaxed JSON Parser

The directive `lz:usejson` can be used to configure the JSON parser for more flexibility. This can dramatically simplify 
using embedded JSON by eliminating the need for quotes around keys and allowing the use of single quotes for strings. In
short, you can be lazy about your JSON.

You can do this:

```json
{
    name: "John",
    age: 30
}
```

instead of this:

```json
{
    "name": "John",
    "age": 30
}
```

The attribute takes as its value a URL pointing to the parser. [JSON5](https://json5.org/) is a good choice.

```html
<div data-lz:usejson="https://esm.sh/json5"></div>
```

or, if you have a local copy of JSON5:

```html
<div data-lz:usejson="/json5.js"></div>
```

### Using State

Being able to insert a date and time or do inline math may with templates in HTML be useful, but you will probably want 
to include general data.

The `data-lz:state` attribute can be used to define a state/model. The value of the attribute is the name of the state/model. 
The state/model is defined as a JSON object inside an element (typically a `<template>`) or [loaded from a file](#loading-content):

```!html
<template data-lz:state="person">
{
    name: "John",
    age: 30
}
</template>
```

Now you can do this:

<div data-lz:usestate="person" data-lz:showsource="beforeBegin">${name} is ${age} years old.</div>

You can also set a state as the default state for a `document` or globally using `global` (stored on the `window` object):

```html
<template data-lz:state:document="person">
{
    "name": "John",
    "age": 30
}
</template>
```

There are more [advanced use of state](#advanced-use-of-state) to support storing it in a database or remote server synchronization
[documented later](#advanced-use-of-state).

#### With Markdown

Setting state at the document level can be useful with Markdown. Below is the content of the file 
`using-state-with-markdown.md`, followed by the `HTML` loading the file into an `<iframe>` (which is optional).

```html
*${name}* is *${age}* years old.
<template data-lz:state:document="person">
{
    name: "Mary",
    age: 21
}
</template>
```

Due to issues with some Markdown parsers, you MUST put state template at the end.

```html
<div data-lz:src="/using-state-with-markdown.md" 
     data-lz:mode="frame" 
     title="Lazui: Markdown Example"></div>
```

<template data-lz:url:get="./using-state-with-markdown.md" data-lz:mode="document">
*${name}* is *${age}* years old.
<template data-lz:state:document="person">
{
    "name": "Mary",
    "age": 21
}
</template>
</template>
<div data-lz:src="./using-state-with-markdown.md" data-lz:mode="frame" title="Lazui: Markdown Example"></div>

#### Reactive State

Modifying a state will cause any elements using the state to be updated.

```!html
<div data-lz:state="{clickCount:0}" onclick="this.getState().clickCount++">
    Click Count: ${clickCount}
</div>
```

`lazui` does not use a virtual DOM to manage changes, it uses direct dependency tracking. A special updating function 
wrapped around the normal browser screen refresh handler tracks state access. When a state changes, the nodes that depend 
on that state are updated. The nodes are typically text nodes, but can also be attributes. This is automatic when working 
at the no JavaScript level. You can take a more functional approach and manage reactivity yourself by using the [html](#html) 
tagged template literal and [render](#render) functions if you write JavaScript.

#### Inline State

You can also define state inline by providing JSON as the value of the `data-lz:state` attribute. An element id will be
generated automatically if the element does not have an id.

```!html
<div data-lz:state="{name:'John',age:30}">
${name} is ${age} years old.
</div>
```

#### State Inheritance

States are inherited down the DOM and shadow the values of properties with the same name in ancestor element states.

```html
<template data-lz:state="person">
  {
  name: "John",
  age: 30
  }
</template>
<div data-lz:usestate="person">
  ${name} is ${age} years old.
  <div data-lz:state="{age:21}">
    ${name} is ${age} years old.
  </div>
</div>
```

<div data-lz:usestate="person">
    ${name} is ${age} years old.
    <div data-lz:state="{age:21}">
        ${name} is ${age} years old.
    </div>
</div>

### Loading and Submitting Content

```html
<div data-lz:src="./path/to/somefile.html"></div>
``` 

By default, this will load the contents of `somefile.html` as the `innerHTML` of the `div`.

So long as a [router has been enabled](#client-side-routing), if the `lz:src` value starts with a `#` it is treated as 
an element id and the `innerHTML` of the element is used as the content. Typically, these will be `<templates>`, but they
do not have to be.

```!html
<template id="myelement">
    Content stored in a template
</template>
<div data-lz:src="#myelement"></div>
```

*Markdown Hint*: Except for your main `.md` file, you do not have to add the `lazui.js` script to your `markdown` files, 
it will be added automatically used for any content loaded using `lz-src`.

#### Targets

Anything with a `src`, `action` (forms), or `data-lz:src`, attribute can have a `data-lz:target` attribute. The value
can be `beforeBegin`, `previousSibling`, `afterBegin`, `beforeEnd`, `nextSibling`, `afterEnd`, `inner`, `outer`, 
`firstChild`, `lastChild`, `body`, `parent`, `_top`, `_blank` or a CSS selectable target.

The targets are case-insensitive. The camelCase is used for legibility.

If `data-lz:target` is missing on elements other than anchors and forms, it defaults to `inner`.

The targets `inner`, `outer`, `parent` and `body` can also have a `!<css-selector>` suffix. This means you can update multiple
elements with a single anchor or form submission.

- `outer!<css>` and `inner!<css>` are effectively `this.querySelectorAll(<css>)` but one replaces the inside and the other outside
- `parent!<css>` is effectively `this.parentElement.querySelectorAll(<css>)` and replaces the innerHTML of the selected elements
- `body!<css>` is effectively `document.body.querySelectorAll(<css>)` and replaces the innerHTML of the selected elements

```!html
<div id="somecontent" hidden>Hello, World!</div>
<div id="myparent">
   <span class="someclass"></span>
   <span id="child2" 
      data-lz:src="#somecontent" 
      data-lz:target="parent!.someclass" 
      data-lz:trigger="mouseover 
      dispatch:load">Mouse over me!</span>
   <span class="someclass"></span>
</div>
```

#### State and Loaded Content

If `lz:usestate` is used with or in a parent element of one with `lz:src`, the state will be applied to the loaded content.

*Markdown Hint:* Super useful! No need to put HTML into your Markdown files:

The source of `markdowntemplate.md` is:

```markdown
${name} is ${age} years old.
```

<template data-lz:url:get="./markdowntemplate.md" data-lz:mode="document">
    ${name} is ${age} years old.
</template>

```!html
<div data-lz:src="./markdowntemplate.md" data-lz:usestate="person"></div>
```

#### Single Page Components

If the attribute `data-lz:mode` has the value `open`, content will load into a `shadowDOM` without
the need for a custom element. Hence, the HTML can include `<style>` tags that will be isolated from
the rest of the page.

Consider a file with these contents:

```html
<html>
    <head>
        <meta http-equiv="my-custom-header" content="my-custom-value">
        <style>
            p {
                color: red;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <p>
            element.html contents  
        </p>
        <script>
             (document.currentScript||currentScript).insertAdjacentText("afterEnd","This was inserted by a script");
        </script>
    </body>
</html>
```

<template id="element" data-lz:url:get="https://lazui.org/path/to/element.html" data-lz:mode="document">
    <head>
        <meta http-equiv="my-custom-header" content="my-custom-value">
        <style>
            p {
                color: red;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <p>
            element.html contents  
        </p>
        <script>
             (document.currentScript||currentScript).insertAdjacentText("afterEnd","This was inserted by a script");
        </script>
    </body>
</template>
<div data-lz:src="https://lazui.org/path/to/element.html" data-lz:mode="open" data-lz:showsource="beforeBegin"></div>

If the file has the same origin as the requesting document, scripts will be processed; otherwise, they will be
ignored. In the case above, they are ignored. However, if we mount a similar file locally, they
will be executed.

```!html
<template data-lz:url:get="./element.html" data-lz:mode="document">
    <style>
        p {
            color: red;
            font-weight: bold;
        }
    </style>
    <p>
        element.html contents  
    </p>
    <script>
        (document.currentScript||currentScript).insertAdjacentText("afterEnd","This was inserted by a script")
    </script>
</template>
<div data-lz:src="./element.html" data-lz:mode="open"></div>
```

**Note**: `data-lz:mode="closed"` is not supported.

If you are prepared to potentially write a lot JavaScript and want custom HTML tags, you can [create a custom element](#creating-custom-elements) 
with its own tag.

#### Using Forms

To bind form elements to state, use the `lz:bind` attribute. The value of the attribute is the name
of the property in the state.

If `lz:bind` has no value, but the `name` attribute is provided, the value of the `name` attribute is used as the
property in the state.

If `lz:bind` has a value and the `name` attribute is missing, the name attribute is added to the element.

The `lz:bind` directive supports dot notation for nested properties.

The form controller will add reasonable values for the attributes `placeholder` and `title` if they are missing.

By default, the state is updated on keyboard or mouse input, it can be set to `change` for when a value if fully
changed, or 'submit' for forms that have a submit button by using `lz:options="{controller:{bind:'change'}}"`.

*Note*: Processing forms requires the use of a directive not yet covered, `lz:controller`. See
[Pre-Built Controllers](#pre-built-controllers) for more information. Forms are covered here because it is likely the next
thing you will want to use after understanding the above.

##### With No Submit

```!html
<template data-lz:state="formexamplestate">
{
   name: "Tom",
   age: 21,
   married: false,
   address: {
      city: "New York",
      state: "NY"
   }
}
</template>
<div data-lz:usestate="formexamplestate">
   <form data-lz:controller="/controllers/lz/form.js" data-lz:options="{controller:{bind:'change'}}">
      <input name="name" data-lz:bind type="text" placeholder="name">
      <input name="age"data-lz:bind="age" type="number" title="user age">
      <input name="city" data-lz:bind="address.city" type="text" placeholder="city">
      <input data-lz:bind="married" type="checkbox"> Married
   </form>
   <div>${name}'s age is ${age}${married ? ", married, " :""} and lives in ${address.city}.</div>
</div>
```


##### With Standard Submit

Form submissions are intercepted and processed by `lazui` if the attribute `lz:controller="/controllers/lz/form.js"` has been applied
to the form. When submitted, the event is trapped and `fetch` is used to get the response for updating the target(s) of
the form. A template to format the results can be controlled via `lz:options`.

Encoding and method are handled by the standard `method` and `enctype` attributes.

The standard `enctypes` are:

- `application/x-www-form-urlencoded`
- `multipart/form-data`
- `text/plain`

`lazui` supports an additional type for forms to facilitate template completion and database operations on the server.

- `application/json`

The example below just returns the body it was sent.

<template data-lz:url:post="/reflectbody" data-lz:mode="document"></template>

```!html
<div data-lz:state="{name:'Dick',age:25}">
   Name: ${name} Age: ${age}
   <form action="/reflectbody" 
      data-lz:controller="/controllers/lz/form.js" 
      data-lz:target="nextSibling" 
      enctype="multipart/form-data"
      data-lz:options="{controller:{bind:'submit'}}">
         <input data-lz:bind="name" type="text" placeholder="name">
         <input data-lz:bind="age" type="number" placeholder="age">
         <button type="submit">Submit</button><br>
   </form>
</div>
```

##### With No Inner HTML

If a form has no `innerHTML`, the `state` local to the form is used to generate one based on the types of the property values.

*Note*: The state must be local to the forms. Forms do not support inherited state.

```!html
<template data-lz:state="formexample">
{
   name: "Joe",
   age: 20,
   address: {
      city: "Seattle",
      state: "WA"
   }
}
</template>
<form data-lz:controller="/controllers/lz/form.js" data-lz:usestate="formexample">
</form>
<div data-lz:usestate="formexample">
Name: ${name} Age: ${age} City: ${address.city} State: ${address.state}
</div>
```

Generated forms both read from and write to their state.

If the form has an action, a `sumbit` button will be added.

If `lz:options="{controller:{useLabels:true}}"` is set, labels will be provided.

```!html
<form data-lz:controller="/controllers/lz/form.js" data-lz:usestate="formexample" data-lz:options="{controller:{useLabels:true}}">
</form>
```

##### With Template Responses

If `lz:options` provides a template, the response is treated as JSON and the template is used to format the response.

```!html
<template id="formresponse">
    <div>Thank you for letting us know ${name}'s age, ${age}.</div>
</template>
<form action="/reflectbody" enctype="application/json" 
   data-lz:state="{name:'Harry',age:22}" 
   data-lz:controller="/controllers/lz/form.js" 
   data-lz:target="nextSibling" 
   data-lz:options="{controller:{format:'json',template:'#formresponse'}}">
   <input data-lz:bind="name" type="text" placeholder="name">
   <input data-lz:bind="age" type="number" placeholder="age">
   <button type="submit">Submit</button>
</form>
```

If a template is provided, then `expect:"json"` is assumed for the `lz:options` controller configuration, other expect
types will throw an error.

If no template is provided, then the response is treated as text unless `expect:"html"` or `expect:"template"` is provided in the options.

If `expect:"html"` is provided, the response is parsed as HTML, scripts are not run and only the body is used to place
at the `data-lz:target` or `target`.

If `expect:"template"` is provided, then the server is expected to provide a template for formatting. Hence, the returned
HTML is treated as a template and the state context of the form augmented by the form contents is used for resolution.
Any scripts in the template are executed. *Note*: Although the form contents are available to the template, the state is
not updated unless `lz:bind` has been used.

Assume the server returns this when a `post` is made to `/form-template-example`.

<template data-lz:url:post="/form-template-example" data-lz:mode="document" data-lz:showsource:inner="beforeBegin">
<div>${name}'s age is ${age}.</div>
</template>

```!html
<form action="/form-template-example"  
   data-lz:state="{name:'Harry',age:22}" 
   data-lz:controller="/controllers/lz/form.js" 
   data-lz:target="nextSibling" 
   data-lz:options="{controller:{expect:'template'}}">
   <input data-lz:bind="name" type="text" placeholder="name">
   <input data-lz:bind="age"  type="number" placeholder="age">
   <button type="submit">Submit</button>
</form>
```

#### Using Frames

The attribute `lz:mode` can also take the value `frame`. This will load the content into an `iframe` and unlike the
`open` mode, scripts will be executed regardless of origin, so long as a [content security policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) has not been applied.

```html
<div data-lz:src="https://lazui.org/path/to/element.html" data-lz:mode="frame" title="My Frame"></div>
```

<div data-lz:src="https://lazui.org/path/to/element.html" data-lz:mode="frame" title="My Frame"></div>

Note, if you are viewing the JavaScript console you may see a warning like this: 

```
An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing 
```

When `lazui` inserts content into an `<iframe>` it also sets the parent and global scope of the `<iframe>'s` content to
itself to prevent navigation out of the iframe.

#### Client Side Routing

The directive and value `lz:userouter="<urltorouter>"` will let you create a router without writing any Javascript. The
only router that has been well tested for `lazui` in the browser is [Hono](https://hono.dev), so use `lz:userouter="https://esm.sh/hono"`
for now.

```html
<template data-lz:userouter="/controllers/lz/router.js">
{
   importName: "Hono", // name of import from module file
   isClass: true, // optional, provide only if creating router requires a call to "new"
   options: {}, // options to pass to router
   allowRemote": true // optional, default is false, use true to allow spoofing of remote content,
   allowRemote:true,
   markdownProcessor: { // optional, only required if you expect to have untranslated Markdown delivered to the browser
      src:'https://esm.sh/markdown-it',
      call:'render',
      isClass:true,
      options: {
         html:true,
         linkify:true
      }
   }
}
</template>
```

Alternatively, see [Specifying A Router](#specifying-a-router), which requires a few lines of JavaScript.

With a `lazui` router in place, `<templates>s` with a `lz:url` attribute can be treated as files. This is useful for 
creating single page apps, documentation, demonstrations or testing the client with stubbed out responses when a server 
capability is not available.

The `lz:url` attribute always has a second component of `get`, `put`, `post`, or `delete` to indicate the HTTP method for
which a response is supported. The value of the attribute is the URL of the file. The path must always be a full URL or 
an absolute path on the current origin. Relative paths are not supported.

The `lz:url` attribute should only be associated with a `<template>`. It will be ignored elsewhere.

When associated with a `<template>` having a `lz:url` attribute, `lz:mode="document"` can be used to tell the router to 
never forward requests to a server. If the `mode` is not `document`, the local copy will be treated like a cache entry 
and all requests will also be forwarded to a server. Currently, cache control headers will not be respected.

Except for examples currently requiring server interaction, e.g. [Server Sent Events](#server-sent-events) and 
[Web Sockets](#web-sockets), all the examples in this document depend on files simulated by `<template>s` with a
`lz:url` attribute and a client side router.

##### Get

```!html
<template data-lz:url:get="./path/to/somefile.html" data-lz:mode="document">
    <style>
        p {
            color: red;
            font-weight: bold;
        }
    </style>
    <p>
        element.html contents  
    </p>
</template>
<div data-lz:src="./path/to/somefile.html" data-lz:mode="open"></div>
```

You can even simulate headers and status codes by adding `data-lz:header`, `data-lz:headers` and `data-lz:status`
attributes to the source elements.

```!html
<template data-lz:url:get="/404.html"
   data-lz:status="404"
   data-lz:mode="document">
      Not Found
</template>
<div data-lz:src="/404.html"></div>
```

You can include `head` and `body` sections. Any `meta http-equiv` content in the `head` section will be treated as a 
header and included in the router response headers.

```html
<template data-lz:url="https://lazui.org/path/to/element.html" data-lz:mode="document">
    <head>
        <meta http-equiv="my-custom-header" content="my-custom-value">
        <style>
            p {
                color: red;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <p>
            element.html contents  
        </p>
        <script>
            document.currentScript.insertAdjacentText("afterEnd","This was inserted by a script")
        </script>
    </body>
</template>
```

##### Put and Post

Elements with `lz:url:put` and `lz:url-post` are used to indicate to the router that it is should update the content 
of the `<template>` with the corresponding `lz:url:get`. If it does not exist, the `<template>` will be created with 
the attribute `lz:url:get="<someurl>"`. If the `put` or `post` `<element>` has content and the `lz:mode` is `document`,
then the content will used ad the response body; otherwise, the body of the request is reflected back.

See the next section [Enhanced Requests](#enhanced-requests) for an example.

##### Delete

Removes the content from the element with the corresponding `lz:url:get` URL and sets its `lz:status` to `404`.

##### Remote State

With a router in place you can access and store remote state. The `lz:state` attribute supports the use of `lz:src` and 
`lz:options`.

Below, it is used to store the state in `localStorage`. The state will prefer the data in the storage over
that originally specified as part of the `innerHTML`.

The below example uses some JavaScript, but that is just to show you that the state is being stored in `localStorage`.
You can use `localStorage` without needing to write JavaScript.

```!html
<template id="someuniqueid"
   data-lz:state
   data-lz:src="lz://localStorage/someuniqueid"
   data-lz:options="{state:{put:true,delete:true}}">
{
   name: "Johnathan",
   "^": { }
}
</template>
<div id="localstorage">localStorage: </div>
<div id="state">inDocument: </div>
<script>
document.addEventListener("lz:loaded",() => {
   const state = lazui.getState("someuniqueid");
   state.addEventListener("state:put",() => {
     const el = document.getElementById("localstorage");
     el.insertAdjacentText("beforeEnd",localStorage.getItem("someuniqueid")); // {"name":"John"}
     const el2 = document.getElementById("state");
     el2.insertAdjacentText("beforeEnd",JSON.stringify(lazui.getState("someuniqueid"))); // {"name":"John"}
     state.delete();
   });
   state.name = "John";
})
</script>
```

The prefix `lz://` on the src URL is a special `protocol` that tells `lazui` to handle the URL in a unique way. *Note*:
If you chage the `lazui` namespace, `lz://` will change to the new namespace, e.g. `mynamespace://`.

You can replace `lz://localStorage` with `lz://sessionStorage` to use `sessionStorage`.

You can replace `lz://localStorage/someuniqueid` with `https://somedataserver.com/somepath/someuniqueid` to use a remote server.

##### Advanced Routing

If you wish to use more sophisticated client side routing, you can use the `lz:options` attribute to specify
handlers that will be loaded. The value of the attribute is the path to a JavaScript file. See 
[Advanced Client Side Routing](#advanced-client-side-routing) for more information.

#### Enhanced Requests

`lz:src` can be used to specify a request object that will be used to load/process content,e.g.

```html
<div data-lz:src='{"url":"/path/to/element.html","method":"POST","body":"name=John","mode":"document"}'></div>
```

The `lz:mode` attribute can have the value `document` in addition to `cors` and `no-cors`. This tells the router
not to forward a request to a server if the resource does not exist locally in the form of a `<template>` element
with a `lz:url` attribute.

As a demonstration, this series tries to load a path that does not exist, i.e. the content is empty, then creates the 
content using `POST`, then loads it again. The delay on the second `GET` request is because it may take a moment 
for asynchronous updates of the page to occur.

```html
<template data-lz:url:post="/path/to/newelement.html"></template>
<div data-lz:src="/path/to/newelement.html"></div>
<div data-lz:src='{"url":"/path/to/newelement.html","method":"POST","body":"name=John","mode":"document"}'></div>
<div data-lz:src="/path/to/newelement.html" data-lz:trigger="load delay:1000"></div>
```

<template data-lz:url:post="/path/to/newelement.html" data-lz:mode="document"></template>
<div data-lz:src='{url:"/path/to/newelement.html",method:"GET",mode:"document"}'></div>
<div data-lz:src='{url:"/path/to/newelement.html",method:"POST",body:"name=John"}'></div>
<div data-lz:src='{url:"/path/to/newelement.html",method:"GET",mode:"document"}' data-lz:trigger="load delay:1000"></div>

The `GET`, `DELETE`, `PUT`, `PATCH`, `HEAD` methods are respected:

- `GET` (default) will get the content. If `mode` is not document, then any local copy will be treated like a cache
- `DELETE` will remove the element.
- `PUT` will replace the element's content with the body. A `Response` with a status code `200` with a response body of "Ok" will be returned.
- `PATCH` if the element exists, will patch the JSON in the element's `innerHTML` if it can be parsed as JSON and the body is JSON; otherwise the content is replaced.
   If the element also happens to be a state, i.e. has the `lz:state` attribute, then the state will be updated with the patched or new JSON.
   If the element does not exist forwards to the server.
- `POST` will create a new element on the client if it does not exist, otherwise it behaves like `PUT`.
- `HEAD` if the element exists, will get the `<head>` `innerHTML` if the element is a `template`; otherwise nothing. If the element does not
   exist, forwards to the server.

As you can see, the basic `lazui` router is content, not functionally, focused. If you need a functional focus, then you must
work with the router at the JavaScript level.

#### Handling Events

In some cases, a file should only be loaded when a particular event occurs, e.g. a `click`. This can be done by adding
the `data-lz:trigger` attribute to the element, e.g.

```html
<div data-lz:src="https://lazui.org/path/to/element.html" data-lz:trigger="click dispatch:load" data-lz:mode="open">Click Me</div>
``` 

Try clicking on the below:

<div data-lz:src="https://lazui.org/path/to/element.html" data-lz:trigger="click dispatch:load" data-lz:mode="open">Click Me</div>

Note, unlike `htmx` triggers, `lazui` triggers do not automatically load content, you must dispatch a `load`
event to get the load to occur.

Events can be separated by commas, e.g. `data-lz:trigger="click dispatch:load, mouseover dispatch:load once"`.

##### User Responsiveness

The event modifiers `debounce:<ms>` and `throttle:<ms>` can be used to control responsiveness to user interaction. The
below will effectively ignore clicks at less than 2 second increments.

<template data-lz:url:get="./thanks.html" data-lz:mode="document">Thanks for clicking!</template>
```!html
<div data-lz:src="./thanks.html"
   data-lz:trigger="click debounce:2000 dispatch:load"
   data-lz:target="nextSibling">
      Click Me
</div>
<div></div>
```

##### Loading Just Once

`once` can be used to process an event only the first time it occurs. `load once` is the same as having just a 
`data-lz:src` attribute and no `data-lz:trigger` attribute. However, `click once call:window.alert("clicked")` will only display the 
alert once.

##### Delaying and Repeating Loads

Processing of events and subsequent loading of the content can be delayed by adding `delay:<ms>` to the event, e.g.
`data-lz:trigger="click dispatch:load delay:1000"`.

A repeating load can be established with `every`, e.g. `data-lz:trigger="load every:1000"` will start updating
the content every second.

```!html
<template id="clock" data-lz:url:get="/clock" data-lz:mode="document">
    <p>
        The time is ${new Date().toLocaleTimeString()}
    </p>
</template>
<div data-lz:src="/clock"
   data-lz:trigger="click once delay:2000 dispatch:load placeholder:Loading clock ...,load every:1000">
      Click Me
</div>
```

##### Alternative Actions

Finally, `call:<scope>...<functionName>(...args)?` can be used to call a function in the specified scope when the event occurs instead
of or in addition to loading. For convenience, if parentheses are not provided, it is assumed the function should be called wih the
`event`, i.e. `call:window.console.log` is the same as `call:window.console.log(event)`.

The specified scope can be:

- `window` or `globalThis`, the window object
- `document`, the document object
- `controller`, the closest ancestor element that has a `data-lz:controller` attribute
- `src`, the closest ancestor element that has a `data-lz:src` attribute
- `closest`, the closest ancestor element that implements the function
- `state`, the state bound to the element or its ancestors
- `this`, the element on which the event occurred

Dotted access after the scope is permitted, e.g. `window.console.log`

An error will occur if the scope does not provide the dotted path or implement the `functionName`.


### Content Control

#### if

The `lz:if` directive can be used to conditionally remove content. If the ultimate value of the attribute is not truthy, the
element will be removed. If the original value is a boolean or number, it is used as is. If it is a string prefixed by a
period, it is used as a property of the closest state. If the original value is of the form `#<id>.<property>?`, it is
resolved using the state with the id. If the `property` portion is left off, then the state itself is used.

```!html
<div data-lz:if=".name" data-lz:usestate="person">Hello, ${name}!</div>
```

```!html
<div data-lz:if="${age < 21}">Hello, ${name}!</div>
```

does not render at all because `age >= 21`.

```!html
<div data-lz:if="${age >= 21}" data-lz:usestate="person">Welcome to the bar, ${name}!</div>
```


#### foreach

The `lz:foreach` directive can be used to repeat content. It takes the form `lz:foreach:what:itemAlias:indexAlias:arrayAlias`.
The `what` portion can be `value`, `key`, or `entry`. The `itemAlias` defaults to the value of `what`. 
The `indexAlias`, and `arrayAlias` default to `index`, and `array`.

The value of the attribute should be a JSON object or an `#<id>.<property>?` which is resolved to a state. If the
`property` portion is left off, then the state itself is used.

The `innerHTML` will be cloned for each element in the array resulting from a call to `Object.values`, `Object.keys`, or 
`Object.entries`, i.e. `Object[what](<resolvedAttributeValue>)`, and the array element will be used as the context for the
cloned element.

```!html
<div data-lz:foreach:value:name:i='["Peter","Paul","Mary"]'><template><p>${i+1}: Hello, ${name}!</p></template></div>
```

```!html
<div data-lz:foreach:entry='["Peter","Paul","Mary"]'><template><p>${parseInt(entry[0])+1}: Hello, ${entry[1]}!</p></template></div>
```

#### show

The `lz:show` directive can be used to conditionally show content. If works just like `lz:if`, but instead of removing
the content, it sets or removes the `hidden` attribute.


#### examplify 

If you have applied `lz:usedefault`, `lz:userouter` to your `lazui` script, are using a server based on the
`lazui` [basic server](#basic-server), or have custom integrated server using [examplify](https://github.com/anywhichway/examplify)
you can use three &grave; followed by !html to replicate the content of a code block into the source. 

This ensures that the example content is always in sync with the execution of the example.

<pre class="hljs">
&grave;&grave;&grave;!html
&lt;form&gt;
   &lt;input
      type="text"
      value="Hello, World!"&gt;
&lt;/form&gt;
&grave;&grave;&grave;
</pre>

```!html
<form>
   <input
      type="text" 
      value="Hello, World!">
</form>
```


### Dataset Management

#### dataset

The `lz:dataset` directive can be used to set `data-` attributes. The value of the attribute is a JSON object with the names of
the `data-` attributes as keys, e.g.

```!html
<div id="datasetexample" data-lz:dataset='{"mydata":"myvalue"}'></div>
```
<script>
(() => {
   const script = document.currentScript||currentScript;
   document.addEventListener("lz:loaded",function(event) {
      setTimeout(function() {
         const el = document.getElementById("datasetexample");
         script.insertAdjacentText("afterEnd",el.outerHTML.replaceAll(/&quot;/g,"'"));
      },1000);
   });
})();

</script>

Once resolved, the `lz:dataset` attribute is removed.

### Styling and Accessibility

#### ARIA

The `lz:aria` directive can be used to set ARIA attributes. The value of the attribute is a JSON object with the names of
the ARIA attributes as keys and the values as values, e.g.

```html
<div data-lz:aria='{"role":"button","aria-label":"Click Me"}'>Click Me</div>
```

Once resolved, the `lz:aria` attribute is removed.

#### Code Highlighting

The `lz:usehighlighter` directive is typically attached to the `<script>` that loads `lazui`. Currently, only [highlight.js](https://highlightjs.org/)
is supported.

```html
<script src='https://www.unpkg.com/@anywhichway/lazui@0.0.16-a'  autofocus
    data-lz:usehighlighter="https://esm.sh/highlight.js"
   data-lz:options="{usehighlighter:{style:'/styles/default.css'}}">
</script>
```

#### Style

The `lz:style` directive can be used to set `style` attributes. The value of the attribute is a JSON object with the names of
the `style` attributes as keys and the values as values. The keys can be in either camelCase or dashed format, e.g.

<div data-lz:style='{"color":"red","fontWeight":"bold"}' data-lz:showsource="beforeBegin">I am red and bold</div>

Once resolved, the `lz:style` attribute is removed.

## Pre-Built Controllers

Except for [State and Forms](#state-and-forms), the above sections have covered the use of pre-built attribute 
directives. If you need more attribute directives, see [Creating Custom Attribute Directives](#creating-custom-attribute-directives). This section covers 
the use of pre-built controllers.

Controller
: A JavaScript file that is loaded to provide additional sophisticated functionality to an element. For instance, [chart.js](#charts)
can be loaded by the attribute `lz:controller` to support rendering of charts and graphs with configuration data provided
by the element. Elements can only have one controller.

There are a number of pre-built controllers; however, you can also [create your own controllers](#creating-custom-controllers). You can use custom 
controllers, even with the CDN version of `lazui`.

Controllers are always loaded using the attribute directive `lz:controller=<location>`. The `location` can be relative to
the current document or an absolute URL including starting with a `/`, `http:` or `https:`.

Like attribute directives, controllers can accept configuration data through the attribute `lz:options`. Since there can
only be one controller per element, the key in the options object is `controller` not the name of the controller. This 
key should contain an object with the configuration data, which will be different for each controller.

### Charts

Currently supported chart types are those in the Google library, just some of which are:

- bar,
- column,
- donut,
- combo

You can see examples in the Google [chart gallery](https://developers.google.com/chart/interactive/docs/gallery). The core library is automatically loaded. You can add special 
packages with the `lz:options` attribute, e.g. `lz:options="{controller:{packages:['wordtree']}}"`.

The chart definitions always use a `type`, `options`, and `data` property in the state defining the chart.

```html
<template data-lz:state="pizza">
{
    type: 'PieChart',
    options:{
       title:'How Much Pizza I Ate Last Night',
       width:400,
       height:300
    },
    data: [
        ["Topping","Slices"],
        ["Mushrooms",3],
        ["Onions",1],
        ["Olives",1],
        ["Zucchini",1],
        ["Pepperoni",2]
    ]
}
</template>
<div data-lz:controller="/controllers/lz/chart.js" data-lz:usestate="pizza"></div>
```

<template data-lz:state="pizza">
{
    type: 'PieChart',
    options:{
        title:'How Much Pizza I Ate Last Night',
        width:400,
        height:300
    },
    data: [
        ["Topping","Slices"],
        ["Mushrooms",3],
        ["Onions",1],
        ["Olives",1],
        ["Zucchini",1],
        ["Pepperoni",2]
    ]
}
</template>
<div data-lz:controller="/controllers/lz/chart.js" data-lz:usestate="pizza"></div>

You can optionally provide a `type` to the controller options to override the chart type:

```html
<div data-lz:controller="/controllers/lz/chart.js" data-lz:options="{controller:{type:'BarChart'}}" data-lz:usestate="pizza"></div>
```

<div data-lz:controller="/controllers/lz/chart.js" data-lz:options="{controller:{type:'BarChart'}}" data-lz:usestate="pizza"></div>

You could also load the state from a remote source:

<template data-lz:url:get="./donuts.json" data-lz:header="{'content-type':'application/json'}" data-lz:mode="document">
{
    type: 'PieChart',
    options:{
         title:'How Many Donuts We Ate Today',
         width:400,
         height:300,
         pieHole: 0.4
    },
    data: [
        ["Type","Number"],
        ["Chocolate",3],
        ["Blueberry",1],
        ["Plain",5],
        ["Whole Wheat",1]
    ]
}
</template>

```!html
<template id="remotedonuts" data-lz:state data-lz:src="./donuts.json">
</template>
<div data-lz:controller="/controllers/lz/chart.js" data-lz:usestate="remotedonuts"></div>
```

### Pushed Content

Although content can be polled using `lz:trigger="load interval:<ms>"`, it is often more efficient to use pushed content.

Three types of pushed content are supported:

- PubSub
- Server Sent Events
- Web Sockets

#### PubSub

<div data-lz:controller="/controllers/lz/pubsub" data-lz:options="{controller:{src:'/docs/hello-pubsub.js'}}" data-lz:showsource="beforeBegin"></div>

Typically, you will want to subscribe to a channel. The `lz:config` attribute can be used to provide configuration
data to the controller. If the `channel` property in the configuration starts with a `#`, then it is treated as the target
element identifier for the message. Otherwise, you can just use `lz-target` to specify the target element for all content.

A template with a `{message}` block can also be provided to format the messages. The template can be at the scope of the
`pubsub` enabled element, or at the scope of a channel element.

For convenience, elements enhanced with a `pubsub` controller have `subscribe`and `unsubscribe`  methods added that can be called from
JavaScript and also respond to `subscribe` and `unsubscribe` events.

```!html
<div id="pubsub-example" data-lz:controller="/controllers/lz/pubsub" data-lz:options="{controller:{src:'/docs/hello-pubsub.js',channel:'#joe',target:'beforeEnd',subscribe:true}}">
  <template><div>${message}</div></template>
</div>
<div>Joe's Messages
<div id="joe"></div>
</div>
<script>
document.addEventListener("lz:loaded", () => {
  setTimeout(() => {
    const el = document.querySelector("#pubsub-example");
    el.unsubscribe();
    }, 10000);
})
</script>
```


The service should expose `subscribe` and `unsubscribe` methods that accept an element as an argument. In should publish
messages with the form `{channel:<channel name>,message:<message>}`, for example:

```javascript
let interval;
const subscribe = (element,channel="*") => {
    interval = setInterval(() => {
        element.dispatchEvent(new CustomEvent("message",{detail:{channel,message:`${channel.slice(1)} the datetime is: ` + new Date().toLocaleTimeString()}}));
    },10000);
};
const unsubscribe = (element,channel="*") => {
    if(interval) clearInterval(interval)
}
export {subscribe,unsubscribe}
````

#### Server Sent Events

<div data-lz:controller="/controllers/lz/sse.js" data-lz:options="{controller:{src:'/datetime'}}" data-lz:showsource="beforeBegin">Loading...</div>

If you want to log each server sent event separately you can use the `lz:target` attribute and provide a template with
a `message` block. If the `message` was parsable as `JSON`, nested properties will be accessible.

For convenience, elements with an `sse` controller have `subscribe`and `unsubscribe`  methods added that can be called from
JavaScript and also respond to `subscribe` and `unsubscribe` events.

```!html
<div id="sse-example" data-lz:controller="/controllers/lz/sse.js" data-lz:options="{controller:{src:'/datetime'}}" data-lz:target="beforeEnd">
  <template><div>${message}</div></template>
</div>
<script>
document.addEventListener("lz:loaded", () => {
  setTimeout(() => {
    const element = document.getElementById("sse-example");
    element.unsubscribe();
  }, 10000);
});
</script>
```


#### Web Sockets

For convenience, elements enhanced with `lz:ws` have `publish` and `subscribe` methods added that can be called from
JavaScript and also respond to `publish` and `subscribe` events.

*Note*: The directive will automatically detect and adjust for connecting with a secure protocol, i.e. `wss`, if the
page hosting it is served over `https`.

```!html
<div data-lz:controller="/controllers/lz/ws.js" data-lz:target="beforeEnd">
  <template><div>${(new Date()).toLocaleTimeString()}: ${message}</div></template>
  <div>Peter
    <div id="peter"></div>
  </div>
  <div>Paul
    <div id="paul"></div>
  </div>
</div>
```

<form id="form" action="">
<table>
  <tr><td style="text-align:right">To:</td><td><input id="to" placeholder="comma separated names" title="Comma separated recipients" /></td></tr>
  <tr><td style="text-align:right">Message:</td><td><input id="message" autocomplete="off" /></td></tr>
  <tr><td></td><td> <button type="submit">Send</button></td></tr>
</table>
</form>
<script>
document.addEventListener("DOMContentLoaded", () => {
 setTimeout(() => {
    const socket = new WebSocket(`ws${window.location.protocol==="https:" ? "s" : ""}://${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}`);
    const form = document.getElementById('form');
    const to = document.getElementById('to');
    const input = document.getElementById('message');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value) {
            to.value.toLowerCase().split(",").forEach((topic) => {
                socket.send(JSON.stringify({topic,message:input.value}));
            });
            input.value = '';
        }
    });
    socket.addEventListener('message', (event) => {
        //console.log(event)
    });
  },1000);
});
</script>

## Pre-Built Components

Components are loaded into `<template>` elements via the `lz:src` attribute with an HTML file as the value and a
`lz:tagname` attribute to specify the custom tag name to use.

### Document Table of Contents

```html
<template data-lz:src="lz://toc.html" data-lz:tagname="lz-toc"></template>
```

### GitHub Issue Reference

```html
<template data-lz:src="lz://git-issue-ref.html" data-lz:tagname="git-issue-ref"></template>
```

```html
<git-issue-ref data-lz:src=":account/:repository/:issue-number"></git-issue-ref>
```

For example:

```html
<git-issue-ref data-lz:src="anywhichway/lazui/1"></git-issue-ref>
```

## Start Up Options

If you want to simplify your JSON, you can call enable with an alternate JSON parser:

```javascript
import {enable} from "./lazy-elments.js";
import JSON5 from "https://esm.sh/json5";
const {getModel} = enable({JSONParser:JSON5});
```

```html
<template lz:model="mymodel">
{
    name: "John",
    age: 30
}
</template>
```

Models are bound to elements using `lz:usesemodel`. The value of the attribute is the name of the model. Whenever
properties in the model that are referenced in the interpolated source of an element change, the element will be
updated.

```html
<div data-lz:usesemodel="mymodel">
    <span>Hello, ${name}!</span>
    <span>You are ${age} years old.</span>
</div>
```

```javascript
const model = getModel("mymodel");
model.name = "Jane"; // the div will be updated
```

The model name can be followed by a space and the word `eager` to force updates regardless of what property changes.

```html
<div data-lz:usesemodel="mymodel eager">
    <span>Hello, ${name}!</span>
    <span>You are ${age} years old.</span>
</div>
```


## Using JavaScript

If you plan to write custom JavaScript, you will probably want to install `lazui` locally:

```bash
npm install lazui
```

This will install a local server you can run using:

```bash
npm run serve
```

Unless otherwise noted, all the JavaScript examples below assume that `lazui.js` has already been loaded. 

If you are using the local server the script will be:

```html
<script src="/lazui"></script>
```

Otherwise, [unpkg](https://unpkg.com/) can be used to load the script:

```html
<script src="https://www.unpkg.com/lazui"></script>
```

### html

Like that in [lighterHTML](https://github.com/WebReflection/lighterhtml) and [lit](https://lit.dev/), the `html` template 
literal processes a template string with a context to use for JavaScript execution and data substitution.

```javascript
const {html} = lazui;

const greeting = (person) => html`Hello, ${person.name}!`;

const interpolation = greeting({name:"John"});
```

The `interpolation` value above is an enhancement of an object capturing the arguments generated when JavaScript processes a tagged template.
Tagged template functions take a fairly standard form:

```javascript
const myfunction = (strings, ...values) => { return {strings,values} };

const person = {name:"John"};

const interplolation = myfunction`Hello, ${person.name}!`;

const {strings,values} = interpolation;

console.log(strings); // ["Hello, ","!"]
console.log(values); // ["John"]
```

See the [MDN documentation on tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) for more information.

The `lazui` implementation of `html` is a bit more sophisticated than the above, it returns an object with three additional functions:

```typescript
{
    strings: string[];
    values: any[];
    raw(): string;
    toDocumentFragment(): DocumentFragment;
    nodes(): NodeList;
}
```

However, you will do not need to call the functions directly unless you need specialized sanitation processing, instead use the following:

#### html.raw

Returns raw HTML and ensures that nested templates are processed correctly along the way. Also note, `toString()` is an alias for `raw()`.

This allows the expedient but potentially unsafe processing of templates to deliver HTML to a browser:

```javascript
const {html} = lazui;

const list = ['some', '<b>nasty</b>', 'list'];

const content = html` // or add a .raw before the backtick
 <ul>${list.map(text => html`
 <li>${text}</li>
 `)}
 </ul>`;
```

<script>
(() => {
   const script = document.currentScript;
   document.addEventListener("lz:loaded",() => {
      const {html} = lazui;
   
      const list = ['some', '<b>nasty</b>', 'list'];
   
      const content = html` // or add a .raw before the backtick
       <ul>${list.map(text => html`
       <li>${text}</li>
       `)}
       </ul>`; 
   
      script.insertAdjacentHTML("afterEnd",content);
   });
})();
</script>

#### html.documentFragment

Returns a `DocumentFragment` where the `strings` and `values` have been inserted at appropriate points. This
takes a little more computational effort, but is far safer than just `html` or `html.raw`. During this processing, 
any strings passed in will be inserted as text not HTML, `<template>` placement and boolean attributes are normalized, 
and functions assigned to event handlers, attributes starting with `on`, e.g. `onclick` are bound to the DOM nodes properly.

```javascript
const {html} = lazui;

const list = ['some', '<b>nasty</b>', 'list'];

const content = html.documentFragment`<ul>${list.map(text => html`<li>${text}</li>`)}</ul>`;
```

As you can see `<b>nasty</b>` is now text not HTML:

<script>
(() => {
   const script = document.currentScript;
   document.addEventListener("lz:loaded",() => {
       const {html} = lazui;

       const list = ['some', '<b>nasty</b>', 'list'];

       const content = html.documentFragment`
       <ul>${list.map(text => html`
       <li>${text}</li>
       `)}
       </ul>`;

    script.after(...content.childNodes);
   })
})()
</script>

`toDocumentFragment` is pretty safe as is, however; if you want more sanitation, you can call `toDocumentFragment` with a
sanitizer function. In Chrome you can enable the [Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API) by enabling 
the `Experimental Web Platform features` flag in `chrome://flags`. Then you pass in a bound `sanitize` function:

```javascript
const {html} = lazui;

const list = ['some', '<b>nasty</b>', 'list'];

const content = html`
  <ul>${list.map(text => html`
  <li>${text}</li>
  `)}
  </ul>`;

const sanitizer = new Sanitizer();
  
const fragment = content.toDocumentFragment(sanitizer.sanitize.bind(sanitizer));
```

**Note**: Technically `<style>` and `<template>` tags are not allowed outside a document `<head>` element. However, `lazui`
explicitly supports this, so `lazui` creates a fragment internally with both a `<head>` and `<body>`. The `sanitize` 
function is called with `<style>` and `<template>` elements in a `<head>` section, then they are moved and just the 
`<body>` child nodes are returned as the child nodes of the fragment.

#### html.nodes

`nodes` is just a convenience wrapper around `html.documentFragment`. It returns the child node list instead of the fragment.

```javascript
const {html} = lazui;

const list = ['some', '<b>nasty</b>', 'list'];

const content = html`
<ul>${list.map(text => html`
<li>${text}</li>
`)}
</ul>`;
```

Once again, `<b>nasty</b>` is now text not HTML:

<script>
(() => {
   const script = document.currentScript;
   document.addEventListener("lz:loaded",() => {
       const {html} = lazui;

       const list = ['some', '<b>nasty</b>', 'list'];

       const content = html`
       <ul>${list.map(text => html`
       <li>${text}</li>
       `)}
       </ul>`;

    script.after(...content.nodes());
   });
})()
</script>

#### Template Hooks

It is also possible to insert hooks into templates. Hooks run after the template has been processed and allow updating
of the node at the location of the hook.

```html
<script>
const myhook = (node) => {
         return new Date().toLocaleTimeString();
     },
     content = lazui.html`<div>Timestamp: <span>${{hook:myhook,interval:1000}}</span></div>`;
document.currentScript.after(...content.nodes());
</script>
```

<script>
(() => {
   const script = document.currentScript;
   document.addEventListener("lz:loaded",() => {
   const myhook = (node) => {
            return new Date().toLocaleTimeString();
        },
        content = lazui.html`<div>Timestamp: <span>${{hook:myhook,interval:1000}}</span></div>`;
   script.after(...content.nodes());
   })
});
</script>

The properties of a hook are:
- `hook` the function to call. It takes the node and the hook definition as an argument. It can modify the node and 
return `undefined` or return a value to render.
- `placeholder` the value to display until the hook is first called
- `delay` or `interval` the delay in milliseconds before the hook is called or the interval in milliseconds between calls
- `where` the location to target the return value if it is not undefined

### render

`render(node:Node,content:Interpolation|string|Node|NodeList|DocumentFragment|null,{where="inner",state:object})`

`render` is the multi-talented workhorse of `lazui`. It can be used to replace, update or augment the contents of a `Node` with
the content from a `string`, `Interpolation`, `Node`, or `DocumentFragment`. The content can contain string literals
that get resolved using the `state` object. If `content` is `null`, then it is assumed that the `node` contains
string literals which are resolved using the `state` object.

The `where` argument can be one of `inner`, `outer`, `beforeBegin`, `afterBegin`, `beforeEnd`, `afterEnd`, `firstChild`,
`lastChild`, `parent`, `top`, or `blank`. The default is `inner`.

When `where` is anything other than `inner`, the node operates as an anchor point from which to find a target location to
put the `content`. In most implementations of `render` by other libraries one might interpret `render` to mean:

*Insert the provided content into the DOM as a replacement for the inner contents of `node`.*

With `lazui` the interpretation is:

*Insert the provided content into the DOM at the location specified by `where` using `node` as a reference point or default
value for the content.*


#### Classic Use Of Render

The classic use of render takes an interpolation and replaces the inner contents of a node with the result of the interpolation.

```javascript
const {render,html} = lazui;
let count = 0;
const clicked = (event) => {
    count++;
    event.target.innerText = `Click count: ${count}`;
};
render(document.getElementById('classic-render'), html`<div onclick=${clicked}>Click count: ${count}</div>`);
```

<div id="classic-render"></div>
<script>
(() => {
   document.addEventListener("lz:loaded",() => {
      const {render,html} = lazui;
      let count = 0;
      const clicked = (event) => {
          count++;
          event.target.innerText = `Click count: ${count}`;
      };
      render(document.getElementById('classic-render'), html`<div onclick=${clicked}>Click count: ${count}</div>`);
   });
})();
</script>

#### With Strings

```javascript
```

#### With Nodes and NodeLists

```javascript
```

#### With DocumentFragments

```javascript
```


### Creating Custom Elements

Custom Elements are just templates with the directive `lz:tagname`.

```!html
<template data-lz:tagname="my-custom-element">
    <style>
        p {
            color: red;
            font-weight: bold;
        }
    </style>
    <p>
        I am a custom element!
    </p>
    <script>
      self.observedAttributes = ["title"];
      self.connected = function() {
          this.shadowRoot.querySelector("p").innerText = "I am a custom element!  I am connected!";
      };
      self.attributeChanged = function(name,oldValue,newValue) {
          this.shadowRoot.querySelector("p").innerText = `I am a custom element!  I am connected!  My title is ${newValue}`;
      };
    </script>
</template>
<my-custom-element id="custom-element" title=""></my-custom-element>
<script type="module">
document.addEventListener("lz:loaded",() => { // Note: if you are using a custom namespace you will need to replace "lz"
   document.getElementById("custom-element").setAttribute("title","My Title");
 });
</script>
```

You can provide an `lz:src` attribute and keep the contents in a separate file without the `<template>` wrapper.

The table of contents for this document is managed via a custom element in the file `/components/toc.html`.


### Creating Custom Attribute Directives


### Creating Custom Controllers

If you need to drop down into JavaScript, you can add a controller to an element. The controller will be loaded and
executed after the element content is loaded. A controller is simply a module that exports:

1) event handlers like `onclick`
2) functions that can be bound to event handlers declared in HTML, e.g. `onclick="this.greet"`
3) A `targets` object that maps the names of targets to CSS selectors. These will typically correspond to the value of
   an attribute like `lz:property` on an element, but they can actually match anything that `querySelector` can match.
   The keys of the `targets` object are used to create properties on the controlled HTML element that are bound to the matching elements.

```html
<div data-controller="hello.js">
    <input name="name" type="text">
    <button onclick="this.greet">Submit</button>
    <span lz:property="greeting"></span>
</div>
```

```javascript
const imports = {
    greeting: '[lz:property="greeting"]',
    name: 'input[name="name"]',
};

function greet() {
    this.greeting.textContent = `Hello, ${this.name.value}!`;
}

function onclick(event) {
    console.log(event)
}

export {
    imports,
    greet,
    onclick
}
```

Custom controllers can be added to forms to support validation. However, submission handling will still be done by
`lazy-elments` unless no submit button is provided or the controller implements its own fetch approach.

```html
<form lz:controller="hello.js">
    <input name="name" type="text">
    <button type="submit">Submit</button>
    <span data-property="greeting"></span>
</form>
```

It is even possible to add controllers to specific input elements within a form. In this case the CSS selectors in the `targets`
will be relative to parent of the input element.

```html
<form>
    <span><input name="name" type="text" lz:controller="./validate-name.js"><span id="#input-error"></span></span>
    <button>Submit</button>
    <span data-property="greeting"></span>
</form>
```

```javascript
const targets = {
    "nameError": "#name-error"
}
function onchange(){
    var name = this.value;
    if(name.length < 5){
        this.nameError.innerHTML = "Name must be at least 5 characters long";
    }else{
        this.nameError.innerHTML = "";
    }
}

export {
    onchange,
    targets
}
```

The above is somewhat blunt, but it demonstrates the ability to add controllers to specific elements within a form. See
the [MDN documentation on form validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation) for more information on how to do this properly.

### Advanced Client Side Routing

Most server routers let you add routes by using something like `app.get("/some/path",handler)`. With `lazui` you can
use `<template data-lz:url:get="/some/path" data-lz:options="{url:{handler:"myhandler.js"}}>` to add a JavaScript
handler for a route. The handler should export a function that takes a `Request` object. If the handler returns a
`Response` object, it will be sent to the client. Otherwise, the router will continue to its next option.

Assume the file `docs/helloworld.js` contains:

```javascript
const handlers = {
    get(request) {
        return new Response("Hello world!",{status:200,headers:{"Content-Type":"text/plain"}})
    }
}
export {handlers as default};
```

<div data-lz:showsource:inner="beforeBegin">
<template data-lz:url:get="/hello/world" data-lz:options="{url:{handlers:'./helloworld.js'}}" data-lz:mode="document">
test
</template>
<div data-lz:src="/hello/world"></div>
</div>

It is also possible to avoid going to a server by using a global variable to store the handlers.

<div data-lz:showsource:inner="beforeBegin">
<script>
var helloWorldHandlers = {
    get(request) {
        return new Response("Hello local world!",{status:200,headers:{"Content-Type":"text/plain"}})
    }
}
</script>
<template data-lz:url:get="/hello/localworld" data-lz:options="{url:{handlers:'helloWorldHandlers'}}" data-lz:mode="document">
test
</template>
<div data-lz:src="/hello/localworld"></div>
</div>

The declarative router does not support the wild card or `app.any(...)` method. However, you can add a route that
matches `any` behavior by implementing a handler that exports an object with all the possible handlers as properties, e.g.

```javascript
const handlers = {
    get: (request) => {
        return new Response("Hello, World!");
    },
    post: (request) => {
        return new Response("Hello, World!");
    },
    put: (request) => {
        return new Response("Hello, World!");
    },
    delete: (request) => {
        return new Response("Hello, World!");
    },
    patch: (request) => {
        return new Response("Hello, World!");
    },
    head: (request) => {
        return new Response("Hello, World!");
    },
    options: (request) => {
        return new Response("Hello, World!");
    }
};
````

### Advanced State

States support `addEventLister`, `remoteEventListener`, `dispatchEvent`, and `delete`.

When a state is created, it posts the event `state:created` with the `{detail:{state}}`.

When a state is loaded from a URL, it posts the event `state:loaded` with `{detail:{state,src}}`.

When a state changes, it posts the event `state:change` with `{detail:{state,property,value,oldValue,path,ancestors}}}`.

When a state is deleted, in posts the event `state:deleted` with `{detail:{state}}`.


### Advanced Configuration

The first place you may wish to use JavaScript is for the configuration of `lazui`. In a module script immediately after
the script that loads `lazui` you can do things like define which attribute directives, JSON parser and router to use.

#### Setting The Attribute Namespace

#### Loading Attribute Directives

#### Specifying A Router

#### Specifying A JSON Parser

### Creating A Custom Bundle

This section assumes you have read [Advanced Configuration](#advanced-configuration).

If you prefer a single http connection to get all or most of the `lazui` capability loaded when a web page loads,
creating a custom bundle is easy if you know how to use `webpack`.

Create a file that loads and configures `lazui` (`my-custom-lazui.js`):

```javascript
await import("/lazui.js"); // set's gloablThis.lazui as a side-effect
import json5 from "https://esm.sh/json5";
import {state} from "/directives/lz/state.js";
import {usestate} from "/directives/lz/usestate.js";
lazui.useJSON(json5);
lazui.useDirectives("lz",state,usestate);
export {lazui as myLazui}
```

Configure your bundle (`my-custom-lazui.config.cjs`):

```javascript
const path = require('path'),
        webpack = require('webpack'),
        TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: 'production',
  entry: './my-custom-lazui.js',
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'my-custom-lazui.js',
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1})
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        mangle: {
          reserved: ['state'], // <-- list directive names here
        },
      }
    })]
  }
}
```

The line `new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1})` is necessary because `lazui` already uses dynamic 
imports. If you don't include this line, `webpack` will create dynamic chunk files that will be loaded on demand. As
a result, other than minification, you will not see any benefit from bundling. In fact, it will make debugging obscure.

The line `reserved: ['state']` is necessary because in `my-custom-lazui.js` you are telling `lazui` to configure for use
of `state`. Webpack mangles the names of functions and variables to make them shorter. If you don't tell it to leave
`state` alone, it will rename it and `lazui` will not be able to find it. Alternatively, you can turn all function name
mangling off by setting `mangle: false` in the `terserOptions` object. However, this will increase the bundle size.

Build your bundle:

```bash
npx webpack build --config ./my-custom-lazui.config.cjs
```

Create a file that uses your bundle (`my-custom-lazui.html`):

```html
<html>
  <head>
      <meta charset="UTF-8">
      <title>Custom Lazui Bundle</title>
      <script src="./my-custom-lazui.js" autofocus></script>
  </head>
  <body>
  <div data-lz:state="{name:'John'}">
      Name: ${name}
  </div>
  </body>
</html>
```

And, <a href="./my-custom-lazui.html" target="_tab">access the file!</a>.

### Basic Server

A server supporting Markdown, web sockets and server side events, had to be written to support this documentation, so
it is included to serve as a foundation for your use.

- runs with the command `npm run serve`
- based on [itty-router](https://itty.dev/itty-router)
- will serve this documentation by default
- supports Markdown files with the `.md` extension.
- has a minimal number of files in the docs directory to support the documentation
- has a basic web sockets implementation
- has basic server sent events middleware


## Inspiration

`lazui` draws from many other UI toolkits:

### htmx

### lighterHTML and lit

[html](#html)
- [raw](#html.raw)
- [nodes](#html.nodes)

[render](#render)

[template hooks](#template-hooks)

### Turbo and Stimulus

### Riot

[Single file components](creating-custom-elements)

### Vue



## FAQs

My web page flickers with unresolved templates when first loaded. How can I avoid this?
: If you have a page with a lot of templates in HTML or custom elements, you may see a flicker as the page loads. This is
because the browser will render the page before `lazui` has a chance to process all the templates and custom elements.
You can avoid this by setting the attribute `hidden` in the `<html>` tag in your file using 
`document.documentElement.setAttribute("hidden")`. `lazui` will remove the `hidden` attribute when it is done processing.

Why isn't `lazui.js` a module? 
: Modules do not fully resolve until a page is fully loaded, which makes it harder
to intercept display of the page to prevent flicker on initial rendering. Providing `autofocus` to a standard script,
will cause `lazui` to start processing the page for template literals embedded in HTML and process many `lazui` directives as
soon as the `DOMContent` is loaded, but before it is displayed to the user. However, all `lazui` directives and controllers
are modules.

Why itty-router for the server?
: It is small, fast, platform agnostic (can run on Bun, Cloudflare, Node, etc.), and far easier to use than Express.

<div style="width:100%;text-align:center" data-lz:src="/docs/footer.html"></div>


