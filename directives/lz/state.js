const patch = (target,value) => {
    Object.entries(value).forEach(([key,value]) => {
        if(value && typeof value === "object") {
            if(!target[key] || typeof target[key]!=="object") target[key] = {};
            patch(target[key],value);
        } else {
            target[key] = value;
        }
    })
};

const state = async({el,attribute,root,options,window,document,lazui,args}) => {
    const {getState,setState,JSON,router,prefix} = lazui,
        src = el.getAttribute('data-lz:src');
    let id, state, created, loaded;
    if(attribute.value.startsWith("{")) {
        state = JSON.parse(attribute.value);
    } else {
        id = attribute.value;
    }
    if (!el.id) {
        el.setAttribute("id",id || `state${(Math.random()+"").substring(2)}`);
    }
    if(!state) state = getState(el.id,{root,options});
    if(!state) {
        if(src) {
            const response = await router.fetch(src);
            if(response.status===200) {
                const text = await response.text();
                try {
                    state = JSON.parse(text);
                } catch(e) {
                    throw new Error(`${prefix}:state ${src} is not valid JSON`);
                }
                loaded = src;
            } else if(response.status!==404) {
                throw new Error(`${prefix}:state ${src} returned ${response.status}`);
            }
        }
        if(!state) {
            try {
                state = JSON.parse(el.innerText.trim()||el.innerHTML.trim());
                created = true;
                if(src) {
                    const response = await router.fetch(new Request(src,{method:"PUT",body:JSON.stringify(state),headers:{"content-type":"application/json"}}));
                    if(response.status!==200) {
                        throw new Error(`${prefix}:state PUT ${src} returned ${response.status}`);
                    }
                }
            } catch(e) {
                if(el.hasAttribute('data-lz:src')) {
                    throw new Error(`${prefix}:state ${src} was not found and ${el.id} is not valid JSON ${e}`)
                }
                throw new Error(`${prefix}:state ${el.id} is not valid JSON ${e}`);
            }
        }
    }
    state = setState(el,state,{root,options});
    if(loaded) state.dispatchEvent(new CustomEvent("state:loaded",{bubbles:true,detail:{state,src:loaded}}));
    if(created) state.dispatchEvent(new CustomEvent("state:created",{bubbles:true,detail:{state}}));
    if(options.put) {
        state.addEventListener("state:change", async ({detail}) => {
            const {property,path,ancestors,state} = detail;
            if(property==="mtime" && path[path.length-1]==="^") return; // prevent loops from changes on server to mtime
            const data = ancestors[0] || state,
                text = await router.fetch(new Request(src,{method:"PUT",body:JSON.stringify(data),headers:{"content-type":"application/json"}})).then((response) => {
                    return response.text();
                }),
                newstate = JSON.parse(text);
            patch(data,newstate);
            state.dispatchEvent(new CustomEvent("state:put",{bubbles:true,detail}));
        })
    }
    if(options.delete) {
        state.addEventListener("state:deleted", () => {
            router.fetch(new Request(src,{method:"DELETE"}));
        })
    }
    if(args[0]==="global") window.globalState = state;
    else if(args[0]==="document") document.documentState = state;
};

export {state}