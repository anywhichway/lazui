async function userouter({attribute,lazui,options}) {
    const {prefix,JSON,useRouter} = lazui,
        el = attribute.ownerElement,
        {importName="default",isClass,allowRemote} = options;
    await import(attribute.value).then((module) => {
        const Router = module[importName],
            router = isClass ? new Router(options) : Router(options);
        useRouter(router, {allowRemote});
    })
}

export {userouter};