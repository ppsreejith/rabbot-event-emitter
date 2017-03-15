var rabbit = require('rabbot');
var config = require('../examples/config');
var EventEmitter = require('../index.js')({config, log: console.log, listening: true});
var test = require('tap').test

test('receives event in 10 seconds', function(t) {
    var timeout = setTimeout(() => {
        throw "Failed: Didn't receive in 10 secs";
    }, 10*1000);

    EventEmitter.on("testevent", function(payload) {
        clearTimeout(timeout);
        t.done();
    })

    EventEmitter.emit("testevent", {name: "event-data"});
})
