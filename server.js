const MODE = "development"; //production, development
import JSON5 from 'json5';
import { createServerAdapter } from '@whatwg-node/server'
import { createServer } from 'http'
import { error, json, html, text, jpeg, png, webp, Router } from 'itty-router'
import {Server as socketIO} from "socket.io";
import {default as MarkdownIt} from "markdown-it";
import {default as MarkdownItAnchor} from "markdown-it-anchor";
import {default as MarkdownItDeflist} from "markdown-it-deflist";
import {promises as fs} from "fs";
import * as process from "node:process";
import * as path from "node:path"
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
}).use(MarkdownItAnchor,{
    slugify(s) {
        return encodeURIComponent(String(s).trim().toLowerCase().replace(/[\s+,:+,\=+,/]/g, '-').replace(/'/g, ''))
    }
}).use(MarkdownItDeflist);

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
async function sendFile(pathname,{mangle=true}={}) {
    //console.log(pathname);
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
            response = new Response(typeof data === "string" ? compress(Buffer.from(data)) : toArrayBuffer(data),{headers});
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
        return sendFile(path.join(process.cwd(),filePath));
    }
}

const app = Router();
app.all("*", (req) => {
    req.URL = new URL(req.url);
    if(!req.url.includes("datetime")) console.log(req.method,req.url)
});

/*
app.get("/lazui.js", (c) => {//"application/javascript
    return sendFile(process.cwd() + '/lazui.js');
});
 */

app.get("/lazui", (req) => {
    return sendFile(process.cwd() + "/lazui.js");
})

app.get("/lazui/*", (req) => {
    const pathname = req.URL.pathname.replace("/lazui",""),
        fname = pathname.split("/").pop().split(".").shift();
    return sendFile(process.cwd() + pathname,{mangle: {reserved:[fname]}});
})

// as a convenience, provide local copies of itty and Hono for browser use
app.get("/itty-router.js", (req) => {
    return sendFile(process.cwd() + '/node_modules/itty-router/index.mjs');
});
app.get("/hono/*", (req) => {
    return sendFile(process.cwd() + '/node_modules/hono/dist' + req.URL.pathname.slice(5));
});

// as a convenience, provide JSON5 for browser use
app.get("/json5.js", (req) => {
    return sendFile(process.cwd() + '/node_modules/json5/dist/index.min.mjs');
});

// as a convenience, provide highlight-js for browser use
app.get('/highlight-js/*', (req) => {
    return sendFile(process.cwd() + req.URL.pathname);
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

app.post('/reflectbody', async (req) => {
    return new Response(await req.text(),{status:200});
})
app.get("*", async (req) => {
    if(req.URL.pathname==="/") req.URL.pathname = "/index.md";
    if(req.URL.pathname.endsWith(".md")) { // handle Markdown transpilation
        try {
            const data = await fs.readFile(process.cwd() + req.URL.pathname),
                markedDown = `<html><head></head><body>${md.render(data.toString())}</body></html>`
            const markedDOM = parse(markedDown),
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
            return html(compress(Buffer.from(`<!DOCTYPE html>${markedDOM}`)),{headers:{"content-encoding":"br"}});
        } catch(e) {
            console.log(e);
            throw e;
        }
   } else {
        return sendFile(path.join(process.cwd(),req.URL.pathname));
    }
})
app.get('*', () => error(404));

const CSP = {
    "default-src": [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://lazui.org",
        "https://www.gstatic.com",
        "https://img.shields.io",
        "https://github.com",
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

const io = new socketIO(httpServer);
io.on('connection', (socket) => {
    //console.log('a user connected');
    socket.on('disconnect', () => {
        //console.log('user disconnected');
    });
    socket.onAny((event,msg) => {
        console.log(event,msg);
        if(["connection","disconnect"].includes(event)) return;
        io.emit(event, msg);
    });
});