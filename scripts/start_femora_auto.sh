#!/bin/bash

echo "🚀 Femora Auto-Startup Script"
echo "=============================="
echo "Detected IP: ${DEV_BACKEND_HOST:-10.133.147.50}"
echo ""

# Set environment variables
export DEV_MORA_BACKEND_HOST=${DEV_BACKEND_HOST:-10.133.147.50}
export DEV_IMAGE_BACKEND_HOST=${DEV_BACKEND_HOST:-10.133.147.50}
export DEV_FRONTEND_HOST=${DEV_BACKEND_HOST:-10.133.147.50}

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Starting Mora Backend..."
cd "$SCRIPT_DIR/mora"
./start_backend.sh &
MORA_PID=$!

echo "⏳ Waiting for Mora backend..."
sleep 3

echo "🖼️  Starting Image Backend..."
cd "$SCRIPT_DIR/backend"
./start_image_backend.sh &
IMAGE_PID=$!

echo "⏳ Waiting for Image backend..."
sleep 3

echo "🚀 Starting Frontend..."
cd "$SCRIPT_DIR"
./start_frontend.sh &
FRONTEND_PID=$!

echo ""
echo "✅ All services started!"
echo "📱 Use this IP on your phone: ${DEV_BACKEND_HOST:-10.133.147.50}"
echo "🔗 Mora Backend: http://${DEV_BACKEND_HOST:-10.133.147.50}:5002"
echo "🔗 Image Backend: http://${DEV_BACKEND_HOST:-10.133.147.50}:8000"
echo "🔗 Frontend: http://${DEV_BACKEND_HOST:-10.133.147.50}:8081"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for any service to stop
wait

# Cleanup
echo "🧹 Stopping all services..."
kill $MORA_PID $IMAGE_PID $FRONTEND_PID 2>/dev/null
echo "✅ All services stopped"
