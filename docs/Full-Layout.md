# 8. More Layouts

In this step we are going to expand our previous visualisation.

First, please edit your `sift.json` file to look like this:

`"controller": { "entry-point": "frontend/controller3.js", ... }`

## Adding a long table and a title

The previous step accommodated only a `compact` layout, but in most cases the screen surface at our disposal will be much bigger than that. Hence, in this step we will enhance our visualisation with a longer layout that we are calling the `full` layout. Also, we will update the title with a more dynamic one.

## Controller

The controller became a little bit bigger now, since there are more cases to take care off. Before we were providing functionality for `height` that was equal to `compact`, now we also implement for `none` and `full`. 

`none` is a special case which handles the title above the view port box of a sift. e.g. before title was statically set to _Taxi Sift_ now we will update it to a _Taxi: £{total} in {year}_ format.

`full` is the longer layout which we handle with the `loadFullSummaryView()` method.

**Note**: You probably have noticed that for now we are only switching on the `height` property of the `value` argument, in the next step we will switch on the `type` property too, which until this iteration it remains constant to `summary`.

```javascript
Sift.Controller.loadView = function (value, resolve, reject) {
  
  // ...

  // Asynchronous return
  if (height === 'none') {
      loadTextView(resolve, reject);
  }
  else {
    ret.html = 'frontend/view3.html';
    ret.data = {};
    ret.data.sizeClass = value.sizeClass.current;
    if (height === 'compact') {
      loadCompactSummaryView(value.sizeClass.current, resolve, reject);
    }
    else if (height === 'full') {
      loadFullSummaryView(value.sizeClass.current, resolve, reject);
    }
  }

  // Synchronous return
  return ret;
};
```
## View

In this step we still don't have any intermediate animations when the layout changes, so we only need to enhance the `presentView()` method since now we need to draw the new table for the `full` layout.

```javascript
Sift.View.presentView = function (value) {
  console.log('building-guide: presentView: ', value);
  if (value.chart) {
    _formatPresentationAxis(value.chart);
    _currentData.chart = value.chart;
  }
  if (value.table) {
    _currentData.table = value.table;
  }
  if (_currentData.chart) {
    if (value.sizeClass.height === 'full') {
      _updateFullView(_currentData);
    }
    else {
      _updateCompactView(_currentData);
    }
  }
};
```


## Files

**frontened/controller3.js**

**frontend/view3.html**

**frontend/view3.js**
