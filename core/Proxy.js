'use strict';

const Request = require('request-promise-native'),
      Diff2HTML = require('diff2html').Diff2Html,
      CORS_Header = {
          'access-control-allow-methods':     true,
          'access-control-allow-headers':     true,
          'access-control-expose-headers':    true
      };


module.exports = function (config) {

    /**
     * @api  {get}  /repos/:owner/:repo/pull/:id.diff  Get Diff File
     *
     * @apiName     getDiffFile
     * @apiVersion  0.4.0
     * @apiGroup    Repository
     *
     * @apiParam  {String}  owner  ID of a User or Organization
     * @apiParam  {String}  repo   Name of a Repository
     * @apiParam  {Number}  id     ID of a Pull Request
     *
     * @apiSuccessExample  {html}  HTML converted from Diff by Diff2HTML
     *     <div class="d2h-wrapper"></div>
     */

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
                    'User-Agent':    config.userAgent
                },
                value;

            if ( session.AccessToken )
                header.Authorization = `token ${session.AccessToken}`;

            if (value = request.get('Cookie'))  header.Cookie = value;

            Request({
                method:    request.method,
                url:       `${
                    config.apiRoot
                }${
                    request.originalUrl.replace(request.baseUrl, '')
                }`,
                headers:    header,
                json:       is_JSON
            },  function (error, _response_, data) {

                header = { };

                for (let key in _response_.headers)
                    switch ( key.split('-')[0] ) {
                        case 'access':
                            if (key in CORS_Header)
                                header[ key ] = [
                                    (response.get( key ) || ''),
                                    _response_.headers[ key ]
                                ] + '';
                        case 'x':         break;
                        default:
                            header[ key ] = _response_.headers[ key ];
                    }

                response.status( _response_.statusCode );

                response.set( header );

                response[is_JSON ? 'json' : 'send']( data );
            });
        });
    });
};
