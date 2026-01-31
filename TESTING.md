# 🧪 Testing Guide - GoBeauty Platform

Complete testing checklist for Backend API, Admin Panel, and Mobile App.

## 🚀 Setup Testing Environment

### 1. Start All Servers

```bash
# Terminal 1: Backend Server
cd server
node --watch src/app.js
# ✅ Server running on http://localhost:4000

# Terminal 2: Admin Panel
cd admin
npx vite
# ✅ Admin panel on http://localhost:3000

# Terminal 3: Mobile App
cd mobile
npx expo start
# ✅ Scan QR with Expo Go
```

### 2. Demo Credentials

**Admin Login:**
- Email: `admin@gobeauty.com`
- Password: `admin123`

**Professional Login:**
- Email: `pro@gobeauty.com`
- Password: `pro12345`

**Demo Provider:**
- Business: "Glamour Studio"
- Category: Hair Salon
- Status: Approved + Verified

---

## 📋 Backend API Testing

### Authentication Tests

**1. Login (POST /api/auth/login)**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gobeauty.com","password":"admin123"}'
```
✅ Expected: `{ token, refreshToken, user: { id, name, email, role: "admin" } }`

**2. Refresh Token (POST /api/auth/refresh)**
```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```
✅ Expected: `{ token }`

**3. Protected Route (GET /api/bookings/me)**
```bash
curl http://localhost:4000/api/bookings/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
✅ Expected: `[]` or booking array (not 401 Unauthorized)

### Categories & Services Tests

**4. Get Categories (GET /api/categories)**
```bash
curl http://localhost:4000/api/categories
```
✅ Expected: 6 categories (Hair Salon, Makeup Studio, Spa & Wellness, etc.)

**5. Create Category (POST /api/categories) - Admin Only**
```bash
curl -X POST http://localhost:4000/api/categories \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Barbershop","icon":"✂️","status":"active"}'
```
✅ Expected: New category created

**6. Get Services (GET /api/services)**
```bash
curl http://localhost:4000/api/services
```
✅ Expected: 6 services (Haircut, Bridal Makeup, Full Body Massage, etc.)

### Providers Tests

**7. Get Providers (GET /api/providers)**
```bash
curl http://localhost:4000/api/providers
```
✅ Expected: 1 provider (Glamour Studio with rating, verified badge)

**8. Approve Provider (PATCH /api/providers/:id/verify) - Admin**
```bash
curl -X PATCH http://localhost:4000/api/providers/PROVIDER_ID/verify \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
✅ Expected: Provider status changed to "approved", verified = true

### Bookings Tests

**9. Create Booking (POST /api/bookings)**
```bash
curl -X POST http://localhost:4000/api/bookings \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider":"PROVIDER_ID",
    "service":"SERVICE_ID",
    "date":"2025-01-20",
    "time":"10:00 AM",
    "price":50
  }'
```
✅ Expected: New booking created with status "pending"

**10. Reschedule Booking (PATCH /api/bookings/:id/reschedule)**
```bash
curl -X PATCH http://localhost:4000/api/bookings/BOOKING_ID/reschedule \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-01-25","time":"2:00 PM"}'
```
✅ Expected: Booking updated, rescheduledFrom field added

**11. Cancel with Refund (POST /api/bookings/:id/refund)**
```bash
curl -X POST http://localhost:4000/api/bookings/BOOKING_ID/refund \
  -H "Authorization: Bearer USER_TOKEN"
```
✅ Expected: Booking status = "cancelled", refund initiated

### Coupons Tests

**12. Create Coupon (POST /api/coupons) - Admin**
```bash
curl -X POST http://localhost:4000/api/coupons \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code":"SAVE20",
    "type":"percent",
    "value":20,
    "minOrder":50,
    "maxUses":100,
    "expiresAt":"2025-12-31"
  }'
```
✅ Expected: Coupon created with code "SAVE20"

**13. Apply Coupon (POST /api/coupons/apply)**
```bash
curl -X POST http://localhost:4000/api/coupons/apply \
  -H "Content-Type: application/json" \
  -d '{"code":"SAVE20","orderTotal":100}'
```
✅ Expected: `{ valid: true, discount: 20, message: "Coupon applied!" }`

### Reviews Tests

**14. Submit Review (POST /api/reviews)**
```bash
curl -X POST http://localhost:4000/api/reviews \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider":"PROVIDER_ID",
    "rating":5,
    "text":"Amazing service! Highly recommend."
  }'
```
✅ Expected: Review created, provider rating auto-updated

**15. Get Provider Reviews (GET /api/reviews/provider/:id)**
```bash
curl http://localhost:4000/api/reviews/provider/PROVIDER_ID
```
✅ Expected: Array of reviews with user info, rating, text

### Chat & Notifications Tests

**16. Get Chat List (GET /api/chats/me)**
```bash
curl http://localhost:4000/api/chats/me \
  -H "Authorization: Bearer USER_TOKEN"
```
✅ Expected: Array of chats with lastMessage, unreadCount

**17. Get Notifications (GET /api/notifications/me)**
```bash
curl http://localhost:4000/api/notifications/me \
  -H "Authorization: Bearer USER_TOKEN"
```
✅ Expected: Array of notifications (booking updates, messages, etc.)

---

## 🖥️ Admin Panel Testing

### Dashboard Page
1. ✅ Login with admin@gobeauty.com / admin123
2. ✅ Check KPI cards display correct counts:
   - Total Users
   - Total Providers
   - Total Bookings
   - Total Coupons
3. ✅ Verify data loads without errors

### Categories Page
1. ✅ Click "Categories" in sidebar
2. ✅ Verify 6 categories displayed in grid
3. ✅ Click "Add Category" button
4. ✅ Fill form: Name = "Test Category", Icon = "🧪"
5. ✅ Submit and verify new category appears
6. ✅ Click delete button and confirm deletion

### Services Page
1. ✅ Click "Services" in sidebar
2. ✅ Verify 6 services displayed in cards
3. ✅ Click "Add Service" button
4. ✅ Fill form: Name, Category (dropdown), Price, Duration
5. ✅ Submit and verify service appears
6. ✅ Check price displayed in pink color

### Users Page
1. ✅ Click "Users" in sidebar
2. ✅ Verify user table displays at least 2 users (admin + pro)
3. ✅ Test search bar (type "admin")
4. ✅ Test role filter dropdown (select "admin")
5. ✅ Click "Block" button on non-admin user
6. ✅ Verify status badge changes to "Blocked"

### Providers Page
1. ✅ Click "Providers" in sidebar
2. ✅ Verify "Glamour Studio" displayed with verified badge
3. ✅ Test status filter (all/approved/pending/blocked)
4. ✅ Create new pending provider (if endpoint available)
5. ✅ Click "Approve Provider" button
6. ✅ Verify status changes to "Approved"

### Bookings Page
1. ✅ Click "Bookings" in sidebar
2. ✅ Verify bookings displayed in table
3. ✅ Test status filter dropdown
4. ✅ Click "Confirm" on pending booking
5. ✅ Click "Complete" on confirmed booking
6. ✅ Click "Cancel" and confirm

### Coupons Page
1. ✅ Click "Coupons" in sidebar
2. ✅ Click "Add Coupon" button
3. ✅ Fill form:
   - Code: "TEST50" (auto-uppercase)
   - Type: "percent"
   - Value: 50
   - Min Order: 100
   - Max Uses: 10
   - Expires At: Future date
4. ✅ Submit and verify coupon appears
5. ✅ Check usage progress bar (0/10)
6. ✅ Verify expired coupons show red border

### Reviews Page
1. ✅ Click "Reviews" in sidebar
2. ✅ Verify reviews displayed with star ratings
3. ✅ Test star filter buttons (all, 5★, 4★, 3★, 2★, 1★)
4. ✅ Check color coding:
   - Green: ≥4 stars
   - Yellow: ≥3 stars
   - Red: <3 stars
5. ✅ Click "Hide Review" button
6. ✅ Click "Reply" button (check modal opens)

### Finance Page
1. ✅ Click "Finance" in sidebar
2. ✅ Verify 4 KPI cards display:
   - Total Revenue
   - Monthly Revenue
   - Pending Payouts
   - Completed Bookings
3. ✅ Check Recent Transactions section (income/expense)
4. ✅ Check Pending Payouts section
5. ✅ Click "Process Payout" button

---

## 📱 Mobile App Testing

### Login Screen
1. ✅ Open Expo Go app and scan QR
2. ✅ Verify demo credentials displayed on screen
3. ✅ Enter email: pro@gobeauty.com
4. ✅ Enter password: pro12345
5. ✅ Tap "Login" button
6. ✅ Verify navigation to Home screen

### Home Screen
1. ✅ Verify gradient header with "GoBeauty" title
2. ✅ Check 6 categories displayed in 2-column grid:
   - 💇 Hair Salon
   - 💄 Makeup Studio
   - 🧖 Spa & Wellness
   - 💅 Nail Salon
   - 🧴 Facial Care
   - 💆 Massage Therapy
3. ✅ Tap category card (verify navigation prepared)

### Search Screen
1. ✅ Tap search icon/navigate to Search
2. ✅ Verify search input and category chips
3. ✅ Type "Glamour" in search bar
4. ✅ Verify "Glamour Studio" appears
5. ✅ Tap category chip to filter
6. ✅ Tap provider card → navigates to ProviderDetail

### Provider Detail Screen
1. ✅ Verify cover image displayed
2. ✅ Check business name "Glamour Studio"
3. ✅ Verify category and rating display
4. ✅ Check badges: Verified ✓, Featured ⭐, Home Service 🏠
5. ✅ Verify contact info (address, phone)
6. ✅ Check services list with pricing
7. ✅ Tap "Book Appointment" button (verify navigation)

### Bookings Screen
1. ✅ Navigate to Bookings tab (bottom navigation)
2. ✅ Verify booking cards displayed (if any exist)
3. ✅ Check status badges (color-coded)
4. ✅ Tap "Reschedule" button
5. ✅ Enter new date/time in modal
6. ✅ Submit and verify booking updated
7. ✅ Tap "Cancel" button
8. ✅ Confirm in alert
9. ✅ Verify booking status changes to "Cancelled"

### Chat Screen (Realtime)
1. ✅ Navigate to Chat (from booking or chat list)
2. ✅ Verify messages loaded
3. ✅ Type message in input
4. ✅ Tap send button
5. ✅ Verify message appears instantly (Socket.io)
6. ✅ Test typing indicator (if another user typing)
7. ✅ Scroll to load older messages

### Notifications Screen
1. ✅ Navigate to Notifications
2. ✅ Verify notifications displayed with type icons:
   - 📅 Booking Update
   - ✅ Booking Confirmed
   - ❌ Booking Cancelled
   - 💳 Payment
   - 💬 Message
   - 🎁 Promo
3. ✅ Check unread notifications (pink dot + background)
4. ✅ Tap notification (verify navigation if implemented)

### Profile Screen
1. ✅ Navigate to Profile tab (bottom navigation)
2. ✅ Verify user avatar with initial letter
3. ✅ Check user name and email displayed
4. ✅ Verify 8 menu items:
   - 👤 Edit Profile
   - 💳 Payment Methods
   - 📍 Saved Addresses
   - ❤️ Favorites
   - 🔔 Notifications
   - 💰 Wallet
   - 🎫 My Coupons
   - ⚙️ Settings
5. ✅ Tap menu items (verify navigation prepared)
6. ✅ Tap "Logout" button
7. ✅ Verify redirects to Login screen
8. ✅ Check version number displayed (1.0.0)

---

## 🔌 Socket.io Realtime Testing

### Setup Socket Connection
```javascript
// In mobile app or admin panel
import io from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connected', (data) => {
  console.log('✅ Socket connected:', data);
});
```

### Test Chat Events
```javascript
// 1. Join user room
socket.emit('join', { userId: 'USER_ID' });

// 2. Join chat room
socket.emit('join-chat', { chatId: 'CHAT_ID' });

// 3. Send message
socket.emit('send-message', {
  chatId: 'CHAT_ID',
  senderId: 'USER_ID',
  senderType: 'User',
  text: 'Hello from Socket.io!'
});

// 4. Listen for new messages
socket.on('new-message', (message) => {
  console.log('✅ New message:', message);
});

// 5. Send typing indicator
socket.emit('typing', { chatId: 'CHAT_ID', userId: 'USER_ID', isTyping: true });

// 6. Listen for typing status
socket.on('user-typing', ({ userId, isTyping }) => {
  console.log(`User ${userId} ${isTyping ? 'is typing...' : 'stopped typing'}`);
});
```

### Test Notifications
```javascript
// Listen for notifications
socket.on('notification', (notification) => {
  console.log('✅ Notification received:', notification);
});

// Listen for booking updates
socket.on('booking-update', (booking) => {
  console.log('✅ Booking updated:', booking);
});
```

---

## ✅ Testing Checklist Summary

### Backend (17 Tests)
- [x] Login API
- [x] Refresh token
- [x] Protected routes
- [x] Get categories
- [x] Create category (admin)
- [x] Get services
- [x] Get providers
- [x] Approve provider
- [x] Create booking
- [x] Reschedule booking
- [x] Cancel with refund
- [x] Create coupon
- [x] Apply coupon
- [x] Submit review
- [x] Get reviews
- [x] Get chat list
- [x] Get notifications

### Admin Panel (9 Pages × 3-5 Tests = ~35 Tests)
- [x] Dashboard metrics
- [x] Categories CRUD
- [x] Services CRUD
- [x] Users management
- [x] Providers approval
- [x] Bookings status update
- [x] Coupons creation
- [x] Reviews moderation
- [x] Finance dashboard

### Mobile App (8 Screens × 4-7 Tests = ~40 Tests)
- [x] Login flow
- [x] Home categories
- [x] Search & filter
- [x] Provider detail
- [x] Bookings reschedule/cancel
- [x] Chat realtime
- [x] Notifications center
- [x] Profile menu

### Socket.io (5 Tests)
- [x] Connection
- [x] Chat messages
- [x] Typing indicators
- [x] Notifications
- [x] Booking updates

---

## 🐛 Common Issues & Solutions

**Issue 1: "Cannot connect to server"**
```bash
# Solution: Check server is running
cd server
node --watch src/app.js
# Should see: "Server running on port 4000"
```

**Issue 2: "Login failed" in mobile**
```bash
# Solution: Check API URL in app.json
{
  "extra": {
    "apiUrl": "http://YOUR_IP_ADDRESS:4000/api"  # Not localhost
  }
}
```

**Issue 3: "Socket.io not connecting"**
```javascript
// Solution: Update socket URL with your IP
const socket = io('http://192.168.x.x:4000', {
  auth: { token }
});
```

**Issue 4: "Categories not loading"**
```bash
# Solution: Check auto-seed ran
# Look for: "Seeded demo data successfully" in server logs
```

**Issue 5: "Admin panel 401 Unauthorized"**
```javascript
// Solution: Check token in localStorage
localStorage.getItem('token')  // Should not be null
```

---

**Testing Status:** ✅ Ready for full QA  
**Test Coverage:** Backend + Admin + Mobile + Realtime  
**Last Updated:** January 16, 2025
