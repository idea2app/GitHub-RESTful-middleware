import 'reflect-metadata';

import { Response as ExpressResponse } from 'express';
import { Request as KoaRequest, Response as KoaResponse } from 'koa';
import { Request as KoAJAX_Request } from 'koajax';

/**
 * Sub set of Express & Koa `Request` object
 *
 * @see {@link https://expressjs.com/en/4x/api.html#req}
 * @see {@link https://koajs.com/#request}
 * @see {@link https://web-cell.dev/KoAJAX/interfaces/Request.html}
 */
export type CommonRequest = Pick<KoAJAX_Request, 'method'> &
    Pick<KoaRequest, 'hostname' | 'originalUrl'>;

/**
 * Sub set of Express & Koa `Response` object
 *
 * @see {@link https://expressjs.com/en/4x/api.html#res}
 * @see {@link https://koajs.com/#response}
 */
export interface CommonResponse
    extends Pick<KoaResponse, 'set' | 'get' | 'redirect'> {
    status: ExpressResponse['status'] | KoaResponse['status'];
}

import { OauthController } from './OAuth.js';
import { LanguageController } from './Language.js';
import { ProxyController } from './Proxy.js';

export * from './OAuth.js';
export * from './Language.js';
export * from './Proxy.js';

export const controllers = [
    OauthController,
    LanguageController,
    ProxyController
];
