# 🚀 Safe Deployment Guide

## Pre-Deployment Checklist

### 1. **Always Run Pre-Deploy Checks**
```bash
npm run pre-deploy
```
This will:
- ✅ Check TypeScript compilation
- ✅ Test Next.js build
- ✅ Validate environment variables
- ✅ Ensure all dependencies are correct

### 2. **Environment Variables Setup**
Before deploying, ensure these are set in Vercel:

**Required:**
- `POSTGRES_URL` - Your database connection string
- `AUTH_SECRET` - Random 32+ character string
- `SCRAPER_API_KEY` - Your API key for external services

**Optional:**
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - Same as AUTH_SECRET

### 3. **Safe Deployment Process**

#### Option A: Automated Safe Deploy
```bash
npm run deploy-safe
```
This runs all checks before pushing to GitHub.

#### Option B: Manual Process
```bash
# 1. Run checks
npm run pre-deploy

# 2. If checks pass, commit and push
git add .
git commit -m "Your changes"
git push origin main
```

### 4. **Common Issues & Solutions**

#### TypeScript Errors
- **Cause:** Missing type definitions or incorrect imports
- **Solution:** Run `npx tsc --noEmit` locally first

#### Next.js 15 Compatibility
- **Cause:** Using old params syntax
- **Solution:** Always use `const resolvedParams = await params;`

#### Environment Variables
- **Cause:** Missing or invalid env vars
- **Solution:** Use the validation script before deploying

#### Database Issues
- **Cause:** Schema mismatches
- **Solution:** Run migrations locally first

### 5. **Post-Deployment Verification**

1. **Check Vercel Build Logs**
   - Look for "✓ Compiled successfully"
   - No TypeScript errors
   - No missing dependencies

2. **Test Your Application**
   - Visit your production URL
   - Test key functionality
   - Check database connections

3. **Monitor for Issues**
   - Check Vercel function logs
   - Monitor database performance
   - Watch for runtime errors

## 🛡️ Prevention Tips

1. **Never deploy without testing locally first**
2. **Always run `npm run pre-deploy` before pushing**
3. **Keep your dependencies updated**
4. **Use TypeScript strict mode**
5. **Test with production environment variables**

## 🆘 Emergency Rollback

If deployment fails:
1. Revert to last working commit
2. Fix issues locally
3. Test thoroughly
4. Deploy again

```bash
git revert HEAD
git push origin main
```
