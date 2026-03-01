# 🔧 Fix Google Maps API Errors

## Errors You're Seeing:

### 1. ✅ FIXED: Performance Warning
**Error:** "Google Maps JavaScript API has been loaded directly without loading=async"
**Fix:** Added `loading=async` and `strategy="afterInteractive"` to Script tag

### 2. ⚠️ Deprecation Warning (Not Critical)
**Error:** "google.maps.Marker is deprecated"
**Status:** Still works, not urgent. Will be supported for 12+ months
**Future Fix:** Migrate to AdvancedMarkerElement (already prepared with mapId)

### 3. 🔴 CRITICAL: BillingNotEnabledMapError
**Error:** "Google Maps JavaScript API error: BillingNotEnabledMapError"
**Cause:** Billing not enabled on your Google Cloud project

**Fix:**
1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to **Billing** → **Link a billing account**
4. Add a credit/debit card
5. **Don't worry:** You get $200 free credit per month!
6. You won't be charged unless you exceed the free tier

### 4. 🔴 CRITICAL: RefererNotAllowedMapError
**Error:** "Your site URL to be authorized: https://house-hunt-nu.vercel.app/landlord/dashboard/add"
**Cause:** Your Vercel domain is not in the API key restrictions

**Fix:**
1. Go to: 
2. Click on your API key
3. Under **Application restrictions** → **HTTP referrers**
4. Add these URLs:
   ```
   http://localhost:3000/*
   http://localhost:*/*
   https://house-hunt-nu.vercel.app/*
   https://*.vercel.app/*
   ```
5. Click **SAVE**
6. Wait 5 minutes for changes to propagate

---

## 🚀 Quick Fix Steps

### Step 1: Enable Billing (Required)
```
1. Go to Google Cloud Console
2. Select your project
3. Billing → Link billing account
4. Add payment method
5. Confirm (you won't be charged - $200 free/month)
```

### Step 2: Add Vercel Domain to API Key
```
1. Google Cloud Console → APIs & Credentials
2. Click your API key
3. Application restrictions → HTTP referrers
4. Add: https://house-hunt-nu.vercel.app/*
5. Add: https://*.vercel.app/*
6. Save and wait 5 minutes
```

### Step 3: Redeploy on Vercel
```bash
git add .
git commit -m "Fix Google Maps configuration"
git push origin main
```

---

## 💰 Billing Concerns?

**You won't be charged!** Here's why:

### Free Tier (Monthly):
- 28,000+ map loads
- 40,000 geocoding requests  
- 100,000 Places API requests

### Your Usage (Estimated):
- ~500 map loads/month
- ~200 geocoding requests/month
- ~100 search requests/month

**Total cost: $0** (well within free tier)

### Set Billing Alert:
1. Google Cloud Console → Billing
2. Budgets & alerts
3. Create budget: $10
4. Get email if you approach limit

---

## ✅ After Fixing

You should see:
- ✅ Map loads correctly
- ✅ Search works
- ✅ Click to place marker works
- ✅ Drag marker works
- ✅ No errors in console

---

## 🔒 Security Reminder

Your API key restrictions should include:
- **HTTP referrers:** Only your domains
- **API restrictions:** Only Maps, Geocoding, Places APIs
- **Billing alerts:** Set to $10

This prevents unauthorized use even if someone copies your API key!
