# 🚀 Render Deployment Guide

## ✅ Your Backend is Render-Ready!

All necessary configurations are in place:
- ✅ `gunicorn` installed (web server)
- ✅ `whitenoise` configured (static files)
- ✅ `dj-database-url` configured (PostgreSQL connection)
- ✅ `psycopg2-binary` installed (PostgreSQL driver)
- ✅ `build.sh` created and executable
- ✅ Production security settings enabled

---

## 📋 Render Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name:** `househunt-backend`
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `backend` (if your backend is in a subdirectory)
- **Runtime:** `Python 3`
- **Build Command:** `./build.sh`
- **Start Command:** `gunicorn househunt.wsgi:application`

**Instance Type:**
- Start with **Free** tier for testing
- Upgrade to **Starter** ($7/month) for production

### 3. Add Environment Variables

Click **"Environment"** and add these variables:

```bash
# Required
SECRET_KEY=<generate-strong-key>
DEBUG=False
ALLOWED_HOSTS=<your-app-name>.onrender.com
DATABASE_URL=<will-be-auto-filled-if-you-add-postgres>

# CORS & CSRF (your frontend URL)
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app

# AWS S3 (for media storage)
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_S3_BUCKET_NAME=<your-bucket>
AWS_S3_REGION=eu-north-1
CLOUDFRONT_DOMAIN=<your-cloudfront-domain>

# Africa's Talking (for SMS)
AT_USERNAME=<your-username>
AT_API_KEY=<your-api-key>
AT_SENDER_ID=HouseHunt
```

**Generate SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4. Add PostgreSQL Database

1. In your Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `househunt-db`
   - **Database:** `househunt`
   - **User:** `househunt`
   - **Region:** Same as your web service
   - **Instance Type:** Free (for testing)

3. After creation, go to your **Web Service** → **Environment**
4. Add variable:
   - **Key:** `DATABASE_URL`
   - **Value:** Copy the **Internal Database URL** from your PostgreSQL service

### 5. Deploy!

Click **"Create Web Service"** - Render will:
1. Clone your repository
2. Run `build.sh` (install deps, collect static, migrate)
3. Start gunicorn
4. Your API will be live at `https://your-app-name.onrender.com`

---

## 🧪 Test Your Deployment

### Health Check
```bash
curl https://your-app-name.onrender.com/health/
```

### Admin Panel
```bash
https://your-app-name.onrender.com/admin/
```

### API Endpoints
```bash
# List houses
curl https://your-app-name.onrender.com/api/houses/

# Register
curl -X POST https://your-app-name.onrender.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"0712345678","password":"test123","confirm_password":"test123"}'
```

---

## 🔧 Post-Deployment Setup

### Create Superuser
1. Go to Render Dashboard → Your Web Service → **Shell**
2. Run:
```bash
python manage.py createsuperuser
```

### Update Frontend
Update your Next.js frontend to use the new backend URL:
```javascript
const API_URL = 'https://your-app-name.onrender.com/api'
```

---

## ⚠️ Important Notes

### Free Tier Limitations
- **Spins down after 15 minutes of inactivity**
- First request after spin-down takes ~30 seconds
- 750 hours/month free (enough for 1 service)

### Upgrade to Starter ($7/month) for:
- No spin-down
- Faster performance
- Custom domains
- Better for production

### Database Backups
- Free PostgreSQL expires after 90 days
- Upgrade to paid plan for persistence
- Export data regularly: `pg_dump`

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify `build.sh` is executable: `chmod +x build.sh`
- Ensure all dependencies are in `requirements.txt`

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- Use **Internal Database URL** (not External)
- Check database is in same region as web service

### Static Files Not Loading
- Verify `whitenoise` is in `MIDDLEWARE`
- Check `STATIC_ROOT` is set
- Ensure `collectstatic` runs in `build.sh`

### CORS Errors
- Add your frontend URL to `CORS_ALLOWED_ORIGINS`
- Add same URL to `CSRF_TRUSTED_ORIGINS`
- Include protocol: `https://` not just domain

### 502 Bad Gateway
- Check if gunicorn is starting correctly
- Verify `WSGI_APPLICATION = "househunt.wsgi.application"`
- Check logs for Python errors

---

## 📊 Monitoring

### View Logs
Render Dashboard → Your Service → **Logs**

### Metrics
Render Dashboard → Your Service → **Metrics**
- CPU usage
- Memory usage
- Request count
- Response times

### Alerts
Set up email alerts for:
- Service down
- High error rate
- Memory/CPU limits

---

## 🎉 You're Ready to Deploy!

Your backend is fully configured for Render. Just follow the steps above and you'll be live in minutes!

**Next Steps:**
1. Push to GitHub
2. Create Render account
3. Add PostgreSQL database
4. Create web service
5. Set environment variables
6. Deploy!
