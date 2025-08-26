# Google OAuth Setup Guide

## What Was Fixed

The error "Parameter not allowed for this message type: code_challenge_method" was caused by using the wrong OAuth flow. The previous implementation used OIDC implicit flow (`ResponseType.IdToken`) but was trying to include PKCE parameters, which are only valid for authorization code flow.

## Changes Made

1. **Updated AuthContext.tsx**: Changed from implicit flow to proper OAuth 2.0 authorization code flow with PKCE
2. **Added expo-crypto**: Required for generating PKCE code challenges
3. **Cleaned app.json**: Removed unnecessary `googleSignIn` config that conflicts with Expo AuthSession
4. **Fixed codeVerifier generation**: Now uses proper random string instead of incorrect makeRedirectUri call

## Next Steps - Configure Google OAuth

### 1. Go to Google Cloud Console
- Visit [Google Cloud Console](https://console.cloud.google.com/)
- **IMPORTANT**: Make sure you're in the `femora-5d93e` project (not femora-42d60)
- Enable the Google+ API

### 2. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth 2.0 Client IDs"
- Choose "Web application" for the web client ID
- Choose "iOS" and "Android" for mobile client IDs

### 3. Configure OAuth Consent Screen
- Go to "OAuth consent screen"
- Add your app name: "Femora"
- Add user support email and developer contact
- Add scopes: `openid`, `profile`, `email`

### 4. Update app.json
Replace the placeholder values in your `app.json`:

```json
"extra": {
  "expoClientId": "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  "iosClientId": "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com", 
  "androidClientId": "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com"
}
```

### 5. Configure Redirect URIs
For each OAuth client ID, add these redirect URIs:

**Web Client:**
- `http://localhost:8082` (or your current port)
- `https://auth.expo.io/@your-expo-username/my-expo-app`

**iOS Client:**
- `com.example.myexpoapp://`

**Android Client:**
- `com.example.myexpoapp://`

## How the New Implementation Works

1. **PKCE Flow**: Generates a code verifier and challenge for secure OAuth
2. **Authorization Code**: Gets an authorization code from Google
3. **Token Exchange**: Exchanges the code for ID tokens using the code verifier
4. **Firebase Auth**: Signs in to Firebase with the Google credential

## Testing

1. Make sure you have valid Google OAuth client IDs
2. Test on both iOS and Android simulators/devices
3. Check the console for any remaining errors

## Common Issues

- **Invalid Client ID**: Make sure your client IDs are correct and match the platform
- **Redirect URI Mismatch**: Ensure redirect URIs in Google Console match your app scheme
- **Missing Scopes**: Verify all required scopes are added to OAuth consent screen
- **Wrong Project**: Make sure you're using `femora-5d93e` project, not `femora-42d60`

## Security Notes

- PKCE prevents authorization code interception attacks
- Code verifier is generated per session and never stored
- All OAuth flows now use secure HTTPS endpoints
- Proper error handling with detailed logging
