'use strict';

const Request = require('request-promise-native');


function Tech_Counter(list) {

    var tech = { };

    for (let item of list)
        for (let name in item) {

            tech[ name ] = tech[ name ]  ||  {
                name:     name,
                count:    0
            };

            tech[ name ].count += item[ name ];
        }

    return  Object.keys( tech ).map(function (name) {

        return  tech[ name ];

    }).sort(function (A, B) {

        return  B.count - A.count;
    });
}


function Repository_Filter(request_option, response, OAuth) {

    return  Request( request_option ).then(function (repos) {

        return  Promise.all(repos.filter(function (repo) {

            return  (! repo.fork)  &&  ((! OAuth) || repo.permissions.push);

        }).map(function (repo) {

            request_option.url = repo.languages_url;

            return  Request( request_option );
        }));
    }).then(function (languages) {

        response.json( Tech_Counter( languages ) );
    });
}


/**
 * @apiDefine Language
 *
 * @apiParam  {String}  name  Name of a User or Organization
 *
 * @apiSuccessExample  {json}  Technique(Language) array
 *     [
 *         {"name": "JavaScript",  "count": 123456},
 *         {"name": "HTML",  "count": 12345},
 *         {"name": "CSS",  "count": 1234}
 *     ]
 */
module.exports = function (config) {

    var option = {
            headers:    {'User-Agent':  config.userAgent},
            json:       true
        };

    /**
     * @api  {get}  /users/:name/languages  Get Technique(Language)s of a User
     *
     * @apiName     getUserLanguage
     * @apiVersion  0.4.1
     * @apiGroup    User
     *
     * @apiUse Language
     */
    this.get('/users/:name/languages',  function (request, response) {

        var _option_ = Object.assign({ }, option);

        _option_.url =
            `${config.apiRoot}/users/${request.params.name}/repos?type=all`;

        Repository_Filter(_option_, response);
    });

    /**
     * @api  {get}  /user/languages  Get Technique(Language)s of an OAuth User
     *
     * @apiName     getOAuthUserLanguage
     * @apiVersion  0.4.1
     * @apiGroup    User
     */
    this.get('/user/languages',  function (request, response) {

        Promise.resolve(
            config.getSession(request, response)
        ).then(function (session) {

            var _option_ = Object.assign({ }, option);

            _option_.headers.Authorization = `token ${session.AccessToken}`;

            _option_.url =
                `${config.apiRoot}/user/repos?affiliation=owner,collaborator`;

            return  Repository_Filter(_option_, response, true);
        });
    });

    /**
     * @api  {get}  /orgs/:name/languages  Get Technique(Language)s of an Organization
     *
     * @apiName     getOrganizationLanguage
     * @apiVersion  0.4.1
     * @apiGroup    Organization
     *
     * @apiUse Language
     */
    this.get('/orgs/:name/languages',  function (request, response) {

        var _option_ = Object.assign({ }, option);

        _option_.url = `${config.apiRoot}/orgs/${request.params.name}/repos`;

        Repository_Filter(_option_, response);
    });
};
