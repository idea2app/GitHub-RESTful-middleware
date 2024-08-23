import { components } from '@octokit/openapi-types';
import { IsInt, IsString, Min } from 'class-validator';
import { Get, HeaderParam, JsonController, Param } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { githubAPIClient } from './OAuth.js';

export type Repository = components['schemas']['repository'];

export type LanguageSum = Record<string, number>;

function countTech(list: LanguageSum[]) {
    const tech: Record<string, Language> = {};

    for (let item of list)
        for (let name in item) {
            tech[name] ||= { name, count: 0 };

            tech[name].count += item[name];
        }
    return Object.values(tech).sort((A, B) => B.count - A.count);
}

async function filterRepository(path: string, header?: Record<string, string>) {
    const { body } = await githubAPIClient.get<Repository[]>(path, header);

    const languages = await Promise.all(
        body!
            .filter(
                ({ fork, permissions }) =>
                    !fork && (!header?.['Authorization'] || permissions?.push)
            )
            .map(async ({ languages_url }) => {
                const { body } = await githubAPIClient.get<LanguageSum>(
                    languages_url,
                    header
                );
                return body!;
            })
    );
    return countTech(languages);
}

/**
 * Technique/Language meta
 */
export class Language {
    @IsString()
    name: string = '';

    @IsInt()
    @Min(0)
    count: number = 0;
}

@JsonController()
export class LanguageController {
    @OpenAPI({
        description: 'Get Technique(Language)s of a User'
    })
    @Get('/users/:name/languages')
    @ResponseSchema(Language, { isArray: true })
    getUserLanguages(
        @Param('name') name: string,
        @HeaderParam('Authorization') Authorization = ''
    ) {
        return filterRepository(`users/${name}/repos?type=all`, {
            Authorization
        });
    }

    @OpenAPI({
        description: 'Get Technique(Language)s of an OAuth User'
    })
    @Get('/user/languages')
    @ResponseSchema(Language, { isArray: true })
    async getOAuthUserLanguages(
        @HeaderParam('Authorization') Authorization = ''
    ) {
        return filterRepository('user/repos?affiliation=owner,collaborator', {
            Authorization
        });
    }

    @OpenAPI({
        description: 'Get Technique(Language)s of an Organization'
    })
    @Get('/orgs/:name/languages')
    @ResponseSchema(Language, { isArray: true })
    getOrganizationLanguages(
        @Param('name') name = '',
        @HeaderParam('Authorization') Authorization = ''
    ) {
        return filterRepository(`orgs/${name}/repos`, { Authorization });
    }
}
