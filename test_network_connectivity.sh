#!/bin/bash

echo "🧪 Femora Network Connectivity Test"
echo "=================================="
echo "Generated IP: 10.133.147.50"
echo ""

# Test local connectivity
echo "🔍 Testing local connectivity..."
if curl -s http://${DEV_MORA_BACKEND_HOST:-localhost}:${DEV_MORA_BACKEND_PORT:-5002}/health > /dev/null; then
    echo "✅ Mora Backend (localhost): OK"
else
    echo "❌ Mora Backend (localhost): FAILED"
fi

if curl -s http://${DEV_IMAGE_BACKEND_HOST:-localhost}:${DEV_IMAGE_BACKEND_PORT:-8000}/health > /dev/null; then
    echo "✅ Image Backend (localhost): OK"
else
    echo "❌ Image Backend (localhost): FAILED"
fi

echo ""

# Test network connectivity
echo "🌐 Testing network connectivity..."
if curl -s http://10.133.147.50:5002/health > /dev/null; then
    echo "✅ Mora Backend (network): OK"
else
    echo "❌ Mora Backend (network): FAILED"
fi

if curl -s http://10.133.147.50:8000/health > /dev/null; then
    echo "✅ Image Backend (network): OK"
else
    echo "❌ Image Backend (network): FAILED"
fi

echo ""

# Test Android compatibility
echo "📱 Android Compatibility Test:"
echo "   Your Android device should be able to connect to:"
echo "   - Mora Backend: http://10.133.147.50:5002"
echo "   - Image Backend: http://10.133.147.50:8000"
echo ""

# Test from another device (if available)
echo "🔗 To test from another device on the same network:"
echo "   curl http://10.133.147.50:8000/health"
echo ""

echo "✅ Network test completed!"
