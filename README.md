# Next.js Business Management App

This is a business management application built with **Next.js** featuring authentication, dashboard management, and business operations tracking.

## Features

- Marketing landing page (`/`) with animated Terminal element
- Dashboard pages with CRUD operations on users/teams
- Basic RBAC with Owner and Member roles
- Business management (clients, projects, finance, forms)
- Lead generation and analytics
- Username/password authentication with JWTs stored to cookies
- Global middleware to protect logged-in routes
- Activity logging system for user events

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/nextjs/saas-starter
cd saas-starter
pnpm install
```

## Running Locally

1. **Set up environment variables** (see `ENV_SETUP_SIMPLE.md` for details):

```bash
# Create .env.local file with required variables
POSTGRES_URL=your_postgres_connection_string
AUTH_SECRET=your_secure_secret
SCRAPER_API_KEY=your_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. **Install dependencies**:

```bash
npm install
```

3. **Run database migrations**:

```bash
npm run db:migrate
npm run db:seed
```

This will create the following default user:

- Username: `admin`
- Password: `admin123`

4. **Start the development server**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

## Going to Production

When you're ready to deploy your application to production, follow these steps:

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/) and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables:

1. `POSTGRES_URL`: Set this to your production database URL.
2. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.
3. `SCRAPER_API_KEY`: Set this to your secure API key.
4. `NEXT_PUBLIC_APP_URL`: Set this to your production domain.

## Other Templates

While this template is intentionally minimal and to be used as a learning resource, there are other paid versions in the community which are more full-featured:

- https://achromatic.dev
- https://shipfa.st
- https://makerkit.dev
- https://zerotoshipped.com
- https://turbostarter.dev
