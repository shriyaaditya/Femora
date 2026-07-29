# 📱 Femora App Deployment Guide

## 🚀 Making Your App Downloadable

This guide will help you deploy your Femora Health app so users can download and install it on their devices.

## 📋 Prerequisites

### Required Accounts
- **Expo Account**: [Create at expo.dev](https://expo.dev)
- **Apple Developer Account**: $99/year for iOS App Store
- **Google Play Console Account**: $25 one-time fee for Android
- **GitHub Account**: For code repository

### Required Software
- Node.js 18+ and npm
- Expo CLI: `npm install -g @expo/cli`
- EAS CLI: `npm install -g eas-cli`
- Xcode (for iOS builds) - macOS only
- Android Studio (for Android builds)

## 🔧 Step 1: Initial Setup

### 1.1 Install EAS CLI
```bash
npm install -g eas-cli
```

### 1.2 Login to Expo
```bash
eas login
```

### 1.3 Initialize EAS Project
```bash
cd Femora
eas build:configure
```

### 1.4 Update app.json
Your `app.json` has been updated with:
- Proper app name: "Femora Health"
- Bundle identifier: `com.femora.health`
- Required permissions for camera and storage
- App store metadata

## 🏗️ Step 2: Build Configuration

### 2.1 EAS Build Configuration
The `eas.json` file has been created with three build profiles:

- **development**: For testing with development client
- **preview**: For internal testing (APK for Android)
- **production**: For app store submission (AAB for Android, IPA for iOS)

### 2.2 Environment Variables
Create a `.env` file in your project root:
```bash
# Backend Configuration
BACKEND_URL=https://your-backend-domain.com
ENCRYPTION_KEY=your-encryption-key
JWT_SECRET=your-jwt-secret

# Google Cloud Configuration
GCS_BUCKET=your-gcs-bucket
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
```

## 📱 Step 3: Building Your App

### 3.1 Development Build (for testing)
```bash
# Build for Android
eas build --platform android --profile development

# Build for iOS
eas build --platform ios --profile development
```

### 3.2 Preview Build (for internal testing)
```bash
# Build APK for Android testing
eas build --platform android --profile preview

# Build for iOS testing
eas build --platform ios --profile preview
```

### 3.3 Production Build (for app stores)
```bash
# Build for both platforms
eas build --platform all --profile production

# Or build individually
eas build --platform android --profile production
eas build --platform ios --profile production
```

## 🏪 Step 4: App Store Deployment

### 4.1 Google Play Store (Android)

#### 4.1.1 Create Google Play Console Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Pay $25 registration fee
3. Complete developer profile

#### 4.1.2 Create App Listing
1. Click "Create app"
2. Fill in app details:
   - App name: "Femora Health"
   - Default language: English
   - App or game: App
   - Free or paid: Free
   - Declarations: Complete all required sections

#### 4.1.3 Upload App Bundle
```bash
# Build production AAB
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

#### 4.1.4 Required Information
- **Privacy Policy**: Required for health apps
- **App Content Rating**: Complete questionnaire
- **Target Audience**: 18+ (for health apps)
- **Data Safety**: Declare data collection practices
- **Screenshots**: At least 2 for phone, 1 for tablet
- **App Icon**: 512x512 PNG
- **Feature Graphic**: 1024x500 PNG

### 4.2 Apple App Store (iOS)

#### 4.2.1 Apple Developer Account
1. Go to [Apple Developer](https://developer.apple.com)
2. Pay $99/year membership
3. Complete enrollment process

#### 4.2.2 App Store Connect Setup
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app:
   - Platform: iOS
   - Name: "Femora Health"
   - Primary Language: English
   - Bundle ID: `com.femora.health`
   - SKU: `femora-health-ios`

#### 4.2.3 Upload to App Store
```bash
# Build production IPA
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### 4.2.4 Required Information
- **App Information**: Description, keywords, support URL
- **Pricing**: Free or paid
- **App Review Information**: Contact info, demo account
- **Version Information**: What's new, screenshots
- **App Privacy**: Data collection practices
- **Age Rating**: Complete questionnaire (17+ for health apps)

## 🔄 Step 5: Over-The-Air Updates

### 5.1 Setup OTA Updates
```bash
# Install expo-updates
npm install expo-updates

# Configure updates in app.json
```

### 5.2 Deploy Updates
```bash
# Deploy to production
eas update --branch production --message "Bug fixes and improvements"

# Deploy to specific platform
eas update --branch production --platform android
eas update --branch production --platform ios
```

## 🌐 Step 6: Backend Deployment

### 6.1 Deploy Backend to Cloud
Choose one of these options:

#### Option A: Google Cloud Platform
```bash
# Deploy to Google Cloud Run
gcloud run deploy femora-backend \
  --source ./backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Option B: Heroku
```bash
# Create Heroku app
heroku create femora-backend

# Deploy
git subtree push --prefix backend heroku main
```

#### Option C: Railway
```bash
# Connect to Railway
railway login
railway init
railway up
```

### 6.2 Environment Configuration
Update your backend environment variables for production:
```bash
# Production environment
NODE_ENV=production
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
DEBUG_MODE=false
ALLOWED_ORIGINS=["https://your-frontend-domain.com"]
```

## 📊 Step 7: Monitoring & Analytics

### 7.1 Error Tracking
```bash
# Install Sentry
npm install @sentry/react-native

# Configure in App.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
});
```

### 7.2 Analytics
```bash
# Install analytics
npm install @react-native-firebase/analytics
```

## 🧪 Step 8: Testing Before Release

### 8.1 Internal Testing
1. **TestFlight (iOS)**:
   - Upload build to App Store Connect
   - Add internal testers
   - Test all features

2. **Google Play Internal Testing**:
   - Upload AAB to Play Console
   - Add internal testers
   - Test all features

### 8.2 Beta Testing
1. **TestFlight Beta (iOS)**:
   - Add external testers
   - Collect feedback
   - Fix issues

2. **Google Play Closed Testing**:
   - Create closed testing track
   - Add beta testers
   - Collect feedback

## 🚀 Step 9: Production Release

### 9.1 Final Checklist
- [ ] All features tested
- [ ] Privacy policy published
- [ ] App store metadata complete
- [ ] Screenshots and graphics ready
- [ ] Backend deployed and stable
- [ ] Analytics configured
- [ ] Error tracking setup

### 9.2 Release
1. **iOS**: Submit for App Store review
2. **Android**: Release to production track
3. **Monitor**: Watch for crashes and user feedback

## 📈 Step 10: Post-Launch

### 10.1 Monitor Performance
- Check crash reports
- Monitor user feedback
- Track download metrics
- Monitor backend performance

### 10.2 Regular Updates
```bash
# Update app version in app.json
"version": "1.0.1"

# Build and submit updates
eas build --platform all --profile production
eas submit --platform all
```

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
eas build --clear-cache

# Check build logs
eas build:list
eas build:view [BUILD_ID]
```

#### Submission Issues
```bash
# Check submission status
eas submit:list

# View submission logs
eas submit:view [SUBMISSION_ID]
```

#### OTA Update Issues
```bash
# Check update status
eas update:list

# Rollback update
eas update:rollback
```

## 📞 Support

- **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
- **EAS Build**: [docs.expo.dev/build/introduction](https://docs.expo.dev/build/introduction)
- **App Store Guidelines**: [developer.apple.com/app-store/review/guidelines](https://developer.apple.com/app-store/review/guidelines)
- **Google Play Policies**: [support.google.com/googleplay/android-developer](https://support.google.com/googleplay/android-developer)

---

## 🎯 Quick Start Commands

```bash
# 1. Setup
npm install -g @expo/cli eas-cli
eas login
eas build:configure

# 2. Build for testing
eas build --platform android --profile preview

# 3. Build for production
eas build --platform all --profile production

# 4. Submit to stores
eas submit --platform all

# 5. Deploy updates
eas update --branch production --message "Bug fixes"
```

**Your Femora Health app is now ready for users to download! 🎉**







