# 🔧 Quick Fix - Add Missing User Columns

## Error You're Seeing:
```
PostgresError: column "allowed_pages" does not exist
```

## Solution (Choose One):

---

### **Option 1: Database Console (Easiest)**

1. **Open your database console:**
   - If using Vercel Postgres: Go to Storage → Postgres → Query
   - If using pgAdmin: Open query tool
   - If using DBeaver: Open SQL editor
   - If using Railway: Go to database → Query

2. **Copy and run this SQL:**
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_pages TEXT[];
   ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token VARCHAR(255);
   ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token_expiry TIMESTAMP;
   ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
   UPDATE users SET is_active = true;
   CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users(invite_token);
   ```

3. **Verify it worked:**
   ```sql
   SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
   ```
   Should show: `allowed_pages`, `invite_token`, `invite_token_expiry`, `is_active`

4. **Refresh your browser** - Error should be gone!

---

### **Option 2: Use SQL File**

1. **Run the pre-made SQL file:**
   
   **If you have psql installed:**
   ```bash
   psql "YOUR_POSTGRES_URL" -f FIX_USERS_TABLE.sql
   ```

   **Or copy content from:** `FIX_USERS_TABLE.sql`
   And paste into your database console

---

### **Option 3: Online Database Tool**

If using a hosted database:

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

### **After Running Migration:**

1. **Refresh your application** (Ctrl+F5)
2. **Error should be gone**
3. **Try accessing** `/account` page
4. **User creation should work**

---

## Why This Happened:

The schema was updated to include new user permission fields, but the database migration hadn't been applied yet. This is normal - just need to run the migration once.

---

## Verify Fix Worked:

After running the SQL, check your database:

```sql
-- Should return 4 rows
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('allowed_pages', 'invite_token', 'invite_token_expiry', 'is_active');
```

**Expected output:**
```
 column_name         | data_type
---------------------+------------
 allowed_pages       | ARRAY
 invite_token        | varchar
 invite_token_expiry | timestamp
 is_active           | boolean
```

---

## 🎉 Fixed!

Once the columns are added, your account system will work perfectly!

The error was just a missing migration - now you're all set! ✅


