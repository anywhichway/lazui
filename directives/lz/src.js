import {loadController} from "./controller.js";

function src({el,attribute,root,state,lazui}) {
    const {render,router,prefix,replaceBetween,handleDirective,update,getState,JSON} = lazui;
    if(el.hasAttribute(`${prefix}:on`)) {
        handleDirective(el.attributes[`${prefix}:on`],{state,root})
        return;
    }
    if(el.hasAttribute(`${prefix}:usestate`)) {
        state = getState(el.getAttribute(`${prefix}:usestate`),root);
    } else if(el.hasAttribute(`${prefix}:state`)) {
        state = el.state;
    }
    if(attribute.value.startsWith("#")) {
        const source = root.getElementById(attribute.value.slice(1)),
            string = source.innerHTML || source.innerText,
            where = el.getAttribute(`${prefix}:target`) || el.getAttribute("target") || undefined;
        render(el, string, {state, root, where, recurse: 1});
        return;
        // if(controller) loadController({el,attribute:controller,state,root,lazui})
    }
    let request;
    try {
        const json = JSON.parse(attribute.value),
            mode = json.mode;
        if(mode==="document") delete json.mode;
        request = new Request(json.url,json);
        if(mode==="document") {
            Object.defineProperty(request,"mode",{value:mode});
        }
    } catch {
        request = new Request(attribute.value);
    }
    router.fetch(request).then(async (response) => {
        if(request.method==="GET" || response.status!==200) {
            const string = (response.status!==200 ? response.status + " " : "") + replaceBetween(await response.text(), "`", "`", (text) => "`" + text.replaceAll(/</g, "&lt;") + "`"),
                where = el.getAttribute(`${prefix}:target`) || el.getAttribute("target") || undefined,
                mode = el.getAttribute(`${prefix}:mode`),
                controller = el.attributes[`${prefix}:controller`];
            if(state || mode ==="frame") {
                let content = mode==="frame" ? string : document.createDocumentFragment();
                if(mode!=="frame") {
                    const div = document.createElement("div");
                    div.innerHTML = string;
                    while(div.firstChild) content.appendChild(div.firstChild);
                }
                if(mode==="frame") {
                    update({node:el, content:string, state, root:el, where, recurse: 1});
                } else {
                    let content = document.createDocumentFragment();
                    const div = document.createElement("div");
                    div.innerHTML = string;
                    while(div.firstChild) content.appendChild(div.firstChild);
                    // ? checl for iframe targte here, if it is just shove string in and see if we can handle resize events
                    content = render(el,content,{state, root:el, where:null});
                    update({node:el, content, state, root:el, where, recurse: 1});
                }
                //if(controller) loadController({el,attribute:controller,state,root,lazui})
            } else {
                render(el, string, {state, root:el, where, recurse: 1});
                if(controller) loadController({el,attribute:controller,state,root,lazui})
            }
        }
    })
}

export {src};