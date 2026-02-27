# VERCEL DEPLOYMENT ERRORS - FIXES

## Error 1: Image 400 - househuntlogo_2.png not found

**Cause**: Logo files in public/ folder are not committed to git

**Fix**:
```bash
cd house-hunt-frontend
git add public/*.png public/*.jpg public/*.jpeg
git commit -m "Add public assets (logos and images)"
git push origin main
```

Vercel will auto-redeploy with the images.

---

## Error 2: API 500 - /api/houses fails

**Cause**: Missing `DJANGO_API_URL` environment variable in Vercel

**Fix in Vercel Dashboard**:

1. Go to your Vercel project settings
2. Navigate to: **Settings → Environment Variables**
3. Add this variable:
   - **Name**: `DJANGO_API_URL`
   - **Value**: `https://your-backend.onrender.com/api` (your Render backend URL)
   - **Environment**: Production, Preview, Development (check all)

4. Click **Save**
5. Go to **Deployments** tab
6. Click **⋯** on latest deployment → **Redeploy**

---

## Alternative: If backend not deployed yet

If your Django backend isn't on Render yet, you have 2 options:

### Option A: Deploy backend first
1. Deploy backend to Render (see READY_TO_DEPLOY.md)
2. Get the Render URL (e.g., `https://househunt-backend.onrender.com`)
3. Add to Vercel: `DJANGO_API_URL=https://househunt-backend.onrender.com/api`

### Option B: Use mock data temporarily
Create a mock API response in your Next.js route until backend is ready:

```typescript
// Temporary fix in app/api/houses/route.ts
export async function GET(req: NextRequest) {
  // Return empty array until backend is deployed
  return NextResponse.json([]);
}
```

---

## Quick Fix Commands:

```bash
# 1. Commit images
cd /home/userrodney/house-hunting-app/House-Hunt/house-hunt-frontend
git add public/
git commit -m "Add public assets"
git push origin main

# 2. Then set DJANGO_API_URL in Vercel dashboard
# 3. Redeploy in Vercel
```

---

## Verify Fix:

After redeploying, check:
1. Image loads: `https://house-hunt-nu.vercel.app/househuntlogo_2.png`
2. API works: `https://house-hunt-nu.vercel.app/api/houses`

Both should return 200 OK.
