
const loadController = ({el,attribute,state,root,lazui}) => {
    const {JSON,prefix,activateHandlers} = lazui,
        url = new URL(attribute.value,document.baseURI);
    if(!url.pathname.endsWith(".js")) url.pathname += ".js";
    import(url.href).then((module) => {
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
            el.init({el,state,root,lazui},JSON.parse(el.getAttribute(`${prefix}\\:config`)||"{}"))
        }
    });
}
async function controller({el,attribute,state,root,lazui})  {
    if(el.hasAttribute("data-lz:src")) return;
    loadController({el,attribute,state,root,lazui});
}

export {controller,loadController}