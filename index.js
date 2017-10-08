'use strict';

const Request = require('request-promise-native'),
      Diff2HTML = require('diff2html').Diff2Html;

const router = require('express').Router(),
      config = { },
      API_Root = 'https://api.github.com';


//  OAuth 2.0

router.get('/oAuth',  function (request, response) {

    response.redirect(
        `https://github.com/login/oauth/authorize?client_id=${
            config.AppID
        }&scope=${
            config.scope.join(' ')
        }`
    );
});

router.get('/oAuth/callback',  function (request, response) {

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


//  Diff file

router.get(/repos\/(\S+\/pull\/\S+\.diff)/,  function (request, response) {

    Request(`https://github.com/${request.params[0]}`).then(function (data) {

        response.end(
            request.accepts('html') ?
                Diff2HTML.getPrettyHtml(data, {
                    outputFormat:    'side-by-side'
                }) :
                data
        );
    });
});


//  Other API Proxy

router.all('*',  function (request, response) {

    var is_JSON = Boolean( request.accepts('json') );

    Promise.resolve(
        config.getSession(request, response)
    ).then(function (session) {

        Request({
            method:    request.method,
            url:       `${
                API_Root
            }${
                request.originalUrl.replace(request.baseUrl, '')
            }`,
            headers:    {
                'User-Agent':     request.get('User-Agent'),
                Authorization:    `token ${session.AccessToken}`
            },
            json:       is_JSON
        }).pipe( response );
    });
});


//  Export as a Middleware Factory

module.exports = function (API_Config, Local_Config) {

    Object.assign(config, API_Config, Local_Config);

    return router;
};