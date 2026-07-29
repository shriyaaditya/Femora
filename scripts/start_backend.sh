#!/bin/bash

echo "🚀 Starting Femora Backend Server..."
echo "=================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend/main.py" ]; then
    echo "❌ backend/main.py not found. Make sure you're in the Femora project root directory."
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install requirements if needed
if [ ! -f "requirements.txt" ]; then
    echo "📋 Creating requirements.txt..."
    cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
pillow==10.1.0
numpy==1.24.3
cryptography==41.0.7
google-cloud-storage==2.10.0
google-cloud-firestore==2.13.1
requests==2.31.0
EOF
fi

echo "📥 Installing/updating dependencies..."
pip install -r requirements.txt

# Check if Google Cloud credentials exist
if [ ! -f "../femora-5d93e-firebase-adminsdk-fbsvc-0715bccab2.json" ]; then
    echo "⚠️ Warning: GCP credentials file not found!"
    echo "   Expected: femora-5d93e-firebase-adminsdk-fbsvc-0715bccab2.json"
    echo "   The backend will still start but GCP features won't work."
fi

# Check if encryption key exists
if [ ! -f "encryption_key.txt" ]; then
    echo "🔑 Generating encryption key..."
    python3 -c "
import base64
import os
key = os.urandom(32)
key_b64 = base64.b64encode(key).decode('utf-8')
with open('encryption_key.txt', 'w') as f:
    f.write(key_b64)
print(f'Generated encryption key: {key_b64[:20]}...')
"
fi

# Read encryption key
ENCRYPTION_KEY=$(cat encryption_key.txt)

# Update main.py with the encryption key
echo "🔧 Updating configuration with encryption key..."
sed -i.bak "s/your-base64-encryption-key-here/$ENCRYPTION_KEY/g" main.py

echo "🌐 Starting FastAPI server on http://${DEV_IMAGE_BACKEND_HOST:-localhost}:${DEV_IMAGE_BACKEND_PORT:-8000}"
echo "📱 Your React Native app can now connect to the backend!"
echo ""
echo "💡 To test the backend, run: python3 ../test_backend_status.py"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server
python3 main.py
