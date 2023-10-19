async function usejson({attribute,lazui}) {
    await import(attribute.value).then(({default:json}) => {
        lazui.useJSON(json);
    })
}

export {usejson};