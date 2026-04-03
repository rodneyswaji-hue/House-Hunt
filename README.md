# 🏠 House Hunt

A modern property rental and management platform designed to simplify the process of finding, listing, and managing rental properties.

---

## 🚀 Overview

House Hunt is a full-stack web application that connects tenants and landlords. It provides an intuitive interface for property browsing, tenant management, and automated communication (including WhatsApp notifications).

---

## ✨ Features

### 👤 User Features
- Browse available rental properties
- View detailed property listings
- Secure authentication (email/password)
- Tenant dashboard

### 🏢 Landlord Features
- Add and manage property listings
- Track tenants and rental status
- View inquiries and manage leads

### 📩 Smart Communication
- Automated WhatsApp notifications for tenants
- Rent reminders and alerts
- Inquiry handling system

### 🧠 Smart System
- Multi-step form for tenant applications
- Backend data storage and management
- Scalable API architecture

---
## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion

### Backend
- Django
- Django REST Framework

### Database
- PostgreSQL (hosted on Render)

### Cloud & Storage
- Amazon Web Services (AWS S3) for media and file storage

### Deployment & Hosting
- Render (Backend & Database hosting)

### Other Tools
- Git & GitHub
- WhatsApp API integration (planned)
---

## ☁️ Cloud Storage (AWS S3)

- Integrated AWS S3 for storing property images and media files
- Scalable and secure file storage solution
- Enables fast image delivery and efficient asset management
- Supports future scalability for large datasets

### Use Cases
- Property listing images
- Media uploads from users
- Document storage (future feature)

## 📂 Project Structure
house-hunt/
│
├── frontend/ # React application
│ ├── src/
│ └── public/
│
├── backend/ # Django backend
│ ├── apps/
│ ├── backend/
│ └── manage.py
│
└── README.md

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/house-hunt.git
cd house-hunt
```
### Backend Setup (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
### Frontend Setup (React)
```bash
cd frontend
npm install
npm run dev
```
### Environment Variables
Create a .env file in both frontend and backend.
#### Backend
```bash
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_URL=your_database_url
```
#### Frontend
```bash
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```
## 🔐 Authentication
Supabase authentication is used for user login and signup
Supports secure session management
📡 API Endpoints (Sample)
Method	Endpoint	Description
GET	/api/properties/	Get all properties
POST	/api/properties/	Create property
GET	/api/tenants/	Get tenants
POST	/api/auth/login	User login
## 📸 Screenshots



## Future Improvements
Payment integration (rent payments)
Advanced search & filters
Real-time chat system
Full WhatsApp automation
Admin analytics dashboard
🤝 Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull request.



## Author

Rodney Swaji

GitHub: https://github.com/rodneyswaji-hue
LinkedIn: https://www.linkedin.com/in/rodney-swaji-9b4132234/
