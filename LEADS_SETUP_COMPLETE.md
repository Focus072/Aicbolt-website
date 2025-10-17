# ✅ Leads System Setup Complete

Your leads system is now configured with the complete schema structure you requested.

---

## 📊 What Was Done

### 1. Database Schema Created ✓
**File:** `lib/db/schema.ts`

Complete leads table with 28 fields:
- `place_id` (unique identifier)
- `action`, `STATUS` (status defaults to "new")
- `title`, `email`, `name`, `firstname`, `lastname`
- `phone`, `clean_url`, `website`
- Social media fields: `wp_api`, `wp`, `facebook`, `instagram`, `youtube`, `tiktok`, `twitter`, `linkedin`, `pinterest`, `reddit`
- Business info: `rating`, `reviews`, `type`, `address`, `gps_coordinates`, `types`
- `created_at` (automatically set on creation)

### 2. API Endpoint Ready ✓
**File:** `app/api/leads/route.ts`

- POST `/api/leads` - Create or update leads
- GET `/api/leads` - Retrieve leads (optional)
- Bearer token authentication using `SCRAPER_API_KEY`
- Handles both camelCase and snake_case field names
- Automatic upsert based on `place_id`

### 3. Migration Files Created ✓
**File:** `lib/db/migrations/0003_recreate_leads_table.sql`

Ready-to-run SQL migration with:
- Table creation
- Indexes on `place_id`, `status`, and `created_at`
- Proper constraints and defaults

---

## 🔧 Next Steps (Required)

### Step 1: Set Environment Variables

Add to your `.env.local` file:

```bash
# Database (should already exist)
POSTGRES_URL=postgresql://user:password@host:5432/database

# n8n Scraper API Key
SCRAPER_API_KEY=your-secure-random-api-key-here
```

**Generate your API key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Run Database Migration

Choose ONE method:

**Option A - Automatic (Recommended):**
```bash
cd saas-starter
npx drizzle-kit push
```
When prompted, select "create column" for all new fields.

**Option B - Manual SQL:**
```bash
psql "your-postgres-connection-string" -f lib/db/migrations/0003_recreate_leads_table.sql
```

**Option C - Using Database GUI:**
Open pgAdmin/DBeaver and run the SQL from `lib/db/migrations/0003_recreate_leads_table.sql`

📖 **Full migration instructions:** See `MIGRATION_INSTRUCTIONS.md`

### Step 3: Test the API

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer YOUR_SCRAPER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "place_id": "test_123",
    "title": "Test Business",
    "email": "test@example.com",
    "phone": "555-0100"
  }'
```

**Expected:** 201 Created with lead data

### Step 4: Configure n8n

In your n8n HTTP Request node:

**URL:** `https://your-domain.com/api/leads`

**Headers:**
- `Authorization`: `Bearer YOUR_SCRAPER_API_KEY`
- `Content-Type`: `application/json`

**Body:** Map your Google Maps data to the fields

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `lib/db/schema.ts` | Database schema definition |
| `app/api/leads/route.ts` | API endpoint logic |
| `lib/db/migrations/0003_recreate_leads_table.sql` | SQL migration |
| `MIGRATION_INSTRUCTIONS.md` | Detailed migration guide |
| `LEADS_API_DOCUMENTATION.md` | Complete API reference |
| `ENV_SETUP.md` | Environment setup guide |

---

## 🎯 Field Mapping for n8n

Map your Google Maps scraper output like this:

```json
{
  "place_id": "{{ $json.place_id }}",
  "title": "{{ $json.name }}",
  "email": "{{ $json.email }}",
  "phone": "{{ $json.formatted_phone_number }}",
  "website": "{{ $json.website }}",
  "address": "{{ $json.formatted_address }}",
  "rating": "{{ $json.rating }}",
  "reviews": "{{ $json.user_ratings_total }}",
  "type": "{{ $json.types[0] }}",
  "gps_coordinates": "{{ $json.geometry.location.lat }},{{ $json.geometry.location.lng }}"
}
```

---

## ✨ Key Features

✅ **Unique Place IDs** - No duplicate entries  
✅ **Auto-created Timestamps** - `created_at` set automatically  
✅ **Status Tracking** - Defaults to "new"  
✅ **Upsert Logic** - Updates existing leads automatically  
✅ **Secure Authentication** - Bearer token required  
✅ **Flexible Input** - Accepts camelCase or snake_case  
✅ **Social Media Fields** - Complete social profile tracking  
✅ **WordPress Detection** - WP site and API tracking  

---

## 🆘 Troubleshooting

**Migration Issues?**
→ See `MIGRATION_INSTRUCTIONS.md`

**API Returns 401?**
→ Check `SCRAPER_API_KEY` is set and correct

**Can't Connect to Database?**
→ Verify `POSTGRES_URL` in `.env.local`

**Need Help?**
→ Check `LEADS_API_DOCUMENTATION.md` for full details

---

## 🚀 You're Ready!

Once you complete the 4 steps above:
1. ✅ Environment variables set
2. ✅ Migration run
3. ✅ API tested
4. ✅ n8n configured

Your system will automatically capture and store leads from your Google Maps scraper! 🎉


