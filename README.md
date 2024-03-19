# note-taker-server
Backend for note taker app. Frontend code can be found [here](https://github.com/AnonymousRandomPerson/note-taker-ui). The deployed app is accessed [here](https://note-taker-ui.fly.dev/).

## Running locally
1. Run `npm install` to download dependencies.
2. Start up a Postgres instance. By default, the app connects to the Postgres instance at `localhost:5432` using the default `postgres` user with no password. The connection can be configured with the environment variables `DB_HOST`, `DB_PORT`, `DB_USERNAME`, and `DB_PASSWORD` if needed.
3. Run `npm run start` to run the server.

Tests can be run with `npm run test` (unit tests) and `npm run test:e2e` (database tests).

## Implementation
The backend server uses the [NestJS](https://nestjs.com/) framework with [TypeScript](https://www.typescriptlang.org/) to serve endpoints. [Postgres](https://www.postgresql.org/) is the backing database, and [TypeORM](https://typeorm.io/) is used to manage database entities within the app. Unit tests are implemented with [Jest](https://jestjs.io/), alongside [SuperTest](https://www.npmjs.com/package/supertest) for testing with the real database.

The frontend uses the [Next.js](https://nextjs.org/) framework for [React](https://react.dev/). Given the limited number of notes, I opted for a client-side search rather than server-side; this is more responsive to the user, as it skips the endpoint/database call. Case-sensitivity was not specified in the acceptance criteria, so I assumed a case-insensitive search.

The backend, frontend, and database are all hosted using [Fly.io](https://fly.io/). Deployments are set up as a CI/CD (continuous integration/deployment) model using [GitHub Actions](https://docs.github.com/en/actions) pipelines in the backend and frontend repos to automatically lint, test, and deploy committed code. Apps are packaged in [Docker](https://www.docker.com/) containers before deployment.

## Challenges
Before now, I hadn't set up the deployment of a full-stack application publicly on my own. I have personal projects that deploy static web pages using GitHub Pages, but this does not support backend servers or databases. Meanwhile, my current workplace deploys using GCP (Google Cloud Platform), though the company has Cloud teams dedicated to the infrastructure side, so I didn't experience the whole setup process myself. Larger cloud offerings like GCP and AWS felt like overkill for a small app, so I researched simpler hosting options and found that Fly.io had a free pricing tier for my needs. From here, the learning process was smooth, reading through documentation and learning manual and automated deployments from there.

I've used pure React before, though not Next.js. I heard plenty about Next.js, and a simple CRUD app like this was an opportune time to learn the framework. While the mixed server/client-side rendering took a bit to get used to, I see the value of Next.js seamlessly blending between the two. This app doesn't make use of all Next.js's features like routing, though I'm interested to learn more in the future.

## Potential changes
There are several places of improvement that were not needed for the scope of this demo, but might be useful if this app were to go to production.
* Right now the notes are shared between all users that access the app. If users each want their own private set of notes within the app, login/authentication could be added. Depending on users' needs, another alternative is storing notes in the browser's local storage instead of a database.
* Depending on how many notes the user could potentially enter, strategies such as pagination, virtual scrolling, or infinite scrolling can be used to avoid slowing down the user's browser.
* Deletion happens immediately on click. Since this is a destructive action, users may want to click through a confirmation before deleting a note.
* Cancelling an edit or navigating out of the page will lose any edits that the user is making. To prevent losing unsaved changes by accident, some confirmation (including listening to `window.onbeforeunload`) could be useful.
* The visual design of the UI is very basic, and there's plenty of room to make it more visually appealing.
* The web URL could use a proper domain name rather than the fly.dev test domain.
* The favicon is the default Next.js icon, and it could be swapped out for a brand logo or another distinguishing image.
* The deployed app has limited resources, namely 256 MB of RAM per service, one instance of each service, and 1 GB of disk space for the database. A production app will likely need more resources to support more users.
* Right now, a malicious user could flood the app with notes or other requests using an automated script, potentially causing stability issues. Solutions such as rate-limiting would help guard against this.
* A test Postgres instance could be set up to allow the build pipeline to run the database tests automatically, either on push or on a time interval.
* Rather than `console.log`, a logging library could be used to distinguish between different log severity levels like errors and debug logs.
