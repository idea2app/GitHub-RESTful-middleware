import { Get, HeaderParam, JsonController, Param } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { IsInt, IsString, Min } from 'class-validator';

import { githubAPIClient } from './OAuth.js';

/**
 * @typedef {import ('@octokit/openapi-types').components['schemas']['repository']} Repository
 */

/**
 * @typedef {Record<string, number>} LanguageSum
 */

/**
 * @param {LanguageSum[]} list
 */
function Tech_Counter(list) {
    /**
     * @type {Record<string, Language>}
     */
    const tech = {};

    for (let item of list)
        for (let name in item) {
            tech[name] ||= { name, count: 0 };

            tech[name].count += item[name];
        }
    return Object.values(tech).sort((A, B) => B.count - A.count);
}

/**
 * @param {string} path
 * @param {Record<string, string>} [header]
 */
async function Repository_Filter(path, header) {
    /**
     * @type {import('koajax').Response<Repository[]>}
     */
    const { body: repos = [] } = await githubAPIClient.get(path);

    const languages = await Promise.all(
        repos
            .filter(
                ({ fork, permissions }) =>
                    !fork && (!header?.['Authorization'] || permissions?.push)
            )
            .map(async ({ languages_url }) => {
                /**
                 * @type {import('koajax').Response<LanguageSum>}
                 */
                const { body = {} } = await githubAPIClient.get(languages_url);
                return body;
            })
    );
    return Tech_Counter(languages);
}

/**
 * Technique/Language meta
 */
export class Language {
    /**
     * @type {string}
     */
    @IsString()
    name = '';

    /**
     * @type {number}
     */
    @IsInt()
    @Min(0)
    count = 0;
}

@JsonController()
export class LanguageController {
    /**
     * @param {string} name
     */
    @OpenAPI({ description: 'Get Technique(Language)s of a User' })
    @Get('/users/:name/languages')
    @ResponseSchema(Language, { isArray: true })
    getUserLanguages(@Param('name') name) {
        return Repository_Filter(`users/${name}/repos?type=all`);
    }

    /**
     * @param {string} Authorization
     */
    @OpenAPI({ description: 'Get Technique(Language)s of an OAuth User' })
    @Get('/user/languages')
    @ResponseSchema(Language, { isArray: true })
    async getOAuthUserLanguages(@HeaderParam('Authorization') Authorization) {
        return Repository_Filter('user/repos?affiliation=owner,collaborator', {
            Authorization
        });
    }

    /**
     * @param {string} name
     */
    @OpenAPI({ description: 'Get Technique(Language)s of an Organization' })
    @Get('/orgs/:name/languages')
    @ResponseSchema(Language, { isArray: true })
    getOrganizationLanguages(@Param('name') name) {
        return Repository_Filter(`orgs/${name}/repos`);
    }
}
