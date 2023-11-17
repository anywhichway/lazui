function usedefaults({el,rawValue,lazui}) {
    const {prefix,JSON}= lazui,
        config = JSON.parse(rawValue||"{}"),
        options = {};
    if(config.autofocus!==false) el.setAttribute("autofocus","");
    if(config.json!==false) el.setAttribute(`${prefix}:usejson`,"https://esm.sh/json5");
    if(config.userouter!==false) {
        el.setAttribute(`${prefix}:userouter`,"https://unpkg.com/@anywhichway/lazui/flexrouter.js");
        options.userouter = {
            importName:'flexrouter',
                isClass:false,
                allowRemote:true,
                options: {
                    servers: [
                        `ws${window.location.protocol==="https:" ? "s" : ""}://${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}`,
                        `${window.location.protocol}//${window.location.host}`
                    ]
                },
                markdownProcessor: {
                src:'https://esm.sh/markdown-it',
                    call:'render',
                    isClass:true,
                    options: {
                        html:true,
                        linkify:true
                    }
                }
            }
    }
    if(options.usehighlighter!==false) {
        el.setAttribute(`${prefix}:usehighlighter`,"https://esm.sh/highlight.js");
        options.usehighlighter = {
            style: '/styles/default.css'
        }
    }
    el.setAttribute(`${prefix}:options`,JSON.stringify(options));
}

export {usedefaults}