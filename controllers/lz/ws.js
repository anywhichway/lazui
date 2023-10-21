const imports = {

}

io.__sockets__ ||= new WeakMap()
const init = async ({el,root,options,lazui})=> {
    const {target,subscribe=true,template} = options,
        {render,prefix,replaceBetween} = lazui;
    let src = options.src;
    if(!src) {
        const srcUrl = new URL(window.location.href);
        srcUrl.protocol = srcUrl.protocol==="http:" ? srcUrl.protocol = "ws" : "wss";
        srcUrl.pathname = "/";
        srcUrl.hash = "";
        src = srcUrl.href;
    } else {
        src = new URL(src,document.baseURI).href;
    }
    if(!io.__sockets__.has(el)) {
        const socket = io(src,{transports: ['websocket']});
        io.__sockets__.set(el,socket);
        socket.onAny(async (event,message) => {
            const channel = el.querySelector("#"+event);
            if(channel) {
                const t = template ? root.querySelector(template) : (channel ? channel.querySelector("template") || el.querySelector("template") : el.querySelector("template")),
                    text = t ? t.innerHTML : message,
                    state = {message},
                    content = t ? t.innerHTML : message,
                    where = channel.getAttribute(`${prefix}:target`) || channel.getAttribute("target") || el.getAttribute(`${prefix}:target`) || el.getAttribute("target") || undefined;
                render(channel,content,{state,where,root});
            }
        });
    }
}

export {
    imports,
    init
}