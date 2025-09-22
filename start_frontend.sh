#!/bin/bash

echo "🚀 Starting Femora Frontend..."
echo "================================"

# Navigate to the frontend directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the Expo server
echo "🔥 Starting Expo server..."
npm start
