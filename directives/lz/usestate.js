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
    const {getState,JSON} = lazui,
        {id=el.id,observe,json} = parseState(attribute.value,JSON),
        state = getState(id,{root});
    if(!state && id) throw new Error(`Can't find state: ${id}`);
    el.state = state;
};

export {usestate}