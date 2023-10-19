const imports = {

}

let resolver;
window.chartsloaded ||= new Promise((resolve) => resolver = resolve);

const init = async ({el,root,state,lazui}, )=> {
    //const {src,target,subscribe=true,template} = options
    if(!document.head.querySelector(`script[src="https://www.gstatic.com/charts/loader.js"]`)) {
        const script = document.createElement("script");
        script.setAttribute("src","https://www.gstatic.com/charts/loader.js");
        document.head.appendChild(script);
        script.addEventListener("load",() => {
            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(() => resolver());
        });
    }
    await window.chartsloaded;
    function drawChart() {
        const data = new google.visualization.arrayToDataTable(state.data),
            url = new URL(import.meta.url),
            type = url.searchParams.get("type") || state.type;
        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization[type](el);
        chart.draw(data, state.options);
    }
    drawChart()
}

export {
    imports,
    init
}