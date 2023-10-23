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
            var chart = new google.visualization[type](el);
            chart.draw(data, state.options);
        }
        drawChart()
    });
}

export {
    imports,
    init
}