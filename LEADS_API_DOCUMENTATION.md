# Leads API Documentation

## Overview
The `/api/leads` endpoint receives business lead data from external sources like n8n Google Maps scraper and stores them in your database.

## Authentication
All requests require Bearer token authentication.

**Header:**
```
Authorization: Bearer YOUR_API_KEY
```

## Environment Variables

Set these in your `.env.local` file:

```bash
# n8n Scraper Authentication
SCRAPER_API_KEY=your-secure-random-api-key-here

# Database Connection (if not already set)
DATABASE_URL=postgresql://user:password@host:5432/database
# OR if using POSTGRES_URL instead:
# POSTGRES_URL=postgresql://user:password@host:5432/database
```

⚠️ **Generate a secure random string** for your `SCRAPER_API_KEY`. Don't use a predictable value.

**Note:** Your app likely already has a database connection variable (`POSTGRES_URL`). The `DATABASE_URL` is provided as an alternative if needed.

---

## POST /api/leads

Creates a new lead or updates an existing one based on `place_id`.

### Request

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Body (JSON):**

**Required Fields:**
- `place_id` (string) - Unique Google Maps place identifier
- `title` (string) - Business name

**Optional Fields:**
- `action` or `ACTION` (string) - Action to take
- `status` or `STATUS` (string) - Lead status (default: "new")
- `email` (string) - Contact email
- `name` (string) - Full name
- `firstname` (string) - First name
- `lastname` (string) - Last name
- `phone` (string) - Phone number
- `clean_url` or `cleanUrl` (string) - Clean URL
- `website` (string) - Website URL
- `wp_api` or `wpApi` (string) - WordPress API endpoint
- `wp` (string) - WordPress URL
- `facebook` (string) - Facebook profile/page
- `instagram` (string) - Instagram profile
- `youtube` (string) - YouTube channel
- `tiktok` (string) - TikTok profile
- `twitter` (string) - Twitter/X profile
- `linkedin` (string) - LinkedIn profile
- `pinterest` (string) - Pinterest profile
- `reddit` (string) - Reddit profile
- `rating` (string or number) - Business rating
- `reviews` (number) - Number of reviews
- `type` (string) - Business type/category
- `address` (string) - Full address
- `gps_coordinates` or `gpsCoordinates` (string) - GPS coordinates
- `types` (string) - Business types (comma-separated or array)

### Example Request

```bash
curl -X POST https://your-domain.com/api/leads \
  -H "Authorization: Bearer your-secure-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "title": "ABC Plumbing Services",
    "name": "ABC Plumbing",
    "phone": "+1-555-0123",
    "email": "info@abcplumbing.com",
    "website": "https://abcplumbing.com",
    "address": "123 Main St, Los Angeles, CA 90001",
    "gps_coordinates": "34.0522,-118.2437",
    "rating": "4.5",
    "reviews": 127,
    "type": "Plumbing",
    "facebook": "https://facebook.com/abcplumbing",
    "instagram": "https://instagram.com/abcplumbing",
    "status": "new"
  }'
```

### Response

**Success (201 - New Lead):**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "isNew": true,
  "data": {
    "id": 1,
    "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "title": "ABC Plumbing Services",
    "phone": "+1-555-0123",
    "email": "info@abcplumbing.com",
    "status": "new",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z",
    ...
  }
}
```

**Success (200 - Updated Lead):**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "isNew": false,
  "data": { ... }
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "Unauthorized - Invalid or missing API key"
}
```

**400 Bad Request:**
```json
{
  "error": "Missing required fields: place_id and title are required"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to process lead",
  "details": "Error details (only in development)"
}
```

---

## GET /api/leads

Retrieves leads from the database (optional).

### Request

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
```

**Query Parameters:**
- `status` (optional) - Filter by lead status: `new`, `contacted`, `qualified`, `converted`, `rejected`
- `limit` (optional) - Number of results to return (default: 100)

### Example Request

```bash
curl -X GET "https://your-domain.com/api/leads?status=new&limit=50" \
  -H "Authorization: Bearer your-secure-api-key"
```

### Response

**Success (200):**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "id": 1,
      "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "title": "ABC Plumbing Services",
      "status": "new",
      ...
    },
    ...
  ]
}
```

---

## Lead Status Values

- `new` - Freshly imported lead (default)
- `contacted` - Initial contact made
- `qualified` - Lead meets qualification criteria
- `converted` - Successfully converted to client
- `rejected` - Not a good fit

---

## n8n Integration Example

### HTTP Request Node Configuration

**Method:** POST  
**URL:** `https://your-domain.com/api/leads`

**Authentication:**
- Type: Header Auth
- Name: `Authorization`
- Value: `Bearer YOUR_API_KEY`

**Body:**
```json
{
  "place_id": "{{ $json.place_id }}",
  "title": "{{ $json.name }}",
  "phone": "{{ $json.phone }}",
  "email": "{{ $json.email }}",
  "website": "{{ $json.website }}",
  "address": "{{ $json.address }}",
  "city": "{{ $json.city }}",
  "state": "{{ $json.state }}",
  "rating": "{{ $json.rating }}",
  "review_count": "{{ $json.user_ratings_total }}",
  "latitude": "{{ $json.geometry.location.lat }}",
  "longitude": "{{ $json.geometry.location.lng }}",
  "category": "{{ $json.types[0] }}",
  "google_maps_url": "{{ $json.url }}"
}
```

---

## Database Schema

The leads are stored with the following fields:

- `id` - Auto-incrementing primary key
- `place_id` - Unique Google Maps place ID (indexed, required)
- `action` - Action to take
- `status` - Lead status (default: "new")
- `title` - Business name (required)
- `email` - Contact email
- `name` - Full business name
- `firstname` - Contact first name
- `lastname` - Contact last name
- `phone` - Contact phone number
- `clean_url` - Cleaned URL
- `website` - Business website
- `wp_api` - WordPress API endpoint
- `wp` - WordPress site URL
- `facebook` - Facebook profile/page URL
- `instagram` - Instagram profile URL
- `youtube` - YouTube channel URL
- `tiktok` - TikTok profile URL
- `twitter` - Twitter/X profile URL
- `linkedin` - LinkedIn profile URL
- `pinterest` - Pinterest profile URL
- `reddit` - Reddit profile URL
- `rating` - Business rating
- `reviews` - Number of reviews
- `type` - Business type/category
- `address` - Full address
- `gps_coordinates` - GPS coordinates (lat,lng)
- `types` - Business types
- `created_at` - Timestamp of creation (automatic)

---

## Security Notes

1. **Always use HTTPS** in production
2. **Keep your API key secret** - Never commit it to version control
3. **Rotate your API key** periodically
4. **Monitor usage** - Check your logs for unauthorized access attempts
5. **Rate limiting** - Consider adding rate limiting for production use

---

## Testing

### Test with curl:
```bash
# Test authentication
curl -X POST https://your-domain.com/api/leads \
  -H "Authorization: Bearer wrong-key" \
  -H "Content-Type: application/json" \
  -d '{"place_id":"test","title":"Test Business"}'

# Expected: 401 Unauthorized

# Test with valid data
curl -X POST https://your-domain.com/api/leads \
  -H "Authorization: Bearer your-actual-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "place_id": "test_place_123",
    "title": "Test Business",
    "phone": "555-0100",
    "email": "test@example.com"
  }'

# Expected: 201 Created
```

---

## Troubleshooting

**401 Unauthorized:**
- Check that `SCRAPER_API_KEY` is set in your environment variables
- Verify the Authorization header is correctly formatted: `Bearer YOUR_API_KEY`
- Check server logs - if API key is not configured, an error will be logged

**400 Bad Request:**
- Ensure `place_id` and `title` are included in the request body
- Check that the JSON is valid

**500 Internal Server Error:**
- Check server logs for detailed error messages
- Verify database connection is working
- Ensure migrations have been run: `npx drizzle-kit push`

---

## Next Steps

After setting up the API:

1. **Set your environment variables** in `.env.local`:
   ```bash
   SCRAPER_API_KEY=your-secure-random-api-key-here
   DATABASE_URL=your-postgres-connection-string  # if needed
   ```

2. **Generate a secure API key:**
   ```bash
   # Generate a random 32-character string
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Test the endpoint** with curl or Postman

4. **Configure your n8n workflow:**
   - Add HTTP Request node
   - Set Authorization header: `Bearer YOUR_SCRAPER_API_KEY`
   - Point to your `/api/leads` endpoint

5. **Monitor the leads** in your database

6. **Consider building a UI** to view and manage leads (optional)

