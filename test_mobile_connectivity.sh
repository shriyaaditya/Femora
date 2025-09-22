#!/bin/bash

echo "📱 Mobile Connectivity Test"
echo "=========================="
echo "Testing connectivity to: ${DEV_BACKEND_HOST:-10.133.147.50}"
echo ""

# Test Mora Backend
echo "🔍 Testing Mora Backend (Port 5002)..."
if curl -s --connect-timeout 5 "http://${DEV_BACKEND_HOST:-10.133.147.50}:5002/health" > /dev/null; then
    echo "✅ Mora Backend: ACCESSIBLE"
else
    echo "❌ Mora Backend: NOT ACCESSIBLE"
fi

# Test Image Backend
echo "🔍 Testing Image Backend (Port 8000)..."
if curl -s --connect-timeout 5 "http://${DEV_BACKEND_HOST:-10.133.147.50}:8000/health" > /dev/null; then
    echo "✅ Image Backend: ACCESSIBLE"
else
    echo "❌ Image Backend: NOT ACCESSIBLE"
fi

# Test Frontend
echo "🔍 Testing Frontend (Port 8081)..."
if curl -s --connect-timeout 5 "http://${DEV_BACKEND_HOST:-10.133.147.50}:8081" > /dev/null; then
    echo "✅ Frontend: ACCESSIBLE"
else
    echo "❌ Frontend: NOT ACCESSIBLE"
fi

echo ""
echo "📱 On your phone:"
echo "1. Make sure you're on the same WiFi network"
echo "2. Try opening: http://${DEV_BACKEND_HOST:-10.133.147.50}:5002/health"
echo "3. If accessible, your app should work!"
