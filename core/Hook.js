'use strict';
/**
 * Event Emitter
 *
 * @external EventEmitter
 *
 * @see {@link https://nodejs.org/dist/latest-v6.x/docs/api/events.html#events_class_eventemitter|Node.JS - Event module}
 */
const EventEmitter = require('events'),
      Crypto = require('crypto'),
      SSE = require('express-sse');


function channel(source, filter) {

    var target = new SSE();

    return  function (request, response, next) {

        if (! request.accepts('text/event-stream'))  return next();

        target.init(request, response);

        function send(event) {

            if ( filter.call(this, event, request) ) {

                target.send(event, event.action);

                target.send( event );
            }
        }

        source.on('*', send);

        request.on('close',  function () {

            source.removeListener('*', send);
        });
    };
}


module.exports = function (config) {

    const emitter = new EventEmitter();

    /**
     * @api {post} /hookHub  Receive all kinds of Event from a Web Hook
     *
     * @apiName    postEvent
     * @apiVersion 0.5.0
     * @apiGroup   Event
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

        emitter.emit('*', request.body);

        response.end();
    });

    /**
     * @api {get} /orgs/:org/events  Organization SSE
     *
     * @apiName    getOrgEvent
     * @apiVersion 0.5.1
     * @apiGroup   Event
     *
     * @apiHeader {String} Accept=text/event-stream
     *
     * @apiParam {String} org
     */
    this.get('/orgs/:org/events',  channel(emitter,  function (event, request) {

        return  ((event.organization || '').login  ===  request.params.org);
    }));

    /**
     * @api {get} /repos/:owner/:repo/events  Repository SSE
     *
     * @apiName    getRepoEvent
     * @apiVersion 0.5.1
     * @apiGroup   Event
     *
     * @apiHeader {String} Accept=text/event-stream
     *
     * @apiParam {String} owner
     * @apiParam {String} repo
     */
    this.get('/repos/:owner/:repo/events', channel(
        emitter,  function (event, request) {

            return (
                (event.repository || '').full_name  ===
                request.params.owner + '/' + request.params.repo
            );
        }
    ));

    /**
     * @api {get} /repos/:owner/:repo/issues/events  Repository issue SSE
     *
     * @apiName    getIssueEvent
     * @apiVersion 0.5.1
     * @apiGroup   Event
     *
     * @apiHeader {String} Accept=text/event-stream
     *
     * @apiParam {String} owner
     * @apiParam {String} repo
     */
    this.get('/repos/:owner/:repo/issues/events', channel(
        emitter,  function (event, request) {

            return  event.issue && (
                (event.repository || '').full_name  ===
                request.params.owner + '/' + request.params.repo
            );
        }
    ));

    return emitter;
};
