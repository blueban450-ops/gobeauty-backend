# GoBeauty - Complete Beauty Services Platform 🌟

Professional beauty salon booking platform with Express.js backend, React admin panel, and React Native mobile app.

## 🏗️ Project Structure

```
GoBeauty/
├── server/          # Express.js Backend + MongoDB + Socket.io
├── admin/           # React 18 + Vite + TypeScript Admin Panel
└── mobile/          # Expo + React Native Mobile App
```

## 🚀 Quick Start

### 1. Backend Server

```bash
cd server
npm install
node --watch src/app.js       # Auto-restarts on file changes
```

**Server runs on:** http://localhost:4000/api

**Auto-seeded demo data:**
- Admin: `admin@gobeauty.com` / `admin123`
- Professional: `pro@gobeauty.com` / `pro12345`
- 6 categories, 6 services, demo provider (Glamour Studio)

### 2. Admin Panel

```bash
cd admin
npm install
npx vite                      # Starts dev server
```

**Admin panel runs on:** http://localhost:3000

**Login:** admin@gobeauty.com / admin123

### 3. Mobile App

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start                # Scan QR with Expo Go app
```

**Login:** pro@gobeauty.com / pro12345

## 📋 Complete Feature List

### Backend API (Express + MongoDB + Socket.io)

**Authentication & Users**
- ✅ JWT auth (access + 30-day refresh tokens)
- ✅ Role-based access control (admin/user/professional)
- ✅ User management (block/unblock, role assignment)
- ✅ Password hashing with bcrypt

**Core Platform Features**
- ✅ Categories & Services CRUD with image support
- ✅ Provider profiles (verification, ratings, featured status)
- ✅ Booking system (create, update status, reschedule, refund)
- ✅ Reviews & ratings with auto-aggregated provider scores
- ✅ Coupons (fixed/percent, min order, max uses, expiry)
- ✅ Wallet system with transaction history
- ✅ Notifications center

**Realtime Features (Socket.io)**
- ✅ Chat messaging (1-on-1 customer ↔ provider)
- ✅ Typing indicators
- ✅ Message read receipts
- ✅ Unread count tracking
- ✅ Booking status notifications
- ✅ Real-time notification broadcasts

**Payment Integration**
- ✅ Stripe payment intent generation
- ⏳ Webhook handlers (placeholder)

**Database (MongoDB Memory Server)**
- ✅ In-memory database for development (no setup needed)
- ✅ Auto-seed on every server startup
- ✅ Fresh data on restart


### Admin Panel (React + Vite + TypeScript)

**9 Complete Management Pages:**

1. **Dashboard** - Overview metrics
   - Total users/providers/bookings/coupons count
   - Category and service statistics
   - Real-time data fetching with TanStack Query

2. **Categories** - Category management
   - Grid display with icon and status
   - Create category with name + icon
   - Delete category

3. **Services** - Service catalog
   - Service cards (name, category, price, duration)
   - Create service with category dropdown
   - 3-column responsive grid

4. **Users** - Customer/Pro management
   - Search bar, role filter (all/admin/user/professional)
   - Block/Unblock users (except admins)
   - Table view with name, email, role, status, phone, joined date

5. **Providers** - Business approval
   - Status filter (all/approved/pending/blocked)
   - Approve Provider workflow
   - Display: business name, category, rating, reviews, address, verified/featured/top badges

6. **Bookings** - Order management
   - Status filter dropdown (all/pending/confirmed/completed/cancelled)
   - Actions: Confirm, Complete, Cancel
   - Table: customer, provider, service, date/time, price, status

7. **Coupons** - Discount codes
   - Coupon cards with gradient code badge
   - Usage progress bar (usedCount/maxUses)
   - Expired detection (red border)
   - Form: code (uppercase), type (fixed/percent), value, minOrder, maxUses, expiresAt

8. **Reviews** - Moderation
   - Star filter buttons (all, 5★, 4★, 3★, 2★, 1★)
   - Review cards: user avatar, provider name, rating stars, text
   - Actions: Hide Review, Reply
   - Color-coded ratings (green ≥4, yellow ≥3, red <3)

9. **Finance** - Revenue dashboard
   - 4 KPI cards: Total Revenue, Monthly Revenue, Pending Payouts, Completed Bookings
   - Recent Transactions section (income/expense)
   - Pending Payouts section with "Process Payout" buttons
   - Revenue Chart placeholder

**Design Features:**
- 🎨 Gradient pink/purple theme (#ec4899 → #8b5cf6)
- ✨ Glassmorphism effects with backdrop blur
- 📱 Fully responsive grid layouts
- 🔤 Font Awesome icons throughout
- 🔄 TanStack Query for data fetching
- 🔐 Protected routes with JWT auth

### Mobile App (Expo + React Native + TypeScript)

**8 Complete Screens:**

1. **LoginScreen** - Authentication
   - Email/password inputs
   - Gradient pink button
   - Demo credentials display
   - JWT token storage

2. **HomeScreen** - Categories
   - 2-column category grid
   - Emoji icons + category names
   - 6 pre-seeded categories (Haircut, Makeup, Spa, Nails, Facial, Massage)

3. **SearchScreen** - Provider discovery
   - Search input (filter by provider name)
   - Horizontal category chips (filter by category)
   - Provider cards: name, category, rating, address, verified badge
   - Navigation to ProviderDetail on card tap

4. **ProviderDetailScreen** - Business profile
   - Cover image header
   - Business name, category, rating/review count
   - Badges: Verified ✓, Featured ⭐, Home Service 🏠
   - Contact info: address, phone
   - Services list (name, price, duration)
   - About section
   - "Book Appointment" CTA → BookingFlow screen

5. **BookingsScreen** - Order history
   - Booking cards: service, provider, date/time, price, status
   - Status badges (color-coded: yellow pending, blue confirmed, green completed, red cancelled)
   - **Reschedule Modal**: date/time inputs → PATCH /bookings/:id/reschedule
   - **Cancel Confirmation**: Alert → POST /bookings/:id/refund

6. **ChatScreen** - Realtime messaging
   - Socket.io integration (join, join-chat, send-message, new-message)
   - Message bubbles (left/right based on sender)
   - Typing indicator support
   - Bottom text input + send button
   - Query: GET /chats/:id/messages

7. **NotificationsScreen** - Notification center
   - Type-based icons: 📅 booking-update, ✅ confirmed, ❌ cancelled, 💳 payment, 💬 message, 🎁 promo
   - Unread indicator (pink dot + pink background)
   - Timestamp display
   - Query: GET /notifications/me

8. **ProfileScreen** - Account hub
   - Avatar with user initial
   - User name and email
   - 8 menu items:
     - 👤 Edit Profile
     - 💳 Payment Methods
     - 📍 Saved Addresses
     - ❤️ Favorites
     - 🔔 Notifications
     - 💰 Wallet
     - 🎫 My Coupons
     - ⚙️ Settings
   - Logout button
   - Version 1.0.0

**Navigation:**
- Bottom tab navigation (Home, Bookings, Profile)
- Native stack for nested screens
- React Navigation v6

**Features:**
- ⚡ Socket.io realtime chat
- 🔄 TanStack Query data fetching
- 📱 Native UI components (StyleSheet)
- 🎨 Gradient theme matching admin
- 🔐 JWT authentication flow

## 🛠️ Tech Stack

### Backend Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "mongodb-memory-server": "^9.0.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "socket.io": "^4.7.0",
  "stripe": "^14.0.0",
  "zod": "^3.22.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3"
}
```

### Admin Dependencies
```json
{
  "react": "^18.2.0",
  "vite": "^5.0.8",
  "typescript": "^5.3.3",
  "tailwindcss": "^3.4.0",
  "@tanstack/react-query": "^5.28.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.5"
}
```

### Mobile Dependencies
```json
{
  "expo": "^51.0.0",
  "react-native": "0.74.1",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/native-stack": "^6.9.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "@tanstack/react-query": "^5.28.0",
  "socket.io-client": "^4.7.2",
  "axios": "^1.6.5",
  "expo-notifications": "^0.28.0"
}
```

## 📡 Complete API Reference

### Authentication Routes (`/api/auth`)
- `POST /register` - Create account (name, email, password, role)
  - Returns: `{ token, refreshToken, user }`
- `POST /login` - Login (email, password)
  - Returns: `{ token, refreshToken, user }`
- `POST /refresh` - Refresh access token
  - Body: `{ refreshToken }`
  - Returns: `{ token }`

### Categories (`/api/categories`)
- `GET /` - List all categories
- `POST /` - Create category (admin only)
  - Body: `{ name, icon, status? }`

### Services (`/api/services`)
- `GET /` - List services (query: `?category=id`)
- `POST /` - Create service (admin only)
  - Body: `{ name, category, price, duration, description?, image? }`

### Providers (`/api/providers`)
- `GET /` - List approved providers
- `POST /` - Create provider profile (pro/admin)
  - Body: `{ businessName, category, address, phone, ... }`
- `PATCH /:id/verify` - Approve provider (admin only)

### Bookings (`/api/bookings`)
- `GET /me` - User/provider bookings
- `POST /` - Create booking
  - Body: `{ provider, service, date, time, price }`
- `PATCH /:id/status` - Update status (admin/pro)
  - Body: `{ status: 'confirmed' | 'completed' | 'cancelled' }`
- `PATCH /:id/reschedule` - Reschedule booking
  - Body: `{ date, time }`
- `POST /:id/refund` - Cancel with refund

### Coupons (`/api/coupons`)
- `GET /` - List coupons (admin)
- `POST /` - Create coupon (admin)
  - Body: `{ code, type: 'fixed'|'percent', value, minOrder, maxUses, expiresAt }`
- `POST /apply` - Validate coupon
  - Body: `{ code, orderTotal }`
  - Returns: `{ valid, discount, message }`

### Reviews (`/api/reviews`)
- `GET /provider/:id` - Provider reviews
- `POST /` - Submit review
  - Body: `{ provider, rating, text }`
  - Auto-updates provider rating

### Chat (`/api/chats`)
- `GET /me` - User/pro chat list
- `GET /:id/messages` - Chat messages
- `POST /message` - Send message
  - Body: `{ chatId, text }`

### Wallet & Payments (`/api/wallet`, `/api/payments`)
- `GET /wallet/me` - Wallet balance
- `POST /wallet/topup` - Add funds
  - Body: `{ amount }`
- `POST /payments/intent` - Generate Stripe client secret
  - Body: `{ amount }`

### Notifications (`/api/notifications`)
- `GET /me` - User notifications

## 🔌 Socket.io Events Reference

### Client → Server Events
```typescript
// Join user's personal room
socket.emit('join', { userId })

// Join specific chat room
socket.emit('join-chat', { chatId })

// Send chat message
socket.emit('send-message', { chatId, senderId, senderType, text })

// Show typing indicator
socket.emit('typing', { chatId, userId, isTyping })

// Mark messages as read
socket.emit('mark-read', { chatId, userId })
```

### Server → Client Events
```typescript
// Connection confirmed
socket.on('connected', (data) => { ... })

// New chat message received
socket.on('new-message', (message) => { ... })

// User typing status
socket.on('user-typing', ({ userId, isTyping }) => { ... })

// General notification
socket.on('notification', (notification) => { ... })

// Chat-specific notification
socket.on('chat-notification', ({ chatId, unreadCount }) => { ... })

// Booking status updated
socket.on('booking-update', (booking) => { ... })
```

## 🎨 Design System

### Color Palette
- **Primary Pink**: `#ec4899` (rgb(236, 72, 153))
- **Secondary Purple**: `#8b5cf6` (rgb(139, 92, 246))
- **Success Green**: `#10b981` (rgb(16, 185, 129))
- **Warning Yellow**: `#f59e0b` (rgb(245, 158, 11))
- **Error Red**: `#ef4444` (rgb(239, 68, 68))
- **Dark Blue**: `#0f172a` (rgb(15, 23, 42))

### Gradients
```css
/* Primary Gradient (Buttons, Headers) */
background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);

/* Dark Gradient (Backgrounds) */
background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);

/* Card Gradient (Admin Dashboard) */
background: linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 100%);
```

## 📝 Environment Variables

### Server `.env`
```env
PORT=4000
NODE_ENV=development

# MongoDB (Memory Server auto-configured in dev)
MONGO_URI=mongodb://localhost:27017/gobeauty

# JWT Secrets
JWT_SECRET=gobeauty-secret-key-2025-change-in-production
JWT_REFRESH_SECRET=gobeauty-refresh-secret-2025-change-in-production

# Stripe
STRIPE_SECRET=sk_test_YOUR_STRIPE_SECRET_KEY

# Cloudinary (optional)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### Admin `.env`
```env
VITE_API_URL=http://localhost:4000/api
```

### Mobile `app.json` → extra
```json
{
  "extra": {
    "apiUrl": "http://localhost:4000/api"
  }
}
```

## 🚧 Remaining Enhancements

### Backend
- [ ] Stripe webhook handler (POST /payments/webhook)
- [ ] Cloudinary file upload endpoint
- [ ] Email notifications (SendGrid/Mailgun)
- [ ] SMS notifications (Twilio)
- [ ] Advanced search with Elasticsearch
- [ ] Provider availability calendar CRUD
- [ ] Favorites system (GET/POST /favorites)

### Admin Panel
- [ ] Analytics charts (Chart.js or Recharts)
- [ ] Export reports (CSV/PDF generation)
- [ ] Bulk operations (bulk approve providers, bulk delete)
- [ ] Settings page (platform config, email templates)
- [ ] Dark mode toggle

### Mobile App
- [ ] **Booking Flow Screen** - Multi-step (select service → time slots → coupon → payment)
- [ ] Payment integration - Stripe Elements in mobile
- [ ] Map view - React Native Maps for nearby providers
- [ ] Push notifications - Expo Notifications
- [ ] Favorites screen - Save/unsave providers
- [ ] Wallet screen - Balance, top-up, transaction history
- [ ] Edit Profile screen
- [ ] Saved Addresses screen
- [ ] Settings screen (language, notifications preferences)
- [ ] Dark mode
- [ ] Multi-language support (i18n)

### Pro App (Future)
- [ ] Pro Dashboard - Earnings, appointments today, ratings
- [ ] Pro Calendar - Manage availability, view bookings
- [ ] Pro Earnings - Revenue breakdown, withdraw funds
- [ ] Pro Reviews - View and reply to customer reviews
- [ ] Pro Services - Manage service catalog
- [ ] Pro Profile - Edit business info, upload images

## 📄 License

MIT License - Free for personal and commercial use.

## 👨‍💻 Author

GoBeauty Platform - 2025

---

**Status:** ✅ All core features implemented  
**Servers:** Backend (:4000) + Admin (:3000) running  
**Mobile:** Dependencies installed, ready for `npx expo start`  
**Last Updated:** January 16, 2025
