let MODE = "development"; //production, development
import JSON5 from 'json5';
import {TextDecoder} from "util";
import { createServerAdapter } from '@whatwg-node/server'
import { createServer } from 'http'
import { error, json, html, text, jpeg, png, webp, Router } from 'itty-router'
import {Server as socketIO} from "socket.io";
import {App as uWS} from "uWebSockets.js";
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

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
async function sendFile(pathname,{mangle=true,skipCompress}={}) {
    const headers = {},
        options = {};
    try {
        Object.entries(contentTypes).forEach(([key, {encoding,type}]) => {
            if(pathname.endsWith(key)) {
                headers["content-type"] = type;
                if(encoding) options.encoding = encoding;
            }
        });
        if(options.encoding==="utf8") headers["content-encoding"] = "br";
        const content = await fs.readFile(pathname,options),
            data = MODE==="production" && headers["content-type"].includes("javascript") ? (await minify(content,{mangle})).code : content,
            response = new Response(typeof data === "string" ? (skipCompress ? data : compress(Buffer.from(data))) : toArrayBuffer(data),{headers});
        return response;
    } catch(e) {
        console.log(e)
        if(e.code==="ENOENT") return;
        return new Response(500, {body:e.code}); //pathname+" "+e+""
    }
}

const serveStatic = ({root}) => {
    return async (req) => {
        const url = new URL(req.url),
            filePath = `${root}${url.pathname}`;
        //console.log(filePath);
        return sendFile(path.join(process.cwd(),filePath),{skipCompress:req.skipCompress});
    }
}

const app = Router();
app.all("*", (req) => {
    req.URL = new URL(req.url);
    if(!["127.0.0.1","localhost"].includes(req.URL.hostname)) MODE = "production"
    if(!req.url.includes("datetime")) console.log(req.method,req.url)
});

/*
app.get("/lazui.js", (c) => {//"application/javascript
    return sendFile(process.cwd() + '/lazui.js');
});
 */

app.get("/lazui", (req) => {
    return sendFile(process.cwd() + "/lazui.js",{skipCompress:req.skipCompress});
})

app.get("/lazui/*", (req) => {
    const pathname = req.URL.pathname.replace("/lazui",""),
        fname = pathname.split("/").pop().split(".").shift();
    return sendFile(process.cwd() + pathname,{mangle: {reserved:[fname]},skipCompress:req.skipCompress});
})

// as a convenience, provide local copies of itty and Hono for browser use
app.get("/itty-router.js", (req) => {
    return sendFile(process.cwd() + '/node_modules/itty-router/index.mjs',{skipCompress:req.skipCompress});
});
app.get("/hono/*", (req) => {
    return sendFile(process.cwd() + '/node_modules/hono/dist' + req.URL.pathname.slice(5),{skipCompress:req.skipCompress});
});

// as a convenience, provide JSON5 for browser use
app.get("/json5.js", (req) => {
    return sendFile(process.cwd() + '/node_modules/json5/dist/index.min.mjs',{skipCompress:req.skipCompress});
});

// as a convenience, provide highlight-js for browser use
app.get('/highlight-js/*', (req) => {
    return sendFile(process.cwd() + req.URL.pathname,{skipCompress:req.skipCompress});
});



// middleware for producing server side event generators
const sse = (eventGenerator,clients=[]) => async (req,res) => {
    const entries = Object.entries({
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    }).forEach(([key,value]) => {
        res.setHeader(key,value)
    });
    // necessary because the whatwg server adapter does not know how to handle headers on a native response
    // and sse requires using a native response so we can keep it open and remove from client list when closed
    // so we act like there are no headers with respect to whatwg
    res.headers = new Headers();
    clients.push(res);
    eventGenerator(clients);
    res.on('close', () => {
        clients.splice(clients.findIndex((client) => client= res),1);
    });
    return res;
}

// a sample sse event generator that just writes the date/time to all clients every second
const dateTime = (clients) => {
    if(!dateTime.interval) {
        dateTime.interval = setInterval(() => {
            clients.forEach(res => res.write(`data: ${new Date()}\n\n`));
        },1000);
    }
    clients[clients.length-1].write(`data: ${new Date()}\n\n`);
}


app.get('/datetime',sse(dateTime));

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

app.get("*", async (req) => {
    if(req.URL.pathname==="/") req.URL.pathname = "/index.md";
    if(req.URL.pathname.endsWith(".md")) { // handle Markdown transpilation
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
            if(req.skipCompress) return html(`<!DOCTYPE html>${markedDOM}`);
            return html(compress(Buffer.from(`<!DOCTYPE html>${markedDOM}`)),{headers:{"content-encoding":"br"}});
        } catch(e) {
            console.log(e);
            throw e;
        }
   } else {
        return sendFile(path.join(process.cwd(),req.URL.pathname),{skipCompress:req.skipCompress});
    }
})
app.get('*', () => error(404));

const CSP = {
    "default-src": [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "ws://localhost:*",
        "wss://localhost:*",
        "ws://lazui.org:*",
        "wss://lazui.org:*",
        "http://lazui.org",
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



const ittyServer = createServerAdapter(
    (req, env) => app
        .handle(req, env.res)
        .then((response) => {
            if(!response?.headersSent && response?.headers) {
                const wsSrc = req.URL.origin.replace(req.URL.protocol,"ws:");
                if(!CSP["default-src"].includes(wsSrc)) CSP["default-src"].push(wsSrc);
                //return json(response); // do not remove, will get error if json not processed
                Object.entries(CSP).forEach(([csp,values]) => {
                    response.headers.append("Content-Security-Policy",[csp,...values].join(" "));
                });
                response.headers.append("Access-Control-Allow-Origin","*");
                //response.headers.append("Content-Security-Policy","object-src 'none'");
                //response.headers.append("Content-Security-Policy",`default-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://img.shields.io ${req.URL.origin.replace(req.URL.protocol,"ws:")}`);
            }
            return response;
        })
        .catch((err) => {
            console.log(err);
            error(err);
        })
)

// Then use it in any environment
const httpServer = createServer(ittyServer)
httpServer.listen(3000);

const responseOrRequestAsObject = async (value) => {
    if(typeof value === "string") value = new Request(value);
    else value = value.clone();
    const object = {};
    for(const key in value) {
        if(typeof value[key] === "function" || key==="signal") continue;
        if(key==="headers") {
            object.headers = {};
            value.headers.forEach((value,key)=> {
                object.headers[key] = value;
            });
        } else if(!key.startsWith("body")) {
            object[key] = value[key];
        }
    }
    if(!["GET","HEAD","DELETE"].includes(value.method)) object.body = await value.text();
    return object;
}

const encoder = new TextEncoder(),
    decoder = new TextDecoder();
uWS().ws("/*",{
    message: async (ws, message, isBinary) => {
        /* You can do app.publish('sensors/home/temperature', '22C') kind of pub/sub as well */
        const {url,...rest} = JSON5.parse(decoder.decode(message)),
            request = new Request(url,rest);
        request.skipCompress = true;
        const response = await ittyServer.fetch(request),
            string = JSON.stringify(await responseOrRequestAsObject(response));
        ws.send(encoder.encode(string))
        /* Here we echo the message back, using compression if available */
        //let ok = ws.send(message, isBinary, true);
    }
}).listen(3001, (listenSocket) => {
    if (listenSocket) {
        console.log('uWebSockets Listening to port ' + 3001);
    }
})

const io = new socketIO(httpServer);
io.on('connection', (socket) => {
    //console.log('a user connected');
    socket.on('disconnect', () => {
        //console.log('user disconnected');
    });
    socket.on('request', async (msg) => {
        const {url,...rest} = JSON.parse(msg),
            request = new Request(url,rest),
            response = await router.fetch(request);
        io.emit(`response:${url}`,await responseOrRequestAsObject(response))
    })
    socket.onAny((event,msg) => {
        console.log(event,msg);
        if(["connection","disconnect"].includes(event)) return;
        io.emit(event, msg);
    });
});