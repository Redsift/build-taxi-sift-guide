# 7. Visualise Data

In this step we are going to add our first visualisation.

First, please edit you `sift.json` file to look like this:

`"controller": { "entry-point": "frontend/controller2.js", ... }`

## Loading a view and adding data.

For our first visualisation we are going to pump our data into a chart. We are not going to go into the specifics of how the chart is created. Just that we manipulate data in `frontend/controller2.js` 
and that `frontend/view2.js` uses the data to manipulate the DOM elements inside `frontend/view2.html`. Also we are only going to work with the `compact` layout and not be concerned with anything else.

### Controller

With that said, I would like to bring your attention to the top part of the `frontend/controller2.js` which looks like this:

```javascript

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
```

The `loadView()` callback will be called from the framework every time the Sift loads or new data have been added to the Sift's storage. This callback supports both a _synchronous_ and an _asynchronous_ return type and both need to return an object that has a similar structure to the `ret` object we are constructing here. We supply the path to the `html` file we want to load, a `label` which you can think of as a page title and data for a frontend code to work its magic.

The _synchronous_ return gives the opportunity to the Sift developer to present some data or a spinner like screen to the Sift user, while data are being loaded for the view.

Now that we are hypnotising the Sift user with our awesome spinner the `loadCompactSummaryView()` handler we implemented is running in the background, querying for the data we want and then it will either `resolve` or `reject` following the Promise paradigm. Below you can see the implementation of the handler and how it makes a request to the [Storage](https://docs.redsift.io/docs#storage-api) API for data.

```javascript
function loadCompactSummaryView(sizeClass, resolve, reject) {
  // In the chart, we only show receipts of the last 6 months
  var cKeys = getChartKeys();

  Sift.Storage.get({
    bucket: 'month',
    keys: cKeys
  }).then(function (results) {
    var monthMap = createMonthMap(cKeys, results);
    var chart = createChart(cKeys, monthMap);
    resolve({
      html: 'frontend/view2.html', 
      label: 'Taxi Sift', 
      data: {
        sizeClass: sizeClass, 
        chart: chart
        }
      });
  }, function (error) {
    console.error('building-guide: loadCompactSummaryView: Storage.get failed: ', error);
    reject(error);
  });
}
```

### View

Since in this step we are not concerned with other states we only need to implement the `presentView()` callback. This callback will be called by the Redsift framework once the asynchronous `resolve` is called from our controller above. All we are doing here, is check if we got some data for our chart and pass it to a couple frontend functions that will take care of painting the chart for us.

```javascript
Sift.View.presentView = function (value) {
  if (value.chart) {
    _formatPresentationAxis(value.chart);
    _updateCompactView(value);
  }
};
```

[//]: # (## Pretty results:)

[//]: # (TODO: when label is fixed)
[//]: # (<img src='./screenshots/step7Chart.jpg'>)

## Files

**frontened/controller2.js**

**frontend/view2.html**

**frontend/view2.js**
