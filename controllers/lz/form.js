const imports = {

}

const isPrimitive = (value) => ["bigint","boolean","number","string","symbol"].includes(typeof value);

const init = async ({el,root,lazui,options})=> {
    if(el.tagName!=="FORM") throw new TypeError("lz:form: el must be a form element");
    const {getContext,JSON} = lazui;
    for(const input of el.querySelectorAll("input,select,textarea")) {
        let property = input.getAttribute("data-lz:bind:read") || input.getAttribute("data-lz:bind:write") || input.getAttribute("data-lz:bind");
        if(property) {
            if(input.hasAttribute("data-lz:bind:write") || input.hasAttribute("data-lz:bind")) {
                input.addEventListener("change",() => {
                    let value = input.type==="checkbox" ? input.checked : input.value;
                    try {
                        value = JSON.parse(value);
                    } catch {

                    }
                    const context = getContext(el);
                    context.set(property,value);
                })
            }
            if(input.hasAttribute("data-lz:bind:read") || input.hasAttribute("data-lz:bind")) {
                const context = getContext(el),
                    value = context.get(property);
                if(input.type==="checkbox") input.checked = !!value;
                else if(value!=null) input.value = isPrimitive(value) ? value : JSON.stringify(value);
            }
        }
    }
}

export {
    imports,
    init
}