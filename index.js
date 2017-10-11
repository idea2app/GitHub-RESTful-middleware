'use strict';

const URL_Utility = require('url'),
      Request = require('request-promise-native'),
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
        }&state=${
            Buffer.from( request.headers.referer ).toString('base64')
        }`
    );
});

router.get('/oAuth/callback',  function (request, response) {

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

        var header = {'User-Agent': request.get('User-Agent')};

        if ( session.AccessToken )
            header.Authorization = `token ${session.AccessToken}`;

        Request({
            method:    request.method,
            url:       `${
                API_Root
            }${
                request.originalUrl.replace(request.baseUrl, '')
            }`,
            headers:    header,
            json:       is_JSON
        },  function (error, _response_, data) {

            header = { };

            for (var key in _response_.headers)
                if (key.slice(0, 2)  !==  'x-')
                    header[ key ] = _response_.headers[ key ];

            response.set( header );    response.json( data );
        });
    });
});


//  Export as a Middleware Factory

module.exports = function (API_Config, Local_Config) {

    Object.assign(config, API_Config, Local_Config);

    return router;
};
