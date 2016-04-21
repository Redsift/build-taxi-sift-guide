/** 
 * Maps the relevant fields from a taxi receipt and emits a YYYYMMDD/msgId key/value pair
 */
var S = require('string');

const TaxiRegExp = {
    TOTAL: /(Total|Price)[:]?\D*(\d*\.\d*)/i
};

const CurrencyRegExp = {
    POUND: /£/,
    DOLLAR: /\$/,
    EURO: /€/
};

const HTMLRegExp = {
    CLEANUP: /(\r\n|\n|\r)/gm,
    POUND: /\&pound\;/i,
    EURO: /\&euro\;/i
};

// Converts a Date into YYYY<s>MM<s>DD format
function yyyymmdd(d, separator) {
    var yyyy = d.getFullYear().toString();
    var mm = (d.getMonth() + 1).toString();
    var dd = d.getDate().toString();
    return yyyy + separator + (mm[1] ? mm : '0' + mm[0]) + separator + (dd[1] ? dd : '0' + dd[0]);
}

// Entry point for DAG node
module.exports = function(got) {
  const inData = got['in'];
  const withData = got['with'];
  
  console.log('MAP: mapping...');
  console.log('MAP: withData...', withData);
  var ret = [];
  for(var d of inData.data) {
    console.log('MAP: key: ', d.key);
    if(d.value) {
      try {
          var msg = JSON.parse(d.value);
          console.log('MAP: msg.ID: ', msg.id);

          var tot = TaxiRegExp.TOTAL.exec(msg.preview);
          if(!tot) {
              const msgBody = msg.textBody || msg.htmlBody;
              const sBody = S(msgBody).stripTags().s.replace(HTMLRegExp.CLEANUP, '');
              // Try once again using the mssage body in case info not in preview
              tot = TaxiRegExp.TOTAL.exec(sBody);
          }
          
          // If found total and managed to extract value from it
          if(tot && tot.length === 3) {
            var currency = 'USD';
            if (CurrencyRegExp.POUND.test(tot[0]) || HTMLRegExp.POUND.test(tot[0])) {
                currency = 'GBP';
            } else if (CurrencyRegExp.EURO.test(tot[0]) || HTMLRegExp.EURO.test(tot[0])) {
                currency = 'EUR';
            }
            var val = tot[2];
            
            var company = msg.from.name.toLowerCase();
            if(company.indexOf('hailo') !== -1) {
                company = 'Hailo';
            } else if (company.indexOf('uber') !== -1) {
                company = 'Uber';
            } else if (company.indexOf('addison lee') !== -1) {
                company = 'AddisonLee';
            } 
            
            var date = new Date(msg.date);
            ret.push({
                name: 'receipts', 
                key:  yyyymmdd(date, '-') + '/' + msg.id, 
                value: {
                    currency: currency, 
                    total: val, 
                    company: company, 
                    msgId: msg.id, 
                    threadId: msg.threadId, 
                    date: date
                }
            });

            ret.push({
                name: 'msgDataWithIds', 
                key:  d.key, 
                value: {
                  currency: currency, 
                  company: company, 
                  msgId: msg.id, 
                  date: date
              }
            });
          }
      }catch (ex){
          console.error('MAP: Error parsing value for: ', d.key);
          console.error('MAP: Exception: ', ex);
          continue;
      }
    } 
    else {
      console.log('MAP: got a deletion: ', d.key);
      const wd = withData.data[0];
      if(wd) {
        var wval = JSON.parse(wd.value);
        wval.total = 0.0;
        // Emit a zero value receipt for that message
        ret.push({name: 'receipts', key:  yyyymmdd(new Date(wval.date), '-') + '/' + wval.msgId, value: wval});
      }
      else {
        console.error('MAP: got deletion for a message that was never mapped: ', d.key);
      }
    }
  }
  console.log('MAP: mapped: ', ret);
  return ret;
};
