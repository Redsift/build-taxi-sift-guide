# 6. Aggregating Results

Please edit your `sift.json` file to look like this:

`"dag": { "$ref":"./dag6.json" }`

## Month and Year Aggregation

This is the last step for our computational journey. After we mapped and generated all our receipts and converted them to the correct currency, now it's time to aggregate them to meaningful groups. We are going to perform two aggregations, one on a monthly and one on a yearly basis. That's why we are adding two new nodes to our DAG called the `Month reducer` and `Year reducer`.

### nodes

We added two aggregation nodes, each one with it's own implementation. The interesting part here is that although they are both taking data from the `convertedreceipts` store they are performing a different key operation. The data they get back are selected and grouped by the selected key.
For the key of every receipt inside `convertedreceipts` which has the following structure:
`YYYYMM/YYYY/emailID` e.g. `201508/2015/zOhSvJ8QSWbu3irGtywQJqjrioJ6Bqo5tr8ClYk6Z6-mqjEQ`
We perform the following key operations:

* month reducer selection: /\*/\* = YYYYMM (we select and group by the first bit and we don't care for the rest)
* year reducer selection: \*//\* = YYYY (we select and group by the middle bit and don't care for the bits before and after)

```
...,
{
  "#": "Month reducer",
  "implementation": {
    "node": "server/month.js"
  },
  "input": {
    "bucket": "convertedreceipts",
    "select": "/*/*"
  },
  "outputs": {
    "month": {}
  }
  },{
  "#": "Year reducer",
  "implementation": {
    "node": "server/year.js"
  },
  "input": {
    "bucket": "convertedreceipts",
    "select": "*//*"
  },
  "outputs": {
    "year": {}
  }
}
```

### outputs

We added the last outputs we are going to need.

```
"outputs":{
    "exports":{
      ...,
      "month": {
        "key$schema": "string"
      },
      "year": {
        "key$schema": "string"
      }
    }
  }
```

### implementations

* month: For each batch of grouped data, on a month basis, we receive we sum up all the receipts for each of the company and emit to the `month` store the total of all the companies for each month.

* year: The same process as with the month implementation, but all the operations are performed on a year basis.

## Full

**dag6.json**

**server/currency.js**