# 📧 Contact System - How It Works

## ✅ System Already Built & Working!

### Flow:
```
User/Landlord → Contact Form → Backend API → Database → Admin Panel
```

## For Users/Landlords:

1. Go to `/contact` page
2. Fill in:
   - Name
   - Email
   - Message
3. Click "Send Message"
4. Message saved to database

## For Admin/Staff to View Messages:

### Step 1: Create Admin Account (First Time Only)
```bash
cd backend
. venv/bin/activate
python manage.py createsuperuser
# Enter phone: 0700000000
# Enter name: Admin
# Enter password: (your secure password)
```

### Step 2: Access Admin Panel
```
Local: http://localhost:8000/admin
Production: https://your-backend.onrender.com/admin
```

### Step 3: View Messages
1. Login with superuser credentials
2. Click "Contact form messages" in sidebar
3. See all messages with:
   - Name
   - Email
   - Message
   - Date/Time
   - Read/Unread status

### Step 4: Manage Messages
- Click message to view full details
- Mark as read/unread
- Delete spam messages
- Search by name/email
- Filter by read status

## Admin Features:

### List View Shows:
- Name
- Email
- Created date
- Read status (✓ or ✗)

### Detail View Shows:
- Full message
- Timestamp
- Sender info

### Actions Available:
- Mark as read (bulk action)
- Delete messages
- Search messages
- Filter by date/status

## API Endpoint:

**POST** `/api/contact/`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I need help with..."
}
```

**GET** `/api/contact/messages/` (Admin only)
- Returns all messages
- Requires admin authentication

## Database Table:

**Table**: `contact_form_messages`

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Auto-increment |
| name | String | Sender name |
| email | Email | Sender email |
| message | Text | Message content |
| created_at | DateTime | When sent |
| read | Boolean | Read status |

## Testing:

### 1. Send Test Message:
```bash
curl -X POST http://localhost:8000/api/contact/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","message":"Test message"}'
```

### 2. View in Admin:
```
1. Go to http://localhost:8000/admin
2. Login
3. Click "Contact form messages"
4. See your test message
```

## Production Setup:

1. Deploy backend to Render
2. Create superuser on Render:
   ```bash
   # In Render shell
   python manage.py createsuperuser
   ```
3. Access admin at: `https://your-backend.onrender.com/admin`
4. View all messages from users/landlords

## Security:

- Only admin/staff can view messages
- Messages stored securely in database
- Email validation on frontend
- CSRF protection enabled
- Admin panel requires authentication

---

**The system is ready to use!** Just create a superuser and access the admin panel.
