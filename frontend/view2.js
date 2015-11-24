/**
 * Sift's View callbacks
 *
 * Copyright (c) 2015 Redsift Limited. All rights reserved.
 */

/* globals d3, dimple, Sift, console */

var _chart = null;

/**
 * View callbacks
 */
// Called by the framework when client/index.js calls the resolve function
Sift.View.presentView = function (value) {
  console.log('building-guide: presentView: ', value);
  if (value.chart) {
    _formatPresentationAxis(value.chart);
    _updateCompactView(value);
  }
};

/**
 * Called when a sift starts to transition between modes
*/
Sift.View.willPresentView = function (value) {
	console.log('building-guide: willPresentView: ', value);
};

/**
 * Views presentation (compact)
 */
function _updateCompactView(data) {
  if (_chart) {
    _updateTaxiChart(_chart, data.chart);
  }
  else {
    _chart = _createTaxiChart('#taxiChartContainer', data.chart);
  }
}


/**
 * Taxi chart creation and update
 */
function _formatPresentationAxis(_d) {
  var dateFormat = d3.time.format('%Y-%m');
  var displayFormat = d3.time.format('%b %y');
  for (var i = 0; i < _d.length; i++) {
    _d[i].Display = displayFormat(dateFormat.parse(_d[i].Date));
  }
}

function _createTaxiChart(container, data) {
	var svg = dimple.newSvg(container, '100%', 180);
	var chart = new dimple.chart(svg, data);
	chart.setMargins(0, 20, 0, 20);
	var xAxis = chart.addCategoryAxis('x', 'Display');
	xAxis.addGroupOrderRule('Date');
	xAxis.addOrderRule('Date');
	chart.addMeasureAxis('y', 'Sum');
	var s = chart.addSeries('Source', dimple.plot.bar);
	s.barGap = 0;
	s.lineWeight = 1;
	var legend = chart.addLegend(chart.x, 0, '100%', 20, 'left');
	legend.fontFamily = Sift.customFontFamily;
	chart.assignColor('Uber', '#1fbad6');
	chart.assignColor('AddisonLee', '#0000');
	chart.assignColor('Hailo', '#fb0');
	_updateTaxiChart(chart, data);
	return chart;
}

function _updateTaxiChart(chart, data) {
	chart.data = data;
	chart.draw(500);
	for (var i = 0; i < chart.axes.length; i++){
		chart.axes[i].titleShape.remove();
	}
}
