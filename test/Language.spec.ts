import assert from 'node:assert';
import { after, before, describe, it } from 'node:test';

import { Language } from '../core/index.js';
import { client, startServer, stopServer } from './server_client.js';

describe('Language API', () => {
    before(startServer);
    after(stopServer);

    it('should get a language list of a user', async () => {
        const { body } = await client.get<Language[]>(
            '/users/TechQuery/languages'
        );
        assert(body instanceof Array);
    });
});
