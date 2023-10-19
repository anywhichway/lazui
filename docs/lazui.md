<script src='/lazui.js' autofocus data-lz:usejson="/json5.js" data-lz:userouter="/hono/hono.js" data-lz:options="{importName:'Hono',isClass:true,allowRemote:true}"></script>
<title>lazui Documentation</title>
<a href="./index.md">lazui</a>
<template data-lz:src="/components/toc.html" data-lz:tagname="lz-toc"></template>
<lz-toc></lz-toc>

## Introduction



## Installation

```bash
npm install lazui
```

## Documentation Conventions

Although `lazui` can be used as a powerful Javascript rendering engine, it really shines at reducing the amount of
JavaScript required to create an interactive website or single page app. This shininess is provided through a set of
attribute directives and JavaScript controller files.

If you are a fan of `Turbo` or `htmx`, you probably want to write less JavaScript. Since writing HTML is easier than 
JavaScript, the documentation uses the `lazui` (lazy) approach and covers the use of directives and controllers before the
use of the `html` template literal and `render` functions. 

If you wish, you can jump to detailed comparisons with the more JavaScript focused [lighterHTML](./lighterHTML.md) or [Knockout]() or 
review the [html](#the-html-function) and [render](#the-render-function) sections of the documentation.

It is possible to completely modify the `lazui` namespace. Throughout the documentation, references
to attribute directives will take the form `lz:<directive>` and sample code will use the standards compliant form 
`data-lz:<directive>`, but they could just as well be `data-myapp:<directive>` or even `myapp:<directive>`.

In some cases, the documentation will use `TypeScript` notation to make APIs clear, however, `lazui` is not written in
`TypeScript`.

Most of the JSON in the document is in [JSON5](https://json5.org/) format. This make JSON easier to write and less error
prone. See [Configuring the JSON Parser](#configuring-the-json-parser) for more information. Unless you configure your
version of `lazui` to use JSON5, you will need to modify the JSON in the examples to be valid JSON.

## How To Be Lazui

Place one of these in the `<head>` of your HTML:

```html
<script src="./lazui.js">
```
or

```html
<script src="./lazui.js" autofocus>
```

Why isn't `lazui.js` a module? Modules do not fully resolve until a page is fully loaded, which makes it harder
to intercept display of the page to prevent flicker on initial rendering. Providing `autofocus` to a standard script, 
will cause `lazui` to start processing the page for template literals embedded in HTML and process `lazui` directives as
soon as the `DOMContent` is loaded, but before it is displayed to the user. However, all `lazui` directives and controllers
are modules.

Here is the first simple example:

```html
<html>
    <head><script src="./lazui.js" autofocus></head>
    <body>
        Hello, the date and time is ${new Date().toLocaleTimeString()}
    </body>
</html>
```

That's right! You can put template literals directly in your HTML. The above will render as:

<div>Hello, the date and time is ${new Date().toLocaleTimeString()}</div>

## Working With Markdown

You can even include template literals in your Markdown.

```markdown
Hello, the date and time is ${new Date().toLocaleTimeString()}
```

renders as:

<div data-lz:src="./working-with-markdown.md" data-lz:mode="open"></div>

Throughout the rest of the documentation, hints are provided on how to use `lazui` with Markdown.

## Leveraging Attribute Directives

Attribute directives take the form `<namespace>:<directive>=<value>`. The default `lazui` namespace is `lz`.

Attribute directives are each stored in their own JavaScript file using the name of the directive as the file name. 
By convention, the files are in a directory called `directives` with subdirectories for each namespace. 
Hence, `lazui` directive, `lz:src` should be in `/directives/lz/src.js`.

If this convention is followed, `lazui` will lazy load only those directives that are used. If you want to preload
directives or use a different naming/filesystem convention, you can [load the directives directly using JavaScript](use-directive).

### Configuring the JSON Parser

The directive `lz-usejson` can be used to configure the JSON parser for more flexibility. This can dramatically simplify 
using embedded JSON by eliminating the need for quotes around keys and allowing the use of single quotes for strings. In
short, you can be lazy about your JSON.

The attribute takes as its value a URL pointing to the parser. [JSON5](https://json5.org/) is a good choice.

<div data-lz:usejson="/json5.js" data-lz:showsource="beforeBegin"></div>

or

```html
<div data-lz:usejson="https://esm.sh/json5" data-lz:showsource="beforeBegin"></div>
```

### Using State

Being able to insert a date and time or do inline math may be useful, but you will probably want to include general data.

The `data-lz:state` attribute can be used to define a model. The value of the attribute is the name of the state/model. 
The state is defined as a JSON object inside a template element or loaded from a file:

<template data-lz:state="person" data-lz:showsource="beforeBegin">
{
    name: "John",
    age: 30
}
</template>

or
    
```html
<template data-lz:state="person" data-lz:src="./person.json">
</template>
```

Now you can do this:

<div data-lz:usestate="person" data-lz:showsource="beforeBegin">
    ${name} is ${age} years old.
</div>

You can also set a state as the default state for a document:

```html
<template data-lz:state:document="person">
{
    "name": "John",
    "age": 30
}
</template>
```

*Markdown Hint*: Setting state at the document level can be useful with Markdown. Below is the content of the file `using-state-with-markdown.md`,
followed by the `HTML` loading the file and the `IFrame` generated.

```html
<template data-lz:state:document="person">
{
    name: "Mary",
    age: 21
}
</template>
${name} is ${age} years old.
```
<div data-lz:src="./using-state-with-markdown.md" data-lz:mode="frame" data-lz:showsource="beforeBegin" title="Lazui: Markdown Example"></div>

### Reactive State

Modifying a state will cause any elements using the state to be updated.

<div data-lz:state="{clickCount:0}" data-lz:mode="open" onclick="this.state.clickCount++" data-lz:showsource="beforeBegin">
    Click Count:${clickCount}
</div>

### Inline State

You can also define state inline by providing JSON as the value of the `data-lz:state` attribute. An element id will be
generated automatically if the element does not have an id.

<div data-lz:showsource:inner="beforeBegin">
<div data-lz:state="{name:'John',age:30}">
${name} is ${age} years old.
</div>
</div>

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

### Loading Content

```html
<div data-lz:src="./path/to/somefile.html"></div>
``` 

By default, this will load the contents of `somefile.html` as the `innerHTML` of the `div`.

If the value starts with a `#` it is treated as an element id and the `innerHTML` of the element is used as the content.

<div data-lz:showsource:inner="beforeBegin">
<template id="myelement">
    Content stored in a template
</template>
<div data-lz:src="#myelement"></div>
</div>

*Markdown Hint*: Except for your main `.md` file, you do not have to add the `lazui.js` script to your `markdown` files, 
it will be added automatically for any content loaded using `lz-src`.

#### State and Loaded Content

If `lz:usestate` is used with `lz:src`, the state will be applied to the loaded content.

*Markdown Hint:* Super useful! No need to put HTML into your Markdown files:

The source of `markdowntemplate.md` is:

```markdown
${name} is ${age} years old.
```

<div data-lz:src="./markdowntemplate.md" data-lz:usestate="person" data-ls:showsource="beforeBegin"></div>

#### Single Page Components

If the attribute `data-lz:mode` has the value `open`, content will load into a `shadowDOM` without
the need for a custom element. Hence, the HTML can include `<style>` tags that will be isolated from
the rest of the page.

```html
<template id="element" data-lz:url="https://lazui.org/path/to/element.html">
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
```

<template id="element" data-lz:url="https://lazui.org/path/to/element.html">
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


In the example above you can see the attribute `data-lz:url`, this is covered later in [Treating Elements As Files](#treating-elements-as-files).

If the file has the same origin as the requesting document, scripts will be processed; otherwise, they will be
ignored. In the case above, they are ignored. However, if we mount a similar file locally, they
will be executed.

<div data-lz:showsource:inner="beforeBegin">
<template data-lz:url="/element.html">
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
</div>

**Note**: `data-lz:mode="closed"` is not supported.

If you are prepared to potentially write a lot JavaScript and what custom HTML tags, you can [create a custom element](creating-custom-elements) 
with its own tag.

#### Using Frames

The attribute `lz:mode` can also take the value `frame`. This will load the content into an `iframe` and unlike the
`open` mode, scripts will be executed regardless of origin, so long as a [content security policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) has not been applied.

<div data-lz:src="https://lazui.org/path/to/element.html" data-lz:mode="frame" data-lz:showsource="beforeBegin" title="My Frame"></div>

Note, if you are viewing the JavaScript console you may see a warning like this: 

```
An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing 
```

When lazui inserts content into an `iframe` it also sets the parent and global scope of the IFrame's content to
itself to prevent navigating out of the iframe.

#### Client Side Routing

If `lazui.js` is loaded with the query string `?router=<globalVariableForRouter>`, then a core router will be created
and used to load content first from elements with `lz:url` attributes and then from a server.

The directive and value `lz:controller="/controllers/lz/router.js"` will let you create a router without writing any Javascript.

```html
<template data-lz:controller="/controllers/lz/router.js">
{
    "router": "https://esm.sh/hono", // path to router code, must be ESM module file
    "import": "Hono", // name of import from module file
    "create": "new", // optional, provide only if creating router requires a call to "new"
    "options": {}, // options to pass to router
    "allowRemote": true // optional, default is false, allow spoofing of remote content
}
</template>
```

With a `lazui` router in place, elements with a `lz:url` attribute can be treated as files.
This is useful for creating true single page apps or for testing the client with stubbed out responses when a server is
not available.

<div data-lz:showsource:inner="beforeBegin">
<template data-lz:url="/path/to/somefile.html">
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
<div data-lz:src="/path/to/somefile.html" data-lz:mode="open"></div>
</div>

You can even simulate headers and status codes by adding `data-lz:header`, `data-lz:headers` and `data-lz:status`
attributes to the source elements.

<div data-lz:showsource:inner="beforeBegin">
<template data-lz:url="/404.html" data-lz:status="404">
Not Found
</template>
<div data-lz:src="/404.html"></div>
</div>

If the source element is a `template` you can include `head` and `body` sections. Any `meta http-equiv` content in 
the `head` section will be treated as a header and included in the router response. We mislead you before; although it
did not make a difference in the rendering, below is the actual template used for the [Single Page Components](#single-page-components)
example above.

```html
<template id="element" data-lz:url="https://lazui.org/path/to/element.html">
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

Alternatively, see [Creating A Router](#creating-a-router), which requires a few lines of JavaScript.

#### Enhanced Requests

`lz:src` can be used to specify a request object that will be used to load/process content,e.g.

```html
<div data-lz:src='{"url":"/path/to/element.html","method":"POST","body":"name=John","mode":"document"}'></div>
```

The request makes local use of a non-standard `mode` value of `document`. If mode is `document`, then the request will
not be forwarded to a server under any circumstances. If the `mode` is not `document`, then the local copy, if any, will
be treated like a cache entry and cache control headers will be respected. And, all requests other than `GET` will be
forwarded to the server (if any).

As a demonstration, this series tries to load a path that does not exist, then creates the path with content using `POST`,
then loads it again. The delay on the second `GET` request is because it may take a moment for asynchronous updates of the page
to occur.


<div data-lz:showsource:inner="beforeBegin">
<div data-lz:src="/path/to/newelement.html"></div>
<div data-lz:src='{"url":"/path/to/newelement.html","method":"POST","body":"name=John","mode":"document"}'></div>
<div data-lz:src="/path/to/newelement.html" data-lz:on="load delay:1000"></div>
</div>

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

As you can see, the basic `lazui` router is content focused not functionally focused. If you need a functional focus, then you must
work with the router at the JavaScript level.

#### Handling Events

In some cases, a file should only be loaded when a particular event occurs, e.g. a `click`. This can be done by adding
the `data-lz:on` attribute to the element, e.g.

```html
<div data-lz:src="https://lazui.org/path/to/element.html" data-lz:on="click dispatch:load" data-lz:mode="open">Click Me</div>
``` 

Try clicking on the below:

<div data-lz:src="https://lazui.org/path/to/element.html" data-lz:on="click dispatch:load" data-lz:mode="open">Click Me</div>

Note, unlike `htmx` triggers, `lazui` triggers do not automatically load content, you must dispatch a `load`
event to get the load to occur.

Events can be separated by commas, e.g. `data-lz:on="click dispatch:load, mouseover dispatch:load once"`.


#### User Responsiveness

The event modifiers `debounce:<ms>` and `throttle:<ms>` can be used to control responsiveness to user interaction. The
below will effectively ignore clicks at less than 2 second increments.

<div data-lz:src="/path/to/somefile.html" data-lz:on="click debounce:2000 dispatch:load" data-lz:showsource="beforeBegin" data-lz:mode="open">Click Me</div>

#### Loading Just Once

`once` can be used to process an event only the first time it occurs. `load once` is the same as having just a 
`data-lz:src` attribute and no `data-lz:on` attribute. However, `click once call:window.alert("clicked")` will only display the 
alert once.

#### Delaying and Repeating Loads

Processing of events and subsequent loading of the content can be delayed by adding `delay:<ms>` to the event, e.g.
`data-lz:on="click dispatch:load delay:1000"`.

A repeating load can be established with `every`, e.g. `data-lz:on="load every:1000"` will start updating
the content every second.

<div data-lz:showsource:inner="beforeBegin">
<template id="clock" data-lz:url="/clock">
    <p>
        The time is ${new Date().toLocaleTimeString()}
    </p>
</template>
<div data-lz:src="/clock" data-lz:on="click once delay:2000 dispatch:load placeholder:Loading clock ...,load every:1000">Click Me</div>
</div>

#### Alternative Actions

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

### Targets

Anything with a `src`, `action` (forms), or `data-lz:src`, attribute can have a `data-lz:target` attribute. The value
can be `_beforeBegin`, `_afterBegin`, `_beforeEnd`, `_afterEnd`, `_inner`, `_outer`, `_firstChild`, `_lastChild`, `_parent`, `_top`
`_blank` or a CSS selectable target.

The targets `_inner`, `_outer`, `_parent` and `_body` can also have a `.<css-selector>` suffix. This means you can update multiple
elements with a single anchor or form submission.

- `_outer.<css>` `_inner.<css>` and are effectively `this.querySelectorAll(<css>)`
- `_parent.<css>` is effectively `this.parentElement.querySelectorAll(<css>)`
- `_body.<css>` is effectively `document.querySelectorAll(<css>)`

If `data-lz:target` is missing on elements other than anchors and forms, it defaults to `inner`.

### Content Control

#### if

The `lz:if` directive can be used to conditionally remove content. If the ultimate value of the attribute is not truthy, the
element will be removed. If the original value is a boolean or number, it is used as is. If it is a string prefixed by a
period, it is used as a property of the closest state. If the original value is of the form `#<id>.<property>?`, it is
resolved using the state with the id. If the `property` portion is left off, then the state itself is used.


<div data-lz:if=".name" data-lz:usestate="person" data-lz:showsource="beforeBegin">Hello, ${name}!</div>

<div data-lz:if="${age < 21}"  data-lz:usestate="person" data-lz:showsource="beforeBegin">Hello, ${name}!</div>

does not render at all.

<div data-lz:if="${age >= 21}" data-lz:usestate="person" data-lz:showsource="beforeBegin">Welcome to the bar, ${name}!</div>


#### forEach

The `lz:foreach` directive can be used to repeat content. It takes the form `lz:foreach:what:itemAlias:indexAlias:arrayAlias`.
The `what` portion can be `value`, `key`, or `entry`. The `itemAlias` defaults to the value of `what`. 
The `indexAlias`, and `arrayAlias` default to `index`, and `array`.

The value of the attribute should be a JSON object or an `#<id>.<property>?` which is resolved to a state. If the
`property` portion is left off, then the state itself is used.

The `innerHTML` will be cloned for each element in the array resulting from a call to `Object.values`, `Object.keys`, or 
`Object.entries`, i.e. `Object[what](<resolvedAttributeValue>)`, and the array element will be used as the context for the
cloned element.

<div data-lz:foreach:value:name:i='["Peter","Paul","Mary"]' data-lz:showsource="beforeBegin"><template><p>${i+1}: Hello, ${name}!</p></template></div>

<div data-lz:foreach:entry='["Peter","Paul","Mary"]' data-lz:showsource="beforeBegin"><template><p>${parseInt(entry[0])+1}: Hello, ${entry[1]}!</p></template></div>

#### show

The `lz:show` directive can be used to conditionally show content. If works just like `lz:if`, but instead of removing
the content, it sets or removes the `hidden` attribute.


#### showsource

The `lz:showsource` directive can be used to show the source of any HTML element. It takes the form `lz:showsource:inner|outer?=<target>`.
The default is `outer`.

The target can be one of: `beforeBegin`, `afterEnd` or an element id prefixed with `#`, in which case the inner HTML is replaced.

The `lz:showsource` directive is used throughout this Markdown document to show the source of the examples and ensures that the example
content is always in sync with the execution of the example.

Here the source defaults to the `outer` HTML of the element:

```html
<div data-lz:showsource="beforeBegin">
<template id="myelement">
    Content stored in a template
</template>
</div>
```

<div data-lz:showsource="beforeBegin">
<template id="myelement">
    Content stored in a template
</template>
</div>

Here, the source is the `inner` HTML of the element:

```html
<div data-lz:showsource:inner="beforeBegin">
<template id="myelement">
    Content stored in a template
</template>
</div>
```

<div data-lz:showsource:inner="beforeBegin">
<template id="myelement">
    Content stored in a template
</template>
</div>

### Dataset Management

#### dataset

The `lz:dataset` directive can be used to set `data-` attributes. The value of the attribute is a JSON object with the names of
the `data-` attributes as keys and the values as values, e.g.

```html
<div data-lz:dataset='{"mydata":"myvalue"}'>Has Data</div>
```

### Styling and Accessibility

#### aria

The `lz:aria` directive can be used to set ARIA attributes. The value of the attribute is a JSON object with the names of
the ARIA attributes as keys and the values as values, e.g.

```html
<div data-lz:aria='{"role":"button","aria-label":"Click Me"}'>Click Me</div>
```

#### style

The `lz:style` directive can be used to set `style` attributes. The value of the attribute is a JSON object with the names of
the `style` attributes as keys and the values as values. The keys can be in either camelCase or dashed format, e.g.

<div data-lz:style='{"color":"red","fontWeight":"bold"}' data-lz:showsource="beforeBegin">I am red and bold</div>


## Pre-Built Controllers

The above sections have covered the use of pre-built attribute directives. You can define your own attribute directives
using JavaScript. See [Creating Custom Attribute Directives](#creating-custom-attribute-directives).

Controllers are small JavaScript files that manage the behavior of the element they are attached to. There are several
predefined controllers that can be used to enhance forms processing and interact with servers. However, you can also
[create your own controllers](#creating-custom-controllers).

### Charts

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

You can optionally provide a `type` query parameter to the controller to override the chart type:

```html
<div data-lz:controller="/controllers/lz/chart.js?type=BarChart" data-lz:usestate="pizza"></div>
```

<div data-lz:controller="/controllers/lz/chart.js?type=BarChart" data-lz:usestate="pizza"></div>

Currently supported chart types are those in the Google core library:

- bar,
- column,
- line,
- area,
- stepped area,
- bubble,
- pie,
- donut,
- combo,
- candlestick,
- histogram,
- scatter

You can see examples in the Google [chart gallery](https://developers.google.com/chart/interactive/docs/gallery).

**Note**: Some of the charts in the gallery are not supported core types.

### Form Processing

Form submissions are intercepted and processed by `lazui` if the attribute `lz:controller="/form.js"` has been applied
to the form. The form is submitted using `fetch` and the response is used to update the target(s) of the form.

### Pushed Content

Although content can be polled using `lz:on="load interval:<ms>"`, it is often more efficient to use pushed content.

Three types of pushed content are supported:

- PubSub
- Server Sent Events
- Web Sockets

#### PubSub

<div data-lz:controller="/controllers/lz/pubsub?/docs/hello-pubsub.js" data-lz:showsource="beforeBegin"></div>

Typically, you will want to subscribe to a channel. The `lz:config` attribute can be used to provide configuration
data to the controller. If the `channel` property in the configuration starts with a `#`, then it is treated as the target
element identifier for the message. Otherwise, you can just use `lz-target` to specify the target element for all content.

A template with a `message` block can also be provided to format the messages. The template can be at the scope of the
`pubsub` enabled element, or at the scope of a channel element.

For convenience, elements enhanced with a `pubsub` controller have `subscribe`and `unsubscribe`  methods added that can be called from
JavaScript and also respond to `subscribe` and `unsubscribe` events.

<div data-lz:showsource:inner="beforeBegin">
<div id="pubsub-example" data-lz:controller="/controllers/lz/pubsub?/docs/hello-pubsub.js" data-lz:options="{channel:'#joe',target:'beforeEnd'}">
  <template><div>${message}</div></template>
</div>
<div>Joe's Messages
<div id="joe"></div>
</div>
<script>
  setTimeout(() => {
    const el = document.querySelector("#pubsub-example");
    el.unsubscribe();
    }, 10000);
</script>
</div>


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

<div data-lz:controller="/controllers/lz/sse.js?/datetime" data-lz:showsource="beforeBegin">Loading...</div>

If you want to log each server sent event separately you can use the `lz:target` attribute and provide a template with
a `message` block. If the `message` was parsable as `JSON`, nested properties will be accessible.

For convenience, elements with an `sse` controller have `subscribe`and `unsubscribe`  methods added that can be called from
JavaScript and also respond to `subscribe` and `unsubscribe` events.

<div data-lz:showsource:inner="beforeBegin">
<div id="sse-example" data-lz:controller="/controllers/lz/sse.js?/datetime" data-lz:target="beforeEnd">
  <template><div>${message}</div></template>
</div>
<script>
  setTimeout(() => {
    const element = document.getElementById("sse-example");
    element.unsubscribe();
  }, 10000);
</script>
</div>


#### Web Sockets

For convenience, elements enhanced with `lz:ws` have `publish` and `subscribe` methods added that can be called from
JavaScript and also respond to `publish` and `subscribe` events.

<div data-lz:controller="/controllers/lz/ws.js?ws://localhost:3000" data-lz:showsource="beforeBegin" data-lz:target="beforeEnd">
  <template><div>${(new Date()).toLocaleTimeString()}: ${message}</div></template>
  <div>Peter
    <div id="peter"></div>
  </div>
  <div>Paul
    <div id="paul"></div>
  </div>
</div>

<ul id="messages"></ul>
<form id="form" action="">
<table>
  <tr><td style="text-align:right">To:</td><td><input id="to" placeholder="comma separated names" title="Comma separated recipients" /></td></tr>
  <tr><td style="text-align:right">Message:</td><td><input id="message" autocomplete="off" /></td></tr>
  <tr><td></td><td> <button type="submit">Send</button></td></tr>
</table>
</form>
<script src="/socket.io/socket.io.js"></script>
<script>
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const socket = io();
    const form = document.getElementById('form');
    const to = document.getElementById('to');
    const input = document.getElementById('message');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value) {
            to.value.toLowerCase().split(",").forEach((recipient) => {
                socket.emit(recipient, input.value);
            });
            input.value = '';
        }
    });
    socket.on('chat_message', (msg) => {
        const item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });
  },1000);
});
</script>

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

## Lazui Router

The `lazui` router is a simple router that can be used to load content from a server. It is easily enabled by loading `lazui.js`
with the query string `?router=<globalVariable>&allowRemote=true|false`. The router will then attempt to load content 
from elements with `lz:url` attributes and fall back to a server.

Advanced use of the router can be made at the JavaScript level. See [Specifying A Router](specifying-a-router).

## Using JavaScript

Unless otherwise noted, all the JavaScript examples below assume that `lazui.js` has already been loaded using:

```html
<script src="./lazui.js"></script>
```

### html

Like that in [lighterHTML](https://github.com/WebReflection/lighterhtml) and [lit](https://lit.dev/), the `html` template 
literal processes a template string with a context to use for JavaScript execution and data substitution.

```javascript
const {html} = lazui;

const greeting = (person) => html`Hello, ${person.name}!`;

const interpolation = greeting({name:"John"});
```

The `interpolation` value above is an enhancement of an object capturing the arguments generated what JavaScript processes a tagged template,
e.g. `const html = (strings, ...values) => { return {strings,values} }` returns an object of the form `{strings:string[],values:any[]}`. See the 
[MDN documentation on tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) 
for more information.

The `lazui` implementation of `html` is a bit more sophisticated than the above, it returns an object with three additional properties:

```typescript
{
    strings: string[];
    values: any[];
    raw(): string;
    toDocument(): DocumentFragment;
    nodes(): NodeList;
}
```

#### raw()

`raw(): string`

Returns raw HTML and ensures that nested templates are processed correctly along the way. Also note, `toString()` is an alias for `raw()`.

This allows the expedient but potentially unsafe processing of templates to deliver HTML to a browser:

<script data-lz:showsource:inner="beforeBegin">
(() => {
  const {html} = lazui;
  
  const list = ['some', '<b>nasty</b>', 'list'];
  
  const content = html`
    <ul>${list.map(text => html`
    <li>${text}</li>
    `)}
    </ul>`; // or add a .raw() after the closing backtick
    
  document.currentScript.insertAdjacentHTML("afterEnd",content);
})()
</script>

#### toDocumentFragment()

`toDocumentFragment(sanitize?:(fragment:DocumentFragment)=>DocumentFragment):DocumentFragment`

Returns a `DocumentFragment` where the `strings` and `values` have been inserted at appropriate points. This
takes a little more computational effort, but is far safer. During this processing, any strings passed in
will be inserted as text not HTML, `<template>` placement and boolean attributes are normalized, and functions
assigned to event handlers, attributes starting with `on`, e.g. `onclick` are bound to the DOM nodes properly.

<script data-lz:showsource:inner="beforeBegin">
(() => {
  const {html} = lazui;
  
  const list = ['some', '<b>nasty</b>', 'list'];
  
  const content = html`
    <ul>${list.map(text => html`
    <li>${text}</li>
    `)}
    </ul>`;
  
  const fragment = content.toDocumentFragment();
  document.currentScript.after(...fragment.childNodes);
})()

</script>

`toDocumentFragment` is pretty safe as is, however; it also takes an optional argument `sanitize` that can be used to 
sanitize the HTML. If provided, the `sanitize` function should accept a `DocumentFragment` and return a `DocumentFragment`.
node.

In Chrome you can enable the [Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/Sanitize) by enabling 
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
document.currentScript.after(...fragment.childNodes);
```

**Note**: Technically `<style>` and `<template>` tags are not allowed outside a document `<head>` element. However, `lazui`
explicitly supports this, so `lazui` creates a fragment internally with both a `<head>` and `<body>`. The `sanitize` 
function is called with `<style>` and `<template>` elements in a `<head>` section, then they are moved and just the 
`<body>` child nodes are returned as the child nodes of the fragment.

#### nodes()

`nodes(sanitize?:(fragment:DocumentFragment)=>DocumentFragment):NodeList`

`nodes` is just a convenience wrapper around `toDocumentFragment`.

<script data-lz:showsource:inner="beforeBegin">
(() => {
  const {html} = lazui;
  
  const list = ['some', '<b>nasty</b>', 'list'];
  
  const content = html`
    <ul>${list.map(text => html`
    <li>${text}</li>
    `)}
    </ul>`;
  
  document.currentScript.after(...content.nodes());
})()
</script>

### render()

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

<div data-lz:showsource:inner="beforeBegin">
<div id="classic-render"></div>
<script>
const {render,html} = lazui;
let count = 0;
const clicked = (event) => {
    count++;
    event.target.innerText = `Click count: ${count}`;
};
render(document.getElementById('classic-render'), html`<div onclick=${clicked}>Click count: ${count}</div>`);
</script>
</div>

#### Using Render With Strings

```javascript
```

#### Using Render With Nodes and NodeLists

```javascript
```

#### Using Render With DocumentFragments

```javascript
```


### Creating Custom Elements

Custom Elements are just templates with the directive `lz:tagname`.

<div data-lz:showsource:inner="beforeBegin">
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
    setTimeout(() => {
      document.getElementById("custom-element").setAttribute("title","My Title");
    },1000);
</script>
</div>

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
const targets = {
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
    targets,
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

### Configuring Lazui

The first place you may wish to use JavaScript is for the configuration of `alzui`. In a module script immediately after
the script that loads `lazui` you can do things like define which attribute directives, JSON parser and router to use.

### Setting The Attribute Namespace

#### Loading Attribute Directives

#### Specifying A Router

#### Specifying A JSON Parser

### Creating A Custom Bundle

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

- serves files from the `docs` directory,
supports Markdown files with the `.md` extension.

## Change History (Reverse Chronological Order)

2023-10-23 v0.0.1-a Initial Release.


