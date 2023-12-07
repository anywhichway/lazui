let MODE = "development"; //production, development
import JSON5 from 'json5';
//import { createServerAdapter } from '@whatwg-node/server'
import { createServer } from 'node:http'
import WebSocket, { WebSocketServer } from 'ws';
import {flexroute} from "flexroute";
import adapter from "flexroute/adapters/whatwg.js";
import createFlexServer from "flexroute/util/create-flex-server.js";
import {sse} from "flexroute/middleware/server/sse.js";
import {TextDecoder,TextEncoder} from "util";
import {default as MarkdownIt} from "markdown-it";
import {default as MarkdownItAnchor} from "markdown-it-anchor";
import {default as MarkdownItDeflist} from "markdown-it-deflist";
import {promises as fs} from "fs";
import * as process from "node:process";
import * as path from "node:path"
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false
}).use(MarkdownItAnchor,{
    slugify(s) {
        return encodeURIComponent(String(s).trim().toLowerCase().replace(/[\s+,:+,\=+,/]/g, '-').replace(/'/g, ''))
    }
}).use(MarkdownItDeflist);

import {examplify} from 'examplify';
import { parse } from 'node-html-parser';
import { minify } from "terser";
import brotli from './brotli.cjs';
const {compress} = brotli;

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(() => {
        resolve()
    }, ms));
}

function toArrayBuffer(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return arrayBuffer;
}


const contentTypes = {
    ".js": {encoding:"utf8",type:"application/javascript"},
    ".cjs": {encoding:"utf8",type:"application/javascript"},
    ".mjs": {encoding:"utf8",type:"application/javascript"},
    ".css": {encoding:"utf8",type:"text/css"},
    ".html": {encoding:"utf8",type:"text/html"},
    ".md": {encoding:"utf8",type:"text/html"},
    ".json": {encoding:"utf8",type:"application/json"},
    ".svg": {type:"image/svg+xml"},
    ".png": {type:"image/png"},
    ".jpg": {type:"image/jpeg"},
    ".jpeg": {type:"image/jpeg"},
    ".gif": {type:"image/gif"},
    ".ico": {type:"image/x-icon"},
    ".txt": {encoding:"utf8",type:"text/plain"}
}


const flexServer = createFlexServer(flexroute(),adapter);
flexServer.all(()=>true, (req) => {
    if(!["127.0.0.1","localhost"].includes(req.URL.hostname)) MODE = "production"
});

/*
app.get("/lazui.js", (c) => {//"application/javascript
    return sendFile(process.cwd() + '/lazui.js');
});
 */

flexServer.get("/lazui", (req) => {
    req.rawResponse.sendFile(process.cwd() + "/lazui.js");
    return req.rawResponse;
})

flexServer.get("/lazui/*", (req) => {
    const pathname = req.URL.pathname.replace("/lazui",""),
        fname = pathname.split("/").pop().split(".").shift();
    req.rawResponse.sendFile(process.cwd() + pathname,{mangle: {reserved:[fname]}});
    return req.rawResponse;
})

//router.get("/flexrouter.js", (req) => {
    //return sendFile(process.cwd() + '/flexrouter.js',{skipCompress:req.skipCompress});
//});

// as a convenience, provide local copies of itty and Hono for browser use
flexServer.get("/itty-router.js", (req) => {
    req.rawResponse.sendFile(process.cwd() + '/node_modules/itty-router/index.mjs');
    return req.rawResponse;
});
flexServer.get("/hono/*", (req) => {
    req.rawResponse.sendFile(process.cwd() + '/node_modules/hono/dist' + req.URL.pathname.slice(5));
    return req.rawResponse;
});

// as a convenience, provide JSON5 for browser use
flexServer.get("/json5.js", (req) => {
    req.rawResponse.sendFile(process.cwd() + '/node_modules/json5/dist/index.min.mjs');
    return req.rawResponse;
});

// as a convenience, provide highlight-js for browser use
flexServer.get('/highlight-js/*', (req) => {
    req.rawResponse.sendFile(process.cwd() + req.URL.pathname);
    return req.rawResponse;
});

// a sample sse event generator that just writes the date/time to all clients every second
const dateTime = function (req,res) {
    return setInterval(() => {
        res.send(`${new Date()}`);
    },1000);
}

flexServer.get('/datetime',sse(dateTime));

/*
### Meta Data and Data Versioning - not yet implemented

The below explanation assumes the data requests are being sent to a server based on the basic server included with `lazui`

In the above example you can see the line `state["^"].mtime = Date.now() + 2000`.

The special attribute `^` is used to store metadata about the state, e.g. who created it, access controls, timeouts, etc.
You can store anything you wish in this attribute. `lazui` focuses on `mtime` and `timeout`.

The `mtime` property is used to store the last modified time of the state. See algorithm below for how spoofing the server
and overwriting data is prevented.

`lazui` uses time based versioning where the server is the sole arbiter of the time to ensure the browser always has
the most recent copy of the data, even if it is being updated by multiple people. Here is the algorithm:

- If the request is a `delete`
  - retrieve the server copy of the data
  - If there is a copy
    - Set the `^.timeout to` the current server time (don't actually delete)
    - Respond with 200 and nothing
  - Else
    - Respond with 404
- If the request is a `get`
  - retrieve the server copy of the data
  - If there is a server copy
    - If a timeout value on the server copy is less than or equal to the server time
      - Respond with 404
    - Else
      - Respond with 200 and server copy
  - Else Respond with 404
- Otherwise, for `put` and `post`
  - If `timeout` from the browser copy is less than or equal to the current server time
    - delete the `^.timeout` on the browser copy
  - If the `mtime` received from the browser is greater than that on the server
    - wait until server time matches the `mtime` from the browser (prevents spoofing, penalizes requestor with delay)
  - If the `mtime` for an update is less than or equal to that on the server
    - retrieve the server copy of the data
    - set browser copy `mtime` to server current time
    - If there is no current server copy
      - create a server copy using the browser data
    - Else
      - update the server copy using the browser data
    - Respond with 200 and server copy

There are some security issues with the above, browser requests can completely overwrite data or make it look like it is
gone by making delete requests, but there are limits to what can be achieved without writing JavaScript.

If the above approaches do not suit your needs, see [Advanced Storage](#advanced-storage) for how to implement your own
storage engine or modify the Basic Server.

app.get('/data/:id.json', (req) => {
    const {id} = req.params;
    return sendFile(process.cwd() + "/data/" + id + ".json");
})
app.put('/data/:id.json', async (req) => {
    const {id} = req.params,
        text = await req.text(),
        newjson = JSON5.parse(text.replaceAll(/'^':/g,'"^":').replaceAll(/^:/g,'"^":'));
    let now = Date.now();
    console.log(newjson,now)
    if(newjson["^"].mtime>now) {
        // if client is trying to spoof the mtime, penalize client and wait until the mtime is now
        const sleeptime = newjson["^"].mtime - now;
        console.warn(`Client is trying to spoof mtime. Sleeping for ${sleeptime}ms`);
        await sleep(sleeptime);
    }
    newjson["^"].mtime = now = Date.now(); // update mtime
    let content;
    try {
        content = await fs.readFile(process.cwd() + "/data/" + id + ".json",{encoding:"utf8"});
    } catch {
        content = "{}"; // create an empty object if file does not exist
    }
    const json = JSON5.parse(content);
    json["^"] ||= {};
    json["^"].mtime ||= now-1; // set mtime to now-1 if it does not exist
    if(newjson["^"].mtime>json["^"].mtime) {
        // update content only if client has the same or more recent mtime
        await fs.writeFile(process.cwd() + "/data/" + id + ".json",JSON.stringify(newjson),{encoding:"utf8"});
    }
    return sendFile(process.cwd() + "/data/" + id + ".json");
})
app.delete('/data/%id.json', async (req) => {
    const {id} = req.params;
    await fs.unlink(process.cwd() + "/data/" + id + ".json");
    return new Response("ok",{status:200});
})
 */

flexServer.get(()=>true, async (req) => {
    if(req.URL.pathname==="/") req.URL.pathname = "/index.md";
    if(req.URL.pathname.endsWith(".md")) { // handle Markdown transpilation
        //console.log("MD",req.URL.pathname);
        try {
            const data = await fs.readFile(process.cwd() + req.URL.pathname),
                replacementCallback = (text) => {
                    text = text.replace("```!html","").replace("```","");
                    return "```html" + text + "```\n" + text;
                },
                //string = replaceBetween(data.toString(),"```!html","```",replacementCallback,true),
                string = examplify(data.toString()),
                markedDown = `<html><head></head><body>${md.render(string)}</body></html>`,
                markedDOM = parse(markedDown),
                head = markedDOM.querySelector("head"),
                body = markedDOM.querySelector("body");
            // move meta, link, title tags to head (leave style and template in body)
            [...(body.querySelectorAll('meta,link,title,script[src*="/lazui"]')||[])].forEach((el) => head.appendChild(el));
            // convert all links that specify a server to external links
            if(req.URL.pathname!=="/README.md") [...(body.querySelectorAll('a[href^="http"]')||[])].forEach((el) => el.hasAttribute("target") || el.setAttribute("target","_blank"));
            if(!req.headers.has("Accept-Include")) //req.URL.pathname.endsWith("/lazui.md")
            {
                const head = markedDOM.querySelector("head");
                head.innerHTML += `<meta name="viewport" content="width=device-width, initial-scale=1" />
                        <meta charset="UTF-8">
                        <link rel="preconnect" href="https://esm.sh">`;
            }
            //if(req.skipCompress) return html(`<!DOCTYPE html>${markedDOM}`);
            //return new Response(compress(`<!DOCTYPE html>${markedDOM}`),{headers:{"content-encoding":"br"}});
            return new Response(`<!DOCTYPE html>${markedDOM}`,{headers:{"content-type":"text/html"}});
        } catch(e) {
            console.log(e);
            throw e;
        }
   } else {
        const [_1,...path] = req.URL.pathname.split("/");
        if(path[0]!=="docs" && path.length>1) path.shift();
        req.rawResponse.sendFile(process.cwd() + "/" + path.join("/"),{skipCompress:req.skipCompress});
        return req.rawResponse;
    }
})
flexServer.get(()=>true, () => new Response("Not Found",{status:404}));

const CSP = {
    "default-src": [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "ws://localhost",
        "wss://localhost",
        "ws://lazui.org",
        "wss://lazui.org",
        "https://lazui.org",
        "https://www.gstatic.com",
        "https://img.shields.io",
        "https://*.github.com",
        "https://buttons.github.io",
        "https://www.unpkg.com",
        "https://esm.sh"
    ],
    "object-src": [
        "'none'"
    ]
}



/*const headerProxy = (headers,nodeResponse) => {
    const _headers = {};
    for(let i =0;i<headers.length;i=i+2) {
        _headers[headers[i]] = headers[i+1];
    }
    headers = new Headers(_headers);
    if(!nodeResponse) return headers;
    return new Proxy(headers,{
        get(target,prop) {
            if(prop==="set") {
                return (key,value) => {
                    nodeResponse.setHeader(key,value);
                    target.set(key,value)
                }
            }
            if(prop==="append") {
                return (key,value) => {
                    nodeResponse.setHeader(key,nodeResponse.getHeader(key)||"" + "," + value);
                    target.append(key,value)
                }
            }
            return target[prop];
        }
    })
}
const responseProxy = (nodeResponse) => {
    const res = new Response(null,{headers:nodeResponse ? nodeResponse.headers : {}});
    if(!nodeResponse) return res;
    return new Proxy(res,{
        get(target,prop) {
            if(prop==="write") {
                return (value) => {
                    if(typeof value === "string") {
                        nodeResponse.write(value);
                    } else {
                        nodeResponse.write(JSON.stringify(value));
                    }
                }
            }
            if(prop==="end") {
                return () => {
                    nodeResponse.end();
                }
            }
            if(prop==="headers") {
                return headerProxy(target.headers,nodeResponse);
            }
            if(prop==="on") {
                return nodeResponse?.on
            }
            return target[prop];
        },
        set(target,prop,value) {
            if(prop==="status") {
                target[prop] = value;
                nodeResponse.statusCode = value;
            } else {
                target[prop] = value;
            }
            return true;
        }
    })
}*/

const port = 10000,
    host = process.env.HOST || "localhost";
const httpServer = createServer(flexServer);
flexServer.withSockets(httpServer,{host,port});

import stream from "flexroute/util/stream-response.js";
httpServer.listen(port,host,port, async () => {
    console.log(`http server listening on port ${port}`);
    //const response = await fetch(`http://${host}:${port}/datetime`);
    //stream.call(response,console.log);
});

/*const encoder = new TextEncoder(),
    decoder = new TextDecoder(),
    wss = new WebSocketServer({server:httpServer});
wss.on("connection", (ws) => {
    ws.on("error",console.error);
    ws.on("message", async (message) => {
        const decoded = decoder.decode(message),
            {url, topic, ...rest} = JSON.parse(decoded);
        if (url) {
            const request = new Request(url, rest);
            Object.defineProperty(request, "rawResponse", {enumerable: false, value: ws});
            request.skipCompress = true;
            const response = await flexServer.handle(request),
                object = await responseOrRequestAsObject(response);
            object.url = url;
            const string = JSON.stringify(object);
            //console.log(url,string);
            ws.send(encoder.encode(string))
        } else {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(decoded);
                }
            });
        }
    })
})*/