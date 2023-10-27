async function usehighlighter({attribute,options,lazui}) {
    const base = new URL(attribute.value,lazui.url),
        css = options.style ? await fetch(base.href + options.style).then((response) => response.text()) : null;
    await import(attribute.value).then(({default:highlight}) => {
        useHighlighter(highlight,css);
    })
}

const useHighlighter = (hljs,css) => {
    if(css) {
        const style = document.createElement("style");
        style.innerHTML = css;
        document.head.appendChild(style);
    }
    hljs.configure({ignoreUnescapedHTML:true});
    window.highlight = (target,languages) => {
        if(target.hasAttribute("data-highlighted")) {
            target.removeAttribute("data-highlighted");
        }
        let html = target.innerHTML;
        if(html.includes("`")) html = html.replaceAll(/`/g, "__BACKTICK__");
        const {value,language} = hljs.highlightAuto(html,languages);
        target.className += ` language-${language} hljs`;
        target.innerHTML = value.replaceAll(/__BACKTICK__/g, "`");
    }
    const els = [];
    for(const el of document.querySelectorAll("code")) {
        if (el.innerHTML.includes("`")) {
            el.innerHTML = el.innerHTML.replaceAll(/`/g, "__BACKTICK__");
            els.push(el);
        }
    }
    for(const el of document.querySelectorAll('[data-highlighted="yes"]')) {
        el.removeAttribute("data-highlighted");
    }
    hljs.highlightAll();
    for (const el of els) {
        if (el.innerHTML.includes("__BACKTICK__")) {
            for (const child of el.childNodes) {
                if (child.nodeType === Node.TEXT_NODE && child.data.includes("__BACKTICK__")) {
                    child.data = child.data.replaceAll(/__BACKTICK__/g, "`");
                }
            }
        }
    }
}

export {usehighlighter,useHighlighter};