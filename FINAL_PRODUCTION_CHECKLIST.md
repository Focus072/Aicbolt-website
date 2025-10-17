# ✅ Final Production Checklist

## 🎯 Pre-Deployment (Must Complete All)

### **1. Environment Variables** ⚡ CRITICAL

```bash
# Run validation
npm run validate-env
```

**Must show:** ✅ All required environment variables are set!

**Set in Production Platform:**
- [ ] `POSTGRES_URL` - Production database
- [ ] `AUTH_SECRET` - Strong random secret (32+ chars)
- [ ] `SCRAPER_API_KEY` - Different from development
- [ ] `NEXT_PUBLIC_APP_URL` - Your production domain

**Generate new keys for production:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### **2. Database Migrations** ⚡ CRITICAL

```bash
# Run all migrations
npm run db:push
```

**OR manually:**
```bash
npm run db:migrate
```

**Verify in production database:**
```sql
-- Check tables
\dt

-- Should see: leads, users, teams, etc.

-- Check indexes
\di

-- Should see: idx_leads_place_id, idx_leads_status, etc.
```

---

### **3. Build Test** ⚡ CRITICAL

```bash
# Test production build
npm run build
```

**Must succeed without errors!**

---

### **4. Security Verification**

- [ ] Different API keys than development
- [ ] DATABASE uses SSL (`?sslmode=require`)
- [ ] AUTH_SECRET is strong and random
- [ ] No sensitive data in public env vars
- [ ] `.env.local` in `.gitignore`
- [ ] Rate limiting configured
- [ ] Test page admin-only in production

---

### **5. Performance Check**

- [ ] Database indexes applied (check step 2)
- [ ] Caching headers on GET endpoints
- [ ] Pagination default: 50 items
- [ ] Images optimized
- [ ] No console.logs in production code (or use proper logging)

---

## 🚀 Deployment Steps

### **Step 1: Deploy Application**

**Vercel:**
```bash
vercel --prod
```

**Railway:**
```bash
railway up
```

**Other Platforms:**
Follow their specific deployment guides.

---

### **Step 2: Set Production Environment Variables**

In your hosting platform dashboard, set:

```bash
POSTGRES_URL=postgresql://user:pass@prod-host:5432/db
AUTH_SECRET=<new-random-secret>
SCRAPER_API_KEY=<new-random-key>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

⚠️ **Important:**
- Use SSL database connection
- Generate NEW keys (different from dev)
- No quotes needed in most platforms
- Restart deployment after adding vars

---

### **Step 3: Verify Deployment**

**Test URLs:** (replace with your domain)

```bash
# 1. Health check
curl https://yourdomain.com

# 2. API endpoint
curl -I https://yourdomain.com/api/leads

# 3. Test lead creation
curl -X POST https://yourdomain.com/api/leads \
  -H "Authorization: Bearer YOUR_PRODUCTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"place_id":"prod_test_001","title":"Production Test Lead"}'

# Expected: {"success":true,"message":"Lead created successfully",...}
```

**Browser Testing:**
- [ ] Visit `https://yourdomain.com` - Homepage loads
- [ ] Visit `https://yourdomain.com/sign-in` - Login works
- [ ] Login and visit `/leads` - Dashboard loads
- [ ] Visit `/analytics` - Charts display
- [ ] Toggle dark mode - Persists across pages
- [ ] Visit `/leads-test` - Shows admin-only message (if not admin)

---

### **Step 4: Configure n8n Production**

**Update Workflow:**
1. Change URL: `https://yourdomain.com/api/leads`
2. Update API Key: Use production `SCRAPER_API_KEY`
3. Test with 1 place first
4. Verify 201 response
5. Check lead appears in dashboard
6. Enable full workflow

**n8n Settings:**
```
URL: https://yourdomain.com/api/leads
Method: POST
Auth: Bearer YOUR_PRODUCTION_SCRAPER_API_KEY
Body: { map your Google Maps fields }
```

---

### **Step 5: Final Functional Tests**

**Test Each Flow:**

1. **Lead Creation:**
   - [ ] n8n posts lead → 201 response
   - [ ] Lead appears in `/leads` dashboard
   - [ ] All fields populated correctly

2. **Lead Updates:**
   - [ ] Click "Called" → Status updates
   - [ ] Click "Success" → Status updates
   - [ ] Click "Failed" → Status updates
   - [ ] Toast notifications appear

3. **Analytics:**
   - [ ] Charts show correct data
   - [ ] KPIs update with new leads
   - [ ] Trends calculate properly

4. **Account System:**
   - [ ] Create new user
   - [ ] Receive invite (check console logs)
   - [ ] Activate account
   - [ ] Login with new account
   - [ ] See only assigned pages

5. **Permissions:**
   - [ ] Admin sees all pages
   - [ ] Client sees only assigned pages
   - [ ] Super admin can access `/account`
   - [ ] Others redirected from `/account`

---

## 🛡️ Security Audit

Before launch, verify:

### **Authentication:**
- [ ] Passwords hashed in database
- [ ] Invite tokens expire after 7 days
- [ ] Invalid tokens rejected
- [ ] Session management works

### **Authorization:**
- [ ] API requires Bearer token
- [ ] Admin pages require admin role
- [ ] Super admin pages require specific email
- [ ] Unauthorized users redirected

### **Rate Limiting:**
- [ ] POST /api/leads limited to 100/min
- [ ] GET /api/leads limited to 300/min
- [ ] Account creation limited to 10/hour
- [ ] 429 responses sent correctly

### **Data Protection:**
- [ ] SQL injection protected (Drizzle ORM)
- [ ] Input validation on all endpoints
- [ ] Soft deletes preserve data
- [ ] No sensitive data in logs

---

## 📊 Performance Validation

Run these queries to verify optimization:

**Check Index Usage:**
```sql
EXPLAIN ANALYZE 
SELECT * FROM leads 
WHERE status = 'new' 
ORDER BY created_at DESC 
LIMIT 50;
```
Should show: "Index Scan" (not "Seq Scan")

**Check Query Speed:**
```sql
SELECT COUNT(*) FROM leads;  -- Should be < 10ms
SELECT * FROM leads WHERE place_id = 'xxx';  -- Should be < 5ms
```

---

## 🔄 Post-Deployment Monitoring

### **First 24 Hours:**

**Monitor These:**
- Server error logs (should be minimal)
- Lead creation rate (watch for spikes)
- API response times (should be < 500ms)
- Rate limit hits (watch for abuse)
- Database connections (shouldn't max out)

**Access These Dashboards:**
- `https://yourdomain.com/analytics` - Lead metrics
- `https://yourdomain.com/leads` - Lead management
- Your hosting platform's metrics

---

## 🆘 Emergency Procedures

### **If Site Goes Down:**

1. **Check hosting platform status**
2. **Review error logs immediately**
3. **Pause n8n workflow** (stop incoming data)
4. **Rollback to previous deployment** if needed
5. **Fix issue in development**
6. **Test locally**
7. **Re-deploy**

### **If Database Overwhelmed:**

1. **Check active connections**
2. **Review slow query log**
3. **Add more indexes if needed**
4. **Scale database (increase RAM/CPU)**
5. **Implement additional caching**

### **If Rate Limits Too Strict:**

Edit `lib/rate-limit.ts`:
```typescript
LEADS_POST: {
  maxRequests: 200,  // Increase
  windowMs: 60 * 1000,
},
```
Redeploy.

---

## 📋 Final Pre-Launch Checklist

**Critical Items:**
- [ ] ✅ Environment variables validated
- [ ] ✅ Database migrations run
- [ ] ✅ Production build succeeds
- [ ] ✅ All indexes created
- [ ] ✅ Application deployed
- [ ] ✅ HTTPS enabled
- [ ] ✅ Domain configured
- [ ] ✅ API endpoints tested
- [ ] ✅ Rate limiting active
- [ ] ✅ Dark mode working

**Security Items:**
- [ ] ✅ New API keys generated
- [ ] ✅ Auth protected routes tested
- [ ] ✅ Test console admin-only
- [ ] ✅ No dev keys in production
- [ ] ✅ Database uses SSL

**Functionality Items:**
- [ ] ✅ Leads creation working
- [ ] ✅ Leads dashboard functional
- [ ] ✅ Analytics charts displaying
- [ ] ✅ Account creation working
- [ ] ✅ Invite system functional
- [ ] ✅ Permissions enforced

**Integration Items:**
- [ ] ✅ n8n workflow configured
- [ ] ✅ Production API key set
- [ ] ✅ Test execution successful
- [ ] ✅ Batch testing complete

---

## 🎊 Launch Commands

**Final launch sequence:**

```bash
# 1. Validate one last time
npm run validate-env

# 2. Ensure build works
npm run build

# 3. Deploy
vercel --prod  # or your platform

# 4. Test production
curl https://yourdomain.com/api/leads \
  -H "Authorization: Bearer YOUR_PROD_KEY" \
  -d '{"place_id":"final_test","title":"Final Test"}'

# 5. Verify in dashboard
# Visit: https://yourdomain.com/leads

# 6. Enable n8n workflow
# Start your scraper

# 7. Monitor analytics
# Visit: https://yourdomain.com/analytics
```

---

## 🎉 You're Live!

Once all checklist items are complete:

✅ Your system is **production-ready**  
✅ All optimizations **active**  
✅ Security measures **in place**  
✅ Monitoring **configured**  
✅ n8n integration **tested**  

**Welcome to production!** 🚀

Monitor your analytics dashboard and watch the leads roll in!

---

## 📞 Quick Reference

| Page | URL | Access |
|------|-----|--------|
| Leads Dashboard | `/leads` | Admin only |
| Analytics | `/analytics` | Admin only |
| Account Management | `/account` | Super admin only |
| Test Console | `/leads-test` | Admin only (prod) |
| Activate Account | `/activate?token=xxx` | Public |

| API | Method | Auth |
|-----|--------|------|
| `/api/leads` | POST | Bearer token |
| `/api/leads` | GET | Bearer or Session |
| `/api/leads/[id]` | PATCH | Bearer or Session |
| `/api/leads/analytics` | GET | Session (admin) |
| `/api/account/users` | POST | Session (super admin) |

---

**Everything is ready. Time to launch! 🚀🎉**


