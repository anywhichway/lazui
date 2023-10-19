function _if({el,attribute,root,state,args,lazui}) {
    const {render,getState,JSON} = lazui;
    let value = attribute.value;
    if(value[0]==="#") {
        const [id,property] = value.split(".");
        value = getState(id.slice(1))[property];
    } else {
        try {
            value = JSON.parse(value);
        } catch {
            if(value.startsWith(".")) value = state[value.slice(1)]
            else value = state[value]
        }
    }
    if(!value) el.remove()
}

export {_if,_if as default};