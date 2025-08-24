#!/bin/bash

echo "🚀 Femora App - Mora Chatbot & Unified User System Setup"
echo "=========================================================="

# Check if we're in the right directory
if [ ! -d "mora" ]; then
    echo "❌ Please run this script from the Femora project root directory."
    exit 1
fi

echo "✅ Project structure verified"

# Check environment variables
echo ""
echo "🔍 Checking environment variables..."

if grep -q "GOOGLE_API_KEY=your-google-generative-ai-api-key-here" .env; then
    echo "❌ GOOGLE_API_KEY not set - you need to get this from Google AI Studio"
    echo "   Visit: https://makersuite.google.com/app/apikey"
    echo "   Then update your .env file"
else
    echo "✅ GOOGLE_API_KEY is configured"
fi

if grep -q "GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json" .env; then
    echo "❌ GOOGLE_APPLICATION_CREDENTIALS not set - you need Firebase service account"
    echo "   Visit: https://console.firebase.google.com/"
    echo "   Go to Project Settings → Service Accounts → Generate New Private Key"
    echo "   Then update your .env file"
else
    echo "✅ GOOGLE_APPLICATION_CREDENTIALS is configured"
fi

if grep -q "MORA_BACKEND_URL=http://localhost:5002" .env; then
    echo "✅ MORA_BACKEND_URL is set to localhost:5002"
else
    echo "❌ MORA_BACKEND_URL not configured"
fi

echo ""
echo "🔧 Setting up Python environment..."

# Install Python dependencies
cd mora
if pip install -r requirements.txt > /dev/null 2>&1; then
    echo "✅ Python dependencies installed"
else
    echo "❌ Failed to install Python dependencies"
    echo "   Try: cd mora && pip install -r requirements.txt"
    exit 1
fi

echo ""
echo "🧪 Testing Mora backend..."

# Test the backend
if python test_integration.py > /dev/null 2>&1; then
    echo "✅ Mora backend test passed"
else
    echo "⚠️  Mora backend test failed (this is normal if backend isn't running yet)"
fi

echo ""
echo "🚀 Starting Mora backend server..."
echo "   The server will run on http://localhost:5002"
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the Mora backend
python main.py
