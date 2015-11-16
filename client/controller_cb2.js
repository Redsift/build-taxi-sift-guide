'use strict';

/*globals include, Sift, console, moment*/

include('redsift.js');
include('moment.js');

Sift.Controller.loadView = function (value, resolve, reject) {
  console.log('sift-taxi: loadView', value);
  var ret = {};
  ret.label = 'Taxi Sift';
  var height = value.sizeClass.current.height;
  if (height === 'none') {
    loadTextSummaryView(resolve, reject);
  }
  else {
    ret.html = 'client/index2.html';
    ret.data = {};
    ret.data.sizeClass = value.sizeClass.current;
    if (height === 'compact') {
      loadCompactSummaryView(value.sizeClass.current, resolve, reject);
    }
  }
  // Synchronous return
  return ret;
};

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

function loadTextSummaryView(sizeClass, resolve, reject) {
  console.log('sift-taxi: loadTextSummaryView');
  Sift.Storage.get({
        bucket: 'year',
        keys: ['' + moment().year()]
    })
    .then(function (responses) {
      // There should only ever be 1 key
      if(responses && responses.length === 1) {
          var summary;
          if(responses[0].value) {
              var total = JSON.parse(responses[0].value);
              summary = 'Taxi: £' + total.currency.GBP.toFixed(0) + ' in ' + moment().year();
          }
          else {
              summary = 'Taxi: £0 in ' + moment().year();
          }
          resolve({label: summary, data: {sizeClass: sizeClass}});
      }
    }, function (error) {
      console.error('sift-taxi: loadTextSummaryView: storage get failed: ', error);
      reject(error);
    });
}

function loadCompactSummaryView(sizeClass, resolve, reject) {
  console.log('sift-taxi: loadCompactSummaryView');
  // In the chart, we only show receipts in the last 6 months
  var cKeys = getChartKeys();
  Sift.Storage.get(
    {
      bucket: 'month',
      keys: cKeys
    }).then(function (results) {
      var monthMap = createMonthMap(cKeys, results);
      var chart = createChart(cKeys, monthMap);
      resolve({html: 'client/index2.html', label: 'Taxi Sift', data: {sizeClass: sizeClass, chart: chart}});
    }, function (error) {
      console.error('sift-taxi: loadCompactSummaryView: storage get failed: ', error);
      reject(error);
    });
}
