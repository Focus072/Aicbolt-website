# AICBOLT A2P 10DLC SMS Campaign Documentation

## Campaign Description

Messages are sent by AICBOLT to existing customers to provide important account notifications and security alerts. Recipients are users who have opted in via the website (`/sms-signup`) or SMS keyword. Messages are informational only.

## Message Flow Summary

**Opt-In Process:**
- Users visit `/sms-signup` page on AICBOLT website
- Users enter their 10-digit mobile phone number
- Users check the consent checkbox (not pre-checked) agreeing to receive SMS messages from AICBOLT
- Required disclosures are displayed:
  - "You may receive up to 2 messages per month"
  - "Message and data rates may apply"
  - "Consent is not a condition of purchase"
  - "Reply STOP to cancel. Reply HELP for assistance."
- Links to Privacy Policy and Terms of Service are provided below the form
- Upon successful opt-in, users receive confirmation message

**Opt-In URL:** `https://aicbolt.com/sms-signup` (publicly accessible)

## Opt-In Confirmation Message

You are successfully opted in for messages from AICBOLT for account notifications. Message and data rates may apply. Reply HELP for additional support. Reply STOP to unsubscribe.

## Sample Messages

### Sample 1: Account Security Alert (with STOP)

Hi [FirstName], we detected a login from a new device for your AICBOLT account on [Date] at [Time]. If this wasn't you, please secure your account immediately at [Link]. Reply STOP to unsubscribe.

**Message Type:** Security Alert  
**Length:** ~140 characters  
**Includes:** Opt-out instruction

---

### Sample 2: Account Notification (with HELP)

[FirstName], your AICBOLT account settings were updated on [Date]. Changes: [Action]. View details: [Link]. Reply HELP for support. Reply STOP to unsubscribe.

**Message Type:** Account Notification  
**Length:** ~120 characters  
**Includes:** Help instruction, Opt-out instruction

---

### Sample 3: Password Change Alert (with STOP)

Security Alert: Your AICBOLT account password was changed on [Date]. If you didn't make this change, contact support@aicbolt.com immediately. Reply STOP to opt out of future messages.

**Message Type:** Security Alert  
**Length:** ~130 characters  
**Includes:** Support contact, Opt-out instruction

---

### Sample 4: Service Update Notification (with HELP)

AICBOLT Update: [MessageContent]. Your account now includes [Feature]. Learn more: [Link]. Message and data rates may apply. Reply HELP for help. Reply STOP to unsubscribe.

**Message Type:** Service Update  
**Length:** ~140 characters  
**Includes:** Rate disclosure, Help instruction, Opt-out instruction

---

### Sample 5: Account Activity Notification (with HELP and STOP)

Hi [FirstName], there was activity on your AICBOLT account on [Date]. Check your dashboard: [Link]. Questions? Reply HELP. Reply STOP to unsubscribe.

**Message Type:** Account Activity  
**Length:** ~115 characters  
**Includes:** Help instruction, Opt-out instruction

---

### Sample 6: Two-Factor Authentication Code (No opt-out)

Your AICBOLT verification code is [Code]. This code expires in 10 minutes. Do not share this code with anyone.

**Message Type:** Authentication  
**Length:** ~90 characters  
**Note:** Security codes do not include opt-out instructions per best practices

---

### Sample 7: Billing Notification (with STOP)

AICBOLT: Your subscription payment of $[Amount] was processed on [Date]. View invoice: [Link]. Reply STOP to unsubscribe.

**Message Type:** Billing Notification  
**Length:** ~100 characters  
**Includes:** Opt-out instruction

---

## Opt-Out Handling

### Opt-Out Keywords

The following keywords will opt users out of SMS messages:
- **STOP**
- **UNSUBSCRIBE**
- **END**
- **QUIT**

All keywords are case-insensitive.

### Opt-Out Confirmation Message

You have been unsubscribed from AICBOLT notifications. No further messages will be sent.

---

## Help Handling

### Help Keywords

The following keywords will trigger a help response:
- **HELP**
- **INFO**
- **SUPPORT**

All keywords are case-insensitive.

### Help Response Message

AICBOLT Support: Visit www.aicbolt.com or email support@aicbolt.com for assistance. Reply STOP to unsubscribe.

---

## Message Best Practices

### Character Limits
- Standard SMS: 160 characters (single message)
- Concatenated SMS: 306 characters (2 messages)
- Best practice: Keep messages under 160 characters when possible

### Required Elements
1. **Brand identification:** Always include "AICBOLT" in messages
2. **Clear purpose:** State why the message was sent
3. **Actionable content:** Include links or clear next steps when applicable
4. **Opt-out instruction:** Include "Reply STOP to unsubscribe" in all non-security messages
5. **Help instruction:** Include "Reply HELP for assistance" when appropriate

### Message Types

**Account Notifications:**
- Account settings changes
- Profile updates
- Subscription changes
- Account activity alerts

**Security Alerts:**
- Login from new device
- Password changes
- Suspicious activity
- Two-factor authentication codes

**Service Updates:**
- New features
- System maintenance
- Policy changes
- Important announcements

---

## Compliance Summary

### Brand Consistency
- **Brand Name:** AICBOLT (consistent across all pages and documentation)
- **Domain:** aicbolt.com (consistent across all pages and documentation)
- **Contact Email:** info@aicbolt.com (for general inquiries), support@aicbolt.com (for SMS help, as specified in Terms of Service)

### Required Disclosures

✅ **Privacy Policy** includes:
- Exact clause: "No mobile information will be shared, sold, rented, or transferred to third parties for marketing or promotional purposes. Information sharing to subcontractors in support services, such as customer service, is permitted."
- Link to SMS Opt-In page
- Link to Terms of Service
- **Publicly accessible** (no login required)

✅ **Terms of Service** includes:
- Program name: AICBOLT Notifications
- Message frequency: "You may receive up to 2 messages per month"
- Rate disclosure: "Message and data rates may apply"
- Opt-out instructions: "Reply STOP to unsubscribe. You can also reply END, UNSUBSCRIBE, or QUIT."
- Help instructions: "Reply HELP, INFO, or SUPPORT for assistance, or email support@aicbolt.com for help."
- Customer care contact: "For assistance, contact support@aicbolt.com"
- Cross-link to Privacy Policy

✅ **SMS Opt-In Page** (`/sms-signup`) includes:
- Brand name prominently displayed
- Description: "Subscribe to receive account notifications via SMS"
- Message frequency disclosure: "You may receive up to 2 messages per month"
- "Message and data rates may apply" disclosure
- Unchecked consent checkbox
- "Consent is not a condition of purchase" statement
- "Reply STOP to cancel. Reply HELP for assistance."
- Links to Privacy Policy and Terms of Service
- Publicly accessible URL

✅ **Footer** includes:
- Links to Privacy Policy
- Links to Terms of Service
- Link to SMS Opt-In page

---

## Campaign Approval Information

**Note:** Campaign approval typically takes 1–7 business days and includes a $15 vetting fee.

Campaigns are manually vetted by carriers; approval can take 1–7 business days and a $15 vetting fee applies.

---

## Opt-In Evidence

**Screenshot Placeholder:**

Upload a publicly accessible screenshot of the `/sms-signup` page (e.g., Google Drive link) for Twilio reviewers.

**Public URL:** `https://aicbolt.com/sms-signup`

**Additional Evidence Required:**
- Screenshot of Privacy Policy page showing SMS section
- Screenshot of Terms of Service page showing SMS Communications section
- Verification that both pages are publicly accessible without login

---

## Testing Checklist

Before submitting to Twilio, verify:

- [ ] `/sms-signup` page is publicly accessible
- [ ] `/privacy-policy` page is publicly accessible (no login required)
- [ ] `/terms-of-service` page is publicly accessible (no login required)
- [ ] All email addresses are correct (info@aicbolt.com, support@aicbolt.com)
- [ ] All sample messages include proper opt-out/help instructions
- [ ] Brand name "AICBOLT" is consistent across all pages
- [ ] Domain "aicbolt.com" is consistent across all pages
- [ ] Message frequency disclosure is present on opt-in page
- [ ] Rate disclosure is present on opt-in page
- [ ] Consent checkbox is NOT pre-checked
- [ ] Links to Privacy Policy and Terms of Service are functional

---

**Last Updated:** January 2025  
**Brand:** AICBOLT  
**Domain:** aicbolt.com  
**Compliance:** Twilio A2P 10DLC Ready
