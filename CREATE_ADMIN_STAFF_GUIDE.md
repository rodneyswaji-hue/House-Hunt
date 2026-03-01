# 👥 Create Admin & Staff Users Guide

## 🏠 LOCAL DEVELOPMENT

### Create Admin (Superuser)

**Method 1: Interactive Command**
```bash
cd backend
. venv/bin/activate
python manage.py createsuperuser
```

You'll be prompted:
```
Phone number: 0700000001
Name: Admin User
Password: ********
Password (again): ********
```

**Method 2: Django Shell**
```bash
cd backend
. venv/bin/activate
python manage.py shell
```

Then in Python shell:
```python
from apps.accounts.models import Landlord

# Create admin
admin = Landlord.objects.create_superuser(
    phone='0700000001',
    name='Admin User',
    password='YourSecurePassword123!'
)
print(f"Admin created: {admin.name}")
exit()
```

### Create Staff User

**Using Django Shell:**
```bash
cd backend
. venv/bin/activate
python manage.py shell
```

```python
from apps.accounts.models import Landlord

# Create staff user
staff = Landlord.objects.create_user(
    phone='0700000002',
    name='Staff User',
    password='StaffPassword123!'
)
staff.is_staff = True  # Can access admin panel
staff.save()
print(f"Staff created: {staff.name}")
exit()
```

### Test Login

**Access admin panel:**
```
http://localhost:8000/admin
```

**Login with:**
- Phone: `0700000001` (admin) or `0700000002` (staff)
- Password: (what you set above)

---

## ☁️ RENDER (PRODUCTION)

### Step 1: Access Render Shell

1. Go to https://dashboard.render.com
2. Click your backend service
3. Click **Shell** tab (top right)
4. Wait for shell to connect

### Step 2: Create Admin

**In Render Shell, run:**
```bash
python manage.py createsuperuser
```

**Enter details:**
```
Phone number: 0700000001
Name: Admin User
Password: ********
Password (again): ********
```

### Step 3: Create Staff User

**In Render Shell:**
```bash
python manage.py shell
```

**Then:**
```python
from apps.accounts.models import Landlord

staff = Landlord.objects.create_user(
    phone='0700000002',
    name='Staff User',
    password='StaffPassword123!'
)
staff.is_staff = True
staff.save()
print(f"Staff created: {staff.name}")
exit()
```

### Step 4: Access Production Admin

**URL:**
```
https://your-backend.onrender.com/admin
```

**Login with:**
- Phone: `0700000001` or `0700000002`
- Password: (what you set)

---

## 🔐 PERMISSIONS EXPLAINED

### Admin (Superuser)
- `is_superuser = True`
- `is_staff = True`
- Can do EVERYTHING:
  - View all data
  - Add/edit/delete anything
  - Manage users
  - View contact messages
  - Access all admin features

### Staff User
- `is_superuser = False`
- `is_staff = True`
- Can access admin panel
- Limited permissions (you control what they can do)
- Good for support team

### Regular Landlord
- `is_superuser = False`
- `is_staff = False`
- Cannot access admin panel
- Can only manage their own properties

---

## 📋 QUICK REFERENCE

### Create Admin Locally
```bash
cd backend && . venv/bin/activate
python manage.py createsuperuser
# Phone: 0700000001
# Name: Admin
# Password: YourPassword123!
```

### Create Admin on Render
```bash
# In Render Shell
python manage.py createsuperuser
# Phone: 0700000001
# Name: Admin
# Password: YourPassword123!
```

### Create Staff Locally
```bash
cd backend && . venv/bin/activate
python manage.py shell
```
```python
from apps.accounts.models import Landlord
staff = Landlord.objects.create_user(phone='0700000002', name='Staff', password='Pass123!')
staff.is_staff = True
staff.save()
exit()
```

### Create Staff on Render
```bash
# In Render Shell
python manage.py shell
```
```python
from apps.accounts.models import Landlord
staff = Landlord.objects.create_user(phone='0700000002', name='Staff', password='Pass123!')
staff.is_staff = True
staff.save()
exit()
```

---

## 🧪 VERIFY IT WORKS

### 1. Check User Was Created
```bash
python manage.py shell
```
```python
from apps.accounts.models import Landlord
admin = Landlord.objects.get(phone='0700000001')
print(f"Name: {admin.name}")
print(f"Is staff: {admin.is_staff}")
print(f"Is superuser: {admin.is_superuser}")
exit()
```

### 2. Test Login
```
Local: http://localhost:8000/admin
Production: https://your-backend.onrender.com/admin

Phone: 0700000001
Password: (your password)
```

### 3. View Contact Messages
```
1. Login to admin
2. Click "Contact form messages"
3. See all messages from users
```

---

## 🚨 TROUBLESHOOTING

### "Phone number already exists"
```bash
python manage.py shell
```
```python
from apps.accounts.models import Landlord
Landlord.objects.filter(phone='0700000001').delete()
exit()
```

### "Can't access admin panel"
Check user has `is_staff = True`:
```python
from apps.accounts.models import Landlord
user = Landlord.objects.get(phone='0700000001')
user.is_staff = True
user.save()
exit()
```

### "Forgot admin password"
Reset it:
```bash
python manage.py shell
```
```python
from apps.accounts.models import Landlord
admin = Landlord.objects.get(phone='0700000001')
admin.set_password('NewPassword123!')
admin.save()
exit()
```

---

## 📝 BEST PRACTICES

### Passwords
- Minimum 8 characters
- Mix of letters, numbers, symbols
- Don't use common passwords
- Different for each environment

### Phone Numbers
- Use real phone for production
- Use test numbers for local (0700000001, etc.)
- Keep track of admin phones

### Security
- Don't share admin credentials
- Create separate staff accounts for team members
- Regularly review admin access
- Use strong passwords in production

---

## ✅ CHECKLIST

**Local Setup:**
- [ ] Created admin user
- [ ] Tested admin login
- [ ] Can view contact messages
- [ ] Created staff user (optional)

**Production Setup:**
- [ ] Accessed Render shell
- [ ] Created admin user
- [ ] Tested admin login at production URL
- [ ] Can view contact messages
- [ ] Saved admin credentials securely

---

**You're all set!** Admin and staff can now view all contact messages from users and landlords.
