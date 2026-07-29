#!/bin/bash

echo "🎯 Starting Femora App - Frontend + Backend"
echo "============================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start Mora backend in a new terminal
echo "🤖 Starting Mora backend in new terminal..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/mora' && ./start_backend.sh\""
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    gnome-terminal -- bash -c "cd '$SCRIPT_DIR/mora' && ./start_backend.sh; exec bash" 2>/dev/null || \
    xterm -e "cd '$SCRIPT_DIR/mora' && ./start_backend.sh; exec bash" 2>/dev/null || \
    konsole -e "cd '$SCRIPT_DIR/mora' && ./start_backend.sh; exec bash" 2>/dev/null || \
    echo "⚠️  Could not open new terminal. Please run backend manually: cd mora && ./start_backend.sh"
else
    echo "⚠️  Unsupported OS. Please start backend manually: cd mora && ./start_backend.sh"
fi

# Wait a moment for Mora backend to start
echo "⏳ Waiting for Mora backend to start..."
sleep 3

# Start Image backend in a new terminal
echo "🖼️  Starting Image backend in new terminal..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/backend' && ./start_image_backend.sh\""
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    gnome-terminal -- bash -c "cd '$SCRIPT_DIR/backend' && ./start_image_backend.sh; exec bash" 2>/dev/null || \
    xterm -e "cd '$SCRIPT_DIR/backend' && ./start_image_backend.sh; exec bash" 2>/dev/null || \
    konsole -e "cd '$SCRIPT_DIR/backend' && ./start_image_backend.sh; exec bash" 2>/dev/null || \
    echo "⚠️  Could not open new terminal. Please start backend manually: cd backend && ./start_image_backend.sh"
else
    echo "⚠️  Unsupported OS. Please start backend manually: cd backend && ./start_image_backend.sh"
fi

# Wait a moment for Image backend to start
echo "⏳ Waiting for Image backend to start..."
sleep 3

# Start frontend in current terminal
echo "🚀 Starting frontend..."
cd "$SCRIPT_DIR"
./start_frontend.sh
