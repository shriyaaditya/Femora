#!/bin/bash

# ========================================
# FEMORA COMPLETE STARTUP SCRIPT
# ========================================
# This script starts all 4 major processes:
# 1. Mora Backend (Chatbot) - Port 5002
# 2. Image Processing Backend - Port 8000
# 3. Frontend (Expo) - Port 8081
# 4. Monitoring and Health Checks
# ========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment variables
if [ -f "$SCRIPT_DIR/.env" ]; then
    print_status "Loading environment variables from .env"
    export $(cat "$SCRIPT_DIR/.env" | grep -v '^#' | xargs)
else
    print_warning "No .env file found. Using default localhost configuration."
fi

# Set default values if not in .env
DEV_MORA_BACKEND_URL=${DEV_MORA_BACKEND_URL:-"http://${DEV_MORA_BACKEND_HOST:-localhost}:${DEV_MORA_BACKEND_PORT:-5002}"}
DEV_IMAGE_BACKEND_URL=${DEV_IMAGE_BACKEND_URL:-"http://${DEV_IMAGE_BACKEND_HOST:-localhost}:${DEV_IMAGE_BACKEND_PORT:-8000}"}
DEV_FRONTEND_URL=${DEV_FRONTEND_URL:-"http://${DEV_FRONTEND_HOST:-localhost}:${DEV_FRONTEND_PORT:-8081}"}

print_status "Starting Femora Complete App..."
echo "=================================================="
print_status "Configuration:"
print_status "  Mora Backend: $DEV_MORA_BACKEND_URL"
print_status "  Image Backend: $DEV_IMAGE_BACKEND_URL"
print_status "  Frontend: $DEV_FRONTEND_URL"
echo "=================================================="

# Function to check if a port is available
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is already in use by another process"
        print_status "Stopping existing process on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url/health" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Clean up any existing processes
print_status "🧹 Cleaning up existing processes..."
check_port 5002 "Mora Backend"
check_port 8000 "Image Backend"
check_port 8081 "Frontend"

# Start Mora Backend (Port 5002)
print_status "🤖 Starting Mora Backend (Chatbot) on port 5002..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/mora' && echo 'Starting Mora Backend...' && python main_fastapi.py; echo 'Mora Backend stopped. Press any key to close...'; read -n 1\"" &
    MORA_PID=$!
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    gnome-terminal -- bash -c "cd '$SCRIPT_DIR/mora' && echo 'Starting Mora Backend...' && python main_fastapi.py; echo 'Mora Backend stopped. Press any key to close...'; read -n 1" 2>/dev/null || \
    xterm -e "cd '$SCRIPT_DIR/mora' && echo 'Starting Mora Backend...' && python main_fastapi.py; echo 'Mora Backend stopped. Press any key to close...'; read -n 1" &
    MORA_PID=$!
else
    print_warning "Unsupported OS. Please start Mora Backend manually: cd mora && python main_fastapi.py"
    MORA_PID=""
fi

# Wait for Mora Backend to start
if [ ! -z "$MORA_PID" ]; then
    sleep 5
    if wait_for_service "$DEV_MORA_BACKEND_URL" "Mora Backend"; then
        print_success "✅ Mora Backend started successfully!"
    else
        print_error "❌ Mora Backend failed to start"
        exit 1
    fi
fi

# Start Image Backend (Port 8000)
print_status "🖼️  Starting Image Processing Backend on port 8000..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/backend' && echo 'Starting Image Backend...' && ./start_image_backend.sh; echo 'Image Backend stopped. Press any key to close...'; read -n 1\"" &
    IMAGE_PID=$!
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    gnome-terminal -- bash -c "cd '$SCRIPT_DIR/backend' && echo 'Starting Image Backend...' && ./start_image_backend.sh; echo 'Image Backend stopped. Press any key to close...'; read -n 1" 2>/dev/null || \
    xterm -e "cd '$SCRIPT_DIR/backend' && echo 'Starting Image Backend...' && ./start_image_backend.sh; echo 'Image Backend stopped. Press any key to close...'; read -n 1" &
    IMAGE_PID=$!
else
    print_warning "Unsupported OS. Please start Image Backend manually: cd backend && ./start_image_backend.sh"
    IMAGE_PID=""
fi

# Wait for Image Backend to start
if [ ! -z "$IMAGE_PID" ]; then
    sleep 5
    if wait_for_service "$DEV_IMAGE_BACKEND_URL" "Image Backend"; then
        print_success "✅ Image Backend started successfully!"
    else
        print_error "❌ Image Backend failed to start"
        exit 1
    fi
fi

# Start Frontend (Port 8081)
print_status "🎨 Starting Frontend (Expo) on port 8081..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR' && echo 'Starting Frontend...' && npm start; echo 'Frontend stopped. Press any key to close...'; read -n 1\"" &
    FRONTEND_PID=$!
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    gnome-terminal -- bash -c "cd '$SCRIPT_DIR' && echo 'Starting Frontend...' && npm start; echo 'Frontend stopped. Press any key to close...'; read -n 1" 2>/dev/null || \
    xterm -e "cd '$SCRIPT_DIR' && echo 'Starting Frontend...' && npm start; echo 'Frontend stopped. Press any key to close...'; read -n 1" &
    FRONTEND_PID=$!
else
    print_warning "Unsupported OS. Please start Frontend manually: npm start"
    FRONTEND_PID=""
fi

# Wait for Frontend to start
if [ ! -z "$FRONTEND_PID" ]; then
    sleep 5
    print_success "✅ Frontend started successfully!"
fi

# Final status
echo "=================================================="
print_success "🎉 All Femora services are now running!"
print_status "📱 Frontend: $DEV_FRONTEND_URL"
print_status "🤖 Mora Backend (Chatbot): $DEV_MORA_BACKEND_URL"
print_status "🖼️  Image Backend: $DEV_IMAGE_BACKEND_URL"
echo ""
print_status "💡 Tips:"
print_status "   - Each service runs in its own terminal"
print_status "   - Close terminals individually when done"
print_status "   - Use Ctrl+C in this terminal to stop monitoring"
print_status "   - Check individual terminals for service logs"
echo "=================================================="

# Monitor services
print_status "🔍 Monitoring services... (Press Ctrl+C to stop)"
trap 'print_status "Shutting down monitoring..."; exit 0' INT

while true; do
    # Check Mora Backend
    if curl -s "$DEV_MORA_BACKEND_URL/health" >/dev/null 2>&1; then
        echo -n "✅"
    else
        echo -n "❌"
    fi
    
    # Check Image Backend
    if curl -s "$DEV_IMAGE_BACKEND_URL/health" >/dev/null 2>&1; then
        echo -n "✅"
    else
        echo -n "❌"
    fi
    
    # Check Frontend (Expo)
    if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -n "✅"
    else
        echo -n "❌"
    fi
    
    echo " - $(date '+%H:%M:%S') - Services Status"
    sleep 10
done
