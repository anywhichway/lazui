const imports = {

}

const init = async ({el,root,lazui,options})=> {
    const {getState,observeNodes} = lazui;
    let {
        state,
        options,
        id = el.getAttribute("id"),
        name = el.getAttribute("name"),
        size = el.getAttribute("size"),
        multiple = el.hasAttribute("multiple"),
        required = el.hasAttribute("required"),
        disabled = el.hasAttribute("disabled"),
        optionsCaption,
        optionsText = "text",
        optionsValue = "value",
        value,
        property,
        idProperty,
        nameProperty,
        sizeProperty,
        multipleProperty,
        requiredProperty,
        disabledProperty,
    } = options;
    if (state) state = getState(state, {root, throws:true});
    observeNodes({nodes:[el],observe:["value"],root,state}, () => {
        if (typeof options === "string") options = state[options];
        if (optionsCaption) options.unshift(optionsCaption);
        if (value == null) value = state[property];
        if (!id && idProperty) id = state[idProperty];
        if (!name && nameProperty) name = state[nameProperty];
        if (!size && sizeProperty) size = state[sizeProperty];
        if (!multiple && multipleProperty) multiple = state[multipleProperty];
        if (!required && requiredProperty) required = state[requiredProperty];
        if (!disabled && disabledProperty) disabled = state[disabledProperty];
    })

    const existingOptions = [...el.options];
    for (const option of options) {
        const element = document.createElement("option");
        if (option && typeof option === "object") {
            element.value = option[optionsValue];
            element.innerText = option[optionsText] || el.value;
        } else {
            element.value = element.innerText = option;
        }
        if(!existingOptions.some((option) => option.value===el.value)) el.appendChild(element);
    }
    for (const element of el.querySelectorAll("option")) {
        if (element.value === value) element.selected = true;
    }
    Object.entries({id,name,size,value}).forEach(([key,value]) => {
        if(value && el.getAttribute(key)!==value) el.setAttribute(key,value);
    })
    Object.entries({required,disabled,multiple}).forEach(([key,value]) => {
        if(value && !el.hasAttribute(key)) el.setAttribute(key,"");
        else if(!value && el.hasAttribute(key)) el.removeAttribute(key);
    })
    if (multiple && !el.hasAttribute("multiple")) el.setAttribute("multiple", "");
    el.addEventListener("change", () => {
        state[property] = el.value;
    });
}

export {
    imports,
    init
}
