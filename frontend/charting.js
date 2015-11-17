module.exports = function(){
  'use strict';
  include('moment.js');

  var publicFs = {};

  // Creates the required D3 table structure
  publicFs.createTable = function(keys, monthMap, companies) {
    // Now create the required table structure
    var table = [];
    keys.forEach(function(k) {
      var val = [];
      var mTot = 0.0;
      companies.forEach(function (c) {
          var receipt = monthMap[k][c];
          mTot += receipt;
          val.push(Math.round(receipt));
      });
      val.push(Math.round(mTot));
      table.push({key: k, value: val});
    });
    return table;
  };

  // Creates the required Dimple chart structure
  publicFs.createChart = function(keys, monthMap, companies) {
    var chart = [];
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      var company;
      for (var j = 0; j < companies.length; j += 1) {
          company = companies[j];
          chart.push({
            'Source': company,
            'Sum': monthMap[key][company],
            'Date': moment(key, 'YYYYMM').format('YYYY-MM')
          });
      }
    }
    return chart;
  };

  return publicFs;
};
