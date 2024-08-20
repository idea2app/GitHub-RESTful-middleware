# GitHub-RESTful-middleware

[Express][1] & [Koa][2] compatible middleware for [GitHub RESTful API][3]

[![NPM Dependency](https://img.shields.io/librariesio/github/idea2app/GitHub-RESTful-middleware.svg)][5]
[![CI & CD](https://github.com/idea2app/GitHub-RESTful-middleware/actions/workflows/main.yml/badge.svg)][6]

[![NPM](https://nodei.co/npm/github-restful-middleware.png?downloads=true&downloadRank=true&stars=true)][7]

## Version

| SemVer  |  branch  |    status    |  language  |   framework   | API schema |
| :-----: | :------: | :----------: | :--------: | :-----------: | :--------: |
| `>=0.6` |  `main`  | ✅developing | TypeScript | Express & Koa |  Swagger   |
| `<0.6`  | `master` | ❌deprecated | ECMAScript |    Express    |   APIDoc   |

## Feature

1.  [**OAuth 2.0**][8] (Production Environment can be used for debugging of `localhost`)

2.  **API Proxy** (HTTP-only **Cookie Session** instead of Access Token is easy to use for Web front-end)

3.  Wrapper APIs to get the **Technique(Language) list** of a User or Organization

4.  **Diff to HTML** (Get `/repos/:owner/:repo/pull/:pull_num.diff` with `Accept: text/html`, the Diff Code will be converted to HTML by [diff2html][9])

5.  One **Hook URL** to receive all kinds of Event

6.  3 APIs of [Server-sent events][10] about Organization & Repository

## Usage

-   [API Document][11]

### with Koa

The sample codes shown below will serve all the APIs of GitHub RESTful middleware with Koa, [Swagger][12] UI + JSON spec & Mock APIs.

#### Install command

```shell
npm i github-restful-middleware koa koa-logger koa2-swagger-ui koagger routing-controllers
```

#### Core logic (`index.ts`)

```ts
import Koa from 'koa';
import KoaLogger from 'koa-logger';
import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';
import { useKoaServer } from 'routing-controllers';
import { controllers } from 'github-restful-middleware';

const { NODE_ENV, PORT = 8080 } = process.env;
const isProduct = NODE_ENV === 'production';

export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers // other controllers of your own can be added here
});
const app = new Koa().use(KoaLogger()).use(swagger({ exposeSpec: true }));

if (!isProduct) app.use(mocker());

useKoaServer(app, { ...router, cors: true });

console.time('Server boot');

app.listen(PORT, () => console.timeEnd('Server boot'));
```

#### Boot command

```shell
npx tsx index.ts
```

### with Express

Just relpace `useKoaServer()` with `useExpressServer()` in [`routing-controllers`][13] & other equivalent middlewares for Express.

[1]: https://expressjs.com/
[2]: https://koajs.com/
[3]: https://docs.github.com/en/rest
[5]: https://libraries.io/npm/github-restful-middleware
[6]: https://github.com/idea2app/GitHub-RESTful-middleware/actions/workflows/main.yml
[7]: https://nodei.co/npm/github-restful-middleware/
[8]: https://oauth.net/2/
[9]: https://diff2html.xyz/
[10]: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
[11]: https://idea2app.github.io/GitHub-RESTful-middleware/
[12]: https://swagger.io/
[13]: https://github.com/typestack/routing-controllers
