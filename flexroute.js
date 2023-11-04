const toFunction = (test) => {
    const type = typeof test;
    if(type==="function") return test;
    if(type==="string") return (req) => {
        return test==="*" || req.URL.pathname === test;
    }
    if(type==="object") {
        if(test instanceof RegExp) return (req) => {
            return test.test(req.url);
        }
        if(test instanceof Request) return (req) => {
            return req.url === test.url;
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
    if(!["GET","HEAD","DELETE"].includes(value.method)) object.body = await value.text();
    return JSON.stringify(object);
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
function flexroute(test,...rest) {
    if(!this || typeof this!=="object" || !(this instanceof flexroute)) return new flexroute(test,...rest);
    if(test) this.push([toFunction(test),...rest]);
    return this;
};
flexroute.prototype = [];
flexroute.prototype.constructor = flexroute;
flexroute.prototype.fetch = async function(req,...rest) {
    const type = typeof req;
    if(!req || !["string","object"].includes(type)) throw new TypeError(`req must be a string or object not ${type}`);
    if(type === "string") req = new Request(req);
    else if(!["Request","PonyfillRequest"].includes(req.constructor.name)) req = new Request(req.url,req);
    if(!req.URL) req.URL = new URL(req.url);
    const routes = [...this];
    let res;
    for(const route of routes) {
        if(typeof route.fetch === "function") {
            const result = await route.fetch(req,...rest);
            if(result) {
                if(typeof result === "object" &&  result instanceof Response) {
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
            if(typeof result === "object" && result instanceof Response) {
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
                if(typeof result === "object" && result instanceof Response) {
                    res = result;
                    break;
                }
            }
            if(res) break;
        }
    }
    if(req.nativeResponse?.headersSent) return req.env.res;
    if(res) return res;
    const promises = [];
    if(this.io) {
        const {io} = this;
        io.emit("request",await responseOrRequestAsObject(req));
        promises.push(new Promise((resolve,reject) => {
            const to = setTimeout(() => reject(new Error("timeout")),5000);
            io.once(`response:${req.url}`,async (res) => {
                clearTimeout(to);
                res = JSON.parse(res);
                const body = res.body;
                delete res.body;
                resolve(new Response(body,res));
            });
        }).catch((e) => console.log(e)));
    }
    if(this.remote) {
        const {remote} = this;
        promises.push(fetch(req).catch((e) => console.log(e)));
    }
    if(promises.length>0) {
        return Promise.race(promises);
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
    withSockets(io) {
        if(!io || typeof io!=="object") throw new TypeError("io must be a socket instance");
        this.io = io;
        return this;
    },
    withRemote(remote) {
        this.remote = remote;
        return this;
    }
})

export {flexroute,flexroute as default}




