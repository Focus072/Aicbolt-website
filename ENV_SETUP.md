# Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# ============================================
# Database Connection
# ============================================
# Your app already uses POSTGRES_URL
POSTGRES_URL=postgresql://user:password@host:5432/database

# Alternative (optional - for compatibility)
DATABASE_URL=postgresql://user:password@host:5432/database


# ============================================
# n8n Scraper API Authentication
# ============================================
# Used by /api/leads endpoint to authenticate n8n requests
SCRAPER_API_KEY=your-secure-random-api-key-here


# ============================================
# Other Existing Variables
# ============================================
# (Your app likely already has these)

AUTH_SECRET=your_auth_secret_key
```

---

## Generate Secure API Key

Run this command to generate a secure random API key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output:
```
8f7d9c4b3a2e1f0d6c5b4a3e2d1c0f9e8d7c6b5a4e3d2c1b0a9e8d7c6b5a4
```

Use this value for `SCRAPER_API_KEY`.

---

## n8n Configuration

In your n8n HTTP Request node:

**Authentication:**
- Type: `Header Auth`
- Name: `Authorization`
- Value: `Bearer 8f7d9c4b3a2e1f0d6c5b4a3e2d1c0f9e8d7c6b5a4e3d2c1b0a9e8d7c6b5a4`

Replace the example key with your actual `SCRAPER_API_KEY`.

---

## Quick Test

Test your API key is working:

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer YOUR_SCRAPER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "place_id": "test_123",
    "title": "Test Business"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "isNew": true,
  "data": { ... }
}
```

**If you get 401:**
- Check that `SCRAPER_API_KEY` is set in `.env.local`
- Restart your Next.js dev server after adding env variables
- Verify you're using `Bearer YOUR_KEY` (with the space)

---

## Security Checklist

✅ Generate a strong random API key (32+ characters)  
✅ Never commit `.env.local` to git (already in `.gitignore`)  
✅ Use different API keys for development and production  
✅ Store production keys in your hosting platform's env variables  
✅ Rotate keys periodically  
✅ Only share keys through secure channels  

---

## Database Connection Notes

Your app uses **Drizzle ORM** which reads from `POSTGRES_URL` by default (check `drizzle.config.ts`).

If you need to use `DATABASE_URL` instead:
1. Both variables can point to the same database
2. Or update `drizzle.config.ts` to use `DATABASE_URL`
3. Your app should work fine with just `POSTGRES_URL`


