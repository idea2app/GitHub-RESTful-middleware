# Express-GitHub

[Express middleware](http://expressjs.com/en/guide/using-middleware.html) for
[GitHub API v3](https://developer.github.com/v3/)

[![NPM Dependency](https://david-dm.org/TechQuery/Express-GitHub.svg)](https://david-dm.org/TechQuery/Express-GitHub)

[![NPM](https://nodei.co/npm/express-github.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/express-github/)

<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/terHRJgDULkGjswWhddcBSDJ/TechQuery/Express-GitHub'>
  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/terHRJgDULkGjswWhddcBSDJ/TechQuery/Express-GitHub.svg' />
</a>



## Feature

 1. [**OAuth 2.0**](https://oauth.net/2/) (Production Environment can be used for debugging of `localhost`)

 2. **API Proxy** (HTTP-only **Cookie Session** instead of Access Token is easy to use for Web front-end)

 3. Wrapper APIs to get the **Technique(Language) list** of a User or Organization

 4. **Diff to HTML** (Get `/repos/:owner/:repo/pull/:pull_num.diff` with `Accept: text/html`, the Diff Code will be converted to HTML by [diff2html](https://diff2html.xyz/))

 5. One **Hook URL** to receive all kinds of Event



## Usage

 - [JS Document](https://techquery.github.io/Express-GitHub/)

 - [API Document](https://techquery.github.io/Express-GitHub/HTTP/)

 - [Example](https://github.com/FreeCodeCamp-Chengdu/GDN/blob/master/server/GitHub.js)
