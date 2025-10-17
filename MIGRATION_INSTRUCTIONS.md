# Leads Table Migration Instructions

## ✅ Schema Updated

Your leads table schema has been updated with the complete structure. Now you need to apply the migration to your database.

---

## Option 1: Automatic Migration (Recommended)

If your database connection is configured correctly in `.env.local`, run:

```bash
cd saas-starter
npx drizzle-kit push
```

When prompted about column changes, select **"+ action create column"** and continue creating all new columns.

---

## Option 2: Manual SQL Migration

If automatic migration doesn't work, run the SQL manually:

### Using psql (PostgreSQL command-line):

```bash
# Connect to your database
psql "postgresql://user:password@host:5432/database"

# Run the migration
\i lib/db/migrations/0003_recreate_leads_table.sql

# Verify the table was created
\d leads
```

### Using Database GUI (pgAdmin, DBeaver, etc.):

1. Open your database tool
2. Connect to your Postgres database
3. Open and run the SQL file: `lib/db/migrations/0003_recreate_leads_table.sql`
4. Verify the `leads` table exists with all columns

### Using Drizzle Studio:

```bash
cd saas-starter
npx drizzle-kit studio
```

This opens a web interface to manage your database.

---

## Option 3: Using Your Hosting Platform

If you're using services like Vercel, Railway, or Heroku:

1. Copy the SQL from `lib/db/migrations/0003_recreate_leads_table.sql`
2. Go to your hosting platform's database console
3. Paste and execute the SQL

---

## Verify Migration Success

Run this query to check if the table exists:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;
```

You should see 28 columns including:
- `id`, `place_id`, `action`, `status`, `title`, `email`, `name`, etc.

---

## New Schema Structure

```
leads
├── id                  SERIAL PRIMARY KEY
├── place_id            VARCHAR(255) UNIQUE (required)
├── action              VARCHAR(100)
├── status              VARCHAR(50) DEFAULT 'new' (required)
├── title               VARCHAR(500) (required)
├── email               VARCHAR(255)
├── name                VARCHAR(255)
├── firstname           VARCHAR(255)
├── lastname            VARCHAR(255)
├── phone               VARCHAR(50)
├── clean_url           TEXT
├── website             TEXT
├── wp_api              TEXT
├── wp                  TEXT
├── facebook            TEXT
├── instagram           TEXT
├── youtube             TEXT
├── tiktok              TEXT
├── twitter             TEXT
├── linkedin            TEXT
├── pinterest           TEXT
├── reddit              TEXT
├── rating              VARCHAR(10)
├── reviews             INTEGER
├── type                VARCHAR(255)
├── address             TEXT
├── gps_coordinates     TEXT
├── types               TEXT
└── created_at          TIMESTAMP DEFAULT NOW() (auto)
```

---

## Test the API

Once migration is complete, test your endpoint:

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer YOUR_SCRAPER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "place_id": "test_place_123",
    "title": "Test Business",
    "email": "test@example.com",
    "phone": "555-0100",
    "website": "https://example.com",
    "address": "123 Main St",
    "rating": "4.5",
    "reviews": 100,
    "type": "Restaurant",
    "gps_coordinates": "34.0522,-118.2437"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "isNew": true,
  "data": {
    "id": 1,
    "placeId": "test_place_123",
    "status": "new",
    "title": "Test Business",
    "createdAt": "2025-01-01T12:00:00.000Z",
    ...
  }
}
```

---

## Troubleshooting

### Database Connection Issues

If you get connection errors, check:

1. **Environment Variables** - Ensure `POSTGRES_URL` is set in `.env.local`
2. **Database Access** - Your database must be accessible from your machine
3. **Credentials** - Username, password, host, port must be correct

### Migration Hangs or Asks Questions

If `drizzle-kit push` asks about renaming columns:
- This means you have existing data
- Choose **"create column"** for all new fields
- Old columns will be removed (data will be lost)

If you need to preserve data, contact your DBA to write a custom migration.

---

## Next Steps

After successful migration:

1. ✅ Test the `/api/leads` endpoint
2. ✅ Configure your n8n workflow to send data
3. ✅ Monitor incoming leads
4. 📊 Consider building a UI to view leads (optional)

---

## Need Help?

Check these files for more information:
- `LEADS_API_DOCUMENTATION.md` - Complete API reference
- `ENV_SETUP.md` - Environment variable setup
- `lib/db/migrations/0003_recreate_leads_table.sql` - The SQL migration file


