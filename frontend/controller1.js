/**
 * Frontend entry point
 *
 * Copyright (c) 2015 Redsift Limited. All rights reserved.
 */
'use strict';

include('redsift.js');

Sift.Controller.loadView = function (value, resolve, reject) {
  console.log('taxi-test: load', value);
  var html;
  var data;
  if(value.sizeClass.current.height === 'list') {

    html = null;
    data = {
      title: 'Example Title',
      subtitle: 'Example subtitle',
      image: {
        url: 'assets/redsift-logo.png',
        size: 'large'
      }
    };
  }
  else {
    var msg = 'returned synchronously';
    if(value.sizeClass.current.height === 'full') {
      msg = 'waiting for async response...';
      setTimeout(function () {
        // Asynchronous resolve
        resolve ({
          data: {message: 'resolved asynchronously'},
          label: 'example-sift'
        });
      }, 1500);
    }
    // TODO: return something asynchronously here
    html = 'frontend/view1.html';
    data = {
        sizeClass: value.sizeClass.current,
        type: value.type,
        message: msg
    };
  }
  // Synchronous return
  return {
    data: data,
    html: html,
    label: 'example-sift'
  };
};
