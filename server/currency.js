/**
 * Performs currency conversion on the taxi receipts to the user's preferred currency
 */
 'use strict';

var rp = require('request-promise');
var fx = require('money');

// Open Exchange Rates app id
var oxrAppId = null;
// TODO: this will be stored in user settings
var userCurrency = 'GBP';

// Entry point for DAG node
module.exports = function (got) {
    console.log('CURRENCY: converting...', got);

    // inData contains the key/value pairs that match the given query
    const inData = got['in'];
    // The query matched (array of elements based on the store's key and your selection criteria)
    const query = got['query'];
    // Joined information from your 'with' statement
    const withData = got['with'];
    var date = query[0];
    
    console.log('CURRENCY: withData.data', withData.data);
    
    // If a receipt is not in the user's currency and we don't have forex for that date
    if (conversionRequired(inData) && !withData.data[0]) {
        var url = 'http://openexchangerates.org/api/historical/' + query[0] + '.json?app_id=' + oxrAppId;
        console.log('CURRENCY: OXR Request: ', url);
        var prom = rp({ url: url, json: true }).then(function (response) {
            var ret = convertReceipts(inData.receipts, response);
            ret.push({ name: 'openexchangerates', key: date, value: response });
            return ret;
        }).catch(function (err) {
            console.error('CURRENCY: error getting OXR Response: ', err);
            return;
        });
        console.log('CURRENCY: promise: ', prom);
        return prom;
    }
    else {
        // If forex conversion is not required, set it to null
        var forex = null;
        if(withData.data[0]) {
            // If we now have forex data
            forex = JSON.parse(withData.data[0].value);
        }
        return convertReceipts(inData.receipts, forex);
    }
};

// Scans through all the receipts to see if any requires currency conversion
function conversionRequired(inData) {
    inData['receipts'] = [];
    var bRet = false;
    for (var m of inData.data) {
        // Since we're here, let's parse the receipts
        var receipt = JSON.parse(m.value);
        inData['receipts'].push(receipt);
        if (receipt.currency !== userCurrency) {
            bRet = true;
        }
    }
    return bRet;
}

// Performs forex conversion on a taxi receipt if required
function convertReceipts(receipts, forex) {
    var ret = [];
    for (var receipt of receipts) {
        console.log('CURRENCY: receipt: ', receipt);
        var convertedTotal = receipt.total;
        if (receipt.currency !== userCurrency) {
            console.log('CURRENCY: Conversion required from: ' + receipt.currency + ' to: ' + userCurrency);
            fx.rates = forex.rates;
            fx.base = forex.base;
            convertedTotal = fx(receipt.total).from(receipt.currency).to(userCurrency).toFixed(2);
        }
        var date = new Date(receipt.date);
        // Key format: YYYYMM/YYYY/msgId
        var key = yyyymm(date, '') + '/' + date.getFullYear().toString() + '/' + receipt.msgId;
        var convertedReceipt = { currency: userCurrency, total: convertedTotal, company: receipt.company };
        console.log('CURRENCY: emitting: key: ' + key + ' value: ' + convertedReceipt);
        // Stores the message in the _email.id store
        ret.push({ name: 'idList', key: receipt.msgId, value: {'list': convertedReceipt, 'detail': {} }});
        // Stores the message in the _email.tid store
        ret.push({ name: 'tidList', key: receipt.threadId, value: {'list': convertedReceipt, 'detail': {} } });
        // Emits a converted receipt
        ret.push({ name: 'convertedreceipts', key: key, value: convertedReceipt });
    }
    return ret;
}

// Converts a Date into YYYY<s>MM format
function yyyymm(d, separator) {
    var yyyy = d.getFullYear().toString();
    var mm = (d.getMonth() + 1).toString();
    return yyyy + separator + (mm[1] ? mm : '0' + mm[0]);
}
