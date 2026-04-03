# Google Maps API Setup Guide

## 🗺️ Get Your Google Maps API Key

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
- Click "Select a project" at the top
- Click "NEW PROJECT"
- Name it "House Hunt" or similar
- Click "CREATE"

### 3. Enable Required APIs
- Go to "APIs & Services" → "Library"
- Search and enable these APIs:
  - **Maps JavaScript API**
  - **Geocoding API**
  - **Places API**

### 4. Create API Key
- Go to "APIs & Services" → "Credentials"
- Click "+ CREATE CREDENTIALS" → "API key"
- Copy the API key

### 5. Restrict Your API Key (Important for Security)
- Click on your API key to edit it
- Under "Application restrictions":
  - Select "HTTP referrers (web sites)"
  - Add your domains:
    ```
    http://localhost:3000/*
    https://your-domain.com/*
    https://your-domain.vercel.app/*
    ```
- Under "API restrictions":
  - Select "Restrict key"
  - Select:
    - Maps JavaScript API
    - Geocoding API
    - Places API
- Click "SAVE"

### 6. Add to Your Project
Update `.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 7. Restart Your Dev Server
```bash
npm run dev
```

## 💰 Pricing (Free Tier)

Google Maps offers $200 free credit per month, which includes:
- **28,000+ map loads** per month
- **40,000 geocoding requests** per month
- **100,000 Places API requests** per month

For a small to medium rental listing site, this is more than enough!

## 🔒 Security Best Practices

1. **Never commit API keys to Git** - Already in `.gitignore`
2. **Always restrict your API key** - Follow step 5 above
3. **Monitor usage** - Check Google Cloud Console regularly
4. **Set billing alerts** - Get notified if you exceed free tier

## 🧪 Test Your Setup

After adding the API key and restarting:
1. Go to "Add Property" page
2. You should see an interactive Google Map
3. Try searching for "Kilimani, Nairobi"
4. Click on the map to place a marker
5. Drag the marker to adjust position

## ❓ Troubleshooting

### Map not loading?
- Check browser console for errors
- Verify API key is correct in `.env.local`
- Ensure Maps JavaScript API is enabled
- Restart dev server after adding API key

### "This page can't load Google Maps correctly"?
- Your API key might not be restricted properly
- Check billing is enabled (even for free tier)
- Verify domain restrictions match your current URL

### Search not working?
- Enable Geocoding API and Places API
- Check API restrictions include both APIs

## 🚀 For Production (Vercel)

Add the environment variable in Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - Key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: Your API key
4. Redeploy your app

Remember to add your Vercel domain to API key restrictions!
