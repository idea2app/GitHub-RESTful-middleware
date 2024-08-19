import { HTTPClient } from 'koajax';
import {
    Get,
    HeaderParam,
    JsonController,
    QueryParam,
    Redirect,
    Req,
    Res
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

/**
 * @param  {import('koajax').Context} context
 * @param  {() => Promise<void>} next
 */
function setUserAgent(context, next) {
    context.request.headers = {
        'User-Agent':
            process.env.HTTP_USER_AGENT || 'GitHub RESTful middleware',
        ...context.request.headers
    };
    return next();
}

export const githubClient = new HTTPClient({
    baseURI: 'https://github.com/',
    responseType: 'json'
}).use(setUserAgent);

export const githubAPIClient = new HTTPClient({
    baseURI: 'https://api.github.com/',
    responseType: 'json'
}).use(setUserAgent);

@JsonController('/OAuth')
export class OauthController {
    /**
     * @param  {string} referer - Referer  URL of Source Page
     */
    @OpenAPI({ description: 'Redirect to OAuth Page of GitHub' })
    @Get()
    @Redirect(`${githubClient.baseURI}login/oauth/authorize`)
    goToSignInPage(@HeaderParam('Referer') referer) {
        const { GITHUB_OAUTH_CLIENT_ID = '', GITHUB_OAUTH_SCOPE = '' } =
            process.env;

        return `${githubClient.baseURI}login/oauth/authorize?${new URLSearchParams(
            {
                client_id: GITHUB_OAUTH_CLIENT_ID,
                scope: GITHUB_OAUTH_SCOPE,
                state: Buffer.from(referer).toString('base64')
            }
        )}`;
    }

    /**
     * @param  {string}  code   Disposable checksum
     * @param  {string}  state  Last Page Referer of this site in Base64
     * @param  {import('./index.js').CommonRequest} request
     * @param  {import('./index.js').CommonResponse} response
     */
    @OpenAPI({ description: 'OAuth Callback for GitHub' })
    @Get('/callback')
    async backToRefererPage(
        @QueryParam('state') state,
        @QueryParam('code') code,
        @Req() request,
        @Res() response
    ) {
        const { GITHUB_OAUTH_CLIENT_ID = '', GITHUB_OAUTH_CLIENT_SECRET = '' } =
            process.env;

        //  Local Debug

        const refererURL = new URL(Buffer.from(state, 'base64') + '');
        const { hostname, protocol, host } = refererURL;

        if (hostname === 'localhost' && request.hostname !== 'localhost')
            return response.redirect(
                `${protocol}//${host + request.originalUrl}`
            );
        /**
         * @type {import('koajax').Response<{access_token: string}>}
         *
         * @see {@link https://developer.github.com/v3/users/#get-the-authenticated-user|More data about the Login User}
         */
        const { body } = await githubClient.post('login/oauth/access_token', {
            client_id: GITHUB_OAUTH_CLIENT_ID,
            client_secret: GITHUB_OAUTH_CLIENT_SECRET,
            code
        });
        refererURL.searchParams.set('access_token', body?.access_token || '');

        response.redirect(refererURL + '');
    }
}
