function dataset({el,attribute,args,lazui})  {
    const {JSON} = lazui;
    if(args.length===0) {
        dataset = JSON.parse(attribute.value);
        for (const [key, value] of Object.entries(dataset)) el.dataset[key] = value;
    } else {
        const key = args[0];
        el.dataset[key] = attribute.value;
    }
    el.removeAttribute(attribute.name);
}

export {dataset}