const parseTrigger = (text) => {
    if(text) {
        const trigger = {},
            parts = text.split(" ");
        trigger.type = parts.shift();
        trigger.once = parts.includes("once");
        trigger.delay = parseInt((parts.find((part) => part.startsWith("delay:"))||"").split(":")[1]||0);
        trigger.every = parseInt((parts.find((part) => part.startsWith("every:"))||"").split(":")[1]||0);
        trigger.throttle = parseInt((parts.find((part) => part.startsWith("throttle:"))||"").split(":")[1]||0);
        trigger.debounce = parseInt((parts.find((part) => part.startsWith("debounce:"))||"").split(":")[1]||0);
        trigger.call = (parts.find((part) => part.startsWith("call:"))||"").split(":")[1];
        trigger.dispatch = (parts.find((part) => part.startsWith("dispatch:"))||"").split(":")[1];
        trigger.placeholder = text.slice(text.indexOf("placeholder:")).split(":")[1];
        trigger.changed = parts.includes("changed");
        return trigger;
    }
}
async function trigger({el,attribute,state,root,lazui})  {
    let throttle,debounce;
    const {render,update,router,prefix,replaceBetween,url,JSON} = lazui,
        {loadController} = await import(url + "/directives/lz/controller.js"),
        triggers = attribute.value.split(",").map((text) => text.trim())
        .reduce((acc,text) => {
            if(text.length>0) acc.push(parseTrigger(text));
            return acc;
        },[]),
        handler = (event) => {
            if(event.target!==el) return;
            const trigger = triggers.find((trigger) => trigger.type === event.type);
            if(trigger) {
                if (trigger.throttle) {
                    if (throttle) {
                        event.preventDefault();
                        event.stopPropagation();
                        return;
                    }
                    throttle = true;
                    setTimeout(() => throttle = false, trigger.throttle);
                } else if (trigger.debounce && !event.detail.debounced) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (debounce) {
                        clearTimeout(debounce);
                        debounce = setTimeout(() => {
                            debounce = null; // need to copy event data
                            setTimeout(() => el.dispatchEvent(new CustomEvent(event.type, {detail: {debounced: trigger.debounce}})), trigger.delay);
                        }, trigger.debounce);
                    } else {
                        debounce = setTimeout(() => {
                            debounce = null; // need to copy event data
                            setTimeout(() => el.dispatchEvent(new CustomEvent(event.type, {detail: {debounced: trigger.debounce}})), trigger.delay);
                        });
                    }
                    return;
                }
                if (trigger.delay && !event.detail.timeout) {
                    event.preventDefault();
                    event.stopPropagation(); // need to copy event data
                    if(trigger.placeholder) el.innerHTML = trigger.placeholder;
                    const timeout = setTimeout(() => el.dispatchEvent(new CustomEvent(event.type, {
                        detail: {
                            timeout,
                            sourceEvent: event
                        }
                    })), trigger.delay);
                    return;
                }
                if (trigger.every && !event.detail.interval) {
                    event.preventDefault();
                    event.stopPropagation();
                    if(trigger.placeholder) el.innerHTML = trigger.placeholder;
                    const interval = setInterval(() => el.dispatchEvent(new CustomEvent(event.type, {
                        detail: {
                            interval,
                            sourceEvent: event
                        }
                    })), trigger.every);
                }
                if (!(trigger.delay || trigger.every) || (trigger.delay && event.detail.timeout) || (trigger.every && event.detail.interval)) {
                    if (trigger.once) triggers.splice(triggers.indexOf(trigger), 1);
                    if (trigger.dispatch==="load" || event.type==="load") {
                        event.stopImmediatePropagation();
                        let src = el.getAttribute(`${prefix}:src`);
                        let request;
                        //if(src?.startsWith("#")) src = window.location.pathname + src;
                        try {
                            const json = JSON.parse(src),
                                mode = json.mode;
                            if(mode==="document") delete json.mode;
                            request = new Request(json.url,json);
                            if(mode==="document") {
                                Object.defineProperty(request,"mode",{value:mode});
                            }
                        } catch {
                            request = new Request(src);
                        }
                        router.fetch(request).then(async (response) => {
                            const string = replaceBetween(await response.text(), "`", "`", (text) => "`" + text.replaceAll(/</g, "&lt;") + "`"),
                                where = el.getAttribute(`${prefix}:target`) || el.getAttribute("target") || undefined,
                                mode = el.getAttribute(`${prefix}:mode`),
                                controller = el.attributes[`${prefix}:controller`];
                            if (state || mode==="frame" || el.state) {
                                //let content = mode==="frame" ? string : document.createDocumentFragment();
                                if(mode==="frame") {
                                    update({node:el, content:string, state, root:el, where, recurse: 1});
                                } else {
                                   /* content.state = el.state;
                                    const div = document.createElement("div");
                                    div.innerHTML = string;
                                    while(div.firstChild) content.appendChild(div.firstChild);
                                    content = render(el,content,{state, root:el, where:null});
                                    update({node:el, content, state, root:el, where, recurse: 1});*/
                                    let content = document.createElement("html");
                                    content.innerHTML = string;
                                    content.state = el.state;
                                    content.head = content.firstElementChild;
                                    content.body = content.lastElementChild;
                                    //if(state || el.state) {
                                    //    content = render(el,content,{state, root:el, where:null});
                                    //}
                                    ["style","template"].forEach((tagName) => {
                                        for(const el of content.head.querySelectorAll(tagName)) {
                                            content.body.insertAdjacentElement("afterbegin",el);
                                        }
                                    })
                                    if(new URL(request.url).origin!==location.origin) content = content.body;
                                    content = render(el,content,{state, root:el, where:null});
                                    update({node:el, content, state, root:el, where, recurse: 1})
                                }
                            } else {
                                render(el, string, {state, root: el, where, recurse: 1});
                                if (controller) loadController({el, attribute: controller, state, root, lazui})
                            }
                            if(event.type!=="load") el.dispatchEvent(new CustomEvent("load",{detail:{sourceEvent:event}}));
                        })
                    }
                    if (trigger.call) {
                        const scope = trigger.call.slice(0, trigger.call.lastIndexOf(".")),
                            fname = trigger.call.slice(trigger.call.lastIndexOf(".") + 1);
                        if (scope === "window" || scope === "globalThis") {
                            globalThis[fname](event);
                        } else if (scope === "document") {
                            document[fname](event);
                        } else if (scope === "controller") {
                            const controller = el.closest(`[${prefix}\\:controller]`);
                            controller[fname](event);
                        } else if (scope === "src") {
                            const src = el.closest(`[${prefix}\\:src]`);
                            src[fname](event);
                        } else if (scope === "closest") {
                            let node = el;
                            while (typeof node[fname] !== "function" && node.parentElement) node = node.parentElement;
                            if (typeof node[fname] === "function") node[fname](event);
                        } else if (scope === "this") {
                            el[fname](event);
                        } else {
                            for (const el of root.querySelectorAll(scope) || []) {
                                if (typeof el[fname] === "function") el[fname](event);
                            }
                        }
                    }
                }
            } else { // ??
                //el.dispatchEvent(new CustomEvent("load", {detail: {sourceEvent: event}}));
            }
        };
    let loaded = false;
    triggers.forEach((trigger) => setTimeout(()=> {
        el.addEventListener(trigger.type,handler);
        if(trigger.type==="load" && !triggers.some((trigger) => trigger.dispatch==="load")) {
            loaded = true;
            el.dispatchEvent(new CustomEvent("load", {detail: {sourceEvent: null}}));
        }
    }));
}

export {trigger}