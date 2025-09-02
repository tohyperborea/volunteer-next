# volunteer-next

A system to support the organisation of alternative arts festivals.

## Technologies

- [React](https://react.dev/)
- [Next.js](https://nextjs.org)
- [Auth.js](https://authjs.dev)
- [Radix UI](https://www.radix-ui.com/)
- [Tanstack Query](https://tanstack.com/query/latest)
- [PostgreSQL](https://www.postgresql.org/)

## Getting Started

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`
3. Create an AUTH_SECRET token: `npx auth secret`
4. Fill in all the `.env.local` placeholder values
5. Start the database: `docker-compose up`
6. Run development server: `npm run dev`
7. Visit http://localhost:3000

## Development workflow

1. Pull `main`
2. Create a new branch for your change
3. Implement and test your work in your branch
4. Open a Pull Request in GitHub to merge your branch into `main`
5. Get at least one 👍 on your PR and then squash merge it
