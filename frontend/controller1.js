/**
 * Hello Sift. Frontend entry point.
 */

'use strict';
/* globals document, Sift */

// Function: loadView
// Description: Invoked by the Redsift client when a Sift has transitioned to its final size class
//
// Parameters:
// @value: {
//          sizeClass: {
//            previous: {width: 'compact'|'full', height: 'compact'|'full'},
//            current:  {width: 'compact'|'full', height: 'compact'|'full'}
//          },
//          type: 'compose'|'email-detail'|'summary',
//          data: {<object>}
//        }
//
// return: null or {html:'<string>', data: {<object>}}
// @resolve: function ({html:'<string>', data: {<object>})
// @reject: function (error)
Sift.Controller.loadView = function (value, resolve, reject) {
  console.log('hello-sift: loadView', value);

  /*
  * Replace example code with your sift logic
  */
  var height = value.sizeClass.current.height,
    response = { data: {}};

  var msg = 'returned synchronously';
  if(height === 'full') {
    // Asynchronous return
    msg = 'waiting for async response...';
    fullAsyncHandler(resolve, reject);
  }

  // Synchronous return
  response.html = 'frontend/view1.html';
  response.data = {
      message: msg
  };

  return response;
};

// Function: loadData
// Description: Invoked by the Sift view to load more data
//
// Parameters:
// @value: <object>
//
// return: <object>
// @resolve: function (<object>)
// @reject: function (error)
Sift.Controller.loadData = function (value) {
  console.log('hello-sift: loadData', value);
  return Sift.Storage.get({
      bucket: 'count',
      keys: [value.key]
  }).then(function (values) {
    console.log('hello-sift: storage returned: ', values);
    return values[0].value;
  });
};

// Function: loadLabel
// Description: Invoked when the Redsift client requires a textual representation for the sift
//
// Parameters:
// @value: {}
//
// return: null or {data: 'label string'}
// @resolve: function ({data: 'label string'})
// @reject: function (error)
Sift.Controller.loadLabel = function(value, resolve, reject) {
  console.log('sift-taxi: loadLabel');
  return {data: 'Hello Sift'};
};

// Event: storage update
// Description: fired whenever anything changes in the Sift's storage
//              you can replace '*' by the name of a specific bucket
Sift.Storage.addUpdateListener('*', function (value) {
  console.log('hello-sift: storage updated: ', value);
  // Storage has been updated, fetch the new count
  Sift.Storage.get({
      bucket: 'count',
      keys: ['TOTAL']
  }).then(function (values) {
    console.log('hello-sift: storage returned: ', values);
    Sift.Controller.notifyListeners('count', values[0].value);
  });
});

// Register for specific UI events
Sift.View.addEventListener('ncButton-pressed', function (value) {
  console.log('hello-sift: ncButton-pressed received: ', value);
  Sift.Storage.putUser({
    kvs: [{key: 'NCBUTTONPRESSED', value: value}]
  }).then(function () {
    console.log('hello-sift: stored in user database');
  }).catch(function (err) {
    console.error('hello-sift: error storing in user database', err);
  });
});

function fullAsyncHandler(resolve, reject){
  setTimeout(function () {
    // Asynchronous resolve
    resolve ({
        html: 'frontend/view1.html',
        data: {
          message: 'resolved asynchronously'
        }
      });
    }, 1500);
}

