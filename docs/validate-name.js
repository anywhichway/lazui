const imports = {
    "nameError": "#name-error"
}
function onchange(){
    let name = this.value;
    if(name.length < 5){
        this.nameError.innerHTML = "Name must be at least 5 characters long";
    }else{
        this.nameError.innerHTML = "";
    }
}

export {
    imports,
    onchange
}