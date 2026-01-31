# 🚀 Deployment Guide - GoBeauty Platform

Complete production deployment guide for Backend, Admin Panel, and Mobile App.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Update all `.env` files with production values
- [ ] Generate strong JWT secrets (32+ characters)
- [ ] Setup MongoDB Atlas database
- [ ] Get production Stripe API keys
- [ ] Configure Cloudinary for file uploads
- [ ] Setup email service (SendGrid/Mailgun)

### 2. Security Hardening
- [ ] Enable CORS whitelist (remove `*`)
- [ ] Add rate limiting per IP
- [ ] Enable Helmet.js security headers
- [ ] Setup SSL/TLS certificates
- [ ] Configure CSP (Content Security Policy)
- [ ] Enable API key authentication for sensitive routes

### 3. Testing
- [ ] Run all backend unit tests
- [ ] Run integration tests
- [ ] Test admin panel on staging
- [ ] Test mobile app on TestFlight/Play Console
- [ ] Load testing (Artillery/k6)
- [ ] Security audit (OWASP)

---

## 🖥️ Backend Deployment

### Option 1: Railway (Recommended)

**Step 1: Prepare Backend**
```bash
cd server

# Create Procfile (optional)
echo "web: node src/app.js" > Procfile

# Create .railwayignore
echo "node_modules
.env.local
*.log" > .railwayignore
```

**Step 2: Deploy to Railway**
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `GoBeauty/server` folder
4. Add environment variables:
   ```env
   NODE_ENV=production
   PORT=4000
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/gobeauty
   JWT_SECRET=your-super-secret-key-production
   JWT_REFRESH_SECRET=your-refresh-secret-production
   STRIPE_SECRET=sk_live_...
   CLOUDINARY_URL=cloudinary://...
   ```
5. Click "Deploy"
6. Get deployment URL: `https://gobeauty-backend.up.railway.app`

**Step 3: Update app.js for Production**
```javascript
// server/src/app.js
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://admin.gobeauty.com', 'https://gobeauty.app']
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### Option 2: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
cd server
heroku create gobeauty-api

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set STRIPE_SECRET=sk_live_...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 3: DigitalOcean App Platform

1. Create account on [DigitalOcean](https://www.digitalocean.com)
2. Click "App Platform" → "Create App"
3. Connect GitHub repo
4. Select `server` folder as source directory
5. Environment: Node.js
6. Add environment variables
7. Click "Create Resources"
8. Get app URL: `https://gobeauty-api-xxxxx.ondigitalocean.app`

### Option 4: VPS (Ubuntu 22.04)

**Step 1: Setup Server**
```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

**Step 2: Deploy Application**
```bash
# Clone repo
cd /var/www
git clone https://github.com/yourusername/gobeauty.git
cd gobeauty/server

# Install dependencies
npm install --production

# Create .env file
nano .env
# (Paste production env variables)

# Start with PM2
pm2 start src/app.js --name gobeauty-api
pm2 save
pm2 startup
```

**Step 3: Setup Nginx Reverse Proxy**
```bash
# Install Nginx
apt install -y nginx

# Create config
nano /etc/nginx/sites-available/gobeauty
```

```nginx
server {
    listen 80;
    server_name api.gobeauty.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Socket.io support
    location /socket.io/ {
        proxy_pass http://localhost:4000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/gobeauty /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Install SSL (Let's Encrypt)
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.gobeauty.com
```

---

## 🌐 Admin Panel Deployment

### Option 1: Vercel (Recommended)

**Step 1: Prepare Admin**
```bash
cd admin

# Update API URL
# .env.production
VITE_API_URL=https://gobeauty-api.up.railway.app/api
```

**Step 2: Deploy to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Project name: gobeauty-admin
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist

# Production deployment
vercel --prod

# Get URL: https://gobeauty-admin.vercel.app
```

**Vercel Dashboard Alternative:**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import GitHub repo
4. Root directory: `admin`
5. Framework: Vite
6. Environment variables:
   - `VITE_API_URL`: https://gobeauty-api.up.railway.app/api
7. Click "Deploy"

### Option 2: Netlify

```bash
cd admin

# Create netlify.toml
cat > netlify.toml <<EOF
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF

# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Get URL: https://gobeauty-admin.netlify.app
```

### Option 3: GitHub Pages

```bash
cd admin

# Add to vite.config.ts
export default defineConfig({
  base: '/gobeauty-admin/',  // Your repo name
  build: {
    outDir: 'dist'
  }
})

# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts
"deploy": "vite build && gh-pages -d dist"

# Deploy
npm run deploy

# Enable GitHub Pages in repo settings
# URL: https://yourusername.github.io/gobeauty-admin
```

---

## 📱 Mobile App Deployment

### iOS App Store (TestFlight + Production)

**Step 1: Setup EAS Build**
```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Update app.json
{
  "expo": {
    "name": "GoBeauty",
    "slug": "gobeauty",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.gobeauty",
      "buildNumber": "1"
    },
    "extra": {
      "apiUrl": "https://gobeauty-api.up.railway.app/api"
    }
  }
}
```

**Step 2: Build for iOS**
```bash
# Create development build
eas build --platform ios --profile development

# Create production build
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

**Step 3: App Store Connect**
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app
3. Fill app information:
   - Name: GoBeauty
   - Category: Lifestyle
   - Screenshots (1242x2688, 2778x1284)
   - Description, keywords
4. Upload build from EAS
5. Submit for review

### Android Play Store

**Step 1: Build for Android**
```bash
# Update app.json
{
  "android": {
    "package": "com.yourcompany.gobeauty",
    "versionCode": 1,
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#ec4899"
    }
  }
}

# Create production build
eas build --platform android --profile production

# Generate AAB (Android App Bundle)
eas build --platform android --profile production --auto-submit
```

**Step 2: Play Console Setup**
1. Go to [Google Play Console](https://play.google.com/console)
2. Create app
3. Fill store listing:
   - App name: GoBeauty
   - Short description
   - Full description
   - Screenshots (1080x1920, 1920x1080)
   - Feature graphic (1024x500)
4. Upload AAB file
5. Complete content rating questionnaire
6. Submit for review

### OTA Updates (Expo Updates)

```bash
# Setup Expo Updates
eas update:configure

# Publish update (no app store review needed)
eas update --branch production --message "Bug fixes"

# Users get update on next app restart
```

---

## 🔐 Production Environment Variables

### Backend `.env` (Production)
```env
NODE_ENV=production
PORT=4000

# MongoDB Atlas
MONGO_URI=mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/gobeauty?retryWrites=true&w=majority

# JWT Secrets (Generate: openssl rand -base64 32)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4

# Stripe (Live Keys)
STRIPE_SECRET=sk_live_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_URL=cloudinary://123456789:abcdefg@cloud-name

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
FROM_EMAIL=noreply@gobeauty.com

# SMS (Twilio - optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URLs (for CORS)
ADMIN_URL=https://admin.gobeauty.com
MOBILE_URL=gobeauty://
```

### Admin `.env.production`
```env
VITE_API_URL=https://api.gobeauty.com/api
```

### Mobile `app.json` → extra
```json
{
  "extra": {
    "apiUrl": "https://api.gobeauty.com/api",
    "stripePublishableKey": "pk_live_...",
    "googleMapsApiKey": "AIzaSyXXXXXXXXXXXX"
  }
}
```

---

## 🗄️ Database Migration (MongoDB Atlas)

**Step 1: Create MongoDB Atlas Cluster**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0 Sandbox)
3. Choose region (closest to your backend)
4. Create database user (username + password)
5. Add IP whitelist: `0.0.0.0/0` (or specific IPs)

**Step 2: Export Local Data**
```bash
# Export from local MongoDB
mongodump --db gobeauty --out ./backup

# Or from Memory Server (manual seed in production)
# Just run seed script on production:
node src/utils/seedData.js
```

**Step 3: Import to Atlas**
```bash
# Get connection string from Atlas
MONGO_URI="mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/gobeauty"

# Import data
mongorestore --uri="$MONGO_URI" ./backup
```

**Step 4: Update Backend**
```javascript
// server/src/db.js
// Remove MongoMemoryServer import
// Use process.env.MONGO_URI directly

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
```

---

## 📊 Monitoring & Logging

### Backend Monitoring (Sentry)

```bash
cd server
npm install @sentry/node @sentry/tracing
```

```javascript
// server/src/app.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'https://xxxxx@sentry.io/xxxxx',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... routes ...

app.use(Sentry.Handlers.errorHandler());
```

### Analytics (Mixpanel/Amplitude)

**Mobile App:**
```bash
cd mobile
npm install @amplitude/analytics-react-native
```

```typescript
// mobile/app/lib/analytics.ts
import { init, track } from '@amplitude/analytics-react-native';

init('YOUR_API_KEY');

export const trackEvent = (event: string, properties?: any) => {
  track(event, properties);
};

// Usage:
trackEvent('booking_created', { provider: 'Glamour Studio', price: 50 });
```

### Performance Monitoring (New Relic)

```bash
cd server
npm install newrelic
```

```javascript
// server/newrelic.js
exports.config = {
  app_name: ['GoBeauty API'],
  license_key: 'YOUR_LICENSE_KEY',
  logging: { level: 'info' }
};

// server/src/app.js (first line)
require('newrelic');
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

**Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy GoBeauty

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd server
          npm install
      
      - name: Run tests
        run: |
          cd server
          npm test
      
      - name: Deploy to Railway
        run: |
          npm install -g railway
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-admin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build admin
        run: |
          cd admin
          npm install
          npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./admin

  deploy-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Expo
        uses: expo/expo-github-action@v7
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Publish update
        run: |
          cd mobile
          eas update --branch production --message "Auto-deploy from GitHub"
```

---

## ✅ Post-Deployment Checklist

### Backend
- [ ] Server responding at production URL
- [ ] MongoDB Atlas connected
- [ ] Socket.io working (test chat)
- [ ] Stripe webhooks configured
- [ ] Email notifications sending
- [ ] Error tracking (Sentry) active
- [ ] SSL certificate valid
- [ ] CORS configured correctly

### Admin Panel
- [ ] Login working with production API
- [ ] All 9 pages loading
- [ ] CRUD operations functional
- [ ] Real-time data updates
- [ ] Responsive on mobile/tablet
- [ ] SSL certificate valid
- [ ] Analytics tracking

### Mobile App
- [ ] Login working
- [ ] Categories loading
- [ ] Bookings CRUD working
- [ ] Chat realtime functional
- [ ] Push notifications enabled
- [ ] App Store/Play Store live
- [ ] OTA updates working
- [ ] Analytics tracking

---

## 🆘 Troubleshooting

**Issue: Backend 500 errors**
```bash
# Check logs
railway logs  # Railway
heroku logs --tail  # Heroku
pm2 logs gobeauty-api  # VPS

# Common fix: Missing env variable
railway variables set MONGO_URI="mongodb+srv://..."
```

**Issue: Admin panel white screen**
```javascript
// Check browser console for CORS errors
// Fix: Update backend CORS allowedOrigins
```

**Issue: Mobile app not connecting**
```typescript
// Check app.json apiUrl is HTTPS (not localhost)
{
  "extra": {
    "apiUrl": "https://api.gobeauty.com/api"  // ✅ Correct
    // "apiUrl": "http://localhost:4000/api"  // ❌ Wrong
  }
}
```

**Issue: Socket.io not connecting**
```javascript
// Backend: Ensure sticky sessions if using load balancer
// Or use Redis adapter for multi-instance support
```

---

## 📞 Support

**Documentation:**
- Backend API: `/api/docs` (if Swagger enabled)
- Admin Guide: `TESTING.md`
- Mobile Guide: `mobile/README.md`

**Contact:**
- Email: support@gobeauty.com
- GitHub Issues: https://github.com/yourusername/gobeauty/issues

---

**Deployment Status:** ✅ Ready for production  
**Recommended Stack:** Railway + Vercel + EAS Build  
**Estimated Cost:** $0-20/month (with free tiers)  
**Last Updated:** January 16, 2025
