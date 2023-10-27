async function userouter({attribute,lazui,options}) {
    lazui.useRouter = useRouter;
    const {prefix,JSON} = lazui,
        el = attribute.ownerElement,
        {importName="default",isClass,allowRemote} = options;
    await import(attribute.value).then((module) => {
        const Router = module[importName],
            router = isClass ? new Router(options) : Router(options);
        lazui.useRouter(router, {allowRemote,prefix});
    })
}

function useRouter(router,{prefix,root = document.documentElement,allowRemote=__OPTIONS__.allowRemote,all=(c) => {
    if(c.req.raw.mode==="document") {
        return new Response("Not Found",{status:404})
    }
    if(c.req.URL.pathname.endsWith(".md")) {
        c.req.raw.headers.set("Accept-Include","true");
    }
    return fetch(c.req.raw);
}}={}) {
    // (req,resp)
    // (req,resp,next)
    // (ctx,next)
    // must support router.get("*",handler) and router.all("*",...) and return of a Response object (both Hono and Itty do)
    router.all("*", async (arg1,arg2,arg3) => {
        let c = arg1.req ? arg1 : {req:arg1},
            next = typeof arg2 === "function" ? arg2 : typeof arg3 === "function" ? arg3 : null;
        const url = c.req.URL = new URL(c.req.url, document.baseURI),
            method = c.req.method.toLowerCase(),
            isLocal = c.req.url.startsWith(document.location.origin);
        let mode = c.req.raw.mode;
        if(url.href.replace(url.hash,"")===document.location.href.replace(document.location.hash,"")) {
            const el = document.getElementById(url.hash.slice(1));
            return new Response(el.innerHTML,{headers:{"content-type":"text/html"}});
        }
        if(isLocal || allowRemote) {
            let node;
            if (isLocal) {
                node = root.querySelector(`template[${prefix}\\:url\\:${method}="${c.req.url}"],template[${prefix}\\:url\\:${method}="${url.pathname}"]`);
            } else if (allowRemote && /^(http|https):/i.test(c.req.url)) {
                node = root.querySelector(`template[${prefix}\\:url\\:${method}="${c.req.url}"]`);
            }
            if(node) {
                if(typeof node[method] === "function") {
                    const resp = await node[method](c.req);
                    node.setAttribute(`${prefix}:status`,resp.status);
                    resp.headers.forEach((value,key) => {
                        node.setAttribute(`${prefix}:header-${key}`,value);
                    });
                    return resp;
                }
                if(node.hasAttribute(`${prefix}:mode`)) mode = node.getAttribute(`${prefix}:mode`); // overwrites
                const status = node.getAttribute(`${prefix}:status`) || 200,
                    headers = {"content-type": node.getAttribute(`${prefix}:content-type`) || "text/plain"};
                for (const attr of [...node.attributes]) {
                    if (attr.name.startsWith(`${prefix}:header-`)) headers[attr.name.substring(12)] = attr.value;
                    else if (attr.name === `${prefix}:headers`) Object.assign(headers, JSON.parse(attr.value))
                }
                if (method === "post" || method === "put") {
                    let response;
                    if(mode!=="document") {
                        try {
                            response = await fetch(c.req.raw);
                        } catch {

                        }
                    }
                    let target = root.querySelector(`[${prefix}\\:url\\:get="${c.req.url}"],[${prefix}\\:url\\:get="${url.pathname}"]`);
                    if(!target) {
                        target = document.createElement("template");
                        target.setAttribute(`${prefix}:url:get`,c.req.url);
                        node.after(target);
                    }
                    target.setAttribute(`${prefix}:content-type`,response?.status===200 ? response.headers.get("content-type") : c.req.headers.get("content-type")||"text/plain");
                    target.setAttribute(`${prefix}:status`,response?.status===200 ? response.status : 200);
                    target.innerHTML = response?.status===200 ? await response.text() : await c.req.text();
                    return new Response("ok",{status:200, headers:response?.status===200 ? response.status.headers : headers}); // should return contents of the POST or put element
                } else if (method === "get") {
                    let response;
                    if(mode!=="document") {
                        try {
                            response = await fetch(c.req.raw);
                        } catch {

                        }
                    }
                    const value = response?.status===200 ? await response.text() : node.innerHTML;
                    if(value.length!==0) {
                        return new Response(value,{status:response ? response.status : status, headers:response?.status===200 ? response.status.headers : headers})
                    }
                } else if(method === "delete") {
                    let response;
                    if(mode!=="document") {
                        try {
                            response = await fetch(c.req.raw);
                        } catch {

                        }
                    }
                    node.innerHTML = "";
                    node.setAttribute(`${prefix}:status`,"404");
                    return new Response("ok", {status, headers});
                }
            }
        }
        if(c.req.raw.mode==="document") {
            return new Response("Not Found",{status: 404});
        }
        if(next) await next();
    });
    if (all) router.all("*", all);
    return this.router = router;
}

export {userouter,useRouter};