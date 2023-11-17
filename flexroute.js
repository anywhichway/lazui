const toFunction = (test) => {
    const type = typeof test;
    if(type==="function") return test;
    if(type==="string") {
        const handler = (req) => {
            return test==="*" || req.URL.pathname === test;
        }
        handler.condition = test;
        return handler;
    }
    if(type==="object") {
        if(test instanceof RegExp) {
            const handler = (req) => {
                return test.test(req.url);
            }
            handler.condition = test;
            return handler;
        }
        if(test instanceof Request) {
            const handler = (req) => {
                return req.url === test.url;
            }
            handler.condition === test.url;
            return handler;
        }
        if(typeof test.fetch === "function")  return test.fetch.bind(test);
        if(test instanceof Route) {
            const {method,test,schemas,handler} = test;
            if(!handler) throw new TypeError("handler is required");
            if(method || test || schemas) {
                return async (req) => {
                    const testtype = typeof test;
                    if(method && req.method !== method) return;
                    if(!test(req)) return;
                    if(schemas.request && !schemas.request.validate(req)) return;
                    const response = await handler(req);
                    if(schemas.response && !schema.response.validate(response)) return;
                    return response;
                };
            }
        }
    }
    throw new TypeError(`test must be a function, string, RegExp, Request, or Route not ${type} ${test?.constructor?.name||""}`);
}

const responseOrRequestAsObject = async (value) => {
    value = value.clone();
    const object = {};
    for(const key in value) {
        if(typeof value[key] === "function" || key==="signal") continue;
        if(key==="headers") {
            object.headers = {};
            value.headers.forEach((value,key)=> {
                object.headers[key] = value;
            });
        } else {
            object[key] = value[key];
        }
    }
    if(!["GET","HEAD","DELETE","OPTIONS"].includes(value.method)) object.body = await value.text();
    return object;
}


class Schema {
    constructor(schema) {
        Object.assign(this,schema)
    }
    validate(obj) {
        return true;
    }
}

class Route {
    constructor({method,test,schemas,handler}) {
        if(!handler) throw new TypeError("handler is required");
        this.method = method;
        this.test = toFunction(test);
        this.schemas = {};
        if(schemas?.request) this.schemas.request = new Schema(schemas.request);
        if(schemas?.response) this.schemas.request = new Schema(schemas.response);
        this.handler = handler;
    }
}

const handleSocket = async (server,req) => {
    if (server.server.readyState === 1) {
        return new Promise(async (resolve, reject) => {
            const listener = async (event) => {
                const text = await event.data.text(),
                    {body, url,...rest} = JSON.parse(text);
                if (rest.headers?.Connection === "keep-alive") {
                    if (resolve) {
                        resolve(server.server);
                        resolve = null;
                    }
                } else if(resolve) {
                    server.server.removeEventListener("message", listener);
                    resolve(new Response(body, rest));
                }
            }
            server.server.addEventListener("message", listener);
            const message = new TextEncoder().encode(JSON.stringify(await responseOrRequestAsObject(req)));
            server.server.send(message);
        });
    } else if (server.server.readyState !== 0) {
        server.server = new WebSocket(server.url.href);
    }
}
function flexroute(test,...rest) {
    if(!this || typeof this!=="object" || !(this instanceof flexroute)) return new flexroute(test,...rest);
    if(test) this.push([toFunction(test),...rest]);
    this.remotes = [];
    return this;
};
flexroute.prototype = [];
flexroute.prototype.constructor = flexroute;
flexroute.prototype.fetch = async function(req,...rest) {
    //console.log(req);
    const type = typeof req;
    if(!req || !["string","object"].includes(type)) throw new TypeError(`req must be a string or object not ${type}`);
    if(type === "string") req = new Request(req);
    else if(!["Request"].includes(req.constructor.name)) req = new Request(req.url,req);
    if(!req.URL) req.URL = new URL(req.url);
    const routes = [...this];
    let res;
    for(const route of routes) {
        if(typeof route.fetch === "function") {
            const result = await route.fetch(req,...rest);
            if(result) {
               // console.log("result",result);
                if(typeof result === "object" &&  (result instanceof Response || result instanceof WebSocket)) {
                    res = result;
                    break;
                }
                try {
                    res = new Response(result, {status: 200});
                } catch(e) {
                    throw TypeError("fetch must return a Response, a Promise that resolves to a Response, or a valid Response body");
                }
            }
            continue;
        }
        const [test,...steps] = route,
            result = await test(req,[...rest,()=>{}]);
        if(result) {
           // console.log("result",result);
            if(typeof result === "object" && (result instanceof Response || result instanceof WebSocket)) {
                res = result;
                break;
            }
            const next = () => {
                steps.splice(0,steps.length);
                return undefined;
            }
            steps.push(next);
            for(const step of steps) {
                const result = await step(req,...rest);
                if(!result) break;
                if(typeof result === "object" && (result instanceof Response || result.constructor.name==="WebSocket" || result.constructor.name==="ServerResponse")) {
                    res = result;
                    break;
                }
            }
            if(res) break;
        }
    }
    if(res) return res;
    const racers = [],
        race = this.remotes.filter((remote) => remote.race),
        serial = this.remotes.filter((remote) => !remote.race);
    race.forEach((server) => {
        const clone = req.clone(),
            type = typeof server.server;
        server.requestCount++;
        const startTime = Date.now();
        let promise;
        if(type==="string") {
            racers.push(promise = fetch(server.url,clone));
        } else if(type === "object" && server.server instanceof WebSocket) {
            promise = handleSocket(server,clone);
            if(promise) racers.push(promise);
        }
        if(promise) {
            promise.then((response) => {
                server.responseCount++;
                server.totalResponseTime += Date.now() - startTime;
                return response;
            })
            .catch((e) => {
                server.errors.push(e);
                throw e;
            });
        } else {
            throw new TypeError(`unexpected server type ${type} ${server.server?.constructor?.name||""}`);
        }
    });
    const errors = [];
    if(racers.length>0) {
        try {
            const result = await Promise.race(racers);
            if(result instanceof WebSocket || result.status<500) return result;
        } catch(e) {
            errors.unshift(e);
        }
    }
    const responses = await Promise.allSettled(racers);
    for(const response of responses) {
        if(response.status<500) return response;
        else errors.unshift(response);
    }
    for(const server of serial) {
        const clone = req.clone(),
            type = typeof server.server;
        if(type==="string") {
            try {
                const response = await fetch(new URL(req.url,server.url).href,clone);
                if(response.status<500) return response;
                else errors.unshift(response);
            } catch(e) {
                errors.unshift(e)
            }
            continue;
        }
        if(type === "object" && server.server instanceof WebSocket) {
            try {
                return await handleSocket(server, clone);
            } catch(e) {
                errors.unshift(e)
            }
        }
        if(errors.length>0) {
            for(const error of errors) {
                if(error.status>=500) return error;
            }
            return new Response("Internal Server Error",{status:500});
        }
        throw new TypeError(`unexpected server type ${type} ${server.server?.constructor?.name||""}`);
    }
    return new Response("Not Found",{status:404});
};
["GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS","CONNECT"].forEach((method) => {
    flexroute.prototype[method.toLowerCase()] = function(test,...args) {
        this.push([(req) => req.method === method, toFunction(test),...args]);
        return this;
    }
});
Object.assign(flexroute.prototype,{
    all(test,...args) {
        this.push([(req) => true,toFunction(test),...args]);
        return this;
    },
    add(...args) {
        this.push(...args);
        return this;
    },
    withServers({balance}={},...servers) {
        servers = servers.map((item) => {
            if(typeof item === "string") item = {url:new URL(item)};
            if(item && typeof item ==="object") {
                item = {...item};
                item.requestCount = 0;
                item.totalResponseTime = 0;
                item.responseCount = 0;
                item.errors = [];
                Object.defineProperty(item,"avgResponseTime",{get() { return this.totalResponseTime / this.requestCount }});
                Object.defineProperty(item,"errorRate",{get() { return this.errors.length / this.requestCount }});
                if(typeof item.url === "string") item.url = new URL(item.url);
                if(!item.url || typeof item.url !== "object") throw new TypeError(`flexroute expects a string or URL for url property ${typeof item}`);
            } else {
                throw new TypeError(`flexroute only supports string and object for server specs not ${typeof item}`);
            }
            if(item.url.protocol==="http:" || item.url.protocol==="https:") { item.server = item.url.href; return item; }
            if(item.url.protocol==="ws:" || item.url.protocol==="wss:") { item.server = new WebSocket(item.url.href); return item; }
            throw new TypeError(`flexroute only supports http, https, ws, and wss protocols not ${item.url.protocol}`);
        })
        this.remotes.push(...servers);
        return this;
    }
})

export {flexroute,flexroute as default}




