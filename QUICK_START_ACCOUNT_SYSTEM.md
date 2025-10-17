# 🚀 Quick Start - Account Control System

## ⚡ Fast Setup (3 Steps)

### **Step 1: Run Database Migrations**

Choose the easiest method for you:

**Option A - Drizzle Push (Recommended):**
```bash
cd saas-starter
npx drizzle-kit push
```
⚠️ When prompted about "action column", press Enter to select "+ action create column"

**Option B - Direct SQL:**
```bash
psql "your-postgres-url" -f lib/db/migrations/0003_recreate_leads_table.sql
psql "your-postgres-url" -f lib/db/migrations/0004_add_user_permissions.sql
```

**Option C - Run All Migrations Script:**
```bash
cd saas-starter
node run-account-system-migration.js
```

---

### **Step 2: Set Environment Variables**

Add to `.env.local`:

```bash
# Existing (should already be there)
POSTGRES_URL=postgresql://user:password@host:5432/database
AUTH_SECRET=your-auth-secret

# New - For n8n scraper
SCRAPER_API_KEY=your-secure-random-api-key

# Optional - For production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Generate secure API key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### **Step 3: Test the System**

1. **Restart your dev server** (to load new env variables)

2. **Access Account Management:**
   ```
   http://localhost:3000/account
   ```
   (Log in as galaljobah@gmail.com if needed)

3. **Create a test user:**
   - Name: "Test Client"
   - Email: "test@example.com"
   - Role: Client
   - Pages: Check "Leads" and "Dashboard"
   - Click "Create & Send Invite"

4. **Check console for invite URL:**
   ```
   📧 Invite URL for test@example.com : http://localhost:3000/activate?token=xxxxx
   ```

5. **Activate the account:**
   - Copy URL
   - Open in new browser/incognito
   - Set password
   - Click "Activate Account"

6. **Sign in as new user:**
   - Go to `/sign-in`
   - Use test@example.com + new password
   - Verify you only see Leads and Dashboard in sidebar ✓

---

## 🎯 What You Can Do Now

### **As Super Admin (galaljobah@gmail.com)**

✅ Create unlimited user accounts  
✅ Assign custom page permissions to clients  
✅ Resend invites to pending users  
✅ Delete user accounts  
✅ View all users and their permissions  

### **As Admin** (role: admin/owner)

✅ Access all pages (Dashboard, Clients, Projects, Finance, Forms, Leads)  
✅ Manage all business data  
❌ Cannot create/delete user accounts  

### **As Client** (role: client)

✅ Access only assigned pages  
✅ View and manage data within those pages  
❌ Cannot see other pages in sidebar  
❌ Redirected if trying to access restricted pages  

---

## 🎨 UI Preview

### **Account Management Page**

```
┌─────────────────────────────────────────────┐
│ 🔷 Account Management                       │
│ Create and manage user accounts...          │
│                       [+ Create New Account] │
├─────────────────────────────────────────────┤
│ Name    Email         Role   Pages   Status │
│ John D  john@ex.com   Admin  All     Active │
│ Jane S  jane@ex.com   Client Leads   Pending│
└─────────────────────────────────────────────┘
```

### **Create User Dialog**

```
┌───────────────────────────────────┐
│ Create New Account                │
│ Create a new user account and...  │
├───────────────────────────────────┤
│ Full Name*: [____________]        │
│ Email*:     [____________]        │
│ Role*:      [Client ▼]            │
│                                   │
│ Page Access Permissions:          │
│ ☑ Dashboard                       │
│ ☑ Clients                         │
│ ☐ Projects                        │
│ ☐ Finance                         │
│ ☐ Forms                           │
│ ☑ Leads                           │
│                                   │
│     [Cancel] [Create & Send ✉️]   │
└───────────────────────────────────┘
```

---

## 📧 Email Setup (Optional)

The system creates users and generates invite URLs. To send actual emails:

### Using Resend (Recommended):

1. **Install Resend:**
   ```bash
   npm install resend
   ```

2. **Add API key to .env.local:**
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

3. **Update `/api/account/users/route.ts`:**
   ```typescript
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);

   // Replace the TODO section (line ~108) with:
   await resend.emails.send({
     from: 'noreply@yourdomain.com',
     to: body.email,
     subject: 'Welcome to AICBOLT - Activate Your Account',
     html: `
       <h1>Welcome ${body.name}!</h1>
       <p>You've been invited to join AICBOLT.</p>
       <p><a href="${inviteUrl}">Click here to activate your account</a></p>
       <p>This link expires in 7 days.</p>
     `
   });
   ```

4. **Do the same in** `/api/account/users/[id]/resend-invite/route.ts`

---

## 🔍 Troubleshooting

### **Can't Access /account Page**

✅ Make sure you're logged in as `galaljobah@gmail.com`  
✅ Check if Account link appears in sidebar  
✅ Try logging out and back in  

### **User Created But Can't Sign In**

✅ User must activate account via invite link first  
✅ Check console for invite URL  
✅ Verify invite token hasn't expired (7 days)  
✅ Resend invite if needed  

### **Client Can See Pages They Shouldn't**

✅ Log out and back in to refresh permissions  
✅ Check user's allowedPages in database  
✅ Verify sidebar is using `hasPageAccess()` check  

### **Migration Errors**

✅ Make sure POSTGRES_URL is set in .env.local  
✅ Check database is accessible  
✅ Run migrations one at a time manually if needed  

---

## ✨ Advanced Usage

### **Programmatically Update User Permissions**

```sql
-- Give user access to specific pages
UPDATE users 
SET allowed_pages = ARRAY['dashboard', 'clients', 'leads']
WHERE email = 'user@example.com';

-- Give admin full access
UPDATE users 
SET role = 'admin', allowed_pages = NULL
WHERE email = 'user@example.com';
```

### **Check User Access in Code**

```typescript
import { hasPageAccess } from '@/lib/permissions';

// In any component:
const { data: user } = useSWR('/api/user', fetcher);

if (hasPageAccess(user, 'leads')) {
  // User can access leads page
}
```

---

## 📚 Additional Resources

- `ACCOUNT_SYSTEM_COMPLETE.md` - Detailed documentation
- `LEADS_DASHBOARD_README.md` - Leads system docs
- `MIGRATION_INSTRUCTIONS.md` - Database migration help
- `ENV_SETUP.md` - Environment setup guide

---

## 🎊 Success!

You now have a complete enterprise-level account management system with:

✅ Role-based access control  
✅ Custom page permissions  
✅ Email invitation workflow  
✅ Premium dark UI  
✅ Secure authentication  

Create your first client account and test it out! 🚀


