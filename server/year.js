/**
 * Computes yearly expenditure per taxi company and per currency
 */
module.exports = function(got) {
    const inData = got['in'];
    const query = got['query'];
    const year = query[1];
    console.log('YEAR: reducing...: ', query);
    var companiesTot = {};
    for(var d of inData.data) {
        console.log('YEAR: key: ', d.key);
        console.log('YEAR: value', d.value);
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
    var yearTot = {};
    for(var comp in companiesTot) {
        for(var curr in companiesTot[comp]) {
            if(yearTot[curr]) {
                yearTot[curr] += companiesTot[comp][curr];
            }
            else {
                yearTot[curr] = companiesTot[comp][curr];
            }
        }
    }
    var res = [];
    res.push({name: 'year', key: year, value: {currencies: yearTot, companies: companiesTot} });
    console.log('YEAR: result: ', res);
    return res;
};