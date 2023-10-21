function showsource({el,attribute,root,args,lazui}) {
    const {replaceBetween} = lazui,
        where = attribute.value ||= "beforeBegin",
        inline = args.includes("inline"),
        inner = args.includes("inner");
    el.removeAttribute(attribute.name);
    const html = args.includes("inner") ? el.innerHTML : el.outerHTML;
    let content = replaceBetween(replaceBetween(`${inline ? html.replaceAll(/\\n/g,"") : html}`,'"','"',(text) => text.replaceAll(/&quot;/g,'\"')),"`","`",(text) =>text.replaceAll(/&lt;/g,"<"))
    if(inner && content[0]==="\n") content = content.slice(1);
    const language = inner ? "html" : undefined,
        pre = document.createElement("pre"),
        code = document.createElement("code");
    code.innerHTML = content;
    pre.append(code);
    if(window.highlight) window.highlight(code,inner ? ["html"] : undefined);
    if(where==="beforeBegin") el.before(pre);
    else if(where==="afterEnd") el.after(pre)
    else root.querySelectorAll(where).forEach((el) => el.replaceChildren(pre));
}

export {showsource};