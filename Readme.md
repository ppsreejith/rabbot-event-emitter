# Rabbot-event-emitter

An EventEmitter interface over [Rabbot](https://github.com/arobson/rabbot).

The tests and usage documentation assumes a locally running RabbitMQ server with default settings.

### Usage
```js
var rabbit = require('rabbot');
var config = require('./config');
var EventEmitter = require('../index.js')({
    config, 
    log: console.log, 
    listening: true
});

EventEmitter.on("event-data", function(payload) {
    console.log("Received payload", payload);
})
EventEmitter.emit("event-data", {name: "some data"});
```

### Testing
```
npm test
```

### Updates
Currently in beta stage. I plan to target better reliability and failover in future features. Pull requests and advice welcome :)