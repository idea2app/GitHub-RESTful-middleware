# Express-GitHub

[Express middleware](http://expressjs.com/en/guide/using-middleware.html) for
[GitHub API v3](https://developer.github.com/v3/)

[![NPM Dependency](https://david-dm.org/TechQuery/Express-GitHub.svg)](https://david-dm.org/TechQuery/Express-GitHub)

[![NPM](https://nodei.co/npm/express-github.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/express-github/)



## Feature

 1. [**OAuth 2.0**](https://oauth.net/2/) (Production Environment can be used for debugging of `localhost`)

 2. **API Proxy** (HTTP-only **Cookie Session** instead of Access Token is easy to use for Web front-end)

 3. **Diff to HTML** (Get `/repos/:owner/:repo/pull/:pull_num.diff` with `Accept: text/html`, the Diff Code will be converted to HTML by [diff2html](https://diff2html.xyz/))



## Usage

[Example](https://github.com/FreeCodeCamp-Chengdu/GDN/blob/master/server/app.js#L43)
