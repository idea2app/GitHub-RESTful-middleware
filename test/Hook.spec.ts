import EventSource from 'eventsource';
import assert from 'node:assert';
import { after, before, describe, it, mock } from 'node:test';

import { client, startServer, stopServer } from './server_client.js';

describe('Hook API', async () => {
    var orgEvent: EventSource,
        repoEvent: EventSource,
        repoIssueEvent: EventSource;

    before(async () => {
        await startServer();

        orgEvent = new EventSource(`${client.baseURI}/orgs/idea2app/events`);
        repoEvent = new EventSource(
            `${client.baseURI}/repos/idea2app/GitHub-RESTful-middleware/events`
        );
        repoIssueEvent = new EventSource(
            `${client.baseURI}/repos/idea2app/GitHub-RESTful-middleware/issues/events`
        );
        orgEvent.onerror =
            repoEvent.onerror =
            repoIssueEvent.onerror =
                console.error;
    });

    after(async () => {
        orgEvent.close();
        repoEvent.close();
        repoIssueEvent.close();

        await stopServer();
    });

    /**
     * @todo fix EventSource connections's error
     */
    await it.skip('should receive Web hook events from GitHub', async () => {
        const orgHandler = (orgEvent.onmessage = mock.fn(console.log)),
            repoHandler = (repoEvent.onmessage = mock.fn()),
            repoIssueHandler = (repoIssueEvent.onmessage = mock.fn());

        await client.post(
            '/hookHub',
            {
                id: 1,
                event: 'push',
                repository: { name: 'other-repo', owner: { login: 'idea2app' } }
            },
            { 'X-GitHub-Event': 'push', 'X-GitHub-Delivery': '1' }
        );
        await new Promise<void>(resolve => setTimeout(resolve, 1000));

        assert(orgHandler.mock.callCount() === 1);
        assert(repoHandler.mock.callCount() === 0);
        assert(repoIssueHandler.mock.callCount() === 0);
    });
});
