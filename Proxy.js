'use strict';

const Request = require('request-promise-native'),
      Diff2HTML = require('diff2html').Diff2Html;


module.exports = function (API_Root, config) {

    //  Diff file

    this.get(/repos\/(\S+\/pull\/\S+\.diff)/,  function (request, response) {

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

    this.all('*',  function (request, response) {

        var is_JSON = Boolean( request.accepts('json') );

        Promise.resolve(
            config.getSession(request, response)
        ).then(function (session) {

            var header = {
                    Accept:          request.get('Accept'),
                    'User-Agent':    request.get('User-Agent')
                };

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

                response.set( header );

                response[is_JSON ? 'json' : 'send']( data );
            });
        });
    });
};
