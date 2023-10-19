async function userouter({attribute,lazui}) {
    const {prefix,JSON,useRouter} = lazui,
        el = attribute.ownerElement,
        {importName="default",isClass,options,allowRemote} = el.hasAttribute(`${prefix}:options`) ? JSON.parse(el.getAttribute(`${prefix}:options`)) : {};
    await import(attribute.value).then((module) => {
        const Router = module[importName],
            router = isClass ? new Router(options) : Router(options);
        useRouter(router, {allowRemote});
    })
}

export {userouter};