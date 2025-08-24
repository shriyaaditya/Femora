#!/bin/bash

echo "🐷 Mora Chatbot Integration - Quick Start"
echo "=========================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "mora" ]; then
    echo "❌ Please run this script from the Femora project root directory."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Navigate to mora directory
cd mora

echo "📦 Installing Python dependencies..."
if pip3 install -r requirements.txt; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies. Please check the requirements.txt file."
    exit 1
fi

echo ""
echo "🔧 Setting up environment variables..."
echo "Please make sure you have the following in your .env file:"
echo "  GOOGLE_API_KEY=your-google-generative-ai-api-key"
echo "  GOOGLE_APPLICATION_CREDENTIALS=path/to/your/firebase-service-account.json"
echo ""

# Check if .env file exists and has the required variables
if [ -f "../.env" ]; then
    echo "✅ .env file found"
    if grep -q "GOOGLE_API_KEY" "../.env"; then
        echo "✅ GOOGLE_API_KEY found in .env"
    else
        echo "⚠️  GOOGLE_API_KEY not found in .env"
    fi
    
    if grep -q "GOOGLE_APPLICATION_CREDENTIALS" "../.env"; then
        echo "✅ GOOGLE_APPLICATION_CREDENTIALS found in .env"
    else
        echo "⚠️  GOOGLE_APPLICATION_CREDENTIALS not found in .env"
    fi
else
    echo "⚠️  .env file not found. Please create one with the required variables."
fi

echo ""
echo "🚀 Starting Mora backend server..."
echo "The server will run on http://localhost:5002"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python3 main.py
