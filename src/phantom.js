'use strict';

var fs      = require('fs');
var page    = require('webpage').create();
var system  = require('system');

var args = system.args;
var url = args[1];

var options = {
  accessibilityLevel: 'WCAG2A'
};




// Messages are sent to the parent by appending them to the tempfile.
// NOTE, the tempfile appears to be shared between asynchronously running grunt tasks
var sendMessage = function (arg) {
    var args = Array.isArray(arg) ? arg : [].slice.call(arguments);
    var channel = args[0];
    args[0] = channel;

    console.log(JSON.stringify(args) + '\n');
};

// This allows grunt to abort if the PhantomJS version isn't adequate.
//sendMessage('private', 'version', phantom.version);

// Create a new page.


// // Relay console logging messages.
page.onConsoleMessage = function (message) {

    if (message === 'done') {
      sendMessage('wcaglint.done', options);
      phantom.exit();
    } else {
      sendMessage('console', message);
    }
};

page.onError = function (msg, trace) {
    sendMessage('error', msg, trace);
};

page.onInitialized = function() {
    sendMessage('console', 'Page Loading...');
};

page.onLoadFinished = function(status) {

  sendMessage('console', 'Page Loaded. Starting Tests');

};

page.open(url, function (status) {

    page.injectJs('../libs/dist/HTMLCS.min.js');

    // Now Run. Note that page.evaluate() function is sanboxed to
    // the loaded page's context. We can't pass any variable to it.

    switch (options.accessibilityLevel) {
        case 'WCAG2A':
            page.evaluate(function() {
                HTMLCS_RUNNER.run('WCAG2A');
            });
        break;
        case 'WCAG2AA':
            page.evaluate(function() {
                HTMLCS_RUNNER.run('WCAG2AA');
            });
        break;
        case 'WCAG2AAA':
            page.evaluate(function() {
                HTMLCS_RUNNER.run('WCAG2AAA');
            });
        break;
        default:
            console.log('Unknown standard.');
            phantom.exit();
        break;
    }
});