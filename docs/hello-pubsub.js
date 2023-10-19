const intervals = new WeakMap();
const subscribe = (element,channel="*") => {
    if(!intervals.has(element)) {
        intervals.set(element,setInterval(() => {
            element.dispatchEvent(new CustomEvent("message",{detail:{channel,message:`${channel.slice(1)} the datetime is: ` + new Date().toLocaleTimeString()}}));
        },1000));
    }
};
const unsubscribe = (element,channel="*") => {
    clearInterval(intervals.get(element));
}
export {subscribe,unsubscribe}