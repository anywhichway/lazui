const __TEMPLATE_CONTENT__ = new WeakMap();

const iterationTypes = {
    value: "values",
    key: "keys",
    entry: "entries"
}
function foreach({el,attribute,root,state,args,lazui}) {
    if(el.firstElementChild?.constructor.name!=="HTMLTemplateElement") throw new Error("The foreach element must have a template as a child");
    const {render,getState,JSON} = lazui;
    let [what,value=what,index="index",array="array"] = args;
    const iterationType = iterationTypes[what],
        template = __TEMPLATE_CONTENT__.get(el) || el.firstElementChild.innerHTML || el.firstElementChild.innerText;
    __TEMPLATE_CONTENT__.set(el,template);
    let data = attribute.rawValue;
    if(data===undefined) {
        data = attribute.value;
        if(data[0]==="#") {
            const property = value.split(".")[1];
            data = getState(value.slice(1))[property];
        } else {
            try {
                data = JSON.parse(data);
            } catch {

            }
        }
    }
    while(el.firstChild) el.removeChild(el.firstChild);
    Object[iterationType](data).forEach((v,i,a) => {
        state.set(value,v,true);
        state.set(index,i,true);
        state.set(array,a,true);
        render(el,template,{state, root, where:"beforeEnd"});
    });
}

export {foreach};