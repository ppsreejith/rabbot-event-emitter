const EventEmitter = require('events');
var rabbit = require('rabbot');
const EVENT_PREFIX = "RABBITMQ_";

module.exports = function ({config, events, log, listening}) {
    log = log || function() {};
    events = events || new EventEmitter();
    listening = (listening === undefined)?true:listening;
    rabbit.on( "unreachable", function() {
        log("Couldn't connect. Retrying");
        rabbit.retry();
    });

    rabbit.configure(config).then(() => {
        if (listening)
            startListening();
    }).catch(function(err) {
        log("Rabbit startup error is", err);
    });

    process.on('SIGINT', () => {
        rabbit.shutdown();
    });
    
    function on(event, listener) {
        events.on(EVENT_PREFIX + event, listener);
    }

    function emit(event, payload, ct) {
        ct = ct || 0;
        var message = {};
        message.routingKey = 'email';
        message.body = {
            payload: payload,
            type: event,
        };
        rabbit.publish("worker.exchange", message).then(function() {
            log('Sending successful! ', payload);
        }).catch(function(err) {
            log("Sending error is", err, ". Trying again..");
            if ((ct+1)%5 == 0) {
                log("Retrying rabbit mq connection");
                rabbit.retry();
            }
            setTimeout(emit.bind(this, event, payload, ct+1), Math.max(ct+1, 6)*500);
        });
    }

    function handleMessage(message) {
        if (!message || !message.body || !message.body.type)
            log("Broken message!", message);
        try {
            events.emit(EVENT_PREFIX + message.body.type, message.body.payload);
            message.ack();
            log("Received message", message.body);
        } catch(err) {
            message.nack();
        }
    };

    function startListening() {
        rabbit.handle({}, handleMessage);
        rabbit.onUnhandled( function( message ) {
            log("Unhandled message here", message);
        });
        rabbit.startSubscription(config.queues[0].name);
    };

    return {
        emit,
        on
    };
}
