var rabbit = require('rabbot');
var config = require('./config');
var EventEmitter = require('../index.js')({config, log: console.log, listening: true});

EventEmitter.on("event-data", function(payload) {
    console.log("Received payload", payload);
})

EventEmitter.emit("event-data", {name: "some data"});
