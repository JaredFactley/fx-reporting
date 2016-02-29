function addGraph(counter) {
	var graphCanvas = $('<div/>').attr({
		class: "ct-chart ct-perfect-fourth",
		id: "chart1"
	});
	$('#result-graph').append(graphCanvas);
	var chartData = getChartData();
	new Chartist.Line('#chart1', chartData);
}

function getChartData() {
	var dataObj = {
		labels: [1, 2, 3, 4, 5],
		series: [[100, 250, 366, 475, 599]]
	}
	return dataObj;
}

