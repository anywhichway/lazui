const imports = {

}

WebSocket.__sockets__  ||= new WeakMap()
const init = async ({el,root,options,lazui})=> {
    const {target,subscribe=true,template} = options,
        {render,prefix,replaceBetween} = lazui;
    let src = options.src;
    if(!src) {
        const srcUrl = new URL(window.location.href);
        srcUrl.protocol = srcUrl.protocol==="http:" ? srcUrl.protocol = "ws" : "wss";
        srcUrl.pathname = "/";
        srcUrl.hash = "";
        srcUrl.port = parseInt(srcUrl.port);
        src = srcUrl.href;
    } else {
        src = new URL(src,document.baseURI).href;
    }
    let socket = WebSocket.__sockets__.get(el);
    if(!socket) {
        socket = new WebSocket(src);
        WebSocket.__sockets__.set(el,socket);
    }
    socket.addEventListener("open",() => {
        socket.send(JSON.stringify({topic:"subscribe",message:"*"}));
    })
    socket.addEventListener("message",async (event) => {
        const  {topic,message} = JSON.parse(event.data),
            target = el.querySelector("#"+topic);
        if(target) {
            const t = template ? root.querySelector(template) : (target.querySelector("template") || el.querySelector("template")),
                text = t ? t.innerHTML : message,
                state = {message},
                content = t ? t.innerHTML : message,
                where = target.getAttribute(`${prefix}:target`) || target.getAttribute("target") || el.getAttribute(`${prefix}:target`) || el.getAttribute("target") || undefined;
            render(target,content,{state,where,root});
        }
    });
}

export {
    imports,
    init
}