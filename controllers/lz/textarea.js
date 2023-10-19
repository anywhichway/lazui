const imports = {

}

const init = async ({el},config)=> {
    let {
        state,
        value,
        placeholder = el.getAttribute("placeholder"),
        required = el.hasAttribute("required"),
        readonly = el.hasAttribute("readonly"),
        rows = el.getAttribute("rows"),
        cols = el.getAttribute("cols"),
        spellcheck = el.hasAttribute("spellcheck"),
        dirname = el.getAttribute("dirname"),
        disabled = el.hasAttribute("disabled"),
        maxlength = el.getAttribute("maxlength"),
        minlength = el.getAttribute("minlength"),
        requiredProperty,
        readonlyProperty,
        rowsProperty,
        colsProperty,
        dirnameProperty,
        disabledProperty,
        maxlengthProperty,
        minlengthProperty,
        trigger = "input",
        property = el.getAttribute("name")
    } = config;
    if (state) state = init.getState(state);
    if (value == null && property) value = state[property];
    if(!required && requiredProperty) required = state[requiredProperty];
    if(!readonly && readonlyProperty) readonly = state[readonlyProperty];
    if(!rows && rowsProperty) rows = state[rowsProperty];
    if(!cols && colsProperty) cols = state[colsProperty];
    if(!spellcheck && spellcheckProperty) spellcheck = state[spellcheckProperty];
    if(!dirname && dirnameProperty) dirname = state[dirnameProperty];
    if(!disabled && disabledProperty) disabled = state[disabledProperty];
    if(!maxlength && maxlengthProperty) maxlength = state[maxlengthProperty];
    if(!minlength && minlengthProperty) minlength = state[minlengthProperty];
    Object.entries({placeholder,rows,cols,dirname,maxlength,minlength,spellcheck}).forEach(([key,value]) => {
        if(value && el.getAttribute(key)!==value) el.setAttribute(key,value);
    })
    Object.entries({required,disabled}).forEach(([key,value]) => {
        if(value && !el.hasAttribute(key)) el.setAttribute(key,"");
        else if(!value && el.hasAttribute(key)) el.removeAttribute(key);
    })
    if(value!=null && el.innerText!==value) {
        el.innerText = value
    }
    el.addEventListener(trigger, () => {
        state[property] = el.innerText;
    });
}

export {
    imports,
    init
}