const imports = {

}

const init = async ({el,root,lazui}, {target,subscribe=true,template})=> {
    const {render,prefix,replaceBetween,JSON} = lazui,
        url = new URL(import.meta.url),
        src = url.search.slice(1),
        options = JSON.parse(el.getAttribute(`${prefix}:options`) || el.getAttribute("options") || "{}");
    await import(new URL(src,document.baseURI).href).then(async (module) => {
        el.addEventListener("message",async (event) => {
            let value = event.data||event.detail;
            try {
                value = JSON.parse(value);
            } catch(e) {
                if(!value || typeof value !== "object") {
                    throw new TypeError(`PubSub: Error parsing JSON: ${value}`);
                }
            }
            const  channel = value.channel.startsWith("#") ? el.querySelector(value.channel) : null,
                t = template ? root.querySelector(template) : (channel ? channel.querySelector("template") || el.querySelector("template") : el.querySelector("template")),
                content = t ? t.innerHTML : value.message,
                state = value,
                where = value.channel.startsWith("#") ? `${value.channel}${options.target ? "."+options.target : ""}`  : el.getAttribute(`${prefix}:target`) || el.getAttribute("target") || undefined;
            render(el,content,{state,where,root});
        });
        el.addEventListener("subscribe",(event) => { el.subscribed = true; module.subscribe(el,event.detail.channel) });
        el.addEventListener("unsubscribe",(event) => { el.subscribed = false; module.unsubscribe(el,event.detail.channel)});
        el.subscribe = (channel=options.channel||"*") => el.dispatchEvent(new CustomEvent("subscribe",{detail:{url:(new URL(src,document.baseURI)).href,channel},bubbles:true,cancelable:false,composed:true}));
        el.unsubscribe = (channel=options.channel||"*") => el.dispatchEvent(new CustomEvent("unsubscribe",{detail:{url:(new URL(src,document.baseURI)).href,channel},bubbles:true,cancelable:false,composed:true}));
        if(subscribe) el.subscribe();
    });
}

export {
    imports,
    init
}