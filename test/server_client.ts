import { Server } from 'http';
import Koa from 'koa';
import KoAJAX from 'koajax';
import { useKoaServer } from 'routing-controllers';

import { controllers } from '../core/index.js';

const { PORT = 8080 } = process.env;

const app = new Koa();

useKoaServer(app, { controllers });

var server: Server | undefined;

export async function startServer() {
    console.time('Server boot');

    await new Promise<void>(
        (resolve, reject) =>
            (server = app.on('error', reject).listen(PORT, resolve))
    );
    console.timeEnd('Server boot');
}

export const stopServer = () =>
    new Promise<void>(
        (resolve, reject) =>
            server?.close(error => (error ? reject(error) : resolve())) ||
            resolve()
    );
export const client = new KoAJAX.HTTPClient({
    baseURI: `http://127.0.0.1:${PORT}`,
    responseType: 'json'
});
