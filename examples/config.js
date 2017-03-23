module.exports = {
    connection: {
        uri: 'amqp://test:test@localhost/',
        timeout: 8000,
        heartbeat: 30,
        failAfter: 600,
        retryLimit: 600,
    },
    exchanges: [
        {   name:           "worker.exchange",
            type:           "direct",
            autoDelete:     false,
            durable:        true,
            persistent:     true},

        {   name:           "deadLetter.exchange",
            type:           "fanout"}
    ],
    queues: [
        {   name:           "worker.queue",
            autoDelete:     false,
            durable:        true,
            noBatch:        true,
            limit:          1,
            subscribe:      true,
            deadLetter:     'deadLetter.exchange'},

        {   name:           'deadLetter.queue'}
    ],
    bindings: [
        {   exchange:   "worker.exchange",
            target:         "worker.queue",
            keys:           ["email"]
        },

        {
            exchange:      "deadLetter.exchange",
            target:         "deadLetter.queue",
            keys:           ["email"]
        }
    ],
    logging: {
        adapters: {
            stdOut: { // adds a console logger at the "info" level
                level: 3,
                      bailIfDebug: true
            }
        }
    }
};
