import assert from 'node:assert';
import { after, before, describe, it } from 'node:test';

import { client, header, startServer, stopServer } from './server_client.js';
import { Repository } from '../core/Language.js';

describe('Proxy API', () => {
    before(startServer);
    after(stopServer);

    it('should get a diff file of a pull request', async () => {
        const { body } = await client.get<string>(
            '/repos/idea2app/GitHub-RESTful-middleware/pull/1.diff',
            header
        );
        assert(body?.includes('diff --git'));
    });

    it('should get a diff file of a pull request in HTML format', async () => {
        const { body } = await client.get<string>(
            '/repos/idea2app/GitHub-RESTful-middleware/pull/1.diff',
            { ...header, Accept: 'text/html' }
        );
        assert(body?.includes('<div class="d2h-wrapper">'));
    });

    it('should proxy any other GitHub REST API as fallback', async () => {
        const { body } = await client.get<Repository>(
            '/repos/idea2app/GitHub-RESTful-middleware',
            header
        );
        assert(body?.name === 'GitHub-RESTful-middleware');
    });
});
