var rabbit = require('rabbot');
var config = require('./config');
var EventEmitter = require('../index.js')({config, log: console.log, listening: true});

EventEmitter.on("lol", function(payload) {
    console.log("Received payload", payload);
})

EventEmitter.emit("lol", {name: "wasap homie"});
