/**
 * Computes monthly expenditure per taxi company and per currency
 */
module.exports = function(got) {
    const inData = got['in'];
    const query = got['query'];
    
    console.log('MONTH: reducing...: ', query);
    var companiesTot = {};
    for(var d of inData.data) {
        console.log('MONTH: key: ', d.key);
        console.log('MONTH: value', d.value);
        var val = JSON.parse(d.value);
        if(companiesTot[val.company]) {
            if(companiesTot[val.company][val.currency]) {
                companiesTot[val.company][val.currency] += parseFloat(val.total);
            }
            else {
                companiesTot[val.company][val.currency] = parseFloat(val.total);
            }
        }
        else {
            companiesTot[val.company] = {};
            companiesTot[val.company][val.currency] = parseFloat(val.total);
        }
    }
    var currenciesTotal = {};
    for(var comp in companiesTot) {
        for(var curr in companiesTot[comp]) {
            if(currenciesTotal[curr]) {
                currenciesTotal[curr] += companiesTot[comp][curr];
            }
            else {
                currenciesTotal[curr] = companiesTot[comp][curr];
            }
        }
    }
    var res = [];
    res.push({name: 'month', key: query[0], value: {currencies: currenciesTotal, companies: companiesTot} });
    console.log('MONTH: result: ', res);
    return res;
};
