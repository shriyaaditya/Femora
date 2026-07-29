#!/bin/bash

# Deploy Firestore Security Rules
echo "🚀 Deploying Firestore security rules..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔐 Logging into Firebase..."
firebase login --no-localhost

# Deploy Firestore rules
echo "📝 Deploying Firestore rules..."
firebase deploy --only firestore:rules

echo "✅ Firestore rules deployed successfully!"
echo "🔒 Your app should now have proper permissions for authenticated users."

