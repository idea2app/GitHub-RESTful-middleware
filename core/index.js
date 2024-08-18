/**
 * Express framework
 *
 * @namespace Express
 *
 * @see {@link https://expressjs.com/en/4x/api.html}
 */

/**
 * Express Request
 *
 * @memberof Express
 * @inner
 *
 * @typedef Request
 *
 * @see {@link https://expressjs.com/en/4x/api.html#req}
 */

/**
 * Express Response
 *
 * @memberof Express
 * @inner
 *
 * @typedef Response
 *
 * @see {@link https://expressjs.com/en/4x/api.html#res}
 */

/**
 * Express Router
 *
 * @function Express.Router
 *
 * @see {@link https://expressjs.com/en/4x/api.html#router}
 */
const Router = require('express').Router,
    config = {
        userAgent: 'Express Middleware - GitHub API',
        apiRoot: 'https://api.github.com'
    };

/**
 * API configuration
 *
 * @typedef {object} APIConfig
 *
 * @property {string}   AppID
 * @property {string}   AppSecret
 * @property {string[]} [AppScope]
 * @property {string}   [HookSecret] - Secret code of a **Web hook**
 */

/**
 * Session data
 *
 * @typedef {object} SessionData
 *
 * @property {string} AccessToken - Access token of **OAuth 2.0**
 *
 * @see {@link https://developer.github.com/v3/users/#get-the-authenticated-user|More data about the Login User}
 */

/**
 * Session handler
 *
 * @callback SessionHandler
 *
 * @param {Express~Request}  request
 * @param {Express~Response} response
 * @param {SessionData}      [data]
 */

/**
 * Local configuration
 *
 * @typedef {object} LocalConfig
 *
 * @property {SessionHandler} setSession
 * @property {SessionHandler} getSession
 * @property {string}         [successURL=""] - URL to redirect when OAuth succeed
 */

/**
 * Middleware instance
 *
 * @typedef {object} Middleware
 *
 * @property {Express.Router}        router
 * @property {external:EventEmitter} emitter
 */

import OAuth from './OAuth';
import Language from './Language';
import Hook from './Hook';
import Proxy from './Proxy';

/**
 * @global
 *
 * @param {APIConfig}   API_Config
 * @param {LocalConfig} Local_Config
 *
 * @return {Middleware}
 */
export default (API_Config, Local_Config) => {
    const router = Router();

    Object.assign(config, API_Config, Local_Config);

    OAuth.call(router, config);

    Language.call(router, config);

    const emitter = Hook.call(router, config);

    Proxy.call(router, config);

    return { router, emitter };
};
