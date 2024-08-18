import { html } from 'diff2html';
import { githubAPIClient, githubClient } from './OAuth';

const CORS_Header = {
    'access-control-allow-methods': true,
    'access-control-allow-headers': true,
    'access-control-expose-headers': true
};

export default function (config) {
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

    this.get(/repos\/(\S+\/pull\/\S+\.diff)/, async (request, response) => {
        const { body: data } = await githubClient.get(request.params[0]);

        response.end(
            request.accepts('html')
                ? html(data, { outputFormat: 'side-by-side' })
                : data
        );
    });

    //  Other API Proxy

    this.all('*', async (request, response) => {
        var is_JSON = !!request.accepts('json');

        const session = await config.getSession(request, response),
            header = {
                Accept: request.get('Accept'),
                'User-Agent': config.userAgent
            };
        if (session.AccessToken)
            header.Authorization = `Bearer ${session.AccessToken}`;

        if ((value = request.get('Cookie'))) header.Cookie = value;

        const {
            status,
            headers,
            body: data
        } = await githubAPIClient.request({
            method: request.method,
            path: `${config.apiRoot}${request.originalUrl.replace(
                request.baseUrl,
                ''
            )}`,
            headers: header,
            responseType: is_JSON ? 'json' : 'arraybuffer'
        });

        const responseHeader = Object.fromEntries(
            Object.entries(headers)
                .map(([key, value]) => {
                    switch (key.split('-')[0]) {
                        case 'access':
                            return Object.entries(CORS_Header).map(() => [
                                key,
                                [response.get(key) || '', value] + ''
                            ]);
                        case 'x':
                            return [];
                        default:
                            [key, value];
                    }
                })
                .flat()
        );
        response.status(status);

        response.set(responseHeader);

        response[is_JSON ? 'json' : 'send'](data);
    });
}
