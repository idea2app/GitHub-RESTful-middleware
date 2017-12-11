'use strict';

const URL_Utility = require('url'),  Request = require('request-promise-native');



module.exports = function (config) {

    /**
     * @api  {get}  /OAuth  Redirect to OAuth Page of GitHub
     *
     * @apiName     OAuth_entry
     * @apiVersion  0.4.0
     * @apiGroup    OAuth
     *
     * @apiHeader  {String}  Referer  URL of Source Page
     */

    this.get('/OAuth',  function (request, response) {

        response.redirect(
            `https://github.com/login/oauth/authorize?client_id=${
                config.AppID
            }&scope=${
                (config.AppScope || [ ]).join(' ')
            }&state=${
                Buffer.from( request.headers.referer ).toString('base64')
            }`
        );
    });

    /**
     * @api  {get}  /OAuth/callback  OAuth Callback for GitHub
     *
     * @apiName     OAuth_callback
     * @apiVersion  0.4.0
     * @apiGroup    OAuth
     *
     * @apiParam  {String}  code   Disposable checksum
     * @apiParam  {String}  state  Last Page Referer of this site in Base64
     */

    this.get('/OAuth/callback',  function (request, response) {

    //  Local Debug

        var referer = URL_Utility.parse(
                Buffer.from(request.query.state, 'base64')  +  ''
            ),
            AccessToken;

        if (
            (referer.hostname === 'localhost')  &&
            (request.hostname !== 'localhost')
        )
            return response.redirect(
                `${referer.protocol}//${referer.host + request.originalUrl}`
            );

    //  Access Token  &  User Profile

        Request.post('https://github.com/login/oauth/access_token', {
            body:    {
                client_id:        config.AppID,
                client_secret:    config.AppSecret,
                code:             request.query.code
            },
            json:    true
        }).then(function (data) {

            AccessToken = data.access_token;

            return  Request(`${config.apiRoot}/user`, {
                headers:    {
                    'User-Agent':     config.userAgent,
                    Authorization:    `token ${AccessToken}`
                },
                json:       true
            });
        }).then(function (data) {

            data.AccessToken = AccessToken;

            return  config.setSession(request, response, data);

        }).then(function () {

            response.redirect(
                URL_Utility.resolve(referer.href,  config.successURL || '')
            );
        });
    });
};
