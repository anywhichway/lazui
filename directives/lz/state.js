const state = async({el,attribute,root,options,window,document,lazui,args}) => {
    const {getState,setState,JSON} = lazui;
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
        if(el.hasAttribute('data-lz:src')) {
            const text = await fetch(el.getAttribute('data-lz:src')).then((response) => response.text());
            state = JSON.parse(text);
        } else {
            state = JSON.parse(el.innerText||el.innerHTML)
        }
    }
    state = setState(el,state,{root,options});
    if(args[0]==="global") window.globalState = state;
    else if(args[0]==="document") document.documentState = state;
};

export {state}