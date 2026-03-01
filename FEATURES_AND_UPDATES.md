# House Hunt - Complete Features & Important Updates

## 📋 PROJECT OVERVIEW

**House Hunt** is a full-stack rental property listing platform for Kenya, connecting landlords with tenants. Built with Django (backend) and Next.js 16 (frontend).

**Tech Stack:**
- **Backend**: Django 4.2.28, Django REST Framework, PostgreSQL, JWT Authentication
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **Storage**: AWS S3 + CloudFront for media files
- **SMS**: Africa's Talking API for notifications
- **Deployment**: Render (backend), Vercel/Netlify (frontend)

---

## 🎯 CORE FEATURES

### 1. **Authentication System** (JWT-based)

#### Landlord Registration
- **Location**: `apps/accounts/views.py`, `components/landlord/AuthForms.tsx`
- Custom user model using phone number as username
- Password validation (min 8 characters)
- Kenyan phone number validation (`07XXXXXXXX` format)
- Automatic JWT token generation on registration
- **API**: `POST /api/auth/register/`

#### Landlord Login
- **Location**: `apps/accounts/views.py`, `components/landlord/AuthForms.tsx`
- Login with phone number OR name + password
- JWT tokens stored in httpOnly cookies (secure, XSS-protected)
- 7-day access token, 30-day refresh token
- Automatic redirect to dashboard on success
- **API**: `POST /api/auth/login/`

#### Password Reset (OTP Flow)
- **Location**: `apps/accounts/views.py`, `components/landlord/AuthForms.tsx`
- 3-step process:
  1. Enter phone number → OTP sent via SMS
  2. Verify 6-digit OTP (valid for 10 minutes)
  3. Set new password
- SMS delivery via Africa's Talking API
- OTP stored in database with timestamp
- **APIs**: 
  - `POST /api/auth/forgot-password/`
  - `POST /api/auth/verify-otp/`
  - `POST /api/auth/reset-password/`

#### Protected Routes
- **Location**: `middleware.ts`
- Middleware protects `/landlord/dashboard/*` routes
- Redirects unauthenticated users to login
- Redirects authenticated users away from login/register pages
- Token validation on every protected API call

---

### 2. **Property Management System**

#### Add New Property
- **Location**: `app/(landlord)/landlord/dashboard/add/HouseFormClient.tsx`
- **Features**:
  - Property details (title, location, price, bedrooms, units)
  - Property types: Bedsitter, 1-3 Bedrooms
  - Description field for amenities
  - GPS coordinates (latitude/longitude) with Google Maps helper link
  - Direct S3 upload for up to 3 images (JPG/PNG/WEBP, max 50MB each)
  - Optional video upload (MP4, max 50MB)
  - Landlord contact info (name + phone)
  - Real-time upload progress indicators
  - Client-side validation before submission
- **API**: `POST /api/houses/`
- **S3 Upload Flow**:
  1. Frontend requests presigned URL from `/api/upload`
  2. Backend generates presigned URL with boto3
  3. Frontend uploads directly to S3 (no backend bottleneck)
  4. Public URL returned and stored in database

#### View All Properties
- **Location**: `app/(landlord)/landlord/dashboard/properties/`
- List all properties owned by logged-in landlord
- Shows title, location, price, availability status
- Quick actions: Edit, Delete, Toggle availability
- **API**: `GET /api/houses/` (filtered by landlord)

#### Edit Property
- **Location**: Property management page
- Update any field (title, price, description, etc.)
- Update availability status
- Add/remove images
- **API**: `PATCH /api/houses/{id}/`

#### Delete Property
- **Location**: Property management page
- Soft delete with confirmation
- Auto-deletes associated S3 files (images + video)
- Django signals handle cleanup
- **API**: `DELETE /api/houses/{id}/`

#### Dashboard Overview
- **Location**: `app/(landlord)/landlord/dashboard/DashboardOverviewClient.tsx`
- **Stats Cards**:
  - Total properties count
  - Available properties count
  - Unavailable properties count
- **Quick Actions**: Add property, Manage properties
- **Recent Properties**: Last 4 properties with status

---

### 3. **Public Property Listings**

#### Browse Properties
- **Location**: `app/(public)/listings/ListingsClient.tsx`
- Grid view of all available properties
- Animated cards with image carousels
- Auto-advancing images (6-second intervals)
- Manual navigation with arrows and dots
- **API**: `GET /api/houses/`

#### Property Card Features
- **Location**: `components/listings/HouseCard.tsx`
- **Display**:
  - Image carousel (up to 3 images)
  - Availability badge (Available/Taken)
  - Price tag (KES format)
  - Location with map pin icon
  - Bedroom type (Bedsitter, 1-3 Beds)
  - Number of units
- **Actions**:
  - Contact Landlord (reveals name + phone)
  - Get Notified (booking system)
  - View on Map (opens map view)

#### Advanced Filtering
- **Location**: Listings page
- **Filters**:
  - Location (text search)
  - Bedrooms (0-3)
  - Max price (KES)
  - Availability (Available/Taken)
- Real-time filtering without page reload
- **API**: `GET /api/houses/?location=X&bedrooms=Y&max_price=Z&available=true`

---

### 4. **Interactive Map View**

#### All Properties Map
- **Location**: `app/(public)/listings/map/AllHousesMapClient.tsx`
- Leaflet.js integration
- Markers for all properties with GPS coordinates
- Popup on marker click shows property details
- Centered on Nairobi by default
- **API**: `GET /api/houses/`

#### Single Property Map
- **Location**: `app/(public)/listings/map/[id]/`
- Focused view of one property
- Marker with property details
- Zoom to property location
- **API**: `GET /api/houses/{id}/`

---

### 5. **Booking/Notification System**

#### Tenant Notifications
- **Location**: `components/listings/HouseCard.tsx`, `apps/bookings/views.py`
- Tenants can request notifications when property status changes
- Phone number validation (Kenyan format)
- Prevents duplicate bookings (unique constraint: house + phone)
- Max 5 active bookings per user (localStorage limit)
- **Current Status**: Stores in localStorage (temporary)
- **TODO**: Integrate with Django backend (`POST /api/bookings/`)
- **Future**: SMS notifications when landlord toggles availability

#### Booking Model
- **Location**: `apps/bookings/models.py`
- Fields: house, phone, created_at, notified
- Unique constraint prevents duplicate bookings
- Ready for SMS integration via Africa's Talking

---

### 6. **Media Management (AWS S3 + CloudFront)**

#### S3 Direct Upload
- **Location**: `apps/houses/upload.py`, `app/api/upload/route.ts`
- Presigned URL generation for secure uploads
- No file size bottleneck on backend
- Files uploaded directly from browser to S3
- Supports images (JPG/PNG/WEBP) and videos (MP4)
- Max file size: 50MB (configurable)

#### CloudFront CDN
- **Location**: `househunt/settings.py`
- All media served via CloudFront for faster delivery
- Caching configured (max-age: 86400 seconds)
- Direct S3 access blocked in production

#### Auto-Delete on Record Deletion
- **Location**: `apps/houses/models.py` (Django signals)
- When HouseImage or HouseVideo deleted → S3 file auto-deleted
- Prevents orphaned files in S3
- Uses boto3 to delete from bucket

---

### 7. **Security Features**

#### Authentication Security
- ✅ JWT tokens in httpOnly cookies (not localStorage)
- ✅ Secure flag enabled in production
- ✅ SameSite: lax (CSRF protection)
- ✅ 7-day access token expiration
- ✅ Token validation on all protected routes

#### XSS Protection
- ✅ React auto-escapes all user input
- ✅ No `dangerouslySetInnerHTML` usage
- ✅ All user data rendered safely

#### CORS Configuration
- ✅ Backend handles CORS (not frontend)
- ✅ Configurable allowed origins
- ✅ Credentials allowed for cookie-based auth

#### Production Security (when DEBUG=False)
- ✅ SECURE_SSL_REDIRECT
- ✅ SESSION_COOKIE_SECURE
- ✅ CSRF_COOKIE_SECURE
- ✅ SECURE_HSTS_SECONDS (1 year)
- ✅ WhiteNoise for static files

#### Password Validation
- ✅ Django password validators (min length, common passwords, etc.)
- ✅ Client-side validation (min 8 characters)
- ✅ Phone number validation (Kenyan format)

---

## 🔄 IMPORTANT UPDATES & FIXES

### Backend Updates

#### 1. **Module Naming Fix** (CRITICAL)
- **Issue**: `backend/backend/` directory caused import errors
- **Fix**: Renamed to `backend/househunt/`
- **Files Updated**: `manage.py`, `wsgi.py`, `render.yaml`
- **Impact**: Deployment now works on Render

#### 2. **Django Version Downgrade**
- **From**: Django 5.0.4
- **To**: Django 4.2.28
- **Reason**: Python 3.8 compatibility for Render
- **Files**: `requirements.txt`, `runtime.txt`

#### 3. **Database Configuration**
- **Added**: `dj-database-url` for PostgreSQL
- **Added**: SSL requirement for production
- **Local**: SQLite (development)
- **Production**: PostgreSQL (Render auto-provision)

#### 4. **S3 Safety Check**
- **Location**: `apps/houses/models.py`
- **Fix**: Skip S3 deletion if credentials not configured
- **Prevents**: Crashes in local development without AWS setup

#### 5. **Missing Dependencies**
- **Added**: `django-cleanup==8.0.0` (auto-delete files)
- **Added**: `Pillow==12.1.1` (image processing)
- **Added**: `whitenoise==6.7.0` (static files)

#### 6. **Production Security Settings**
- **Added**: SSL redirect, secure cookies, HSTS
- **Added**: CSRF trusted origins
- **Added**: Rate limiting (100/hour anon, 1000/hour user)

### Frontend Updates

#### 1. **TypeScript Errors Fixed**
- **Location**: `next.config.ts`
- **Fix**: Added proper type annotations
- **Impact**: Build now succeeds without errors

#### 2. **Removed Unused Dependencies**
- **Removed**: `axios` (code uses `fetch`)
- **Removed**: `NEXTAUTH_SECRET` from `.env.example`
- **Impact**: Smaller bundle size, less confusion

#### 3. **Phone Validation Added**
- **Location**: `components/landlord/AuthForms.tsx`
- **Added**: Client-side Kenyan phone validation on register
- **Pattern**: `/^07\d{8}$/`
- **Consistency**: Matches backend and HouseCard validation

#### 4. **Environment Variables Cleanup**
- **Removed**: Unused NextAuth variables
- **Kept**: `NEXT_PUBLIC_API_URL`, `DJANGO_API_URL`
- **File**: `.env.example`

#### 5. **Middleware Protection**
- **Location**: `middleware.ts`
- **Added**: Route protection for `/landlord/dashboard/*`
- **Added**: Auto-redirect for authenticated users on login/register

---

## 📊 DATABASE SCHEMA

### Models

#### 1. **Landlord** (Custom User Model)
- **Location**: `apps/accounts/models.py`
- **Fields**:
  - `name` (CharField)
  - `phone` (CharField, unique, USERNAME_FIELD)
  - `email` (EmailField, optional)
  - `password` (hashed)
  - `otp` (CharField, for password reset)
  - `otp_created_at` (DateTimeField)
  - `is_active`, `is_staff`, `created_at`
- **Methods**:
  - `generate_otp()` - Creates 6-digit OTP
  - `verify_otp(otp)` - Validates OTP (10-min expiry)
  - `clear_otp()` - Removes OTP after use

#### 2. **House**
- **Location**: `apps/houses/models.py`
- **Fields**:
  - `landlord` (ForeignKey to Landlord)
  - `title`, `location`, `description`
  - `price` (PositiveIntegerField, monthly rent in KES)
  - `units` (PositiveIntegerField)
  - `bedrooms` (IntegerField, choices: 0-3)
  - `available` (BooleanField)
  - `latitude`, `longitude` (DecimalField)
  - `contact_name`, `contact_phone` (for tenants)
  - `created_at`, `updated_at`
- **Relations**:
  - One-to-many with HouseImage
  - One-to-one with HouseVideo
  - One-to-many with Booking

#### 3. **HouseImage**
- **Location**: `apps/houses/models.py`
- **Fields**:
  - `house` (ForeignKey to House)
  - `url` (URLField, S3 URL)
  - `order` (PositiveSmallIntegerField)
- **Signal**: Auto-deletes S3 file on deletion

#### 4. **HouseVideo**
- **Location**: `apps/houses/models.py`
- **Fields**:
  - `house` (OneToOneField to House)
  - `url` (URLField, S3 URL)
- **Signal**: Auto-deletes S3 file on deletion

#### 5. **Booking**
- **Location**: `apps/bookings/models.py`
- **Fields**:
  - `house` (ForeignKey to House)
  - `phone` (CharField)
  - `created_at` (DateTimeField)
  - `notified` (BooleanField)
- **Constraint**: Unique together (house, phone)

---

## 🚀 API ENDPOINTS

### Authentication
- `POST /api/auth/register/` - Create landlord account
- `POST /api/auth/login/` - Login and get JWT token
- `GET /api/auth/me/` - Get current user (protected)
- `POST /api/auth/logout/` - Logout (clear cookie)
- `POST /api/auth/forgot-password/` - Send OTP
- `POST /api/auth/verify-otp/` - Verify OTP
- `POST /api/auth/reset-password/` - Reset password

### Houses
- `GET /api/houses/` - List all houses (with filters)
- `POST /api/houses/` - Create house (protected)
- `GET /api/houses/{id}/` - Get single house
- `PATCH /api/houses/{id}/` - Update house (protected, owner only)
- `DELETE /api/houses/{id}/` - Delete house (protected, owner only)

### Bookings
- `POST /api/bookings/` - Create booking notification

### Upload
- `POST /api/upload/` - Get presigned S3 URL (protected)

---

## 🎨 UI/UX FEATURES

### Animations (Framer Motion)
- Page transitions (fade + slide)
- Card hover effects
- Image carousel transitions
- Button interactions (scale on hover/tap)
- Loading spinners
- Success/error message animations

### Responsive Design
- Mobile-first approach
- Tailwind CSS breakpoints (sm, md, lg)
- Grid layouts adapt to screen size
- Touch-friendly buttons and controls

### Accessibility
- Semantic HTML
- ARIA labels on buttons
- Keyboard navigation support
- Focus states on interactive elements
- Alt text on images

### Loading States
- Skeleton loaders for property cards
- Spinner on form submissions
- Upload progress indicators
- Disabled states during async operations

### Error Handling
- User-friendly error messages
- Form validation feedback
- API error display
- Retry mechanisms

---

## 🔧 CONFIGURATION FILES

### Backend
- `househunt/settings.py` - Django settings
- `requirements.txt` - Python dependencies
- `runtime.txt` - Python version (3.8.13)
- `render.yaml` - Render deployment config
- `.env` - Environment variables (not committed)
- `.env.example` - Template for environment variables

### Frontend
- `next.config.ts` - Next.js configuration
- `package.json` - Node dependencies
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `.env.local` - Environment variables (not committed)
- `.env.example` - Template for environment variables
- `middleware.ts` - Route protection

---

## 📝 DEPLOYMENT STATUS

### Backend (Render)
- ✅ All bugs fixed
- ✅ Migrations created and tested
- ✅ Production security configured
- ✅ PostgreSQL ready
- ✅ S3 + CloudFront configured
- ⚠️ **ACTION REQUIRED**: Rotate exposed credentials (AWS, Africa's Talking)

### Frontend (Vercel/Netlify)
- ✅ Build succeeds
- ✅ TypeScript errors resolved
- ✅ Dependencies cleaned up
- ✅ Environment variables configured
- ✅ Middleware protection active

### Pre-Deployment Checklist
- [ ] Rotate AWS credentials
- [ ] Rotate Africa's Talking API key
- [ ] Generate new Django SECRET_KEY
- [ ] Set environment variables in Render
- [ ] Update CORS_ALLOWED_ORIGINS with frontend URL
- [ ] Test production build locally
- [ ] Push to GitHub
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Update frontend API URL
- [ ] Test end-to-end flow

---

## 🐛 KNOWN ISSUES & TODO

### Minor Issues (Non-blocking)
1. **Carousel Auto-Advance**: Doesn't pause on user interaction (UX improvement)
2. **No Error Boundary**: App crashes show blank screen (add global error boundary)
3. **No Image Loading States**: Brief flash of broken image (add skeleton loader)
4. **Generic Error Messages**: "Server error" doesn't help debugging (improve logging)

### TODO Features
1. **Booking Integration**: Connect localStorage bookings to Django backend
2. **SMS Notifications**: Send SMS when landlord toggles availability
3. **Rate Limiting**: Add rate limiting to auth endpoints (prevent brute force)
4. **Admin Dashboard**: Django admin for managing users and properties
5. **Property Analytics**: Views, bookings, conversion rates
6. **Favorites System**: Let tenants save favorite properties
7. **Search Autocomplete**: Location suggestions as user types
8. **Email Notifications**: Alternative to SMS for password reset
9. **Property Verification**: Admin approval before listing goes live
10. **Payment Integration**: M-Pesa for rent payments

---

## 📚 DOCUMENTATION FILES

- `SECURITY_REPORT.md` - Frontend security audit
- `FIXES_APPLIED.md` - Frontend fixes summary
- `DEPLOYMENT_READY.md` - Deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Backend deployment checklist
- `READY_TO_DEPLOY.md` - Final deployment status
- `SETUP_GUIDE.md` - Local development setup
- `FEATURES_AND_UPDATES.md` - This file

---

## 🎯 NEXT STEPS FOR ADDING FEATURES

### To Add a New Feature:

1. **Backend**:
   - Create/update model in `apps/{app}/models.py`
   - Create serializer in `apps/{app}/serializers.py`
   - Create view in `apps/{app}/views.py`
   - Add URL route in `apps/{app}/urls.py`
   - Run migrations: `python manage.py makemigrations && python manage.py migrate`

2. **Frontend**:
   - Add type definition in `lib/types.ts`
   - Create API function in `lib/api.ts`
   - Create component in `components/`
   - Create page in `app/`
   - Update middleware if route needs protection

3. **Testing**:
   - Test locally with `./run-local.sh`
   - Test API with Postman/curl
   - Test frontend in browser
   - Check console for errors

### To Undo Important Changes:

1. **Check Git History**:
   ```bash
   git log --oneline
   git show <commit-hash>
   ```

2. **Revert Specific File**:
   ```bash
   git checkout <commit-hash> -- path/to/file
   ```

3. **Revert Entire Commit**:
   ```bash
   git revert <commit-hash>
   ```

4. **Database Migrations**:
   ```bash
   # Rollback migration
   python manage.py migrate <app> <migration_number>
   
   # Example: Rollback to initial migration
   python manage.py migrate accounts 0001
   ```

---

## 📞 SUPPORT & RESOURCES

- **Django Docs**: https://docs.djangoproject.com/
- **Next.js Docs**: https://nextjs.org/docs
- **AWS S3 Docs**: https://docs.aws.amazon.com/s3/
- **Africa's Talking Docs**: https://developers.africastalking.com/
- **Render Docs**: https://render.com/docs

---

**Last Updated**: 2024
**Status**: ✅ Production Ready (after credential rotation)
