const imports = {

}

let resolver;
window.chartsloaded ||= new Promise((resolve) => resolver = resolve);

const init = async ({el,root,state,options}, )=> {
    let script = document.head.querySelector(`script[src="https://www.gstatic.com/charts/loader.js"]`);
    if(!script) {
        script = document.createElement("script");
        script.setAttribute("src","https://www.gstatic.com/charts/loader.js");
        document.head.appendChild(script);
        script.addEventListener("load",() => {
            resolver();
        });
    }
    await window.chartsloaded;
    const packages = options.packages || [];
    google.charts.load('current', {'packages':['corechart',...packages]});
    google.charts.setOnLoadCallback(() => {
        function drawChart() {
            const data = new google.visualization.arrayToDataTable(state.data),
                type = options.type || state.type;
            // Instantiate and draw our chart, passing in some options.
            const chart = new google.visualization[type](el);

            google.visualization.events.addListener(chart,'ready', (event) => {
                if(type==="WordTree" && state.options?.wordtree?.format==="implicit") {
                    el.getLabel = (target) => {
                        const targets = [];
                        let label = "";
                        let txt = target;
                        while(txt.previousElementSibling.tagName.toLowerCase()==="text") {
                            txt = txt.previousElementSibling;
                        }
                        do {
                            targets.push(txt);
                            label += " " + txt.innerHTML;
                            txt = txt.nextElementSibling;
                        } while(txt.tagName.toLowerCase()==="text");
                        return {targets,label:label.trim()};
                    };
                    const rows = state.data.map((row) => row.join(" "));
                    for(const txt of el.querySelectorAll("text")) {
                        const {targets,label} = el.getLabel(txt),
                            leaf = rows.find((row) => row.endsWith(label));
                        if(leaf) txt.setAttribute("class","wordtree-leaf");
                    }
                }
                if(options.redirectEvents) {
                    for(const txt of el.querySelectorAll("text")) {
                        for(const key in txt) {
                            if(key.startsWith("on")) {
                                txt.addEventListener(key.slice(2),(event) => {
                                    const clone = new event.constructor(event.type,event);
                                    Object.defineProperty(clone,"target",{get() {return event.target}});
                                    event.stopImmediatePropagation();
                                    event.preventDefault();
                                    el.dispatchEvent(clone);
                                })
                            }
                        }
                    }
                }
            });
            chart.draw(data, state.options);
        }
        drawChart()
    });
}

export {
    imports,
    init
}