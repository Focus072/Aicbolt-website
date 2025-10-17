# 🧪 n8n Integration - Complete Testing Guide

## ✅ What's Ready for Testing

Your complete leads system is now live and ready for n8n integration testing.

### **System Components:**

1. ✅ `/api/leads` endpoint - Receives POST requests from n8n
2. ✅ `/leads` dashboard - Real-time lead management UI  
3. ✅ `/leads-test` console - Manual testing interface
4. ✅ Database table - Stores all lead data with upsert logic
5. ✅ Authentication - Bearer token validation
6. ✅ Auto-refresh - Dashboard updates every 30 seconds

---

## 🎯 Testing Workflow

### **Phase 1: Manual Testing** (Start Here)

#### **Step 1: Get Your API Key**

Open `.env.local` and find/add:
```bash
SCRAPER_API_KEY=your-key-here
```

If you don't have one yet, generate it:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### **Step 2: Access Test Console**

Navigate to:
```
http://localhost:3000/leads-test
```

You should see:
- 🔑 API key input field
- 📝 JSON payload editor with mock data
- 🚀 "POST to /api/leads" button
- 📊 Response display area

#### **Step 3: Enter Your API Key**

Paste your `SCRAPER_API_KEY` into the password field at the top.

#### **Step 4: Send Test Request**

Click **"POST to /api/leads"**

**Expected Result:**
- ✅ Green success banner appears
- ✅ Toast notification: "Lead Posted Successfully!"
- ✅ Response shows status 201 (new) or 200 (updated)
- ✅ "View in Leads Dashboard" link appears

**If you get errors:**
- 🔴 **401 Unauthorized** → Wrong API key or missing from .env.local
- 🔴 **400 Bad Request** → Invalid JSON or missing required fields
- 🔴 **500 Server Error** → Database connection issue

#### **Step 5: Verify in Dashboard**

1. Click **"View in Leads Dashboard"** (or go to `/leads`)
2. Your test lead should appear at the top
3. Click **"Called"**, **"Success"**, or **"Failed"** to test status updates
4. Status should change instantly with toast confirmation

#### **Step 6: Test Upsert Logic**

1. Go back to `/leads-test`
2. Send the SAME request again (same place_id)
3. Should get **200 status** with message "Lead updated"
4. Check dashboard - same lead, updated timestamp

#### **Step 7: Test Random Leads**

1. Click **"Generate Random"** button
2. Sends request with new random place_id
3. Creates a new lead each time
4. Builds up test data for dashboard

---

### **Phase 2: n8n Integration** (After Manual Tests Pass)

#### **n8n HTTP Request Node Configuration:**

**URL:**
```
https://yourdomain.com/api/leads
```
(For local testing: `http://localhost:3000/api/leads`)

**Method:** `POST`

**Authentication:**
- Type: `Header Auth`
- Header Name: `Authorization`
- Value: `Bearer YOUR_SCRAPER_API_KEY`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "place_id": "{{ $json.place_id }}",
  "title": "{{ $json.name }}",
  "email": "{{ $json.email }}",
  "phone": "{{ $json.formatted_phone_number }}",
  "website": "{{ $json.website }}",
  "address": "{{ $json.formatted_address }}",
  "gps_coordinates": "{{ $json.geometry.location.lat }},{{ $json.geometry.location.lng }}",
  "rating": "{{ $json.rating }}",
  "reviews": "{{ $json.user_ratings_total }}",
  "type": "{{ $json.types[0] }}"
}
```

**Response Handling:**

Configure n8n to check response:
- Status 201/200 = Success
- Status 401 = Auth error (check API key)
- Status 400 = Data error (check required fields)

---

## 🔍 Error Handling Verification

### **Test 1: Missing API Key**

Remove Authorization header in n8n or test console.

**Expected:**
- 🔴 Status 401
- 🔴 Error: "Unauthorized - Invalid or missing API key"
- 🔴 Red toast appears
- 🔴 Console logs: "SCRAPER_API_KEY is not configured"

---

### **Test 2: Invalid API Key**

Use wrong API key: `Bearer wrong-key-12345`

**Expected:**
- 🔴 Status 401
- 🔴 Error: "Unauthorized - Invalid or missing API key"
- 🔴 Red toast appears

---

### **Test 3: Missing Required Fields**

Send payload without `place_id`:
```json
{
  "title": "Test Business"
}
```

**Expected:**
- 🔴 Status 400
- 🔴 Error: "Missing required fields: place_id and title are required"
- 🔴 Red toast appears

---

### **Test 4: Valid Request**

Use correct API key and valid payload.

**Expected:**
- ✅ Status 201 (new) or 200 (update)
- ✅ Success message in response
- ✅ Green toast appears
- ✅ Data visible in `/leads` dashboard immediately

---

## 📊 Dashboard Features to Test

### **Real-Time Updates:**

1. Keep `/leads` dashboard open
2. Post new lead from `/leads-test` in another tab
3. Click Refresh or wait 30 seconds
4. New lead should appear at top

### **Search:**

1. Type business name in search bar
2. Table filters in real-time
3. Clear search to see all leads

### **Status Filter:**

1. Select "New" in dropdown
2. Only new leads show
3. Change some leads to "Called" using buttons
4. Filter by "Called" to verify

### **Action Buttons:**

1. Click "Called" on a lead
2. Status badge turns yellow
3. Toast confirms update
4. Database updates instantly

### **Pagination:**

1. Create 15+ test leads
2. Verify pagination controls appear
3. Navigate between pages
4. Verify count is correct

---

## 🚀 Live n8n Testing Checklist

Before connecting real scraper:

- [ ] Manual test passes with 201 status
- [ ] Upsert logic works (200 status on duplicate)
- [ ] Dashboard shows posted leads instantly
- [ ] Status updates work (Called/Success/Failed)
- [ ] Search and filters function correctly
- [ ] Auto-refresh works (30 sec intervals)
- [ ] Error handling displays clearly
- [ ] API key validation is secure

---

## 📡 n8n Workflow Example

### **Complete Workflow Structure:**

```
┌─────────────────┐
│ Google Maps     │
│ API Request     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Parse Places    │
│ Data (JSON)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ HTTP Request    │
│ POST /api/leads │
│ (Loop on items) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Response  │
│ Status = 201?   │
└─────────────────┘
```

### **n8n HTTP Request Settings:**

**Request Method:** POST  
**URL:** `https://yourdomain.com/api/leads`  
**Authentication:** Header Auth  
  - Name: `Authorization`  
  - Value: `Bearer {{ $env.SCRAPER_API_KEY }}`

**Body Parameters:**
- Content Type: JSON
- Specify Body: Using Fields Below

**Fields:**
Map Google Maps API response to your schema (see example above)

**Options:**
- Timeout: 30000ms
- Redirect: Follow All
- Response: Include Response Body

---

## 🎨 Success Indicators

### **When Everything Works:**

✅ **Test Console:**
- Green success banner
- Status 201/200
- Response shows lead data
- "View in Leads Dashboard" link works

✅ **Leads Dashboard:**
- New lead appears at top
- All fields populated correctly
- Status shows "New" (blue badge)
- Action buttons work
- Search finds the lead
- Refresh updates data

✅ **Database:**
```sql
SELECT * FROM leads ORDER BY created_at DESC LIMIT 1;
```
Shows your newly created lead

✅ **Console Logs:**
```
POST /api/leads - Status: 201
Lead created successfully: { id: 1, placeId: 'xxx', ... }
```

---

## 🔧 Troubleshooting

### **"Unauthorized" Error (401)**

**Problem:** API key validation failing

**Solutions:**
1. Check `.env.local` has `SCRAPER_API_KEY=xxx`
2. Restart dev server: `npm run dev`
3. Verify key matches exactly (no extra spaces)
4. Check Authorization header: `Bearer YOUR_KEY` (with space)

### **"Missing required fields" Error (400)**

**Problem:** Payload missing place_id or title

**Solutions:**
1. Verify JSON has both fields
2. Check field names match exactly (case-sensitive)
3. Test with mock payload first

### **Lead Not Appearing in Dashboard**

**Problem:** POST succeeded but dashboard doesn't show it

**Solutions:**
1. Click **Refresh** button manually
2. Wait 30 seconds for auto-refresh
3. Check status filter isn't hiding it
4. Clear search field
5. Check browser console for errors

### **n8n Connection Fails**

**Problem:** n8n can't reach your endpoint

**Solutions:**
1. For local testing, use ngrok: `ngrok http 3000`
2. Use ngrok URL in n8n: `https://xxx.ngrok.io/api/leads`
3. For production, deploy to Vercel/Railway/etc.
4. Check firewall/network settings

---

## 📈 Performance Notes

- **Auto-refresh:** Dashboard updates every 30 seconds
- **Manual refresh:** Click button anytime for instant update
- **Upsert efficiency:** Database checks place_id before insert
- **Pagination:** Only 10 leads shown per page for performance
- **Search/filter:** Client-side for instant results

---

## 🎉 Ready to Go Live!

Once all manual tests pass:

1. ✅ Deploy your app to production
2. ✅ Set production `SCRAPER_API_KEY` in hosting env vars
3. ✅ Update n8n workflow URL to production
4. ✅ Test one live scrape
5. ✅ Monitor Leads Dashboard for incoming data
6. ✅ Celebrate! 🎊

---

## 💡 Pro Tips

**Testing Tip:**
Use `/leads-test` to simulate n8n posts before configuring actual scraper. This saves time and debugging cycles.

**Monitoring Tip:**
Keep Leads Dashboard open in a browser tab. Auto-refresh will show new leads as they arrive from n8n.

**Debugging Tip:**
Check server console logs for detailed request/response data. All errors are logged with full context.

**Production Tip:**
Consider adding rate limiting to `/api/leads` endpoint if you're scraping thousands of leads per hour.

---

Your integration is **ready for live testing**! 🚀

Start with `/leads-test`, verify everything works, then connect your n8n scraper.


