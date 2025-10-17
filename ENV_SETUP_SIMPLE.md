# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Database
POSTGRES_URL=your_postgres_connection_string_here

# Authentication
AUTH_SECRET=your_secure_random_secret_here

# API Key for your scraper
SCRAPER_API_KEY=your_secure_api_key_here

# App URL (will be your Vercel domain initially)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

## How to Generate Secure Values

### For AUTH_SECRET:
```bash
# Run this in your terminal to generate a secure secret:
openssl rand -base64 32
```

### For SCRAPER_API_KEY:
```bash
# Generate another secure API key:
openssl rand -base64 32
```

## Database Setup

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Click on the "Storage" tab
3. Click "Create Database" → Select "Postgres"
4. Copy the connection string to `POSTGRES_URL`

### Option 2: External Database Providers
- **Neon**: [neon.tech](https://neon.tech) (free tier available)
- **Supabase**: [supabase.com](https://supabase.com) (free tier available)
- **Railway**: [railway.app](https://railway.app) (free tier available)

## Deployment

1. Set these environment variables in your Vercel project settings
2. Deploy your application
3. Run database migrations: `npm run db:migrate`

That's it! No payment processing or email services needed.
