'use strict';

const URL_Utility = require('url'),  Request = require('request-promise-native');



module.exports = function (API_Root, config) {

    this.get('/oAuth',  function (request, response) {

        response.redirect(
            `https://github.com/login/oauth/authorize?client_id=${
                config.AppID
            }&scope=${
                config.scope.join(' ')
            }&state=${
                Buffer.from( request.headers.referer ).toString('base64')
            }`
        );
    });


    this.get('/oAuth/callback',  function (request, response) {

    //  Local Debug

        var referer = URL_Utility.parse(
                Buffer.from(request.query.state, 'base64')  +  ''
            );

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

            config.AccessToken = data.access_token;

            return  Request(`${API_Root}/user`, {
                headers:    {
                    'User-Agent':     'Express Middleware - GitHub API',
                    Authorization:    `token ${config.AccessToken}`
                },
                json:       true
            });
        }).then(function (data) {

            data.AccessToken = config.AccessToken;

            return  config.setSession(request, response, data);

        }).then(function () {

            response.redirect( config.successURL );
        });
    });
};
