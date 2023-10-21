async function usehighlight({attribute,options,lazui}) {
    const base = new URL(attribute.value,lazui.url),
        css = options.style ? await fetch(base.href + options.style).then((response) => response.text()) : null;
    await import(attribute.value).then(({default:highlight}) => {
        lazui.useHighlight(highlight,css);
    })
}

export {usehighlight};