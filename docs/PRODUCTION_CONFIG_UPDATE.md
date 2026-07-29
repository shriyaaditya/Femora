# 🔧 Production Configuration Update

## ⚠️ Required Changes for Production Deployment

Your app is fully functional, but needs these configuration updates for production:

### 1. **Update Backend URLs**

#### In `services/secureImageService.ts`:
```typescript
// Change from:
baseUrl: 'http://localhost:8000/api'

// To:
baseUrl: 'https://your-backend-domain.com/api'
```

#### In `services/moraService.ts`:
```typescript
// Change from:
const MORA_BACKEND_URL = 'http://localhost:5002'

// To:
const MORA_BACKEND_URL = 'https://your-mora-backend.com'
```

### 2. **Environment Variables for Production**

Create a `.env` file with production values:

```bash
# Backend URLs
BACKEND_URL=https://your-backend-domain.com
MORA_BACKEND_URL=https://your-mora-backend.com

# Google Cloud
GCS_BUCKET=your-production-bucket
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./production-credentials.json

# Firebase (Production)
FIREBASE_API_KEY=your-production-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-production-project-id

# Security
ENCRYPTION_KEY=your-production-encryption-key
JWT_SECRET=your-production-jwt-secret
```

### 3. **Backend Deployment Options**

#### Option A: Google Cloud Run (Recommended)
```bash
# Deploy Mora AI Backend
gcloud run deploy mora-backend \
  --source ./mora \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy Image Processing Backend
gcloud run deploy image-backend \
  --source ./backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Option B: Heroku
```bash
# Deploy both backends
heroku create femora-mora-backend
heroku create femora-image-backend

git subtree push --prefix mora heroku-mora main
git subtree push --prefix backend heroku-image main
```

#### Option C: Railway
```bash
# Deploy to Railway
railway login
railway init
railway up
```

### 4. **Update Network Configuration**

In `config/network.ts`, update production URLs:

```typescript
production: {
  moraBackend: {
    host: 'your-mora-backend.com',
    port: '443',
    protocol: 'https',
  },
  imageBackend: {
    host: 'your-image-backend.com',
    port: '443',
    protocol: 'https',
  },
}
```

## 🚀 **Deployment Steps**

### Step 1: Deploy Backends
```bash
# Choose one deployment method above
# Get the production URLs from your deployment
```

### Step 2: Update App Configuration
```bash
# Update the URLs in your app
# Update environment variables
```

### Step 3: Build and Deploy App
```bash
# Build for production
eas build --platform all --profile production

# Submit to app stores
eas submit --platform all
```

## ✅ **Verification Checklist**

- [ ] Backend URLs updated to production
- [ ] Environment variables configured
- [ ] Backends deployed and accessible
- [ ] Firebase project configured for production
- [ ] Google Cloud credentials updated
- [ ] App builds successfully
- [ ] All features tested in production

## 🎯 **Expected Results**

After these updates:
- ✅ **Chatbot** will work with production AI backend
- ✅ **Login/Signup** will work with production Firebase
- ✅ **Breast Scan** will work with production image processing
- ✅ **All features** will be fully functional for users

## 🆘 **Need Help?**

If you encounter issues:
1. Check backend health endpoints
2. Verify environment variables
3. Test API endpoints manually
4. Check Firebase configuration
5. Review Google Cloud permissions

---

**Your app is production-ready! Just needs these configuration updates. 🚀**




