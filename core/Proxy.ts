import { html } from 'diff2html';
import {
    All,
    Controller,
    Get,
    HeaderParam,
    Param,
    Req,
    Res
} from 'routing-controllers';

import { githubAPIClient, githubClient } from './OAuth.js';
import { CommonRequest, CommonResponse } from './index.js';

const CORS_Header: Record<string, boolean> = {
    'access-control-allow-methods': true,
    'access-control-allow-headers': true,
    'access-control-expose-headers': true
};

@Controller()
export class ProxyController {
    /**
     * @param  owner     ID of a User or Organization
     * @param  repo      Name of a Repository
     * @param  id        ID of a Pull Request
     * @param  accept    Accept header
     * @param  response
     *
     * @example
     * HTML converted from Diff by Diff2HTML
     * ```html
     * <div class="d2h-wrapper"></div>
     * ```
     */
    @Get('/repos/:owner/:repo/pull/:id.diff')
    async getDiffFile(
        @Param('owner') owner: string,
        @Param('repo') repo: string,
        @Param('id') id: number,
        @HeaderParam('Accept') accept = '',
        @Res() response: CommonResponse
    ) {
        const { body } = await githubClient.get<string>(
            `/repos/${owner}/${repo}/pull/${id}.diff`
        );
        const acceptHTML = accept.includes('html');

        response.set('Content-Type', acceptHTML ? 'text/html' : 'text/plain');

        return acceptHTML
            ? html(body!, { outputFormat: 'side-by-side' })
            : body!;
    }

    /**
     * Other API Proxy
     */
    @All('*')
    async proxyAll(
        @HeaderParam('Accept') Accept = '',
        @HeaderParam('Authorization') Authorization = '',
        @HeaderParam('Cookie') Cookie = '',
        @Req() request: CommonRequest,
        @Res() response: CommonResponse
    ) {
        const acceptJSON = Accept.includes('json'),
            header = { Accept, Authorization, Cookie };
        const {
            status,
            headers,
            body: data
        } = await githubAPIClient.request({
            method: request.method,
            path: request.originalUrl,
            headers: header,
            responseType: acceptJSON ? 'json' : 'arraybuffer'
        });

        const headerList = Object.entries(headers).map(([key, value]) => {
            if (typeof value !== 'string') return [];

            switch (key.split('-')[0]) {
                case 'access':
                    return CORS_Header[key.toLowerCase()]
                        ? [key, [response.get(key) || '', value] + '']
                        : [];
                case 'x':
                    return [];
                default:
                    return [key, value];
            }
        });

        if (typeof response.status === 'function') response.status(status);
        else response.status = status;

        response.set(Object.fromEntries(headerList));

        return data;
    }
}
