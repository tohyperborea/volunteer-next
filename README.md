# volunteer-next

A system to support the organisation of alternative arts festivals.

## Technologies

- [React](https://react.dev/) - Rendering
- [Next.js](https://nextjs.org) - Routing and server-side rendering
- [Better Auth](https://www.better-auth.com/) - Authentication
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Tanstack Query](https://tanstack.com/query/latest) - Data querying
- [PostgreSQL](https://www.postgresql.org/) - Data persistence
- [Liquibase](https://www.liquibase.com/) - Database schema migrations
- [Docker](https://www.docker.com/) - System architecture

## Getting Started

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`
3. Create an AUTH_SECRET token: `npx auth secret`
4. Fill in all the `.env.local` placeholder values
5. Start the database: `npm run start:db`
6. Run development server: `npm run dev`
7. Visit http://localhost:3000

## Development workflow

1. Pull `main`
2. Create a new branch for your change
3. Implement and test your work in your branch
4. Open a Pull Request in GitHub to merge your branch into `main`
5. Get at least one 👍 on your PR and then squash merge it

## Using Pretix as an auth provider for local development

Sideburn uses its Pretix instance as the authentication provider for volunteering. Here's how to set it up:

1. If using a local Pretix instance, set it up first:
   1. Checkout Pretix: `git clone git@github.com:tohyperborea/pretix.git`
   2. Build the docker image: `docker build -t local_pretix .`
   3. Start the docker container: `docker run -p 8000:80 local_pretix`
   4. Navigate to `http://localhost:8000/control` and log in with default credentials `admin@localhost`:`admin`
   5. Create a new Organizer with any name. URLs in these instructions will assume name `ORG_NAME`
   6. Navigate to the `Customer accounts` section of `Organizer Settings` (http://localhost:8000/control/organizer/ORG_NAME/edit#tab-0-3-open) and enable `Allow customers to create accounts`. Save.
2. Choose a value for `OAUTH_PROVIDER_ID` in `.env.local`. This can be anything, but keep it short and URL-friendly.
3. Navigate to the `SSO clients` settings under the `Customer accounts` section (http://localhost:8000/control/organizer/ORG_NAME/ssoclients) and click `Create a new SSO client`
4. Fill in any application name, and the following Redirection URI: `http://localhost:3000/api/auth/oauth2/callback/{OAUTH_PROVIDER_ID}` where `{OAUTH_PROVIDER_ID}` matches whatever you have set in `.env.local`
5. Save, and copy the Client Secret displayed at the top to the `OAUTH_CLIENT_SECRET` value in `.env.local`
6. Copy the Client ID to the `OAUTH_CLIENT_ID` value in `.env.local`
7. Set the value of `OAUTH_DISCOVERY_URL` in `.env.local` to `{PRETIX_URI}/ORG_NAME/.well-known/openid-configuration` where `{PRETIX_URI}` is the URI of your Pretix instance. For local pretix as configured in step 1, this would be `http://localhost:8000`
8. Profit!

## Deploying (e.g. Vercel + Neon)

Migrations are run via Liquibase. For local development, Liquibase runs automatically when you start the database (`npm run start:db`).

For a hosted Postgres (e.g. Neon), run migrations with:

```bash
npm run migrate:neon
```

Ensure `POSTGRES_URL` is set in `.env.local` (e.g. `postgresql://user:password@host/dbname?sslmode=require`). The script connects to the remote database and applies any pending migrations.

Then set `POSTGRES_URL` (or the individual `POSTGRES_*` vars) in your deployment (e.g. Vercel env).
