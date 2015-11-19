/**
 * Sift's View callbacks
 *
 * Copyright (c) 2015 Redsift Limited. All rights reserved.
 */

/* globals d3, dimple, Sift, console */

// Stores the currently displayed data so view can be reflown during transitions
var _currentData = {};

/**
 * View callbacks
 */
Sift.View.presentView = function (value) {
    console.log('building-guide: presentView: ', value);
    if (value.chart) {
        _formatPresentationAxis(value.chart);
        _currentData.chart = value.chart;
    }
    if (value.table) {
        _currentData.table = value.table;
    }
    if (_currentData.chart) {
        if (value.sizeClass.height === 'full') {
            _updateFullView(_currentData);
        }
        else {
            _updateCompactView(_currentData);
        }
    }
};


Sift.View.willPresentView = function (value) {
    console.log('building-guide: willPresentView: ', value);
};

/**
 * Views presentation (full & compact)
 */
var _chart = null;
function _updateCompactView(data) {
    // TODO: table unecessarily hidden when this function is called from updateFullView
    d3.select('body').select('#taxiTableContainer').style('display', 'none');

    if (_chart == null) {
        _chart = _createTaxiChart('#taxiChartContainer', data.chart);
    }
    else {
        _updateTaxiChart(_chart, data.chart);
    }
}

function _updateFullView(data) {
    _updateCompactView(data);
    if (data.table) {
        // Update table
        _updateTable(data.table);
        // Once all done, make the table visible
        d3.select('body').select('#taxiTableContainer').style('display', 'block');
    }
}

/**
 * Taxi table creation and update
 */

// Extract data from a key-value object.
function _extractRowData(d) {
    var values = d.value.slice();
    var yearMonth = moment(d.key, 'YYYYMM');
    // Prepend the month initials
    values.unshift(yearMonth.format('MMM')[0]);
    // Prepend the year
    values.unshift('' + yearMonth.year());
    return values;
}


// UPDATE THE TABLE
function _updateTable(newData) {
    // Select the table element
    var table = d3.select('#taxiTableBody');
    var rows = table.selectAll('tr')
        .data(newData, function (d) { return d && d.key; });

    //////////////////////////////////////////
    // ROW UPDATE SELECTION
    // Update cells in existing rows.
    var cells = rows.selectAll('td').data(_extractRowData);

    cells.attr('class', 'update');

    // Cells enter selection
    cells.enter().append('td')
        .style('opacity', 0.0)
        .transition()
        .delay(900)
        .duration(500)
        .style('opacity', 1.0);

    cells.text(function(d){ return d; });

    // Cells exit selection
    cells.exit()
        .transition()
        .delay(200)
        .duration(500)
        .style('opacity', 0.0)
        .remove();

    //////////////////////////////////////////
    // ROW ENTER SELECTION
    // Add new rows
    var cellsInNewRows = rows.enter().append('tr')
        .selectAll('td')
        .data(_extractRowData);

    cellsInNewRows.enter().append('td')
        .style('opacity', 0.0)
        .transition()
        .delay(200)
        .duration(500)
        .style('opacity', 1.0);

    cellsInNewRows.text(function(d){ return d; });

    /////////////////////////////////////////
    // ROW EXIT SELECTION
    // Remove old rows
    rows.exit()
        .transition()
        .delay(200)
        .duration(500)
        .style('opacity', 0.0)
        .remove();
}

/**
 * Taxi chart creation and update
 */
function _formatPresentationAxis(_d) {
    var dateFormat = d3.time.format("%Y-%m");
    var displayFormat = d3.time.format("%b %y");
    for (var i = 0; i < _d.length; i++) {
        _d[i].Display = displayFormat(dateFormat.parse(_d[i].Date));
    }
}

function _createTaxiChart(container, data) {
    var svg = dimple.newSvg(container, '100%', 170);
    var chart = new dimple.chart(svg, data);
    chart.setMargins(chart.x, 20, 0, 20);
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
    for (var i = 0; i < chart.axes.length; i++) {
        chart.axes[i].titleShape.remove();
    }
}
