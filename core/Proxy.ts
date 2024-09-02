import { isNotEmptyObject } from 'class-validator';
import { html } from 'diff2html';
import { LinkHeader } from 'koajax';
import {
    All,
    Body,
    Controller,
    Get,
    HeaderParam,
    Param,
    Req,
    Res
} from 'routing-controllers';

import { githubAPIClient, githubClient } from './OAuth.js';
import { CommonRequest, CommonResponse } from './index.js';

@Controller()
export class ProxyController {
    /**
     * @param  owner          ID of a User or Organization
     * @param  repo           Name of a Repository
     * @param  id             ID of a Pull Request
     * @param  Authorization  Authorization header
     * @param  Accept         Accept header
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
        @HeaderParam('Authorization') Authorization = '',
        @HeaderParam('Accept') Accept = '',
        @Res() response: CommonResponse
    ) {
        const { body } = await githubClient.get<string>(
            `${owner}/${repo}/pull/${id}.diff`,
            { Authorization },
            { responseType: 'text' }
        );
        const acceptHTML = Accept.includes('html');

        response.set('Content-Type', acceptHTML ? 'text/html' : 'text/plain');

        return acceptHTML
            ? html(body!, { outputFormat: 'side-by-side' })
            : body!;
    }

    /**
     * Other API Proxy
     */
    @All('/:path*')
    async proxyAll(
        @HeaderParam('Accept') accept = '',
        @Param('path') path: string,
        @Body() body: any,
        @Req() request: CommonRequest,
        @Res() response: CommonResponse
    ) {
        const acceptJSON = accept.includes('json'),
            { host, connection, ...header } = request.headers;

        const res = await githubAPIClient.request({
            method: request.method,
            path,
            // @ts-ignore
            headers: { ...header, accept },
            body: isNotEmptyObject(body) ? body : undefined,
            responseType: acceptJSON ? 'json' : 'arraybuffer'
        });
        const { status, body: data } = res,
            {
                'Content-Encoding': _,
                'Transfer-Encoding': __,
                ...headers
            } = res.headers;

        for (const key in headers)
            if (key === 'Link') {
                const value = Object.values(headers[key] as LinkHeader).map(
                    ({ URI, ...meta }) => {
                        const value = Object.entries(meta).map(
                            ([key, value]) => `${key}=${JSON.stringify(value)}`
                        );
                        return `<${URI}>; ${value.join('; ')}`;
                    }
                );
                headers[key] = value.join(', ');
            }
        if (typeof response.status === 'function') response.status(status);
        else response.status = status;

        response.set(headers as Record<string, string>);

        return data;
    }
}
