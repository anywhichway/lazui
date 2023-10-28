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
    const {getState,setState,JSON,router} = lazui,
        src = options.src;
    let id, state;
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
        if(options.src) { //el.hasAttribute('data-lz:src')
            const text = await router.fetch(options.src).then((response) => response.text()); //el.getAttribute('data-lz:src')
            state = JSON.parse(text);
        } else {
            state = JSON.parse(el.innerText||el.innerHTML.trim())
        }
    }
    state = setState(el,state,{root,options});
    if(options.put) {
        state.addEventListener("change", async ({detail}) => {
            if(detail.property==="mtime" && detail.path[detail.path.length-1]==="^") return; // prevent loops from changes on server to mtime
            const target = detail.ancestors[0] || detail.state,
                text = await router.fetch(new Request(src,{method:"PUT",body:JSON.stringify(target),headers:{"content-type":"application/json"}})).then((response) => {
                  return response.text()
                }),
                newstate = JSON.parse(text);
            patch(target,newstate);
        })
    }
    if(args[0]==="global") window.globalState = state;
    else if(args[0]==="document") document.documentState = state;
};

export {state}