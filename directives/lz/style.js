function style({el,attribute,lazui})  {
    const {JSON} = lazui,
        style = JSON.parse(attribute.value);
    Object.entries(style).forEach(([key,value]) => {
        key = key.replace(/[A-Z]/g, (match, offset) => (offset > 0 ? '-' : '') + match.toLowerCase());
        el.style[key] = value;
    })
}

function styleItem({el,attribute,args,lazui})  {
    const key = args[0];
    return el.style[key] = attribute.value;
}

export {style}