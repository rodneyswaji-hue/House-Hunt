# HouseHunt Backend — Complete Setup Guide

## STEP 1 — Prerequisites

Install Python 3.11+ from https://python.org/downloads
Install PostgreSQL from https://postgresql.org/download (note your postgres password)

---

## STEP 2 — Project Setup (local)

```bash
cd househunt-backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

---

## STEP 3 — PostgreSQL (local)

```bash
psql -U postgres
```
Inside psql:
```sql
CREATE DATABASE househunt;
CREATE USER househunt_user WITH PASSWORD 'choose_a_password';
GRANT ALL PRIVILEGES ON DATABASE househunt TO househunt_user;
\q
```

Generate a SECRET_KEY:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Update your `.env`:
```
SECRET_KEY=the_generated_key
DEBUG=True
DATABASE_URL=postgres://househunt_user:choose_a_password@localhost:5432/househunt
```

---

## STEP 4 — Run migrations & create admin

```bash
python manage.py migrate
python manage.py createsuperuser   # asks for phone, name, password
python manage.py runserver
```

Backend: http://localhost:8000
Admin panel: http://localhost:8000/admin

---

## STEP 5 — AWS S3 Bucket

### Create the bucket
1. Go to https://console.aws.amazon.com/s3 → Create bucket
2. Name: `househunt-media` | Region: af-south-1 (Cape Town)
3. Uncheck "Block all public access" → confirm → Create bucket

### Set bucket policy (public reads)
Bucket → Permissions → Bucket policy → Edit → paste (replace YOUR_BUCKET_NAME):
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
  }]
}
```

### Create IAM user
1. IAM → Users → Create user → name: `househunt-s3-user`
2. Attach policy: `AmazonS3FullAccess`
3. Security credentials tab → Create access key → Application outside AWS
4. Copy the Access Key ID and Secret (only shown once!)

### Add S3 CORS
Bucket → Permissions → CORS → Edit:
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedOrigins": ["http://localhost:3000", "https://your-nextjs-app.vercel.app"],
  "ExposeHeaders": []
}]
```

### Add to .env
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET_NAME=househunt-media
AWS_S3_REGION=af-south-1
```

---

## STEP 6 — Africa's Talking SMS

1. Sign up free at https://africastalking.com
2. Dashboard → Settings → API Key → copy it
3. Sandbox username is literally: `sandbox`

Add to `.env`:
```
AT_USERNAME=sandbox
AT_API_KEY=your_api_key
AT_SENDER_ID=HouseHunt
```

Test SMS: AT Dashboard → SMS → Simulator → enter your phone number

Going live later: AT Dashboard → Go Live → register sender ID "HouseHunt" → change AT_USERNAME to your real username

---

## STEP 7 — Deploy to Render

### Push to GitHub
```bash
git init
git add .
git commit -m "Initial backend"
git remote add origin https://github.com/YOUR_USERNAME/househunt-backend.git
git push -u origin main
```

### Deploy
1. https://render.com → New → Web Service → connect your repo
2. Render detects render.yaml automatically → click Apply
3. It creates the web service AND PostgreSQL database together

### Set environment variables on Render
In your web service → Environment tab:
```
SECRET_KEY              = (generate fresh one)
ALLOWED_HOSTS           = your-app-name.onrender.com
CORS_ALLOWED_ORIGINS    = https://your-nextjs-app.vercel.app
AWS_ACCESS_KEY_ID       = (from Step 5)
AWS_SECRET_ACCESS_KEY   = (from Step 5)
AWS_S3_BUCKET_NAME      = househunt-media
AT_USERNAME             = sandbox
AT_API_KEY              = (from Step 6)
```
DATABASE_URL is set automatically.

Your backend URL: `https://househunt-backend.onrender.com`

---

## STEP 8 — Update Next.js .env.local

```
# Production
DJANGO_API_URL=https://househunt-backend.onrender.com/api
NEXT_PUBLIC_API_URL=https://househunt-backend.onrender.com/api

# Local dev
# DJANGO_API_URL=http://localhost:8000/api
```

---

## All API Endpoints

| Method | URL | Auth Required | Description |
|--------|-----|---------------|-------------|
| POST | /api/auth/register/ | No | Create landlord account |
| POST | /api/auth/login/ | No | Login, returns JWT |
| GET | /api/auth/me/ | Yes | Current landlord info |
| POST | /api/auth/forgot-password/ | No | Send OTP to phone |
| POST | /api/auth/verify-otp/ | No | Verify OTP |
| POST | /api/auth/reset-password/ | No | Reset password |
| GET | /api/houses/?location=&bedrooms=&max_price= | No | List houses |
| POST | /api/houses/ | Yes | Create house |
| GET | /api/houses/{id}/ | No | Get single house |
| PATCH | /api/houses/{id}/ | Yes (owner only) | Update house |
| DELETE | /api/houses/{id}/ | Yes (owner only) | Delete house |
| POST | /api/bookings/ | No | Register for notification |

---

## Troubleshooting

"relation does not exist" → run `python manage.py migrate`
CORS error → add your Next.js URL to CORS_ALLOWED_ORIGINS
S3 403 error → check bucket policy + IAM user has AmazonS3FullAccess
SMS not arriving → use AT Simulator in sandbox mode
Render build failing → check build logs; migrations run automatically