function _contentType() {
    // target does nothing, it is just used for data
}


const contentType = new Proxy(_contentType, {
    apply: function(target, thisArg, argumentsList) {
        return target.apply(thisArg, argumentsList);
    },
    get(target, prop, receiver) {
        if(prop === 'name') return 'content-type';
        return Reflect.get(target, prop, receiver);
    }
})

export {contentType};