# Firebase Authentication Setup

This guide will help you set up Firebase authentication in your Expo app.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

## 3. Get Your Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname
6. Copy the firebaseConfig object

## 4. Update Firebase Configuration

1. Open `config/firebase.ts`
2. Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## 5. Test the Authentication

1. Run your app: `npm start`
2. You should see the login screen
3. Create a new account or sign in with existing credentials
4. The app will automatically navigate to the main screen after successful authentication

## Features Added

- **Email/Password Authentication**: Users can sign up and sign in
- **Persistent Login**: Users stay logged in between app sessions
- **Logout Functionality**: Users can logout from the home screen
- **Loading States**: Proper loading indicators during authentication
- **Error Handling**: User-friendly error messages for authentication failures

## Security Rules

Make sure to set up proper Firebase Security Rules for your database if you plan to store user data.

## Troubleshooting

- If you get authentication errors, make sure Email/Password authentication is enabled in Firebase
- Check that your Firebase configuration is correct
- Ensure you're using the latest version of the Firebase SDK



