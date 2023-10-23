async function usejson({attribute,lazui}) {
    lazui.useJSON = useJSON;
    await import(attribute.value).then(({default:json}) => {
        lazui.useJSON(json);
    })
}

function useJSON(json) {
    this.JSON = json;
}

export {usejson,useJSON};