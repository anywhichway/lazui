const handlers = {
    get(request) {
        return new Response("Hello world!",{status:200,headers:{"Content-Type":"text/plain"}})
    }
}

export {handlers as default};