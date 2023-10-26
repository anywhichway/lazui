/* NOT yet supported */

const imports = {

}

const init = async ({el,root,lazui,options})=> {
    let {
        state,
        value,
        pattern,
        id = el.getAttribute("id"),
        form = el.getAttribute("form"),
        name = el.getAttribute("name"),
        size = el.getAttribute("size"),
        width = el.getAttribute("width"),
        src = el.getAttribute("src"),
        alt = el.getAttribute("alt"),
        accept = el.getAttribute("accept"),
        placeholder = el.getAttribute("placeholder"),
        spellcheck = el.hasAttribute("spellcheck"),
        autocomplete = el.getAttribute("autocomplete"),
        inputmode = el.getAttribute("inputmode"),
        min = el.getAttribute("min"),
        max = el.getAttribute("max"),
        minlength = el.getAttribute("minlength"),
        maxlength = el.getAttribute("maxlength"),
        step = el.getAttribute("step"),
        multiple = el.hasAttribute("multiple"),
        required = el.hasAttribute("required"),
        disabled = el.hasAttribute("disabled"),
        readonly = el.hasAttribute("readonly"),
        checked = el.hasAttribute("checked"),
        dirname = el.getAttribute("dirname"),
        defaultValue = el.getAttribute("default"),
        title = el.getAttribute("title"),
        type = el.getAttribute("type"),
        typeProperty = (value) => typeof value,
        idProperty,
        formProperty,
        nameProperty,
        sizeProperty,
        widthProperty,
        srcProperty,
        altProperty,
        acceptProperty,
        defaultValueProperty,
        patternProperty,
        placeholderProperty,
        spellcheckProperty,
        autocompleteProperty,
        inputmodeProperty,
        minProperty,
        maxProperty,
        minlengthProperty,
        maxlengthProperty,
        stepProperty,
        multipleProperty,
        requiredProperty,
        disabledProperty,
        readonlyProperty,
        checkedProperty,
        dirnameProperty,
        titleProperty,
        trigger = "input",
        property = el.getAttribute("name")
    } = options;
    if (state) state = lazui.getState(state,{root,throws:true});
    if (value == null && property) value = state[property];
    if(!value && defaultValueProperty) value = state[defaultValueProperty];
    if(!defaultValue && defaultValueProperty) defaultValue = state[defaultValueProperty];
    if(!pattern && patternProperty) pattern = state[patternProperty];
    if(!id && idProperty) id = state[idProperty];
    if(!form && formProperty) form = state[formProperty];
    if(!name && nameProperty) name = state[nameProperty];
    if(!size && sizeProperty) size = state[sizeProperty];
    if(!width && widthProperty) width = state[widthProperty];
    if(!src && srcProperty) src = state[srcProperty];
    if(!alt && altProperty) alt = state[altProperty];
    if(!accept && acceptProperty) accept = state[acceptProperty];
    if(!placeholder && placeholderProperty) placeholder = state[placeholderProperty];
    if(!autocomplete && autocompleteProperty) autocomplete = state[autocompleteProperty];
    if(!inputmode && inputmodeProperty) inputmode = state[inputmodeProperty];
    if(!spellcheck && spellcheckProperty) spellcheck = state[spellcheckProperty];
    if(!min && minProperty) min = state[minProperty];
    if(!max && maxProperty) max = state[maxProperty];
    if(!minlength && minlengthProperty) minlength = state[minlengthProperty];
    if(!maxlength && maxlengthProperty) maxlength = state[maxlengthProperty];
    if(!step && stepProperty) step = state[stepProperty];
    if(!multiple && multipleProperty) multiple = state[multipleProperty];
    if(!required && requiredProperty) required = state[requiredProperty];
    if(!checked && checkedProperty) checked = state[checkedProperty];
    if(!dirname && dirnameProperty) dirname = state[dirnameProperty];
    if(!disabled && disabledProperty) disabled = state[disabledProperty];
    if(!readonly && readonlyProperty) readonly = state[readonlyProperty];
    if(!type && typeProperty) {
        if(typeof typeProperty === "function") {
            const primitiveType = typeProperty(value);
            if(primitiveType==="number") type = "number";
            else if(primitiveType==="string") type = "text";
            else if(primitiveType==="boolean") type = "checkbox";
            else if(primitiveType==="object" && value instanceof Date) type = "datetime-local";
        } else {
            type = state[typeProperty];
        }
    }
    Object.entries({id,form,name,size,width,src,alt,accept,pattern,placeholder,spellcheck,autocomplete,inputmode,min,max,minlength,maxlength,dirname,step,title,type,value}).forEach(([key,value]) => {
        if(value && el.getAttribute(key)!==value) el.setAttribute(key,value);
    })
    Object.entries({required,checked,disabled,readonly,multiple}).forEach(([key,value]) => {
        if(value && !el.hasAttribute(key)) el.setAttribute(key,"");
        else if(!value && el.hasAttribute(key)) el.removeAttribute(key);
    })
    if(defaultValue && el.getAttribute("default")!==defaultValue) el.setAttribute("default",defaultValue);
    el.addEventListener(trigger, () => {
        if(type==="checkbox") state[property] = el.checked;
        else if(type==="datetime-local") state[property] = new Date(el.value);
        else if(type==="number" || type==="range") state[property] = parseFloat(el.value);
        else state[property] = el.value;
    });
}

export {
    imports,
    init
}