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
        if(html.includes("`")) html = html.replaceAll(/`/g, "_BACKTICK_");
        const {value,language} = hljs.highlightAuto(html,languages);
        target.className += ` language-${language} hljs`;
        target.innerHTML = value.replaceAll(/_BACKTICK_/g, "`");
    }
    for(const el of document.querySelectorAll("code")) {
        if (el.innerHTML.includes("`")) {
            el.innerHTML = el.innerHTML.replaceAll(/`/g, "_BACKTICK_");
        }
    }
    for(const el of document.querySelectorAll('[data-highlighted="yes"]')) {
        el.removeAttribute("data-highlighted");
    }
    hljs.highlightAll();
    for (const el of document.querySelectorAll("[class*='hljs']")) {
        if (el.innerHTML.includes("_BACKTICK_")) {
            for (const child of el.childNodes) {
                if (child.nodeType === Node.TEXT_NODE && child.data.includes("_BACKTICK_")) {
                    child.data = child.data.replaceAll(/_BACKTICK_/g, "`");
                }
            }
        }
    }
}

export {usehighlighter,useHighlighter};