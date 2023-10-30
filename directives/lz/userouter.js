async function userouter({attribute,lazui,options}) {
    lazui.useRouter = useRouter;
    const {prefix,JSON,url} = lazui,
        el = attribute.ownerElement,
        {importName="default",isClass,allowRemote,markdownProcessor} = options;
    await import(attribute.value).then(async (module) => {
        const Router = module[importName],
            router = isClass ? new Router(options) : Router(options),
            parts = prefix.split("-"),
            lazuiProtocol = (parts[0]==="data" ? parts[1] : parts[0]) + ":",
            host = url.href;
        let markdown = markdownProcessor ? (await import(markdownProcessor.src))[markdownProcessor.importName||"default"] : undefined;
        if(markdown && markdownProcessor.isClass) {
            const instance = new markdown(markdownProcessor.options);
            markdown = instance[markdownProcessor.call].bind(instance);
        } else if(markdown && markdownProcessor.call) {
            markdown = markdown[markdownProcessor.call].bind(markdown);
        }
        lazui.useRouter(router, {allowRemote,prefix,JSON,markdown,lazuiProtocol,host});
    })
}

function useRouter(router,{prefix,lazuiProtocol,host,markdown,JSON = globalThis.JSON,root = document.documentElement,allowRemote,all=(c) => {
    if(c.req.raw.mode==="document") {
        return new Response("Not Found",{status:404})
    }
    if(c.req.URL.pathname.endsWith(".md")) {
        c.req.raw.headers.set("Accept-Include","true");
    }
    return globalThis.fetch(c.req.raw);
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
        if(url.protocol===lazuiProtocol) {
            const pathname = url.pathname.slice(1),
                src = host + pathname;
            return window.fetch(src);
        }
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
                if(node.hasAttribute(`${prefix}:options`)) {
                    const options = JSON.parse(node.getAttribute(`${prefix}:options`));
                    if(options?.url?.handlers) {
                        const handlers = globalThis[options?.url?.handlers] || (await import(new URL(options.url.handlers,document.baseURI).href)).default;
                        ["get","post","put","delete","head","patch","options"].forEach((key) => {
                            if(typeof handlers[key] === "function") node[key] = handlers[key];
                        })
                    }
                }
                if(typeof node[method] === "function") {
                    const resp = await node[method](c.req.raw);
                    if(resp) return resp;
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
                    if(node.innerHTML.trim()) return new Response(node.innerHTML,{status:status||200,headers})
                    return new Response(target.innerHTML,{status:200, headers:response?.status===200 ? response.status.headers : headers}); // should return contents of the POST or put element
                } else if (method === "get") {
                    if(url.pathname.endsWith(".md") && !node.hasAttribute(`${prefix}:content-type`)) {
                        node.setAttribute(`${prefix}:content-type`,"text/markdown");
                    }
                    let response;
                    if(mode!=="document") {
                        try {
                            response = await fetch(c.req.raw);
                        } catch {

                        }
                    }
                    let value = response?.status===200 ? await response.text() : node.innerHTML;
                    if(value.length!==0) {
                        const status = response?.status===200 ? response.status : 200;
                        node.setAttribute(`${prefix}:status`,status);
                        if(response) {
                            node.setAttribute(`${prefix}:content-type`,response.headers.get("content-type"));
                            for(const [key,value] of response.headers.entries()) {
                                node.setAttribute(`${prefix}:header-${key}`,value);
                            }
                        }
                        if(node.getAttribute(`${prefix}:content-type`)==="text/markdown") {
                            value = markdown(value);
                        }
                        return new Response(value,{status, headers:response?.status===200 ? response.status.headers : headers})
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
    const fetch = router.fetch;
    router.fetch = async (request) => {
        if(typeof request === "string") {
            if(request.startsWith("{")) {
                const json = JSON.parse(request);
                const mode = json.mode;
                if(mode==="document") delete json.mode;
                request = new Request(json.url,json);
                if(mode==="document") {
                    Object.defineProperty(request,"mode",{value:mode});
                }
            } else {
                request = new Request(request);
            }
        }
        return fetch(request)
    }
    return this.router = router;
}

export {userouter,useRouter};