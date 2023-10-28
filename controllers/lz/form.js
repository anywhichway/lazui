const imports = {

}

const isPrimitive = (value) => ["bigint","boolean","number","string","symbol"].includes(typeof value);

const formToJSON = (el,JSON,includeEmpty) => {
    return [...el.elements].reduce((json,element) => {
        if(["submit","button","image","reset"].includes(element.type)) return json;
        if(element.type==="checkbox") {
            json[element.name] = element.checked;
            return json;
        }
        let value = element.value;
        if(value!=="" || includeEmpty) {
            if(value==="") value = typeof includeEmpty === "string" ? includeEmpty : "";
            try {
                value = JSON.parse(value);
            } catch {

            }
            if(element.type==="radio") {
                if(element.checked) json[element.name] = value;
            } else {
                json[element.name] =value;
            }
        }
        return json;
    },{})
}

const init = async ({el,root,lazui,options})=> {
    if(el.tagName!=="FORM") throw new TypeError("lz:form: el must be a form element");
    const {getContext,JSON,router,render,interpolate} = lazui;
    for(const input of el.querySelectorAll("input,select,textarea")) {
        let property = input.getAttribute("data-lz:bind:read") || input.getAttribute("data-lz:bind:write") || input.getAttribute("data-lz:bind");
        if(!property && (input.hasAttribute("data-lz:bind:read") || input.hasAttribute("data-lz:bind:write") || input.hasAttribute("data-lz:bind"))) {
            property = input.getAttribute("name");
        }
        if(property) {
            if(!input.hasAttribute("name")) input.setAttribute("name",property);
            if(input.hasAttribute("data-lz:bind:write") || input.hasAttribute("data-lz:bind")) {
                const listener = (event) => {
                    const context = getContext(el);
                    let value;
                    if(input.type==="select-multiple") {
                        value = [...event.target.selectedOptions].map((option) => {
                            try {
                                return JSON.parse(option.value)
                            } catch {
                                return option.value;
                            }
                        });
                    } else if(input.type==="checkbox") {
                        value = event.target.checked;
                    } else {
                        try {
                            value = JSON.parse(event.target.value);
                        } catch {
                            value = event.target.value;
                        }
                    }
                    context.set(property,value);
                }
                input.addEventListener("input",listener);
                input.addEventListener("change",listener);
            }
            if(input.hasAttribute("data-lz:bind:read") || input.hasAttribute("data-lz:bind")) {
                const context = getContext(el),
                    value = context.get(property);
                if(input.type==="checkbox") {
                    input.checked = !!value;
                } else if(input.type==="select-multiple") {
                    for(const option of input.options) {
                        if(value.includes(option.value)) option.selected = true;
                    }
                } else if(input.type==="radio") {
                    if(input.value===value) input.checked = true;
                } else if(value!=null) {
                    input.value = isPrimitive(value) ? value : JSON.stringify(value);
                }
            }
        }
    }
    el.addEventListener("submit",async(event) => {
        event.preventDefault();
        const action = el.getAttribute("action");
        if(!action) throw new Error("Form must have an action attribute in order to submit");
        let config;
        const enctype = el.getAttribute("enctype")||"application/x-www-form-urlencoded",
            headers = {"Content-Type":enctype};
        let format;
        if(enctype==="application/json") format = () => JSON.stringify(formToJSON(el,JSON));
        else if(enctype==="application/x-www-form-urlencoded") format = () => new URLSearchParams(new FormData(el)).toString();
        else if(enctype==="multipart/form-data") format = () => new FormData(el);
        else if(enctype==="text/plain")format = () => el.innerText;
        else throw new TypeError(`Form options.format must be one of "application/x-www-form-urlencoded", "application/json", "multipart/form-data", "text/plain" not ${enctype}.`);
        const response = await router.fetch(new Request(action,{method:el.getAttribute("method")||"POST",body:format(),headers}));
        let content;
        if(response.ok) {
            content = await response.text();
            if(["html","template"].includes(options.expect)) content = new DOMParser().parseFromString(content,"text/html");
        } else {
            content = `${response.status} ${response.statusText}`
        }
        const where = el.hasAttribute("data-lz:target") ? el.getAttribute("data-lz:target") : undefined;
        if(options.template) {
            if(options.expect && options.expect!=="json") throw new TypeError(`A form has specified an output template ${options.template} but expects a response of type ${options.expect}. It should expect JSON instead.`);
            const template = document.querySelector(options.template);
            render(el,interpolate(template.innerHTML,getContext(el,Object.assign(formToJSON(el,JSON,"unknown"),JSON.parse(content)))),{root,where});
        } else if(options.expect==="template") {
            render(el,content,{root,where,state:getContext(el,formToJSON(el,JSON,"unknown"))});
        } else { // expect===html
            render(el,content,{root,where});
        }
    })
}

export {
    imports,
    init
}