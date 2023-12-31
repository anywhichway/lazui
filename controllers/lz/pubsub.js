const imports = {

}

const init = async ({el,root,lazui,options})=> {
    const {target,subscribe=true,template} = options,
        {render,prefix,replaceBetween,JSON,url} = lazui,
        src = options.src;
    await import(new URL(src,document.baseURI)).then(async (module) => {
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