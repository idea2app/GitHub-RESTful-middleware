import { components } from '@octokit/openapi-types';
import BetterSSE from 'better-sse';
import { createHmac } from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';
import { Context } from 'koa';
import {
    Body,
    Controller,
    Ctx,
    Get,
    HeaderParam,
    NotAcceptableError,
    OnUndefined,
    Param,
    Post,
    Req,
    Res,
    UnauthorizedError
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { Repository } from './index.js';

export type HookEvent = components['schemas']['hook-delivery-item'] & {
    id: number;
    signature: string;
    repository?: Repository;
    issue?: components['schemas']['issue'];
};
export type EventFilter = Partial<
    Record<'owner' | 'repository' | 'event', string>
>;

@Controller()
export class HookController {
    channel = BetterSSE.createChannel<{}, EventFilter>();

    async bootSSE(
        request: IncomingMessage,
        response: ServerResponse,
        state: EventFilter
    ) {
        if (!request.headers.accept?.includes('text/event-stream'))
            throw new NotAcceptableError();

        const session = await BetterSSE.createSession<EventFilter>(
            request,
            response,
            { state }
        );
        this.channel.register(session);
    }

    /**
     * @param  name       `X-GitHub-Event`: Event name
     * @param  id         `X-GitHub-Delivery`: Unique ID for this delivery
     * @param  signature  `X-Hub-Signature`: HMAC hex digest of the payload
     *
     * @see {@link https://docs.github.com/webhooks/webhook-events-and-payloads#delivery-headers}
     */
    @OpenAPI({ description: 'Receive all kinds of Event from a Web Hook' })
    @Post('/hookHub')
    @OnUndefined(204)
    emitEvent(
        @HeaderParam('X-GitHub-Event') name = '',
        @HeaderParam('X-GitHub-Delivery') id = 0,
        @HeaderParam('X-Hub-Signature') signature = '',
        @Body() event: HookEvent
    ) {
        const { GITHUB_HOOK_SECRET = '' } = process.env,
            data = JSON.stringify(event),
            [algorithm, signValue] = signature?.split('=') || [];
        const checkValue =
            algorithm &&
            createHmac(algorithm, GITHUB_HOOK_SECRET)
                .update(data)
                .digest('hex');

        event = { ...event, id, signature };

        if (algorithm && signValue !== checkValue) {
            /**
             * Signature verification failed
             *
             * @event external:EventEmitter#error
             *
             * @type {object}
             *
             * @property {string}   id    `X-GitHub-Delivery` header
             * @property {string[]} sign  Array splited from
             *                            `X-Hub-Signature` header
             *
             * @see {@link https://developer.github.com/webhooks/#payloads}
             */
            this.channel.emit('error', event);

            throw new UnauthorizedError('Signature verification failed');
        }

        this.channel.broadcast(event, name, {
            filter: ({ state: { event: type, owner, repository } }) =>
                (!type || type === event.event) &&
                (!owner || owner === event.repository?.owner.login) &&
                (!repository || repository === event.repository?.name)
        });
    }

    @OpenAPI({
        description: 'Organization SSE'
    })
    @Get('/orgs/:org/events')
    @OnUndefined(204)
    getOrgEvent(
        @Param('org') owner: string,
        @Req() request: IncomingMessage,
        @Res() response: ServerResponse,
        @Ctx() { req, res } = {} as Context
    ) {
        return this.bootSSE(req || request, res || response, { owner });
    }

    @OpenAPI({
        description: 'Repository SSE'
    })
    @Get('/repos/:owner/:repo/events')
    getRepoEvent(
        @Param('owner') owner: string,
        @Param('repo') repository: string,
        @Req() request: IncomingMessage,
        @Res() response: ServerResponse,
        @Ctx() { req, res } = {} as Context
    ) {
        return this.bootSSE(req || request, res || response, {
            owner,
            repository
        });
    }

    @OpenAPI({
        description: 'Repository issue SSE'
    })
    @Get('/repos/:owner/:repo/issues/events')
    getIssueEvent(
        @Param('owner') owner: string,
        @Param('repo') repository: string,
        @Req() request: IncomingMessage,
        @Res() response: ServerResponse,
        @Ctx() { req, res } = {} as Context
    ) {
        return this.bootSSE(req || request, res || response, {
            owner,
            repository,
            event: 'issues'
        });
    }
}
