const imports = {

}

const init = async ({el,root,options,lazui})=> {
    const {subscribe=true,template} = options,
        {render,prefix,JSON} = lazui,
        t = template ? root.querySelector(template) : el.querySelector("template"),
        src = options.src;
    let events;
    el.addEventListener("subscribe",(event) => {
        events = new EventSource(new URL(src,document.baseURI).href)
        events.onmessage = async (event) => {
            let value = event.data;
            try {
                value = JSON.parse(value);
            } catch {

            }
            const content = t ? t.innerHTML : value,
                state = {message:value},
                where = el.getAttribute(`${prefix}:target`) || el.getAttribute("target") || undefined;
            event.src = (new URL(src,window.location)).href;
            render(el,content,{state,root,recurse:true,where});
        };
        el.subscribed = true;
    });
    el.addEventListener("unsubscribe",(event) => {
        if(events) events.close();
        el.subscribed = false;
    });
    el.subscribe = function() {
        el.dispatchEvent(new CustomEvent("subscribe",{detail:(new URL(src,document.baseURI)).href,bubbles:true,cancelable:false,composed:true}));
    }
    el.unsubscribe = function() {
        el.dispatchEvent(new CustomEvent("unsubscribe",{detail:(new URL(src,document.baseURI)).href,bubbles:true,cancelable:false,composed:true}));
    }
    if(subscribe) el.subscribe();
}

export {
    imports,
    init
}