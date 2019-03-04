# Express-GitHub

[Express middleware](http://expressjs.com/en/guide/using-middleware.html) for
[GitHub API v3](https://developer.github.com/v3/)

[![NPM Dependency](https://david-dm.org/TechQuery/Express-GitHub.svg)](https://david-dm.org/TechQuery/Express-GitHub)

[![NPM](https://nodei.co/npm/express-github.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/express-github/)



## Feature

 1. [**OAuth 2.0**](https://oauth.net/2/) (Production Environment can be used for debugging of `localhost`)

 2. **API Proxy** (HTTP-only **Cookie Session** instead of Access Token is easy to use for Web front-end)

 3. Wrapper APIs to get the **Technique(Language) list** of a User or Organization

 4. **Diff to HTML** (Get `/repos/:owner/:repo/pull/:pull_num.diff` with `Accept: text/html`, the Diff Code will be converted to HTML by [diff2html](https://diff2html.xyz/))

 5. One **Hook URL** to receive all kinds of Event

 6. 3 APIs of [Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) about Organization & Repository



## Usage

 - [JS Document](https://tech-query.me/Express-GitHub/)

 - [API Document](https://tech-query.me/Express-GitHub/HTTP/)

 - [Example](https://github.com/FreeCodeCamp-Chengdu/GDN/blob/master/server/GitHub.js)
