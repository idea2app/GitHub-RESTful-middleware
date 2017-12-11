'use strict';

const router = require('express').Router(),
      config = {
          userAgent:    'Express Middleware - GitHub API',
          apiRoot:      'https://api.github.com'
      };


//  Export as a Middleware Factory

module.exports = function (API_Config, Local_Config) {

    Object.assign(config, API_Config, Local_Config);

    require('./OAuth').call(router, config);

    require('./Language').call(router, config);

    require('./Proxy').call(router, config);

    return router;
};
