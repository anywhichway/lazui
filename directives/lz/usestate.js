const __ORIGINAL_CONTENT__ = new WeakMap();
const parseState = (text,JSON) => {
    const ref = {};
    if(text) {
        const parts = text.split(" ");
        ref.id = parts.shift();
        ref.observe = [];
        const observed = parts.find((part) => part.startsWith("observe:"));
        if(observed) {
            ref.observe = observed.split(":")[1].split(",");
        }
        return ref;
    }
    return ref;
}
const usestate = async({el,attribute,root,lazui,recurse})  => {;
    const {render,getState,JSON} = lazui,
        {id=el.id,observe,json} = parseState(attribute.value,JSON),
        state = getState(id,{root});
    if(!state && id) throw new Error(`Can't find state: ${id}`);
    let content = "";
    if(el.hasAttribute(`data-lz:src`)) {

    } else {
        content = __ORIGINAL_CONTENT__.get(el) || el.innerHTML;
        __ORIGINAL_CONTENT__.set(el,content);
    }
    el.state = state;
    const callback = () => {
        //for (const attr of el.attributes) {
          //  if (attr.value.includes('${')) {
         //       attr.value = (new Function("state", "with(state) { return `" + attr.value + "`}"))(state);
          //  }
        //}
        if(!recurse) render(el, content, {state, root, recurse: 1});
    }
    lazui.observeNodes({nodes:[el],observe,root,state},callback)
};

export {usestate}