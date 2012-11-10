/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

/*global phantom:true*/

var fs = require('fs');

// The buil .html test file to run.
var url = phantom.args[0];


// Keep track of the last time a QUnit message was sent.
var last = new Date();

// Messages are sent to the parent by appending them to the tempfile.
function sendMessage(args) {
  console.log(JSON.stringify(args))
 //fs.write(tmpfile, JSON.stringify(args) + '\n', 'a');
  // Exit when all done.
  phantom.exit();
}

setInterval(function() {
  sendMessage(['done_timeout']);
}, 5000);

// Create a new page.
var page = require('webpage').create();

// QUnit sends its messages via alert(jsonstring);
page.onAlert = function(args) {
  sendMessage(JSON.parse(args));
};

page.open(url);