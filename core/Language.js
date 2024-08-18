import { githubAPIClient } from './OAuth';

function Tech_Counter(list) {
    var tech = {};

    for (let item of list)
        for (let name in item) {
            tech[name] ||= { name, count: 0 };

            tech[name].count += item[name];
        }
    return Object.values(tech).sort((A, B) => B.count - A.count);
}

async function Repository_Filter(request_option, OAuth) {
    const { body: repos } = await githubAPIClient.get(request_option);

    const languages = await Promise.all(
        repos
            .filter(
                ({ fork, permissions }) => !fork && (!OAuth || permissions.push)
            )
            .map(({ languages_url }) => {
                request_option.url = languages_url;

                return githubAPIClient.get(request_option);
            })
    );
    return Tech_Counter(languages);
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
export default function (config) {
    var option = {
        headers: { 'User-Agent': config.userAgent },
        json: true
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
    this.get('/users/:name/languages', request => {
        const _option_ = {
            ...option,
            url: `${config.apiRoot}/users/${request.params.name}/repos?type=all`
        };
        return Repository_Filter(_option_);
    });

    /**
     * @api  {get}  /user/languages  Get Technique(Language)s of an OAuth User
     *
     * @apiName     getOAuthUserLanguage
     * @apiVersion  0.4.1
     * @apiGroup    User
     */
    this.get('/user/languages', async (request, response) => {
        const session = await config.getSession(request, response);

        var _option_ = { ...option };

        _option_.headers.Authorization = `Bearer ${session.AccessToken}`;

        _option_.url = `${config.apiRoot}/user/repos?affiliation=owner,collaborator`;

        return Repository_Filter(_option_, true);
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
    this.get('/orgs/:name/languages', request => {
        const _option_ = {
            ...option,
            url: `${config.apiRoot}/orgs/${request.params.name}/repos`
        };
        return Repository_Filter(_option_);
    });
}
