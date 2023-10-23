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
        const url = c.req.URL = new URL(c.req.url, document.baseURI);
        if(url.href.replace(url.hash,"")===document.location.href.replace(document.location.hash,"")) {
            const el = document.getElementById(url.hash.slice(1));
            return new Response(el.innerHTML,{headers:{"content-type":"text/html"}});
        }
        let node,
            isLocal;
        if(isLocal = c.req.url.startsWith(document.location.origin)) {
            node = root.querySelector(`[${prefix}\\:url="${c.req.url}"],[${prefix}\\:url="${url.pathname}"]`);
        } else if(allowRemote && /^(http|https):/i.test(c.req.url)) {
            node = root.querySelector(`[${prefix}\\:url="${c.req.url}"]`);
        }
        if(!node && c.req.method==="POST" && (isLocal || allowRemote)) {
            node = document.createElement("template");
            const target = root.querySelector("head")||root.querySelector("body");
            node.setAttribute(`${prefix}:url`,c.req.url);
            target.appendChild(node);
        }
        if (node) {
            if(c.req.method==="PUT" || c.req.method==="POST") {
                const text = await c.req.text();
                node.innerHTML = text;
            }
            if(["GET","PUT","POST","PATCH"].includes(c.req.method)) {
                const headers = {"content-type": "text/html"};
                for (const attr of [...node.attributes]) {
                    if (attr.name.startsWith(`${prefix}:header-`)) headers[attr.name.substring(12)] = attr.value;
                    else if (attr.name === `${prefix}:headers`) Object.assign(headers, __JSON__.parse(attr.value))
                }
                const html = document.createElement("html");
                html.innerHTML = node.innerHTML;
                const head = html.querySelector("head");
                let style = "",
                    link = "";
                if(head) {
                    for(const equiv of head.querySelectorAll("meta[http-equiv]")) headers[equiv.getAttribute("http-equiv")] = equiv.getAttribute("content");
                    for(const el of head.querySelectorAll("style")) style += el.outerHTML;
                    for(const el of head.querySelectorAll("link[rel=stylesheet]")) link += el.outerHTML;
                }
                const status = node.getAttribute(`${prefix}:status`) || 200;
                return new Response(style + link + (node.querySelector("body")||node).innerHTML, {status,headers});
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