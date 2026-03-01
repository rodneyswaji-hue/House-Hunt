# 🚀 Quick Start Guide

## Prerequisites
- Python 3.8+ with venv
- Node.js 18+
- PostgreSQL (for production) or SQLite (for local dev)

---

## 🏃 Run Locally (Development)

### Option 1: Use the Script
```bash
./run-local.sh
```

### Option 2: Manual Start

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
python manage.py migrate  # First time only
python manage.py runserver
```

#### Terminal 2 - Frontend
```bash
cd house-hunt-frontend
npm run dev
```

---

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin
- **Health Check**: http://localhost:8000/health

---

## 👤 Create Admin User

```bash
cd backend
source venv/bin/activate
python manage.py createsuperuser
```

Follow prompts:
- Phone: 0712345678
- Name: Admin User
- Password: (your choice)

---

## 🧪 Test the Application

### 1. Test Backend
```bash
curl http://localhost:8000/health
# Should return: {"status": "ok"}

curl http://localhost:8000/api/houses/
# Should return: [] (empty list initially)
```

### 2. Test Frontend
- Open http://localhost:3000
- Should see landing page
- Click "Browse Listings"
- Should see empty state (no properties yet)

### 3. Add Test Property
- Go to http://localhost:3000/landlord/register
- Register as landlord
- Login
- Click "Add New Property"
- Fill form and submit
- View in listings

---

## 📦 Install Dependencies

### Backend (if needed)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend (if needed)
```bash
cd house-hunt-frontend
npm install
```

---

## 🔧 Environment Variables

### Backend (.env)
```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

# AWS S3 (optional for local dev)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
AWS_S3_REGION=eu-north-1
CLOUDFRONT_DOMAIN=

# Africa's Talking (optional for local dev)
AT_USERNAME=sandbox
AT_API_KEY=
AT_SENDER_ID=HouseHunt
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
DJANGO_API_URL=http://localhost:8000/api
```

---

## 🐛 Troubleshooting

### Frontend won't build
```bash
cd house-hunt-frontend
rm -rf .next node_modules
npm install
npm run build
```

### Backend errors
```bash
cd backend
source venv/bin/activate
python manage.py check
python manage.py makemigrations
python manage.py migrate
```

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

---

## 📝 Common Tasks

### Apply New Migrations
```bash
cd backend
source venv/bin/activate
python manage.py migrate
```

### Create Superuser
```bash
cd backend
source venv/bin/activate
python manage.py createsuperuser
```

### Rebuild Frontend
```bash
cd house-hunt-frontend
npm run build
```

### Check for Errors
```bash
# Backend
cd backend
source venv/bin/activate
python manage.py check

# Frontend
cd house-hunt-frontend
npm run build
```

---

## 🚀 Deploy to Production

### 1. Backend (Render)
```bash
git push origin main
# Render auto-deploys from GitHub
# Set environment variables in Render dashboard
# Migrations run automatically
```

### 2. Frontend (Vercel)
```bash
# Connect GitHub repo to Vercel
# Set environment variables:
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
DJANGO_API_URL=https://your-backend.onrender.com/api
# Deploy automatically on push
```

---

## ✅ Verify Everything Works

### Backend
- [ ] Health check returns OK
- [ ] Admin panel accessible
- [ ] API endpoints respond
- [ ] Migrations applied

### Frontend
- [ ] Landing page loads
- [ ] Listings page loads
- [ ] Login/register works
- [ ] Dashboard accessible

---

## 📚 More Information

- **Features**: See `FEATURES_AND_UPDATES.md`
- **Testing**: See `TESTING_CHECKLIST.md`
- **Fixes**: See `FIXES_COMPLETED.md`
- **Deployment**: See `DEPLOYMENT_READY.md`

---

**Need Help?** Check the documentation files or review the code comments.
