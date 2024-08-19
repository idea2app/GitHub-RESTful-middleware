import 'reflect-metadata';

/**
 * Sub set of Express & Koa `Request` object
 *
 * @typedef {object} CommonRequest
 * @property {import('koajax').Request['method']} method
 * @property {import('koa').Request['hostname']} hostname
 * @property {import('koa').Request['originalUrl']} originalUrl
 *
 * @see {@link https://expressjs.com/en/4x/api.html#req}
 * @see {@link https://koajs.com/#request}
 */

/**
 * Sub set of Express & Koa `Response` object
 *
 * @typedef {object} CommonResponse
 * @property {import('koa').Response['status'] | import('express').Response['status']} status
 * @property {import('koa').Response['set']} set
 * @property {import('koa').Response['get']} get
 * @property {import('koa').Response['redirect']} redirect
 *
 * @see {@link https://expressjs.com/en/4x/api.html#res}
 * @see {@link https://koajs.com/#response}
 */

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
