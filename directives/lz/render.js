const __TEMPLATE_CONTENT__ = new WeakMap();

function render({el,attribute,root,state,lazui}) {
    const fname = attribute.value,
        f = state[fname] || root[fname] || window[fname];
    let template = __TEMPLATE_CONTENT__.get(el);
    if(!template && el.firstElementChild?.tagName==="TEMPLATE") template = el.firstElementChild;
    if(template) __TEMPLATE_CONTENT__.set(el,template);
    f({el,template,state,lazui})
}

export {render};