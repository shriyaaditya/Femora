#!/bin/bash

echo "🚀 Starting Femora Backends for Android Access"
echo "=============================================="

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if backends are already running
echo "🔍 Checking current backend status..."

if lsof -i :8000 > /dev/null 2>&1; then
    echo "⚠️  Port 8000 (Image Backend) is already in use"
    echo "   Stopping existing process..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
fi

if lsof -i :5002 > /dev/null 2>&1; then
    echo "⚠️  Port 5002 (Mora Backend) is already in use"
    echo "   Stopping existing process..."
    lsof -ti:5002 | xargs kill -9 2>/dev/null || true
fi

echo ""

# Start Image Backend
echo "🖼️  Starting Image Backend..."
cd backend
if [ -f "start_image_backend.sh" ]; then
    echo "   Using start_image_backend.sh"
    nohup ./start_image_backend.sh > ../logs/image_backend.log 2>&1 &
    IMAGE_PID=$!
    echo "   Image Backend started with PID: $IMAGE_PID"
else
    echo "   Starting directly with Python"
    nohup python3 main.py > ../logs/image_backend.log 2>&1 &
    IMAGE_PID=$!
    echo "   Image Backend started with PID: $IMAGE_PID"
fi
cd ..

echo ""

# Start Mora Backend
echo "🤖 Starting Mora Backend..."
cd mora
if [ -f "start_mora.py" ]; then
    echo "   Using start_mora.py"
    nohup python3 start_mora.py > ../logs/mora_backend.log 2>&1 &
    MORA_PID=$!
    echo "   Mora Backend started with PID: $MORA_PID"
else
    echo "   Starting directly with Python"
    nohup python3 main_fastapi.py > ../logs/mora_backend.log 2>&1 &
    MORA_PID=$!
    echo "   Mora Backend started with PID: $MORA_PID"
fi
cd ..

echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Wait a moment for backends to start
echo "⏳ Waiting for backends to start..."
sleep 5

# Check status
echo ""
echo "🔍 Checking Backend Status:"
echo "-" * 30

# Get network IP
NETWORK_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$NETWORK_IP" ]; then
    NETWORK_IP="10.133.147.50"  # Fallback to known IP
fi

echo "🌐 Network IP: $NETWORK_IP"
echo ""

# Test Image Backend
echo "🖼️  Image Backend (Port 8000):"
if curl -s http://127.0.0.1:8000/health > /dev/null; then
    echo "   Local: ✅ OK"
else
    echo "   Local: ❌ FAILED"
fi

if curl -s http://$NETWORK_IP:8000/health > /dev/null; then
    echo "   Network: ✅ OK"
else
    echo "   Network: ❌ FAILED"
fi

# Test Mora Backend
echo ""
echo "🤖 Mora Backend (Port 5002):"
if curl -s http://127.0.0.1:5002/health > /dev/null; then
    echo "   Local: ✅ OK"
else
    echo "   Local: ❌ FAILED"
fi

if curl -s http://$NETWORK_IP:5002/health > /dev/null; then
    echo "   Network: ✅ OK"
else
    echo "   Network: ❌ FAILED"
fi

echo ""
echo "📱 Android Connection URLs:"
echo "   Image Backend: http://$NETWORK_IP:8000"
echo "   Mora Backend: http://$NETWORK_IP:5002"
echo ""

echo "📋 Backend PIDs:"
echo "   Image Backend: $IMAGE_PID"
echo "   Mora Backend: $MORA_PID"
echo ""

echo "📝 Logs:"
echo "   Image Backend: logs/image_backend.log"
echo "   Mora Backend: logs/mora_backend.log"
echo ""

echo "🛑 To stop backends:"
echo "   kill $IMAGE_PID $MORA_PID"
echo ""

echo "✅ Backends started successfully!"
echo "Your Android device should now be able to connect to the backends."
