const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
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
    await window.lazuiStatesReady;
    const {getState,JSON,handleDirective} = lazui,
        {id=el.id,observe,json} = parseState(attribute.value,JSON);
    let state = getState(id,{root});
    if(!state && id) {
        await sleep(250);
        state = getState(id,{root});
        if(!state) throw new Error(`Can't find state: ${id}`);
    }
    el.state = state;
};

export {usestate}