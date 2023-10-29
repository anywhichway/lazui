async function tagname({el,attribute,root,state,lazui}) {
    if(customElements.get(attribute.value)) return;
    const {prefix} = lazui,
        className = attribute.value.split("-").map((word,index) => word[0].toUpperCase()+word.slice(1)).join(""),
        mode = el.getAttribute(`${prefix}:mode`) || "open",
        div = document.createElement("div"),
        callbacks = {
            connected: null,
            attributeChanged: null,
            disconnected: null,
            adopted: null
        };
    let initialized,
        observedAttributes = [],
        shadow;
    if(el.hasAttribute(`${prefix}:src`)) {
        div.innerHTML = await fetch(new Request(el.getAttribute(`${prefix}:src`))).then((response) => response.text());
    } else {
        div.innerHTML = el.innerHTML;
    }
    class CustomElement extends HTMLElement {
        constructor() {
            super();
            shadow = this.attachShadow({mode});
            shadow.append(...div.cloneNode(true).childNodes);
        }

        connectedCallback() {
            if(!initialized) {
                for(const script of shadow.querySelectorAll("script")) {
                    const clone = document.createElement("script");
                    clone.innerHTML = script.innerHTML; // can't use cloneNode because it will not execute when added
                    script.remove();
                    window.self = this;
                    window.currentScript = script;
                    shadow.append(clone);
                    script.remove();
                    clone.remove();
                    window.self = window;
                    delete window.currentScript;
                }
                if(this.observedAttributes) {
                    observedAttributes = [...this.observedAttributes];
                }
                Object.entries(callbacks).forEach(([key,value]) => {
                    if(this[key]) callbacks[key] = this[key];
                })
            }
            initialized = true;
            if(callbacks.connected) callbacks.connected.call(this);
        }

        disconnectedCallback() {
            if(callbacks.disconnected) callbacks.disconnected.call(this);
        }

        adoptedCallback() {
            if(callbacks.adopted) callbacks.adopted.call(this);
        }
        attributeChangedCallback(name,oldValue,newValue) {
            if(callbacks.attributeChanged) callbacks.attributeChanged.call(this,name,oldValue,newValue);
        }
        static get observedAttributes() {
            return observedAttributes;
        }
        setAttribute(name,value) { // needed because observed Attributes no defined when class is registered
            const oldValue = this.getAttribute(name);
            super.setAttribute(name,value);
            if(oldValue!==value && observedAttributes.includes(name)) this.attributeChangedCallback(name,oldValue,value);
        }
    }
    customElements.define(attribute.value,window[className] = CustomElement);
}

export {tagname};