
const loadController = async ({el,attribute,state,options,root,lazui}) => {
    const {JSON,prefix,activateHandlers} = lazui,
        url = new URL(lazui.url.href + attribute.value);
    if(!url.pathname.endsWith(".js")) url.pathname += ".js";
    await import(url.href).then((module) => {
        if(!el.isConnected) return;
        for(const [key,value] of Object.entries(module)) {
            const type = typeof value;
            if(type === "function") {
                if(key.startsWith("on")) {
                    el.addEventListener(key.substring(2),value.bind(el))
                } else {
                    el[key] = value;
                }
            } else if(key==="imports") {
                const selectorBase = ["INPUT","SELECT","TEXTAREA"].includes(el.tagName) ? el.parentElement : el;
                Object.entries(value).forEach(([key,value]) => el[key] = value[0]==="#" ? root.querySelector(value) : selectorBase.querySelector(value))
            }
        }
        if(el.init) {
            el.init({el,state,root,options,lazui})
        }
    }).catch((e) => {
        console.error(e);
        throw e;
    });
}
async function controller({el,attribute,state,root,options,lazui})  {
    if(el.hasAttribute("data-lz:src")) return;
    await loadController({el,attribute,state,options,root,lazui});
}

export {controller,loadController}