'use strict';

const router = require('express').Router(),
      config = { },
      API_Root = 'https://api.github.com';


//  Export as a Middleware Factory

module.exports = function (API_Config, Local_Config) {

    Object.assign(config, API_Config, Local_Config);

    require('./OAuth').call(router, API_Root, config);

    require('./Proxy').call(router, API_Root, config);

    return router;
};
