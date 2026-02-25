# Render Deployment Checklist

## ✅ FIXED ISSUES

### Critical Bugs Fixed:
1. ✅ **manage.py** - Fixed incorrect content (was showing wsgi.py code)
2. ✅ **render.yaml** - Changed `househunt.wsgi` to `backend.wsgi` (correct module name)
3. ✅ **requirements.txt** - Added missing `django-cleanup==8.0.0` package
4. ✅ **AWS_S3_REGION** - Fixed inconsistency in models.py (was using AWS_S3_REGION instead of AWS_S3_REGION_NAME)
5. ✅ **Credentials** - Removed exposed AWS and Africa's Talking credentials from .env
6. ✅ **S3 deletion** - Added safety check to skip S3 deletion if credentials are missing
7. ✅ **runtime.txt** - Created file specifying Python 3.11.9 for Render
8. ✅ **Database SSL** - Made SSL requirement more explicit for production

## 🔒 SECURITY ACTIONS REQUIRED

### IMMEDIATE - Rotate Compromised Credentials:
Your credentials were exposed in the .env file. You MUST rotate these immediately:

`
   - Generate new API key
   - Update in Render environment variables

3. **Django SECRET_KEY**:
   - Generate new secret key: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`
   - Update in Render environment variables

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Environment Variables in Render
Set these in your Render dashboard (DO NOT use the exposed values):

```
SECRET_KEY=<generate-new-secret-key>
DEBUG=False
ALLOWED_HOSTS=your-app.onrender.com,yourdomain.com
DATABASE_URL=<auto-populated-by-render>
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://yourdomain.com

# AWS S3 (use NEW credentials after rotation)
AWS_ACCESS_KEY_ID=<new-access-key>
AWS_SECRET_ACCESS_KEY=<new-secret-key>
AWS_S3_BUCKET_NAME=househunt-media-ke
AWS_S3_REGION=eu-north-1

# Africa's Talking (use NEW key after rotation)
AT_USERNAME=househunt
AT_API_KEY=<new-api-key>
AT_SENDER_ID=HouseHunt
```

### 2. Database Setup
- Render will auto-create PostgreSQL database
- Migrations will run automatically via buildCommand
- Ensure DATABASE_URL is linked in render.yaml (already configured)

### 3. Static Files
- WhiteNoise is configured for static file serving
- `collectstatic` runs automatically in buildCommand

### 4. Git Repository
Before pushing to Render:
```bash
# Make sure .env is in .gitignore (it already is)
git add .
git commit -m "Fix deployment issues for Render"
git push origin main
```

### 5. S3 Bucket Configuration
Ensure your S3 bucket has:
- CORS policy allowing your frontend domain
- Public read access for uploaded files
- Proper IAM permissions for the access key

Example CORS policy:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["https://your-frontend.vercel.app"],
        "ExposeHeaders": ["ETag"]
    }
]
```

## ⚠️ REMAINING CONSIDERATIONS

### 1. App Configuration Files
The app.py files should be named `apps.py` (Django convention):
- `apps/accounts/app.py` → should be `apps.py`
- `apps/houses/app.py` → should be `apps.py`
- `apps/bookings/app.py` → should be `apps.py`

However, they're working because settings.py references the correct config classes.

### 2. Production Optimizations
Consider adding to settings.py for production:
```python
# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
```

### 3. Monitoring & Logging
- Set up Render logging
- Consider adding Sentry for error tracking
- Monitor database connection pool

### 4. Testing Before Deploy
Run these locally:
```bash
# Test with production-like settings
DEBUG=False python manage.py check --deploy

# Test migrations
python manage.py makemigrations --check --dry-run

# Test static files collection
python manage.py collectstatic --no-input --dry-run
```

## 🚀 DEPLOYMENT STEPS

1. **Rotate all exposed credentials** (see Security Actions above)
2. **Push code to GitHub**
3. **Create new Web Service on Render**
   - Connect your GitHub repository
   - Render will auto-detect render.yaml
4. **Create PostgreSQL database** (if not using render.yaml auto-creation)
5. **Set environment variables** in Render dashboard
6. **Deploy!**

## 📝 POST-DEPLOYMENT

1. Check logs for any errors
2. Test all endpoints:
   - `/api/auth/register/`
   - `/api/auth/login/`
   - `/api/houses/`
   - `/api/bookings/`
3. Test file uploads to S3
4. Test SMS sending (Africa's Talking)
5. Verify CORS with your frontend

## 🐛 KNOWN ISSUES (NONE BLOCKING)

All critical issues have been fixed. The application is ready for deployment after:
1. Rotating exposed credentials
2. Setting up environment variables in Render
3. Configuring S3 bucket properly
