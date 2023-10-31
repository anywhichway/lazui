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

const getInputElementHTML = (name,value,{bind,prefix}) => {
    const type = typeof value;
    if(type==="boolean") {
        return `<label for="${name}">${name}:</label><input type="checkbox" name="${name}" ${value ? "checked" : ""} ${bind ? `${prefix}:bind="${name}"` : ""}>`
    }
    if(type==="number" || type==="bigint") {
        return `<input type="number" name="${name}" title="${name}" placeholder="${name}" ${bind ? `${prefix}:bind="${name}"` : ""}>`
    }
    if(type==="string") {
        if(value.length<=50) {
            return `<input type="text" name="${name}" title="${name}" placeholder="${name}" ${bind ? `${prefix}:bind="${name}"` : ""}>`
        }
        return `<textarea name="${name}" title="${name}" placeholder="${name}"  ${bind ? `${prefix}:bind="${name}"` : ""}>${value}</textarea>`
    }
    if(Array.isArray(value) && value.every((item) => isPrimitive(item))) {
        return `<input type="text" name="${name}" title="${name}" placeholder="${name}" value="${value.join(", ")}" ${bind ? `${prefix}:bind="${name}"` : ""}>`
    }
}

const init = async ({el,root,state,lazui,options})=> {
    if(el.tagName!=="FORM") throw new TypeError("lz:form: el must be a form element");
    const {getContext,JSON,router,render,interpolate,prefix} = lazui;
    if(el.innerHTML.trim()==="") {
        if(el.hasAttribute("data-lz:src")) {
            el.innerHTML = await fetch(el.getAttribute("data-lz:src")).then((response) => response.text());
        } else {
            if(el.state) {
                const table = document.createElement("table");
                Object.entries(el.state).forEach(([key,value]) => {
                    const html = getInputElementHTML(key,value,{bind:true,prefix});
                    if(html) {
                        const row = document.createElement("tr"),
                            cell = document.createElement("td");
                        if(options.useLabels) {
                            const label = document.createElement("label");
                            label.setAttribute("for",key);
                            label.innerText = key[0].toUpperCase() + key.slice(1) + ":";
                            row.appendChild(label);
                        }
                        cell.innerHTML = html;
                        row.appendChild(cell);
                        table.appendChild(row);
                    }
                });
                el.appendChild(table);
                if(el.hasAttribute("action")) {
                    el.insertAdjacentHTML("beforeend",`<br><button type="submit">Submit</button>`);
                }
            }
        }
        await init({el,root,state,lazui,options});
        return;
    }
    for(const input of el.querySelectorAll("input,select,textarea")) {
        let property = input.getAttribute("data-lz:bind:read") || input.getAttribute("data-lz:bind:write") || input.getAttribute("data-lz:bind");
        if(!property && (input.hasAttribute("data-lz:bind:read") || input.hasAttribute("data-lz:bind:write") || input.hasAttribute("data-lz:bind"))) {
            property = input.getAttribute("name");
        }
        if(property) {
            if(!input.hasAttribute("name")) input.setAttribute("name",property);
            if(input.hasAttribute("data-lz:bind:write") || input.hasAttribute("data-lz:bind")) {
                const listener = (event) => {
                    const context = getContext(el),
                        expectType = typeof context[property];
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
                    if(Array.isArray(context[property]) && context[property].every((item) => isPrimitive(item))) {
                        value = value.split(",").map((value) => {
                            value = value.trim()
                            try {
                                return JSON.parse(value);
                            } catch {
                                return value;
                            }
                        });
                        if(!value.every((item) => isPrimitive(item))) {
                            return;
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