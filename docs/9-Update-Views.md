# 9. Updates and Views

In this step we are going to introduce an updating mechanism when new data arrives to our local storage and how to handle transitions between view layouts. 

First, please edit your `sift.json` file to look like this:

`"controller": { "entry-point": "frontend/controller4.js", ... }`

## Hey, new data! So?

So far we have been creating our views with static data in our local IndexedDB. Every time we refreshed, our Sift was reading whatever data was already there and was drawing accordingly. Now we are going to listen for changes in the relevant DB and update our views every time we have something new.

### Controller

In our controller we added a new listener for updates from the Sift's storage, which you can see below. The first argument is the name of the database we want to listen changes on. In this case we are interested in the `month` db. We could have used `*` as the first argument to listen for changes on all the available databases and figure out which database had a change by inspecting the `dbsChanged` variable but here we are interested only for one. The callback performs a `get` request and then follows the same steps to process the received data, as in the `loadFullSummaryView` function, that was previously implemented. Last important bit, is firring a new custom event called `newData` to our View with the new data.

```javascript
// listen for changes in the `month` DB.
Sift.Storage.addUpdateListener('month', function (dbsChanged) {
  console.log( 'building-guide: storage updated: ', dbsChanged);
  var cKeys = getChartKeys();
  var tKeys = getTableKeys();

  // ask the DB for new data.
  Sift.Storage.get({
      bucket: 'month',
      keys: tKeys
  }).then(function (results) {
    // process the new data
    var monthMap = createMonthMap(tKeys, results);
    var chart = createChart(cKeys, monthMap);
    var table = createTable(tKeys, monthMap);

    // now we can notify our view
    Sift.View.notify('newData', {chart: chart, table: table});
  });
});
```

### View

In our view we added a new listener for the new `newData` event that we expect from the controller when new data are added in our storage. Then we call our update function.

```javascript
Sift.Controller.addEventListener('newData', function (data) {
  console.log( 'building-guide: onNewData: ', data);

  if(data.chart){
      _currentData.chart = data.chart;
  }
  if(data.table){
      _currentData.table = data.table;
  }
  _updateFullView(data);
});
```
### Test the new stuff.

Provided that the `run-sift` script is running in the background:

- Delete the local data, by pressing the big black button saying _DELETE DBS_. That will reload the page with an empty version of our visualisation.
- Open a new terminal and run the `run-dag` script. You should be able to see your visualisation update every time the Dag spits new data in our local storage.

## The `willPresentView` event

You might have noticed that we have a framework callback in our `view*.js` file with the same name, as the event in the title, that we have not implemented for some steps now. This callback is being fired every time we click on the border of the Sift's viewport and we move it to and from the different view port borders. So far, when we were changing the dimensions of the view port it was essentially hiding away whatever was loaded there during startup or some previous action. Now we have the ability to present the appropriate visualisation while holding down our mouse button and moving between the different view port sizes. As we approach the `compact` size the visualisation for the `full` view will go away and vice versa. The only exception is the first time we switch to the `full` view because data have not been loaded yet for the `table` visualisation.

### View

```javascript
Sift.View.willPresentView = function (value) {
  console.log('building-guide: willPresentView: ', value);
  if (value.sizeClass.current.height === 'full') {
    _updateFullView(_currentData);
  }
  else if (value.sizeClass.current.height === 'compact') {
    d3.select('body').select('#taxiTableContainer').style('display', 'none');
    _updateCompactView(_currentData);
  }
};
```

## Files

**frontened/controller4.js**

**frontend/view4.html**

**frontend/view4.js**
