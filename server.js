const MODE = "development"; //"production

import { createServerAdapter } from '@whatwg-node/server'
import { createServer } from 'http'
import { error, json, html, text, jpeg, png, webp, Router } from 'itty-router'
import {Server as socketIO} from "socket.io";
import {default as MarkdownIt} from "markdown-it";
import {default as MarkdownItAnchor} from "markdown-it-anchor";
import {promises as fs} from "fs";
import * as process from "node:process";
import * as path from "node:path"
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
})
md.use(MarkdownItAnchor,{
    slugify(s) {
        return encodeURIComponent(String(s).trim().toLowerCase().replace(/[\s+,:+,\=+,/]/g, '-').replace(/'/g, ''))
    }
});
import { parse } from 'node-html-parser';
import { minify } from "terser";

function toArrayBuffer(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return arrayBuffer;
}


const contentTypes = {
    ".js": "application/javascript",
    ".cjs": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".md": "text/html",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".txt": "text/plain"
}
async function sendFile(pathname,{mangle=true}={}) {
    //console.log(pathname);
    const headers = {},
        options = {};
    try {
        Object.entries(contentTypes).forEach(([key,value]) => {
            if(pathname.endsWith(key)) {
                headers["content-type"] = value;
                if(value.includes("javascript")) options.encoding = "utf8";
            }
        });
        const data = await fs.readFile(pathname,options),
            response = new Response(typeof data === "string" ? (MODE==="production" ? (await minify(data,{mangle})).code : data) : toArrayBuffer(data),{headers});
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
});

/*
app.get("/lazui.js", (c) => {//"application/javascript
    return sendFile(process.cwd() + '/lazui.js');
});
 */

// prevent directive names from being mangled
app.get("/directives/*", (req) => {
    const fname = req.URL.pathname.split("/").pop().split(".").shift();
    return sendFile(process.cwd() + req.URL.pathname,{mangle: {reserved:[fname]}});
});

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
            [...(body.querySelectorAll('meta,link,title,script[src*="/lazui.js"]')||[])].forEach((el) => head.appendChild(el));
            // convert all links that specify a sever to external links
            if(req.URL.pathname!=="/README.md") [...(body.querySelectorAll('a[href^="http"]')||[])].forEach((el) => el.hasAttribute("target") || el.setAttribute("target","_blank"));
            if(!req.headers.has("Accept-Include")) //req.URL.pathname.endsWith("/lazui.md")
            {
                const head = markedDOM.querySelector("head");
                head.innerHTML += `<meta name="viewport" content="width=device-width, initial-scale=1" />
                        <meta charset="UTF-8">
                        <link rel="preconnect" href="https://esm.sh">
                        <link rel='stylesheet' href='/highlight-js/styles/default.css'>
                        <script src='/highlight-js/highlight.min.js'></script>
                        <script type="module">
                            hljs.configure({ignoreUnescapedHTML:true});
                                    const highlight = window.highlight = (target) => {
                                         for(const el of document.querySelectorAll("code")) {
                                            if((!target || el.closest(target.tagName)) && el.innerHTML.includes("\`")) {
                                        el.innerHTML = el.innerHTML.replaceAll(/\`/g, "__BACKTICK__");
                                    }
                                }
                                hljs.highlightAll();
                                for (const el of document.querySelectorAll("*")) {
                                    if ((!target || el.closest(target.tagName)) && el.innerHTML.includes("__BACKTICK__")) {
                                        for (const child of el.childNodes) {
                                            if (child.nodeType === Node.TEXT_NODE && child.data.includes("__BACKTICK__")) {
                                                child.data = child.data.replaceAll(/__BACKTICK__/g, "\'");
                                            }
                                        }
                                    }
                                }
                            }
                            highlight();
                        </script>`;
            }
            const response = html(`<!DOCTYPE html>${markedDOM}`);
                /*srcs = [...markedDOM.querySelectorAll("script[src]")].reduce((origins,el) =>  {
                    const src = el.getAttribute("src");
                    if(src.startsWith("http")) {
                        const url = new URL(src);
                        if(!origins.includes(url.origin)) origins.push(url.origin);
                    }
                    return origins;
                },["'sha256-hV/amTgKaqeJqgtj354GSG/NjspCsrQ9jUzigpgEGJc='","'sha256-FXcDLxqRQh4J/uxqh/XXTaJj/q03NxRUCxCdvKN9Bzc='"]).join(" ");
            if(srcs) response.headers.append("Content-Security-Policy","script-src " + srcs);*/
            return response;
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
        "https://www.gstatic.com",
        "https://img.shields.io",
        "https://github.com",
        "https://buttons.github.io"
    ],
    "object-src": [
        "'none'"
    ]
}



const ittyServer = createServerAdapter(
    (req, env) => app
        .handle(req, env.res)
        .then((response) => {
            if(!response.headersSent) {
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
        .catch(error)
)

// Then use it in any environment
const httpServer = createServer(ittyServer)
httpServer.listen(3000);

const io = new socketIO(httpServer);
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.onAny((event,msg) => {
        if(["connection","disconnect"].includes(event)) return;
        console.log(event,msg);
        io.emit(event, msg);
    });
});