'use strict';

/*globals include, Sift, console, moment*/

include('redsift.js');
include('moment.js');

Sift.Controller.loadView = function (value, resolve, reject) {
  console.log('building-guide: loadView', value);
  var height = value.sizeClass.current.height;

  var ret = {
    label: 'Taxi Sift',
    html: 'frontend/view2.html',
    data: {}
  };

  // Asynchronous return
  if (height === 'compact') {
    loadCompactSummaryView(value.sizeClass.current, resolve, reject);
  }

  // Synchronous return
  return ret;
};

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
      resolve({html: 'frontend/view2.html', label: 'Taxi Sift', data: {sizeClass: sizeClass, chart: chart}});
    }, function (error) {
      console.error('building-guide: loadCompactSummaryView: Storage.get failed: ', error);
      reject(error);
    });
}

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


// Creates the required Dimple chart structure
function createChart(keys, monthMap) {
  var chart = [];
  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i], company;
    for (var j = 0; j < _companies.length; j += 1) {
      company = _companies[j];
      chart.push({
          'Source': company,
          'Sum': monthMap[key][company],
          'Date': moment(key, 'YYYYMM').format('YYYY-MM')
      });
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
