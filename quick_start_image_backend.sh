#!/bin/bash

echo "🚀 Femora Image Processing Quick Start"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "env.config" ]; then
    echo "❌ env.config not found. Please run from Femora project root."
    exit 1
fi

# Start backend in background
echo "🔧 Starting backend server..."
./start_backend.sh &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend
echo "🧪 Testing backend connection..."
python3 test_backend_status.py

echo ""
echo "🎯 Quick Start Summary:"
echo "✅ Backend PID: $BACKEND_PID"
echo "🌐 Backend URL: http://${DEV_IMAGE_BACKEND_HOST:-localhost}:${DEV_IMAGE_BACKEND_PORT:-8000}"
echo "📱 Your React Native app can now connect!"
echo ""
echo "🔍 To check status again: python3 test_backend_status.py"
echo "🛑 To stop backend: kill $BACKEND_PID"
echo ""
echo "🧪 The backend is running in MOCK mode by default"
echo "   To use real GCP, ensure femora-5d93e-firebase-adminsdk-fbsvc-0715bccab2.json is present"

# Keep script running to show backend status
echo "Press Ctrl+C to stop the backend and exit..."
wait $BACKEND_PID

