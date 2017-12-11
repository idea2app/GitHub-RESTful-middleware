'use strict';
/**
 * Event Emitter
 *
 * @external EventEmitter
 *
 * @see {@link https://nodejs.org/dist/latest-v6.x/docs/api/events.html#events_class_eventemitter|Node.JS - Event module}
 */
const EventEmitter = require('events'), Crypto = require('crypto');



module.exports = function (config) {

    const emitter = new EventEmitter();

    /**
     * @api {post} /hookHub  Receive all kinds of Event from a Web Hook
     *
     * @apiName    postEvent
     * @apiVersion 0.5.0
     * @apiGroup   Hook
     *
     * @apiHeader {String} X-GitHub-Event     Event name
     * @apiHeader {String} X-GitHub-Delivery  Unique ID for this delivery
     * @apiHeader {String} X-Hub-Signature    HMAC hex digest of the payload
     *
     * @apiParam {String}   action         Event name
     * @apiParam {Object}   [repository]
     * @apiParam {Object}   [organization]
     */
    this.post('/hookHub',  function (request, response) {

        var data = JSON.stringify( request.body ),
            sign = (request.get('X-Hub-Signature') || '').split('=');

        request.body.id = request.get('X-GitHub-Delivery');

        request.body.sign = sign;

        if (
            sign[0] && (
                sign[1] !==
                Crypto.createHmac(sign[0], config.HookSecret)
                    .update( data ).digest('hex')
            )
        ) {
            /**
             * Signature verification failed
             *
             * @event external:EventEmitter#error
             *
             * @type {object}
             *
             * @property {string}   id    `X-GitHub-Delivery` header
             * @property {string[]} sign  Array splited from
             *                            `X-Hub-Signature` header
             *
             * @see {@link https://developer.github.com/webhooks/#payloads}
             */
            emitter.emit('error', request.body);

            return  response.status( 400 ).end('Signature verification failed');
        }

        emitter.emit(request.get('X-GitHub-Event'), request.body);

        response.end();
    });

    return emitter;
};
