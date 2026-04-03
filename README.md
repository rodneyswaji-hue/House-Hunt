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
```bash
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
```
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

## 🔐 Authentication

The application uses Django’s built-in authentication system to handle user registration, login, and session management.

### Features

- Secure user authentication using Django’s auth framework  
- Password hashing and validation handled by Django  
- Session-based authentication for maintaining user state  
- Support for protected routes and user-specific data access  

### Implementation

- Custom user handling integrated with Django models  
- Authentication endpoints exposed via Django REST Framework  
- Backend enforces access control for sensitive operations  

### Security

- Passwords are securely hashed using Django’s built-in hashing algorithms  
- CSRF protection enabled for secure requests  
- Environment variables used to protect sensitive configuration data  



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
