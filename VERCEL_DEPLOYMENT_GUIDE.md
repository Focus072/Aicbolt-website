# 🚀 Vercel Deployment Guide for AICBOLT

## Prerequisites
- GitHub account
- Vercel account (free tier available)
- Your project code ready for deployment

## Step 1: Prepare Your Code for Production

### 1.1 Clean Up Development Files
```bash
# Remove any temporary files
rm -f run-*.js
rm -f test-*.js
rm -f check-*.js
rm -f debug-*.js
rm -f revert-*.js
```

### 1.2 Ensure Build Works Locally
```bash
cd saas-starter
npm run build
```

If build fails, fix any TypeScript errors before proceeding.

## Step 2: Push to GitHub

### 2.1 Initialize Git (if not already done)
```bash
cd saas-starter
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

### 2.2 Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it: `aicbolt-website` (or your preferred name)
4. Make it **Public** (required for free Vercel)
5. Don't initialize with README (since you have code)
6. Click "Create repository"

### 2.3 Push Your Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/aicbolt-website.git
git branch -M main
git push -u origin main
```

## Step 3: Set Up Production Database

### 3.1 Choose Database Provider
**Option A: Vercel Postgres (Recommended)**
- Integrated with Vercel
- Easy setup and management
- Free tier available

**Option B: External PostgreSQL**
- Supabase (free tier)
- Railway (free tier)
- Neon (free tier)

### 3.2 Set Up Vercel Postgres
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" in the sidebar
3. Click "Create Database"
4. Choose "Postgres"
5. Name it: `aicbolt-db`
6. Select region closest to your users
7. Click "Create"

## Step 4: Deploy to Vercel

### 4.1 Connect GitHub Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Click "Import"

### 4.2 Configure Project Settings
- **Framework Preset**: Next.js
- **Root Directory**: `./saas-starter` (if your repo has the saas-starter folder)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4.3 Set Environment Variables
In Vercel project settings, add these environment variables:

```
POSTGRES_URL=postgres://username:password@host:port/database
AUTH_SECRET=your-secret-key-here
SCRAPER_API_KEY=your-scraper-api-key
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production
```

**Important**: 
- Get `POSTGRES_URL` from your Vercel Postgres database
- Generate a new `AUTH_SECRET` (32+ characters)
- Use your actual scraper API key

## Step 5: Database Migration

### 5.1 Run Database Setup
After deployment, you'll need to set up your database tables. You can either:

**Option A: Use Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel env pull .env.local
npx tsx lib/db/setup.ts
```

**Option B: Manual SQL Execution**
Connect to your database and run the migration files in order:
- `0000_soft_the_anarchist.sql`
- `0001_dashboard_tables.sql`
- `0002_business_control_center.sql`
- `0003_web_form_submissions.sql`
- `0005_add_production_indexes.sql`
- `0006_add_notes_to_leads.sql`
- `0007_ensure_place_id_unique.sql`
- `0008_create_zip_requests_table.sql`
- `0009_create_categories_table.sql`
- `0010_add_category_to_zip_requests.sql`
- `0011_add_category_id_foreign_key.sql`
- `0012_update_users_table_username.sql`
- `0013_add_organization_id_to_users.sql`

## Step 6: Test Your Deployment

### 6.1 Check Basic Functionality
1. Visit your Vercel URL
2. Test the homepage loads
3. Try logging in with admin credentials
4. Check dashboard functionality

### 6.2 Test Database Operations
1. Create a test user account
2. Test leads functionality
3. Test zip codes functionality
4. Verify all API endpoints work

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain
1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable

## Step 8: Production Checklist

### 8.1 Security
- [ ] All environment variables are set
- [ ] Database is properly secured
- [ ] API keys are not exposed in code
- [ ] Admin account is properly configured

### 8.2 Performance
- [ ] Images are optimized
- [ ] Database indexes are created
- [ ] Caching is configured
- [ ] Build completes without errors

### 8.3 Functionality
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Database operations work
- [ ] API endpoints respond correctly
- [ ] File uploads work (if applicable)

## Troubleshooting

### Common Issues

**Build Failures**
- Check TypeScript errors
- Ensure all dependencies are in package.json
- Verify import paths are correct

**Database Connection Issues**
- Verify POSTGRES_URL is correct
- Check database is accessible
- Ensure migrations have run

**Environment Variable Issues**
- Double-check all required variables are set
- Verify variable names match exactly
- Redeploy after adding new variables

**Authentication Issues**
- Verify AUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Ensure admin user exists in database

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify database connectivity
4. Test API endpoints individually

## Next Steps After Deployment

1. **Monitor Performance**: Use Vercel Analytics
2. **Set Up Monitoring**: Consider error tracking services
3. **Backup Strategy**: Regular database backups
4. **SSL Certificate**: Automatically handled by Vercel
5. **CDN**: Automatically handled by Vercel

---

**Your website will be live at**: `https://your-project-name.vercel.app`

Good luck with your deployment! 🚀
