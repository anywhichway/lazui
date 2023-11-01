function aria({el,attribute,lazui})  {
    const {JSON} = lazui,
        aria = JSON.parse(attribute.value);
    Object.entries(aria).forEach(([key,value]) => {
        key = key.replace(/[A-Z]/g, (match, offset) => (offset > 0 ? '-' : '') + match.toLowerCase());
        el.setAttribute("aria-"+key,value)
    })
    el.removeAttribute(attribute.name)
}

export {aria}