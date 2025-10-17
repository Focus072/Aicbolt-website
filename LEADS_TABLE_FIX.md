# 🔧 Fix "Failed to load leads" Error

## The Problem:
The leads table doesn't exist in your database yet, causing the API to fail.

## Quick Fix (Choose One):

---

### **Option 1: Database Console (Easiest)**

1. **Open your database console:**
   - If using Vercel Postgres: Go to Storage → Postgres → Query
   - If using pgAdmin: Open query tool
   - If using DBeaver: Open SQL editor
   - If using Railway: Go to database → Query

2. **Copy and run this SQL:**
   ```sql
   DROP TABLE IF EXISTS leads CASCADE;
   
   CREATE TABLE leads (
     id SERIAL PRIMARY KEY,
     place_id VARCHAR(255) NOT NULL UNIQUE,
     action VARCHAR(100),
     status VARCHAR(50) NOT NULL DEFAULT 'new',
     title VARCHAR(500) NOT NULL,
     email VARCHAR(255),
     name VARCHAR(255),
     firstname VARCHAR(255),
     lastname VARCHAR(255),
     phone VARCHAR(50),
     clean_url TEXT,
     website TEXT,
     wp_api TEXT,
     wp TEXT,
     facebook TEXT,
     instagram TEXT,
     youtube TEXT,
     tiktok TEXT,
     twitter TEXT,
     linkedin TEXT,
     pinterest TEXT,
     reddit TEXT,
     rating VARCHAR(10),
     reviews INTEGER,
     type VARCHAR(255),
     address TEXT,
     gps_coordinates TEXT,
     types TEXT,
     created_at TIMESTAMP NOT NULL DEFAULT NOW()
   );
   
   CREATE INDEX idx_leads_place_id ON leads(place_id);
   CREATE INDEX idx_leads_status ON leads(status);
   CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
   ```

3. **Refresh your browser** - Leads should load! ✅

---

### **Option 2: Use SQL File**

1. **Open the file:** `CREATE_LEADS_TABLE.sql`
2. **Copy the entire content**
3. **Paste into your database console**
4. **Execute**

---

### **Option 3: Online Database Tool**

**Vercel Postgres:**
1. Go to Vercel Dashboard
2. Select your project → Storage tab
3. Click your Postgres database
4. Go to "Query" tab
5. Paste the SQL from Option 1
6. Click "Run"

**Railway:**
1. Go to Railway Dashboard
2. Select your Postgres service
3. Click "Query" tab
4. Paste SQL and execute

**Supabase:**
1. Go to SQL Editor
2. Create new query
3. Paste SQL and run

---

## Verify Fix Worked:

After running the SQL, check your database:

```sql
-- Should return all the leads table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;
```

**Expected output:** You should see ~25 columns including `id`, `place_id`, `title`, `email`, `phone`, `status`, etc.

---

## 🎉 Fixed!

Once the leads table is created:

✅ **Refresh your browser**  
✅ **Go to `/leads` page**  
✅ **"Failed to load leads" error will be gone**  
✅ **Leads dashboard will work**  

The table will be empty initially, but the API will work and you can start adding leads via your n8n scraper!

---

## Why This Happened:

The leads table migration hadn't been applied to your database yet. This is normal for new features - just need to create the table once.

---

## Next Steps:

1. **Create the leads table** (using one of the options above)
2. **Test the leads page** - should load without errors
3. **Configure your n8n scraper** to send leads to `/api/leads`
4. **Leads will start appearing** in your dashboard

**The fix takes less than 2 minutes!** 🚀

