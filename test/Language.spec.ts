import assert from 'node:assert';
import { after, before, describe, it } from 'node:test';

import { Language } from '../core/index.js';
import { client, header, startServer, stopServer } from './server_client.js';

function assertLanguages(list?: Language[]) {
    assert(list instanceof Array);
    assert(typeof list[0].name === 'string');
    assert(typeof list[0].count === 'number');
    assert(
        list.every(
            ({ count }, index, list) =>
                count > 0 && (!list[index + 1] || count > list[index + 1].count)
        )
    );
}

describe('Language API', () => {
    before(startServer);
    after(stopServer);

    it('should get a language list of a user', async () => {
        const { body } = await client.get<Language[]>(
            '/users/TechQuery/languages',
            header
        );
        assertLanguages(body);
    });

    it('should get a language list of a signed-in user', async () => {
        const { body } = await client.get<Language[]>(
            '/user/languages',
            header
        );
        assertLanguages(body);
    });

    it('should get a language list of an organization', async () => {
        const { body } = await client.get<Language[]>(
            '/orgs/idea2app/languages',
            header
        );
        assertLanguages(body);
    });
});
