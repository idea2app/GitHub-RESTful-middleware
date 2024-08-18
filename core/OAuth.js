import { HTTPClient } from 'koajax';
import { resolve } from 'url';

export const githubClient = new HTTPClient({
        baseURI: 'https://github.com/',
        responseType: 'json'
    }),
    githubAPIClient = new HTTPClient({
        baseURI: 'https://api.github.com/',
        responseType: 'json'
    });

export default function (config) {
    /**
     * @api  {get}  /OAuth  Redirect to OAuth Page of GitHub
     *
     * @apiName     OAuth_entry
     * @apiVersion  0.4.0
     * @apiGroup    OAuth
     *
     * @apiHeader  {String}  Referer  URL of Source Page
     */

    this.get('/OAuth', function (request, response) {
        const path = `${githubClient.baseURI}login/oauth/authorize?${new URLSearchParams(
            {
                client_id: config.AppID,
                scope: (config.AppScope || []).join(' '),
                state: Buffer.from(request.headers.referer).toString('base64')
            }
        )}`;
        response.redirect(path);
    });

    /**
     * @api  {get}  /OAuth/callback  OAuth Callback for GitHub
     *
     * @apiName     OAuth_callback
     * @apiVersion  0.4.0
     * @apiGroup    OAuth
     *
     * @apiParam  {String}  code   Disposable checksum
     * @apiParam  {String}  state  Last Page Referer of this site in Base64
     */

    this.get('/OAuth/callback', async (request, response) => {
        //  Local Debug

        const { hostname, protocol, host, href } = new URL(
            Buffer.from(request.query.state, 'base64') + ''
        );

        if (hostname === 'localhost' && request.hostname !== 'localhost')
            return response.redirect(
                `${protocol}//${host + request.originalUrl}`
            );
        //  Access Token  &  User Profile

        const { body } = await githubClient.post('login/oauth/access_token', {
            client_id: config.AppID,
            client_secret: config.AppSecret,
            code: request.query.code
        });
        const { body: user } = await githubAPIClient.get('user', {
            'User-Agent': config.userAgent,
            Authorization: `Bearer ${body.access_token}`
        });

        // data.AccessToken = AccessToken;

        // return config.setSession(request, response, data);

        response.redirect(resolve(href, config.successURL || ''));
    });
}
