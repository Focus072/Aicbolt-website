# 🚀 Production Deployment Checklist

## Pre-Deployment Validation

### ✅ Step 1: Validate Environment Variables

Run the validation script:
```bash
cd saas-starter
npx tsx scripts/validate-env.ts
```

**Expected Output:**
```
✓ POSTGRES_URL                       Set
✓ AUTH_SECRET                        Set
✓ SCRAPER_API_KEY                    Set
✅ All required environment variables are set!
```

**If validation fails:**
1. Add missing variables to your hosting platform's environment settings
2. Ensure all values are properly escaped (no quotes needed in most platforms)
3. Re-run validation

---

### ✅ Step 2: Run Database Migrations

**Option A - Using Drizzle (Recommended):**
```bash
cd saas-starter
npx drizzle-kit push
```

Select **"+ create column"** for all new fields when prompted.

**Option B - Manual SQL:**
```bash
# Connect to production database and run:
psql "your-production-postgres-url" -f lib/db/migrations/0003_recreate_leads_table.sql
psql "your-production-postgres-url" -f lib/db/migrations/0004_add_user_permissions.sql
psql "your-production-postgres-url" -f lib/db/migrations/0005_add_production_indexes.sql
```

**Verify migrations:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'users');

-- Check indexes were created
SELECT indexname FROM pg_indexes 
WHERE tablename = 'leads';
```

---

### ✅ Step 3: Build Application

Test production build locally:
```bash
cd saas-starter
npm run build
```

**Expected:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

**If build fails:**
1. Check for TypeScript errors
2. Verify all imports are correct
3. Fix linter errors
4. Re-run build

---

### ✅ Step 4: Configure Production Environment

Set these environment variables in your hosting platform (Vercel/Railway/etc.):

#### **Required Variables:**

```bash
# Database
POSTGRES_URL=postgresql://user:password@production-host:5432/database

# Authentication
AUTH_SECRET=your-production-auth-secret-key

# n8n Scraper API
SCRAPER_API_KEY=your-production-scraper-api-key

# Application URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### **Optional Variables:**

```bash
# Email (if using Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx

```

**Security Notes:**
- ⚠️ Never use development keys in production
- ⚠️ Generate new random keys for production:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- ⚠️ Use different `SCRAPER_API_KEY` than development
- ⚠️ Ensure database uses SSL in production

---

### ✅ Step 5: Deploy Application

#### **Vercel Deployment:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd saas-starter
vercel --prod
```

#### **Railway Deployment:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

#### **Manual Deployment:**

```bash
# Build
npm run build

# Start production server
npm start
```

---

### ✅ Step 6: Post-Deployment Verification

#### **Test Core Functionality:**

**1. Database Connection:**
```bash
curl https://yourdomain.com/api/user
```
Expected: JSON response or auth redirect (not 500 error)

**2. Leads API (External):**
```bash
curl -X POST https://yourdomain.com/api/leads \
  -H "Authorization: Bearer YOUR_PRODUCTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "place_id": "prod_test_001",
    "title": "Production Test Lead"
  }'
```
Expected: 201 Created

**3. Leads Dashboard:**
```
https://yourdomain.com/leads
```
Expected: Login redirect → Dashboard loads → Test lead visible

**4. Analytics:**
```
https://yourdomain.com/analytics
```
Expected: Charts load with lead data

**5. Account Management:**
```
https://yourdomain.com/account
```
Expected: Only accessible to galaljobah@gmail.com

**6. Dark Mode:**
- Toggle dark mode on Dashboard
- Navigate to other pages
- Theme should persist across navigation

---

### ✅ Step 7: Configure n8n Production Workflow

Update your n8n workflow:

**1. Update HTTP Request Node URL:**
```
https://yourdomain.com/api/leads
```

**2. Set Production API Key:**
```
Authorization: Bearer YOUR_PRODUCTION_SCRAPER_API_KEY
```

**3. Test Single Execution:**
- Run workflow with 1 place
- Check for 201 response
- Verify lead appears in dashboard

**4. Enable Workflow:**
- Set to active
- Monitor for errors
- Check dashboard for incoming leads

---

### ✅ Step 8: Performance Optimization

#### **Verify Indexes:**
```sql
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('leads', 'users')
ORDER BY tablename, indexname;
```

Should show indexes on:
- `leads.place_id`
- `leads.status`
- `leads.created_at`
- `leads.status + created_at` (composite)
- `users.email`
- `users.invite_token`
- `users.is_active`

#### **Check Query Performance:**
```sql
EXPLAIN ANALYZE 
SELECT * FROM leads 
WHERE status = 'new' 
ORDER BY created_at DESC 
LIMIT 50;
```

Should use indexes (not Sequential Scan).

---

### ✅ Step 9: Security Verification

#### **Rate Limiting:**
Test rate limits are working:
```bash
# Rapid fire requests (should hit limit)
for i in {1..150}; do
  curl -X POST https://yourdomain.com/api/leads \
    -H "Authorization: Bearer YOUR_KEY" \
    -d '{"place_id":"test_'$i'","title":"Test"}' &
done
```

Expected: Some requests return 429 Too Many Requests

#### **Auth Protection:**
- [ ] `/leads` requires admin login
- [ ] `/analytics` requires admin login  
- [ ] `/account` requires super admin (galaljobah@gmail.com)
- [ ] `/leads-test` requires admin in production
- [ ] API endpoints reject invalid tokens

#### **HTTPS:**
- [ ] All traffic uses HTTPS
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid

---

### ✅ Step 10: Monitoring Setup

#### **Set Up Alerts:**

**Option A - Vercel:**
- Enable email alerts for deployment failures
- Monitor function errors in dashboard

**Option B - Custom Monitoring:**
```javascript
// Add to app/api/leads/route.ts
if (process.env.NODE_ENV === 'production') {
  // Log to monitoring service (Sentry, LogRocket, etc.)
  console.log('[PRODUCTION] Lead created:', result.id);
}
```

#### **Key Metrics to Monitor:**

| Metric | What to Watch |
|--------|---------------|
| API Response Time | Should be < 500ms |
| Error Rate | Should be < 1% |
| Rate Limit Hits | Monitor for abuse |
| Database Connections | Should not max out |
| Lead Creation Rate | Track daily volume |

---

## Production Deployment Steps Summary

```bash
# 1. Validate environment
npx tsx scripts/validate-env.ts

# 2. Run database migrations
npx drizzle-kit push

# 3. Test build
npm run build

# 4. Deploy
vercel --prod  # or your deployment command

# 5. Verify production URL
curl https://yourdomain.com/api/leads -I

# 6. Test lead creation
curl -X POST https://yourdomain.com/api/leads \
  -H "Authorization: Bearer YOUR_PROD_KEY" \
  -d '{"place_id":"test","title":"Test"}'

# 7. Update n8n workflow
# - Change URL to production
# - Update API key to production

# 8. Monitor first batch
# Watch dashboard for incoming leads
```

---

## Post-Launch Checklist

### **First Hour:**
- [ ] Monitor Leads Dashboard for incoming data
- [ ] Check server logs for errors
- [ ] Verify n8n workflow is running
- [ ] Test a few manual status updates
- [ ] Confirm emails/notifications work (if configured)

### **First Day:**
- [ ] Review total leads created
- [ ] Check Analytics dashboard for trends
- [ ] Monitor database performance
- [ ] Review error logs
- [ ] Test client account creation and activation

### **First Week:**
- [ ] Analyze lead quality/sources
- [ ] Optimize database queries if needed
- [ ] Review rate limiting effectiveness
- [ ] Plan UI enhancements based on usage
- [ ] Consider adding more analytics

---

## Rollback Plan

If something goes wrong:

### **Quick Rollback:**
```bash
# Revert to previous deployment
vercel rollback  # or platform-specific command
```

### **Database Rollback:**
```sql
-- If you need to rollback migrations
BEGIN;

-- Drop new tables/columns (BE CAREFUL!)
-- ALTER TABLE leads DROP COLUMN IF EXISTS action;
-- etc.

-- Only run if absolutely necessary
ROLLBACK;  -- or COMMIT if verified
```

### **n8n Rollback:**
1. Pause n8n workflow
2. Revert to old endpoint URL
3. Test with development setup
4. Fix issues
5. Re-deploy

---

## Common Deployment Issues

### **Issue: Build Fails with TypeScript Errors**

**Solution:**
```bash
# Check for type errors
npm run type-check

# Fix errors in code
# Re-run build
npm run build
```

### **Issue: Database Connection Fails**

**Solution:**
1. Verify POSTGRES_URL is correct
2. Check database accepts connections from your hosting IP
3. Ensure SSL is enabled: `?sslmode=require`
4. Test connection locally first

### **Issue: Environment Variables Not Loading**

**Solution:**
1. Check variable names match exactly (case-sensitive)
2. No quotes needed in most hosting platforms
3. Restart deployment after adding vars
4. Check platform-specific env var docs

### **Issue: Rate Limiting Too Aggressive**

**Solution:**
Edit `lib/rate-limit.ts`:
```typescript
LEADS_POST: {
  maxRequests: 200, // Increase from 100
  windowMs: 60 * 1000,
},
```
Redeploy.

### **Issue: Leads Not Appearing in Dashboard**

**Solution:**
1. Check n8n is sending to correct URL
2. Verify API key matches production
3. Check server logs for POST requests
4. Test with /leads-test console
5. Click Refresh button on dashboard

---

## Performance Benchmarks

After deployment, your system should achieve:

| Metric | Target | How to Check |
|--------|--------|--------------|
| API Response Time | < 500ms | Check server logs |
| Dashboard Load Time | < 2s | Chrome DevTools |
| Lead Creation | < 300ms | n8n execution logs |
| Database Queries | < 100ms | Enable query logging |
| Page Navigation | < 500ms | User experience |

---

## Final Pre-Launch Checklist

- [ ] Environment variables validated ✓
- [ ] Database migrations run ✓
- [ ] Production build succeeds ✓
- [ ] Application deployed ✓
- [ ] HTTPS enabled ✓
- [ ] Database indexes created ✓
- [ ] Rate limiting active ✓
- [ ] Leads API tested ✓
- [ ] Leads Dashboard functional ✓
- [ ] Analytics working ✓
- [ ] Account system tested ✓
- [ ] Dark mode persistent ✓
- [ ] n8n workflow updated ✓
- [ ] Monitoring configured ✓
- [ ] Error logging active ✓

---

## 🎉 Ready to Launch!

Once all checkboxes are complete, your system is **production-ready**.

**Launch Sequence:**
1. ✅ Run final validation
2. ✅ Deploy to production
3. ✅ Test endpoints
4. ✅ Enable n8n workflow
5. ✅ Monitor Leads Dashboard
6. ✅ Celebrate! 🎊

---

## Support Resources

| Resource | Use For |
|----------|---------|
| `SYSTEM_READY_CHECKLIST.md` | Pre-launch testing |
| `N8N_INTEGRATION_TEST_GUIDE.md` | n8n integration |
| `ACCOUNT_SYSTEM_COMPLETE.md` | User management |
| `LEADS_DASHBOARD_README.md` | Dashboard features |
| `ENV_SETUP.md` | Environment configuration |

---

## Emergency Contacts

If you encounter critical issues post-launch:

1. **Check server logs** immediately
2. **Pause n8n workflow** to stop incoming data
3. **Review error messages** in logs
4. **Rollback deployment** if necessary
5. **Fix issue in development** 
6. **Test thoroughly**
7. **Re-deploy**

---

Your system is **enterprise-ready** with all optimizations, security, and monitoring in place! 🚀

Good luck with your launch! 🎊


