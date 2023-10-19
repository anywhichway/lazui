# ligthterHTML and lazui

<script src="/lazui.js"></script>

`lazui` supports most of the same features as `lighterHTML` but with a slightly different syntax or directive names.
This includes:

1) `html` template literal tag
2)`html.node` template literal tag as `.nodes()`
3) `html.render` function
4) `aria` attribute directive as `lz:aria`
5) `.dataset` attribute directive as `lz:dataset`
6) `.<dataitem>` attribute directive as `lz:dataset:<dataitem>`
7) Injection of handlers for event attributes, e.g. `onclick`, `onchange`, etc.
8) Simple components
9) Custom elements

There are also many other `lazui` features that do not have direct `lighterHTML` equivalents. These include:

1) `lz:style` attribute directive that works similar to `.dataset` except it sets `style` properties
2) `raw()` method on `html` template literal tag that returns the unescaped string, i.e. dynamic HTML from state values
3) The opportunity to  deliver state directly to `render` and set `where` to render content, including a new ShadowDOM.
4) Polymorphic `render` that can examine the target element for HTML content containing string templates and render them 
using the current state as context.
5) An explicit hook object, `{hook:function,timeout?:ms,interval?:ms,placeholder?:string,where?:string}` that can be used 
to delay or repeat rendering of content by optionally replacing the content with a placeholder, then calling the hook 
function and placing the result at the `where` location. The `timeout` and `interval` properties are mutually exclusive. 
See the detailed `hook` documentation for more information.
6) A variety of attribute directives more similar to `Vue` than `lighterHTML` including `lz:if`, `lz:for`.
7) Additional attribute directives more similar to `htmx` than `lighterHTML` including `lz:src`, `lz:href`, `lz:trigger`.
8) Data binding to `input` and `select` elements similar to `KnockoutJS`.

## Enabling `lazui`

Place these script tags in the head of your HTML:

```html
<script src="./lazui.js">
<script>
    {html,render} = lazui;
</script>
```

## html and html.node

This `lighterHTML` example:

```javascript
const list = ['some', '<b>nasty</b>', 'list'];
document.currentScript.after(html.node
<ul>${list.map(text => html.node
    <li>${text}</li>
    )}
</ul>
);
```
    
would look like this in `lazui`:
    
```javascript
const list = ['some', '<b>nasty</b>', 'list'];
document.currentScript.after(...html`
<ul>${list.map(text => html`
    <li>${text}</li>
    `)}
</ul>
`.nodes());
```
    
and render this:

<ul>${['some', '&lt;b>nasty&lt;/b>', 'list'].map(text => lazui.html`<li>${text}</li>`)}</ul>

<script>
var {html,render} = lazui,
    list = ['some', '<b>nasty</b>', 'list'];
document.currentScript.after(...html`
<ul>${list.map(text => html`
    <li>${text}</li>
    `)}
</ul>`.nodes());
</script>


Note, with `lazui`, only the outermost call to `.nodes()` is required. It follows the template literal call and returns 
the nodes created by the template literal. Since there is no telling what type of HTML is generated and modern browsers
all support the multi-argument functions `before`,`append`,`after`, and  `replace`, `lazui` always returns an array of 
DOM nodes. 

## html.raw

Also, for safety, substitution values cannot themselves contain HTML, they are escaped to reduce the chance of XSS attacks. 
If you want to include dynamic HTML generated from state, you can use `html.raw()` on the interpolated value:

```javascript
const {html} = lazui,
    list = ['some', '<b>nasty</b>', 'list'];
document.currentScript.insertAdjacentHTML("beforeEnd",html`
<ul>${list.map(text => html`
    <li>${text}</li>
    `)}
</ul>`.raw());
```

<script>
var list = ['some', '<b>nasty</b>', 'list'];
document.currentScript.insertAdjacentHTML("afterEnd",html`
<ul>${list.map(text => html`
    <li>${text}</li>
    `)}
</ul>`.raw());
</script>

## aria, dataset, and style attribute directives

`lighterHTML` code:

```javascript
```

## event handling attribute processing and render

`lighterHTML` code:

```javascript
let count = 0;
const clicked = (event) => {
    count++;
    event.target.innerText = `Click count: ${count}`;
}
render(document.body, html.node`<div onclick=${clicked}>Click count: ${count}`)
```

`lazui` code:

```javascript
let count = 0;
const clicked = (event) => {
    count++;
    event.target.innerText = `Click count: ${count}`;
}
render(document.body, html`<div onclick=${clicked}>Click count: ${count}`.nodes())
```

Try clicking on the below:

<script>
let count = 0;
const clicked = (event) => {
    count++;
    event.target.innerText = `Click count: ${count}`;
};
render(document.currentScript, html`<div onclick=${clicked}>Click count: ${count}</div>`.nodes(),{where:"afterEnd"});
</script>

## simple components and render

`lighterHTML` code:

```javascript

```javascript
const Comp = name => html`<p>Hello ${name}!</p>`,
    users = ['Arianna', 'Luca', 'Isa'];
render(document.body, html`${users.map(Comp)}`);
```

`lazui` code:

```javascript
const Comp = name => html`<p>Hello ${name}!</p>`,
    users = ['Arianna', 'Luca', 'Isa'];
render(document.currentScript, html`${users.map(Comp)}`,{where:"afterEnd"});
```

And, how it renders:

<script>
const Comp = name => html`<p>Hello ${name}!</p>`,
    users = ['Arianna', 'Luca', 'Isa'];
render(document.currentScript, html`${users.map(Comp)}`,{where:"afterEnd"});
</script>

See the core documentation on `render` for additional information.