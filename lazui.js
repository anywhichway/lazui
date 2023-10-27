(() => {
    "use strict"
    let __OPTIONS__ = {};
    if(document?.currentScript && !window.lazuiLoaded) {
        window.lazuiLoaded = true;
        const url = new URL(document.currentScript.src),
            autofocus = document.currentScript.hasAttribute("autofocus"),
            docEl = document.documentElement;
        if(document.location.pathname.endsWith(".md")) docEl.setAttribute("hidden","");
        document.addEventListener("DOMContentLoaded",async () => {
            lazui.url = new URL(url.href);
            lazui.url.hash = "";
            lazui.url.search = "";
            directiveExports.url = lazui.url;
            const usejson = document.querySelector(`[${directiveExports.prefix}\\:usejson]`);
            if(usejson) await handleDirective(usejson.attributes[`${directiveExports.prefix}:usejson`]);
            const userouter = document.querySelector(`[${directiveExports.prefix}\\:userouter]`),
                routerVariable = url.searchParams.get("router"),
                allowRemote = url.searchParams.get("allowRemote");
            if(userouter) {
                const attribute = userouter.attributes[`${directiveExports.prefix}:userouter`];
                if(routerVariable && document[routerVariable]) console.warn(`Global router with name '${routerVariable}' being overruled by 'userouter=\"${attribute.value}\"'`);
                await handleDirective(attribute);
            } else {
                const router = routerVariable && document[routerVariable] ? document[routerVariable]() : null;
                if(router) lazui.useRouter(router,{allowRemote});
            }
            const usehighlighter = document.querySelector(`[${directiveExports.prefix}\\:usehighlighter]`);
            if(usehighlighter) await handleDirective(usejson.attributes[`${directiveExports.prefix}:usehighlighter`]);
            for(const state of [...document.querySelectorAll(`[${directiveExports.prefix}\\:state],[${directiveExports.prefix}\\:state\\:global],[${directiveExports.prefix}\\:state\\:document]`)]) {
                for(const attr of [...state.attributes]) {
                    if(attr.name.startsWith(`${directiveExports.prefix}:state`)) await handleDirective(attr)
                }
            }
            for(const customElement of [...document.querySelectorAll(`[${directiveExports.prefix}\\:tagname]`)]) {
                await handleDirective(customElement.attributes[`${directiveExports.prefix}:tagname`]);
            }
            if(autofocus) await resolve(document.body,{root:document,state:{}})
            docEl.removeAttribute("hidden");
            if(typeof resizeFrame !== "undefined") setTimeout(() => resizeFrame(document));
            const namespace = directiveExports.prefix.split("-").pop();
            document.dispatchEvent(new CustomEvent(`${namespace}:loaded`));
        })
    }

    const useDirectives = (namespace, ...directives) => {
        const space = __DIRECTIVES__[namespace] ||= {};
        directives.forEach((directive) => {
            if (typeof directive === "function") {
                const name = directive.name;
                if (name) space[name] = directive;
            } else if (typeof directive === "object") {
                Object.assign(space, directive);
            }
        })
    }

    const usePrefix = (prefix) => directiveExports.prefix = prefix;

    const isBoolAttribute = (name) => name.startsWith("?") || ["checked", "selected", "disabled", "readonly", "multiple", "ismap", "defer", "noresize", "nowrap", "noshade", "compact", "async", "autofocus", "autoplay", "controls", "default", "formnovalidate", "hidden", "ismap", "loop", "muted", "novalidate", "open", "reversed", "scoped", "seamless", "truespeed", "typemustmatch"].includes(name),
        isObject = (value) => value && typeof value === "object",
        isHook = (value) => isObject(value) && typeof value.hook ==="function",
        isInterpolation = (value) => {
            if (isObject(value) && Array.isArray(value.strings) && Array.isArray(value.values) && typeof value.raw === "function") return true;
        },
        isHTMLScope = (value) => isObject(value) && isObject(value.state) && isObject(value.root);

    const getTop = (node) => {
        while(node.parentElement) node = node.parentElement;
        return node===document.documentElement ? document : node;
    }

    const __STATES__ = new WeakMap();
    let __OBSERVED_ELEMENT__;
    const observeNodes = (observation,cb=()=>{}) => {
        if(!Array.isArray(observation.observe)) observation.observe = observation.observe ? observation.observe.split(",") : [];
        let previous = __OBSERVED_ELEMENT__;
        __OBSERVED_ELEMENT__ = observation; //{el,observe,root};
        cb()
        __OBSERVED_ELEMENT__ = previous;
    }

    const activate = (object,el,path=[],ancestors=[]) => {
        if(!isObject(object)) throw new TypeError(`${typeof(object)}: ${object} can't be activated. It is not an object`);
        if(object.__isActivated__) return object;
        const subscribers = new Map(),
            proxy =  new Proxy(object,{
                deleteProperty(target,property) {
                    if(property in target) {
                        const oldValue = target[property];
                        if(el) {
                            let event;
                            el.dispatchEvent(event = new CustomEvent("delete", {bubbles: true, detail: {property, oldValue,path,ancestors}}));
                            if(event.defaultPrevented) return true;
                        }
                        delete target[property];
                        proxy[property] = undefined; // forces re-render
                    }
                },
                set(target,property,value) {
                    const oldValue = target[property],
                        wasIn = property in target;
                    if(oldValue!==value) {
                        if(oldValue!==undefined && value!==undefined) target[property] = value;
                        if(el && value!==undefined) {
                            let event;
                            if(wasIn) el.dispatchEvent(event = new CustomEvent("change", {bubbles: true, detail: {state:proxy,property, value,oldValue,path,ancestors}}));
                            else el.dispatchEvent(event = new CustomEvent("set", {bubbles: true, detail: {state:proxy,property, value,path,ancestors}}));
                            if(event.defaultPrevented) {
                                if(oldValue===undefined) delete target[property];
                                else target[property] = oldValue;
                                return true;
                            }
                        }
                        const subscriberSet = new Set([...(subscribers.get(property)||[]),...(subscribers.get("__all__")||[])]);
                        for(const observation of subscriberSet) {
                            const {nodes,observe,root,string,recurse,state} = observation;
                            // should we filter for connected nodes and drop others?
                            if(nodes.length===0 || !root.isConnected) {
                                subscriberSet.delete(observation);
                            } else if(nodes.length===1 && nodes[0].nodeType===Node.ATTRIBUTE_NODE) {
                                observeNodes(observation,() => nodes[0].value = interpolate(string,state||proxy,root).toString());
                            }
                            else {
                                observeNodes(observation,() => {
                                    const content = interpolate(string, state||proxy, root).toDocumentFragment();
                                    observation.nodes = [...content.childNodes];
                                    nodes[0].replaceWith(...content.childNodes);
                                    for (const node of nodes) node.remove();
                                    if(recurse>0) {
                                        for(const child of content.childNodes) {
                                            if(child.nodeType!==Node.TEXT_NODE) {
                                                render(child,null,{root,state:state||proxy,recurse:recurse-1})
                                            }
                                        }
                                    }
                                })
                            }
                        }
                        if(el.resizeFrame) el.resizeFrame();
                    }
                    return true;
                },
                get(target,property) {
                    let value = target[property];
                    if(property==="observeNodes") return observeNodes;
                    if(property==="addEventListener") {
                        if(!el || !el.isConnected) throw new Error("addEventListener not available. State not bound to a connected element");
                        return el.addEventListener.bind(el);
                    }
                    if(property==="removeEventListener") {
                        if(!el || !el.isConnected) throw new Error("removeEventListener not available. State not bound to a connected element");
                        return el.removeEventListener.bind(el);
                    }
                    if(property==="__isActivated__") return true;
                    if(typeof property=== "symbol") return value;
                    if(isObject(value)) value = target[property] = activate(value,el,[...path,property],[...ancestors,proxy]);
                    if(__OBSERVED_ELEMENT__) {
                        const observation = __OBSERVED_ELEMENT__,
                            observe = observation.observe || [];
                        if(observe.includes(property) || observe.includes("*")) {
                            let subscriberSet = subscribers.get(property);
                            if(!subscriberSet) subscribers.set(property,subscriberSet=[]);
                            subscriberSet.push(observation)
                        }
                    }
                    return value
                }
            });
        return proxy;
    }
    const getState = (idOrEl, {root = document,options={},throws}={}) => {
        let {storage,stringify} = options;
        if (!isObject(idOrEl) || !(idOrEl instanceof HTMLElement)) idOrEl = getTop(root).getElementById(idOrEl);
        const _state = __STATES__.get(idOrEl);
        if(storage||=_state?.storage) {
            let state = globalThis[storage||_state?.storage].getItem(idOrEl.id);
            if(state) {
                state = activate((stringify||=_state.stringify) ? JSON.parse(state) : state,idOrEl);
                __STATES__.set(idOrEl, {state,storage,stringify});
                state.addEventListener("change",({detail}) => {
                    globalThis[storage||_state.storage].setItem(idOrEl.id,stringify ? JSON.stringify(detail.state) : detail.state);
                })
                return state;
            }
        }
        if(!_state && throws) throw new Error(`Can't find state: ${idOrEl.id}`);
        return _state?.state;
    }
    const setState = (idOrEl,state, {root = document,options={}}) => {
        let {storage,stringify} = options;
        let el = idOrEl;
        if(typeof idOrEl === "string") {
            el = getTop(root).getElementById(el);
            if(!el) {
                el = document.createElement("template");
                el.setAttribute("id",idOrEl);
                if(root===document) root.head.append(el);
                else root.append(el);
            }
        }
        if(!storage) {
            const _state = (getState(el)||{});
            storage = _state.storage;
            stringify = _state.stringify;
        }
        if(storage) globalThis[storage].setItem(el.id,stringify ? JSON.stringify(state) : state);
        //if (!isObject(el) || el.constructor.name!=="HTMLTemplateElement") throw new TypeError(`${idOrEl} is not a valid HTMLTemplateElement or element id`);
        state = activate(state,el);
        __STATES__.set(el, {state,storage,stringify});
        el.state = state;
        return state;
    }

    const getStates = (node,states=[],attrName = `${directiveExports.prefix}:usestate`) => {
        if(node===null) {
            if(document.documentState) states.push(document.documentState);
            if(window.globalState) states.push(window.globalState);
            return states;
        }
        if(node.nodeType===Node.ELEMENT_NODE && node.hasAttribute(attrName)) {
            const state = getState(node.getAttribute(attrName))
            if(state) states.push(state);
            else console.log(`Can't find state: ${node.getAttribute(attrName)} in ${node.outerHTML}`);
        } else if(node.state) {
            states.push(node.state);
        }
        //if(states.includes(undefined)) debugger;
        getStates(node.parentNode,states,attrName);
        return states;
    }

    const statesProxy = (states) => {
        states = [...states];
        const proxy = new Proxy({},{
            get(target,property) {
                if(property==="set") {
                    return (property,value,local) => {
                        if(!local) {
                            const parts = property.split(".");
                            let state = states.find((state) => parts[0] in state);
                            if(state) {
                                while(parts.length>0) {
                                    const key = parts.shift();
                                    if(parts.length===0) state[key] = value;
                                    else if(state[property]!=null || typeof state[property]!=="object") throw new TypeError(`Attempt to use ${property} to set a value but ${key} is not an object`);
                                    else state = state[property] ||= {};
                                }
                            }
                        }
                        return target[property] = value;
                    }
                }
                if(property==="get") {
                    return (property) => {
                        const parts = property.split(".");
                        let state = states.find((state) => parts[0] in state);
                        if(state) {
                            while(parts.length>0) {
                                const key = parts.shift();
                                if(parts.length===0) return state[key];
                                state = state[key];
                                if(state && typeof state!=="object") throw new TypeError(`Attempt to use ${property} to get a value but ${key} is not an object`);
                            }
                        }
                        return target[property] = value;
                    }
                }
                const value = target[property];
                if(value!==undefined) return value;
                for(const state of states) {
                    const value = state[property];
                    if(value!==undefined) return value;
                }
                //return exported[this] || globalThis[property];
            },
            has(target,property) {
                if(target[property]!==undefined) return true;
                for(const state of states) {
                    if(property in state) return true;
                }
                if(globalThis[property]!==undefined || exported[property]) return false;
                return true;
            },
            ownKeys(target) {
                const keys = new Set();
                for(const state of states) {
                    for(const key of Object.keys(state)) keys.add(key);
                }
                return [...keys];
            },
            set(target,property,value) {
                throw new Error(`Can't set property value for ${property} inside reactive string literal. It will cause an infinite loop`);
            }
        });
        return proxy;
    }

    const handleOnAttribute = (attribute,value) => {
        let event;
        if(attribute.name.includes(":")) event = attribute.name.split(":").find((part,i,values) => part=="on" ? values[i] : undefined)
        else event = attribute.name.slice(2);

        if(attribute.name.includes(":")) {
            if(typeof value !=="function") value = (new Function("return "+value)).bind(attribute.ownerElement);
            attribute.ownerElement.addEventListener(event,(ev) => {
                value(ev);
            });
        } else {
            if(typeof value !=="function") value = (new Function("return "+value)).bind(attribute.ownerElement);
            else attribute.ownerElement[value.name] = value;
            attribute.ownerElement.addEventListener(event,value);
            attribute.ownerElement.removeAttribute(attribute.name);
            //attribute.value = `event.target.${value.name}(event)`;
        }
    }

    const handleHook = (node,value) => {
        let {hook,placeholder,delay,interval,where="outer"} = value;
        placeholder = typeof placeholder === "function" ? placeholder() : placeholder||node.value||node.data||"...";
        let toreplace = node.nodeType===Node.ATTRIBUTE_NODE ? [] : render(node,placeholder,{where});
        (interval ? setInterval : setTimeout)(async () => {
            const node = toreplace[0];
            if(where==="outer" && toreplace.length>0) animate(() => toreplace.forEach((node) => node.remove()));
            let content = await hook();
            if(isObject(content)) {
                try {
                    content = JSON.stringify(content);
                } catch {

                }
            } else {
                content = content.toString();
            }
            if(node.nodeType===Node.ATTRIBUTE_NODE) {
                if(node.name.startsWith("on") || node.name.includes("on:")) handleOnAttribute(node,content)
                else node.value = content;
            } else {
                toreplace = render(node,content,{where})
            }
        },interval || delay || 1000)
    }

    const walkSync = (node, callback, root = node, level = 0) => {
        if (node.nodeType == Node.TEXT_NODE) {
            if (callback) callback(node, level, root);
        } else {
            if (node.nodeType == Node.ELEMENT_NODE) for (const attr of [...node.attributes]) !callback || callback(attr, level, root)
            if(node.tagName!=="SCRIPT" && node.tagName!=="CODE") {
                if (callback) callback(node, level, root);
                const nodes = [...(node.childNodes ? node.childNodes : node)];
                for (const child of nodes) walkSync(child, callback, root, level + 1);
            }
        }
        return node;
    };

    const walk = async (node, callback, root = node, level = 0) => {
        if (node.nodeType == Node.TEXT_NODE) {
            if (callback) await callback(node, level, root);
        } else {
            if (node.nodeType == Node.ELEMENT_NODE) for (const attr of [...node.attributes]) !callback || callback(attr, level, root)
            if(node.tagName!=="SCRIPT" && node.tagName!=="CODE") {
                if (callback) callback(node, level, root);
                const nodes = [...(node.childNodes ? node.childNodes : node)];
                for (const child of nodes) await walk(child, callback, root, level + 1);
            }
        }
        return node;
    };

    const __DIRECTIVES__ = {},
        __HTML_CACHE__ = new Map();
    const html = function (strings, ...values) {
        const {state, root} = isHTMLScope(this) ? this : {state: {}, root: document},
        locator = "__LCTR__",
        result = {
            strings,
            values,
            toString() {
                return this.raw();
            },
            raw() {
                return strings.reduce((acc, cur, i) => {
                    const value = values[i - 1];
                    if(Array.isArray(value)) {
                        return acc += value.map((value) => (isInterpolation(value) ? value.raw() : (value.toString ? value.toString() : value))).join("")
                    }
                    return acc + (isInterpolation(value) ? value.raw() : (value.toString ? value.toString() : value)) + cur
                })
            },
            nodes(){
                return this.toDocumentFragment().childNodes;
            },
            toDocumentFragment() {
                const removeAttribute = (attribute) => !attribute.isConnected || attribute.ownerElement.removeAttribute(attribute.name);
                let html = (__HTML_CACHE__.get(strings) || strings.reduce((html, string, i) => {
                        if (i >= values.length) return html + string;
                        html += string + locator + i;
                        return html;
                    }, "")),
                    templateOutsideHead = html.startsWith("<template>") && !html.startsWith("<head>");
                __HTML_CACHE__.set(strings, html);
                if (templateOutsideHead) html = "<div>" + html.slice(10).slice(0, -11) + "</div>";
                const parsed = new DOMParser().parseFromString(html, "text/html");
                walkSync(parsed, (node) => {
                    if (node.nodeType == Node.ATTRIBUTE_NODE) {
                        const name = node.name,
                            owner = node.ownerElement;
                        let value = node.value;
                        if (value.startsWith(locator)) {
                            const index = parseInt(value.substring(locator.length));
                            value = values[index];
                            if (isObject(value)) {
                                node.value = value instanceof Date ? value + "" : JSON.stringify(value);
                            } else if (typeof value === "function") {
                                node.value = "${" + value.name + "}";
                                if((node.name.startsWith("on") || node.name.includes("on:"))) handleOnAttribute(node,value);
                            } else if (isBoolAttribute(name)) {
                                if (!!value) node.value = "";
                                else removeAttribute(node);
                            } else {
                                node.value = value
                            }
                            if (node.value === "undefined") removeAttribute(node);
                        }
                    } else if (node.nodeType == Node.TEXT_NODE) {
                        if (node.data.trim().length === 0 || !node.data.includes("__LCTR__")) return;
                        const parts = node.data.split(/(?=__LCTR__\d+)/g).reduce((acc, cur) => { //\s|\S__LCTR__\d+
                            if (/\S__LCTR__\d+/.test(cur)) {
                                acc.push(cur[0]);
                                acc.push(cur.slice(1));
                            } else {
                                acc.push(cur);
                            }
                            return acc;
                        }, []);
                        node.data = "";
                        let currentNode = node;
                        const parent = node.parentElement;
                        parts.forEach((part,i) => {
                            if (part.startsWith(locator)) {
                                const index = parseInt(part.substring(locator.length)),
                                    value = values[index],
                                    type = typeof value,
                                    array = Array.isArray(value) ? value : [value];
                                let restPart = part.substring(locator.length + index.toString().length) || "";
                                for (const item of array) {
                                    if (isInterpolation(item)) { //type === "string" && item ||
                                        const nodes = [...item.toDocumentFragment().childNodes],
                                            last = nodes[nodes.length - 1] || currentNode;
                                        if (last) {
                                            currentNode.after(...nodes);
                                            const nextnode = document.createTextNode(restPart + " ");
                                            last.after(currentNode = nextnode);
                                        }
                                    } else if(isHook(value)) {
                                        handleHook(node,value)
                                    } else if (isObject(item)) {
                                        currentNode.data += (Array.isArray(item) ? item.join(",") : JSON.stringify(item)) + " "
                                    }
                                    else {
                                        currentNode.data += item + restPart;
                                    }
                                    restPart = "";
                                }
                            } else {
                                currentNode.data += (part === "" && i<parts.length-1 ? " " : part)
                            }
                        })
                    }
                });
                //sanitize
                const base = html.startsWith("<head>") ? parsed.head : parsed.body,
                    fragment = document.createDocumentFragment();
                if(html.includes("<style>") && !html.startsWith("<head>")) fragment.append(...parsed.head.querySelectorAll("style")||[]);
                while(base.firstChild) fragment.appendChild(base.firstChild);
                if (templateOutsideHead) {
                    const fragment = document.createDocumentFragment(),
                        template = document.createElement("template");
                    template.innerHTML = base.innerHTML;
                    fragment.append(template);
                    return fragment;
                }
                return fragment;
            }
        };
        return result;
    }
    const compile = (escaped, root,all) => {
        const unescaped = all ? escaped.replaceAll(/&gt;/g, ">").replaceAll(/&lt;/g, "<").replaceAll(/&amp;/g, "&").replaceAll(/&quot;/g, '""').replaceAll(/&apos;/g, "'")
            : replaceBetween(escaped, "${", "}", (text) => text.replaceAll(/&gt;/g, ">").replaceAll(/&lt;/g, "<").replaceAll(/&amp;/g, "&").replaceAll(/&quot;/g, '""').replaceAll(/&apos;/g, "'"));
        return Function("html", "root", "return (state) => { with(state) { return html`" + unescaped + "`}}")(html, root); // html.bind({state,root});
    }

    const interpolate = (text, state = {}, root,all) => compile(text, root,all)(state);

    let animations = [];
    const animate = (callback) => {
        animations.push(callback);
        if(animations.length===1) {
            requestAnimationFrame(async () => {
                for(const callback of animations) await callback();
                animations = [];
                if(typeof resizeFrame !== "undefined") resizeFrame(document);
            });
        }
    }

    const evaluateScripts = (node,target) => {
        for(const el of node.querySelectorAll("script")) {
            const script = document.createElement("script");
            [...el.attributes].forEach((attr) => script.setAttribute(attr.name,attr.value));
            if(script.hasAttribute("async") || script.hasAttribute("defer")) {
                const src = new URL(script.src);
                src.search += (src.search ? "&" : "") + "t=" + Date.now();
                script.src = src.href;
            }
            script.innerHTML = el.innerHTML;
            window.self = node.host ? node.host : node.parentElement;
            window.currentScript = script;
            (target||el).after(script);
            script.remove();
            delete window.currentScript;
        }
    }

    const getOptions = ({el,handler,root}) => {
        let options = handler!=="usejson" && handler!=="options" && el.hasAttribute(`${directiveExports.prefix}:options`) ? (directiveExports.JSON.parse(el.getAttribute(`${directiveExports.prefix}:options`))[handler])||{} : {};
        if(typeof options==="string" && options[0]==="#") {
            const el = root.getElementById(options);
            options = directiveExports.JSON.parse(el.innerHTML);
        }
        return options;
    }

    const getContext = (el,state=el.state) => {
        return statesProxy(getStates(el,state ? [state] : undefined))
    }

    const handleDirective = async (attr,{state,window=globalThis,document=globalThis.document,root=document,recurse}={}) => {
        const {name,value} = attr,
            parts = name.substring(5).split(":"); // data-foo:bar
        if(parts.length>1) {
            const [namespace,handler,...args] = parts,
                arg = {
                    namespace,
                    handler,
                    el: attr.ownerElement,
                    attribute: attr,
                    rawValue: value,
                    args,
                    options:getOptions({el:attr.ownerElement,handler,root}),
                    state:statesProxy(getStates(attr.ownerElement,state ? [state] : undefined)),
                    root,
                    window,
                    document,
                    recurse,
                    lazui: directiveExports
                };
            if(__DIRECTIVES__[namespace] && __DIRECTIVES__[namespace][handler]) {
                await __DIRECTIVES__[namespace][handler](arg);
            } else {
                try {
                    const directive = await import(/* webpackIgnore: true */ `${lazui.url.href}/directives/${namespace}/${handler}.js`);
                    if(directive) {
                        const f = directive[handler] || directive.default;
                        (__DIRECTIVES__[namespace] ||={})[handler] = f;
                        try {
                            await f(arg)
                        } catch(e) {
                            console.warn(`Directive: ${namespace}/${handler} threw an error ${e}`);
                        }
                    }
                } catch {
                    console.warn(`Can't find directive: ${namespace}/${handler}`);
                }
            }
        }
    }

    function _resizeFrame(document)  {
        const body = document.body;
        this.style.height = (body.offsetHeight < body.scrollHeight ?  body.offsetHeight : body.scrollHeight + 5) + "px";
        this.style.width = (body.offsetWidth < body.scrollWidth ? body.offsetWidth : body.scrollWidth + 18) + "px";
    }

    const handleFrame = (node,content,state) => {
        const iframe = document.createElement("iframe");
        while (node.firstChild) node.removeChild(node.firstChild);
        if(node.hasAttribute("title")) iframe.setAttribute("title",node.getAttribute("title"));
        iframe.setAttribute("frameborder","0");
        iframe.setAttribute("allowfullscreen","false");
        iframe.setAttribute("allow","accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
        iframe.setAttribute("sandbox","allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation");
        iframe.srcdoc = `<head>
            <base href="${document.baseURI}">
            ${node.hasAttribute("title") ? "<title>" + node.getAttribute("title") + "</title>" : ""}
            <script src="${document.querySelector('script[src*=\"/lazui\"]').getAttribute('src')}" autofocus></script>
            <script>
                window.top = window.parent = window.self = window.globalState = window;
                window.frameElement = null;
            </script>
            <style>
                html,body {
                margin:0;
                padding:0;
                width:100%;
                display:table;
            }
            </style>
        </head>
        <body>
        ${content}
        </body>`
        node.append(iframe);
        iframe.contentWindow.resizeFrame = _resizeFrame.bind(iframe)
        if(state) iframe.contentDocument.documentState = state;
    }

    const resolve = async (content,{state,root,recurse}) => {
        await walk(content,async (node) => {
            if(node.nodeType===Node.ATTRIBUTE_NODE) {
                const stateProxy = statesProxy(getStates(node.ownerElement,state ? [state] : undefined));
                if(node.value.includes("${")) {
                    observeNodes({nodes:[node],observe:["*"],root,string:node.value,state:stateProxy},() => {
                        const value = interpolate(node.value,stateProxy,root);
                        if(node.name.startsWith("on") || node.name.includes("on:")) handleOnAttribute(node,value.values[0]);
                        else if(isHook(value)) handleHook(node,value);
                        else if(value.values[0]) node.value = value.values[0].toString();
                        //else if(node.name.startsWith("on")) node.ownerElement.removeAttribute(node.name);
                    });
                } else if(node.name.startsWith("on")) {
                    handleOnAttribute(node,node.ownerElement[node.name] || node.value)
                }
                if (node.name.startsWith(directiveExports.prefix)) await handleDirective(node,{state:stateProxy,root,recurse});
                return;
            }
            if(node.nodeType===Node.TEXT_NODE && node.data.includes("${") && node.parentElement?.constructor.name!=="HTMLTemplateElement") {
                const stateProxy = statesProxy(getStates(node,state ? [state] : undefined)),
                    observation = {nodes:[node],observe:["*"],root,string:node.data,recurse,state:stateProxy};
                observeNodes(observation,() => {
                    const interpolated = interpolate(node.data,stateProxy,root,node.parentElement?.tagName==="SCRIPT").toDocumentFragment();
                    observation.nodes = [...interpolated.childNodes];
                    node.replaceWith(...interpolated.childNodes);
                })
            }
        })
    }

    const render = async (el,content,{node=el||document.createDocumentFragment(),where="inner",root=document,state=document.documentState||window.globalState||{},forElement,sanitizer,sanitizerOptions={},animator=(f) => animate(f),recurse=0}={}) => {
        if(node===document) {
            document.addEventListener("DOMContentLoaded",async () => {
                if(string) console.warn("String argument ignored when rendering to document on initial load. Existing document content will be used");
                await render(node.head,null,{where:"outer",state,sanitizer,sanitizerOptions,animator});
                await render(node.body,null,{node:state,sanitizer,sanitizerOptions,animator});
            });
            return;
        }
        if(content?.head) {
            evaluateScripts(content.head,el);
            content = content.body;
        }
        sanitizer = typeof sanitizer == "function" ? new sanitizer(sanitizerOptions) : sanitizer;
        sanitizer ||= sanitizer!==null && typeof Sanitizer !== "undefined" ? new Sanitizer(sanitizerOptions) : sanitizer;
        const string = typeof content === "string" ? content : !content && node.nodeType === Node.TEXT_NODE ? node.data : null;
        if(string) {
            observeNodes({nodes:[node],observe:["*"],root,string,state},() => content = interpolate(string,state,root).toDocumentFragment())
        } else {
            if(isObject(content) && content.toDocumentFragment) content = content.toDocumentFragment();
            if(!content) (content = node.cloneNode(true))
            if(state!==null) {
                if(!(content instanceof DocumentFragment) && !(content instanceof NodeList)) {
                    // ? node.html rathet thna content.html
                    content.innerHTML = replaceBetween(content.innerHTML, "`", "`", (text) => text.replaceAll(/</g, "&lt;"))
                }
                await resolve(content,{state,root,recurse});
            }
        }
        if(where===null) return content;
        const callback = recurse>0 ? async ({childNodes}) => {
            for(const child of childNodes) {
                if(child.nodeType!==Node.TEXT_NODE) await render(child,null,{root,state,sanitizer,sanitizerOptions,animator,recurse:recurse-1})
            }
        } : undefined;
        return update({node,content,state,root,where,animator,callback});
        //return node;
    }
    function replaceBetween(inputString, delimiterStart, delimiterEnd, replacementCallback) {
        const placeholders = [];
        let startIndex = inputString.indexOf(delimiterStart),
            endIndex;
        while (startIndex !== -1) {
            endIndex = inputString.indexOf(delimiterEnd, startIndex + delimiterStart.length);
            if (endIndex !== -1) {
                const textBetweenDelimiters = inputString.substring(startIndex + delimiterStart.length, endIndex);
                const replacementText = replacementCallback(textBetweenDelimiters);
                const placeholder = `__PLCHLDR__${placeholders.length}__`;
                placeholders.push({ placeholder, replacementText });
                inputString = inputString.substring(0, startIndex) + placeholder + inputString.substring(endIndex + delimiterEnd.length);
            } else {
                // If the end delimiter is not found, break the loop
                break;
            }
            startIndex = inputString.indexOf(delimiterStart, endIndex+1);
        }
        // Perform the replacements
        while(inputString.includes("__PLCHLDR__")) {
            placeholders.forEach(({ placeholder, replacementText }) => inputString = inputString.replace(placeholder, delimiterStart + replacementText + delimiterEnd));
        }
        return inputString;
    }

    const update = ({node, content, state=document.documentState||window.globalState||{}, where="inner", root=document.documentElement, animator = (f) => animate(f),callback}) => {
        const mode = node.nodeType===Node.ELEMENT_NODE ? node.getAttribute(`${directiveExports.prefix}:mode`) : null;
        if(mode) {
            if(where!=="inner") throw new Error(`${mode} must use where="inner" not where="${where}"`);
            if(mode!=="open" && mode!=="frame") throw new Error(`${directiveExports.prefix}:${mode}, is not currently supported`);
        }
        const updated = [],
             // if no content.childNodes, content is a NodeList or an error
            updater = async () => {
                const getNodes = (content) => content.childNodes ? content.childNodes : content;
                content = await content;
                let childNodes = [...getNodes(content)];
                if (where === "inner") {
                    if (node.nodeType === Node.TEXT_NODE) {
                        if(mode) throw new Error(`Shadow dom mode: ${mode} for text nodes, is not supported`);
                        updated.push(...getNodes(content));
                        node.after(...getNodes(content));
                        node.remove();
                    } else {
                        if (mode === "open") {
                            const shadowRoot = node.shadowRoot || node.attachShadow({mode});
                            shadowRoot.state = state;
                            updated.push(...getNodes(content));
                            shadowRoot.replaceChildren(...getNodes(content));
                            const src = node.getAttribute(`${directiveExports.prefix}:src`);
                            if(!src || !src.startsWith("http")) evaluateScripts(shadowRoot)
                        } else if (mode === "frame") {
                            updated.push(...getNodes(content));
                            handleFrame(node,getNodes(content),state);
                        } else {
                            updated.push(node);
                            node.replaceChildren(...getNodes(content));
                        }
                    }
                } else if (where === "outer") {
                    const target = root instanceof DocumentFragment && root.host ? root.host : node;
                    updated.push(...getNodes(content))
                    target.replaceWith(...getNodes(content));
                } else if (where === "previousSibling") {
                    updated.push(...getNodes(content))
                    const target = root instanceof DocumentFragment && root.host ? root.host : node;
                    if(target.previousSibling) target.previousSibling.replaceWith(...getNodes(content));
                    else target.before(...getNodes(content));
                } else if (where === "beforeBegin") {
                    const target = root instanceof DocumentFragment && root.host ? root.host : node;
                    updated.push(...getNodes(content))
                    target.before(...getNodes(content));
                } else if (where === "afterBegin") {
                    updated.push(...content.childNodes);
                    if (node.nodeType === Node.TEXT_NODE) node.after(...getNodes(content));
                    else node.prepend(...getNodes(content));
                } else if (where === "firstChild") {
                    updated.push(...getNodes(content));
                    if (node.firstChild) node.firstChild.replaceWith(...getNodes(content));
                    else node.append(...getNodes(content))
                } else if (where === "lastChild") {
                    updated.push(...getNodes(content));
                    if (node.lastChild) node.lastChild.replaceWith(...getNodes(content));
                    else node.append(...getNodes(content))
                } else if (where === "beforeEnd") {
                    updated.push(...getNodes(content))
                    if (node.nodeType === Node.TEXT_NODE) node.before(...getNodes(content));
                    else node.append(...content.childNodes);
                } else if (where === "afterEnd") {
                    updated.push(...getNodes(content))
                    const target = root instanceof DocumentFragment && root.host ? root.host : node;
                    target.after(...getNodes(content));
                } else if (where === "nextSibling") {
                    updated.push(...getNodes(content))
                    const target = root instanceof DocumentFragment && root.host ? root.host : node;
                    if(target.nextSibling) target.nextSibling.replaceWith(...getNodes(content));
                    else target.after(...getNodes(content));
                } else if (where === "_top") {
                    let newContent;
                    if (content.firstElementChild.tagName !== "HTML") {
                        newContent = document.createElement("html");
                        if (content.firstElementChild.tagName === "HEAD") {
                            const head = document.createElement("head");
                            newContent.append(head);
                            head.append(...content.firstElementChild.childNodes);
                        } else if (content.firstElementChild.tagName === "BODY") {
                            const body = document.createElement("body");
                            newContent.append(body);
                            body.append(...content.firstElementChild.childNodes);
                        } else {
                            throw new Error("Invalid top level element");
                        }
                    }
                    childNodes = [...newContent.childNodes];
                    updated.push(...childNodes);
                    root.replaceChildren(...childNodes)
                } else {
                    const [selector,_where]= where.startsWith("#") ? where.split(".") : [where,"inner"],
                        target = root.querySelector(selector);
                    if (!target) throw new Error(`Target element ${where} not found`);
                    updated.push(target);
                    if(_where==="inner") target.replaceChildren(...getNodes(content))
                    else if(_where==="beforeBegin") target.before(...getNodes(content))
                    else if(_where==="afterBegin") target.prepend(...getNodes(content))
                    else if(_where==="beforeEnd") target.append(...getNodes(content))
                    else if(_where==="afterEnd") target.after(...getNodes(content))
                    else throw new Error(`Invalid where: ${where}`);
                }
                //childNodes.forEach((node) => handleDirectives(node,state,root));
                if (callback) setTimeout(() => callback({childNodes,root,animate}))
            };
        if (typeof animator === "function") animator(updater)
        else updater();
        return updated;
    }

    const directiveExports = {render,update,html,compile,interpolate,getState,setState,getContext,observeNodes,handleDirective,replaceBetween,router:window,JSON,prefix:"data-lz"},
        exported = {...directiveExports,useDirectives};
    if(typeof module !== "undefined") {
        module.exports = exported;
    } else if(typeof window !== "undefined") {
        globalThis.lazui = exported;
    }
})();