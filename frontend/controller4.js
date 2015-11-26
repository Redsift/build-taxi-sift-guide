/**
 * Frontend entry point
 *
 * Copyright (c) 2015 Redsift Limited. All rights reserved.
 */
'use strict';

/*globals include, Sift, console, moment*/

// DO NOT REMOVE: these includes are required by the mobile app.
include('redsift.js');
include('moment.js');


Sift.Controller.loadView = function (value, resolve, reject) {
  console.log('building-guide: loadView', value);
  var height = value.sizeClass.current.height;

  var ret = {
      data: {
          label: 'Taxi Sift'
      }
  };

  // Asynchronous return
  if (height === 'none') {
      loadTextView(resolve, reject);
  }
  else {
    ret.html = 'frontend/view4.html';
    ret.data = {};
    ret.data.sizeClass = value.sizeClass.current;
    if (height === 'compact') {
      loadCompactSummaryView(value.sizeClass.current, resolve, reject);
    }
    else if (height === 'full') {
      loadFullSummaryView(value.sizeClass.current, resolve, reject);
    }
  }

  // Synchronous return
  return ret;
};

// listen for changes in the `month` DB.
Sift.Storage.addUpdateListener('month', function (value) {
  console.log('building-guide: storage updated: ', value);
  var cKeys = getChartKeys();
  var tKeys = getTableKeys();
  Sift.Storage.get({
      bucket: 'month',
      keys: tKeys
  }).then(function (results) {
    var monthMap = createMonthMap(tKeys, results);
    var chart = createChart(cKeys, monthMap);
    var table = createTable(tKeys, monthMap);
    Sift.View.notify('newData', {chart: chart, table: table});
  });

});

/**
 * Local functions
 */
var _companies = ['AddisonLee', 'Hailo', 'Uber'];

// Chart will have the last 6 months
var chartKeys;
function getChartKeys() {
  if (chartKeys === undefined) {
    chartKeys = [];
    for (var i = 0; i < 6; i += 1) {
      chartKeys.push(moment().subtract(i, 'months').format('YYYYMM'));
    }
  }
  return chartKeys;
}

// Table will contain YTD + previous year
var tableKeys;
function getTableKeys() {
  if (tableKeys === undefined) {
    tableKeys = [];
    var ytdMonths = moment().month();
    for (var i = 0; i <= ytdMonths; i += 1) {
      tableKeys.push(moment().subtract(i, 'months').format('YYYYMM'));
    }
    var lastDecember = (moment().year() - 1) + '12';
    for (var j = 0; j < 12; j += 1) {
      tableKeys.push(moment(lastDecember, 'YYYYMM').subtract(j, 'months').format('YYYYMM'));
    }
  }
  return tableKeys;
}

// Creates the required D3 table structure
function createTable(keys, monthMap) {
  // Now create the required table structure
  var table = [];
  keys.forEach(function(k) {
    var val = [];
    var mTot = 0.0;
    _companies.forEach(function (c) {
      var receipt = monthMap[k][c];
      mTot += receipt;
      val.push(Math.round(receipt));
    });
    val.push(Math.round(mTot));
    table.push({key: k, value: val});
  });
  return table;
}

// Creates the required Dimple chart structure
function createChart(keys, monthMap) {
  var chart = [];
  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];
    var company;
    //  { 'Source': 'Hailo', 'Sum': 10, 'Date': '2014-11' },
    for (var j = 0; j < _companies.length; j += 1) {
      company = _companies[j];
      chart.push({ 'Source': company, 'Sum': monthMap[key][company], 'Date': moment(key, 'YYYYMM').format('YYYY-MM') });
    }
  }
  return chart;
}

// Populates the monthMap with the keys that are available
function createMonthMap(keys, results) {
  var monthMap = {};
  for(var i=0; i<keys.length; i++) {
    if(results[i].value) {
      var key = results[i].key;
      var value = JSON.parse(results[i].value);
      monthMap[key] = {};
      for (var j = 0; j < _companies.length; j += 1) {
        var company = _companies[j];
        if (company in value.companies) {
          monthMap[key][company] = value.companies[company].GBP;
        }
        else {
          // If specific company not in key, set value to zero
          monthMap[key][company] = 0;
        }
      }
    }
    else {
      monthMap[keys[i]] = {};
      for(var j=0; j<_companies.length; j++) {
        monthMap[keys[i]][_companies[j]] = 0;
      }
    }
  }
  return monthMap;
}

function loadTextView(resolve, reject) {
  console.log('building-guide: loadTextView');
  Sift.Storage.get(
    {
      bucket: 'year',
      keys: ['' + moment().year()]
    })
    .then(function (responses) {
      // There should only ever be 1 key
      if(responses && responses.length === 1) {
        var summary;
        if(responses[0].value) {
            var total = JSON.parse(responses[0].value);
            summary = 'Taxi: £' + total.currencies.GBP.toFixed(0) + ' in ' + moment().year();
        }
        else {
            summary = 'Taxi: £0 in ' + moment().year();
        }
        resolve({
            data: {
                label: summary
            }
        });
      }
    }, function (error) {
        console.error('building-guide: loadTextView: Storage.get failed: ', error);
        reject(error);
    });
}

function loadCompactSummaryView(sizeClass, resolve, reject) {
  console.log('building-guide: loadCompactSummaryView');
  // In the chart, we only show receipts in the last 6 months
  var cKeys = getChartKeys();
  Sift.Storage.get({
      bucket: 'month',
      keys: cKeys
    }).then(function (results) {
      var monthMap = createMonthMap(cKeys, results);
      var chart = createChart(cKeys, monthMap);
      resolve({html: 'frontend/view4.html', data: {sizeClass: sizeClass, chart: chart}});
    }, function (error) {
      console.error('building-guide: loadCompactSummaryView: Storage.get failed: ', error);
      reject(error);
    });
}

function loadFullSummaryView(sizeClass, resolve, reject) {
  console.log('building-guide: loadFullSummaryView');
  // In the full view, we show YTD receipts + last year
  var cKeys = getChartKeys();
  var tKeys = getTableKeys();
  Sift.Storage.get({
      bucket: 'month',
      keys: tKeys
    }).then(function (results) {
      var monthMap = createMonthMap(tKeys, results);
      var chart = createChart(cKeys, monthMap);
      var table = createTable(tKeys, monthMap);
      resolve({html: 'frontend/view4.html', data: {sizeClass: sizeClass, chart: chart, table: table}});
    }, function (error) {
      console.error('building-guide: loadFullSummaryView: Storage.get failed: ', error);
      reject(error);
    });
}
