const EventEmitter = require('events');
var rabbit = require('rabbot');
const EVENT_PREFIX = "RABBITMQ_";

module.exports = function ({config, events, log, listening}) {
    log = log || function() {};
    events = events || new EventEmitter();
    const CONN_NAME = config.connection.name;
    listening = (listening === undefined)?true:listening;
    rabbit.on( "unreachable", function() {
        rabbit.retry();
    });

    rabbit.configure(config).then(() => {
        if (listening)
            startListening();
    }).then(null, function(err) {
        log(err);
    });
    
    function on(event, listener) {
        events.on(EVENT_PREFIX + event, listener);
    }

    function emit(event, payload) {
        var message = {};
        message.routingKey = 'email';
        message.body = {
            payload: payload,
            type: event,
        };
        rabbit.publish("worker.exchange", message, CONN_NAME).then(function() {
            log('Sending successful! ', payload);
        }).catch(function(err) {
            log("Sending error is", err, ". Trying again..");
            setTimeout(emit.bind(this, event, payload), 1000);
        });
    }

    function handleMessage(message) {
        if (!message || !message.body || !message.body.type)
            log("This message is broken yo!");
        try {
            events.emit(EVENT_PREFIX + message.body.type, message.body.payload);
        } catch(err) {
            message.nack();
        }
        message.ack();
    };

    function startListening() {
        rabbit.handle({}, handleMessage);
        rabbit.startSubscription(config.queues[0].name, config.connection.name);
    };

    return {
        emit,
        on
    };
}
